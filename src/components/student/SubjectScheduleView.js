import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './SubjectScheduleView.css';

function SubjectScheduleView() {
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedView, setSelectedView] = useState('weekly'); // 'weekly' or 'list'

    useEffect(() => {
        fetchScheduleData();
    }, []);

    const fetchScheduleData = async () => {
        try {
            setLoading(true);
            
            // Validate and refresh session first
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

            // Try to get the student's profile to determine correct year/semester
            let userId = localStorage.getItem('userId');
            let yearLevelParam = '';
            let semesterParam = '';
            let schoolYearParam = '';

            try {
                const profileResp = await fetch(`${API_BASE_URL}/students/profile`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                if (profileResp.ok) {
                    const profile = await profileResp.json();
                    userId = String(profile.id || userId || '');
                    const yr = profile.currentYearLevel || '';
                    const sem = profile.currentSemester || '';
                    const sy = profile.yearOfEntry ? `${profile.yearOfEntry}-${profile.yearOfEntry + 1}` : '';

                    // Normalize values to backend format
                    const mapYear = (y) => {
                        const m = {
                            '1st': '1st Year', '2nd': '2nd Year', '3rd': '3rd Year', '4th': '4th Year'
                        };
                        return m[y] || (y?.includes('Year') ? y : y ? `${y} Year` : '');
                    };
                    const mapSem = (s) => {
                        const m = { '1st': '1st Semester', '2nd': '2nd Semester', 'Summer': 'Summer' };
                        return m[s] || (s?.includes('Semester') ? s : s ? `${s} Semester` : '');
                    };
                    yearLevelParam = mapYear(yr);
                    semesterParam = mapSem(sem);
                    schoolYearParam = sy || '2025-2026';
                }
            } catch (e) {
                // ignore, use defaults/localStorage
            }

            if (!userId) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const query = new URLSearchParams();
            if (yearLevelParam) query.set('yearLevel', yearLevelParam);
            if (semesterParam) query.set('semester', semesterParam);
            if (schoolYearParam) query.set('schoolYear', schoolYearParam);

            // Fetch schedule data using derived params
            const response = await fetch(`${API_BASE_URL}/schedules/student/${userId}?${query.toString()}`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📅 Schedule data received:', data);
                setScheduleData(data);
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch schedule data:', response.status, errorText);
                setError('Failed to fetch schedule data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching schedule data:', err);
            setError('Error fetching schedule data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return 'TBA';
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

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'badge bg-success';
            case 'closed':
                return 'badge bg-danger';
            case 'cancelled':
                return 'badge bg-warning text-dark';
            default:
                return 'badge bg-secondary';
        }
    };

    const getCourseTypeBadge = (type) => {
        switch (type?.toLowerCase()) {
            case 'lecture':
                return 'badge bg-primary';
            case 'laboratory':
                return 'badge bg-info';
            case 'both':
                return 'badge bg-warning text-dark';
            default:
                return 'badge bg-secondary';
        }
    };

    if (loading) {
        return (
            <div className="subject-schedule-container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading your class schedule...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subject-schedule-container">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Schedule</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={fetchScheduleData}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!scheduleData || !scheduleData.subjects || scheduleData.subjects.length === 0) {
        return (
            <div className="subject-schedule-container">
                <div className="text-center py-5">
                    <div className="alert alert-info">
                        <h4>No Schedule Data Found</h4>
                        <p>No subjects or schedules are available for {scheduleData?.yearLevel || 'current'} Year, {scheduleData?.semester || 'current'} Semester.</p>
                        <p className="text-muted">Please contact the registrar's office for schedule information.</p>
                        <div className="mt-3">
                            <button 
                                className="btn btn-primary"
                                onClick={fetchScheduleData}
                            >
                                <i className="fas fa-refresh me-2"></i>
                                Refresh Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const subjectsWithSchedules = scheduleData.subjects.filter(subject => subject.hasSchedule);

    return (
        <div className="subject-schedule-container">
            {/* Header Section */}
            <div className="schedule-header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="schedule-title">
                                <i className="fas fa-calendar-alt me-3"></i>
                                Class Schedule
                            </h1>
                            <p className="schedule-subtitle">
                                Academic Year {scheduleData.schoolYear} • 
                                {scheduleData.yearLevel} Year • {scheduleData.semester} Semester
                            </p>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="schedule-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Units:</span>
                                    <span className="summary-value">{scheduleData.totalUnits}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Subjects:</span>
                                    <span className="summary-value">{scheduleData.totalSubjects}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Scheduled:</span>
                                    <span className="summary-value">{scheduleData.scheduledSubjects}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* View Toggle */}
                <div className="view-toggle mb-4">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className={`btn ${selectedView === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setSelectedView('weekly')}
                        >
                            <i className="fas fa-calendar-week me-2"></i>
                            Weekly View
                        </button>
                        <button
                            type="button"
                            className={`btn ${selectedView === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setSelectedView('list')}
                        >
                            <i className="fas fa-list me-2"></i>
                            List View
                        </button>
                    </div>
                </div>

                {selectedView === 'weekly' ? (
                    /* Weekly Calendar View */
                    <div className="weekly-schedule-view">
                        <div className="schedule-grid">
                            {weekDays.map(day => {
                                const daySubjects = subjectsWithSchedules.filter(subject => 
                                    subject.schedules.some(schedule => 
                                        schedule.day?.toLowerCase() === day.toLowerCase()
                                    )
                                );
                                
                                return (
                                    <div key={day} className="schedule-day">
                                        <div className="day-header">
                                            <h5>{day}</h5>
                                            <small className="text-muted">
                                                {daySubjects.length} class{daySubjects.length !== 1 ? 'es' : ''}
                                            </small>
                                        </div>
                                        <div className="day-subjects">
                                            {daySubjects.length > 0 ? (
                                                daySubjects.map((subject, index) => {
                                                    const daySchedule = subject.schedules.find(schedule => 
                                                        schedule.day?.toLowerCase() === day.toLowerCase()
                                                    );
                                                    
                                                    return (
                                                        <div key={index} className="schedule-item">
                                                            <div className="subject-header">
                                                                <div className="subject-code">{subject.courseCode}</div>
                                                                <div className="subject-type">
                                                                    {getCourseTypeBadge(subject.courseType)}
                                                                </div>
                                                            </div>
                                                            <div className="subject-title">{subject.courseDescription}</div>
                                                            <div className="schedule-details">
                                                                <div className="time-slot">
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                                                                </div>
                                                                <div className="room-info">
                                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                                    {daySchedule.room}
                                                                </div>
                                                                {daySchedule.instructor && (
                                                                    <div className="instructor-info">
                                                                        <i className="fas fa-user-tie me-1"></i>
                                                                        {daySchedule.instructor}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="schedule-status">
                                                                {getStatusBadge(daySchedule.scheduleStatus)}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="no-classes">
                                                    <i className="fas fa-coffee text-muted"></i>
                                                    <span>No Classes</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="list-schedule-view">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-list me-2"></i>
                                    Subject Schedule List
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Course Code & Title</th>
                                                <th className="text-center">Units</th>
                                                <th className="text-center">Type</th>
                                                <th className="text-center">Schedule</th>
                                                <th className="text-center">Room</th>
                                                <th className="text-center">Instructor</th>
                                                <th className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjectsWithSchedules.map((subject, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div>
                                                            <strong className="text-primary">{subject.courseCode}</strong>
                                                            <br />
                                                            <small className="text-muted">{subject.courseDescription}</small>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-info">{subject.units}</span>
                                                    </td>
                                                    <td className="text-center">
                                                        {getCourseTypeBadge(subject.courseType)}
                                                    </td>
                                                    <td className="text-center">
                                                        {subject.schedules.map((schedule, sIndex) => (
                                                            <div key={sIndex} className="mb-1">
                                                                <div className="fw-bold">{getDayAbbreviation(schedule.day)}</div>
                                                                <small className="text-muted">
                                                                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="text-center">
                                                        {subject.schedules.map((schedule, sIndex) => (
                                                            <div key={sIndex} className="mb-1">
                                                                {schedule.room}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="text-center">
                                                        {subject.schedules.map((schedule, sIndex) => (
                                                            <div key={sIndex} className="mb-1">
                                                                {schedule.instructor || 'TBA'}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="text-center">
                                                        {subject.schedules.map((schedule, sIndex) => (
                                                            <div key={sIndex} className="mb-1">
                                                                {getStatusBadge(schedule.scheduleStatus)}
                                                            </div>
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Information */}
                <div className="additional-info-section mt-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                                <i className="fas fa-info-circle me-2"></i>
                                Schedule Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-info mb-3">Important Notes</h6>
                                    <ul className="list-unstyled">
                                        <li>• All times are in 12-hour format</li>
                                        <li>• Room assignments may change - check regularly</li>
                                        <li>• Contact your instructor for any schedule changes</li>
                                        <li>• Report schedule conflicts to the registrar's office</li>
                                    </ul>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-info mb-3">Legend</h6>
                                    <div className="legend-items">
                                        <div className="legend-item">
                                            <span className="badge bg-primary me-2">Lecture</span>
                                            <small>Classroom-based instruction</small>
                                        </div>
                                        <div className="legend-item">
                                            <span className="badge bg-info me-2">Laboratory</span>
                                            <small>Hands-on practical work</small>
                                        </div>
                                        <div className="legend-item">
                                            <span className="badge bg-success me-2">Open</span>
                                            <small>Schedule is active</small>
                                        </div>
                                        <div className="legend-item">
                                            <span className="badge bg-danger me-2">Closed</span>
                                            <small>Schedule is full</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubjectScheduleView;
