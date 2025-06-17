import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

import '@fortawesome/fontawesome-free/css/all.min.css';

const API_BASE_URL = 'http://localhost:5000/api';

// --- UTILITY & DATA ---
const getToken = () => localStorage.getItem('token');
const getUserRole = () => localStorage.getItem('userRole');

const createDummyRegistrations = () => {
    const registrations = [];
    const firstNames = ["Juan", "Maria", "Jose", "Anna", "Luis", "Sofia", "Carlos", "Isabella", "Miguel", "Camila"];
    const lastNames = ["Dela Cruz", "Garcia", "Reyes", "Santos", "Ramos", "Mendoza", "Gonzales", "Flores", "Villanueva", "Lim"];
    const courses = ["BSIT", "BSCS", "BSBA-HRDM", "BSED-EN", "BS-ARCH"];

    for (let i = 1; i <= 10; i++) {
        registrations.push({
            id: i, regNo: `2024-P${1000 + i}`, name: `${lastNames[i-1]}, ${firstNames[i-1]} M.`, date: new Date(2024, 5, i).toISOString().split('T')[0], status: 'pending', course: courses[i % 5], gender: i % 2 === 0 ? 'Male' : 'Female'
        });
    }
    for (let i = 1; i <= 20; i++) {
        registrations.push({
            id: 10 + i, regNo: `2024-A${2000 + i}`, name: `${lastNames[i % 10]}, ${firstNames[(i + 1) % 10]} S.`, date: new Date(2024, 4, i).toISOString().split('T')[0], status: 'approved', course: courses[i % 5], gender: i % 2 === 0 ? 'Male' : 'Female'
        });
    }
    return registrations;
};

const dummySubjects = [
    { code: 'IT223', description: 'Information Management', units: 3, schedule: '08:00 AM - 10:30 AM', days: 'MTWTH', room: '314', prereq: 'IT222' },
    { code: 'FILI1', description: 'The Philippine Society in the IT Era', units: 3, schedule: '10:30 AM - 12:00 PM', days: 'TF', room: '210', prereq: null },
    { code: 'IT324', description: 'Social Issues and Professional Practices', units: 3, schedule: '01:00 PM - 02:30 PM', days: 'MW', room: '401', prereq: 'IT223' },
    { code: 'IT325', description: 'Quantitative Methods', units: 3, schedule: '02:30 PM - 04:00 PM', days: 'TF', room: '401', prereq: 'MATH101' },
];


// --- LOGIN COMPONENT ---
function Login({ onLoginSuccess }) {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idNumber, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('idNumber', data.user.idNumber);
      onLoginSuccess(data.user.role);
    } catch (err) { setError(err.message); }
  };
  return (<div className="container mt-5"><div className="row justify-content-center"><div className="col-md-6"><div className="card shadow-lg p-4"><h2 className="text-center mb-4">Login to Registrar Portal</h2><form onSubmit={handleSubmit}><div className="mb-3"><label htmlFor="idNumber">ID Number</label><input type="text" className="form-control" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required /></div><div className="mb-3"><label htmlFor="password">Password</label><input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>{error && <div className="alert alert-danger">{error}</div>}<div className="d-grid"><button type="submit" className="btn btn-primary btn-lg">Login</button></div><p className="text-center mt-3 text-muted"><small>Dummy Accounts: Student (S001/password) | Admin (A001/adminpass)</small></p></form></div></div></div></div>);
}

