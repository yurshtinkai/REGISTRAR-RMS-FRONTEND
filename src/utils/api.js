// This file holds API constants and utility functions for auth.

export const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api';

// Debug logging for API URL
console.log('API_BASE_URL configured as:', API_BASE_URL);
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);

export const getSessionToken = () => localStorage.getItem('sessionToken');
export const getUserRole = () => localStorage.getItem('userRole');
