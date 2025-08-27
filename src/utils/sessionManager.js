import { API_BASE_URL } from './api';

/**
 * Session Manager - Handles session token management and automatic refresh
 */
class SessionManager {
    constructor() {
        this.refreshInterval = null;
        this.init();
    }

    init() {
        // Check if we have a session token
        const token = this.getSessionToken();
        if (token) {
            // Start automatic refresh
            this.startAutoRefresh();
        }
    }

    getSessionToken() {
        return localStorage.getItem('sessionToken');
    }

    setSessionToken(token) {
        localStorage.setItem('sessionToken', token);
        // Start auto-refresh when token is set
        this.startAutoRefresh();
    }

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
