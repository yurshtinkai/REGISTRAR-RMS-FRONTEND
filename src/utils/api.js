// This file holds API constants and utility functions for auth.
// export const API_BASE_URL = 'http://localhost:5000/api';

// Force correct API URL for production
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://rms-back-bxkx.onrender.com/api';
  }
  return process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

// Debug logging for API URL
console.log('API_BASE_URL configured as:', API_BASE_URL);
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);

// export const getSessionToken = () => localStorage.getItem('sessionToken');
// export const getUserRole = () => localStorage.getItem('userRole');
