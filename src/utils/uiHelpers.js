/**
 * UI Helper Functions
 * Common utilities for user interface operations
 */

/**
 * Format date to readable string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format time to readable string
 * @param {string} time - Time in HH:MM format
 * @returns {string} Formatted time string
 */
export const formatTime = (time) => {
    if (!time) return 'TBA';
    
    try {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return time; // Return original if parsing fails
    }
};

/**
 * Get status badge class for different statuses
 * @param {string} status - The status to get class for
 * @returns {string} Bootstrap badge class
 */
export const getStatusBadgeClass = (status) => {
    const statusClasses = {
        'approved': 'bg-success',
        'pending': 'bg-warning text-dark',
        'rejected': 'bg-danger',
        'ready for pick-up': 'bg-info',
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'enrolled': 'bg-primary',
        'completed': 'bg-success'
    };
    
    return statusClasses[status?.toLowerCase()] || 'bg-secondary';
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
};

/**
 * Show success toast notification
 * @param {string} message - Success message
 */
export const showSuccessToast = (message) => {
    // For now, use alert - can be replaced with toast library
    alert(`✅ ${message}`);
};

/**
 * Show error toast notification
 * @param {string} message - Error message
 */
export const showErrorToast = (message) => {
    // For now, use alert - can be replaced with toast library
    alert(`❌ ${message}`);
};

/**
 * Show loading state
 * @param {string} message - Loading message
 */
export const showLoading = (message = 'Loading...') => {
    console.log(`⏳ ${message}`);
    // Can be enhanced with actual loading overlay
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone?.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Generate random color for charts
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#FF6384'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