// --- STUDENT VIEW ---
function StudentRequestForm() {
    const [documentType, setDocumentType] = useState('');
    const [purpose, setPurpose] = useState('');
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('No file chosen');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [requests, setRequests] = useState([]);
    const idNumber = localStorage.getItem('idNumber');

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/requests/my-requests`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch');
            setRequests(data);
        } catch (err) { console.error('Error fetching student requests:', err); }
    };
    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('purpose', purpose);
        if (file) formData.append('document', file);
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit');
            setMessage('Request submitted!');
            setDocumentType(''); setPurpose(''); setFile(null); setFileName('No file chosen');
            fetchRequests();
        } catch (err) { setError(err.message); }
    };
    const getStatusBadge = (status) => ({'approved': 'bg-success', 'pending': 'bg-warning text-dark', 'rejected': 'bg-danger', 'ready for pick-up': 'bg-info'}[status] || 'bg-secondary');
    return (
        <div className="container-fluid mt-4">
            <h2 className="text-center mb-4">Welcome, Student ({idNumber})!</h2>
            <div className="row">
                <div className="col-lg-6 mb-4"><div className="card shadow-lg p-4 h-100"><h3 className="card-title mb-3">Submit New Request</h3>
                    <form onSubmit={handleSubmit} className="d-flex flex-column h-100"><div className="flex-grow-1">
                        <div className="mb-3"><label htmlFor="documentType" className="form-label">Document Type</label><select className="form-select" id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required><option value="" disabled>Select...</option><option value="TOR">TOR</option><option value="GRADE SLIP">GRADE SLIP</option><option value="GOOD MORAL">GOOD MORAL</option><option value="CERTIFICATION">CERTIFICATION</option></select></div>
                        <div className="mb-3"><label htmlFor="purpose" className="form-label">Purpose</label><textarea className="form-control" id="purpose" rows="3" value={purpose} onChange={(e) => setPurpose(e.target.value)} required></textarea></div>
                        <div className="mb-3"><label className="form-label">Attach Requirement</label><div className="file-upload-wrapper"><input type="file" id="document-upload" onChange={(e) => {setFile(e.target.files[0]); setFileName(e.target.files[0].name);}} style={{display: 'none'}} /><label htmlFor="document-upload" className="file-upload-button"><i className="fas fa-camera"></i><span>Choose file</span></label></div><div className="file-name-display">{fileName}</div></div>
                    </div><div style={{minHeight: '58px'}}>{message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}</div><div className="d-grid"><button type="submit" className="btn btn-success btn-lg">Submit</button></div></form>
                </div></div>
                <div className="col-lg-6 mb-4"><div className="card shadow-lg p-4 h-100"><h3 className="card-title mb-3">Your Requests</h3>
                    <div className="table-responsive" style={{maxHeight: '450px', overflowY: 'auto'}}><table className="table table-hover">
                        <thead className="table-dark sticky-top"><tr><th>Doc Type</th><th>Purpose</th><th>Status</th><th>Notes</th><th>Date</th></tr></thead>
                        <tbody>{requests.map((req) => (<tr key={req.id}><td>{req.documentType}</td><td>{req.purpose}</td><td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span></td><td>{req.notes || 'N/A'}</td><td>{new Date(req.createdAt).toLocaleDateString()}</td></tr>))}</tbody>
                    </table></div>
                </div></div>
            </div>
        </div>
    );
}


// --- All Registrations View Component ---
function AllRegistrationsView({ registrations, setRegistrations }) {
    const [activeTab, setActiveTab] = useState('pending');
    const handleUpdateStatus = (id, newStatus) => { setRegistrations(regs => regs.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)); };
    const filteredRegistrations = registrations.filter(reg => reg.status === activeTab);
    return (
        <div className="container-fluid"><h2 className="mb-4">All Registrations</h2><div className="card shadow-sm"><div className="card-header bg-white"><div className="d-flex flex-wrap align-items-center"><h4 className="card-title mb-0 me-3">Registration List</h4><ul className="nav nav-pills">
            <li className="nav-item"><button className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending ({registrations.filter(r=>r.status==='pending').length})</button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>Approved ({registrations.filter(r=>r.status==='approved').length})</button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>Rejected ({registrations.filter(r=>r.status==='rejected').length})</button></li>
        </ul></div></div><div className="card-body">
            <div className="row mb-3"><div className="col-md-6"><div className="input-group"><input type="text" className="form-control" placeholder="Search..." /><button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div><div className="col-md-3 ms-auto"><select className="form-select"><option>2024-2025 Summer</option></select></div></div>
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}><table className="table table-hover">
                <thead className="table-light sticky-top"><tr><th>Reg. No.</th><th>Name</th><th>Date of Registration</th><th>Actions</th></tr></thead>
                <tbody>{filteredRegistrations.length > 0 ? filteredRegistrations.map(reg => (<tr key={reg.id}><td>{reg.regNo}</td><td>{reg.name}</td><td>{reg.date}</td><td>
                    {activeTab === 'pending' && (<><button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(reg.id, 'approved')}>Approve</button><button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(reg.id, 'rejected')}>Reject</button></>)}
                    {activeTab === 'approved' && <span className="text-success">Approved</span>}
                    {activeTab === 'rejected' && <span className="text-danger">Rejected</span>}
                </td></tr>)) : (<tr><td colSpan="4" className="text-center text-muted">No matching records found.</td></tr>)}</tbody>
            </table></div>
        </div></div></div>
    );
}

// --- Unenrolled Registrations View Component ---
function UnenrolledRegistrationsView({ registrations, onEnrollStudent }) {
    const unenrolledStudents = registrations.filter(reg => reg.status === 'approved');
    return (
        <div className="container-fluid"><h2 className="mb-4">Unenrolled Registrations</h2><div className="card shadow-sm"><div className="card-header bg-white"><h4 className="card-title mb-0">Registration List</h4></div><div className="card-body">
            <div className="row mb-3"><div className="col-md-6"><div className="input-group"><input type="text" className="form-control" placeholder="Search..." /><button className="btn btn-outline-secondary" type="button"><i className="fas fa-search"></i></button></div></div><div className="col-md-3 ms-auto"><select className="form-select"><option>2024-2025 Summer</option></select></div></div>
            <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto' }}>
                <table className="table table-hover">
                    <thead className="table-light sticky-top"><tr><th>Reg. No.</th><th>Name</th><th>Date of Registration</th><th>Actions</th></tr></thead>
                    <tbody>{unenrolledStudents.length > 0 ? unenrolledStudents.map(reg => (<tr key={reg.id}><td>{reg.regNo}</td><td>{reg.name}</td><td>{reg.date}</td>
                        <td><button className="btn btn-sm btn-primary" onClick={() => onEnrollStudent(reg)}><i className="fas fa-pencil-alt"></i></button></td>
                    </tr>)) : (<tr><td colSpan="4" className="text-center text-muted">No unenrolled students found.</td></tr>)}</tbody>
                </table>
            </div>
        </div></div></div>
    );
}

// --- New Enrollment View Component ---
function NewEnrollmentView({ student, onBack }) {
    const [step, setStep] = useState(1);
    const [enlistedSubjects, setEnlistedSubjects] = useState([]);
    if (!student) { return <div className="container text-center mt-5"><h4>Please select a student from the unenrolled list first.</h4><button className="btn btn-secondary" onClick={onBack}>Go Back</button></div>; }
    const addSubject = (subject) => { if (!enlistedSubjects.find(s => s.code === subject.code)) { setEnlistedSubjects([...enlistedSubjects, subject]); } };
    const removeSubject = (subjectCode) => { setEnlistedSubjects(enlistedSubjects.filter(s => s.code !== subjectCode)); };
    const totalUnits = enlistedSubjects.reduce((total, s) => total + s.units, 0);

    const renderStep = () => {
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
                </tbody></table><div className="d-flex justify-content-between mt-4"><button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button><button className="btn btn-success" onClick={() => {alert('Enrollment Complete!'); onBack();}}>Complete Enrollment</button></div></div>);
            default: return null;
        }
    };
    return (<div className="container-fluid"><h2 className="mb-4">Add Enrollment</h2><div className="card shadow-sm"><div className="card-header bg-light"><ul className="nav nav-pills card-header-pills">
        <li className="nav-item"><a href="#!" className={`nav-link ${step === 1 ? 'active' : 'disabled'}`}>Registration Info</a></li>
        <li className="nav-item"><a href="#!" className={`nav-link ${step === 2 ? 'active' : 'disabled'}`}>Subjects</a></li>
        <li className="nav-item"><a href="#!" className={`nav-link ${step === 3 ? 'active' : 'disabled'}`}>Review</a></li>
    </ul></div>{renderStep()}</div></div>);
}

// --- RequestManagementView component ---
function RequestManagementView({ setDocumentModalData }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllRequests = async () => { 
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setRequests(data);
    } catch (err) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllRequests(); }, []);

  const handleApproveOrReject = async (requestId, newStatus) => {
    const notes = prompt(`Enter notes for this action (${newStatus}):`);
    if (notes === null) return; 

    try {
      await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      fetchAllRequests();
    } catch (err) { 
        setError(err.message);
        alert(`Error updating status: ${err.message}`);
    }
  };

  const handleViewDocument = async (requestId) => { 
    try {
        setError('');
        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/document`, {
            headers: { 'Authorization': `Bearer ${getToken()}` },
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Could not view file.');
        }
        const blob = await response.blob();
        const contentType = response.headers.get('content-type');
        const url = window.URL.createObjectURL(blob);
        setDocumentModalData({ url, type: contentType });
    } catch (err) {
        console.error('Error viewing document:', err);
        setError(err.message);
    }
  };

  const handlePrint = async (requestToPrint) => {
    try {
        await fetch(`${API_BASE_URL}/requests/${requestToPrint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ status: 'ready for pick-up', notes: 'Document printed and ready for collection.' }),
        });
        await fetchAllRequests();
  
        const studentName = `[Student Full Name]`; 
        const studentCourse = `[Student Course]`;
        const academicYear = '2024-2025';
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let printContent = '';
        switch (requestToPrint.documentType.toUpperCase()) {
            case 'GOOD MORAL':
                printContent = `<div class="print-container"><div class="header"><h1>CERTIFICATE OF GOOD MORAL CHARACTER</h1></div><p class="date">${today}</p><p class="body-text">This is to certify that <b>${studentName}</b>, a student of <b>${studentCourse}</b> for Academic Year ${academicYear}, is of good moral character.</p><p class="body-text">This certification is issued upon the request of the student for <b>${requestToPrint.purpose}</b> purposes only.</p><div class="signature-block"><p><b>[REGISTRAR'S NAME]</b></p><p>School Registrar</p></div></div>`;
                break;
            case 'TOR':
                printContent = `<div class="print-container"><div class="header"><h1>OFFICIAL TRANSCRIPT OF RECORDS</h1></div><div><b>Student:</b> ${studentName}</div><div><b>Student No:</b> ${requestToPrint.User?.idNumber}</div><p><i>(Simplified for demonstration)</i></p><table class="grades-table"><thead><tr><th>Code</th><th>Description</th><th>Grade</th></tr></thead><tbody><tr><td>CS101</td><td>Intro to Programming</td><td>1.5</td></tr></tbody></table></div>`;
                break;
            default:
                printContent = `<h1>${requestToPrint.documentType}</h1><p>Template for this document is not yet available.</p>`;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Print</title><style>body{font-family:serif;margin:40px}.print-container{max-width:800px;margin:auto}.header{text-align:center;margin-bottom:40px}.date{text-align:right}.body-text{line-height:1.6;margin:20px 0}.signature-block{margin-top:80px;text-align:right}.grades-table{width:100%;border-collapse:collapse;margin-top:20px}.grades-table th,td{border:1px solid #ccc;padding:8px}</style></head><body>${printContent}<script>setTimeout(()=>{window.print();window.close()},250)</script></body></html>`);
        printWindow.document.close();
    } catch(err) {
        console.error("Error during print process:", err);
        setError(`Failed to print and update status: ${err.message}`);
    }
  };
  
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'pending': return 'bg-warning text-dark';
            case 'rejected': return 'bg-danger';
            case 'ready for pick-up': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container-fluid">
        <h2 className="mb-4">Request Management</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                    <table className="table table-hover">
                        <thead className="table-dark sticky-top">
                            <tr><th>ID</th><th>Student</th><th>Doc Type</th><th>Purpose</th><th>Status</th><th>Notes</th><th>Document</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.id}</td><td>{req.User?.idNumber || 'N/A'}</td><td>{req.documentType}</td><td>{req.purpose}</td>
                                    <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status.replace(/_/g, ' ')}</span></td>
                                    <td>{req.notes || 'N/A'}</td>
                                    <td>{req.filePath ? (<button className="btn btn-sm btn-info" onClick={() => handleViewDocument(req.id)}>View</button>) : 'N/A'}</td>
                                    <td>
                                      <div className="d-flex">
                                        {req.status === 'pending' && (
                                          <>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => handleApproveOrReject(req.id, 'approved')}>Approve</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleApproveOrReject(req.id, 'rejected')}>Reject</button>
                                          </>
                                        )}
                                        {req.status === 'approved' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handlePrint(req)}>
                                              Print
                                            </button>
                                        )}
                                        {req.status === 'ready for pick-up' && (
                                            <button className="btn btn-sm btn-secondary" onClick={() => handlePrint(req)}>
                                              Reprint
                                            </button>
                                        )}
                                      </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}


