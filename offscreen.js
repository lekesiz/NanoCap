// NanoCap Offscreen Document
// Ultra-low filesize browser recording extension

console.log('NanoCap Offscreen Document initialized');

// Recording state
let recorder = null;
let chunks = [];
let mimeChosen = 'video/webm';
let stream = null;
let audioContext = null;

// MIME type selection with fallback
function pickMimeType() {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', // H.264 Baseline + AAC LC (Chromium 126+)
    'video/mp4',                                 // General MP4
    'video/webm;codecs=vp9,opus',               // VP9 + Opus
    'video/webm;codecs=vp8,opus',               // VP8 + Opus (fallback)
    'video/webm'                                 // General WebM
  ];
  
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('Selected MIME type:', type);
      return type;
    }
  }
  
  console.warn('No supported MIME type found, using default WebM');
  return 'video/webm';
}

// Start recording with optimized settings
async function startRecording({ streamId, options }) {
  try {
    console.log('Starting recording with options:', options);
    
    // Acquire tab stream in offscreen context
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
          maxWidth: options.maxWidth || 1280,
          maxFrameRate: options.maxFps || 15
        }
      }
    });

    console.log('Stream acquired:', stream);

    // Mirror tab audio so user continues to hear it while recording (optional)
    if (options.mirrorTabAudio) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(audioContext.destination);
        console.log('Audio mirroring enabled');
      } catch (error) {
        console.warn('Audio mirroring failed:', error);
      }
    }

    // Select optimal MIME type
    mimeChosen = pickMimeType();
    chunks = [];

    // Configure MediaRecorder with aggressive bitrates for small file size
    recorder = new MediaRecorder(stream, {
      mimeType: mimeChosen,
      videoBitsPerSecond: options.vbps || 900000,  // Default ~900 kbps video
      audioBitsPerSecond: options.abps || 96000   // Default 96 kbps audio
    });

    // Handle data chunks
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
        console.log('Chunk received:', event.data.size, 'bytes');
      }
    };

    // Handle recording stop
    recorder.onstop = async () => {
      console.log('Recording stopped, processing chunks...');
      
      try {
        const blob = new Blob(chunks, { type: mimeChosen });
        console.log('Final blob size:', blob.size, 'bytes');
        
        // Convert blob to data URL for download
        const dataUrl = await blobToDataURL(blob);
        
        // Determine file extension based on MIME type
        const ext = mimeChosen.startsWith('video/mp4') ? 'mp4' : 'webm';
        const filename = `nanocap_${Date.now()}.${ext}`;
        
        // Send to service worker for download
        chrome.runtime.sendMessage({
          type: 'REC_EXPORT',
          dataUrl: dataUrl,
          filename: filename
        });
        
        console.log('Export request sent:', filename);
        
      } catch (error) {
        console.error('Error processing recording:', error);
        
        // Notify service worker of error
        chrome.runtime.sendMessage({
          type: 'REC_ERROR',
          error: error.message
        });
      }
      
      cleanup();
    };

    // Handle recording errors
    recorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      
      chrome.runtime.sendMessage({
        type: 'REC_ERROR',
        error: event.error.message || 'Unknown recording error'
      });
    };

    // Start recording with 1-second chunks
    recorder.start(1000);
    console.log('Recording started successfully');

  } catch (error) {
    console.error('Failed to start recording:', error);
    
    chrome.runtime.sendMessage({
      type: 'REC_ERROR',
      error: error.message || 'Failed to start recording'
    });
  }
}

// Stop recording
function stopRecording() {
  try {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      console.log('Stop recording requested');
    } else {
      console.warn('No active recording to stop');
    }
  } catch (error) {
    console.error('Error stopping recording:', error);
  }
}

// Cleanup resources
function cleanup() {
  console.log('Cleaning up resources...');
  
  recorder = null;
  chunks = [];
  
  if (stream) {
    try {
      stream.getTracks().forEach(track => track.stop());
      console.log('Stream tracks stopped');
    } catch (error) {
      console.warn('Error stopping stream tracks:', error);
    }
    stream = null;
  }
  
  if (audioContext) {
    try {
      audioContext.close();
      console.log('Audio context closed');
    } catch (error) {
      console.warn('Error closing audio context:', error);
    }
    audioContext = null;
  }
}

// Convert blob to data URL
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Message handling from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message.type);
  
  if (message.target !== 'offscreen') {
    return false;
  }
  
  switch (message.type) {
    case 'REC_START':
      startRecording(message.payload);
      sendResponse({ success: true });
      break;
      
    case 'REC_STOP':
      stopRecording();
      sendResponse({ success: true });
      break;
      
    case 'REC_STATUS':
      sendResponse({
        isRecording: recorder && recorder.state === 'recording',
        chunksCount: chunks.length,
        mimeType: mimeChosen
      });
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  console.log('Offscreen document unloading, cleaning up...');
  cleanup();
});

console.log('NanoCap Offscreen Document ready');
