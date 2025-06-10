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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.first_name) newErrors.first_name = 'Required';
    if (!formData.last_name) newErrors.last_name = 'Required';

    if (!formData.phone_number) newErrors.phone_number = 'Required';
    else if (!/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = '10 digits only';

    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 chars';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'No match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Exclude confirmPassword from the data sent to the backend
      const { confirmPassword, ...signupData } = formData;
      console.log('Sign up data:', signupData);

      try {
        const response = await axios.post('https://myshelf-backend-2.onrender.com/api/signup/', signupData);
        console.log('Signup successful:', response.data);

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Signup Successful',
          text: 'Your account has been created! Redirecting to login...',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          navigate('/login');
        });
      } catch (error) {
        console.error('Signup error:', error.response ? error.response.data : error.message);

        // Handle backend errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.response) {
          if (error.response.status === 400 && error.response.data) {
            // Handle field-specific errors from backend (e.g., email already exists)
            const backendErrors = error.response.data;
            if (backendErrors.email) {
              errorMessage = backendErrors.email[0];
            } else if (backendErrors.phone_number) {
              errorMessage = backendErrors.phone_number[0];
            } else if (backendErrors.non_field_errors) {
              errorMessage = backendErrors.non_field_errors[0];
            } else if (backendErrors.detail) {
              errorMessage = backendErrors.detail;
            }
            // Update frontend errors for field-specific validation
            setErrors((prev) => ({
              ...prev,
              ...backendErrors,
            }));
          }
        }

        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: errorMessage,
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#2563eb',
        });
      }
    }
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
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
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {/* Compact Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-xs">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
              Login
            </button>
            <br />
            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
              Guest Mode
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompactSignUp;