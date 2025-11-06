// NanoCap Settings Page

// DOM Elements
const defaultQuality = document.getElementById('default-quality');
const defaultAudio = document.getElementById('default-audio');
const defaultVideo = document.getElementById('default-video');
const defaultMirror = document.getElementById('default-mirror');
const language = document.getElementById('language');
const autoDownload = document.getElementById('auto-download');
const keepHistory = document.getElementById('keep-history');
const clearHistoryBtn = document.getElementById('clear-history');
const saveBtn = document.getElementById('save-settings');
const backBtn = document.getElementById('back-btn');

// Load current settings
async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get({
      defaultQuality: 'balanced',
      defaultAudio: true,
      defaultVideo: true,
      defaultMirror: true,
      language: 'en',
      autoDownload: true,
      keepHistory: true,
    });

    defaultQuality.value = settings.defaultQuality;
    defaultAudio.checked = settings.defaultAudio;
    defaultVideo.checked = settings.defaultVideo;
    defaultMirror.checked = settings.defaultMirror;
    language.value = settings.language;
    autoDownload.checked = settings.autoDownload;
    keepHistory.checked = settings.keepHistory;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save settings
async function saveSettings() {
  try {
    const settings = {
      defaultQuality: defaultQuality.value,
      defaultAudio: defaultAudio.checked,
      defaultVideo: defaultVideo.checked,
      defaultMirror: defaultMirror.checked,
      language: language.value,
      autoDownload: autoDownload.checked,
      keepHistory: keepHistory.checked,
    };

    await chrome.storage.local.set(settings);

    // Show success message
    saveBtn.textContent = 'Settings Saved!';
    saveBtn.style.background = '#10b981';

    setTimeout(() => {
      saveBtn.textContent = 'Save Settings';
      saveBtn.style.background = '';
    }, 2000);

    // Update extension language
    if (settings.language !== chrome.i18n.getUILanguage()) {
      // Note: Actual language change requires extension reload
      console.log('Language changed to:', settings.language);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    saveBtn.textContent = 'Error saving settings';
    saveBtn.style.background = '#ef4444';
  }
}

// Clear recording history
async function clearHistory() {
  if (confirm('Are you sure you want to clear all recording history?')) {
    try {
      await chrome.storage.local.remove(['recordings']);
      alert('Recording history cleared!');
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Failed to clear history');
    }
  }
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
clearHistoryBtn.addEventListener('click', clearHistory);
backBtn.addEventListener('click', () => {
  window.close();
});

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);
