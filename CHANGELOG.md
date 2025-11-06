# Changelog

All notable changes to NanoCap will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-01-06

### Fixed
- 🐛 Recording functionality now works correctly with proper tab capture stream ID
- 🔧 Message handling between service worker and offscreen document
- 💾 Download functionality with automatic storage tracking
- 📝 Recording history display in popup

### Changed
- 🎨 Improved popup UI readability with better colors and contrast
- 📏 Updated popup dimensions to 400x550px for better visibility
- 🎯 Enhanced button and text sizes for accessibility
- 🎨 Replaced gradient backgrounds with clean, modern design

### Added
- 📊 Recording history tracking (keeps last 10 recordings)
- 💾 Chrome storage integration for recording metadata
- 🔄 Auto-refresh recording list on new downloads

## [0.3.0] - 2024-10-25

### Added
- ✨ Initial production-ready release
- 🎬 Tab, window, and screen recording capabilities
- 🎤 Audio recording from tab and microphone
- 🗜️ VP9/Opus compression for ultra-low file sizes
- 🔧 FFmpeg.wasm integration for advanced compression
- 🎨 Modern UI with quality presets
- 📊 Real-time recording status and timer
- 🔒 Privacy-focused local processing

### Technical Features
- Chrome Manifest V3 compatibility
- Offscreen document for secure recording
- Service worker architecture
- MediaRecorder API with optimal settings
- Two-stage compression pipeline

## [0.2.0] - 2024-10-20

### Added
- Basic recording functionality
- Initial UI implementation
- Chrome extension structure

## [0.1.0] - 2024-10-15

### Added
- Project initialization
- Basic manifest configuration
- Initial prototype

---

For more information, visit [GitHub](https://github.com/lekesiz/NanoCap)