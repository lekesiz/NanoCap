// NanoCap v0.3.0 - File System Access API Integration
// Enables unlimited recording length with streaming file writing

class FileSystemRecorder {
  constructor() {
    this.fileHandle = null;
    this.writableStream = null;
    this.isRecording = false;
    this.chunkCount = 0;
    this.totalSize = 0;
    this.startTime = null;
  }

  // Request file handle from user
  async requestFileHandle() {
    try {
      // Check if File System Access API is supported
      if (!('showSaveFilePicker' in window)) {
        throw new Error('File System Access API not supported');
      }

      // Request file handle with suggested name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.fileHandle = await window.showSaveFilePicker({
        suggestedName: `nanocap-recording-${timestamp}.webm`,
        types: [
          {
            description: 'WebM Video Files',
            accept: {
              'video/webm': ['.webm']
            }
          },
          {
            description: 'MP4 Video Files',
            accept: {
              'video/mp4': ['.mp4']
            }
          }
        ]
      });

      console.log('File handle obtained:', this.fileHandle.name);
      return true;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User cancelled file selection');
        return false;
      }
      console.error('Failed to get file handle:', error);
      throw error;
    }
  }

  // Start streaming recording
  async startStreamingRecording(stream, options) {
    try {
      if (!this.fileHandle) {
        throw new Error('No file handle available');
      }

      // Create writable stream
      this.writableStream = await this.fileHandle.createWritable();
      this.isRecording = true;
      this.startTime = Date.now();
      this.chunkCount = 0;
      this.totalSize = 0;

      // Configure MediaRecorder for streaming
      const mimeType = this.selectMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond,
        audioBitsPerSecond: options.audioBitsPerSecond
      });

      // Handle data chunks - write directly to file
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          try {
            await this.writeChunk(event.data);
            this.chunkCount++;
            this.totalSize += event.data.size;
            
            // Update progress
            this.updateProgress();
            
          } catch (error) {
            console.error('Failed to write chunk:', error);
            this.handleError(error);
          }
        }
      };

      // Handle recording stop
      recorder.onstop = async () => {
        try {
          await this.finalizeRecording();
          console.log('Streaming recording completed successfully');
        } catch (error) {
          console.error('Failed to finalize recording:', error);
          this.handleError(error);
        }
      };

      // Handle recording errors
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.handleError(event.error);
      };

      // Start recording with small chunks for streaming
      recorder.start(1000); // 1-second chunks
      console.log('Streaming recording started');

      return recorder;

    } catch (error) {
      console.error('Failed to start streaming recording:', error);
      throw error;
    }
  }

  // Write chunk to file
  async writeChunk(chunk) {
    if (!this.writableStream) {
      throw new Error('No writable stream available');
    }

    // Convert chunk to ArrayBuffer for writing
    const arrayBuffer = await chunk.arrayBuffer();
    await this.writableStream.write(arrayBuffer);
  }

  // Update progress information
  updateProgress() {
    const duration = Date.now() - this.startTime;
    const durationMinutes = duration / (1000 * 60);
    const sizeMB = this.totalSize / (1024 * 1024);
    const avgBitrate = (this.totalSize * 8) / (duration / 1000); // bits per second

    // Send progress update to popup
    chrome.runtime.sendMessage({
      type: 'STREAMING_PROGRESS',
      data: {
        duration: duration,
        durationFormatted: this.formatDuration(duration),
        chunkCount: this.chunkCount,
        totalSize: this.totalSize,
        sizeMB: sizeMB,
        avgBitrate: avgBitrate,
        fileName: this.fileHandle?.name || 'Unknown'
      }
    });
  }

  // Finalize recording
  async finalizeRecording() {
    if (this.writableStream) {
      await this.writableStream.close();
      this.writableStream = null;
    }

    this.isRecording = false;

    // Send completion message
    chrome.runtime.sendMessage({
      type: 'STREAMING_COMPLETED',
      data: {
        fileName: this.fileHandle?.name,
        totalSize: this.totalSize,
        duration: Date.now() - this.startTime,
        chunkCount: this.chunkCount
      }
    });
  }

  // Select optimal MIME type
  selectMimeType() {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
      'video/mp4'
    ];

    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }

  // Format duration for display
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
  }

  // Handle errors
  handleError(error) {
    console.error('FileSystemRecorder error:', error);
    
    chrome.runtime.sendMessage({
      type: 'STREAMING_ERROR',
      error: error.message || 'Unknown streaming error'
    });

    // Cleanup on error
    this.cleanup();
  }

  // Cleanup resources
  async cleanup() {
    this.isRecording = false;
    
    if (this.writableStream) {
      try {
        await this.writableStream.close();
      } catch (error) {
        console.warn('Error closing writable stream:', error);
      }
      this.writableStream = null;
    }

    this.fileHandle = null;
    this.chunkCount = 0;
    this.totalSize = 0;
    this.startTime = null;
  }

  // Get current status
  getStatus() {
    return {
      isRecording: this.isRecording,
      fileName: this.fileHandle?.name,
      chunkCount: this.chunkCount,
      totalSize: this.totalSize,
      duration: this.startTime ? Date.now() - this.startTime : 0
    };
  }
}

// Global instance
const fileSystemRecorder = new FileSystemRecorder();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FileSystemRecorder, fileSystemRecorder };
}
