/**
 * Avatar utilities for handling profile photos and fallback avatars
 */

/**
 * Generate initials from a student's name
 * @param {string} firstName - Student's first name
 * @param {string} lastName - Student's last name
 * @param {string} middleName - Student's middle name (optional)
 * @returns {string} - Initials (e.g., "KV" for Karl Villar)
 */
export const generateInitials = (firstName, lastName, middleName = '') => {
    if (!firstName || !lastName) return '?';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    if (middleName && middleName.trim()) {
        const middleInitial = middleName.charAt(0).toUpperCase();
        return `${firstInitial}${middleInitial}${lastInitial}`;
    }
    
    return `${firstInitial}${lastInitial}`;
};

/**
 * Generate a unique color based on the student's name
 * @param {string} name - Student's full name
 * @returns {string} - Hex color code
 */
export const generateAvatarColor = (name) => {
    if (!name) return '#6c757d'; // Default gray
    
    // Generate a hash from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert hash to color
    const hue = Math.abs(hash) % 360;
    const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
    const lightness = 45 + (Math.abs(hash) % 15);  // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Create a data URL for a fallback avatar
 * @param {string} initials - Student's initials
 * @param {string} color - Background color
 * @returns {string} - Data URL for the avatar
 */
export const createFallbackAvatar = (initials, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;
    
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 200);
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 100, 100);
    
    return canvas.toDataURL('image/png');
};

/**
 * Get the appropriate avatar source for a student
 * @param {Object} student - Student object with profilePhoto, firstName, lastName, middleName
 * @returns {Object} - Object with src (string) and isFallback (boolean)
 */
export const getStudentAvatar = (student) => {
    if (!student) {
        return {
            src: null,
            isFallback: false,
            initials: '?'
        };
    }
    
    // If student has a profile photo, use it
    if (student.profilePhoto) {
        return {
            src: `http://localhost:5000${student.profilePhoto}`,
            isFallback: false,
            initials: null
        };
    }
    
    // Generate fallback avatar
    const initials = generateInitials(
        student.firstName || student.first_name,
        student.lastName || student.last_name,
        student.middleName || student.middle_name
    );
    
    const color = generateAvatarColor(
        `${student.firstName || student.first_name || ''} ${student.lastName || student.last_name || ''}`
    );
    
    return {
        src: createFallbackAvatar(initials, color),
        isFallback: true,
        initials: initials
    };
};
