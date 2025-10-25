// NanoCap Popup UI Controller
// Ultra-low filesize browser recording extension

console.log('NanoCap Popup initialized');

// DOM Elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const recordingStatus = document.getElementById('recording-status');
const recordingTimer = document.getElementById('recording-timer');
const qualitySelect = document.getElementById('quality-select');
const audioToggle = document.getElementById('audio-toggle');
const videoToggle = document.getElementById('video-toggle');
const ffmpegToggle = document.getElementById('ffmpeg-toggle');
const sizeEstimate = document.getElementById('size-estimate');
const compressionRatio = document.getElementById('compression-ratio');
const recentList = document.getElementById('recent-list');

// Recording state
let isRecording = false;
let recordingStartTime = null;
let timerInterval = null;

// Quality presets with file size estimates
const qualityPresets = {
  'ultra-low': {
    name: 'Ultra Düşük',
    videoBitsPerSecond: 500000, // 500 kbps
    audioBitsPerSecond: 32000,  // 32 kbps
    sizePerMinute: '1-2 MB',
    compression: 'VP9 + Opus (CRF 35)'
  },
  'low': {
    name: 'Düşük',
    videoBitsPerSecond: 1000000, // 1 Mbps
    audioBitsPerSecond: 64000,   // 64 kbps
    sizePerMinute: '2-4 MB',
    compression: 'VP9 + Opus (CRF 30)'
  },
  'balanced': {
    name: 'Dengeli',
    videoBitsPerSecond: 2000000, // 2 Mbps
    audioBitsPerSecond: 128000,  // 128 kbps
    sizePerMinute: '4-8 MB',
    compression: 'VP9 + Opus (CRF 25)'
  },
  'high': {
    name: 'Yüksek',
    videoBitsPerSecond: 4000000, // 4 Mbps
    audioBitsPerSecond: 192000,  // 192 kbps
    sizePerMinute: '8-15 MB',
    compression: 'VP9 + Opus (CRF 20)'
  }
};

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded');
  
  // Load saved settings
  loadSettings();
  
  // Update UI based on current state
  updateRecordingState();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update quality info
  updateQualityInfo();
});

// Setup event listeners
function setupEventListeners() {
  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  
  qualitySelect.addEventListener('change', updateQualityInfo);
  audioToggle.addEventListener('change', updateQualityInfo);
  videoToggle.addEventListener('change', updateQualityInfo);
  ffmpegToggle.addEventListener('change', updateQualityInfo);
  
  // Settings and help links
  document.getElementById('settings-link').addEventListener('click', openSettings);
  document.getElementById('help-link').addEventListener('click', openHelp);
}

// Start recording
async function startRecording() {
  try {
    console.log('Starting recording...');
    
    const settings = getRecordingSettings();
    
    // Send start command to service worker
    const response = await chrome.runtime.sendMessage({
      type: 'START_RECORDING',
      data: settings
    });
    
    if (response && response.success) {
      isRecording = true;
      recordingStartTime = Date.now();
      
      updateRecordingState();
      startTimer();
      
      console.log('Recording started successfully');
    } else {
      throw new Error('Failed to start recording');
    }
    
  } catch (error) {
    console.error('Error starting recording:', error);
    showError('Kayıt başlatılamadı: ' + error.message);
  }
}

// Stop recording
async function stopRecording() {
  try {
    console.log('Stopping recording...');
    
    // Send stop command to service worker
    await chrome.runtime.sendMessage({
      type: 'STOP_RECORDING'
    });
    
    isRecording = false;
    recordingStartTime = null;
    
    updateRecordingState();
    stopTimer();
    
    console.log('Recording stopped');
    
  } catch (error) {
    console.error('Error stopping recording:', error);
    showError('Kayıt durdurulamadı: ' + error.message);
  }
}

// Get current recording settings
function getRecordingSettings() {
  const quality = qualitySelect.value;
  const preset = qualityPresets[quality];
  
  return {
    quality: quality,
    audio: audioToggle.checked,
    video: videoToggle.checked,
    useFFmpeg: ffmpegToggle.checked,
    videoBitsPerSecond: preset.videoBitsPerSecond,
    audioBitsPerSecond: preset.audioBitsPerSecond,
    mimeType: 'video/webm;codecs=vp9,opus'
  };
}

// Update recording state UI
function updateRecordingState() {
  if (isRecording) {
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    recordingStatus.querySelector('.status-text').textContent = 'Kaydediyor';
    recordingStatus.querySelector('.status-dot').classList.add('recording');
  } else {
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    recordingStatus.querySelector('.status-text').textContent = 'Hazır';
    recordingStatus.querySelector('.status-dot').classList.remove('recording');
  }
}

// Start recording timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (recordingStartTime) {
      const elapsed = Date.now() - recordingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      recordingTimer.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      recordingTimer.classList.remove('hidden');
    }
  }, 1000);
}

// Stop recording timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  recordingTimer.classList.add('hidden');
}

// Update quality information
function updateQualityInfo() {
  const quality = qualitySelect.value;
  const preset = qualityPresets[quality];
  
  sizeEstimate.textContent = preset.sizePerMinute;
  compressionRatio.textContent = preset.compression;
  
  // Save settings
  saveSettings();
}

// Load saved settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'quality', 'audio', 'video', 'ffmpeg'
    ]);
    
    if (result.quality) qualitySelect.value = result.quality;
    if (result.audio !== undefined) audioToggle.checked = result.audio;
    if (result.video !== undefined) videoToggle.checked = result.video;
    if (result.ffmpeg !== undefined) ffmpegToggle.checked = result.ffmpeg;
    
    updateQualityInfo();
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Save settings
async function saveSettings() {
  try {
    await chrome.storage.sync.set({
      quality: qualitySelect.value,
      audio: audioToggle.checked,
      video: videoToggle.checked,
      ffmpeg: ffmpegToggle.checked
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Show error message
function showError(message) {
  // Simple error display - could be enhanced with toast notifications
  console.error('Error:', message);
  
  // Update status to show error
  recordingStatus.querySelector('.status-text').textContent = 'Hata';
  recordingStatus.querySelector('.status-dot').classList.add('error');
  
  // Reset after 3 seconds
  setTimeout(() => {
    recordingStatus.querySelector('.status-text').textContent = 'Hazır';
    recordingStatus.querySelector('.status-dot').classList.remove('error');
  }, 3000);
}

// Open settings page
function openSettings() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('settings.html')
  });
}

// Open help page
function openHelp() {
  chrome.tabs.create({
    url: 'https://github.com/lekesiz/NanoCap#readme'
  });
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Popup received message:', message.type);
  
  switch (message.type) {
    case 'RECORDING_STARTED':
      isRecording = true;
      recordingStartTime = Date.now();
      updateRecordingState();
      startTimer();
      break;
      
    case 'RECORDING_STOPPED':
      isRecording = false;
      recordingStartTime = null;
      updateRecordingState();
      stopTimer();
      break;
      
    case 'RECORDING_ERROR':
      showError(message.error);
      break;
      
    case 'DOWNLOAD_READY':
      // Handle download completion
      console.log('Download ready:', message.filename);
      break;
  }
});

console.log('NanoCap Popup ready');
