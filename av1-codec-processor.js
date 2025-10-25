// NanoCap AV1 Codec Support
// Next-generation video compression for ultra-small files

class AV1CodecProcessor {
  constructor() {
    this.isSupported = false;
    this.av1Presets = this.initializeAV1Presets();
    this.supportInfo = null;
  }

  // Initialize AV1 compression presets
  initializeAV1Presets() {
    return {
      'av1-ultra-compress': {
        name: 'AV1 Ultra Compress',
        description: 'Maximum compression with AV1 codec',
        crf: 40,
        preset: 'slow',
        videoCodec: 'libaom-av1',
        audioCodec: 'libopus',
        audioBitrate: '32k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 15,
        expectedReduction: 0.8, // 80% size reduction
        processingTime: 'very-slow',
        av1Specific: {
          cpuUsed: 4,
          rowMt: 1,
          tiles: '2x2',
          lagInFrames: 16,
          autoAltRef: 1,
          arnrMaxFrames: 7,
          arnrStrength: 5
        }
      },
      'av1-balanced': {
        name: 'AV1 Balanced',
        description: 'Balanced AV1 compression',
        crf: 35,
        preset: 'medium',
        videoCodec: 'libaom-av1',
        audioCodec: 'libopus',
        audioBitrate: '64k',
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 24,
        expectedReduction: 0.6,
        processingTime: 'slow',
        av1Specific: {
          cpuUsed: 3,
          rowMt: 1,
          tiles: '2x2',
          lagInFrames: 12,
          autoAltRef: 1,
          arnrMaxFrames: 5,
          arnrStrength: 3
        }
      },
      'av1-high-quality': {
        name: 'AV1 High Quality',
        description: 'High quality AV1 compression',
        crf: 30,
        preset: 'medium',
        videoCodec: 'libaom-av1',
        audioCodec: 'libopus',
        audioBitrate: '96k',
        maxWidth: 1920,
        maxHeight: 1080,
        fps: 30,
        expectedReduction: 0.4,
        processingTime: 'slow',
        av1Specific: {
          cpuUsed: 2,
          rowMt: 1,
          tiles: '2x2',
          lagInFrames: 8,
          autoAltRef: 1,
          arnrMaxFrames: 3,
          arnrStrength: 2
        }
      },
      'av1-presentation': {
        name: 'AV1 Presentation',
        description: 'AV1 optimized for presentations',
        crf: 38,
        preset: 'fast',
        videoCodec: 'libaom-av1',
        audioCodec: 'libopus',
        audioBitrate: '48k',
        maxWidth: 1280,
        maxHeight: 720,
        fps: 15,
        expectedReduction: 0.7,
        processingTime: 'medium',
        av1Specific: {
          cpuUsed: 5,
          rowMt: 1,
          tiles: '1x2',
          lagInFrames: 4,
          autoAltRef: 0,
          arnrMaxFrames: 0,
          arnrStrength: 0
        }
      }
    };
  }

  // Check AV1 support comprehensively
  async checkAV1Support() {
    const supportInfo = {
      webmAV1: false,
      mp4AV1: false,
      hardwareAcceleration: false,
      browserSupport: false,
      overallSupport: false
    };

    try {
      // Check WebM AV1 support
      supportInfo.webmAV1 = MediaRecorder.isTypeSupported('video/webm;codecs=av01.0.08M.08') ||
                           MediaRecorder.isTypeSupported('video/webm;codecs=av01.0.05M.08') ||
                           MediaRecorder.isTypeSupported('video/webm;codecs=av01.0.04M.08');

      // Check MP4 AV1 support
      supportInfo.mp4AV1 = MediaRecorder.isTypeSupported('video/mp4;codecs=av01.0.08M.08') ||
                           MediaRecorder.isTypeSupported('video/mp4;codecs=av01.0.05M.08') ||
                           MediaRecorder.isTypeSupported('video/mp4;codecs=av01.0.04M.08');

      // Check browser support
      supportInfo.browserSupport = this.checkBrowserAV1Support();

      // Check hardware acceleration
      supportInfo.hardwareAcceleration = await this.checkHardwareAcceleration();

      // Overall support
      supportInfo.overallSupport = supportInfo.webmAV1 || supportInfo.mp4AV1;

      this.supportInfo = supportInfo;
      this.isSupported = supportInfo.overallSupport;

      console.log('AV1 Support Check:', supportInfo);
      return supportInfo;

    } catch (error) {
      console.error('Error checking AV1 support:', error);
      this.isSupported = false;
      return supportInfo;
    }
  }

