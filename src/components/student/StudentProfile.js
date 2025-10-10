import React, { useState, useEffect } from 'react';
import './StudentProfile.css';
import { cleanupSharedProfileImages, getStudentProfileImage, setStudentProfileImage } from '../../utils/cleanupProfileImages';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

function StudentProfile({ onProfileClick }) {
    // Load profilePic from localStorage on mount for persistence
    const studentId = localStorage.getItem('idNumber') || 'unknown';
    const storedProfilePic = getStudentProfileImage(studentId);
    const [profilePic, setProfilePic] = useState(storedProfilePic);
    const fullName = localStorage.getItem('fullName');
    const [profile, setProfile] = useState(null);
    const [loginHistory, setLoginHistory] = useState([]);
    const [browserInfo, setBrowserInfo] = useState(null);
    const country = 'Philippines';
    
    // Calculate email reactively based on profile state
    const email = profile?.email || profile?.registration?.email || localStorage.getItem('email') || '';

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
        
        // Debug log to verify detection
        console.log('🔍 Browser Detection:', {
            userAgent: userAgent,
            detectedBrowser: browser,
            detectedDevice: device
        });
    };

    // Clean up shared profile images on mount
    useEffect(() => {
        cleanupSharedProfileImages();
        detectBrowserAndDevice();
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
                
                const [pRes, hRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/students/profile`, { headers }),
                    fetch(`${API_BASE_URL}/sessions/history`, { headers })
                ]);
                
                if (pRes.ok) {
                    const pJson = await pRes.json();
                    setProfile(pJson);
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

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                try {
                    const studentId = localStorage.getItem('idNumber') || 'unknown';
                    setStudentProfileImage(studentId, dataUrl);
                    setProfilePic(dataUrl);
                } catch (error) {
                    alert("Could not save the profile picture. The image might still be too large or your browser's storage is full.");
                    console.error("Error saving profile picture to localStorage:", error);
                }
            };
            img.onerror = () => {
                alert("The selected file couldn't be loaded as an image.");
            };
        };
        reader.onerror = () => {
            alert("Failed to read the selected file.");
        };
    };

    return (
        <div className="student-profile-page">
            <div className="student-profile-header">
                <div className="student-profile-pic-container">
                    <div onClick={() => profilePic && onProfileClick && onProfileClick(profilePic)}>
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="student-profile-pic" />
                        ) : null}
                    </div>
                    <label htmlFor="profile-pic-upload" className="student-profile-pic-edit"><i className="fas fa-camera"></i></label>
                    <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{display:'none'}}/>
                </div>
                <div className="student-profile-name-section">
                    <span className="student-profile-name">{fullName}</span>
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
                        <div><a href="#">Data retention summary</a></div>
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Mobile app</div>
                    <div className="student-profile-card-content">
                        <div>Get the mobile app for a better experience.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfile;