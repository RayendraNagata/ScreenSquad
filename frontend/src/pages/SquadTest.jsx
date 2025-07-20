import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore';
import { getAuthHeaders, createDemoToken } from '../utils/demoAuth';
import Button from '../components/ui/Button';

const SquadTest = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const { squads, currentSquad, isLoading, error, fetchSquads, fetchSquadById } = useSquadStore();
  
  const [testResults, setTestResults] = useState([]);
  const [apiTestResult, setApiTestResult] = useState(null);

  // Add test result
  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  // Test Backend API with proper authentication
  const testBackendAPI = async () => {
    try {
      addTestResult('API Connection', 'Testing...', 'Checking backend connectivity');
      
      // Generate a valid demo token if current token looks like demo token
      let testToken = token;
      if (token && token.startsWith('demo-token-')) {
        testToken = createDemoToken(user);
        addTestResult('Token Generation', 'Success', `Generated JWT-like token for user: ${user.username}`);
      }
      
      const headers = getAuthHeaders(testToken);
      
      const response = await fetch('http://localhost:3001/api/squads/1', {
        method: 'GET',
        headers: headers
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        setApiTestResult(data);
        addTestResult('API Squad Fetch', 'Success', `Got squad data: ${data.squad?.name || 'Unknown'}`);
      } else {
        setApiTestResult({ error: responseText });
        addTestResult('API Squad Fetch', 'Failed', `HTTP ${response.status}: ${responseText}`);
      }
    } catch (error) {
      setApiTestResult({ error: error.message });
      addTestResult('API Squad Fetch', 'Error', error.message);
    }
  };

  // Test Store Functions
  const testStoreFunctions = async () => {
    addTestResult('Store Test', 'Testing...', 'Testing squadStore functions');
    
    try {
      await fetchSquads();
      addTestResult('fetchSquads()', 'Success', `Loaded ${squads.length} squads`);
    } catch (err) {
      addTestResult('fetchSquads()', 'Error', err.message);
    }
    
    try {
      const result = await fetchSquadById('1');
      if (result.success) {
        addTestResult('fetchSquadById("1")', 'Success', `Found squad: ${result.squad.name}`);
      } else {
        addTestResult('fetchSquadById("1")', 'Failed', result.error);
      }
    } catch (err) {
      addTestResult('fetchSquadById("1")', 'Error', err.message);
    }
  };

  // Clear test results
  const clearTests = () => {
    setTestResults([]);
    setApiTestResult(null);
  };

  // Re-login to get new JWT token
  const reLogin = async () => {
    const currentEmail = user?.email || 'demo@screensquad.com';
    
    addTestResult('Re-login', 'Testing...', 'Logging out and back in to get new JWT token');
    
    logout();
    const result = await login(currentEmail, 'password');
    
    if (result.success) {
      addTestResult('Re-login', 'Success', 'New JWT token generated');
    } else {
      addTestResult('Re-login', 'Failed', result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Squad Debug Console</h1>
          <Button onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        
        {/* Debug Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Auth State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
              <div><strong>User:</strong> {user ? user.username : 'Not logged in'}</div>
              <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
              <div><strong>Token Type:</strong> {token ? (token.startsWith('demo-token-') ? 'Demo Token' : 'JWT Token') : 'None'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Squad Store State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}</div>
              <div><strong>Squads Count:</strong> {squads.length}</div>
              <div><strong>Current Squad:</strong> {currentSquad ? currentSquad.name : 'None'}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Connection Status</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Frontend:</strong> ✅ Running (port 5173)</div>
              <div><strong>Backend:</strong> {navigator.onLine ? '🟡 Testing...' : '❌ Offline'}</div>
              <div><strong>WebSocket:</strong> 🟡 Not tested</div>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={testBackendAPI} className="bg-blue-600 hover:bg-blue-700">
              🔗 Test Backend API
            </Button>
            <Button onClick={testStoreFunctions} className="bg-green-600 hover:bg-green-700">
              📊 Test Store Functions
            </Button>
            <Button onClick={reLogin} className="bg-orange-600 hover:bg-orange-700">
              🔄 Re-login (New JWT)
            </Button>
            <Button onClick={clearTests} className="bg-gray-600 hover:bg-gray-700">
              🧹 Clear Results
            </Button>
            <Button onClick={() => navigate('/squad/1')} className="bg-purple-600 hover:bg-purple-700">
              🎬 Go to Squad 1
            </Button>
          </div>
        </div>

        {/* API Test Results */}
        {apiTestResult && (
          <div className="bg-white rounded-lg p-6 shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiTestResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="border-l-4 pl-4 py-2" style={{
                  borderColor: result.result === 'Success' ? '#10b981' : 
                             result.result === 'Error' || result.result === 'Failed' ? '#ef4444' : '#f59e0b'
                }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.test}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.result === 'Success' ? 'bg-green-100 text-green-800' :
                      result.result === 'Error' || result.result === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.result}
                    </span>
                  </div>
                  {result.details && (
                    <div className="text-sm text-gray-600 mt-1">{result.details}</div>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadTest;