// --- PlaceholderView component ---
function PlaceholderView({ title }) {
    return (
        <div className="container text-center mt-5">
            <i className="fas fa-cogs fa-5x text-muted mb-4"></i>
            <h2>{title}</h2>
            <p className="lead text-muted">This module is not yet available.</p>
        </div>
    );
}

// --- SIDEBAR (Complete and functional) ---
function Sidebar({ setView, currentView, onProfileClick }) {
    const adminIdNumber = localStorage.getItem('idNumber');
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(false);
    const [isRegistrationOpen, setRegistrationOpen] = useState(false);
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const savedPic = localStorage.getItem('adminProfilePic');
        if (savedPic) setProfilePic(savedPic);
    }, []);

    const menuItems = [
        { name: 'Dashboard', view: 'dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Students', view: 'students', icon: 'fa-users' },
        { name: 'Registration', icon: 'fa-file-alt', subItems: [ { name: 'All Registrations', view: 'all_registrations' } ] },
        { name: 'Enrollment', icon: 'fa-user-check',
            subItems: [ { name: 'All Enrollments', view: 'enrollment_all' }, { name: 'Unenrolled Registrations', view: 'enrollment_unenrolled' }, { name: 'New Enrollment', view: 'enrollment_new' } ] },
        { name: 'Assessment', view: 'assessment', icon: 'fa-clipboard-list' },
        { name: 'Requests', view: 'requests', icon: 'fa-folder-open' },
    ];
    
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                localStorage.setItem('adminProfilePic', base64String);
                setProfilePic(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="sidebar"><div className="sidebar-header text-center py-3"><div className="sidebar-profile-container"><div onClick={() => profilePic && onProfileClick(profilePic)}>{profilePic ? (<img src={profilePic} alt="Admin Profile" className="sidebar-profile-pic" />) : (<i className="fas fa-user-circle"></i>)}</div><label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label><input id="profile-pic-upload" type="file" onChange={handleProfilePicChange} style={{display:'none'}}/></div><h5>Registrar</h5><p className="text-muted small">{adminIdNumber}</p></div>
            <ul className="nav flex-column">{menuItems.map(item => (<li className="nav-item" key={item.name}>{item.subItems ? (<><a href="#!" className="nav-link d-flex justify-content-between" onClick={(e)=>{e.preventDefault();if(item.name==='Enrollment')setEnrollmentOpen(!isEnrollmentOpen);if(item.name==='Registration')setRegistrationOpen(!isRegistrationOpen);}}><span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span><i className={`fas fa-chevron-down transition-transform ${(item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)?'rotate-180':''}`}></i></a><div className={`collapse ${(item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)?'show':''}`}><ul className="nav flex-column ps-3">{item.subItems.map(subItem => (<li className="nav-item" key={subItem.name}><a href="#!" className={`nav-link sub-item ${currentView===subItem.view?'active':''}`} onClick={(e)=>{e.preventDefault();setView(subItem.view)}}>{subItem.name}</a></li>))}</ul></div></>) : (<a href="#!" className={`nav-link ${currentView===item.view?'active':''}`} onClick={(e)=>{e.preventDefault();setView(item.view);}}><i className={`fas ${item.icon} me-2`}></i>{item.name}</a>)}</li>))}</ul>
        </div>
    );
}

