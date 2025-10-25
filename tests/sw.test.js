// Tests for service worker functionality

describe('NanoCap Service Worker Tests', () => {
  beforeEach(() => {
    // Mock chrome API
    global.chrome = {
      runtime: {
        onMessage: { addListener: jest.fn() },
        sendMessage: jest.fn(),
        getURL: jest.fn(url => url),
        getContexts: jest.fn(() => Promise.resolve([])),
        onSuspend: { addListener: jest.fn() }
      },
      offscreen: {
        createDocument: jest.fn(() => Promise.resolve()),
        closeDocument: jest.fn(() => Promise.resolve()),
        Reason: { USER_MEDIA: 'USER_MEDIA' }
      },
      downloads: {
        download: jest.fn()
      }
    };
    
    // Mock URL API
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:mock-url')
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Recording State Management', () => {
    test('should initialize with correct default state', () => {
      const { recordingState } = require('../sw.js');
      
      expect(recordingState).toEqual({
        isRecording: false,
        mediaRecorder: null,
        chunks: [],
        startTime: null,
        offscreenCreated: false
      });
    });
  });

  describe('Message Handling', () => {
    test('should handle START_RECORDING message', () => {
      const sw = require('../sw.js');
      
      // Get the message handler
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      // Simulate START_RECORDING message
      messageHandler(
        { type: 'START_RECORDING', data: { quality: 'balanced' } },
        {},
        sendResponse
      );
      
      // Should return true to keep channel open
      expect(messageHandler({ type: 'START_RECORDING' }, {}, sendResponse)).toBe(true);
    });
    
    test('should handle STOP_RECORDING message', () => {
      const sw = require('../sw.js');
      
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      messageHandler({ type: 'STOP_RECORDING' }, {}, sendResponse);
      
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'STOP_RECORDING_SIGNAL'
      });
    });
    
    test('should handle GET_RECORDING_STATE message', () => {
      const sw = require('../sw.js');
      const { recordingState } = sw;
      
      const messageHandler = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      const sendResponse = jest.fn();
      
      messageHandler({ type: 'GET_RECORDING_STATE' }, {}, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ state: recordingState });
    });
  });

  describe('Offscreen Document Management', () => {
    test('should create offscreen document when not exists', async () => {
      const { createOffscreenDocument } = require('../sw.js');
      
      await createOffscreenDocument();
      
      expect(chrome.offscreen.createDocument).toHaveBeenCalledWith({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: expect.any(String)
      });
    });
    
    test('should not create duplicate offscreen document', async () => {
      const { createOffscreenDocument } = require('../sw.js');
      
      // Mock existing context
      chrome.runtime.getContexts.mockResolvedValueOnce([{ documentUrl: 'offscreen.html' }]);
      
      await createOffscreenDocument();
      
      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
    });
  });

  describe('Compression Pipeline', () => {
    test('should handle compression without FFmpeg', async () => {
      const { compressRecording } = require('../sw.js');
      
      const mockBlob = new Blob(['test'], { type: 'video/webm' });
      const result = await compressRecording(mockBlob, { useFFmpeg: false });
      
      expect(result).toBe(mockBlob);
    });
  });

  describe('Download Handling', () => {
    test('should trigger download with correct parameters', async () => {
      const { handleDownloadRecording } = require('../sw.js');
      
      const mockBlob = new Blob(['test'], { type: 'video/webm' });
      await handleDownloadRecording({ blob: mockBlob, settings: {} });
      
      expect(chrome.downloads.download).toHaveBeenCalledWith({
        url: 'blob:mock-url',
        filename: expect.stringContaining('nanocap-recording-'),
        saveAs: true
      });
    });
  });

  describe('Cleanup', () => {
    test('should cleanup on extension suspend', () => {
      require('../sw.js');
      
      // Get the suspend handler
      const suspendHandler = chrome.runtime.onSuspend.addListener.mock.calls[0][0];
      
      // Simulate suspension
      suspendHandler();
      
      // Should attempt cleanup
      expect(chrome.offscreen.closeDocument).toHaveBeenCalled();
    });
  });
});