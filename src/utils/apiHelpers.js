/**
 * API Helper Functions
 * Centralized API call utilities with session management
 */

import { API_BASE_URL } from './api';
import sessionManager from './sessionManager';

/**
 * Make an authenticated API request with automatic session validation
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} The fetch response
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
    // Validate and refresh session first
    const sessionValid = await sessionManager.validateAndRefreshSession();
    if (!sessionValid) {
        throw new Error('Session expired. Please login again.');
    }

    const sessionToken = sessionManager.getSessionToken();
    if (!sessionToken) {
        throw new Error('No session token found. Please login again.');
    }

    // Prepare headers
    const headers = {
        'X-Session-Token': sessionToken,
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Make the request
    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
};

/**
 * GET request with authentication
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} The response data
 */
export const apiGet = async (endpoint) => {
    const response = await authenticatedFetch(endpoint);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
};

/**
 * POST request with authentication
 * @param {string} endpoint - The API endpoint
 * @param {any} data - The request body data
 * @returns {Promise<any>} The response data
 */
export const apiPost = async (endpoint, data) => {
    const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
};

/**
 * PUT request with authentication
 * @param {string} endpoint - The API endpoint
 * @param {any} data - The request body data
 * @returns {Promise<any>} The response data
 */
export const apiPut = async (endpoint, data) => {
    const response = await authenticatedFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
};

/**
 * DELETE request with authentication
 * @param {string} endpoint - The API endpoint
 * @returns {Promise<any>} The response data
 */
export const apiDelete = async (endpoint) => {
    const response = await authenticatedFetch(endpoint, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
};

/**
 * Upload files with authentication
 * @param {string} endpoint - The API endpoint
 * @param {FormData} formData - The form data with files
 * @returns {Promise<any>} The response data
 */
export const apiUpload = async (endpoint, formData) => {
    const sessionValid = await sessionManager.validateAndRefreshSession();
    if (!sessionValid) {
        throw new Error('Session expired. Please login again.');
    }

    const sessionToken = sessionManager.getSessionToken();
    if (!sessionToken) {
        throw new Error('No session token found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'X-Session-Token': sessionToken
            // Don't set Content-Type for FormData - let browser set it
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }
    return response.json();
};
