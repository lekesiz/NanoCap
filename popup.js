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
const mirrorToggle = document.getElementById('mirror-toggle');
const sizeEstimate = document.getElementById('size-estimate');
const compressionRatio = document.getElementById('compression-ratio');
const cpuEstimate = document.getElementById('cpu-estimate');
const recentList = document.getElementById('recent-list');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Recording state
let isRecording = false;
let recordingStartTime = null;

// Advanced features integration
let advancedFFmpegProcessor = null;
let av1CodecProcessor = null;
let advancedAudioProcessor = null;
let audioLevelInterval = null;
let timerInterval = null;

// Quality presets with file size estimates
const qualityPresets = {
  'ultra-low': {
    name: 'Ultra Düşük',
    videoBitsPerSecond: 500000, // 500 kbps
    audioBitsPerSecond: 32000,  // 32 kbps
    sizePerMinute: '1-2 MB',
    compression: 'VP9 + Opus (CRF 35)',
    cpuUsage: '~5-8%',
    maxWidth: 1280,
    maxFps: 15
  },
  'low': {
    name: 'Düşük',
    videoBitsPerSecond: 1000000, // 1 Mbps
    audioBitsPerSecond: 64000,   // 64 kbps
    sizePerMinute: '2-4 MB',
    compression: 'VP9 + Opus (CRF 30)',
    cpuUsage: '~8-12%',
    maxWidth: 1280,
    maxFps: 20
  },
  'balanced': {
    name: 'Dengeli',
    videoBitsPerSecond: 2000000, // 2 Mbps
    audioBitsPerSecond: 128000,  // 128 kbps
    sizePerMinute: '4-8 MB',
    compression: 'VP9 + Opus (CRF 25)',
    cpuUsage: '~10-15%',
    maxWidth: 1280,
    maxFps: 24
  },
  'high': {
    name: 'Yüksek',
    videoBitsPerSecond: 4000000, // 4 Mbps
    audioBitsPerSecond: 192000,  // 192 kbps
    sizePerMinute: '8-15 MB',
    compression: 'VP9 + Opus (CRF 20)',
    cpuUsage: '~15-25%',
    maxWidth: 1920,
    maxFps: 30
  }
};

// Initialize advanced features
async function initializeAdvancedFeatures() {
  console.log('Initializing advanced features...');
  // This function can be expanded later to initialize advanced processors
}

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup DOM loaded');
  
  // Initialize advanced features
  await initializeAdvancedFeatures();
  
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
  mirrorToggle.addEventListener('change', updateQualityInfo);
  
  // Advanced features event listeners
  const micMixToggle = document.getElementById('mic-mix-toggle');
  const micVolume = document.getElementById('mic-volume');
  const tabVolume = document.getElementById('tab-volume');
  const noiseReductionToggle = document.getElementById('noise-reduction-toggle');
  
  if (micMixToggle) {
    micMixToggle.addEventListener('change', handleMicMixToggle);
  }
  
  if (micVolume) {
    micVolume.addEventListener('input', handleMicVolumeChange);
  }
  
  if (tabVolume) {
    tabVolume.addEventListener('input', handleTabVolumeChange);
  }
  
  if (noiseReductionToggle) {
    noiseReductionToggle.addEventListener('change', handleNoiseReductionToggle);
  }
  
  // Settings and help links
  document.getElementById('settings-link').addEventListener('click', openSettings);
  document.getElementById('help-link').addEventListener('click', openHelp);
  document.getElementById('github-link').addEventListener('click', openGitHub);
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
    mirrorTabAudio: mirrorToggle.checked,
    videoBitsPerSecond: preset.videoBitsPerSecond,
    audioBitsPerSecond: preset.audioBitsPerSecond,
    maxWidth: preset.maxWidth,
    maxFps: preset.maxFps,
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
  cpuEstimate.textContent = preset.cpuUsage;
  
  // Save settings
  saveSettings();
}

// Load saved settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get([
      'quality', 'audio', 'video', 'ffmpeg', 'mirror'
    ]);
    
    if (result.quality) qualitySelect.value = result.quality;
    if (result.audio !== undefined) audioToggle.checked = result.audio;
    if (result.video !== undefined) videoToggle.checked = result.video;
    if (result.ffmpeg !== undefined) ffmpegToggle.checked = result.ffmpeg;
    if (result.mirror !== undefined) mirrorToggle.checked = result.mirror;
    
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
      ffmpeg: ffmpegToggle.checked,
      mirror: mirrorToggle.checked
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Show error message with enhanced UI
function showError(message) {
  console.error('Error:', message);
  
  // Update status to show error
  recordingStatus.querySelector('.status-text').textContent = 'Hata';
  recordingStatus.querySelector('.status-dot').classList.add('error');
  
  // Show error in progress text
  progressText.textContent = `Hata: ${message}`;
  progressContainer.classList.remove('hidden');
  
  // Reset after 5 seconds
  setTimeout(() => {
    recordingStatus.querySelector('.status-text').textContent = 'Hazır';
    recordingStatus.querySelector('.status-dot').classList.remove('error');
    progressContainer.classList.add('hidden');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  console.log('Success:', message);
  
  recordingStatus.querySelector('.status-text').textContent = 'Başarılı';
  recordingStatus.querySelector('.status-dot').classList.add('success');
  
  setTimeout(() => {
    recordingStatus.querySelector('.status-text').textContent = 'Hazır';
    recordingStatus.querySelector('.status-dot').classList.remove('success');
  }, 3000);
}

// Show progress
function showProgress(percentage, text) {
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = text;
  progressContainer.classList.remove('hidden');
}

// Hide progress
function hideProgress() {
  progressContainer.classList.add('hidden');
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

// Open GitHub repository
function openGitHub() {
  chrome.tabs.create({
    url: 'https://github.com/lekesiz/NanoCap'
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
      showSuccess('Kayıt başlatıldı');
      break;
      
    case 'RECORDING_STOPPED':
      isRecording = false;
      recordingStartTime = null;
      updateRecordingState();
      stopTimer();
      showSuccess('Kayıt durduruldu');
      break;
      
    case 'RECORDING_ERROR':
      showError(message.error);
      break;
      
    case 'DOWNLOAD_READY':
      console.log('Download ready:', message.filename);
      showSuccess('Dosya indirildi');
      hideProgress();
      break;
      
    case 'PROCESSING_STARTED':
      showProgress(0, 'İşleniyor...');
      break;
      
    case 'PROCESSING_PROGRESS':
      showProgress(message.percentage, message.text);
      break;
      
    case 'PROCESSING_COMPLETED':
      hideProgress();
      showSuccess('İşlem tamamlandı');
      break;
  }
});

// Advanced features handlers
function handleMicMixToggle(event) {
  console.log('Mic mix toggled:', event.target.checked);
  const micControls = document.getElementById('mic-controls');
  if (micControls) {
    micControls.style.display = event.target.checked ? 'block' : 'none';
  }
}

function handleMicVolumeChange(event) {
  console.log('Mic volume changed:', event.target.value);
}

function handleTabVolumeChange(event) {
  console.log('Tab volume changed:', event.target.value);
}

function handleNoiseReductionToggle(event) {
  console.log('Noise reduction toggled:', event.target.checked);
}

console.log('NanoCap Popup ready');
