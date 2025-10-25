// NanoCap Automatic File Splitting System
// Split recordings into multiple files based on time or size

class AutoSplitRecorder {
  constructor() {
    this.splitSettings = {
      enabled: false,
      splitBy: 'time', // 'time' or 'size'
      timeInterval: 30, // minutes
      sizeLimit: 100, // MB
      overlapDuration: 5, // seconds overlap between files
      maxFiles: 10 // maximum number of split files
    };
    this.currentFile = 1;
    this.totalFiles = 0;
    this.splitFiles = [];
    this.isSplitting = false;
    this.recordingStartTime = null;
    this.lastSplitTime = null;
  }

  // Initialize auto-split system
  async initialize(settings = {}) {
    try {
      this.splitSettings = { ...this.splitSettings, ...settings };
      this.currentFile = 1;
      this.totalFiles = 0;
      this.splitFiles = [];
      this.isSplitting = false;

      console.log('Auto-split recorder initialized with settings:', this.splitSettings);
      return true;

    } catch (error) {
      console.error('Failed to initialize auto-split recorder:', error);
      throw error;
    }
  }

  // Start auto-split recording
  async startAutoSplitRecording(stream, options = {}) {
    try {
      if (!this.splitSettings.enabled) {
        throw new Error('Auto-split is not enabled');
      }

      this.recordingStartTime = Date.now();
      this.lastSplitTime = this.recordingStartTime;
      this.isSplitting = true;

      console.log(`Starting auto-split recording (File ${this.currentFile}/${this.splitSettings.maxFiles})`);

      // Start first recording segment
      const recorder = await this.startRecordingSegment(stream, options);
      
      // Set up auto-split monitoring
      this.setupAutoSplitMonitoring(recorder, stream, options);

      return recorder;

    } catch (error) {
      console.error('Failed to start auto-split recording:', error);
      throw error;
    }
  }

  // Start a recording segment
  async startRecordingSegment(stream, options) {
    const segmentOptions = {
      ...options,
      filename: this.generateSegmentFilename()
    };

    // Create MediaRecorder for this segment
    const recorder = new MediaRecorder(stream, {
      mimeType: options.mimeType || 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: options.videoBitsPerSecond,
      audioBitsPerSecond: options.audioBitsPerSecond
    });

    const chunks = [];
    
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: segmentOptions.mimeType });
        await this.saveSegment(blob, segmentOptions.filename);
        
        // Notify completion
        this.notifySegmentComplete(segmentOptions.filename, blob.size);
        
      } catch (error) {
        console.error('Failed to save segment:', error);
        this.notifyError(error);
      }
    };

    recorder.start(1000); // 1-second chunks
    return recorder;
  }

  // Setup auto-split monitoring
  setupAutoSplitMonitoring(recorder, stream, options) {
    const checkInterval = setInterval(() => {
      if (!this.isSplitting) {
        clearInterval(checkInterval);
        return;
      }

      const shouldSplit = this.shouldSplitFile();
      
      if (shouldSplit) {
        this.splitRecording(recorder, stream, options);
        clearInterval(checkInterval);
      }
    }, 5000); // Check every 5 seconds
  }

  // Determine if file should be split
  shouldSplitFile() {
    const now = Date.now();
    const elapsed = now - this.lastSplitTime;

    if (this.splitSettings.splitBy === 'time') {
      const timeLimit = this.splitSettings.timeInterval * 60 * 1000; // Convert to milliseconds
      return elapsed >= timeLimit;
    } else if (this.splitSettings.splitBy === 'size') {
      // This would require tracking the current file size
      // For now, we'll use time-based estimation
      const estimatedSize = this.estimateCurrentFileSize(elapsed);
      const sizeLimit = this.splitSettings.sizeLimit * 1024 * 1024; // Convert to bytes
      return estimatedSize >= sizeLimit;
    }

    return false;
  }

  // Estimate current file size based on elapsed time
  estimateCurrentFileSize(elapsed) {
    // Rough estimation based on bitrate
    const bitrate = 2000000; // 2 Mbps average
    const bitsPerSecond = bitrate;
    const bitsElapsed = bitsPerSecond * (elapsed / 1000);
    return bitsElapsed / 8; // Convert to bytes
  }

  // Split the recording
  async splitRecording(currentRecorder, stream, options) {
    try {
      console.log(`Splitting recording to file ${this.currentFile + 1}`);

      // Stop current recording
      currentRecorder.stop();

      // Check if we've reached max files
      if (this.currentFile >= this.splitSettings.maxFiles) {
        console.log('Maximum number of files reached, stopping auto-split');
        this.isSplitting = false;
        this.notifyMaxFilesReached();
        return;
      }

      // Wait for overlap duration
      await this.waitForOverlap();

      // Start next segment
      this.currentFile++;
      this.lastSplitTime = Date.now();
      
      const nextRecorder = await this.startRecordingSegment(stream, options);
      this.setupAutoSplitMonitoring(nextRecorder, stream, options);

      // Notify split
      this.notifySplitComplete(this.currentFile);

    } catch (error) {
      console.error('Failed to split recording:', error);
      this.notifyError(error);
    }
  }

  // Wait for overlap duration
  async waitForOverlap() {
    return new Promise(resolve => {
      setTimeout(resolve, this.splitSettings.overlapDuration * 1000);
    });
  }

  // Generate segment filename
  generateSegmentFilename() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = this.splitSettings.mimeType?.includes('mp4') ? 'mp4' : 'webm';
    return `nanocap-split-${timestamp}-part${this.currentFile}.${extension}`;
  }

  // Save recording segment
  async saveSegment(blob, filename) {
    try {
      // Convert blob to data URL
      const dataUrl = await this.blobToDataURL(blob);
      
      // Send to service worker for download
      chrome.runtime.sendMessage({
        type: 'SPLIT_SEGMENT_READY',
        dataUrl: dataUrl,
        filename: filename,
        segmentNumber: this.currentFile,
        totalSegments: this.splitSettings.maxFiles
      });

      // Store segment info
      this.splitFiles.push({
        filename: filename,
        size: blob.size,
        segmentNumber: this.currentFile,
        timestamp: Date.now()
      });

      console.log(`Segment ${this.currentFile} saved: ${filename} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);

    } catch (error) {
      console.error('Failed to save segment:', error);
      throw error;
    }
  }

  // Convert blob to data URL
  blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Stop auto-split recording
  stopAutoSplitRecording() {
    this.isSplitting = false;
    this.totalFiles = this.currentFile;
    
    console.log(`Auto-split recording stopped. Total files: ${this.totalFiles}`);
    
    // Notify completion
    this.notifyRecordingComplete();
  }

  // Get split statistics
  getSplitStatistics() {
    const totalSize = this.splitFiles.reduce((sum, file) => sum + file.size, 0);
    const averageSize = this.splitFiles.length > 0 ? totalSize / this.splitFiles.length : 0;
    
    return {
      totalFiles: this.splitFiles.length,
      totalSize: totalSize,
      averageSize: averageSize,
      currentFile: this.currentFile,
      isSplitting: this.isSplitting,
      settings: this.splitSettings,
      files: this.splitFiles
    };
  }

  // Update split settings
  updateSplitSettings(newSettings) {
    this.splitSettings = { ...this.splitSettings, ...newSettings };
    console.log('Split settings updated:', this.splitSettings);
  }

  // Notify segment completion
  notifySegmentComplete(filename, size) {
    chrome.runtime.sendMessage({
      type: 'SEGMENT_COMPLETE',
      filename: filename,
      size: size,
      segmentNumber: this.currentFile,
      totalSegments: this.splitSettings.maxFiles
    });
  }

  // Notify split completion
  notifySplitComplete(segmentNumber) {
    chrome.runtime.sendMessage({
      type: 'SPLIT_COMPLETE',
      segmentNumber: segmentNumber,
      totalSegments: this.splitSettings.maxFiles
    });
  }

  // Notify recording completion
  notifyRecordingComplete() {
    chrome.runtime.sendMessage({
      type: 'AUTO_SPLIT_COMPLETE',
      statistics: this.getSplitStatistics()
    });
  }

  // Notify max files reached
  notifyMaxFilesReached() {
    chrome.runtime.sendMessage({
      type: 'MAX_FILES_REACHED',
      totalFiles: this.splitSettings.maxFiles
    });
  }

  // Notify error
  notifyError(error) {
    chrome.runtime.sendMessage({
      type: 'AUTO_SPLIT_ERROR',
      error: error.message || 'Unknown auto-split error'
    });
  }

  // Get split presets
  getSplitPresets() {
    return {
      'short-sessions': {
        name: 'Short Sessions',
        description: 'Perfect for short presentations and demos',
        splitBy: 'time',
        timeInterval: 15, // 15 minutes
        overlapDuration: 3,
        maxFiles: 5
      },
      'long-recordings': {
        name: 'Long Recordings',
        description: 'Ideal for long meetings and training sessions',
        splitBy: 'time',
        timeInterval: 60, // 1 hour
        overlapDuration: 5,
        maxFiles: 10
      },
      'size-limited': {
        name: 'Size Limited',
        description: 'Split by file size for storage management',
        splitBy: 'size',
        sizeLimit: 100, // 100 MB
        overlapDuration: 5,
        maxFiles: 20
      },
      'custom': {
        name: 'Custom',
        description: 'User-defined split settings',
        splitBy: 'time',
        timeInterval: 30,
        overlapDuration: 5,
        maxFiles: 10
      }
    };
  }

  // Apply split preset
  applyPreset(presetName) {
    const presets = this.getSplitPresets();
    const preset = presets[presetName];
    
    if (preset) {
      this.updateSplitSettings(preset);
      console.log(`Applied preset: ${preset.name}`);
      return true;
    }
    
    return false;
  }

  // Cleanup resources
  cleanup() {
    this.isSplitting = false;
    this.splitFiles = [];
    this.currentFile = 1;
    this.totalFiles = 0;
    this.recordingStartTime = null;
    this.lastSplitTime = null;
    
    console.log('Auto-split recorder cleaned up');
  }
}

// Global instance
const autoSplitRecorder = new AutoSplitRecorder();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AutoSplitRecorder, autoSplitRecorder };
}
