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
    const email = profile?.email || profile?.registration?.email || localStorage.getItem('email') || '';
    const country = 'Philippines';

    // Clean up shared profile images on mount
    useEffect(() => {
        cleanupSharedProfileImages();
    }, []);

    // Fetch live profile and login activity
    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'X-Session-Token': getSessionToken() };
                const [pRes, hRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/students/profile`, { headers }),
                    fetch(`${API_BASE_URL}/sessions/history`, { headers })
                ]);
                if (pRes.ok) {
                    const pJson = await pRes.json();
                    setProfile(pJson);
                }
                if (hRes.ok) {
                    const hJson = await hRes.json();
                    setLoginHistory(hJson.history || []);
                }
            } catch (e) {
                // silent fail in UI
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
                    <div className="student-profile-card-title">User details <span className="student-profile-edit">Edit profile</span></div>
                    <div className="student-profile-card-content">
                        <div><b>Student ID</b><br />{profile?.idNumber || studentId}</div>
                        <div style={{ marginTop: '10px' }}><b>Email address</b><br /><span className="student-profile-email">{email || '—'}</span></div>
                        <div style={{ marginTop: '10px' }}><b>Gender</b><br />{profile?.registration?.gender || '—'}</div>
                        <div style={{ marginTop: '10px' }}><b>Nationality</b><br />{profile?.registration?.nationality || '—'}</div>
                        <div style={{ marginTop: '10px' }}><b>Country</b><br />{country}</div>
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Reports</div>
                    <div className="student-profile-card-content">
                        <div><a href="#">Browser sessions</a></div>
                        <div><a href="#">Grades overview</a></div>
                    </div>
                </div>
                <div className="student-profile-card">
                    <div className="student-profile-card-title">Login activity</div>
                    <div className="student-profile-card-content">
                        {loginHistory && loginHistory.length > 0 ? (
                            <>
                                <div><b>Last access to site</b><br />{`${loginHistory[0].date} ${loginHistory[0].time}`}</div>
                                <div style={{ marginTop: '10px' }}><b>Total logins (last {Math.min(loginHistory.length, 50)})</b><br />{loginHistory.filter(h => h.action === 'login').length}</div>
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