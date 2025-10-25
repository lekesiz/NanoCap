// NanoCap Advanced FFmpeg.wasm Compression System
// Multi-preset compression with real-time preview

class AdvancedFFmpegProcessor {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isProcessing = false;
    this.progressCallback = null;
    this.compressionPresets = this.initializePresets();
    this.compressionHistory = [];
  }

  // Initialize compression presets
  initializePresets() {
    return {
      'ultra-compress': {
        name: 'Ultra Compress',
        description: 'Maximum compression, smallest files',
        crf: 40,
        preset: 'slow',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '32k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 15,
        expectedReduction: 0.7, // 70% size reduction
        processingTime: 'slow'
      },
      'presentation': {
        name: 'Presentation',
        description: 'Optimized for slides and presentations',
        crf: 38,
        preset: 'fast',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '48k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 15,
        expectedReduction: 0.6,
        processingTime: 'fast'
      },
      'balanced': {
        name: 'Balanced',
        description: 'Good balance of size and quality',
        crf: 35,
        preset: 'fast',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '64k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 24,
        expectedReduction: 0.5,
        processingTime: 'medium'
      },
      'high-quality': {
        name: 'High Quality',
        description: 'Higher quality, larger files',
        crf: 30,
        preset: 'medium',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '96k',
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        expectedReduction: 0.3,
        processingTime: 'medium'
      },
      'av1-ultra': {
        name: 'AV1 Ultra',
        description: 'Next-gen AV1 codec for maximum efficiency',
        crf: 35,
        preset: 'slow',
        videoCodec: 'libaom-av1',
        audioCodec: 'libopus',
        audioBitrate: '48k',
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 24,
        expectedReduction: 0.8, // 80% size reduction
        processingTime: 'very-slow',
        requiresAV1: true
      }
    };
  }

  // Initialize FFmpeg with advanced configuration
  async initialize() {
    try {
      if (typeof FFmpeg === 'undefined') {
        throw new Error('FFmpeg.wasm not loaded');
      }

      // Create FFmpeg instance with optimized settings
      this.ffmpeg = FFmpeg.createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js',
        wasmPath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.wasm',
        workerPath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.worker.js'
      });

      if (!this.ffmpeg.isLoaded()) {
        console.log('Loading advanced FFmpeg.wasm...');
        await this.ffmpeg.load();
        console.log('Advanced FFmpeg.wasm loaded successfully');
      }

      this.isLoaded = true;
      return true;

    } catch (error) {
      console.error('Failed to initialize advanced FFmpeg:', error);
      throw error;
    }
  }

  // Process video with selected preset
  async processWithPreset(inputBlob, presetName, options = {}) {
    try {
      if (!this.isLoaded) {
        await this.initialize();
      }

      const preset = this.compressionPresets[presetName];
      if (!preset) {
        throw new Error(`Unknown preset: ${presetName}`);
      }

      // Check AV1 support if required
      if (preset.requiresAV1 && !this.isAV1Supported()) {
        throw new Error('AV1 codec not supported on this system');
      }

      this.isProcessing = true;
      const startTime = Date.now();
      const originalSize = inputBlob.size;

      console.log(`Starting ${preset.name} compression...`);
      console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);

      // Convert blob to array buffer
      const inputArrayBuffer = await inputBlob.arrayBuffer();
      const inputUint8Array = new Uint8Array(inputArrayBuffer);

      // Write input file
      this.ffmpeg.FS('writeFile', 'input.webm', inputUint8Array);

      // Build advanced FFmpeg command
      const command = this.buildAdvancedCommand(preset, options);
      console.log('Advanced FFmpeg command:', command);

      // Set up progress monitoring
      this.setupAdvancedProgressMonitoring(preset);

      // Execute command
      await this.ffmpeg.run(...command);

      // Read output
      const outputData = this.ffmpeg.FS('readFile', 'output.webm');
      const outputBlob = new Blob([outputData.buffer], { type: 'video/webm' });

      // Cleanup
      this.cleanupFiles();

      const processingTime = Date.now() - startTime;
      const compressionRatio = ((originalSize - outputBlob.size) / originalSize) * 100;
      const actualReduction = outputBlob.size / originalSize;

      // Store compression history
      this.compressionHistory.push({
        preset: presetName,
        originalSize: originalSize,
        compressedSize: outputBlob.size,
        compressionRatio: compressionRatio,
        processingTime: processingTime,
        timestamp: Date.now()
      });

      console.log(`Compression completed in ${processingTime}ms`);
      console.log(`Compression ratio: ${compressionRatio.toFixed(1)}%`);
      console.log(`Compressed size: ${(outputBlob.size / 1024 / 1024).toFixed(2)}MB`);

      this.isProcessing = false;

      return {
        blob: outputBlob,
        preset: preset,
        originalSize: originalSize,
        compressedSize: outputBlob.size,
        compressionRatio: compressionRatio,
        actualReduction: actualReduction,
        processingTime: processingTime,
        efficiency: this.calculateEfficiency(preset, actualReduction)
      };

    } catch (error) {
      console.error('Advanced compression failed:', error);
      this.isProcessing = false;
      throw error;
    }
  }

  // Build advanced FFmpeg command
  buildAdvancedCommand(preset, options) {
    const command = [
      '-i', 'input.webm',
      '-c:v', preset.videoCodec,
      '-crf', preset.crf.toString(),
      '-preset', preset.preset,
      '-c:a', preset.audioCodec,
      '-b:a', preset.audioBitrate
    ];

    // Add video scaling if needed
    if (preset.maxWidth && preset.maxHeight) {
      command.push('-vf', `scale=${preset.maxWidth}:${preset.maxHeight}`);
    }

    // Add frame rate
    if (preset.fps) {
      command.push('-r', preset.fps.toString());
    }

    // Add codec-specific optimizations
    if (preset.videoCodec === 'libvp9') {
      command.push('-deadline', 'good');
      command.push('-cpu-used', '2');
      command.push('-row-mt', '1'); // Multi-threading
    } else if (preset.videoCodec === 'libaom-av1') {
      command.push('-cpu-used', '4');
      command.push('-row-mt', '1');
      command.push('-tiles', '2x2');
    }

    // Add streaming optimizations
    command.push('-movflags', '+faststart');
    command.push('-frag_duration', '1000000'); // 1 second fragments

    // Add custom options
    if (options.customParams) {
      command.push(...options.customParams);
    }

    command.push('output.webm');
    return command;
  }

  // Setup advanced progress monitoring
  setupAdvancedProgressMonitoring(preset) {
    if (this.ffmpeg && this.progressCallback) {
      let lastProgress = 0;
      
      this.ffmpeg.setLogger(({ type, message }) => {
        if (type === 'fferr' && message.includes('time=')) {
          const timeMatch = message.match(/time=(\d+):(\d+):(\d+\.\d+)/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const seconds = parseFloat(timeMatch[3]);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            
            // Estimate progress based on typical video length
            const estimatedProgress = Math.min((totalSeconds / 60) * 100, 95);
            
            if (estimatedProgress > lastProgress + 5) { // Update every 5%
              lastProgress = estimatedProgress;
              this.progressCallback({
                percentage: estimatedProgress,
                message: `${preset.name}: ${Math.floor(estimatedProgress)}%`,
                preset: preset.name,
                estimatedTime: this.estimateRemainingTime(estimatedProgress, preset)
              });
            }
          }
        }
      });
    }
  }

  // Estimate remaining processing time
  estimateRemainingTime(progress, preset) {
    const baseTime = this.getPresetBaseTime(preset);
    const remaining = (100 - progress) / 100;
    return Math.round(baseTime * remaining);
  }

  // Get base processing time for preset
  getPresetBaseTime(preset) {
    const baseTimes = {
      'ultra-compress': 300, // 5 minutes
      'presentation': 120,   // 2 minutes
      'balanced': 180,       // 3 minutes
      'high-quality': 240,   // 4 minutes
      'av1-ultra': 600      // 10 minutes
    };
    return baseTimes[preset.name.toLowerCase().replace(' ', '-')] || 180;
  }

  // Calculate compression efficiency
  calculateEfficiency(preset, actualReduction) {
    const expectedReduction = preset.expectedReduction;
    const efficiency = (expectedReduction / actualReduction) * 100;
    return Math.min(efficiency, 100); // Cap at 100%
  }

  // Check AV1 support
  isAV1Supported() {
    // Check if AV1 codec is supported
    return MediaRecorder.isTypeSupported('video/webm;codecs=av01.0.08M.08') ||
           MediaRecorder.isTypeSupported('video/mp4;codecs=av01.0.08M.08');
  }

  // Get compression statistics
  getCompressionStats() {
    if (this.compressionHistory.length === 0) {
      return null;
    }

    const totalCompressions = this.compressionHistory.length;
    const avgCompressionRatio = this.compressionHistory.reduce((sum, entry) => 
      sum + entry.compressionRatio, 0) / totalCompressions;
    const avgProcessingTime = this.compressionHistory.reduce((sum, entry) => 
      sum + entry.processingTime, 0) / totalCompressions;

    return {
      totalCompressions: totalCompressions,
      averageCompressionRatio: avgCompressionRatio,
      averageProcessingTime: avgProcessingTime,
      mostUsedPreset: this.getMostUsedPreset(),
      totalSizeSaved: this.compressionHistory.reduce((sum, entry) => 
        sum + (entry.originalSize - entry.compressedSize), 0)
    };
  }

  // Get most used preset
  getMostUsedPreset() {
    const presetCounts = {};
    this.compressionHistory.forEach(entry => {
      presetCounts[entry.preset] = (presetCounts[entry.preset] || 0) + 1;
    });

    return Object.keys(presetCounts).reduce((a, b) => 
      presetCounts[a] > presetCounts[b] ? a : b);
  }

  // Get preset recommendations based on content
  getPresetRecommendations(contentType) {
    const recommendations = {
      'presentation': ['presentation', 'ultra-compress'],
      'tutorial': ['balanced', 'high-quality'],
      'gaming': ['high-quality', 'balanced'],
      'meeting': ['presentation', 'ultra-compress'],
      'demo': ['balanced', 'presentation'],
      'music': ['high-quality', 'balanced']
    };

    return recommendations[contentType] || ['balanced', 'presentation'];
  }

  // Set progress callback
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Cleanup files
  cleanupFiles() {
    try {
      this.ffmpeg.FS('unlink', 'input.webm');
      this.ffmpeg.FS('unlink', 'output.webm');
    } catch (error) {
      console.warn('Error cleaning up files:', error);
    }
  }

  // Cleanup resources
  cleanup() {
    this.isProcessing = false;
    this.progressCallback = null;
    
    if (this.ffmpeg && this.ffmpeg.isLoaded()) {
      try {
        this.ffmpeg.exit();
      } catch (error) {
        console.warn('Error exiting FFmpeg:', error);
      }
    }
    
    this.ffmpeg = null;
    this.isLoaded = false;
  }
}

// Global instance
const advancedFFmpegProcessor = new AdvancedFFmpegProcessor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedFFmpegProcessor, advancedFFmpegProcessor };
}
