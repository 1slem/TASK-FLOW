import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // User is already authenticated, redirect to home
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,  // Note: backend expects snake_case
          last_name: formData.lastName,    // Note: backend expects snake_case
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        navigate('/login');
      } else {
        // Handle validation errors
        if (typeof data === 'object') {
          // If the error is an object with multiple fields
          const errorMessages = Object.entries(data)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('\n');
          setError(errorMessages);
        } else {
          setError(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 animate-fade-in">Task Flow Register</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-line">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 ease-in-out peer"
              placeholder=" "
              required
              autoComplete="username"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              Username
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 ease-in-out peer"
              placeholder=" "
              required
              autoComplete="email"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 ease-in-out peer"
              placeholder=" "
              required
              autoComplete="new-password"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 ease-in-out peer"
              placeholder=" "
              required
              autoComplete="given-name"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              First Name
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 ease-in-out peer"
              placeholder=" "
              required
              autoComplete="family-name"
            />
            <label className="absolute left-4 top-3 text-gray-500 transition-all duration-300 ease-in-out transform origin-left peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm peer-valid:text-blue-500">
              Last Name
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
