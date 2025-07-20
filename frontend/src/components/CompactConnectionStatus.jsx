import React from 'react';
import { Wifi, WifiOff, Activity, Signal } from 'lucide-react';
import useSocketStore from '../store/socketStore';
import useVideoStore from '../store/videoStore';
import { usePlaybackState } from '../hooks/useGlobalStore';

/**
 * CompactConnectionStatus - Versi compact untuk Navbar
 */
const CompactConnectionStatus = ({ className = '' }) => {
  const { isConnected, latency } = useSocketStore();
  const { averageLatency, syncDrift, workerInitialized } = useVideoStore();
  const { isBuffering, isLoading } = usePlaybackState();

  // Calculate status
  const getStatus = () => {
    if (!isConnected) return 'offline';
    if (isBuffering || isLoading) return 'buffering';
    if (latency > 200) return 'poor';
    if (latency > 100) return 'fair';
    return 'excellent';
  };

  const status = getStatus();

  // Status configurations
  const statusConfig = {
    excellent: {
      color: 'text-green-400',
      icon: Wifi,
      bgColor: 'bg-green-400'
    },
    fair: {
      color: 'text-yellow-400',
      icon: Signal,
      bgColor: 'bg-yellow-400'
    },
    poor: {
      color: 'text-orange-400',
      icon: Signal,
      bgColor: 'bg-orange-400'
    },
    buffering: {
      color: 'text-blue-400',
      icon: Activity,
      bgColor: 'bg-blue-400'
    },
    offline: {
      color: 'text-red-400',
      icon: WifiOff,
      bgColor: 'bg-red-400'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Format latency
  const formatLatency = (ms) => {
    if (ms === null || ms === undefined || isNaN(ms)) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Indicator */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.bgColor} ${
          status === 'excellent' ? 'animate-pulse' : 
          status === 'buffering' ? 'animate-ping' : ''
        }`} />
        
        {/* WebWorker indicator */}
        {workerInitialized && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full" />
        )}
      </div>

      {/* Latency Display */}
      <span className={`text-xs font-medium ${config.color}`}>
        {isConnected ? formatLatency(latency) : 'Offline'}
      </span>

      {/* Sync Status (optional, for detailed view) */}
      {isConnected && Math.abs(syncDrift) > 0.1 && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-xs text-orange-400">
            {Math.round(Math.abs(syncDrift) * 1000)}ms
          </span>
        </div>
      )}
    </div>
  );
};

export default CompactConnectionStatus;
