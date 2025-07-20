import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSquadStore from '../store/squadStore';

const DiagnosticPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, token } = useAuthStore();
  const { squads, currentSquad, isLoading, error } = useSquadStore();
  const [diagnosticInfo, setDiagnosticInfo] = useState({});

  useEffect(() => {
    const runDiagnostics = () => {
      const info = {
        timestamp: new Date().toISOString(),
        route: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash
        },
        auth: {
          isAuthenticated,
          hasUser: !!user,
          hasToken: !!token,
          userId: user?.id,
          username: user?.username
        },
        squads: {
          count: squads.length,
          isLoading,
          hasError: !!error,
          error: error,
          currentSquad: currentSquad ? {
            id: currentSquad.id,
            name: currentSquad.name,
            memberCount: currentSquad.members?.length || 0
          } : null
        },
        environment: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          localStorage: {
            hasAuthStore: !!localStorage.getItem('auth-store'),
            keys: Object.keys(localStorage)
          }
        }
      };
      
      console.log('Diagnostic Info:', info);
      setDiagnosticInfo(info);
    };

    runDiagnostics();
  }, [location, isAuthenticated, user, token, squads, currentSquad, isLoading, error]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">ScreenSquad Diagnostics</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-squad-primary-600 hover:bg-squad-primary-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="space-y-6">
            {/* Route Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="font-semibold text-blue-800 mb-2">Route Information</h2>
              <pre className="text-sm text-blue-700 whitespace-pre-wrap">
                {JSON.stringify(diagnosticInfo.route, null, 2)}
              </pre>
            </div>

            {/* Authentication Status */}
            <div className={`rounded-lg p-4 ${isAuthenticated ? 'bg-green-50' : 'bg-red-50'}`}>
              <h2 className={`font-semibold mb-2 ${isAuthenticated ? 'text-green-800' : 'text-red-800'}`}>
                Authentication Status
              </h2>
              <pre className={`text-sm whitespace-pre-wrap ${isAuthenticated ? 'text-green-700' : 'text-red-700'}`}>
                {JSON.stringify(diagnosticInfo.auth, null, 2)}
              </pre>
            </div>

            {/* Squad Store Status */}
            <div className={`rounded-lg p-4 ${error ? 'bg-red-50' : 'bg-green-50'}`}>
              <h2 className={`font-semibold mb-2 ${error ? 'text-red-800' : 'text-green-800'}`}>
                Squad Store Status
              </h2>
              <pre className={`text-sm whitespace-pre-wrap ${error ? 'text-red-700' : 'text-green-700'}`}>
                {JSON.stringify(diagnosticInfo.squads, null, 2)}
              </pre>
            </div>

            {/* Environment */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-2">Environment</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(diagnosticInfo.environment, null, 2)}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Reload Page
              </button>
              <button
                onClick={() => localStorage.clear()}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
              >
                Clear Local Storage
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Reset & Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
