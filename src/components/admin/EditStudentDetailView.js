import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

function EditStudentDetailView() {
    const { idNo } = useParams();
    const navigate = useNavigate();
    
    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]); // State for the course dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch the list of available courses for the dropdown
                const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (coursesResponse.ok) {
                    setCourses(await coursesResponse.json());
                } else {
                    console.error("Failed to fetch courses.");
                }

                // Find the student's internal ID from their public idNo
                const allStudentsResponse = await fetch(`${API_BASE_URL}/students`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (!allStudentsResponse.ok) throw new Error('Could not fetch student list to find ID.');
                
                const allStudents = await allStudentsResponse.json();
                const studentToEdit = allStudents.find(s => s.idNumber === idNo);

                if (!studentToEdit) {
                    throw new Error('Student not found.');
                }
                
                // Fetch the complete, detailed record using the internal ID
                const detailResponse = await fetch(`${API_BASE_URL}/students/${studentToEdit.id}`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });

                if (!detailResponse.ok) throw new Error('Failed to fetch detailed student data.');

                const data = await detailResponse.json();
                setStudent({ ...data, ...(data.studentDetails || {}) });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [idNo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/students/${student.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(student)
            });

            if (response.ok) {
                alert('Student details updated successfully!');
                navigate(`/admin/students/${idNo}`);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update student.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5">Loading student data...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!student) return <div className="alert alert-warning m-4">Student data could not be loaded.</div>;

    return (
        <div className="container-fluid py-4">
            <form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">
                        <i className="fas fa-edit text-primary me-2"></i>
                        Edit Student: {student.lastName}, {student.firstName}
                    </h2>
                    <div>
                        <Link to={`/admin/students/${idNo}`} className="btn btn-outline-secondary me-2">
                            Cancel
                        </Link>
                         <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* --- Personal Information Section --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0"><i className="fas fa-user me-2"></i>Personal Information</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4 mb-3"><label className="form-label">First Name</label><input type="text" className="form-control" name="firstName" value={student.firstName || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Middle Name</label><input type="text" className="form-control" name="middleName" value={student.middleName || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Last Name</label><input type="text" className="form-control" name="lastName" value={student.lastName || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Gender</label><select className="form-select" name="gender" value={student.gender || ''} onChange={handleInputChange}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Marital Status</label><input type="text" className="form-control" name="maritalStatus" value={student.maritalStatus || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Date of Birth</label><input type="date" className="form-control" name="dateOfBirth" value={student.dateOfBirth ? student.dateOfBirth.split('T')[0] : ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Place of Birth</label><input type="text" className="form-control" name="placeOfBirth" value={student.placeOfBirth || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Religion</label><input type="text" className="form-control" name="religion" value={student.religion || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Citizenship</label><input type="text" className="form-control" name="citizenship" value={student.citizenship || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" value={student.email || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Contact Number</label><input type="text" className="form-control" name="contactNumber" value={student.contactNumber || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-6 mb-3"><label className="form-label">City Address</label><input type="text" className="form-control" name="cityAddress" value={student.cityAddress || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-6 mb-3"><label className="form-label">Provincial Address</label><input type="text" className="form-control" name="provincialAddress" value={student.provincialAddress || ''} onChange={handleInputChange} /></div>
                        </div>
                    </div>
                </div>
                
                {/* --- Family Background Section --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0"><i className="fas fa-users me-2"></i>Family Background</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4"><h6>Father's Information</h6><hr/><div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="fatherName" value={student.fatherName || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="fatherOccupation" value={student.fatherOccupation || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" name="fatherContactNumber" value={student.fatherContactNumber || ''} onChange={handleInputChange}/></div></div>
                            <div className="col-md-4"><h6>Mother's Information</h6><hr/><div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="motherName" value={student.motherName || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="motherOccupation" value={student.motherOccupation || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" name="motherContactNumber" value={student.motherContactNumber || ''} onChange={handleInputChange}/></div></div>
                            <div className="col-md-4"><h6>Guardian's Information</h6><hr/><div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" name="guardianName" value={student.guardianName || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Occupation</label><input type="text" className="form-control" name="guardianOccupation" value={student.guardianOccupation || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Contact</label><input type="text" className="form-control" name="guardianContactNumber" value={student.guardianContactNumber || ''} onChange={handleInputChange}/></div></div>
                        </div>
                    </div>
                </div>

                {/* --- Academic Background Section --- */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0"><i className="fas fa-graduation-cap me-2"></i>Academic Background</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Course</label>
                                <select className="form-select" name="courseId" value={student.courseId || ''} onChange={handleInputChange}>
                                    <option value="">Select Course</option>
                                    {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                                </select>
                            </div>
                            <div className="col-md-4 mb-3"><label className="form-label">Major</label><input type="text" className="form-control" name="major" value={student.major || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Year of Entry</label><input type="number" className="form-control" name="yearOfEntry" value={student.yearOfEntry || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Academic Status</label><input type="text" className="form-control" name="academicStatus" value={student.academicStatus || ''} onChange={handleInputChange} /></div>
                            <div className="col-md-4 mb-3"><label className="form-label">Current Year Level</label><input type="number" className="form-control" name="currentYearLevel" value={student.currentYearLevel || ''} onChange={handleInputChange} /></div>
                        </div>
                    </div>
                </div>

                {/* --- Academic History Section --- */}
                 <div className="card shadow-sm mb-4">
                    <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0"><i className="fas fa-history me-2"></i>Academic History</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4"><h6>Elementary</h6><hr/><div className="mb-3"><label className="form-label">School</label><input type="text" className="form-control" name="elementarySchool" value={student.elementarySchool || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Year Graduated</label><input type="number" className="form-control" name="elementaryYearGraduated" value={student.elementaryYearGraduated || ''} onChange={handleInputChange}/></div></div>
                            <div className="col-md-4"><h6>Junior High School</h6><hr/><div className="mb-3"><label className="form-label">School</label><input type="text" className="form-control" name="juniorHighSchool" value={student.juniorHighSchool || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Year Graduated</label><input type="number" className="form-control" name="juniorHighYearGraduated" value={student.juniorHighYearGraduated || ''} onChange={handleInputChange}/></div></div>
                            <div className="col-md-4"><h6>Senior High School</h6><hr/><div className="mb-3"><label className="form-label">School</label><input type="text" className="form-control" name="seniorHighSchool" value={student.seniorHighSchool || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Year Graduated</label><input type="number" className="form-control" name="seniorHighYearGraduated" value={student.seniorHighYearGraduated || ''} onChange={handleInputChange}/></div><div className="mb-3"><label className="form-label">Strand</label><input type="text" className="form-control" name="seniorHighStrand" value={student.seniorHighStrand || ''} onChange={handleInputChange}/></div></div>
                        </div>
                    </div>
                </div>

                <div className="text-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditStudentDetailView;