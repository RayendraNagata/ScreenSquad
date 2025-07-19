import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSocketStore from './store/socketStore';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import { LoadingSpinner } from './components/ui/index.jsx';

function App() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    // Connect to socket when user is authenticated
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading ScreenSquad...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar />}
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/squad/:squadId" 
            element={
              isAuthenticated ? <Squad /> : <Navigate to="/" replace />
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? <Profile /> : <Navigate to="/" replace />
            } 
          />

          {/* Join squad with invite */}
          <Route 
            path="/join/:squadId" 
            element={
              isAuthenticated ? <Squad /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <a 
                    href={isAuthenticated ? "/dashboard" : "/"} 
                    className="btn-primary"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
