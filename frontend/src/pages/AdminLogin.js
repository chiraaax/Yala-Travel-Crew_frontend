import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  // Safari-themed background particles
  useEffect(() => {
    const safariParticles = [
      { id: 1, emoji: '🦁', size: 'text-2xl', top: '10%', left: '5%', animation: 'float-1' },
      { id: 2, emoji: '🐘', size: 'text-3xl', top: '15%', left: '85%', animation: 'float-2' },
      { id: 3, emoji: '🦒', size: 'text-2xl', top: '80%', left: '10%', animation: 'float-3' },
      { id: 4, emoji: '🐆', size: 'text-xl', top: '70%', left: '90%', animation: 'float-4' },
      { id: 5, emoji: '🌴', size: 'text-2xl', top: '25%', left: '15%', animation: 'float-5' },
      { id: 6, emoji: '🦓', size: 'text-xl', top: '40%', left: '92%', animation: 'float-6' },
      { id: 7, emoji: '🐘', size: 'text-2xl', top: '85%', left: '75%', animation: 'float-7' },
      { id: 8, emoji: '🦁', size: 'text-xl', top: '55%', left: '3%', animation: 'float-8' },
    ];
    setParticles(safariParticles);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminSavedEmail');
    const savedRememberMe = localStorage.getItem('adminRememberMe');
    
    if (savedEmail && savedRememberMe === 'true') {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await adminLogin({ email, password });

      // Save token
      localStorage.setItem('adminToken', res.data.token);
      
      // Save user info (optional, based on your API response)
      if (res.data.user) {
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('adminSavedEmail', email);
        localStorage.setItem('adminRememberMe', 'true');
      } else {
        localStorage.removeItem('adminSavedEmail');
        localStorage.removeItem('adminRememberMe');
      }

      // Redirect to admin dashboard
      navigate('/admin');

    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid email or password');
            break;
          case 403:
            setError('Access denied. Please contact administrator.');
            break;
          case 404:
            setError('User not found');
            break;
          case 429:
            setError('Too many attempts. Please try again later.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors overflow-hidden">
      {/* Animated Safari Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${particle.size} ${particle.animation} opacity-20 dark:opacity-10`}
            style={{ top: particle.top, left: particle.left }}
          >
            {particle.emoji}
          </div>
        ))}          
        
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3">
            Safari Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-medium tracking-wide">Secure Access to Wildlife Dashboard</p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-gradient-to-br from-white/90 to-amber-50/90 dark:from-gray-800/95 dark:to-gray-900/95 rounded-3xl shadow-2xl p-10 backdrop-blur-sm border border-amber-200/50 dark:border-gray-700/50 transform hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mx-4">
              Expedition Login
            </h2>
            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"></div>
          </div>

          {error && (
            <div className="mb-7 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-xl animate-shake">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-7">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wide">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Ranger Email
              </span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full pl-12 pr-5 py-4 border-2 border-amber-200 dark:border-gray-700 rounded-2xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group-hover:border-amber-300"
                placeholder="ranger@safari.co"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Expedition Key
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all"
              >
                {showPassword ? '🕶️ Hide' : '👁️ Show'}
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-amber-500 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full pl-12 pr-14 py-4 border-2 border-amber-200 dark:border-gray-700 rounded-2xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group-hover:border-amber-300"
                placeholder="••••••••••"
                required
                autoComplete="current-password"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg bg-amber-100 dark:bg-gray-700 hover:bg-amber-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <span className="text-amber-700 dark:text-amber-400">👁️</span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400">🕶️</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-8">
            <label className="flex items-center group cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-5 h-5 appearance-none rounded-lg border-2 border-amber-300 checked:border-amber-600 checked:bg-amber-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                />
                <svg 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 transition-opacity duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ opacity: rememberMe ? 1 : 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Remember this device
              </span>
            </label>
            <button
              type="button"
              onClick={() => {/* Add forgot password functionality */}}
              className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all"
            >
              Lost your key?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center group"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Expedition...
              </>
            ) : (
              <>
                Begin Expedition
                <svg className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>

          {/* Additional Info */}
          <div className="mt-10 pt-8 border-t border-amber-200/50 dark:border-gray-700/50 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Need assistance on your journey?
            </p>
            <button
              type="button"
              onClick={() => {/* Add contact support functionality */}}
              className="inline-flex items-center font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all group"
            >
              <span className="mr-2">📡 Contact Base Camp</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </form> 
        {/* Horizon Line */}
        <div className="absolute bottom-0 left-0 right-0 h-32 rounded-3xl overflow-hidden bg-gradient-to-t from-green-900/10 to-transparent dark:from-green-900/20"></div>
      
      </div>
      

      {/* Add custom animations to your global CSS */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(15px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes float-6 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(-10px); }
        }
        @keyframes float-7 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-22px) scale(1.05); }
        }
        @keyframes float-8 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-3deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 8s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 5s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 9s ease-in-out infinite; }
        .animate-float-6 { animation: float-6 6.5s ease-in-out infinite; }
        .animate-float-7 { animation: float-7 7.5s ease-in-out infinite; }
        .animate-float-8 { animation: float-8 8.5s ease-in-out infinite; }
      `}</style>
      
    </div>
    
  );
  
};

export default AdminLogin;