// --- Main App Component ---
function App() {
  const [userRole, setUserRole] = useState(getUserRole());
  const [adminView, setAdminView] = useState('dashboard'); 
  const [modalImage, setModalImage] = useState(null);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [registrations, setRegistrations] = useState(createDummyRegistrations());
  const [studentToEnroll, setStudentToEnroll] = useState(null);

  useEffect(() => {
    if (getToken()) setUserRole(getUserRole());
    if (!getUserRole()) {
        document.body.classList.add('login-background');
    } else {
        document.body.classList.remove('login-background');
    }
    return () => {
        document.body.classList.remove('login-background');
    };
  }, [userRole]);

  useEffect(() => {
    if (modalImage || documentModalData) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [modalImage, documentModalData]);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    if (role === 'admin') setAdminView('dashboard');
  };
  
  const handleLogout = () => { 
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('idNumber');
      setUserRole(null); 
      window.location.reload();
  };

  const handleEnrollStudent = (student) => {
      setStudentToEnroll(student);
      setAdminView('enrollment_new');
  };
  
  const handleBackToDashboard = () => {
      setStudentToEnroll(null);
      setAdminView('dashboard');
  }

  const renderAdminContent = () => {
    switch (adminView) {
        case 'requests': return <RequestManagementView setDocumentModalData={setDocumentModalData} />;
        case 'all_registrations': return <AllRegistrationsView registrations={registrations} setRegistrations={setRegistrations} />;
        case 'enrollment_unenrolled': return <UnenrolledRegistrationsView registrations={registrations} onEnrollStudent={handleEnrollStudent} />;
        case 'enrollment_new': return <NewEnrollmentView student={studentToEnroll} onBack={handleBackToDashboard} />;
        default: return <PlaceholderView title={adminView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />;
    }
  };
  
  const closeDocumentModal = () => {
    if (documentModalData && documentModalData.url) {
      window.URL.revokeObjectURL(documentModalData.url);
    }
    setDocumentModalData(null);
  };

  return (
    <div id="app-wrapper">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm fixed-top">
        <div className="container-fluid"><a className="navbar-brand" href="#!">Registrar RMS</a><div className="d-flex">{userRole && (<><span className="navbar-text me-3">Logged in as: <strong>{localStorage.getItem('idNumber')}</strong> ({userRole})</span><button className="btn btn-outline-light" onClick={handleLogout}>Logout</button></>)}</div></div>
      </nav>
      <div className="content-wrapper">
        {!userRole ? <Login onLoginSuccess={handleLoginSuccess} /> : userRole === 'student' ? <StudentRequestForm /> : (
            <div className="admin-layout">
                <Sidebar setView={setAdminView} currentView={adminView} onProfileClick={setModalImage} />
                <main className="main-content">{renderAdminContent()}</main>
            </div>
        )}
      </div>
      {modalImage && (<div className="image-view-modal" onClick={() => setModalImage(null)}><span className="close-modal-button">&times;</span><img src={modalImage} alt="Profile" className="enlarged-profile-pic" /></div>)}
      {documentModalData && (<div className="image-view-modal" onClick={closeDocumentModal}><span className="close-modal-button">&times;</span><div className="document-modal-content" onClick={(e) => e.stopPropagation()}>{documentModalData.type.startsWith('image/') ? (<img src={documentModalData.url} alt="Document" className="enlarged-document-image" />) : (<iframe src={documentModalData.url} title="Document" width="100%" height="100%"></iframe>)}</div></div>)}
    </div>
  );
}

export default App;
