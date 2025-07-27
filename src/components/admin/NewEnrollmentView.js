import React, { useState, useEffect } from 'react';
import { dummySubjects } from '../../data/dummyData'; // Assuming this path is correct
import { API_BASE_URL, getToken } from '../../utils/api'; // Assuming this path is correct
import CustomAlert from '../../CustomAlert'; // Corrected import path

function NewEnrollmentView({ student, onCompleteEnrollment, registrations, setStudentToEnroll, onBack }) {
    const [step, setStep] = useState(1);
    const [enlistedSubjects, setEnlistedSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    const [newStudentInfo, setNewStudentInfo] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        gender: 'Male',
        course: 'BSIT'
    });
    
    // State for the custom modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: null });
    const [createdStudentData, setCreatedStudentData] = useState(null);

    useEffect(() => {
        if (student) {
            setStep(1);
            setEnlistedSubjects([]);
        }
    }, [student]);

    const handleSearch = () => {
        if (!isAdmin || !searchTerm) return;
        const foundStudent = registrations.find(
            reg => reg.regNo === searchTerm && reg.status === 'approved'
        );
        if (foundStudent) {
            setStudentToEnroll(foundStudent);
        } else {
            // Use custom modal for search errors
            setModalContent({ title: 'Search Failed', body: <p>No approved registration found with that number.</p> });
            setIsModalOpen(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudentInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAndEnroll = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const { lastName, firstName, course } = newStudentInfo;
        if (!lastName || !firstName || !course) {
            // Use custom modal for validation errors
            setModalContent({ title: 'Missing Information', body: <p>Last Name, First Name, and Course are required.</p> });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/students/create-and-enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(newStudentInfo)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create student.');
            }

            // Save data and set content for the success modal
            setCreatedStudentData(data.user);
            setModalContent({
                title: 'Student Account Created!',
                body: (
                    <>
                        <pre>
                            {`ID Number: ${data.user.idNumber}\nPassword: ${data.user.password}`}
                        </pre>
                        <p>Please provide these credentials to the student.</p>
                    </>
                )
            });
            setIsModalOpen(true);

        } catch (error) {
            console.error('Error creating student:', error);
            // Use custom modal for API errors
            setModalContent({ title: 'Error', body: <p>{error.message}</p> });
            setIsModalOpen(true);
        }
    };

    // This function runs when the modal's "OK" button is clicked
    const handleCloseModal = () => {
        setIsModalOpen(false);

        // If a student was successfully created, complete the enrollment process
        if (createdStudentData) {
            onCompleteEnrollment({
                id: createdStudentData.id,
                idNo: createdStudentData.idNumber,
                name: createdStudentData.name,
                gender: createdStudentData.gender,
                course: createdStudentData.course,
                createdAt: new Date().toLocaleDateString(),
            });

            // Reset the form and temporary data
            setNewStudentInfo({ lastName: '', firstName: '', middleName: '', gender: 'Male', course: 'BSIT' });
            setCreatedStudentData(null);
        }
    };

    const addSubject = (subject) => { if (!enlistedSubjects.find(s => s.code === subject.code)) { setEnlistedSubjects([...enlistedSubjects, subject]); } };
    const removeSubject = (subjectCode) => { setEnlistedSubjects(enlistedSubjects.filter(s => s.code !== subjectCode)); };
    const totalUnits = enlistedSubjects.reduce((total, s) => total + s.units, 0);

    const renderEnrollmentSteps = () => {
        switch (step) {
            case 1:
                return (<div className="card-body"><div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">ID</label><input type="text" className="form-control" value={student.regNo} disabled /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Last Name</label><input type="text" className="form-control" value={student.name.split(',')[0]} disabled /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">First Name</label><input type="text" className="form-control" value={student.name.split(',')[1].trim().split(' ')[0]} disabled /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Middle Name</label><input type="text" className="form-control" value={student.name.split(' ').pop().replace('.', '')} disabled /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Gender</label><input type="text" className="form-control" value={student.gender} disabled /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Course/Major</label><input type="text" className="form-control" value={student.course} disabled /></div>
                </div><div className="d-flex justify-content-end mt-4"><button className="btn btn-primary" onClick={() => setStep(2)}>Confirm</button></div></div>);
            case 2:
                return (<div className="card-body"><div className="row">
                    <div className="col-md-5"><h6>Available Subjects</h6><div className="list-group" style={{maxHeight: '300px', overflowY: 'auto'}}>{dummySubjects.map(sub => (<div key={sub.code} className="list-group-item d-flex justify-content-between align-items-center">{sub.description}<button className="btn btn-sm btn-success" onClick={() => addSubject(sub)} disabled={enlistedSubjects.some(s => s.code === sub.code)}>+</button></div>))}</div></div>
                    <div className="col-md-7"><h6>Enlisted Subjects ({totalUnits} units)</h6><div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}><table className="table table-sm"><thead><tr><th>Code</th><th>Description</th><th>Units</th><th>Action</th></tr></thead><tbody>
                        {enlistedSubjects.length > 0 ? enlistedSubjects.map(sub => (<tr key={sub.code}><td>{sub.code}</td><td>{sub.description}</td><td>{sub.units}</td><td><button className="btn btn-sm btn-danger" onClick={() => removeSubject(sub.code)}>X</button></td></tr>)) : <tr><td colSpan="4" className="text-center">No subjects added.</td></tr>}
                    </tbody></table></div></div>
                </div><div className="d-flex justify-content-between mt-4"><button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button><button className="btn btn-primary" onClick={() => setStep(3)}>Next</button></div></div>);
            case 3:
                return (<div className="card-body text-center"><h4 className="mb-3">BENEDICTO COLLEGE</h4><p>{student.name.toUpperCase()}<br/>{student.regNo}<br/>SY 2024-2025, Summer</p><h5>Subject Schedules</h5><table className="table"><thead><tr><th>Code</th><th>Description</th><th>Days</th><th>Time</th><th>Room</th><th>Units</th></tr></thead><tbody>
                    {enlistedSubjects.map(sub => (<tr key={sub.code}><td>{sub.code}</td><td>{sub.description}</td><td>{sub.days}</td><td>{sub.schedule}</td><td>{sub.room}</td><td>{sub.units}</td></tr>))}
                    <tr><td colSpan="5" className="text-end fw-bold">Total Units</td><td className="fw-bold">{totalUnits}</td></tr>
                </tbody></table><div className="d-flex justify-content-between mt-4"><button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-success" onClick={() => onCompleteEnrollment(student)}>Complete Enrollment</button></div></div>);
            default: return null;
        }
    };
    
    const renderCreateStudentForm = () => (
        <form onSubmit={handleCreateAndEnroll}>
            <div className="card-body">
                <p className="text-muted">Manually create a new student record. This is for walk-ins, transferees, or other special cases.</p>
                <div className="row">
                    <div className="col-md-6 mb-3"><label className="form-label">Last Name</label><input type="text" className="form-control" name="lastName" value={newStudentInfo.lastName} onChange={handleInputChange} required disabled={!isAdmin} /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">First Name</label><input type="text" className="form-control" name="firstName" value={newStudentInfo.firstName} onChange={handleInputChange} required disabled={!isAdmin} /></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Middle Name</label><input type="text" className="form-control" name="middleName" value={newStudentInfo.middleName} onChange={handleInputChange} disabled={!isAdmin}/></div>
                    <div className="col-md-6 mb-3"><label className="form-label">Gender</label><select className="form-select" name="gender" value={newStudentInfo.gender} onChange={handleInputChange} disabled={!isAdmin}><option>Male</option><option>Female</option></select></div>
                    <div className="col-md-12 mb-3"><label className="form-label">Course/Major</label><select className="form-select" name="course" value={newStudentInfo.course} onChange={handleInputChange} disabled={!isAdmin}><option>BSIT</option><option>BSCS</option><option>BSBA-HRDM</option><option>BSED-EN</option><option>BS-ARCH</option></select></div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-success">Create and Enroll Student</button>
                </div>
            </div>
        </form>
    );

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">New Enrollment</h2>
                <div className="col-md-5">
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search Approved Registration No. to enroll..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!isAdmin}
                        />
                        <button className="btn btn-primary" type="button" onClick={handleSearch}>
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="card shadow-sm">
                {student && (
                    <div className="card-header bg-light">
                        <ul className="nav nav-pills card-header-pills">
                            <li className="nav-item"><a href="#!" className={`nav-link ${step === 1 ? 'active' : 'disabled'}`}>Registration Info</a></li>
                            <li className="nav-item"><a href="#!" className={`nav-link ${step === 2 ? 'active' : 'disabled'}`}>Subjects</a></li>
                            <li className="nav-item"><a href="#!" className={`nav-link ${step === 3 ? 'active' : 'disabled'}`}>Review</a></li>
                        </ul>
                    </div>
                )}
                {student ? renderEnrollmentSteps() : renderCreateStudentForm()}
            </div>

            {/* Render the modal component */}
            <CustomAlert
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalContent.title}
            >
                {modalContent.body}
            </CustomAlert>
        </div>
    );
}

export default NewEnrollmentView;
