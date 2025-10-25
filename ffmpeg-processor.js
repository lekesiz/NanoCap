// NanoCap FFmpeg.wasm Integration
// Advanced compression using WebAssembly FFmpeg

class FFmpegProcessor {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isProcessing = false;
    this.worker = null;
    this.progressCallback = null;
  }

  // Initialize FFmpeg.wasm
  async initialize() {
    try {
      // Check if FFmpeg.wasm is available
      if (typeof FFmpeg === 'undefined') {
        throw new Error('FFmpeg.wasm not loaded');
      }

      // Create FFmpeg instance
      this.ffmpeg = FFmpeg.createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js',
        wasmPath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.wasm'
      });

      // Load FFmpeg
      if (!this.ffmpeg.isLoaded()) {
        console.log('Loading FFmpeg.wasm...');
        await this.ffmpeg.load();
        console.log('FFmpeg.wasm loaded successfully');
      }

      this.isLoaded = true;
      return true;

    } catch (error) {
      console.error('Failed to initialize FFmpeg.wasm:', error);
      throw error;
    }
  }

  // Process video with advanced compression
  async processVideo(inputBlob, options = {}) {
    try {
      if (!this.isLoaded) {
        await this.initialize();
      }

      this.isProcessing = true;
      const startTime = Date.now();

      // Default compression options
      const compressionOptions = {
        crf: options.crf || 35,           // Constant Rate Factor
        preset: options.preset || 'fast', // Encoding speed preset
        videoCodec: options.videoCodec || 'libvp9',
        audioCodec: options.audioCodec || 'libopus',
        audioBitrate: options.audioBitrate || '64k',
        maxWidth: options.maxWidth || 1280,
        maxHeight: options.maxHeight || 720,
        fps: options.fps || 24,
        ...options
      };

      console.log('Starting FFmpeg processing with options:', compressionOptions);

      // Convert blob to array buffer
      const inputArrayBuffer = await inputBlob.arrayBuffer();
      const inputUint8Array = new Uint8Array(inputArrayBuffer);

      // Write input file to FFmpeg filesystem
      this.ffmpeg.FS('writeFile', 'input.webm', inputUint8Array);

      // Build FFmpeg command
      const command = this.buildFFmpegCommand(compressionOptions);
      console.log('FFmpeg command:', command);

      // Set up progress monitoring
      this.setupProgressMonitoring();

      // Execute FFmpeg command
      await this.ffmpeg.run(...command);

      // Read output file
      const outputData = this.ffmpeg.FS('readFile', 'output.webm');
      const outputBlob = new Blob([outputData.buffer], { type: 'video/webm' });

      // Cleanup FFmpeg filesystem
      this.cleanupFiles();

      const processingTime = Date.now() - startTime;
      const compressionRatio = ((inputBlob.size - outputBlob.size) / inputBlob.size) * 100;

      console.log(`FFmpeg processing completed in ${processingTime}ms`);
      console.log(`Compression ratio: ${compressionRatio.toFixed(1)}%`);
      console.log(`Original size: ${(inputBlob.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compressed size: ${(outputBlob.size / 1024 / 1024).toFixed(2)}MB`);

      this.isProcessing = false;

      return {
        blob: outputBlob,
        originalSize: inputBlob.size,
        compressedSize: outputBlob.size,
        compressionRatio: compressionRatio,
        processingTime: processingTime
      };

    } catch (error) {
      console.error('FFmpeg processing failed:', error);
      this.isProcessing = false;
      throw error;
    }
  }

  // Build FFmpeg command based on options
  buildFFmpegCommand(options) {
    const command = [
      '-i', 'input.webm',
      '-c:v', options.videoCodec,
      '-crf', options.crf.toString(),
      '-preset', options.preset,
      '-c:a', options.audioCodec,
      '-b:a', options.audioBitrate,
      '-vf', `scale=${options.maxWidth}:${options.maxHeight}`,
      '-r', options.fps.toString(),
      '-movflags', '+faststart', // Optimize for streaming
      'output.webm'
    ];

    // Add specific codec options
    if (options.videoCodec === 'libvp9') {
      command.push('-deadline', 'good');
      command.push('-cpu-used', '2');
    }

    return command;
  }

  // Set up progress monitoring
  setupProgressMonitoring() {
    if (this.ffmpeg && this.progressCallback) {
      // Monitor FFmpeg logs for progress
      const originalLog = this.ffmpeg.setLogger;
      this.ffmpeg.setLogger(({ type, message }) => {
        if (type === 'fferr' && message.includes('time=')) {
          // Extract time information from FFmpeg output
          const timeMatch = message.match(/time=(\d+):(\d+):(\d+\.\d+)/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const seconds = parseFloat(timeMatch[3]);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            
            // Estimate progress (this is approximate)
            const estimatedProgress = Math.min(totalSeconds / 60, 1) * 100; // Assume 1 minute video
            
            this.progressCallback({
              percentage: estimatedProgress,
              message: `Processing... ${Math.floor(estimatedProgress)}%`
            });
          }
        }
      });
    }
  }

  // Set progress callback
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  // Clean up FFmpeg filesystem
  cleanupFiles() {
    try {
      this.ffmpeg.FS('unlink', 'input.webm');
      this.ffmpeg.FS('unlink', 'output.webm');
    } catch (error) {
      console.warn('Error cleaning up FFmpeg files:', error);
    }
  }

  // Get compression presets
  getCompressionPresets() {
    return {
      'ultra-compress': {
        crf: 40,
        preset: 'slow',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '32k',
        description: 'Maximum compression, lower quality'
      },
      'balanced': {
        crf: 35,
        preset: 'fast',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '64k',
        description: 'Good balance of size and quality'
      },
      'high-quality': {
        crf: 30,
        preset: 'medium',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '96k',
        description: 'Higher quality, larger file'
      },
      'presentation': {
        crf: 38,
        preset: 'fast',
        videoCodec: 'libvp9',
        audioCodec: 'libopus',
        audioBitrate: '48k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 15,
        description: 'Optimized for presentations'
      }
    };
  }

  // Check if FFmpeg.wasm is supported
  static isSupported() {
    return typeof FFmpeg !== 'undefined' && 
           typeof WebAssembly !== 'undefined' &&
           typeof SharedArrayBuffer !== 'undefined';
  }

  // Get system requirements
  static getSystemRequirements() {
    return {
      browser: 'Chrome 88+, Firefox 89+, Safari 15+',
      memory: 'Minimum 2GB RAM recommended',
      cpu: 'Multi-core processor recommended',
      features: [
        'WebAssembly support',
        'SharedArrayBuffer support',
        'FFmpeg.wasm library'
      ]
    };
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
const ffmpegProcessor = new FFmpegProcessor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FFmpegProcessor, ffmpegProcessor };
}
