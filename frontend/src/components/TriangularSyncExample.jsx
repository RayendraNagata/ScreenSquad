import React, { useEffect, useRef } from 'react';
import useTriangularSync from '../hooks/useTriangularSync';

/**
 * Example component demonstrating triangular sync usage
 */
const TriangularSyncExample = () => {
  const videoRef = useRef(null);
  const {
    measureTriangularLatency,
    adjustPlayback,
    performTriangularSync,
    startAutoSync,
    stopAutoSync,
    getLatencyStats
  } = useTriangularSync();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Start auto sync when video is ready
      video.addEventListener('loadeddata', () => {
        startAutoSync(video, 3000); // Sync every 3 seconds
      });

      // Stop auto sync when component unmounts
      return () => {
        stopAutoSync();
      };
    }
  }, [startAutoSync, stopAutoSync]);

  const handleManualSync = async () => {
    if (videoRef.current) {
      const result = await performTriangularSync(videoRef.current);
      console.log('Manual sync result:', result);
      
      if (result.applied) {
        alert(`Sync applied! Correction: ${result.correction.toFixed(2)}ms`);
      } else {
        alert(`No sync needed. Latency: ${result.latency.toFixed(2)}ms`);
      }
    }
  };

  const handleLatencyTest = async () => {
    const latencyResult = await measureTriangularLatency();
    if (latencyResult) {
      const stats = getLatencyStats();
      alert(`
        Current Latency: ${latencyResult.latency.toFixed(2)}ms
        Average: ${stats.average.toFixed(2)}ms
        Jitter: ${stats.jitter.toFixed(2)}ms
        Samples: ${stats.samples}
      `);
    }
  };

  const handleAdjustPlayback = () => {
    if (videoRef.current) {
      const result = adjustPlayback(videoRef.current);
      console.log('Playback adjustment:', result);
      
      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert(`
          Adjusted Position: ${result.adjustedPosition.toFixed(3)}s
          Latency: ${result.latency.toFixed(2)}ms
          Correction: ${result.correction.toFixed(2)}ms
          Applied: ${result.applied}
        `);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Triangular Sync Demo</h2>
      
      <video
        ref={videoRef}
        className="w-full max-w-md mb-4"
        controls
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
      
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleManualSync}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Manual Sync
        </button>
        
        <button
          onClick={handleLatencyTest}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Latency
        </button>
        
        <button
          onClick={handleAdjustPlayback}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Adjust Playback
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>• Auto-sync runs every 3 seconds when video is playing</p>
        <p>• Triangular method: (t3 - t1) / 2 for precise latency</p>
        <p>• Maximum correction: 500ms threshold</p>
        <p>• Ring buffer stores last 5 latency measurements</p>
      </div>
    </div>
  );
};

export default TriangularSyncExample;
