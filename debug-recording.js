// Debug script to trace recording flow issues

// Add this to manifest.json temporarily under content_scripts:
// {
//   "matches": ["<all_urls>"],
//   "js": ["debug-recording.js"]
// }

console.log('🔍 NanoCap Debug: Content script loaded');

// Listen for recording events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔍 Debug: Message received in content script:', message);

  if (message.type === 'DEBUG_CHECK') {
    console.log('🔍 Debug: Content script is active');
    sendResponse({ active: true });
  }
});

// Log all runtime errors
window.addEventListener('error', (event) => {
  console.error('🔍 Debug: Window error:', event.error);
});

// Monitor blob URL creation
const originalCreateObjectURL = URL.createObjectURL;
URL.createObjectURL = function (blob) {
  console.log('🔍 Debug: Blob URL being created:', {
    size: blob.size,
    type: blob.type,
  });
  return originalCreateObjectURL.call(this, blob);
};

// Monitor downloads
if (chrome.downloads) {
  chrome.downloads.onCreated.addListener((downloadItem) => {
    console.log('🔍 Debug: Download created:', downloadItem);
  });

  chrome.downloads.onChanged.addListener((downloadDelta) => {
    console.log('🔍 Debug: Download changed:', downloadDelta);
  });
}
