import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useVideoStore from '../store/videoStore';
import useDriftCorrection from '../hooks/useDriftCorrection';
import Button from './ui/Button';

const DriftSettings = ({ isHost = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const videoStore = useVideoStore();
  const { getDriftStats, resetDriftCorrection } = useDriftCorrection();
  
  const [settings, setSettings] = useState({
    adjustmentRate: videoStore.adjustmentRate,
    maxDriftTolerance: videoStore.maxDriftTolerance,
    minDriftTolerance: videoStore.minDriftTolerance,
    syncInterval: 5000 // milliseconds
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Update video store
    videoStore.adjustmentRate = newSettings.adjustmentRate;
    videoStore.maxDriftTolerance = newSettings.maxDriftTolerance;
    videoStore.minDriftTolerance = newSettings.minDriftTolerance;
  };

  const stats = getDriftStats();

  if (!isHost) {
    return null; // Only show to host
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700"
      >
        ⚙️ Sync Settings
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Drift Correction Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Current Stats */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Avg Drift:</span>
                  <span className="ml-1 font-medium">
                    {(stats.averageDrift * 1000).toFixed(0)}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Max Drift:</span>
                  <span className="ml-1 font-medium">
                    {(stats.maxDrift * 1000).toFixed(0)}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Stability:</span>
                  <span className="ml-1 font-medium">
                    {(stats.driftStability * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Samples:</span>
                  <span className="ml-1 font-medium">{stats.samples}</span>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              {/* Adjustment Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Rate: {(settings.adjustmentRate * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0.005"
                  max="0.1"
                  step="0.005"
                  value={settings.adjustmentRate}
                  onChange={(e) => handleSettingChange('adjustmentRate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Gentle (0.5%)</span>
                  <span>Aggressive (10%)</span>
                </div>
              </div>

              {/* Max Drift Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Drift Tolerance: {(settings.maxDriftTolerance * 1000).toFixed(0)}ms
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={settings.maxDriftTolerance}
                  onChange={(e) => handleSettingChange('maxDriftTolerance', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>500ms</span>
                  <span>5s</span>
                </div>
              </div>

              {/* Min Drift Tolerance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Drift Threshold: {(settings.minDriftTolerance * 1000).toFixed(0)}ms
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.01"
                  value={settings.minDriftTolerance}
                  onChange={(e) => handleSettingChange('minDriftTolerance', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50ms</span>
                  <span>500ms</span>
                </div>
              </div>

              {/* Sync Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sync Check Interval: {(settings.syncInterval / 1000).toFixed(1)}s
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={settings.syncInterval}
                  onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Presets</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleSettingChange('adjustmentRate', 0.01);
                    handleSettingChange('maxDriftTolerance', 2.0);
                    handleSettingChange('minDriftTolerance', 0.2);
                  }}
                  className="text-xs"
                >
                  Conservative
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleSettingChange('adjustmentRate', 0.02);
                    handleSettingChange('maxDriftTolerance', 1.0);
                    handleSettingChange('minDriftTolerance', 0.1);
                  }}
                  className="text-xs"
                >
                  Balanced
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleSettingChange('adjustmentRate', 0.05);
                    handleSettingChange('maxDriftTolerance', 0.5);
                    handleSettingChange('minDriftTolerance', 0.05);
                  }}
                  className="text-xs"
                >
                  Aggressive
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetDriftCorrection}
                className="flex-1 text-red-600 hover:text-red-700"
              >
                Reset Stats
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default DriftSettings;
