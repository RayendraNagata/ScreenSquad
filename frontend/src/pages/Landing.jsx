import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      if (formData.password !== formData.confirmPassword) {
        // Handle password mismatch
        return;
      }
      await register(formData.email, formData.password, formData.username);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-squad-primary-600 via-squad-primary-700 to-squad-secondary-600 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-squad-secondary-400 opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-5 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <div className="mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                Screen<span className="text-squad-secondary-400">Squad</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed"
              >
                Watch together, react together, create memories together. 
                The ultimate group streaming experience with perfect sync.
              </motion.p>
            </div>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 gap-6 mb-8"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-squad-secondary-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <span className="text-blue-100">Sub-500ms Sync</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-squad-secondary-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🎭</span>
                </div>
                <span className="text-blue-100">Live Reactions</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-squad-secondary-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📱</span>
                </div>
                <span className="text-blue-100">Screen Sharing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-squad-secondary-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">💬</span>
                </div>
                <span className="text-blue-100">Voice Chat</span>
              </div>
            </motion.div>

            {/* Demo Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex space-x-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-squad-secondary-400">10K+</div>
                <div className="text-blue-200 text-sm">Active Squads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-squad-secondary-400">500ms</div>
                <div className="text-blue-200 text-sm">Max Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-squad-secondary-400">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isLogin ? 'Welcome Back!' : 'Join ScreenSquad'}
                </h2>
                <p className="text-gray-600">
                  {isLogin 
                    ? 'Sign in to your squad account' 
                    : 'Create your account and start watching together'
                  }
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose your squad name"
                      required
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="w-full"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      className="w-full"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-squad-primary-600 hover:bg-squad-primary-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading 
                    ? 'Please wait...' 
                    : isLogin 
                      ? 'Sign In to Squad' 
                      : 'Create Squad Account'
                  }
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      clearError();
                      setFormData({
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                      });
                    }}
                    className="ml-2 text-squad-primary-600 hover:text-squad-primary-700 font-semibold transition-colors duration-200"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200">
                    <span>Google</span>
                  </button>
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200">
                    <span>Discord</span>
                  </button>
                </div>
              </div>

              {/* Demo Accounts */}
              {isLogin && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">🎮 Demo Accounts (Any password works):</h4>
                  <div className="space-y-2">
                    {[
                      { email: 'demo@screensquad.com', name: 'ScreenSquad Demo', role: '👑 Admin' },
                      { email: 'sarah@example.com', name: 'Sarah Wilson', role: '🛡️ Moderator' },
                      { email: 'john@example.com', name: 'John Doe', role: '👤 User' }
                    ].map((account) => (
                      <button
                        key={account.email}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            email: account.email,
                            password: 'demo123'
                          });
                        }}
                        className="w-full text-left p-3 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-800">{account.name}</div>
                            <div className="text-sm text-blue-600">{account.email}</div>
                          </div>
                          <div className="text-sm text-blue-700">{account.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Tip: Click any account above to auto-fill login form
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
