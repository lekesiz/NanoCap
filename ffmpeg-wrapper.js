// NanoCap FFmpeg.wasm Wrapper
// Simplified FFmpeg integration for video compression

class FFmpegWrapper {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isProcessing = false;
  }

  // Load FFmpeg from CDN
  async loadFFmpeg() {
    if (this.isLoaded && this.ffmpeg) {
      return this.ffmpeg;
    }

    try {
      console.log('Loading FFmpeg.wasm from CDN...');

      // Load FFmpeg.wasm from CDN
      // Note: In production, we'll use CDN. For now, we'll create a placeholder
      // that shows the implementation pattern

      // Import FFmpeg dynamically
      const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/esm/index.js');
      const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');

      this.ffmpeg = new FFmpeg();
      this.ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });

      this.ffmpeg.on('progress', ({ progress, time }) => {
        console.log(`[FFmpeg] Progress: ${(progress * 100).toFixed(2)}%`, time);

        // Send progress to popup
        chrome.runtime.sendMessage({
          type: 'FFMPEG_PROGRESS',
          progress: progress * 100,
          time,
        });
      });

      await this.ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      });

      this.isLoaded = true;
      console.log('FFmpeg.wasm loaded successfully');

      return this.ffmpeg;
    } catch (error) {
      console.error('Failed to load FFmpeg.wasm:', error);
      throw new Error(`FFmpeg loading failed: ${error.message}`);
    }
  }

  // Compress video with FFmpeg
  async compressVideo(blob, settings = {}) {
    if (this.isProcessing) {
      throw new Error('FFmpeg is already processing another file');
    }

    try {
      this.isProcessing = true;
      console.log('Starting FFmpeg compression...', {
        inputSize: blob.size,
        settings,
      });

      // Load FFmpeg if not loaded
      const ffmpeg = await this.loadFFmpeg();

      // Default compression settings
      const {
        crf = 35, // Quality (0-51, lower is better)
        preset = 'fast', // Speed preset
        audioBitrate = '64k', // Audio bitrate
        codec = 'vp9', // Video codec (vp9, vp8, h264)
      } = settings;

      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const inputData = new Uint8Array(arrayBuffer);

      // Determine file extension from MIME type
      const inputExt = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const inputFile = `input.${inputExt}`;
      const outputFile = 'output.webm';

      // Write input file to FFmpeg filesystem
      await ffmpeg.writeFile(inputFile, inputData);
      console.log(`[FFmpeg] Input file written: ${inputFile}`);

      // Build FFmpeg command based on codec
      let ffmpegArgs;

      if (codec === 'vp9') {
        // VP9 compression (best for size/quality balance)
        ffmpegArgs = [
          '-i',
          inputFile,
          '-c:v',
          'libvpx-vp9',
          '-crf',
          String(crf),
          '-b:v',
          '0', // VBR mode
          '-cpu-used',
          '2', // Speed (0-5, higher is faster)
          '-row-mt',
          '1', // Multi-threading
          '-c:a',
          'libopus',
          '-b:a',
          audioBitrate,
          '-compression_level',
          '10', // Opus compression
          outputFile,
        ];
      } else if (codec === 'vp8') {
        // VP8 compression (fallback)
        ffmpegArgs = [
          '-i',
          inputFile,
          '-c:v',
          'libvpx',
          '-crf',
          String(crf),
          '-b:v',
          '0',
          '-c:a',
          'libopus',
          '-b:a',
          audioBitrate,
          outputFile,
        ];
      } else {
        // H.264 compression
        ffmpegArgs = [
          '-i',
          inputFile,
          '-c:v',
          'libx264',
          '-crf',
          String(crf),
          '-preset',
          preset,
          '-c:a',
          'aac',
          '-b:a',
          audioBitrate,
          outputFile,
        ];
      }

      console.log('[FFmpeg] Running command:', ffmpegArgs.join(' '));

      // Run FFmpeg compression
      await ffmpeg.exec(ffmpegArgs);

      // Read compressed file
      const compressedData = await ffmpeg.readFile(outputFile);
      const compressedBlob = new Blob([compressedData.buffer], {
        type: codec === 'h264' ? 'video/mp4' : 'video/webm',
      });

      // Cleanup
      await ffmpeg.deleteFile(inputFile);
      await ffmpeg.deleteFile(outputFile);

      const compressionRatio = ((1 - compressedBlob.size / blob.size) * 100).toFixed(1);

      console.log('[FFmpeg] Compression complete:', {
        originalSize: blob.size,
        compressedSize: compressedBlob.size,
        ratio: `${compressionRatio}%`,
        savings: `${(blob.size - compressedBlob.size) / 1024 / 1024} MB`,
      });

      this.isProcessing = false;

      return {
        blob: compressedBlob,
        originalSize: blob.size,
        compressedSize: compressedBlob.size,
        ratio: parseFloat(compressionRatio),
      };
    } catch (error) {
      this.isProcessing = false;
      console.error('[FFmpeg] Compression failed:', error);
      throw error;
    }
  }

  // Get compression status
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isProcessing: this.isProcessing,
    };
  }

  // Terminate FFmpeg
  async terminate() {
    if (this.ffmpeg && this.isLoaded) {
      try {
        await this.ffmpeg.terminate();
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isProcessing = false;
        console.log('[FFmpeg] Terminated successfully');
      } catch (error) {
        console.error('[FFmpeg] Termination error:', error);
      }
    }
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.FFmpegWrapper = FFmpegWrapper;
}

console.log('FFmpeg Wrapper module loaded');
