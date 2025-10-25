// Jest setup file for Chrome extension testing

// Mock Chrome APIs globally
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: { 
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn(url => url),
    getContexts: jest.fn(() => Promise.resolve([])),
    onSuspend: { 
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    lastError: null
  },
  storage: {
    sync: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve())
    },
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve())
    }
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(() => Promise.resolve([])),
    get: jest.fn(),
    update: jest.fn()
  },
  downloads: {
    download: jest.fn(() => Promise.resolve(1)),
    search: jest.fn(() => Promise.resolve([]))
  },
  offscreen: {
    createDocument: jest.fn(() => Promise.resolve()),
    closeDocument: jest.fn(() => Promise.resolve()),
    Reason: { 
      USER_MEDIA: 'USER_MEDIA',
      WORKERS: 'WORKERS'
    }
  }
};

// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive'
}));

// Mock Blob
global.Blob = jest.fn().mockImplementation((parts, options) => ({
  size: 1024,
  type: options?.type || 'application/octet-stream',
  slice: jest.fn(),
  text: jest.fn(() => Promise.resolve(''))
}));

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 3000000
  }
};

// Suppress console errors during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
};