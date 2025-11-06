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
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      break;
    case 'STOP_RECORDING':
      handleStopRecording();
      break;
    case 'GET_RECORDING_STATE':
      sendResponse({ state: recordingState });
      break;
    case 'DOWNLOAD_RECORDING':
      handleDownloadRecording(message.data);
      break;
    case 'REC_EXPORT':
      // Handle recording export from offscreen document
      handleRecordingExport(message);
      break;
    case 'REC_ERROR':
      // Handle recording error
      console.error('Recording error:', message.error);
      recordingState.isRecording = false;
      break;
  }

  return true; // Keep message channel open for async response
});

// Start recording with optimized settings
async function handleStartRecording(data) {
  try {
    console.log('Starting recording with settings:', data);

    // First, ensure any existing recording is stopped
    if (recordingState.isRecording || recordingState.offscreenCreated) {
      console.log('Cleaning up existing recording session...');
      await handleStopRecording();
      // Wait a bit for cleanup
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Get active tab for recording
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Active tab:', tab);

    // Get stream ID for tab capture
    let streamId;
    try {
      streamId = await chrome.tabCapture.getMediaStreamId({
        targetTabId: tab.id,
      });
      console.log('Stream ID obtained:', streamId);
    } catch (error) {
      if (error.message.includes('active stream')) {
        // Force close any existing captures
        console.log('Force closing existing captures...');
        try {
          await chrome.offscreen.closeDocument();
        } catch (e) {
          // Offscreen document may not exist
        }

        // Try again after a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        streamId = await chrome.tabCapture.getMediaStreamId({
          targetTabId: tab.id,
        });
      } else {
        throw error;
      }
    }

    // Create offscreen document for secure recording
    await createOffscreenDocument();

    // Send recording parameters to offscreen with streamId
    chrome.runtime.sendMessage({
      type: 'START_RECORDING_OFFSCREEN',
      data: {
        streamId,
        options: {
          quality: data.quality || 'balanced',
          audio: data.audio !== false,
          video: data.video !== false,
          mirrorTabAudio: data.mirrorTabAudio || false,
          vbps: data.videoBitsPerSecond,
          abps: data.audioBitsPerSecond,
          maxWidth: data.maxWidth,
          maxFps: data.maxFps,
        },
      },
    });

    recordingState.isRecording = true; // eslint-disable-line require-atomic-updates
    recordingState.startTime = Date.now(); // eslint-disable-line require-atomic-updates

    console.log('Recording started successfully');
  } catch (error) {
    console.error('Failed to start recording:', error);
    recordingState.isRecording = false; // eslint-disable-line require-atomic-updates

    // Clean up on error
    if (recordingState.offscreenCreated) {
      try {
        await chrome.offscreen.closeDocument();
        recordingState.offscreenCreated = false; // eslint-disable-line require-atomic-updates
      } catch (e) {
        // Offscreen document may not exist
      }
    }

    throw error;
  }
}

// Stop recording and process chunks
async function handleStopRecording() {
  try {
    console.log('Stopping recording...');

    recordingState.isRecording = false;

    // Send stop signal to offscreen
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING_SIGNAL',
    });

    // Close offscreen document to release stream
    if (recordingState.offscreenCreated) {
      try {
        await chrome.offscreen.closeDocument();
        recordingState.offscreenCreated = false; // eslint-disable-line require-atomic-updates
        console.log('Offscreen document closed');
      } catch (error) {
        console.log('Offscreen document already closed or error:', error);
      }
    }

    console.log('Recording stopped');
  } catch (error) {
    console.error('Failed to stop recording:', error);
  }
}

// Handle download with compression
async function handleDownloadRecording(data) {
  try {
    console.log('Processing recording for download:', data.blob.size, 'bytes');

    // Two-stage compression strategy
    const compressedBlob = await compressRecording(data.blob, data.settings);

    // Create download URL
    const url = URL.createObjectURL(compressedBlob);
    const filename = `nanocap-recording-${Date.now()}.webm`;

    // Trigger download
    chrome.downloads.download({
      url,
      filename,
      saveAs: true,
    });

    console.log('Download initiated:', filename);
  } catch (error) {
    console.error('Failed to download recording:', error);
  }
}

// Handle recording export from offscreen document
async function handleRecordingExport(message) {
  try {
    console.log('Handling recording export:', message.filename);

    // Convert data URL to blob
    const response = await fetch(message.dataUrl);
    const blob = await response.blob();

    console.log('Blob size:', blob.size, 'bytes');

    // Create download URL
    const url = URL.createObjectURL(blob);

    // Trigger download
    chrome.downloads.download(
      {
        url,
        filename: message.filename,
        saveAs: true,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Download failed:', chrome.runtime.lastError);
        } else {
          console.log('Download started with ID:', downloadId);

          // Store recording info
          chrome.storage.local.get(['recordings'], (result) => {
            const recordings = result.recordings || [];
            recordings.unshift({
              id: downloadId,
              filename: message.filename,
              size: blob.size,
              date: Date.now(),
            });

            // Keep only last 10 recordings
            if (recordings.length > 10) {
              recordings.pop();
            }

            chrome.storage.local.set({ recordings });
          });
        }
      }
    );

    // Clean up blob URL after download starts
    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log('Blob URL revoked:', url);
    }, 5000); // 5 seconds should be enough for download to start
  } catch (error) {
    console.error('Failed to export recording:', error);
  }
}

// Create offscreen document for secure recording
async function createOffscreenDocument() {
  try {
    const path = 'offscreen.html';
    const offscreenUrl = chrome.runtime.getURL(path);

    // Check if offscreen document already exists (Chrome 116+)
    if (chrome.runtime.getContexts) {
      try {
        const existingContexts = await chrome.runtime.getContexts({
          contextTypes: ['OFFSCREEN_DOCUMENT'],
          documentUrls: [offscreenUrl],
        });

        if (existingContexts.length > 0) {
          console.log('Offscreen document already exists');
          recordingState.offscreenCreated = true;
          return;
        }
      } catch (error) {
        console.log('getContexts API not available or error:', error);
      }
    }

    // Try to close any existing offscreen document first
    try {
      await chrome.offscreen.closeDocument();
      console.log('Closed existing offscreen document');
    } catch (error) {
      // Document doesn't exist, which is fine
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
