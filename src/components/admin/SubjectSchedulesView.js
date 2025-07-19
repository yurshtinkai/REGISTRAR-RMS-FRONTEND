import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createDummySubjectSchedules } from '../../data/dummyData';

function SubjectSchedulesView() {
    const [schedules] = useState(createDummySubjectSchedules());
    const [searchTerm, setSearchTerm] = useState('');

    const userRole = localStorage.getItem('userRole'); // Get current user role
    const isAccounting = userRole === 'accounting';
    const isAdmin = userRole === 'admin';

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
                            <select className="form-select" disabled={!isAdmin}>
                                <option value="">All Courses</option>
                                <option>BSIT</option>
                                <option>BSCS</option>
                                <option>BSBA-HRDM</option>
                                <option>BSED-EN</option>
                                <option>BS-ARCH</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" disabled={!isAdmin}>
                                <option value="">Schedule Set</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select" disabled={!isAdmin}>
                                <option>2024-2025 Summer</option>
                                <option>2024-2025 1st Semester</option>
                                <option>2023-2024 2nd Semester</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Subject</th>
                                    <th>Days</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Number of Enrollees</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSchedules.length > 0 ? filteredSchedules.map(schedule => (
                                    <tr key={schedule.id}>
                                        <td>
                                            <div>{schedule.subject}</div>
                                            <small className="text-muted">{schedule.description}</small>
                                        </td>
                                        <td>{schedule.days}</td>
                                        <td>{schedule.time}</td>
                                        <td>{schedule.room}</td>
                                        <td>{schedule.enrollees}</td>
                                        <td>
                                            <Link
                                                to={`/admin/manage/subject-schedules/${schedule.id}`}
                                                className="btn btn-sm btn-outline-primary"
                                                title="View Details"
                                                onClick={handleViewClick}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No schedules found.</td>
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
