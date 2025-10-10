import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

function AllStudentsView({ enrolledStudents }) {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';
    
    // Local state for students data
    const [localStudents, setLocalStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log('AllStudentsView - enrolledStudents:', enrolledStudents); // Debug log
    console.log('AllStudentsView - enrolledStudents.length:', enrolledStudents?.length || 0); // Debug log
    
    // Fetch students data when component mounts
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const sessionToken = getSessionToken();
                
                if (!sessionToken) {
                    setError('No session token found');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/students`, {
                    headers: {
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const students = await response.json();
                    console.log('AllStudentsView - Fetched students:', students);
                    
                    // Transform the data to match the expected format
                    const transformedStudents = students.map(student => ({
                        id: student.id,
                        idNumber: student.idNumber,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        middleName: student.middleName,
                        gender: student.gender || 'N/A',
                        course: student.course || 'Not registered',
                        registrationStatus: student.academicStatus || 'Not registered',
                        registrationDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : 'N/A'
                    }));
                    
                    setLocalStudents(transformedStudents);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch students:', response.status, errorText);
                    setError('Failed to fetch students');
                }
            } catch (err) {
                console.error('Error fetching students:', err);
                setError('Error fetching students');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we don't have data from props or if props data is empty
        if (!enrolledStudents || enrolledStudents.length === 0) {
            fetchStudents();
        } else {
            setLocalStudents(enrolledStudents);
            setLoading(false);
        }
    }, [enrolledStudents]);
    
    // Use local students data if available, otherwise fall back to props
    const students = localStudents.length > 0 ? localStudents : (Array.isArray(enrolledStudents) ? enrolledStudents : []);
    
    const [searchTerm, setSearchTerm] = useState('');

    const handleViewClick = (e) => {
        if (!isAdmin) {
            e.preventDefault();
            // Optionally, you can show a message, but for now, it just blocks the click.
            // alert('You do not have permission to view student details.');
        }
    };

    const filteredStudents = students.filter(student => {
        // Add null checks to prevent toLowerCase() errors
        if (!student || !student.lastName || !student.firstName || !student.idNumber) {
            return false; // Skip students with missing required data
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        const nameLower = `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.toLowerCase();
        const idNoLower = student.idNumber.toLowerCase();
        
        return nameLower.includes(searchTermLower) || idNoLower.includes(searchTermLower);
    });

    // Abbreviate course name for list view only
    const abbreviateCourse = (courseName) => {
        if (!courseName) return 'N/A';
        const normalized = String(courseName).trim().toLowerCase();
        if (normalized === 'bachelor of science in information technology' || normalized === 'bs in information technology' || normalized === 'bs information technology') {
            return 'BSIT';
        }
        return courseName;
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="m-0"></h2>
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
                        <div className="col-md-6"><div className="input-group">
                            <input type="text" 
                            className="form-control" 
                            placeholder="Search by ID No. or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div>
                     </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID No.</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Course</th>
                                    <th>Registration Status</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            <div className="d-flex justify-content-center align-items-center py-4">
                                                <div className="spinner-border text-primary me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span>Loading students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-danger py-4">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredStudents.length > 0 ? filteredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.idNumber || 'N/A'}</td>
                                        <td>{student.lastName && student.firstName ? `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.trim() : 'N/A'}</td>
                                        <td>{student.gender || 'N/A'}</td>
                                        <td>{abbreviateCourse(student.course)}</td>
                                        <td>
                                            <span className={`badge ${student.registrationStatus === 'Enrolled' ? 'bg-success' : 'bg-warning'}`}>
                                                {student.registrationStatus || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{student.registrationDate || 'N/A'}</td>
                                        <td>
                                            {/* Eye icon - View student details */}
                                            <Link to={`/admin/students/${student.idNumber || '#'}`} className="btn btn-sm btn-info me-1" title="View Details">
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            {/* Pencil icon - Edit student info */}
                                            <Link to={`/admin/students/${student.idNumber || '#'}/edit`} className="btn btn-sm btn-primary" title="Edit Info">
                                                <i className="fas fa-pencil-alt"></i>
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" className="text-center text-muted">No students have completed registration yet.</td></tr>
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