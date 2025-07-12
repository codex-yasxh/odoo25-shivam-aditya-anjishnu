import React, { useState } from 'react';

const LoginPage = ({ onClose }) => {
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
      onClose(); // Close the modal after successful login
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
    <div className="w-full">
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Login to Your Account</h2>
        <button 
          onClick={onClose}
          className="text-gray-300 hover:text-white text-2xl"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin}>
        {/* Email Field */}
        <div className={`mb-4 transition-transform duration-300 ${focusedInput === 'email' ? '-translate-y-1' : ''}`}>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
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
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
          />
        </div>
        
        {/* Password Field */}
        <div className={`mb-6 transition-transform duration-300 ${focusedInput === 'password' ? '-translate-y-1' : ''}`}>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
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
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-300"
          />
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-lg text-white font-medium cursor-pointer transition-all duration-300 hover:from-blue-400 hover:to-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        {/* Forgot Password Link */}
        <button
          type="button"
          onClick={handleForgotPassword}
          className="block w-full text-center mt-4 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-300 bg-transparent border-none cursor-pointer text-sm"
        >
          Forgot password?
        </button>
      </form>
    </div>
  );
};

export default LoginPage;