  // Check browser-specific AV1 support
  checkBrowserAV1Support() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Chrome 100+ has AV1 support
    const chromeMatch = userAgent.match(/chrome\/(\d+)/);
    if (chromeMatch && parseInt(chromeMatch[1]) >= 100) {
      return true;
    }

    // Firefox 93+ has AV1 support
    const firefoxMatch = userAgent.match(/firefox\/(\d+)/);
    if (firefoxMatch && parseInt(firefoxMatch[1]) >= 93) {
      return true;
    }

    // Safari 16+ has AV1 support
    const safariMatch = userAgent.match(/version\/(\d+).*safari/);
    if (safariMatch && parseInt(safariMatch[1]) >= 16) {
      return true;
    }

    return false;
  }

  // Check hardware acceleration support
  async checkHardwareAcceleration() {
    try {
      // Check for WebCodecs API (indicates hardware acceleration support)
      if ('VideoEncoder' in window) {
        const config = {
          codec: 'av01.0.08M.08',
          width: 1280,
          height: 720,
          bitrate: 1000000,
          framerate: 30
        };

        try {
          const encoder = new VideoEncoder({
            output: () => {},
            error: () => {}
          });

          await encoder.configure(config);
          encoder.close();
          return true;
        } catch (error) {
          console.warn('Hardware acceleration not available:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.warn('Error checking hardware acceleration:', error);
      return false;
    }
  }

  // Get optimal AV1 preset based on content and system capabilities
  getOptimalAV1Preset(contentType, systemCapabilities) {
    const recommendations = {
      'presentation': {
        fast: 'av1-presentation',
        balanced: 'av1-balanced',
        quality: 'av1-high-quality'
      },
      'tutorial': {
        fast: 'av1-balanced',
        balanced: 'av1-balanced',
        quality: 'av1-high-quality'
      },
      'gaming': {
        fast: 'av1-balanced',
        balanced: 'av1-high-quality',
        quality: 'av1-high-quality'
      },
      'meeting': {
        fast: 'av1-presentation',
        balanced: 'av1-presentation',
        quality: 'av1-balanced'
      }
    };

    const contentRecommendations = recommendations[contentType] || recommendations['tutorial'];
    
    // Choose based on system capabilities
    if (systemCapabilities.highPerformance) {
      return contentRecommendations.quality;
    } else if (systemCapabilities.mediumPerformance) {
      return contentRecommendations.balanced;
    } else {
      return contentRecommendations.fast;
    }
  }

  // Build AV1-specific FFmpeg command
  buildAV1Command(preset, options = {}) {
    const av1Specific = preset.av1Specific;
    const command = [
      '-i', 'input.webm',
      '-c:v', preset.videoCodec,
      '-crf', preset.crf.toString(),
      '-preset', preset.preset,
      '-c:a', preset.audioCodec,
      '-b:a', preset.audioBitrate
    ];

    // Add AV1-specific parameters
    command.push('-cpu-used', av1Specific.cpuUsed.toString());
    command.push('-row-mt', av1Specific.rowMt.toString());
    command.push('-tiles', av1Specific.tiles);
    command.push('-lag-in-frames', av1Specific.lagInFrames.toString());
    command.push('-auto-alt-ref', av1Specific.autoAltRef.toString());
    command.push('-arnr-maxframes', av1Specific.arnrMaxFrames.toString());
    command.push('-arnr-strength', av1Specific.arnrStrength.toString());

    // Add video scaling if needed
    if (preset.maxWidth && preset.maxHeight) {
      command.push('-vf', `scale=${preset.maxWidth}:${preset.maxHeight}`);
    }

    // Add frame rate
    if (preset.fps) {
      command.push('-r', preset.fps.toString());
    }

    // Add streaming optimizations
    command.push('-movflags', '+faststart');
    command.push('-frag_duration', '1000000');

    // Add custom options
    if (options.customParams) {
      command.push(...options.customParams);
    }

    command.push('output.webm');
    return command;
  }

  // Get AV1 compression statistics
  getAV1Stats() {
    if (!this.supportInfo) {
      return null;
    }

    return {
      support: this.supportInfo,
      recommendedPreset: this.getRecommendedPreset(),
      expectedBenefits: {
        sizeReduction: '40-80% smaller files',
        qualityImprovement: 'Better quality at same bitrate',
        futureProof: 'Next-generation standard'
      },
      requirements: {
        browser: 'Chrome 100+, Firefox 93+, Safari 16+',
        hardware: 'Multi-core CPU recommended',
        processing: 'Slower encoding, faster decoding'
      }
    };
  }

  // Get recommended preset based on system
  getRecommendedPreset() {
    if (!this.isSupported) {
      return null;
    }

    // Simple recommendation based on support level
    if (this.supportInfo.hardwareAcceleration) {
      return 'av1-balanced';
    } else if (this.supportInfo.browserSupport) {
      return 'av1-presentation';
    } else {
      return 'av1-ultra-compress';
    }
  }

  // Compare AV1 vs VP9 compression
  async compareCompression(inputBlob, duration) {
    const results = {
      av1: null,
      vp9: null,
      comparison: null
    };

    try {
      // This would require running both codecs
      // For now, return estimated comparison
      const estimatedSize = inputBlob.size;
      
      results.comparison = {
        av1Size: estimatedSize * 0.3, // 70% reduction
        vp9Size: estimatedSize * 0.5, // 50% reduction
        av1Advantage: 0.4, // 40% smaller than VP9
        processingTime: {
          av1: duration * 3, // 3x slower encoding
          vp9: duration * 1  // Baseline
        }
      };

      return results;

    } catch (error) {
      console.error('Error comparing compression:', error);
      throw error;
    }
  }

  // Get AV1 preset information
  getAV1Preset(presetName) {
    return this.av1Presets[presetName] || null;
  }

  // Get all AV1 presets
  getAllAV1Presets() {
    return this.av1Presets;
  }

  // Check if AV1 is recommended for user's system
  isAV1Recommended() {
    if (!this.isSupported) {
      return false;
    }

    // Check system performance indicators
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    // Recommend AV1 for systems with good performance
    return cores >= 4 && memory >= 8;
  }

  // Get AV1 usage recommendations
  getUsageRecommendations() {
    return {
      recommended: this.isAV1Recommended(),
      scenarios: {
        'presentation': 'AV1 Presentation - Fast encoding, small files',
        'tutorial': 'AV1 Balanced - Good quality, reasonable size',
        'gaming': 'AV1 High Quality - Best quality, larger files',
        'meeting': 'AV1 Presentation - Optimized for speech'
      },
      tips: [
        'AV1 encoding is slower but produces smaller files',
        'Use AV1 for content that will be viewed multiple times',
        'AV1 is ideal for streaming and archival',
        'Consider VP9 for real-time applications'
      ]
    };
  }
}

// Global instance
const av1CodecProcessor = new AV1CodecProcessor();

// Auto-check AV1 support on initialization
av1CodecProcessor.checkAV1Support();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AV1CodecProcessor, av1CodecProcessor };
}
