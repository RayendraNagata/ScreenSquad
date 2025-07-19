import { useCallback, useRef, useEffect } from 'react';
import useVideoStore from '../store/videoStore';
import useSocketStore from '../store/socketStore';

/**
 * Custom hook for triangular method video synchronization
 * Implements precise latency measurement and playback adjustment
 */
export const useTriangularSync = () => {
  const videoStore = useVideoStore();
  const socketStore = useSocketStore();
  const syncIntervalRef = useRef(null);
  const videoRef = useRef(null);

  /**
   * Measure latency using triangular method
   * Client sends t1 -> Server responds with t1 + t2 -> Client calculates (t3 - t1)/2
   * @returns {Promise<Object|null>} Triangular latency result or null
   */
  const measureTriangularLatency = useCallback(async () => {
    if (!socketStore.isConnected || !socketStore.socket) {
      console.warn('Socket not connected for triangular latency measurement');
      return null;
    }

    try {
      const result = await videoStore.measureTriangularLatency(socketStore);
      console.log(`Triangular latency: ${result.latency.toFixed(2)}ms, RTT: ${result.roundTripTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      console.error('Triangular latency measurement failed:', error);
      return null;
    }
  }, [videoStore, socketStore]);

  /**
   * Adjust video playback position based on measured latency
   * Uses formula: newPosition = currentPosition + (latency * playbackRate)
   * Maximum correction: 500ms
   * @param {HTMLVideoElement} [video] - Video element to adjust
   * @returns {Object} SyncResult object
   */
  const adjustPlayback = useCallback((video) => {
    const targetVideo = video || videoRef.current;
    
    if (!targetVideo) {
      return {
        adjustedPosition: 0,
        latency: 0,
        correction: 0,
        applied: false,
        error: 'No video element provided'
      };
    }

    return videoStore.adjustPlayback(targetVideo);
  }, [videoStore]);

  /**
   * Perform complete triangular sync cycle
   * 1. Measure latency using triangular method
   * 2. Adjust playback position
   * 3. Return comprehensive sync result
   * @param {HTMLVideoElement} [video] - Video element to sync
   * @returns {Promise<Object>} SyncResult object
   */
  const performTriangularSync = useCallback(async (video) => {
    try {
      // Step 1: Measure latency
      const latencyResult = await measureTriangularLatency();
      
      if (!latencyResult) {
        return {
          adjustedPosition: video?.currentTime || 0,
          latency: 0,
          correction: 0,
          applied: false,
          error: 'Failed to measure latency'
        };
      }

      // Step 2: Adjust playback
      const syncResult = adjustPlayback(video);
      
      // Step 3: Return enhanced result with triangular data
      return {
        ...syncResult,
        latency: latencyResult.latency
      };
      
    } catch (error) {
      console.error('Triangular sync failed:', error);
      return {
        adjustedPosition: video?.currentTime || 0,
        latency: 0,
        correction: 0,
        applied: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [measureTriangularLatency, adjustPlayback]);

  /**
   * Start automatic triangular sync with specified interval
   * @param {HTMLVideoElement} video - Video element to sync
   * @param {number} [intervalMs=5000] - Sync interval in milliseconds
   */
  const startAutoSync = useCallback((video, intervalMs = 5000) => {
    videoRef.current = video;
    
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      if (videoStore.isPlaying && socketStore.isConnected) {
        const result = await performTriangularSync(video);
        
        if (result.applied) {
          console.log(`Auto-sync applied: ${result.correction.toFixed(2)}ms correction`);
        }
      }
    }, intervalMs);

    console.log(`Auto triangular sync started with ${intervalMs}ms interval`);
  }, [videoStore.isPlaying, socketStore.isConnected, performTriangularSync]);

  /**
   * Stop automatic sync
   */
  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
      console.log('Auto triangular sync stopped');
    }
  }, []);

  /**
   * Get current latency statistics from ring buffer
   * @returns {Object} Latency statistics
   */
  const getLatencyStats = useCallback(() => {
    const buffer = videoStore.latencyRingBuffer;
    const validMeasurements = buffer.buffer.slice(0, buffer.size);
    
    if (validMeasurements.length === 0) {
      return {
        average: 0,
        min: 0,
        max: 0,
        samples: 0,
        jitter: 0
      };
    }

    const average = validMeasurements.reduce((sum, l) => sum + l, 0) / validMeasurements.length;
    const min = Math.min(...validMeasurements);
    const max = Math.max(...validMeasurements);
    
    // Calculate jitter (standard deviation)
    const variance = validMeasurements.reduce((sum, l) => sum + Math.pow(l - average, 2), 0) / validMeasurements.length;
    const jitter = Math.sqrt(variance);

    return {
      average,
      min,
      max,
      samples: validMeasurements.length,
      jitter
    };
  }, [videoStore.latencyRingBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSync();
    };
  }, [stopAutoSync]);

  return {
    measureTriangularLatency,
    adjustPlayback,
    performTriangularSync,
    startAutoSync,
    stopAutoSync,
    getLatencyStats,
    latencyRingBuffer: videoStore.latencyRingBuffer,
    averageLatency: videoStore.averageLatency
  };
};

export default useTriangularSync;
