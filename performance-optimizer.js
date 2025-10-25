// NanoCap Performance Optimization System
// Comprehensive performance monitoring and optimization

class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      cpu: { current: 0, average: 0, peak: 0 },
      memory: { current: 0, average: 0, peak: 0 },
      recording: { duration: 0, fileSize: 0, compressionRatio: 0 },
      system: { cores: 0, memory: 0, browser: '' }
    };
    this.optimizationSettings = {
      adaptiveQuality: true,
      memoryManagement: true,
      cpuThrottling: true,
      backgroundOptimization: true
    };
    this.monitoringInterval = null;
    this.isOptimizing = false;
  }

  // Initialize performance monitoring
  async initialize() {
    try {
      // Get system information
      this.metrics.system = await this.getSystemInfo();
      
      // Start performance monitoring
      this.startMonitoring();
      
      // Apply initial optimizations
      await this.applyInitialOptimizations();
      
      console.log('Performance optimizer initialized');
      return true;

    } catch (error) {
      console.error('Failed to initialize performance optimizer:', error);
      throw error;
    }
  }

  // Get system information
  async getSystemInfo() {
    return {
      cores: navigator.hardwareConcurrency || 4,
      memory: navigator.deviceMemory || 4,
      browser: this.getBrowserInfo(),
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };
  }

  // Get browser information
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) {
      const version = userAgent.match(/Chrome\/(\d+)/);
      return `Chrome ${version ? version[1] : 'Unknown'}`;
    } else if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/(\d+)/);
      return `Firefox ${version ? version[1] : 'Unknown'}`;
    } else if (userAgent.includes('Safari')) {
      const version = userAgent.match(/Version\/(\d+)/);
      return `Safari ${version ? version[1] : 'Unknown'}`;
    }
    return 'Unknown Browser';
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
      this.checkOptimizationTriggers();
    }, 1000); // Monitor every second

    console.log('Performance monitoring started');
  }

  // Stop performance monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Performance monitoring stopped');
    }
  }

  // Update performance metrics
  updateMetrics() {
    // CPU usage estimation (simplified)
    this.metrics.cpu.current = this.estimateCPUUsage();
    this.updateAverage('cpu', this.metrics.cpu.current);
    this.updatePeak('cpu', this.metrics.cpu.current);

    // Memory usage
    if (performance.memory) {
      this.metrics.memory.current = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      this.updateAverage('memory', this.metrics.memory.current);
      this.updatePeak('memory', this.metrics.memory.current);
    }

    // Send metrics to popup if available
    this.sendMetricsToPopup();
  }

  // Estimate CPU usage (simplified method)
  estimateCPUUsage() {
    const start = performance.now();
    let iterations = 0;
    const maxIterations = 100000;
    
    while (performance.now() - start < 1 && iterations < maxIterations) {
      iterations++;
    }
    
    // Higher iterations = lower CPU usage
    const cpuUsage = Math.max(0, 100 - (iterations / maxIterations) * 100);
    return Math.round(cpuUsage);
  }

  // Update average metric
  updateAverage(metric, value) {
    if (!this.metrics[metric].history) {
      this.metrics[metric].history = [];
    }
    
    this.metrics[metric].history.push(value);
    
    // Keep only last 60 values (1 minute)
    if (this.metrics[metric].history.length > 60) {
      this.metrics[metric].history.shift();
    }
    
    // Calculate average
    const sum = this.metrics[metric].history.reduce((a, b) => a + b, 0);
    this.metrics[metric].average = sum / this.metrics[metric].history.length;
  }

  // Update peak metric
  updatePeak(metric, value) {
    if (value > this.metrics[metric].peak) {
      this.metrics[metric].peak = value;
    }
  }

  // Check optimization triggers
  checkOptimizationTriggers() {
    if (!this.optimizationSettings.adaptiveQuality) return;

    // High CPU usage trigger
    if (this.metrics.cpu.current > 80) {
      this.triggerCPUOptimization();
    }

    // High memory usage trigger
    if (this.metrics.memory.current > 500) { // 500MB
      this.triggerMemoryOptimization();
    }

    // Sustained high usage trigger
    if (this.metrics.cpu.average > 70 && this.metrics.memory.average > 400) {
      this.triggerSustainedOptimization();
    }
  }

  // Trigger CPU optimization
  triggerCPUOptimization() {
    console.log('High CPU usage detected, applying optimizations');
    
    // Reduce recording quality
    this.reduceRecordingQuality();
    
    // Enable CPU throttling
    this.enableCPUThrottling();
    
    // Notify user
    this.notifyOptimization('CPU optimization applied due to high usage');
  }

  // Trigger memory optimization
  triggerMemoryOptimization() {
    console.log('High memory usage detected, applying optimizations');
    
    // Clear unnecessary data
    this.clearMemoryCache();
    
    // Reduce buffer sizes
    this.reduceBufferSizes();
    
    // Notify user
    this.notifyOptimization('Memory optimization applied due to high usage');
  }

  // Trigger sustained optimization
  triggerSustainedOptimization() {
    console.log('Sustained high usage detected, applying comprehensive optimizations');
    
    // Apply all optimizations
    this.reduceRecordingQuality();
    this.enableCPUThrottling();
    this.clearMemoryCache();
    this.reduceBufferSizes();
    
    // Notify user
    this.notifyOptimization('Comprehensive optimization applied due to sustained high usage');
  }

  // Reduce recording quality
  reduceRecordingQuality() {
    // This would communicate with the recording system
    // to reduce quality settings
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_OPTIMIZATION',
      action: 'reduceQuality',
      reason: 'highCPU'
    });
  }

  // Enable CPU throttling
  enableCPUThrottling() {
    // Implement CPU throttling mechanisms
    this.optimizationSettings.cpuThrottling = true;
    
    // Reduce processing frequency
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = setInterval(() => {
        this.updateMetrics();
        this.checkOptimizationTriggers();
      }, 2000); // Reduce to every 2 seconds
    }
  }

  // Clear memory cache
  clearMemoryCache() {
    // Clear unnecessary data structures
    if (this.metrics.cpu.history) {
      this.metrics.cpu.history = this.metrics.cpu.history.slice(-30); // Keep only last 30
    }
    if (this.metrics.memory.history) {
      this.metrics.memory.history = this.metrics.memory.history.slice(-30);
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Reduce buffer sizes
  reduceBufferSizes() {
    // This would communicate with the recording system
    // to reduce buffer sizes
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_OPTIMIZATION',
      action: 'reduceBuffers',
      reason: 'highMemory'
    });
  }

  // Apply initial optimizations
  async applyInitialOptimizations() {
    const systemInfo = this.metrics.system;
    
    // Low-end system optimizations
    if (systemInfo.cores < 4 || systemInfo.memory < 8) {
      this.optimizeForLowEndSystem();
    }
    
    // High-end system optimizations
    if (systemInfo.cores >= 8 && systemInfo.memory >= 16) {
      this.optimizeForHighEndSystem();
    }
    
    // Browser-specific optimizations
    this.applyBrowserOptimizations();
  }

  // Optimize for low-end systems
  optimizeForLowEndSystem() {
    console.log('Optimizing for low-end system');
    
    this.optimizationSettings.adaptiveQuality = true;
    this.optimizationSettings.memoryManagement = true;
    this.optimizationSettings.cpuThrottling = true;
    
    // Reduce default quality
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_OPTIMIZATION',
      action: 'setDefaultQuality',
      quality: 'ultra-low'
    });
  }

  // Optimize for high-end systems
  optimizeForHighEndSystem() {
    console.log('Optimizing for high-end system');
    
    this.optimizationSettings.adaptiveQuality = false;
    this.optimizationSettings.memoryManagement = false;
    this.optimizationSettings.cpuThrottling = false;
    
    // Enable high quality by default
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_OPTIMIZATION',
      action: 'setDefaultQuality',
      quality: 'high'
    });
  }

  // Apply browser-specific optimizations
  applyBrowserOptimizations() {
    const browser = this.metrics.system.browser;
    
    if (browser.includes('Chrome')) {
      // Chrome-specific optimizations
      this.enableChromeOptimizations();
    } else if (browser.includes('Firefox')) {
      // Firefox-specific optimizations
      this.enableFirefoxOptimizations();
    } else if (browser.includes('Safari')) {
      // Safari-specific optimizations
      this.enableSafariOptimizations();
    }
  }

  // Enable Chrome optimizations
  enableChromeOptimizations() {
    // Chrome has better WebAssembly support
    this.optimizationSettings.ffmpegWasm = true;
    this.optimizationSettings.av1Codec = true;
  }

  // Enable Firefox optimizations
  enableFirefoxOptimizations() {
    // Firefox has different performance characteristics
    this.optimizationSettings.memoryManagement = true;
    this.optimizationSettings.cpuThrottling = true;
  }

  // Enable Safari optimizations
  enableSafariOptimizations() {
    // Safari has limited WebAssembly support
    this.optimizationSettings.ffmpegWasm = false;
    this.optimizationSettings.av1Codec = false;
  }

  // Send metrics to popup
  sendMetricsToPopup() {
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_METRICS',
      metrics: this.metrics,
      settings: this.optimizationSettings
    });
  }

  // Notify user of optimization
  notifyOptimization(message) {
    chrome.runtime.sendMessage({
      type: 'PERFORMANCE_NOTIFICATION',
      message: message,
      metrics: this.metrics
    });
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    
    if (this.metrics.cpu.average > 70) {
      recommendations.push({
        type: 'cpu',
        message: 'High CPU usage detected. Consider reducing recording quality.',
        action: 'reduceQuality'
      });
    }
    
    if (this.metrics.memory.average > 400) {
      recommendations.push({
        type: 'memory',
        message: 'High memory usage detected. Consider closing other applications.',
        action: 'freeMemory'
      });
    }
    
    if (this.metrics.cpu.peak > 90) {
      recommendations.push({
        type: 'peak',
        message: 'Peak CPU usage very high. System may become unresponsive.',
        action: 'emergencyOptimization'
      });
    }
    
    return recommendations;
  }

  // Get performance report
  getPerformanceReport() {
    return {
      metrics: this.metrics,
      settings: this.optimizationSettings,
      recommendations: this.getPerformanceRecommendations(),
      systemInfo: this.metrics.system,
      timestamp: Date.now()
    };
  }

  // Cleanup resources
  cleanup() {
    this.stopMonitoring();
    this.metrics = null;
    this.optimizationSettings = null;
    console.log('Performance optimizer cleaned up');
  }
}

// Global instance
const performanceOptimizer = new PerformanceOptimizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceOptimizer, performanceOptimizer };
}
