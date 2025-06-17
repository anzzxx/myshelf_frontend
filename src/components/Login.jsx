import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CompactLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        const response = await axios.post('https://myshelf-backend-1.onrender.com/api/login/', {
          email: email,
          password: password,
        });

        console.log('Login successful:', response.data);
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('isAuthenticated', true);

        await Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back! Redirecting to homepage...',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        navigate('/');
      } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);

        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Invalid email or password. Please try again.';
            setErrors({
              email: 'Invalid credentials',
              password: 'Invalid credentials'
            });
          } else if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }

        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#2563eb',
        });
      }
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (e, setter, fieldName) => {
    setter(e.target.value);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-white rounded-xl shadow-md overflow-hidden">
        {/* Compact Header */}
        <div className="text-center p-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e0cc3333b902f1d90fa798f16e9329026fa785d1?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7"
            alt="Logo"
            className="mx-auto h-8"
          />
          <h1 className="mt-3 text-lg font-semibold text-gray-800">Welcome Back</h1>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-4">
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail, 'email')}
              placeholder="Email"
              className={`w-full p-2 text-sm border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-2 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange(e, setPassword, 'password')}
              placeholder="Password"
              className={`w-full p-2 text-sm border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className={`w-full ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-150 flex items-center justify-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Compact Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center text-xs">
          <p className="text-gray-600">
            New user?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="text-blue-600 hover:underline"
              disabled={isSubmitting}
            >
              Register
            </button>
            <br />
            <button 
              onClick={() => navigate('/')} 
              className="text-blue-600 hover:underline"
              disabled={isSubmitting}
            >
              Guest Mode
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactLogin;