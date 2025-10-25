// NanoCap Performance Monitor
// Real-time performance tracking and optimization

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      cpu: { current: 0, average: 0, peak: 0 },
      memory: { current: 0, average: 0, peak: 0 },
      recording: { duration: 0, chunks: 0, size: 0 },
      errors: { count: 0, lastError: null }
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }
  
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updateMetrics();
    }, 1000); // Update every second
    
    console.log('Performance monitoring started');
  }
  
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Performance monitoring stopped');
  }
  
  updateMetrics() {
    // Update CPU usage (estimated)
    this.updateCPUUsage();
    
    // Update memory usage
    this.updateMemoryUsage();
    
    // Update recording metrics
    this.updateRecordingMetrics();
    
    // Check for performance issues
    this.checkPerformanceIssues();
  }
  
  updateCPUUsage() {
    // Estimate CPU usage based on recording state and quality
    const baseCPU = recordingState.isRecording ? 5 : 0;
    const qualityMultiplier = this.getQualityMultiplier();
    const estimatedCPU = baseCPU * qualityMultiplier;
    
    this.metrics.cpu.current = estimatedCPU;
    this.metrics.cpu.average = (this.metrics.cpu.average + estimatedCPU) / 2;
    this.metrics.cpu.peak = Math.max(this.metrics.cpu.peak, estimatedCPU);
  }
  
  updateMemoryUsage() {
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
      this.metrics.memory.current = memoryMB;
      this.metrics.memory.average = (this.metrics.memory.average + memoryMB) / 2;
      this.metrics.memory.peak = Math.max(this.metrics.memory.peak, memoryMB);
    }
  }
  
  updateRecordingMetrics() {
    if (recordingState.isRecording && recordingState.startTime) {
      this.metrics.recording.duration = Date.now() - recordingState.startTime;
      this.metrics.recording.chunks = recordingState.chunks.length;
      this.metrics.recording.size = recordingState.chunks.reduce((total, chunk) => total + chunk.size, 0);
    }
  }
  
  getQualityMultiplier() {
    const quality = qualitySelect?.value || 'balanced';
    const multipliers = {
      'ultra-low': 0.6,
      'low': 0.8,
      'balanced': 1.0,
      'high': 1.5
    };
    return multipliers[quality] || 1.0;
  }
  
  checkPerformanceIssues() {
    // Check for high CPU usage
    if (this.metrics.cpu.current > 30) {
      this.logPerformanceIssue('High CPU usage', this.metrics.cpu.current);
    }
    
    // Check for high memory usage
    if (this.metrics.memory.current > 500) {
      this.logPerformanceIssue('High memory usage', this.metrics.memory.current);
    }
    
    // Check for recording issues
    if (recordingState.isRecording && this.metrics.recording.chunks === 0) {
      this.logPerformanceIssue('No recording chunks', 0);
    }
  }
  
  logPerformanceIssue(type, value) {
    console.warn(`Performance Issue: ${type} - ${value}`);
    this.metrics.errors.count++;
    this.metrics.errors.lastError = { type, value, timestamp: Date.now() };
    
    // Notify popup if possible
    try {
      chrome.runtime.sendMessage({
        type: 'PERFORMANCE_WARNING',
        issue: type,
        value: value
      });
    } catch (error) {
      // Popup might not be available
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      isRecording: recordingState.isRecording
    };
  }
  
  resetMetrics() {
    this.metrics = {
      cpu: { current: 0, average: 0, peak: 0 },
      memory: { current: 0, average: 0, peak: 0 },
      recording: { duration: 0, chunks: 0, size: 0 },
      errors: { count: 0, lastError: null }
    };
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring when recording starts
function startPerformanceMonitoring() {
  performanceMonitor.startMonitoring();
}

// Stop monitoring when recording stops
function stopPerformanceMonitoring() {
  performanceMonitor.stopMonitoring();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor, performanceMonitor };
}
