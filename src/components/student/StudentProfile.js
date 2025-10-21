import React, { useState, useEffect } from 'react';
import './StudentProfile.css';
import { cleanupSharedProfileImages, getStudentProfileImage, setStudentProfileImage } from '../../utils/cleanupProfileImages';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

function StudentProfile({ onProfileClick, onProfilePicUpdate }) {
    // Load profilePic from localStorage on mount for persistence
    const studentId = localStorage.getItem('idNumber') || 'unknown';
    const storedProfilePic = getStudentProfileImage(studentId);
    const [profilePic, setProfilePic] = useState(storedProfilePic);
    const [imageError, setImageError] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const fullName = localStorage.getItem('fullName');
    const [profile, setProfile] = useState(null);
    
    // Format display name with middle initial
    const formatDisplayName = (name) => {
        if (!name) return 'Student User';
        
        const nameParts = name.split(' ').filter(part => part.trim() !== '');
        
        if (nameParts.length === 1) {
            return nameParts[0];
        } else if (nameParts.length === 2) {
            return `${nameParts[0]} ${nameParts[1]}`;
        } else if (nameParts.length >= 3) {
            // For names like "Lourd Angelou Donque Bufete"
            // First name: "Lourd Angelou" (all parts except last two)
            // Middle name: "Donque" (second to last part)
            // Last name: "Bufete" (last part)
            const lastName = nameParts[nameParts.length - 1];
            const middleName = nameParts[nameParts.length - 2];
            const firstNameParts = nameParts.slice(0, nameParts.length - 2);
            const firstName = firstNameParts.join(' ');
            
            const middleInitial = middleName.charAt(0).toUpperCase() + '.';
            return `${firstName} ${middleInitial} ${lastName}`;
        }
        
        return name;
    };
    const [loginHistory, setLoginHistory] = useState([]);
    const [browserInfo, setBrowserInfo] = useState(null);
    const country = 'Philippines';
    
    // Calculate email reactively based on profile state
    const currentStudentId = localStorage.getItem('idNumber') || '';
    const scopedEmail = currentStudentId ? localStorage.getItem(`email:${currentStudentId}`) : null;
    // Only show email if it's from student-specific data, not from global admin email
    const email = profile?.email || profile?.registration?.email || scopedEmail || '';

    // Function to clear profile photo (for logout scenarios)
    const clearProfilePhoto = () => {
        setProfilePic(null);
        setStudentProfileImage(studentId, null);
        setImageError(false);
    };

    // Function to force refresh profile photo from server
    const refreshProfilePhotoFromServer = async () => {
        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) {
                return;
            }

            const headers = { 'X-Session-Token': sessionToken };
            const response = await fetch(`${API_BASE_URL}/students/profile`, { headers });
            
            if (response.ok) {
                const profileData = await response.json();
                
                if (profileData.profilePhoto) {
                    // Handle different photo URL formats
                    let photoUrl;
                    if (profileData.profilePhoto.startsWith('http')) {
                        photoUrl = profileData.profilePhoto;
                    } else if (profileData.profilePhoto.startsWith('/api/')) {
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        photoUrl = `${baseUrl}${profileData.profilePhoto}`;
                    } else {
                        photoUrl = `${API_BASE_URL}${profileData.profilePhoto}`;
                    }
                    
                    setProfilePic(photoUrl);
                    setStudentProfileImage(studentId, photoUrl);
                    setImageError(false);
                    
                    // Notify parent component
                    if (onProfilePicUpdate) {
                        onProfilePicUpdate();
                    }
                } else {
                }
            } else {
                console.error('📸 Force refresh - Failed to fetch profile:', response.status);
            }
        } catch (error) {
            console.error('📸 Force refresh - Error fetching profile:', error);
        }
    };

    // Debug: Log when profilePic state changes
    useEffect(() => {
    }, [profilePic]);

    // Handle profile photo updates from parent component
    useEffect(() => {
        if (onProfilePicUpdate) {
            // This effect will run when the component mounts, allowing parent to refresh
        }
    }, [onProfilePicUpdate]);

    // Browser and device detection function
    const detectBrowserAndDevice = () => {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        let device = 'Unknown';
        
        // Detect browser (order matters - Edge must be checked before Chrome)
        if (userAgent.includes('Edg/') || userAgent.includes('Edg ') || userAgent.includes('Edge/') || userAgent.includes('EdgA') || userAgent.includes('EdgiOS')) {
            browser = 'Edge';
        } else if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
            browser = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            browser = 'Firefox';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browser = 'Safari';
        } else if (userAgent.includes('Opera')) {
            browser = 'Opera';
        }
        
        // Detect device
        if (userAgent.includes('Android')) {
            device = 'Android';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            device = 'iOS';
        } else if (userAgent.includes('Windows')) {
            device = 'Windows';
        } else if (userAgent.includes('Mac')) {
            device = 'macOS';
        } else if (userAgent.includes('Linux')) {
            device = 'Linux';
        }
        
        // Get screen resolution
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        // Get current time
        const currentTime = new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        setBrowserInfo({
            browser,
            device,
            screenResolution: `${screenWidth}x${screenHeight}`,
            userAgent: userAgent,
            lastActive: currentTime,
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        });
    };

    // Clean up shared profile images on mount and refresh profile photo if needed
    useEffect(() => {
        cleanupSharedProfileImages();
        detectBrowserAndDevice();
        
        // Always try to refresh profile photo from server on mount
        // This ensures we have the latest photo even if cached
        refreshProfilePhotoFromServer();
    }, []);

    // Fetch live profile and login activity
    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionToken = getSessionToken();
                
                if (!sessionToken) {
                    console.error('❌ No session token found');
                    return;
                }
                
                const headers = { 'X-Session-Token': sessionToken };
                const studentId = localStorage.getItem('idNumber') || 'unknown';
                
                const [pRes, hRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/students/profile`, { headers }),
                    fetch(`${API_BASE_URL}/sessions/history`, { headers })
                ]);
                
                if (pRes.ok) {
                    const pJson = await pRes.json();
                    setProfile(pJson);
                    
                    // Check if user has a profile photo from backend
                    
                    if (pJson.profilePhoto) {
                        // Handle different photo URL formats
                        let photoUrl;
                        if (pJson.profilePhoto.startsWith('http')) {
                            photoUrl = pJson.profilePhoto;
                        } else if (pJson.profilePhoto.startsWith('/api/')) {
                            // If the photo URL already starts with /api/, just prepend the base URL without /api
                            const baseUrl = API_BASE_URL.replace('/api', '');
                            photoUrl = `${baseUrl}${pJson.profilePhoto}`;
                        } else {
                            // If it doesn't start with /api/, prepend the full API_BASE_URL
                            photoUrl = `${API_BASE_URL}${pJson.profilePhoto}`;
                        }
                        
                        setProfilePic(photoUrl);
                        setStudentProfileImage(studentId, photoUrl);
                        setImageError(false); // Reset error state when loading from backend
                        
                        // Notify parent component to refresh navbar profile picture
                        if (onProfilePicUpdate) {
                            onProfilePicUpdate();
                        } else {
                        }
                    } else {
                        // Don't clear the existing profile pic, just log
                    }
                } else {
                    const errorText = await pRes.text();
                    console.error('❌ Profile API error:', pRes.status, errorText);
                }
                
                if (hRes.ok) {
                    const hJson = await hRes.json();
                    setLoginHistory(hJson.history || []);
                }
            } catch (e) {
                console.error('❌ Error fetching profile data:', e);
            }
        };
        fetchData();
    }, []);

    // Sync profilePic to navbar by updating localStorage with student-specific key
    useEffect(() => {
        if (profilePic) {
            setStudentProfileImage(studentId, profilePic);
        }
    }, [profilePic, studentId]);

    // Password change handler
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) {
                setPasswordError('Session expired. Please log in again.');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            if (response.ok) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                // Close modal after 2 seconds
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                const errorData = await response.json();
                setPasswordError(errorData.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('Failed to change password. Please try again.');
        }
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;


        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, or GIF).');
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('File size must be less than 5MB.');
            return;
        }

        try {
            const studentId = localStorage.getItem('idNumber') || 'unknown';
            const sessionToken = getSessionToken();
            
            
            if (!sessionToken) {
                alert('Session expired. Please log in again.');
                return;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('photo', file);


            // Upload to backend using student photo endpoint
            const response = await fetch(`${API_BASE_URL}/student-photos/upload`, {
                method: 'POST',
                headers: {
                    'X-Session-Token': sessionToken
                },
                body: formData
            });


            if (response.ok) {
                const result = await response.json();
                
                // Get the full URL for the uploaded photo
                let photoUrl;
                if (result.photoUrl.startsWith('http')) {
                    photoUrl = result.photoUrl;
                } else if (result.photoUrl.startsWith('/api/')) {
                    // If the photo URL already starts with /api/, just prepend the base URL without /api
                    const baseUrl = API_BASE_URL.replace('/api', '');
                    photoUrl = `${baseUrl}${result.photoUrl}`;
                } else {
                    // If it doesn't start with /api/, prepend the full API_BASE_URL
                    photoUrl = `${API_BASE_URL}${result.photoUrl}`;
                }
                
                // Update local state
                setProfilePic(photoUrl);
                setStudentProfileImage(studentId, photoUrl);
                setImageError(false); // Reset error state for new upload
                
                // Notify parent component to refresh navbar profile picture
                if (onProfilePicUpdate) {
                    onProfilePicUpdate();
                } else {
                }
            } else {
                console.error('📸 Upload failed with status:', response.status);
                let errorMessage = 'Unknown error';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || 'Unknown error';
                    console.error('📸 Error response:', errorData);
                } catch (parseError) {
                    console.error('📸 Could not parse error response:', parseError);
                    errorMessage = `Server error (${response.status})`;
                }
                alert(`Failed to upload profile picture: ${errorMessage}`);
            }
        } catch (error) {
            console.error('📸 Error uploading profile picture:', error);
            console.error('📸 Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            alert('Failed to upload profile picture. Please try again.');
        }
    };

    return (
        <div className="student-profile-page">
            <div className="student-profile-header">
                <div className="student-profile-pic-container">
                    <div onClick={() => {
                        if (profilePic && onProfileClick) {
                            onProfileClick(profilePic);
                        } else {
                            // If no profile pic, trigger file upload
                            document.getElementById('profile-pic-upload').click();
                        }
                    }}>
                        {profilePic && !imageError ? (
                            <img 
                                src={profilePic} 
                                alt="Profile" 
                                className="student-profile-pic"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="student-profile-empty" style={{
                                backgroundColor: '#6c757d',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-user" style={{
                                    fontSize: '60px',
                                    opacity: 0.7
                                }}></i>
                            </div>
                        )}
                    </div>
                    <label htmlFor="profile-pic-upload" className="student-profile-pic-edit"><i className="fas fa-camera"></i></label>
                    <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{display:'none'}}/>
                </div>
                <div className="student-profile-name-section">
                    <span className="student-profile-name">{formatDisplayName(fullName)}</span>
                </div>
            </div>
            <div className="student-profile-cards-container">
                <div className="student-profile-card">
                    <div className="student-profile-card-title">User details <span className="student-profile-edit"></span></div>
                    <div className="student-profile-card-content">
                        <div><b>Student ID</b><br />{profile?.idNumber || studentId}</div>
                        <div style={{ marginTop: '10px' }}><b>Email address</b><br /><span className="student-profile-email">{email || '—'}</span></div>
                        <div style={{ marginTop: '10px' }}><b>Gender</b><br />{profile?.registration?.gender || '—'}</div>
                        <div style={{ marginTop: '10px' }}><b>Nationality</b><br />{profile?.registration?.nationality || '—'}</div>
                        <div style={{ marginTop: '10px' }}><b>Country</b><br />{country}</div>
                        {profile?.academicStatus === 'Not registered' && (
                            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', fontSize: '12px' }}>
                                <strong>⚠️ Registration Required:</strong> Please complete the Student Registration Form to display your personal details.
                            </div>
                        )}
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Browser Sessions</div>
                    <div className="student-profile-card-content">
                        {browserInfo ? (
                            <>
                                <div><b>Current Session</b></div>
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '16px', marginRight: '8px' }}>📱</span>
                                        <span><b>Device:</b> {browserInfo.device}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '16px', marginRight: '8px' }}>🌐</span>
                                        <span><b>Browser:</b> {browserInfo.browser}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '16px', marginRight: '8px' }}>📺</span>
                                        <span><b>Resolution:</b> {browserInfo.screenResolution}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '16px', marginRight: '8px' }}>⏰</span>
                                        <span><b>Last Active:</b> {browserInfo.lastActive}</span>
                                    </div>
                                    {browserInfo.isMobile && (
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '16px', marginRight: '8px' }}>📱</span>
                                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>Mobile Device</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div>Loading browser information...</div>
                        )}
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Login activity</div>
                    <div className="student-profile-card-content">
                        {loginHistory && loginHistory.length > 0 ? (
                            <>
                                <div><b>Last access to site</b><br />{`${loginHistory[0].date} ${loginHistory[0].time}`}</div>
                                <div style={{ marginTop: '10px' }}><b>Total logins (last {Math.min(loginHistory.length, 50)})</b><br />{loginHistory.filter(h => h.action === 'login').length}</div>
                                <div style={{ marginTop: '10px' }}>
                                    <b>Recent Activity:</b>
                                    <div style={{ marginTop: '5px', fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                                        {loginHistory.slice(0, 5).map((activity, index) => (
                                            <div key={index} style={{ marginBottom: '3px', padding: '2px 0', borderBottom: index < 4 ? '1px solid #eee' : 'none' }}>
                                                <span style={{ fontWeight: 'bold', color: activity.action === 'login' ? '#28a745' : '#dc3545' }}>
                                                    {activity.action === 'login' ? '🔓' : '🔒'} {activity.action.toUpperCase()}
                                                </span>
                                                <br />
                                                <span style={{ fontSize: '11px', color: '#666' }}>
                                                    {activity.date} at {activity.time}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>No recent login activity found.</div>
                        )}
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Privacy and policies</div>
                    <div className="student-profile-card-content">
                        <div><a href="#" onClick={(e) => { e.preventDefault(); setShowPasswordModal(true); }}>Change Password</a></div>
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Mobile app</div>
                    <div className="student-profile-card-content">
                        <div>Get the mobile app for a better experience.</div>
                    </div>
                </div>
            </div>
            
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        width: '400px',
                        maxWidth: '90vw',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#333' }}>Change Password</h3>
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    fontSize: '20px', 
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>
                            
                            {passwordError && (
                                <div style={{ 
                                    color: '#d32f2f', 
                                    marginBottom: '15px', 
                                    padding: '10px', 
                                    backgroundColor: '#ffebee', 
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}>
                                    {passwordError}
                                </div>
                            )}
                            
                            {passwordSuccess && (
                                <div style={{ 
                                    color: '#2e7d32', 
                                    marginBottom: '15px', 
                                    padding: '10px', 
                                    backgroundColor: '#e8f5e8', 
                                    borderRadius: '5px',
                                    fontSize: '14px'
                                }}>
                                    {passwordSuccess}
                                </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentProfile;