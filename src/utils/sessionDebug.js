/**
 * Session Debug Utilities
 * Helper functions to debug and fix session issues
 */

import sessionManager from './sessionManager';

/**
 * Clear all session data and reset
 */
export const clearAllSessionData = () => {
    console.log('🧹 Clearing all session data...');
    
    // Clear localStorage items
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('idNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userInfo');
    
    // Clear session manager
    sessionManager.clearSessionToken();
    
    console.log('✅ All session data cleared');
};

/**
 * Debug current session state
 */
export const debugSessionState = () => {
    console.log('🔍 Current Session State:');
    console.log('- sessionToken:', localStorage.getItem('sessionToken'));
    console.log('- userRole:', localStorage.getItem('userRole'));
    console.log('- idNumber:', localStorage.getItem('idNumber'));
    console.log('- userId:', localStorage.getItem('userId'));
    console.log('- fullName:', localStorage.getItem('fullName'));
    console.log('- userInfo:', localStorage.getItem('userInfo'));
    console.log('- sessionManager token:', sessionManager.getSessionToken());
};

/**
 * Fix corrupted session token
 */
export const fixCorruptedSession = () => {
    const token = localStorage.getItem('sessionToken');
    
    if (token === 'null' || token === 'undefined' || !token) {
        console.log('🔧 Fixing corrupted session token...');
        clearAllSessionData();
        console.log('✅ Session fixed - please login again');
        return true;
    }
    
    console.log('✅ Session token appears valid');
    return false;
};

// Auto-fix on import if needed
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sessionToken');
    if (token === 'null' || token === 'undefined') {
        console.warn('⚠️ Corrupted session detected - auto-fixing...');
        fixCorruptedSession();
    }
}
