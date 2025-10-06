import { API_BASE_URL } from './api';

/**
 * Session Manager - Handles session token management and automatic refresh
 * 
 * Features:
 * - Automatic session refresh every 12 hours
 * - On-demand session validation
 * - Secure token storage in localStorage
 * - Error handling and cleanup
 * 
 * @class SessionManager
 */
class SessionManager {
    constructor() {
        this.refreshInterval = null;
        this.init();
    }

    /**
     * Initialize the session manager
     * Checks for existing token and starts auto-refresh if found
     */
    init() {
        const token = this.getSessionToken();
        if (token) {
            this.startAutoRefresh();
        }
    }

    /**
     * Get the current session token from localStorage
     * @returns {string|null} The session token or null if not found
     */
    getSessionToken() {
        const token = localStorage.getItem('sessionToken');
        console.log('📥 SessionManager: Getting token from localStorage:', token ? 'TOKEN_EXISTS' : 'NO_TOKEN');
        // Return null if token is null, undefined, or the string 'null'
        return (token && token !== 'null') ? token : null;
    }

    /**
     * Set a new session token and start auto-refresh
     * @param {string} token - The session token to store
     */
    setSessionToken(token) {
        console.log('🔑 SessionManager: Setting token:', token ? 'TOKEN_PROVIDED' : 'NO_TOKEN');
        if (token) {
            localStorage.setItem('sessionToken', token);
            console.log('✅ SessionManager: Token stored in localStorage');
            this.startAutoRefresh();
        } else {
            console.log('❌ SessionManager: No token provided');
        }
    }

    /**
     * Clear the session token and stop auto-refresh
     */
    clearSessionToken() {
        localStorage.removeItem('sessionToken');
        this.stopAutoRefresh();
    }

    async refreshSession() {
        try {
            const token = this.getSessionToken();
            if (!token) {
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/sessions/refresh`, {
                method: 'POST',
                headers: {
                    'X-Session-Token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // Store the new session token
                this.setSessionToken(result.sessionToken);
                console.log('✅ Session refreshed:', result.message);
                return true;
            } else {
                console.log('❌ Session refresh failed:', response.status);
                // If refresh fails, clear the token
                this.clearSessionToken();
                return false;
            }
        } catch (error) {
            console.error('Session refresh error:', error);
            this.clearSessionToken();
            return false;
        }
    }

    startAutoRefresh() {
        // Stop existing interval if any
        this.stopAutoRefresh();
        
        // Refresh session every 12 hours (43200000 ms)
        this.refreshInterval = setInterval(() => {
            this.refreshSession();
        }, 12 * 60 * 60 * 1000);
        
        console.log('🔄 Auto-refresh started - sessions will refresh every 12 hours');
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('🛑 Auto-refresh stopped');
        }
    }

    // Check if session is valid and refresh if needed
    async validateAndRefreshSession() {
        const token = this.getSessionToken();
        if (!token) {
            return false;
        }

        // Try to refresh the session
        const refreshed = await this.refreshSession();
        return refreshed;
    }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
