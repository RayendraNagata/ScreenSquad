/**
 * Video Sync Worker Manager
 * Interface untuk berinteraksi dengan VideoSyncWorker
 */

class VideoSyncWorkerManager {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.messageCallbacks = new Map();
    this.messageId = 0;
    this.eventListeners = new Map();
  }

  /**
   * Initialize WebWorker
   */
  async init(config = {}) {
    try {
      // Create worker dari file di public folder
      this.worker = new Worker('/videoSyncWorker.js');
      
      // Setup message listener
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event);
      };
      
      // Setup error handler
      this.worker.onerror = (error) => {
        console.error('VideoSync Worker Error:', error);
        this.emit('error', { message: error.message, type: 'WORKER_ERROR' });
      };
      
      // Initialize worker dengan config
      const initPromise = this.sendMessage('INIT', { config });
      
      // Wait for worker ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 5000);
        
        this.once('WORKER_READY', () => {
          clearTimeout(timeout);
          this.isInitialized = true;
          resolve();
        });
        
        this.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      await initPromise;
      
      console.log('VideoSync Worker initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize VideoSync Worker:', error);
      throw error;
    }
  }

  /**
   * Calculate triangular latency measurement
   */
  async calculateLatency(pingTime, serverTime, pongTime) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('CALCULATE_LATENCY', {
      pingTime,
      serverTime,
      pongTime
    });
  }

  /**
   * Calculate video drift
   */
  async calculateDrift(expectedTime, actualTime, playbackRate = 1) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('CALCULATE_DRIFT', {
      expectedTime,
      actualTime,
      playbackRate
    });
  }

  /**
   * Calculate playback adjustment
   */
  async calculateAdjustment(currentTime, targetTime, latency, playbackRate = 1) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('CALCULATE_ADJUSTMENT', {
      currentTime,
      targetTime,
      latency,
      playbackRate
    });
  }

  /**
   * Get sync statistics
   */
  async getStats() {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('GET_STATS', {});
  }

  /**
   * Update worker configuration
   */
  async updateConfig(config) {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('UPDATE_CONFIG', { config });
  }

  /**
   * Clear history
   */
  async clearHistory() {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized');
    }

    return this.sendMessage('CLEAR_HISTORY', {});
  }

  /**
   * Send message to worker dengan promise-based response
   */
  sendMessage(type, data) {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const messageId = ++this.messageId;
      const timeoutId = setTimeout(() => {
        this.messageCallbacks.delete(messageId);
        reject(new Error(`Message timeout: ${type}`));
      }, 10000); // 10 second timeout

      this.messageCallbacks.set(messageId, {
        resolve,
        reject,
        timeoutId,
        type
      });

      this.worker.postMessage({
        type,
        data,
        messageId
      });
    });
  }

  /**
   * Handle messages dari worker
   */
  handleWorkerMessage(event) {
    const { type, data, messageId } = event.data;

    // Handle callback messages (responses to sendMessage)
    if (messageId && this.messageCallbacks.has(messageId)) {
      const callback = this.messageCallbacks.get(messageId);
      clearTimeout(callback.timeoutId);
      this.messageCallbacks.delete(messageId);

      if (type === 'ERROR') {
        callback.reject(new Error(data.message));
      } else {
        callback.resolve(data);
      }
      return;
    }

    // Handle event messages
    this.emit(type, data);
  }

  /**
   * Event listener methods
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    this.on(event, onceCallback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Utility method untuk comprehensive sync calculation
   */
  async performFullSync(syncData) {
    try {
      const {
        currentTime,
        targetTime,
        pingTime,
        serverTime,
        pongTime,
        playbackRate = 1
      } = syncData;

      // Calculate latency
      const latencyResult = await this.calculateLatency(pingTime, serverTime, pongTime);
      
      // Calculate drift if we have the necessary data
      let driftResult = null;
      if (currentTime !== undefined && targetTime !== undefined) {
        driftResult = await this.calculateDrift(targetTime, currentTime, playbackRate);
      }
      
      // Calculate adjustment
      const adjustmentResult = await this.calculateAdjustment(
        currentTime,
        targetTime,
        latencyResult.networkLatency,
        playbackRate
      );

      return {
        latency: latencyResult,
        drift: driftResult,
        adjustment: adjustmentResult,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in performFullSync:', error);
      throw error;
    }
  }

  /**
   * Cleanup method
   */
  destroy() {
    if (this.worker) {
      this.sendMessage('STOP', {}).catch(() => {
        // Ignore errors during shutdown
      });
      
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isInitialized = false;
    this.messageCallbacks.clear();
    this.eventListeners.clear();
  }

  /**
   * Check if worker is ready
   */
  isReady() {
    return this.isInitialized && this.worker !== null;
  }
}

export default VideoSyncWorkerManager;
