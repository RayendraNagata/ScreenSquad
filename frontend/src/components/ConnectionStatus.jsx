import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Activity, Clock, Eye, EyeOff, Signal } from 'lucide-react';
import useSocketStore from '../store/socketStore';
import useVideoStore from '../store/videoStore';
import { usePlaybackState } from '../hooks/useGlobalStore';

/**
 * ConnectionStatus Component
 * Menampilkan status koneksi, latency, buffering, dan sync status
 */
const ConnectionStatus = ({ 
  position = 'top-right', 
  showDetails = false,
  autoHide = true,
  className = '' 
}) => {
  const { isConnected, latency, getConnectionStatus } = useSocketStore();
  const { averageLatency, syncDrift, workerInitialized } = useVideoStore();
  const { isBuffering, isLoading } = usePlaybackState();
  
  const [isExpanded, setIsExpanded] = useState(!autoHide);
  const [showTooltip, setShowTooltip] = useState(false);

  // Get connection status details
  const connectionStatus = getConnectionStatus();

  // Calculate overall status
  const getOverallStatus = () => {
    if (!isConnected) return 'offline';
    if (isBuffering || isLoading) return 'buffering';
    if (latency > 200) return 'poor';
    if (latency > 100) return 'fair';
    return 'excellent';
  };

  const overallStatus = getOverallStatus();

  // Status configurations
  const statusConfig = {
    excellent: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      icon: Wifi,
      label: 'Excellent',
      description: 'Perfect connection'
    },
    fair: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      icon: Signal,
      label: 'Fair',
      description: 'Good connection'
    },
    poor: {
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
      icon: Signal,
      label: 'Poor',
      description: 'Slow connection'
    },
    buffering: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
      icon: Activity,
      label: 'Buffering',
      description: 'Loading content'
    },
    offline: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      icon: WifiOff,
      label: 'Offline',
      description: 'No connection'
    }
  };

  const config = statusConfig[overallStatus];
  const StatusIcon = config.icon;

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  // Format latency display
  const formatLatency = (ms) => {
    if (ms === null || ms === undefined || isNaN(ms)) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  // Format sync drift
  const formatSyncDrift = (drift) => {
    if (drift === null || drift === undefined || isNaN(drift)) return 'N/A';
    const ms = Math.abs(drift * 1000);
    return ms < 1 ? '<1ms' : `${Math.round(ms)}ms`;
  };

  // Get sync status
  const getSyncStatus = () => {
    if (!isConnected) return { label: 'Offline', color: 'text-gray-400' };
    if (Math.abs(syncDrift) < 0.05) return { label: 'Perfect', color: 'text-green-400' };
    if (Math.abs(syncDrift) < 0.1) return { label: 'Good', color: 'text-yellow-400' };
    if (Math.abs(syncDrift) < 0.5) return { label: 'Fair', color: 'text-orange-400' };
    return { label: 'Poor', color: 'text-red-400' };
  };

  const syncStatus = getSyncStatus();

  // Auto-hide logic
  useEffect(() => {
    if (autoHide && overallStatus === 'excellent') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, overallStatus]);

  return (
    <div className={`fixed z-40 ${positionClasses[position]} ${className}`}>
      <AnimatePresence>
        {/* Minimized View */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              onClick={() => setIsExpanded(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${config.bgColor} ${config.borderColor}`}
            >
              <StatusIcon className={`w-4 h-4 ${config.color} ${overallStatus === 'buffering' ? 'animate-spin' : ''}`} />
              <span className={`text-sm font-medium ${config.color}`}>
                {formatLatency(latency)}
              </span>
              {workerInitialized && (
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
              )}
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 right-0 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 min-w-48 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={config.color}>{config.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latency:</span>
                    <span className="text-white">{formatLatency(latency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sync:</span>
                    <span className={syncStatus.color}>{syncStatus.label}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-72 ${config.borderColor}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${config.color} ${overallStatus === 'buffering' ? 'animate-spin' : ''}`} />
                <h3 className="text-lg font-semibold text-white">Connection Status</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Status Overview */}
            <div className={`rounded-lg p-3 mb-4 ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-medium ${config.color}`}>
                    {config.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {config.description}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')} ${overallStatus === 'buffering' ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="space-y-3">
              {/* Network Latency */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Network Latency</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-medium text-white">
                      {formatLatency(latency)}
                    </div>
                    {averageLatency !== latency && (
                      <div className="text-xs text-gray-400">
                        Avg: {formatLatency(averageLatency)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-4 rounded-full ${
                          i < (latency > 200 ? 1 : latency > 100 ? 2 : latency > 50 ? 3 : 4)
                            ? 'bg-green-400'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Buffering State */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className={`w-4 h-4 text-purple-400 ${(isBuffering || isLoading) ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-gray-300">Buffering State</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className={`text-sm font-medium ${
                    (isBuffering || isLoading) ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {isBuffering ? 'Buffering' : isLoading ? 'Loading' : 'Ready'}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    (isBuffering || isLoading) ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                  }`} />
                </div>
              </div>

              {/* Sync Status */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Sync Status</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`text-sm font-medium ${syncStatus.color}`}>
                      {syncStatus.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      Drift: {formatSyncDrift(syncDrift)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-3 rounded-full ${
                          i < (Math.abs(syncDrift) < 0.05 ? 3 : Math.abs(syncDrift) < 0.1 ? 2 : 1)
                            ? syncStatus.color.replace('text-', 'bg-')
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* WebWorker Status */}
              {showDetails && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded" />
                    <span className="text-sm text-gray-300">WebWorker</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className={`text-sm font-medium ${
                      workerInitialized ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {workerInitialized ? 'Active' : 'Inactive'}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      workerInitialized ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                  </div>
                </div>
              )}
            </div>

            {/* Connection Details (if poor connection) */}
            {(overallStatus === 'poor' || overallStatus === 'offline') && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="text-sm text-red-400">
                  {overallStatus === 'offline' 
                    ? 'Check your internet connection'
                    : 'Connection quality is poor. Video sync may be affected.'
                  }
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionStatus;
