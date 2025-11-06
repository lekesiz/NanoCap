# NanoCap Download Troubleshooting Guide

## Issue: Recording stops but no file downloads

### Quick Checks

1. **Open Chrome Developer Console**
   - Right-click the extension icon → "Manage Extension"
   - Click on "Service Worker" link
   - Check the console for errors

2. **Look for these success messages:**
   ```
   ✅ "Recording stopped, processing chunks..."
   ✅ "Total chunks collected: [number]"
   ✅ "Final blob size: [size] bytes"
   ✅ "Data URL created successfully"
   ✅ "Export request sent: nanocap_[timestamp].webm"
   ✅ "Handling recording export"
   ✅ "Download started with ID: [number]"
   ```

3. **Common Error Messages and Solutions:**

   **Error: "No recording chunks collected"**
   - Recording was too short (less than 1 second)
   - Try recording for at least 3-5 seconds

   **Error: "Failed to convert blob to data URL"**
   - Recording is too large (>50MB)
   - Try shorter recordings or lower quality settings

   **Error: "Download failed: User cancelled"**
   - You cancelled the save dialog
   - Click "Save" when prompted

   **Error: "Download failed: FILE_TOO_LARGE"**
   - Recording file is too large
   - Use lower quality settings

### Debugging Steps

1. **Check Recording Size**
   - Look for "Blob size in MB: X MB" in console
   - If >50MB, the data URL conversion might fail
   
2. **Verify Chunks are Collected**
   - Look for "Chunk received: X bytes" messages during recording
   - Should see one every second

3. **Check Chrome Downloads**
   - Open chrome://downloads/
   - Look for failed downloads
   - Check if download was blocked

### Solutions Applied

We've implemented several fixes:

1. **Enhanced Logging** - More detailed console messages to track the flow
2. **Delayed Cleanup** - Offscreen document stays open longer to complete export
3. **Error Notifications** - You'll see a notification if download fails
4. **Better Error Handling** - Catches and reports conversion failures

### If Downloads Still Fail

1. **Try a Test Recording**
   ```
   - Record for exactly 5 seconds
   - Use "Ultra Low" quality setting
   - Check console for the full log sequence
   ```

2. **Check Chrome Settings**
   - Go to chrome://settings/downloads
   - Ensure "Ask where to save each file" is ON
   - Check download location has space

3. **Extension Permissions**
   - Ensure extension has "downloads" permission
   - Try reinstalling the extension

### Report Format

If issue persists, please provide:
1. Chrome version (chrome://version)
2. Console logs from failed recording
3. Recording duration and quality settings
4. File size shown in console ("Blob size in MB:")

### Alternative Download Method

If data URL conversion continues to fail for large files, we can implement:
- Direct blob download using File System Access API
- Chunked download for very large recordings
- Progressive download during recording

Would you like us to implement an alternative download method?