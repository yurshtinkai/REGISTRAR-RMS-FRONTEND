import React from 'react';
import { Link } from 'react-router-dom'; // <<<--- ADD THIS IMPORT

function AllStudentsView({ enrolledStudents }) {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    const handleViewClick = (e) => {
        if (!isAdmin) {
            e.preventDefault();
            // Optionally, you can show a message, but for now, it just blocks the click.
            // alert('You do not have permission to view student details.');
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Students</h2>
                <div>
                    <button className="btn btn-outline-secondary me-2">Export</button>
                    <button className="btn btn-primary">+ Add New</button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Student List</h4>
                </div>
                <div className="card-body">
                     <div className="row mb-3">
                        <div className="col-md-6"><div className="input-group"><input type="text" className="form-control" placeholder="Search..." disabled={!isAdmin}/><button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div>
                     </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID No.</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Course</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.length > 0 ? enrolledStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.idNo}</td>
                                        <td>{student.name}</td>
                                        <td>{student.gender}</td>
                                        <td>{student.course}</td>
                                        <td><span className="badge bg-success">Regular</span></td>
                                        <td>{student.createdAt}</td>
                                        <td>
                                            {/* START: Updated Button */}
                                            <Link to={`/admin/students/${student.idNo}`} className="btn btn-sm btn-info me-1 " title="View" onClick={handleViewClick}>
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            {/* END: Updated Button */}
                                            <button className="btn btn-sm btn-primary" title="Edit" onClick={handleViewClick}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center text-muted">No students enrolled yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllStudentsView;