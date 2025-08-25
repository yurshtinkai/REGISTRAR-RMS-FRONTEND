import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import './EnrollmentStatusView.css';

function EnrollmentStatusView() {
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [availableSemesters, setAvailableSemesters] = useState([]);

    useEffect(() => {
        fetchEnrollmentData();
    }, []);

    const fetchEnrollmentData = async () => {
        try {
            setLoading(true);
            const sessionToken = getSessionToken();
            
            if (!sessionToken) {
                setError('No session token found. Please login again.');
                setLoading(false);
                return;
            }

            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            // Fetch enrollment data
            const response = await fetch(`${API_BASE_URL}/students/enrollment-status/${userId}`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEnrollmentData(data);
                
                // Extract available semesters
                if (data.subjects && data.subjects.length > 0) {
                    const semesters = [...new Set(data.subjects.map(subject => subject.semester))];
                    setAvailableSemesters(semesters);
                    if (semesters.length > 0) {
                        setSelectedSemester(semesters[0]);
                    }
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch enrollment data:', response.status, errorText);
                setError('Failed to fetch enrollment data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching enrollment data:', err);
            setError('Error fetching enrollment data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'enrolled':
            case 'active':
                return 'badge bg-success';
            case 'pending':
            case 'waiting':
                return 'badge bg-warning text-dark';
            case 'dropped':
            case 'withdrawn':
                return 'badge bg-danger';
            case 'completed':
            case 'finished':
                return 'badge bg-info';
            default:
                return 'badge bg-secondary';
        }
    };

    const getGradeColor = (grade) => {
        if (!grade || grade === 'N/A') return 'text-muted';
        
        const numGrade = parseFloat(grade);
        if (isNaN(numGrade)) return 'text-muted';
        
        if (numGrade >= 1.0 && numGrade <= 1.5) return 'text-success fw-bold';
        if (numGrade >= 1.6 && numGrade <= 2.0) return 'text-primary';
        if (numGrade >= 2.1 && numGrade <= 2.5) return 'text-warning';
        if (numGrade >= 2.6 && numGrade <= 3.0) return 'text-danger';
        if (numGrade > 3.0) return 'text-danger fw-bold';
        
        return 'text-muted';
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getDayAbbreviation = (day) => {
        const dayMap = {
            'monday': 'Mon',
            'tuesday': 'Tue',
            'wednesday': 'Wed',
            'thursday': 'Thu',
            'friday': 'Fri',
            'saturday': 'Sat',
            'sunday': 'Sun'
        };
        return dayMap[day?.toLowerCase()] || day;
    };

    if (loading) {
        return (
            <div className="enrollment-status-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your enrollment information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="enrollment-status-container">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Enrollment Data</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={fetchEnrollmentData}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!enrollmentData || !enrollmentData.subjects || enrollmentData.subjects.length === 0) {
        return (
            <div className="enrollment-status-container">
                <div className="text-center py-5">
                    <div className="alert alert-info">
                        <h4>No Enrollment Data Found</h4>
                        <p>{enrollmentData?.message || 'You are not currently enrolled in any subjects for this semester.'}</p>
                        <p className="text-muted">Please contact the registrar's office for enrollment assistance.</p>
                        <div className="mt-3">
                            <button 
                                className="btn btn-primary"
                                onClick={fetchEnrollmentData}
                            >
                                <i className="fas fa-refresh me-2"></i>
                                Refresh Enrollment Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const filteredSubjects = selectedSemester 
        ? enrollmentData.subjects.filter(subject => subject.semester === selectedSemester)
        : enrollmentData.subjects;

    const totalUnits = filteredSubjects.reduce((sum, subject) => sum + (parseFloat(subject.units) || 0), 0);

    return (
        <div className="enrollment-status-container">
            {/* Header Section */}
            <div className="enrollment-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="enrollment-title">
                                <i className="fas fa-graduation-cap me-3"></i>
                                Enrollment Status
                            </h1>
                            <p className="enrollment-subtitle">
                                Academic Year {enrollmentData.schoolYear || '2025-2026'} • 
                                {enrollmentData.yearLevel} Year • {enrollmentData.semester} Semester
                            </p>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="enrollment-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Units:</span>
                                    <span className="summary-value">{totalUnits}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Subjects:</span>
                                    <span className="summary-value">{filteredSubjects.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Semester Filter */}
                {availableSemesters.length > 1 && (
                    <div className="semester-filter mb-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <label htmlFor="semesterSelect" className="form-label fw-bold">
                                            <i className="fas fa-calendar-alt me-2"></i>
                                            Select Semester
                                        </label>
                                    </div>
                                    <div className="col-md-6">
                                        <select
                                            id="semesterSelect"
                                            className="form-select form-select-lg"
                                            value={selectedSemester}
                                            onChange={(e) => setSelectedSemester(e.target.value)}
                                        >
                                            {availableSemesters.map((semester, index) => (
                                                <option key={index} value={semester}>
                                                    {semester} Semester
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrollment Summary Card */}
                <div className="enrollment-summary-card mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-info-circle me-2"></i>
                                Enrollment Summary
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="summary-stat">
                                        <div className="stat-number">{enrollmentData.yearLevel}</div>
                                        <div className="stat-label">Year Level</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="summary-stat">
                                        <div className="stat-number">{enrollmentData.semester}</div>
                                        <div className="stat-label">Semester</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="summary-stat">
                                        <div className="stat-number">{totalUnits}</div>
                                        <div className="stat-label">Total Units</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="summary-stat">
                                        <div className="stat-number">{filteredSubjects.length}</div>
                                        <div className="stat-label">Subjects</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Subjects Table */}
                <div className="enrolled-subjects-section mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-book me-2"></i>
                                Enrolled Subjects
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Course Code & Title</th>
                                            <th className="text-center">Units</th>
                                            <th className="text-center">Schedule</th>
                                            <th className="text-center">Room</th>
                                            <th className="text-center">Final Grade</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubjects.map((subject, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div>
                                                        <strong className="text-primary">{subject.courseCode}</strong>
                                                        <br />
                                                        <small className="text-muted">{subject.courseTitle}</small>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="badge bg-info">{subject.units}</span>
                                                </td>
                                                <td className="text-center">
                                                    {subject.schedule ? (
                                                        <div>
                                                            <div className="fw-bold">{getDayAbbreviation(subject.schedule.day)}</div>
                                                            <small className="text-muted">
                                                                {formatTime(subject.schedule.startTime)} - {formatTime(subject.schedule.endTime)}
                                                            </small>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted">TBA</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {subject.schedule?.room || 'TBA'}
                                                </td>
                                                <td className="text-center">
                                                    <span className={getGradeColor(subject.finalGrade)}>
                                                        {subject.finalGrade || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={getStatusBadge(subject.status)}>
                                                        {subject.status || 'Not Enrolled'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="weekly-schedule-section mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-warning text-dark">
                            <h5 className="mb-0">
                                <i className="fas fa-calendar-week me-2"></i>
                                Weekly Schedule
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="schedule-grid">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                    const daySubjects = filteredSubjects.filter(subject => 
                                        subject.schedule && 
                                        subject.schedule.day?.toLowerCase() === day.toLowerCase()
                                    );
                                    
                                    return (
                                        <div key={day} className="schedule-day">
                                            <div className="day-header">{day}</div>
                                            <div className="day-subjects">
                                                {daySubjects.length > 0 ? (
                                                    daySubjects.map((subject, index) => (
                                                        <div key={index} className="schedule-item">
                                                            <div className="subject-code">{subject.courseCode}</div>
                                                            <div className="subject-time">
                                                                {formatTime(subject.schedule.startTime)} - {formatTime(subject.schedule.endTime)}
                                                            </div>
                                                            <div className="subject-room">{subject.schedule.room}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-classes">No Classes</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div className="additional-info-section">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-clipboard-list me-2"></i>
                                Additional Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-info mb-3">Academic Calendar</h6>
                                    <ul className="list-unstyled">
                                        <li><strong>Start of Classes:</strong> {enrollmentData.startDate || 'TBA'}</li>
                                        <li><strong>End of Classes:</strong> {enrollmentData.endDate || 'TBA'}</li>
                                        <li><strong>Final Examinations:</strong> {enrollmentData.finalExamDate || 'TBA'}</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-info mb-3">Important Reminders</h6>
                                    <ul className="list-unstyled">
                                        <li>• Attend all classes regularly</li>
                                        <li>• Submit assignments on time</li>
                                        <li>• Check your grades regularly</li>
                                        <li>• Contact your professors for concerns</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EnrollmentStatusView;
