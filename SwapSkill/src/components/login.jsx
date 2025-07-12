import React, { useState } from 'react';

// LoginPage Component
const LoginPage = ({ onBackToHome }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      alert('Login successful! Welcome back!');
      setIsLoading(false);
      setFormData({ email: '', password: '' });
      onBackToHome(); // Navigate back to main page after successful login
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here');
  };

  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  const handleBlur = () => {
    setFocusedInput(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white flex flex-col font-sans">
      {/* Screen Header */}
      <header className="p-6 bg-black bg-opacity-30 backdrop-blur-lg border-b border-white border-opacity-10">
        <h1 className="text-2xl font-light text-gray-100">Screen 2</h1>
        <p className="mt-1 text-gray-400 text-sm">User Login page</p>
      </header>

      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-4 bg-black bg-opacity-20 border-b border-white border-opacity-10">
        <div className="text-xl font-normal text-gray-200">Skill Swap Platform</div>
        <button 
          onClick={onBackToHome}
          className="bg-transparent border-2 border-blue-400 text-blue-400 px-5 py-2 rounded-full hover:bg-blue-400 hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-400/40"
        >
          Home
        </button>
      </nav>

      {/* Login Container */}
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="bg-white bg-opacity-5 backdrop-blur-3xl border border-white border-opacity-10 rounded-3xl p-12 w-full max-w-md shadow-2xl">
          {/* Email Field */}
          <div className={`mb-6 transition-transform duration-300 ${focusedInput === 'email' ? '-translate-y-1' : ''}`}>
            <label htmlFor="email" className="block mb-2 text-lg font-light text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              className="w-full p-3 bg-white bg-opacity-8 border-2 border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-opacity-12 focus:shadow-lg focus:shadow-blue-400/30 transition-all duration-300"
            />
          </div>
          
          {/* Password Field */}
          <div className={`mb-6 transition-transform duration-300 ${focusedInput === 'password' ? '-translate-y-1' : ''}`}>
            <label htmlFor="password" className="block mb-2 text-lg font-light text-gray-200">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              placeholder="Enter your password"
              required
              className="w-full p-3 bg-white bg-opacity-8 border-2 border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-opacity-12 focus:shadow-lg focus:shadow-blue-400/30 transition-all duration-300"
            />
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleLogin}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 border-none rounded-full text-white text-lg font-medium cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-400/40 hover:from-blue-400 hover:to-blue-500 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mt-5"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="block w-full text-center mt-5 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm"
          >
            Forgot username/password
          </button>
        </div>
      </div>
    </div>
  );
};