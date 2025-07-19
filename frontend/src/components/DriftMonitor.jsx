import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDriftCorrection from '../hooks/useDriftCorrection';

const DriftMonitor = ({ enabled = true, compact = false, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(null);
  
  const {
    getDriftStats,
    isActive,
    averageLatency,
    currentDrift,
    measureLatency,
    resetDriftCorrection
  } = useDriftCorrection(enabled);

  // Update stats every second
  useEffect(() => {
    const updateStats = () => {
      setStats(getDriftStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);

    return () => clearInterval(interval);
  }, [getDriftStats]);

  if (!enabled || !stats) return null;

  const getStatusColor = () => {
    if (stats.averageDrift < 0.1) return 'text-green-500';
    if (stats.averageDrift < 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isActive) return '🔄';
    if (stats.averageDrift < 0.1) return '✅';
    if (stats.averageDrift < 0.5) return '⚠️';
    return '❌';
  };

  const getDriftDisplay = () => {
    return Math.abs(currentDrift * 1000).toFixed(0) + 'ms';
  };

  const getLatencyDisplay = () => {
    return averageLatency.toFixed(0) + 'ms';
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-xs ${className}`}>
        <span className="text-gray-500">Sync:</span>
        <span className={getStatusColor()}>{getDriftDisplay()}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">Latency:</span>
        <span className="text-gray-400">{getLatencyDisplay()}</span>
        <span>{getStatusIcon()}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-800">Video Sync</h3>
            <p className="text-xs text-gray-500">
              Drift: <span className={getStatusColor()}>{getDriftDisplay()}</span>
              {isActive && <span className="ml-1 text-blue-500">(Correcting...)</span>}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500">Latency</p>
          <p className="text-sm font-medium text-gray-700">{getLatencyDisplay()}</p>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Average Drift</p>
                <p className={`font-medium ${getStatusColor()}`}>
                  {(stats.averageDrift * 1000).toFixed(0)}ms
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Max Drift</p>
                <p className="font-medium text-gray-700">
                  {(stats.maxDrift * 1000).toFixed(0)}ms
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Stability</p>
                <p className="font-medium text-gray-700">
                  {(stats.driftStability * 100).toFixed(1)}%
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Samples</p>
                <p className="font-medium text-gray-700">{stats.samples}</p>
              </div>
            </div>

            <div className="flex space-x-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  measureLatency();
                }}
                className="flex-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                Test Latency
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetDriftCorrection();
                }}
                className="flex-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
              >
                Reset Stats
              </button>
            </div>

            {/* Visual drift indicator */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Drift Visualization</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    Math.abs(currentDrift) < 0.1 ? 'bg-green-400' :
                    Math.abs(currentDrift) < 0.5 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(currentDrift) * 100, 100)}%` 
                  }}
                  animate={{ 
                    width: `${Math.min(Math.abs(currentDrift) * 100, 100)}%` 
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0ms</span>
                <span>500ms</span>
                <span>1s+</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriftMonitor;
