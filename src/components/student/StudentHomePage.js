import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './StudentHomePage.css';
import StudentRegistrationForm from './StudentRegistrationForm';

function StudentHomePage() {
    const [userData, setUserData] = useState({
        fullName: '',
        studentId: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    // Fetch user data from database using session token
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const sessionToken = localStorage.getItem('sessionToken');
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

    const announcements = [
        { 
            id: 1, 
            title: 'Enrollment for 1st Semester AY 2025-2026 now open!', 
            date: 'July 15, 2025',
            priority: 'high'
        },
        { 
            id: 2, 
            title: 'Deadline for TOR requests: August 5, 2025', 
            date: 'July 30, 2025',
            priority: 'medium'
        },
        { 
            id: 3, 
            title: 'Academic Calendar for AY 2025-2026 available', 
            date: 'July 10, 2025',
            priority: 'low'
        }
    ];

    const quickActions = [
        { 
            title: 'Request Document', 
            description: 'Submit document requests',
            icon: '📄',
            path: '/student/requests',
            color: '#2E86AB'
        },
        { 
            title: 'View Grades', 
            description: 'Check academic performance',
            icon: '📊',
            path: '/student/grades',
            color: '#A23B72'
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
                                    {action.icon}
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
                <h2 className="section-title">Announcements</h2>
                <div className="announcements-container">
                    {announcements.map(announcement => (
                        <div key={announcement.id} className="announcement-item">
                            <div className="announcement-header">
                                <span className="priority-badge" 
                                      style={{ backgroundColor: getPriorityColor(announcement.priority) }}>
                                    {getPriorityLabel(announcement.priority)}
                                </span>
                                <span className="announcement-date">{announcement.date}</span>
                            </div>
                            <h6 className="announcement-title">{announcement.title}</h6>
                        </div>
                    ))}
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
