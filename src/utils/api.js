// This file holds API constants and utility functions for auth.

export const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api';

export const getSessionToken = () => {
    const token = localStorage.getItem('sessionToken');
    // Return null if token is null, undefined, or the string 'null'
    return (token && token !== 'null') ? token : null;
};
export const getUserRole = () => localStorage.getItem('userRole');
