import React, { useState, useEffect } from 'react';
import useVideoStore from '../store/videoStore';
import { Activity, Cpu, Timer, Zap } from 'lucide-react';

/**
 * WebWorker Debug Monitor
 * Menampilkan status dan performa WebWorker untuk video sync
 */
const WebWorkerDebugMonitor = () => {
  const { 
    workerInitialized, 
    getWorkerStats,
    averageLatency,
    syncDrift 
  } = useVideoStore();
  
  const [workerStats, setWorkerStats] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch worker stats
  const updateStats = async () => {
    try {
      const stats = await getWorkerStats();
      setWorkerStats(stats);
    } catch (error) {
      console.warn('Failed to get worker stats:', error);
      setWorkerStats({ available: false, error: error.message });
    }
  };

  useEffect(() => {
    if (workerInitialized && isExpanded) {
      // Update stats immediately
      updateStats();
      
      // Set up periodic updates
      const interval = setInterval(updateStats, 2000);
      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [workerInitialized, isExpanded]);

  const formatMs = (ms) => {
    if (ms === null || ms === undefined || isNaN(ms)) return 'N/A';
    return `${ms.toFixed(1)}ms`;
  };

  const formatSec = (sec) => {
    if (sec === null || sec === undefined || isNaN(sec)) return 'N/A';
    return `${(sec * 1000).toFixed(1)}ms`;
  };

  const getStatusColor = () => {
    if (!workerInitialized) return 'text-red-400';
    if (workerStats?.available) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getStatusText = () => {
    if (!workerInitialized) return 'Not Initialized';
    if (workerStats?.available) return 'Active';
    return 'Error';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Minimized View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
            workerInitialized 
              ? 'bg-gray-900/80 border-green-500/50 text-green-400' 
              : 'bg-gray-900/80 border-red-500/50 text-red-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="text-sm font-medium">WebWorker</span>
          <div className={`w-2 h-2 rounded-full ${workerInitialized ? 'bg-green-400' : 'bg-red-400'}`} />
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-80 max-w-96">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">WebWorker Monitor</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Status</span>
              </div>
              <div className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">Avg Latency</span>
              </div>
              <div className="text-sm font-medium text-white">
                {formatMs(averageLatency)}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {workerStats?.available && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Performance Metrics
              </h4>

              {/* Latency Stats */}
              {workerStats.latency && (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Latency Statistics</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Min:</span>
                      <span className="text-white ml-1">{formatMs(workerStats.latency.min)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max:</span>
                      <span className="text-white ml-1">{formatMs(workerStats.latency.max)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg:</span>
                      <span className="text-white ml-1">{formatMs(workerStats.latency.average)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Jitter:</span>
                      <span className="text-white ml-1">{formatMs(workerStats.latency.jitter)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Drift Stats */}
              {workerStats.drift && (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Drift Statistics</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white ml-1">{formatSec(syncDrift)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg:</span>
                      <span className="text-white ml-1">{formatSec(workerStats.drift.average)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Variance:</span>
                      <span className="text-white ml-1">{formatSec(workerStats.drift.variance)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Trend:</span>
                      <span className={`ml-1 ${workerStats.drift.trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {workerStats.drift.trend > 0 ? '↗' : '↘'} {formatSec(Math.abs(workerStats.drift.trend))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Counts */}
              <div className="bg-gray-800/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">History</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Latency Samples:</span>
                    <span className="text-white ml-1">{workerStats.latency?.count || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Drift Samples:</span>
                    <span className="text-white ml-1">{workerStats.drift?.count || 0}</span>
                  </div>
                </div>
              </div>

              {/* Config */}
              {workerStats.config && (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-2">Configuration</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Max Correction:</span>
                      <span className="text-white ml-1">{workerStats.config.maxCorrection}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sync Threshold:</span>
                      <span className="text-white ml-1">{workerStats.config.syncThreshold}ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {!workerStats?.available && workerStats?.error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <div className="text-sm text-red-400">
                Error: {workerStats.error}
              </div>
            </div>
          )}

          {/* Not Available State */}
          {!workerStats?.available && !workerStats?.error && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
              <div className="text-sm text-yellow-400">
                {workerStats?.reason || 'WebWorker not available'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebWorkerDebugMonitor;
