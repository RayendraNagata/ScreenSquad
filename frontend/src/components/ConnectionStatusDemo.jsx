import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ConnectionStatus from './ConnectionStatus';
import CompactConnectionStatus from './CompactConnectionStatus';
import useSocketStore from '../store/socketStore';
import useVideoStore from '../store/videoStore';
import Button from './ui/Button';

/**
 * ConnectionStatus Demo Component
 * Untuk testing berbagai kondisi connection status
 */
const ConnectionStatusDemo = () => {
  const [demoMode, setDemoMode] = useState('auto');
  const [position, setPosition] = useState('top-right');
  const [showDetails, setShowDetails] = useState(true);
  const { isConnected, latency } = useSocketStore();
  const { averageLatency, syncDrift } = useVideoStore();

  // Demo scenarios
  const demoScenarios = {
    excellent: {
      name: 'Excellent Connection',
      description: 'Perfect sync, low latency',
      mockData: { latency: 25, syncDrift: 0.02, isBuffering: false }
    },
    fair: {
      name: 'Fair Connection',
      description: 'Good connection with moderate latency',
      mockData: { latency: 120, syncDrift: 0.08, isBuffering: false }
    },
    poor: {
      name: 'Poor Connection',
      description: 'High latency, sync issues',
      mockData: { latency: 250, syncDrift: 0.35, isBuffering: false }
    },
    buffering: {
      name: 'Buffering',
      description: 'Loading content',
      mockData: { latency: 80, syncDrift: 0.05, isBuffering: true }
    },
    offline: {
      name: 'Offline',
      description: 'No connection',
      mockData: { latency: null, syncDrift: null, isBuffering: false }
    }
  };

  const positions = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Connection Status Demo</h2>
          <button
            onClick={() => window.closeDemo?.()}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Demo Controls */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Demo Scenario
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                onClick={() => setDemoMode('auto')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  demoMode === 'auto'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Auto (Live)
              </button>
              {Object.entries(demoScenarios).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => setDemoMode(key)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    demoMode === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
            {demoMode !== 'auto' && (
              <p className="text-xs text-gray-400 mt-1">
                {demoScenarios[demoMode]?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {positions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    position === pos
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-300">Show Details</span>
            </label>
          </div>
        </div>

        {/* Current Status Display */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Current Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Connected:</span>
              <span className="text-white ml-2">{isConnected ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400">Latency:</span>
              <span className="text-white ml-2">{latency ? `${latency}ms` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Avg Latency:</span>
              <span className="text-white ml-2">{averageLatency ? `${averageLatency}ms` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Sync Drift:</span>
              <span className="text-white ml-2">
                {syncDrift !== null ? `${Math.round(Math.abs(syncDrift) * 1000)}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Component Variants */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Full Component</h3>
            <div className="bg-gray-800/30 rounded-lg p-4 relative min-h-32">
              <ConnectionStatus
                position={position}
                showDetails={showDetails}
                autoHide={false}
                className="relative"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Compact Version (Navbar)</h3>
            <div className="bg-gray-800/30 rounded-lg p-4 flex justify-center">
              <div className="bg-gray-900 rounded-lg p-3 flex items-center">
                <span className="text-white mr-4">ScreenSquad</span>
                <CompactConnectionStatus />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Usage Examples</h3>
          <div className="space-y-2 text-sm font-mono">
            <div className="bg-gray-900 rounded p-2 text-gray-300">
              {`<ConnectionStatus position="top-right" showDetails={true} />`}
            </div>
            <div className="bg-gray-900 rounded p-2 text-gray-300">
              {`<CompactConnectionStatus className="flex" />`}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => {
              console.log('ConnectionStatus Demo - Testing all scenarios...');
              // Could trigger automated testing here
            }}
            variant="outline"
            className="flex-1"
          >
            Run Tests
          </Button>
          <Button
            onClick={() => window.closeDemo?.()}
            className="flex-1"
          >
            Close Demo
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Demo launcher function
export const launchConnectionStatusDemo = () => {
  const demoContainer = document.createElement('div');
  demoContainer.id = 'connection-status-demo';
  document.body.appendChild(demoContainer);

  // Cleanup function
  window.closeDemo = () => {
    document.body.removeChild(demoContainer);
    delete window.closeDemo;
  };

  // Render demo component
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(demoContainer);
    root.render(<ConnectionStatusDemo />);
  });
};

export default ConnectionStatusDemo;
