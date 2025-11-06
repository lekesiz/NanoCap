// NanoCap Service Worker - Manifest V3
// Ultra-low filesize browser recording extension

console.log('NanoCap Service Worker initialized');

// Service Worker lifecycle management
const recordingState = {
  isRecording: false,
  mediaRecorder: null,
  chunks: [],
  startTime: null,
  offscreenCreated: false,
};

// Performance monitoring (placeholder for v0.4.0)
// const performanceMetrics = {
//   startTime: null,
//   memoryUsage: 0,
//   cpuUsage: 0,
// };

// Message handling from popup and offscreen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('SW received message:', message.type);

  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(message.data)
        .then(() => {
          // Notify popup recording started
          chrome.runtime.sendMessage({
            type: 'RECORDING_STARTED',
          });
          sendResponse({ success: true });
        })
        .catch((error) => {
          // Notify popup of error
          chrome.runtime.sendMessage({
            type: 'RECORDING_ERROR',
            error: error.message || 'Failed to start recording',
          });
          sendResponse({ success: false, error: error.message });
        });
      break;
    case 'STOP_RECORDING':
      handleStopRecording();
      sendResponse({ success: true });
      break;
    case 'GET_RECORDING_STATE':
      sendResponse({ state: recordingState });
      break;
    case 'DOWNLOAD_RECORDING':
      handleDownloadRecording(message.data);
      sendResponse({ success: true });
      break;
    case 'REC_EXPORT':
      // Handle recording export from offscreen document
      handleRecordingExport(message);
      sendResponse({ success: true });
      break;
    case 'REC_ERROR':
      // Handle recording error from offscreen
      console.error('Recording error from offscreen:', message.error);
      chrome.runtime.sendMessage({
        type: 'RECORDING_ERROR',
        error: message.error,
      });
      break;
  }

  return true; // Keep message channel open for async response
});

// Start recording with optimized settings
async function handleStartRecording(data) {
  try {
    console.log('Starting recording with settings:', data);

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }

    console.log('Active tab:', tab.id);

    // Get streamId from tabCapture API
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id,
    });

    console.log('StreamId obtained:', streamId);

    // Create offscreen document for secure recording
    await createOffscreenDocument();

    // Send recording parameters to offscreen with streamId
    await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      streamId,
      options: {
        quality: data.quality || 'balanced',
        audio: data.audio !== false,
        video: data.video !== false,
        compression: data.compression || 'vp9',
        useFFmpeg: data.useFFmpeg || false,
        mirrorTabAudio: data.mirrorTabAudio !== false,
        vbps: data.videoBitsPerSecond || 900000,
        abps: data.audioBitsPerSecond || 96000,
        maxWidth: data.maxWidth || 1280,
        maxFps: data.maxFps || 15,
      },
    });

    recordingState.isRecording = true;
    recordingState.startTime = Date.now();

    console.log('Recording started successfully');
  } catch (error) {
    console.error('Failed to start recording:', error);
    recordingState.isRecording = false;
    throw error;
  }
}

// Stop recording and process chunks
async function handleStopRecording() {
  try {
    console.log('Stopping recording...');

    recordingState.isRecording = false;

    // Send stop signal to offscreen
    await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING_SIGNAL',
    });

    // Notify popup that recording stopped
    chrome.runtime.sendMessage({
      type: 'RECORDING_STOPPED',
    });

    console.log('Recording stopped');
  } catch (error) {
    console.error('Failed to stop recording:', error);

    // Notify popup of error
    chrome.runtime.sendMessage({
      type: 'RECORDING_ERROR',
      error: error.message || 'Failed to stop recording',
    });
  }
}

// Handle recording export from offscreen document
async function handleRecordingExport(message) {
  try {
    console.log('Handling recording export:', message.filename);

    // Convert data URL back to blob
    const response = await fetch(message.dataUrl);
    const blob = await response.blob();

    console.log('Blob converted from dataURL:', blob.size, 'bytes');

    // Get recording settings from popup (useFFmpeg, etc.)
    const settings = {
      useFFmpeg: false, // TODO: Get from recordingState
      crf: 35,
      codec: 'vp9',
    };

    // Process and download
    await handleDownloadRecording({ blob, settings });
  } catch (error) {
    console.error('Failed to handle recording export:', error);

    // Notify popup of error
    chrome.runtime.sendMessage({
      type: 'RECORDING_ERROR',
      error: error.message || 'Failed to export recording',
    });
  }
}

// Handle download with compression
async function handleDownloadRecording(data) {
  try {
    console.log('Processing recording for download:', data.blob.size, 'bytes');

    // Notify popup processing started
    chrome.runtime.sendMessage({
      type: 'PROCESSING_STARTED',
    });

    // Two-stage compression strategy
    const compressedBlob = await compressRecording(data.blob, data.settings);

    // Notify popup processing completed
    chrome.runtime.sendMessage({
      type: 'PROCESSING_COMPLETED',
    });

    // Create download URL
    const url = URL.createObjectURL(compressedBlob);
    const filename = `nanocap-recording-${Date.now()}.webm`;

    // Trigger download
    await chrome.downloads.download({
      url,
      filename,
      saveAs: true,
    });

    // Notify popup download ready
    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_READY',
      filename,
      size: compressedBlob.size,
    });

    console.log('Download initiated:', filename);
  } catch (error) {
    console.error('Failed to download recording:', error);

    // Notify popup of error
    chrome.runtime.sendMessage({
      type: 'RECORDING_ERROR',
      error: error.message || 'Failed to download recording',
    });
  }
}

// Create offscreen document for secure recording
async function createOffscreenDocument() {
  try {
    const path = 'offscreen.html';
    const offscreenUrl = chrome.runtime.getURL(path);

    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl],
    });

    if (existingContexts.length > 0) {
      console.log('Offscreen document already exists');
      recordingState.offscreenCreated = true;
      return;
    }

    // Create new offscreen document
    await chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification:
        'Recording browser content with MediaRecorder API for ultra-low filesize optimization',
    });

    recordingState.offscreenCreated = true;
    console.log('Offscreen document created successfully');
  } catch (error) {
    console.error('Failed to create offscreen document:', error);
    throw error;
  }
}

// Two-stage compression: Real-time + FFmpeg post-processing
async function compressRecording(blob, settings) {
  console.log('Starting compression pipeline...');

  // Stage 1: Real-time compression (already done by MediaRecorder)
  let compressedBlob = blob;

  // Stage 2: FFmpeg.wasm post-processing for ultra-low filesize
  if (settings.useFFmpeg !== false) {
    try {
      compressedBlob = await ffmpegCompress(compressedBlob, settings);
      console.log('FFmpeg compression completed');
    } catch (error) {
      console.warn('FFmpeg compression failed, using original:', error);
    }
  }

  return compressedBlob;
}

// FFmpeg.wasm compression via offscreen document
async function ffmpegCompress(blob, settings) {
  try {
    console.log('Requesting FFmpeg compression from offscreen document...');

    // Send compression request to offscreen document
    const response = await chrome.runtime.sendMessage({
      target: 'offscreen',
      type: 'COMPRESS_VIDEO',
      blob,
      settings: {
        crf: settings.crf || 35,
        codec: settings.codec || 'vp9',
        audioBitrate: settings.audioBitrate || '64k',
      },
    });

    if (response && response.success && response.blob) {
      console.log('FFmpeg compression successful');
      return response.blob;
    } else {
      console.warn('FFmpeg compression failed, using original blob');
      return blob;
    }
  } catch (error) {
    console.error('FFmpeg compression error:', error);
    // Return original blob if compression fails
    return blob;
  }
}

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('NanoCap Service Worker suspending...');

  if (recordingState.isRecording) {
    handleStopRecording();
  }

  // Clean up offscreen document
  if (recordingState.offscreenCreated) {
    chrome.offscreen.closeDocument().catch((error) => {
      console.log('Offscreen document already closed or error:', error);
    });
  }
});

console.log('NanoCap Service Worker ready');

// Export for testing (only in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    recordingState,
    createOffscreenDocument,
    compressRecording,
    handleDownloadRecording,
    handleStartRecording,
    handleStopRecording,
  };
}
