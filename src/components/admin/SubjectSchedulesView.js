import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function SubjectSchedulesView() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    const userRole = localStorage.getItem('userRole');
    const isAccounting = userRole === 'accounting';
    const isAdmin = userRole === 'admin';

    // Fetch real schedule data from database
    useEffect(() => {
        fetchSchedules();
    }, [selectedYearLevel, selectedSemester, selectedSchoolYear]);

    const fetchSchedules = async () => {
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

            // Build query parameters
            const params = new URLSearchParams();
            if (selectedYearLevel) params.append('yearLevel', selectedYearLevel);
            if (selectedSemester) params.append('semester', selectedSemester);
            if (selectedSchoolYear) params.append('schoolYear', selectedSchoolYear);

            const response = await fetch(`${API_BASE_URL}/schedules/admin/all?${params}`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📅 Admin schedules data received:', data);
                
                // Transform the data to match the table structure
                const transformedSchedules = [];
                data.forEach(yearGroup => {
                    yearGroup.subjects.forEach(subject => {
                        if (subject.hasSchedule) {
                            subject.schedules.forEach(schedule => {
                                transformedSchedules.push({
                                    id: schedule.id,
                                    subject: subject.courseCode,
                                    description: subject.courseDescription,
                                    days: schedule.day || 'TBA',
                                    time: schedule.startTime && schedule.endTime ? 
                                        `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}` : 'TBA',
                                    room: schedule.room || 'TBA',
                                    enrollees: `${schedule.currentEnrollment}/${schedule.maxStudents}`,
                                    yearLevel: yearGroup.yearLevel,
                                    semester: yearGroup.semester,
                                    schoolYear: schedule.schoolYear,
                                    instructor: schedule.instructor || 'TBA',
                                    status: schedule.scheduleStatus || 'Open',
                                    units: subject.units,
                                    courseType: subject.courseType
                                });
                            });
                        }
                    });
                });
                
                setSchedules(transformedSchedules);
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch schedules:', response.status, errorText);
                setError('Failed to fetch schedule data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
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

    const filteredSchedules = schedules.filter(schedule =>
        schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewClick = (e) => {
        if (isAccounting) {
            e.preventDefault();
            // window.alert('Forbidden: Access is restricted to administrators.');
        }
    };

    const handleRefresh = () => {
        fetchSchedules();
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading subject schedules...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="text-center py-5">
                    <div className="alert alert-danger">
                        <h4>Error Loading Schedules</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={handleRefresh}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Subject Schedules</h2>
                <span className="text-muted">SUBJECT SCHEDULES / ALL</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Schedule List</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={handleRefresh}>
                            <i className="fas fa-sync-alt me-1"></i> Refresh
                        </button>
                        <button className="btn btn-outline-primary me-2">
                            <i className="fas fa-file-export me-1"></i> Export All
                        </button>
                        <button className="btn btn-outline-secondary">
                            <i className="fas fa-print me-1"></i> Print All
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3 gx-2">
                        <div className="col-md-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!isAdmin}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedYearLevel}
                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                                disabled={!isAdmin}
                            >
                                <option value="">All Year Levels</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                disabled={!isAdmin}
                            >
                                <option value="">All Semesters</option>
                                <option value="1st">1st Semester</option>
                                <option value="2nd">2nd Semester</option>
                                <option value="Summer">Summer</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select 
                                className="form-select" 
                                value={selectedSchoolYear}
                                onChange={(e) => setSelectedSchoolYear(e.target.value)}
                                disabled={!isAdmin}
                            >
                                <option value="">All School Years</option>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2023-2024">2023-2024</option>
                            </select>
                        </div>
                    </div>



                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 500px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Subject</th>
                                    <th>Year Level</th>
                                    <th>Semester</th>
                                    <th>Days</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Instructor</th>
                                    <th>Enrollees</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.length > 0 ? filteredSchedules.map(schedule => (
                                    <tr key={schedule.id}>
                                        <td>
                                            <div><strong>{schedule.subject}</strong></div>
                                            <small className="text-muted">{schedule.description}</small>
                                            <br />
                                            <small className="badge bg-secondary">{schedule.courseType}</small>
                                        </td>
                                        <td>
                                            <span className="badge bg-primary">{schedule.yearLevel}</span>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">{schedule.semester}</span>
                                        </td>
                                        <td>{schedule.days}</td>
                                        <td>{schedule.time}</td>
                                        <td>{schedule.room}</td>
                                        <td>{schedule.instructor}</td>
                                        <td>
                                            <span className={`badge ${parseInt(schedule.enrollees.split('/')[0]) >= parseInt(schedule.enrollees.split('/')[1]) ? 'bg-danger' : 'bg-success'}`}>
                                                {schedule.enrollees}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                schedule.status === 'Open' ? 'bg-success' : 
                                                schedule.status === 'Closed' ? 'bg-danger' : 'bg-warning'
                                            }`}>
                                                {schedule.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/admin/manage/subject-schedules/${schedule.id}/enrolled-students`}
                                                className="btn btn-sm btn-outline-primary"
                                                title="View Enrolled Students"
                                                onClick={handleViewClick}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="10" className="text-center text-muted">
                                            {schedules.length === 0 ? 'No schedules found in database.' : 'No schedules match your search criteria.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubjectSchedulesView;
