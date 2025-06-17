import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CompactSignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;

    // First Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (!nameRegex.test(formData.first_name)) {
      newErrors.first_name = 'Only letters allowed';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'Minimum 2 characters';
    }

    // Last Name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (!nameRegex.test(formData.last_name)) {
      newErrors.last_name = 'Only letters allowed';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Minimum 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Must be 10 digits';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    // } else if (!passwordRegex.test(formData.password)) {
    //   newErrors.password = 'Must contain: 5+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
    // }

    // Confirm Password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      // Exclude confirmPassword from the data sent to the backend
      const { confirmPassword, ...signupData } = formData;

      try {
        const response = await axios.post('https://myshelf-backend-1.onrender.com/api/signup/', signupData);

        // Show success alert
        await Swal.fire({
          icon: 'success',
          title: 'Signup Successful',
          text: 'Your account has been created! Redirecting to login...',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        
        navigate('/login');
      } catch (error) {
        console.error('Signup error:', error.response ? error.response.data : error.message);

        // Handle backend errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.response) {
          if (error.response.status === 400 && error.response.data) {
            const backendErrors = error.response.data;
            
            // Map backend errors to frontend fields
            const errorMap = {
              email: 'email',
              phone_number: 'phone_number',
              first_name: 'first_name',
              last_name: 'last_name',
              password: 'password',
              non_field_errors: 'form',
              detail: 'form'
            };

            // Update frontend errors
            const frontendErrors = {};
            Object.keys(backendErrors).forEach(key => {
              if (errorMap[key]) {
                frontendErrors[errorMap[key]] = Array.isArray(backendErrors[key]) 
                  ? backendErrors[key].join(' ') 
                  : backendErrors[key];
              }
            });

            setErrors(frontendErrors);

            // Set the main error message
            if (backendErrors.email) {
              errorMessage = `Email: ${backendErrors.email.join(' ')}`;
            } else if (backendErrors.phone_number) {
              errorMessage = `Phone: ${backendErrors.phone_number.join(' ')}`;
            } else if (backendErrors.non_field_errors) {
              errorMessage = backendErrors.non_field_errors.join(' ');
            } else if (backendErrors.detail) {
              errorMessage = backendErrors.detail;
            }
          } else if (error.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        }

        // Show error alert
        await Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: errorMessage,
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#2563eb',
        });
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Compact Header */}
        <div className="text-center p-6 pb-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e0cc3333b902f1d90fa798f16e9329026fa785d1?placeholderIfAbsent=true&apiKey=9b4a391cc26240f1b05e84bf5ff1e2b7"
            alt="Logo"
            className="mx-auto h-10"
          />
          <h1 className="mt-4 text-lg text-gray-600 font-medium">Create Account</h1>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name *"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full p-2 text-sm border ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={isSubmitting}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name *"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full p-2 text-sm border ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={isSubmitting}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 text-sm border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-3">
            <input
              type="tel"
              name="phone_number"
              placeholder="Phone *"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full p-2 text-sm border ${
                errors.phone_number ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
          </div>

          <div className="mb-3 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password *"
              value={formData.password}
              onChange={handleChange}
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
            {!errors.password && formData.password && (
              <p className="text-gray-500 text-xs mt-1">
                Password strength: {
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)
                  ? 'Strong' 
                  : 'Weak (needs uppercase, number, and special char)'
                }
              </p>
            )}
          </div>

          <div className="mb-4 relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-2 text-sm border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
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
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className={`w-full ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-200 flex justify-center items-center`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Compact Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-xs">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-blue-600 hover:underline"
              disabled={isSubmitting}
            >
              Login
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

export default CompactSignUp;