/**
 * Utility to clean up shared profile images and migrate to student-specific keys
 */

export const cleanupSharedProfileImages = () => {
    try {
        // Check if there's a shared profileImage
        const sharedProfileImage = localStorage.getItem('profileImage');
        
        if (sharedProfileImage) {
            // Get current student ID
            const currentStudentId = localStorage.getItem('idNumber');
            
            if (currentStudentId) {
                // Migrate the shared image to student-specific key
                localStorage.setItem(`profileImage_${currentStudentId}`, sharedProfileImage);
                console.log(`✅ Migrated shared profile image to student-specific key: profileImage_${currentStudentId}`);
                
                // Remove the shared key
                localStorage.removeItem('profileImage');
                console.log('✅ Removed shared profileImage key');
            }
        }
        
        // Clean up any old role-based keys
        const keysToClean = ['studentProfilePic', 'adminProfilePic', 'accountingProfilePic'];
        keysToClean.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`✅ Cleaned up old key: ${key}`);
            }
        });
        
        console.log('🎉 Profile image cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during profile image cleanup:', error);
    }
};

export const getStudentProfileImage = (studentId) => {
    if (!studentId) return null;
    return localStorage.getItem(`profileImage_${studentId}`);
};

export const setStudentProfileImage = (studentId, imageData) => {
    if (!studentId) return false;
    try {
        localStorage.setItem(`profileImage_${studentId}`, imageData);
        return true;
    } catch (error) {
        console.error('Error setting student profile image:', error);
        return false;
    }
};
