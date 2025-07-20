import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore_fixed';

const SquadDebug = () => {
  const { squadId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { currentSquad, fetchSquadById, isLoading, error, squads, demoSquads } = useSquadStore();
  const [debugInfo, setDebugInfo] = useState({});
  const [fetchAttempts, setFetchAttempts] = useState(0);

  useEffect(() => {
    const debug = {
      timestamp: new Date().toISOString(),
      squadId,
      params: useParams(),
      auth: {
        isAuthenticated,
        user: user ? { id: user.id, username: user.username } : null
      },
      store: {
        currentSquad: currentSquad ? { id: currentSquad.id, name: currentSquad.name } : null,
        isLoading,
        error,
        squadsCount: squads.length,
        demoSquadsCount: demoSquads.length,
        availableSquads: [...squads, ...demoSquads].map(s => ({ id: s.id, name: s.name }))
      }
    };
    
    console.log('Squad Debug Info:', debug);
    setDebugInfo(debug);
  }, [squadId, user, isAuthenticated, currentSquad, isLoading, error, squads, demoSquads]);

  const handleFetchSquad = async () => {
    console.log(`🔄 Manual fetch attempt ${fetchAttempts + 1} for squad ${squadId}`);
    setFetchAttempts(prev => prev + 1);
    
    try {
      const result = await fetchSquadById(squadId);
      console.log('✅ Fetch result:', result);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

  const handleNavigateToSquad = () => {
    navigate(`/squad/${squadId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Squad Debug - ID: {squadId}
            </h1>
            <div className="space-x-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Dashboard
              </button>
              <button
                onClick={handleNavigateToSquad}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Go to Squad
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isAuthenticated ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`font-semibold ${isAuthenticated ? 'text-green-800' : 'text-red-800'}`}>
                  Authentication
                </h3>
                <p className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isLoading ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <h3 className={`font-semibold ${isLoading ? 'text-yellow-800' : 'text-green-800'}`}>
                  Loading State
                </h3>
                <p className={`text-sm ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isLoading ? '⏳ Loading...' : '✅ Ready'}
                </p>
              </div>

              <div className={`p-4 rounded-lg ${error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <h3 className={`font-semibold ${error ? 'text-red-800' : 'text-green-800'}`}>
                  Error State
                </h3>
                <p className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                  {error ? `❌ ${error}` : '✅ No Errors'}
                </p>
              </div>
            </div>

            {/* Squad Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="font-semibold text-blue-800 mb-4">Squad Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Current Squad</h4>
                  {currentSquad ? (
                    <div className="bg-white rounded p-3">
                      <p><strong>ID:</strong> {currentSquad.id}</p>
                      <p><strong>Name:</strong> {currentSquad.name}</p>
                      <p><strong>Members:</strong> {currentSquad.members?.length || 0}</p>
                      <p><strong>Description:</strong> {currentSquad.description || 'N/A'}</p>
                    </div>
                  ) : (
                    <p className="text-blue-600">No current squad loaded</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Available Squads</h4>
                  <div className="bg-white rounded p-3 max-h-32 overflow-y-auto">
                    {debugInfo.store?.availableSquads?.length > 0 ? (
                      debugInfo.store.availableSquads.map(squad => (
                        <div key={squad.id} className="flex justify-between items-center py-1">
                          <span>{squad.name}</span>
                          <code className="text-xs bg-gray-100 px-1 rounded">{squad.id}</code>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No squads available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-4">Debug Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleFetchSquad}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Fetch Squad ({fetchAttempts} attempts)
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth-store');
                    window.location.href = '/';
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Reset Auth
                </button>
              </div>
            </div>

            {/* Raw Debug Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-2">Raw Debug Data</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquadDebug;
