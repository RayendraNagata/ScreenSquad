import { useEffect, useRef, useCallback } from 'react';
import useVideoStore from '../store/videoStore';
import useSocketStore from '../store/socketStore';

/**
 * Custom hook for managing video drift correction
 * Automatically measures latency and applies corrections
 */
const useDriftCorrection = (enabled = true, interval = 5000) => {
  const videoStore = useVideoStore();
  const socketStore = useSocketStore();
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Latency measurement function
  const measureLatency = useCallback(async () => {
    if (!socketStore.isConnected || !socketStore.socket) return;
    
    try {
      await videoStore.measureLatency(socketStore);
    } catch (error) {
      console.warn('Failed to measure latency:', error);
    }
  }, [videoStore, socketStore]);

  // Request sync from server
  const requestSync = useCallback(() => {
    if (!socketStore.isConnected || !socketStore.socket) return;
    
    socketStore.socket.emit('request-sync', {
      timestamp: Date.now(),
      currentTime: videoStore.currentTime,
      isPlaying: videoStore.isPlaying
    });
  }, [socketStore, videoStore]);

  // Animation frame loop for smooth drift correction
  const driftCorrectionLoop = useCallback(() => {
    if (enabled && videoStore.driftCorrectionActive) {
      videoStore.applyLinearAdjustment();
    }
    
    if (enabled) {
      animationRef.current = requestAnimationFrame(driftCorrectionLoop);
    }
  }, [enabled, videoStore]);

  // Setup periodic latency measurement and sync requests
  useEffect(() => {
    if (!enabled) return;

    // Initial latency measurement
    measureLatency();

    // Setup periodic sync
    intervalRef.current = setInterval(() => {
      measureLatency();
      requestSync();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, measureLatency, requestSync]);

  // Setup animation frame loop
  useEffect(() => {
    if (enabled) {
      animationRef.current = requestAnimationFrame(driftCorrectionLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, driftCorrectionLoop]);

  // Listen for sync responses from server
  useEffect(() => {
    if (!socketStore.socket) return;

    const handleSyncResponse = (data) => {
      const { serverTime, isPlaying, timestamp } = data;
      const latency = Date.now() - timestamp;
      
      // Apply smart sync with measured latency
      const syncResult = videoStore.smartSync(serverTime, isPlaying, latency);
      
      // Log sync events for debugging
      if (syncResult.type !== 'none') {
        console.log(`Sync applied: ${syncResult.type}, drift: ${syncResult.drift.toFixed(3)}s`);
      }
    };

    const handlePong = (data) => {
      // Handled by measureLatency function
    };

    socketStore.socket.on('sync-response', handleSyncResponse);
    socketStore.socket.on('pong', handlePong);

    return () => {
      socketStore.socket?.off('sync-response', handleSyncResponse);
      socketStore.socket?.off('pong', handlePong);
    };
  }, [socketStore.socket, videoStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    measureLatency,
    requestSync,
    getDriftStats: videoStore.getDriftStatistics,
    resetDriftCorrection: videoStore.resetDriftCorrection,
    isActive: videoStore.driftCorrectionActive,
    averageLatency: videoStore.averageLatency,
    currentDrift: videoStore.syncDrift
  };
};

export default useDriftCorrection;
