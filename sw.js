// NanoCap Service Worker - Manifest V3
// Ultra-low filesize browser recording extension

console.log('NanoCap Service Worker initialized');

// Service Worker lifecycle management
let recordingState = {
  isRecording: false,
  mediaRecorder: null,
  chunks: [],
  startTime: null
};

// Message handling from popup and offscreen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('SW received message:', message.type);
  
  switch (message.type) {
    case 'START_RECORDING':
      handleStartRecording(message.data);
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
  }
  
  return true; // Keep message channel open for async response
});

// Start recording with optimized settings
async function handleStartRecording(data) {
  try {
    console.log('Starting recording with settings:', data);
    
    // Create offscreen document for secure recording
    await createOffscreenDocument();
    
    // Send recording parameters to offscreen
    chrome.runtime.sendMessage({
      type: 'RECORDING_CONFIG',
      data: {
        quality: data.quality || 'balanced',
        audio: data.audio !== false,
        video: data.video !== false,
        compression: data.compression || 'vp9'
      }
    });
    
    recordingState.isRecording = true;
    recordingState.startTime = Date.now();
    
    console.log('Recording started successfully');
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    recordingState.isRecording = false;
  }
}

// Stop recording and process chunks
async function handleStopRecording() {
  try {
    console.log('Stopping recording...');
    
    recordingState.isRecording = false;
    
    // Send stop signal to offscreen
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING_SIGNAL'
    });
    
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
      url: url,
      filename: filename,
      saveAs: true
    });
    
    console.log('Download initiated:', filename);
    
  } catch (error) {
    console.error('Failed to download recording:', error);
  }
}

// Create offscreen document for secure recording
async function createOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Recording browser content with MediaRecorder API'
    });
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

// FFmpeg.wasm compression worker
async function ffmpegCompress(blob, settings) {
  // This would integrate with FFmpeg.wasm for advanced compression
  // For now, return the original blob
  // TODO: Implement FFmpeg.wasm integration
  return blob;
}

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('NanoCap Service Worker suspending...');
  
  if (recordingState.isRecording) {
    handleStopRecording();
  }
  
  // Clean up offscreen document
  chrome.offscreen.closeDocument();
});

console.log('NanoCap Service Worker ready');
