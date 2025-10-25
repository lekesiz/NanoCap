// NanoCap Advanced Audio Processing System
// Microphone mixing and audio overlay capabilities

class AdvancedAudioProcessor {
  constructor() {
    this.audioContext = null;
    this.microphoneStream = null;
    this.tabAudioStream = null;
    this.mixedStream = null;
    this.audioNodes = {
      microphoneGain: null,
      tabAudioGain: null,
      microphoneFilter: null,
      tabAudioFilter: null,
      compressor: null,
      limiter: null,
      mixer: null
    };
    this.audioSettings = {
      microphoneVolume: 1.0,
      tabAudioVolume: 1.0,
      microphoneMuted: false,
      tabAudioMuted: false,
      noiseReduction: false,
      echoCancellation: true,
      autoGainControl: true
    };
    this.isProcessing = false;
  }

  // Initialize audio processing system
  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000,
        latencyHint: 'interactive'
      });

      console.log('Advanced Audio Processor initialized');
      return true;

    } catch (error) {
      console.error('Failed to initialize audio processor:', error);
      throw error;
    }
  }

  // Start microphone capture
  async startMicrophoneCapture(options = {}) {
    try {
      const constraints = {
        audio: {
          echoCancellation: options.echoCancellation !== false,
          noiseSuppression: options.noiseSuppression !== false,
          autoGainControl: options.autoGainControl !== false,
          sampleRate: 48000,
          channelCount: 1
        }
      };

      this.microphoneStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Microphone capture started');

      return this.microphoneStream;

    } catch (error) {
      console.error('Failed to start microphone capture:', error);
      throw error;
    }
  }

  // Start tab audio capture
  async startTabAudioCapture(streamId) {
    try {
      this.tabAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'tab',
            chromeMediaSourceId: streamId
          }
        }
      });

      console.log('Tab audio capture started');
      return this.tabAudioStream;

    } catch (error) {
      console.error('Failed to start tab audio capture:', error);
      throw error;
    }
  }

  // Create mixed audio stream
  async createMixedStream() {
    try {
      if (!this.audioContext) {
        await this.initialize();
      }

      // Create audio nodes
      this.createAudioNodes();

      // Connect microphone stream
      if (this.microphoneStream) {
        const microphoneSource = this.audioContext.createMediaStreamSource(this.microphoneStream);
        microphoneSource.connect(this.audioNodes.microphoneGain);
        this.audioNodes.microphoneGain.connect(this.audioNodes.microphoneFilter);
        this.audioNodes.microphoneFilter.connect(this.audioNodes.mixer);
      }

      // Connect tab audio stream
      if (this.tabAudioStream) {
        const tabAudioSource = this.audioContext.createMediaStreamSource(this.tabAudioStream);
        tabAudioSource.connect(this.audioNodes.tabAudioGain);
        this.audioNodes.tabAudioGain.connect(this.audioNodes.tabAudioFilter);
        this.audioNodes.tabAudioFilter.connect(this.audioNodes.mixer);
      }

      // Connect mixer to compressor and limiter
      this.audioNodes.mixer.connect(this.audioNodes.compressor);
      this.audioNodes.compressor.connect(this.audioNodes.limiter);

      // Create destination for mixed audio
      const destination = this.audioContext.createMediaStreamDestination();
      this.audioNodes.limiter.connect(destination);

      this.mixedStream = destination.stream;
      this.isProcessing = true;

      console.log('Mixed audio stream created');
      return this.mixedStream;

    } catch (error) {
      console.error('Failed to create mixed stream:', error);
      throw error;
    }
  }

  // Create audio processing nodes
  createAudioNodes() {
    // Microphone gain control
    this.audioNodes.microphoneGain = this.audioContext.createGain();
    this.audioNodes.microphoneGain.gain.value = this.audioSettings.microphoneVolume;

    // Tab audio gain control
    this.audioNodes.tabAudioGain = this.audioContext.createGain();
    this.audioNodes.tabAudioGain.gain.value = this.audioSettings.tabAudioVolume;

    // Microphone filter (noise reduction)
    this.audioNodes.microphoneFilter = this.audioContext.createBiquadFilter();
    this.audioNodes.microphoneFilter.type = 'highpass';
    this.audioNodes.microphoneFilter.frequency.value = 80; // Remove low-frequency noise

    // Tab audio filter (equalization)
    this.audioNodes.tabAudioFilter = this.audioContext.createBiquadFilter();
    this.audioNodes.tabAudioFilter.type = 'peaking';
    this.audioNodes.tabAudioFilter.frequency.value = 1000;
    this.audioNodes.tabAudioFilter.Q.value = 1;
    this.audioNodes.tabAudioFilter.gain.value = 0;

    // Audio compressor
    this.audioNodes.compressor = this.audioContext.createDynamicsCompressor();
    this.audioNodes.compressor.threshold.value = -24;
    this.audioNodes.compressor.knee.value = 30;
    this.audioNodes.compressor.ratio.value = 12;
    this.audioNodes.compressor.attack.value = 0.003;
    this.audioNodes.compressor.release.value = 0.25;

    // Audio limiter
    this.audioNodes.limiter = this.audioContext.createDynamicsCompressor();
    this.audioNodes.limiter.threshold.value = -3;
    this.audioNodes.limiter.knee.value = 0;
    this.audioNodes.limiter.ratio.value = 20;
    this.audioNodes.limiter.attack.value = 0.001;
    this.audioNodes.limiter.release.value = 0.01;

    // Mixer (gain node for final mixing)
    this.audioNodes.mixer = this.audioContext.createGain();
    this.audioNodes.mixer.gain.value = 1.0;
  }

  // Update microphone volume
  setMicrophoneVolume(volume) {
    this.audioSettings.microphoneVolume = Math.max(0, Math.min(2, volume));
    if (this.audioNodes.microphoneGain) {
      this.audioNodes.microphoneGain.gain.value = this.audioSettings.microphoneVolume;
    }
  }

  // Update tab audio volume
  setTabAudioVolume(volume) {
    this.audioSettings.tabAudioVolume = Math.max(0, Math.min(2, volume));
    if (this.audioNodes.tabAudioGain) {
      this.audioNodes.tabAudioGain.gain.value = this.audioSettings.tabAudioVolume;
    }
  }

  // Mute/unmute microphone
  setMicrophoneMuted(muted) {
    this.audioSettings.microphoneMuted = muted;
    if (this.audioNodes.microphoneGain) {
      this.audioNodes.microphoneGain.gain.value = muted ? 0 : this.audioSettings.microphoneVolume;
    }
  }

  // Mute/unmute tab audio
  setTabAudioMuted(muted) {
    this.audioSettings.tabAudioMuted = muted;
    if (this.audioNodes.tabAudioGain) {
      this.audioNodes.tabAudioGain.gain.value = muted ? 0 : this.audioSettings.tabAudioVolume;
    }
  }

  // Enable/disable noise reduction
  setNoiseReduction(enabled) {
    this.audioSettings.noiseReduction = enabled;
    if (this.audioNodes.microphoneFilter) {
      this.audioNodes.microphoneFilter.frequency.value = enabled ? 80 : 20;
    }
  }

  // Get audio levels for visualization
  getAudioLevels() {
    if (!this.audioContext || !this.isProcessing) {
      return { microphone: 0, tabAudio: 0, mixed: 0 };
    }

    // Create analyser nodes for level detection
    const microphoneAnalyser = this.audioContext.createAnalyser();
    const tabAudioAnalyser = this.audioContext.createAnalyser();
    const mixedAnalyser = this.audioContext.createAnalyser();

    microphoneAnalyser.fftSize = 256;
    tabAudioAnalyser.fftSize = 256;
    mixedAnalyser.fftSize = 256;

    // Connect analysers
    if (this.audioNodes.microphoneGain) {
      this.audioNodes.microphoneGain.connect(microphoneAnalyser);
    }
    if (this.audioNodes.tabAudioGain) {
      this.audioNodes.tabAudioGain.connect(tabAudioAnalyser);
    }
    if (this.audioNodes.limiter) {
      this.audioNodes.limiter.connect(mixedAnalyser);
    }

    // Get audio levels
    const microphoneLevel = this.getAudioLevel(microphoneAnalyser);
    const tabAudioLevel = this.getAudioLevel(tabAudioAnalyser);
    const mixedLevel = this.getAudioLevel(mixedAnalyser);

    return {
      microphone: microphoneLevel,
      tabAudio: tabAudioLevel,
      mixed: mixedLevel
    };
  }

  // Get audio level from analyser
  getAudioLevel(analyser) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length / 255; // Normalize to 0-1
  }

  // Apply audio effects
  applyAudioEffects(effects) {
    try {
      if (effects.reverb) {
        this.addReverbEffect(effects.reverb);
      }
      if (effects.echo) {
        this.addEchoEffect(effects.echo);
      }
      if (effects.equalizer) {
        this.applyEqualizer(effects.equalizer);
      }
      if (effects.normalize) {
        this.normalizeAudio();
      }

      console.log('Audio effects applied:', effects);

    } catch (error) {
      console.error('Failed to apply audio effects:', error);
    }
  }

  // Add reverb effect
  addReverbEffect(reverbSettings) {
    const convolver = this.audioContext.createConvolver();
    const impulseBuffer = this.createReverbImpulse(reverbSettings);
    convolver.buffer = impulseBuffer;

    // Insert reverb in the chain
    this.audioNodes.mixer.disconnect();
    this.audioNodes.mixer.connect(convolver);
    convolver.connect(this.audioNodes.compressor);
  }

  // Create reverb impulse
  createReverbImpulse(settings) {
    const length = this.audioContext.sampleRate * settings.duration;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, settings.decay);
      }
    }

    return impulse;
  }

  // Add echo effect
  addEchoEffect(echoSettings) {
    const delay = this.audioContext.createDelay(echoSettings.maxDelay);
    const feedback = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();

    delay.delayTime.value = echoSettings.delay;
    feedback.gain.value = echoSettings.feedback;
    wetGain.gain.value = echoSettings.wetLevel;

    // Create echo loop
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);

    // Insert echo in the chain
    this.audioNodes.mixer.connect(delay);
    wetGain.connect(this.audioNodes.compressor);
  }

  // Apply equalizer
  applyEqualizer(eqSettings) {
    const filters = [];

    // Create multiple band filters
    eqSettings.bands.forEach(band => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.Q.value = band.Q;
      filter.gain.value = band.gain;
      filters.push(filter);
    });

    // Chain filters
    let currentNode = this.audioNodes.mixer;
    filters.forEach(filter => {
      currentNode.connect(filter);
      currentNode = filter;
    });
    currentNode.connect(this.audioNodes.compressor);
  }

  // Normalize audio levels
  normalizeAudio() {
    // This would analyze the audio and adjust gain accordingly
    // For now, just ensure levels are within acceptable range
    if (this.audioNodes.limiter) {
      this.audioNodes.limiter.threshold.value = -6; // More aggressive limiting
    }
  }

  // Get audio settings
  getAudioSettings() {
    return { ...this.audioSettings };
  }

  // Update audio settings
  updateAudioSettings(newSettings) {
    this.audioSettings = { ...this.audioSettings, ...newSettings };
    
    // Apply settings to audio nodes
    if (newSettings.microphoneVolume !== undefined) {
      this.setMicrophoneVolume(newSettings.microphoneVolume);
    }
    if (newSettings.tabAudioVolume !== undefined) {
      this.setTabAudioVolume(newSettings.tabAudioVolume);
    }
    if (newSettings.microphoneMuted !== undefined) {
      this.setMicrophoneMuted(newSettings.microphoneMuted);
    }
    if (newSettings.tabAudioMuted !== undefined) {
      this.setTabAudioMuted(newSettings.tabAudioMuted);
    }
    if (newSettings.noiseReduction !== undefined) {
      this.setNoiseReduction(newSettings.noiseReduction);
    }
  }

  // Cleanup audio resources
  cleanup() {
    this.isProcessing = false;

    // Stop all tracks
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }

    if (this.tabAudioStream) {
      this.tabAudioStream.getTracks().forEach(track => track.stop());
      this.tabAudioStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clear audio nodes
    this.audioNodes = {
      microphoneGain: null,
      tabAudioGain: null,
      microphoneFilter: null,
      tabAudioFilter: null,
      compressor: null,
      limiter: null,
      mixer: null
    };

    this.mixedStream = null;
    console.log('Audio processor cleaned up');
  }

  // Get audio processing status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      hasMicrophone: !!this.microphoneStream,
      hasTabAudio: !!this.tabAudioStream,
      hasMixedStream: !!this.mixedStream,
      audioContextState: this.audioContext?.state,
      settings: this.audioSettings
    };
  }
}

// Global instance
const advancedAudioProcessor = new AdvancedAudioProcessor();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedAudioProcessor, advancedAudioProcessor };
}
