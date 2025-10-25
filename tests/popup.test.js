// Tests for popup.js functionality

describe('NanoCap Popup Tests', () => {
  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="start-btn"></div>
      <div id="stop-btn" class="hidden"></div>
      <div id="recording-status">
        <span class="status-dot"></span>
        <span class="status-text">Hazır</span>
      </div>
      <div id="recording-timer" class="hidden">00:00</div>
      <select id="quality-select">
        <option value="balanced" selected>Dengeli</option>
      </select>
      <input type="checkbox" id="audio-toggle" checked>
      <input type="checkbox" id="video-toggle" checked>
      <input type="checkbox" id="ffmpeg-toggle">
      <input type="checkbox" id="mirror-toggle" checked>
      <span id="size-estimate"></span>
      <span id="compression-ratio"></span>
      <span id="cpu-estimate"></span>
      <div id="progress-container" class="hidden"></div>
      <div id="progress-fill"></div>
      <div id="progress-text"></div>
    `;
    
    // Mock chrome API
    global.chrome = {
      runtime: {
        sendMessage: jest.fn(),
        onMessage: { addListener: jest.fn() },
        getURL: jest.fn(url => url)
      },
      storage: {
        sync: {
          get: jest.fn(() => Promise.resolve({})),
          set: jest.fn(() => Promise.resolve())
        }
      },
      tabs: {
        create: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Quality Presets', () => {
    test('should have all required quality presets', () => {
      const { qualityPresets } = require('../popup.js');
      
      expect(qualityPresets).toHaveProperty('ultra-low');
      expect(qualityPresets).toHaveProperty('low');
      expect(qualityPresets).toHaveProperty('balanced');
      expect(qualityPresets).toHaveProperty('high');
      
      // Check each preset has required properties
      Object.values(qualityPresets).forEach(preset => {
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('videoBitsPerSecond');
        expect(preset).toHaveProperty('audioBitsPerSecond');
        expect(preset).toHaveProperty('sizePerMinute');
        expect(preset).toHaveProperty('compression');
        expect(preset).toHaveProperty('cpuUsage');
        expect(preset).toHaveProperty('maxWidth');
        expect(preset).toHaveProperty('maxFps');
      });
    });
  });

  describe('Recording Settings', () => {
    test('should get correct recording settings', () => {
      const { getRecordingSettings } = require('../popup.js');
      const settings = getRecordingSettings();
      
      expect(settings).toHaveProperty('quality', 'balanced');
      expect(settings).toHaveProperty('audio', true);
      expect(settings).toHaveProperty('video', true);
      expect(settings).toHaveProperty('useFFmpeg', false);
      expect(settings).toHaveProperty('mirrorTabAudio', true);
      expect(settings).toHaveProperty('mimeType', 'video/webm;codecs=vp9,opus');
    });
  });

  describe('UI State Management', () => {
    test('should update UI when recording starts', () => {
      const { updateRecordingState } = require('../popup.js');
      
      // Set recording state
      global.isRecording = true;
      updateRecordingState();
      
      const startBtn = document.getElementById('start-btn');
      const stopBtn = document.getElementById('stop-btn');
      const statusDot = document.querySelector('.status-dot');
      
      expect(startBtn.classList.contains('hidden')).toBe(true);
      expect(stopBtn.classList.contains('hidden')).toBe(false);
      expect(statusDot.classList.contains('recording')).toBe(true);
    });
    
    test('should update UI when recording stops', () => {
      const { updateRecordingState } = require('../popup.js');
      
      // Set recording state
      global.isRecording = false;
      updateRecordingState();
      
      const startBtn = document.getElementById('start-btn');
      const stopBtn = document.getElementById('stop-btn');
      const statusDot = document.querySelector('.status-dot');
      
      expect(startBtn.classList.contains('hidden')).toBe(false);
      expect(stopBtn.classList.contains('hidden')).toBe(true);
      expect(statusDot.classList.contains('recording')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should show error message', () => {
      const { showError } = require('../popup.js');
      
      showError('Test error message');
      
      const statusText = document.querySelector('.status-text');
      const progressText = document.getElementById('progress-text');
      
      expect(statusText.textContent).toBe('Hata');
      expect(progressText.textContent).toBe('Hata: Test error message');
    });
  });

  describe('Chrome API Integration', () => {
    test('should send START_RECORDING message', async () => {
      const { startRecording } = require('../popup.js');
      
      chrome.runtime.sendMessage.mockResolvedValue({ success: true });
      
      await startRecording();
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'START_RECORDING',
        data: expect.any(Object)
      });
    });
    
    test('should send STOP_RECORDING message', async () => {
      const { stopRecording } = require('../popup.js');
      
      await stopRecording();
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'STOP_RECORDING'
      });
    });
  });
});