// This file holds API constants and utility functions for auth.

export const API_BASE_URL = 'http://localhost:5000/api';
export const getToken = () => localStorage.getItem('token');
export const getUserRole = () => localStorage.getItem('userRole');
