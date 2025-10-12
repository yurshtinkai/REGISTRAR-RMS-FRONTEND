import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { getStudentProfileImage, clearAllProfileImages } from '../../utils/cleanupProfileImages';
import sessionManager from '../../utils/sessionManager';
import StudentRegistrationForm from './StudentRegistrationForm';
import './StudentHomePage.css';
import CustomAlert from '../../CustomAlert';

/**
 * Student Home Page Component
 * 
 * Features:
 * - Student dashboard with announcements
 * - Real-time notifications from registrars
 * - Session management and validation
 * - Quick action buttons for common tasks
 * 
 * @component
 */

function StudentHomePage() {
    const [userData, setUserData] = useState({
        fullName: '',
        studentId: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(true);
    const [expandedAnnouncements, setExpandedAnnouncements] = useState(new Set());
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicError, setProfilePicError] = useState(false);

    // Load profile picture for dashboard
    useEffect(() => {
        // Clear any old profile images first to ensure clean state
        clearAllProfileImages();
        
        const studentId = localStorage.getItem('idNumber');
        if (studentId) {
            const profileImage = getStudentProfileImage(studentId);
            setProfilePic(profileImage);
            setProfilePicError(false);
        }
    }, []);

    // Fetch user data from database using session token
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Try to refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setError('Session expired. Please login again.');
                    setLoading(false);
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                if (!sessionToken) {
                    setError('No session token found. Please login again.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/students/profile`, {
                    headers: {
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        fullName: data.fullName || `${data.firstName} ${data.lastName}`,
                        studentId: data.studentNumber || data.idNumber
                    });
                } else {
                    // Fallback to localStorage if API fails
                    const fallbackName = localStorage.getItem('fullName') || 'Student';
                    const fallbackId = localStorage.getItem('idNumber') || 'N/A';
                    setUserData({
                        fullName: fallbackName,
                        studentId: fallbackId
                    });
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                // Fallback to localStorage
                const fallbackName = localStorage.getItem('fullName') || 'Student';
                const fallbackId = localStorage.getItem('idNumber') || 'N/A';
                setUserData({
                    fullName: fallbackName,
                    studentId: fallbackId
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // After first login (post-registration), show guided welcome modal
    useEffect(() => {
        try {
            const shouldShow = localStorage.getItem('showWelcomeRegistrationPrompt') === '1';
            if (shouldShow) {
                setShowWelcomeModal(true);
            }
        } catch (_) {}
    }, []);

    // Fetch announcements from database
    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setAnnouncementsLoading(false);
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                if (!sessionToken) {
                    setAnnouncementsLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/notifications`, {
                    headers: {
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Filter for requirements announcements and general announcements
                    const requirementsAnnouncements = data
                        .filter(notif => notif.type === 'requirements_reminder' || notif.type === 'general')
                        .map(notif => ({
                            id: notif.id,
                            title: notif.message,
                            date: new Date(notif.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            priority: notif.type === 'requirements_reminder' ? 'high' : 'medium',
                            type: notif.type
                        }))
                        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
                    
                    setAnnouncements(requirementsAnnouncements);
                } else {
                    console.error('Failed to fetch announcements:', response.status);
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
            } finally {
                setAnnouncementsLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    // Announcements are now fetched from the database via useEffect above

    const quickActions = [
        { 
            title: 'Request Document', 
            description: 'Submit document requests',
            icon: '📄',
            path: '/student/requests',
            color: '#2E86AB'
        },
        { 
            title: 'Enrollment Status', 
            description: 'Current enrollment details',
            icon: '✅',
            path: '/student/enrollment-status',
            color: '#F18F01'
        },
        { 
            title: 'Subject Schedule', 
            description: 'View class schedules and timetables',
            icon: '📅',
            path: '/student/subject-schedule',
            color: '#28a745'
        },
        { 
            title: 'Profile', 
            description: 'Manage personal information',
            icon: '👤',
            path: '/student/profile',
            color: '#C73E1D'
        }
    ];

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return '#dc3545';
            case 'medium': return '#fd7e14';
            case 'low': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getPriorityLabel = (priority) => {
        switch(priority) {
            case 'high': return 'Important';
            case 'medium': return 'Notice';
            case 'low': return 'Info';
            default: return 'Info';
        }
    };

    const toggleAnnouncementVisibility = (announcementId) => {
        setExpandedAnnouncements(prev => {
            const newSet = new Set(prev);
            if (newSet.has(announcementId)) {
                newSet.delete(announcementId);
            } else {
                newSet.add(announcementId);
            }
            return newSet;
        });
    };

    const isAnnouncementExpanded = (announcementId) => {
        return expandedAnnouncements.has(announcementId);
    };

    const renderDashboard = () => (
        <>
            {/* Quick Actions */}
            <div className="section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="row g-4">
                    {quickActions.map((action, index) => (
                        <div className="col-md-6 col-lg-3" key={index}>
                            <div className="action-card" 
                                 style={{ borderTop: `4px solid ${action.color}` }}
                                 onClick={() => window.location.href = action.path}>
                                <div className="action-icon" style={{ color: action.color }}>
                                    {action.title === 'Profile' ? (
                                        profilePic && !profilePicError ? (
                                            <img 
                                                src={profilePic} 
                                                alt="Profile" 
                                                style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    borderRadius: '50%', 
                                                    objectFit: 'cover',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                onError={() => setProfilePicError(true)}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                backgroundColor: '#6c757d',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                <i className="fas fa-user" style={{
                                                    fontSize: '30px',
                                                    opacity: 0.7
                                                }}></i>
                                            </div>
                                        )
                                    ) : (
                                        action.icon
                                    )}
                                </div>
                                <div className="action-content">
                                    <h5 className="action-title">{action.title}</h5>
                                    <p className="action-description">{action.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Announcements */}
            <div className="section">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fas fa-bullhorn me-2 text-primary"></i>
                        Announcements
                    </h2>
                    <div className="announcement-count">
                        <span className="badge bg-primary rounded-pill">{announcements.length}</span>
                    </div>
                </div>
                
                <div className="announcements-container">
                    {announcementsLoading ? (
                        <div className="announcement-loading">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading announcements...</p>
                        </div>
                    ) : announcements.length > 0 ? (
                        <div className="announcements-grid">
                            {announcements.map(announcement => (
                                <div key={announcement.id} className="announcement-card">
                                    <div className="announcement-card-header">
                                        <div className="announcement-meta">
                                            <span className="priority-badge" 
                                                  style={{ backgroundColor: getPriorityColor(announcement.priority) }}>
                                                <i className={`fas ${announcement.priority === 'high' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-1`}></i>
                                                {getPriorityLabel(announcement.priority)}
                                            </span>
                                            <span className="announcement-type-badge">
                                                <i className="fas fa-bell me-1"></i>
                                                {announcement.type === 'requirements_reminder' ? 'Requirements' : 'General'}
                                            </span>
                                        </div>
                                        <div className="announcement-date">
                                            <i className="far fa-calendar-alt me-1"></i>
                                            {announcement.date}
                                        </div>
                                    </div>
                                    
                                    <div className="announcement-content">
                                        <h5 className="announcement-title">
                                            <i className="fas fa-file-alt me-2 text-primary"></i>
                                            {announcement.title}
                                        </h5>
                                        <div className="announcement-actions">
                                            <button 
                                                className={`btn btn-sm ${isAnnouncementExpanded(announcement.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => toggleAnnouncementVisibility(announcement.id)}
                                                title={isAnnouncementExpanded(announcement.id) ? 'Hide message' : 'Show message'}
                                            >
                                                <i className={`fas ${isAnnouncementExpanded(announcement.id) ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                                                {isAnnouncementExpanded(announcement.id) ? 'Hide Details' : 'View Details'}
                                            </button>
                                            <button className="btn btn-outline-secondary btn-sm">
                                                <i className="fas fa-bookmark me-1"></i>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Expandable Message Content */}
                                    {isAnnouncementExpanded(announcement.id) && (
                                        <div className="announcement-message">
                                            <div className="message-content">
                                                <p className="message-text">{announcement.title}</p>
                                            </div>
                                            <div className="message-footer">
                                                <small className="text-muted">
                                                    <i className="fas fa-clock me-1"></i>
                                                    Posted on {announcement.date}
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="announcement-empty-state">
                            <div className="empty-state-icon">
                                <i className="fas fa-bell-slash"></i>
                            </div>
                            <h5 className="empty-state-title">No Announcements</h5>
                            <p className="empty-state-description">
                                You're all caught up! Check back later for new updates and important information.
                            </p>
                        </div>
                    )}
                </div>
            </div>


        </>
    );

    const renderRegistrationForm = () => (
        <div className="section">
            <StudentRegistrationForm />
        </div>
    );


    if (loading) {
        return (
            <div className="student-homepage">
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your student information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-homepage">
                <div className="container text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Data</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-homepage">
            {/* Welcome Modal shown after first login following registration */}
            <CustomAlert
                isOpen={showWelcomeModal}
                onClose={() => {
                    setShowWelcomeModal(false);
                    try { localStorage.removeItem('showWelcomeRegistrationPrompt'); } catch (_) {}
                }}
                hideDefaultButton={true}
                contentStyle={{ maxWidth: '720px', width: '92%' }}
            >
                <div style={{ lineHeight: 1.7 }}>
                    <p style={{ marginBottom: 12, fontWeight: 800 }}>
                        {`Welcome ${localStorage.getItem('registeredStudentName') || userData.fullName}.`}
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        To complete your student onboarding, please open the Registration Form and provide your permanent student record.
                    </p>
                    <p style={{ marginBottom: 12 }}>
                        Make sure to enter your personal information accurately. Review your details before submitting to avoid delays in processing.
                    </p>
                    <p style={{ marginBottom: 18 }}>
                        Once your registration is submitted, you may request school documents anytime from your dashboard.
                    </p>
                    <div>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setActiveTab('registration');
                                setShowWelcomeModal(false);
                                try { localStorage.removeItem('showWelcomeRegistrationPrompt'); } catch (_) {}
                            }}
                        >
                            Go to Registration Form →
                        </button>
                    </div>
                </div>
            </CustomAlert>
            {/* Header Section */}
            <div className="header-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="welcome-title">Welcome back, {userData.fullName}</h1>
                            <p className="welcome-subtitle">Student ID: {userData.studentId}</p>
                            <p className="welcome-description">
                                Access your academic information and manage your student account
                            </p>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="date-display">
                                <div className="current-date">
                                    {new Date().toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Navigation Tabs */}
                <div className="navigation-tabs">
                    <div className="tab-container">
                        <button 
                            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <span className="tab-icon">🏠</span>
                            Dashboard
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'registration' ? 'active' : ''}`}
                            onClick={() => setActiveTab('registration')}
                        >
                            <span className="tab-icon">📝</span>
                            Registration Form
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'registration' && renderRegistrationForm()}
                </div>
            </div>
        </div>
    );
}

export default StudentHomePage;
