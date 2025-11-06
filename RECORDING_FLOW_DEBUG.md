# NanoCap Recording Flow Debug Report

## Issue Summary
The user reports that recording stops but no file is downloaded. This document traces the recording flow to identify potential issues.

## Recording Flow Analysis

### 1. Recording Start Flow ✅
- User clicks start button in `popup.js`
- Message sent to service worker: `START_RECORDING`
- Service worker creates offscreen document
- Offscreen document starts MediaRecorder
- Chunks are collected in `offscreen.js`

### 2. Recording Stop Flow ⚠️
- User clicks stop button in `popup.js`
- Message sent to service worker: `STOP_RECORDING`
- Service worker sends `STOP_RECORDING_SIGNAL` to offscreen
- MediaRecorder stops and triggers `onstop` event

### 3. Export Flow (POTENTIAL ISSUES HERE) 🔴

#### In offscreen.js (lines 90-141):
```javascript
recorder.onstop = async () => {
  console.log('Recording stopped, processing chunks...');
  console.log('Total chunks collected:', chunks.length);
  
  // ✅ Good: Checks if chunks exist
  if (chunks.length === 0) {
    throw new Error('No recording chunks collected');
  }
  
  // ✅ Good: Creates blob from chunks
  const blob = new Blob(chunks, { type: mimeChosen });
  console.log('Final blob size:', blob.size, 'bytes');
  
  // ✅ Good: Checks blob size
  if (blob.size === 0) {
    throw new Error('Recording blob is empty after processing');
  }
  
  // ⚠️ POTENTIAL ISSUE: Data URL conversion might fail for large files
  const dataUrl = await blobToDataURL(blob);
  
  // ✅ Good: Sends REC_EXPORT message
  chrome.runtime.sendMessage({
    type: 'REC_EXPORT',
    dataUrl,
    filename,
  });
};
```

#### In sw.js (lines 229-306):
```javascript
async function handleRecordingExport(message) {
  // ✅ Good: Validates data URL
  if (!message.dataUrl || !message.dataUrl.startsWith('data:')) {
    throw new Error('Invalid data URL format');
  }
  
  // ⚠️ POTENTIAL ISSUE: fetch() might fail for very large data URLs
  const response = await fetch(message.dataUrl);
  const blob = await response.blob();
  
  // ✅ Good: Creates blob URL
  const blobUrl = URL.createObjectURL(blob);
  
  // 🔴 CRITICAL: Download API call
  chrome.downloads.download({
    url: blobUrl,
    filename: message.filename,
    saveAs: true,
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download failed:', chrome.runtime.lastError);
    }
  });
}
```

## Identified Issues

### 1. Data URL Size Limitation 🔴
**Problem**: Data URLs have size limitations (typically ~256MB in Chrome). For longer recordings, the conversion might fail silently.

**Evidence**: 
- No error handling around `blobToDataURL()` conversion
- Large recordings might exceed data URL limits

**Solution**: Use blob URLs directly instead of converting to data URLs.

### 2. Missing Error Propagation ⚠️
**Problem**: Errors in the export flow are logged but not shown to the user.

**Evidence**:
- Errors are caught in offscreen.js but only logged to console
- User has no visibility into export failures

### 3. Cleanup Timing Issue ⚠️
**Problem**: The offscreen document is closed immediately after stop, potentially before export completes.

**Evidence**: 
- In `handleStopRecording()`, offscreen document is closed right away
- Export message might not be processed if document closes too quickly

## Recommended Fixes

### Fix 1: Use Blob URLs Instead of Data URLs
```javascript
// In offscreen.js, replace data URL conversion with:
recorder.onstop = async () => {
  // ... existing validation ...
  
  // Send blob directly using transferable
  chrome.runtime.sendMessage({
    type: 'REC_EXPORT',
    blob: blob, // Send blob directly
    filename: filename,
    mimeType: mimeChosen
  });
};
```

### Fix 2: Delay Offscreen Cleanup
```javascript
// In sw.js handleStopRecording():
async function handleStopRecording() {
  // ... existing code ...
  
  // Don't close offscreen immediately
  // Let it close after export is complete
  setTimeout(() => {
    if (recordingState.offscreenCreated) {
      chrome.offscreen.closeDocument();
      recordingState.offscreenCreated = false;
    }
  }, 5000); // Wait 5 seconds
}
```

### Fix 3: Add User Notifications
```javascript
// In sw.js handleRecordingExport():
chrome.downloads.download({...}, (downloadId) => {
  if (chrome.runtime.lastError) {
    // Notify user via badge or notification
    chrome.action.setBadgeText({ text: '!' });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon-48.png',
      title: 'Download Failed',
      message: chrome.runtime.lastError.message
    });
  } else {
    // Success notification
    chrome.action.setBadgeText({ text: '✓' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  }
});
```

## Testing Steps

1. Open Chrome DevTools and go to the Extensions page
2. Click "Service Worker" link to open service worker console
3. Start a recording
4. Watch for these log messages:
   - "Chunk received: X bytes" (should appear every second)
   - "Recording stopped, processing chunks..."
   - "Total chunks collected: X"
   - "Final blob size: X bytes"
   - "Export request sent: filename"
   - "Handling recording export: filename"
   - "Download started with ID: X"

5. If download fails, check for:
   - "Download failed:" error in service worker console
   - Data URL size (logged in "Data URL preview:")
   - Any uncaught errors in offscreen document console

## Quick Fix to Test

To quickly test if the issue is data URL related, modify the check in `handleRecordingExport`:

```javascript
// In sw.js, line ~244
if (!message.dataUrl || !message.dataUrl.startsWith('data:')) {
  console.error('Data URL issue:', {
    hasDataUrl: !!message.dataUrl,
    dataUrlLength: message.dataUrl ? message.dataUrl.length : 0,
    startsWithData: message.dataUrl ? message.dataUrl.startsWith('data:') : false
  });
  throw new Error('Invalid data URL format');
}
```

This will help identify if the data URL is being created properly.