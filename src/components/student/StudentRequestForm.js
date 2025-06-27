import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function StudentRequestForm() {
    const [documentType, setDocumentType] = useState('');
    const [purpose, setPurpose] = useState('');
    const [files, setFiles] = useState([]);
    const [fileNames, setFileNames] = useState('No files chosen');
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
    
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setFileNames(selectedFiles.length > 0 ? selectedFiles.map(f => f.name).join(', ') : 'No files chosen');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('purpose', purpose);
        if (files.length > 0) {
            files.forEach(file => {
                formData.append('documents', file);
            });
        }
        try {
            const response = await fetch(`${API_BASE_URL}/requests`, { method: 'POST', headers: { 'Authorization': `Bearer ${getToken()}` }, body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit');
            setMessage('Request submitted!');
            setDocumentType(''); setPurpose(''); setFiles([]); setFileNames('No files chosen');
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
                        <div className="mb-3"><label className="form-label">Attach Requirement(s)</label><div className="file-upload-wrapper"><input type="file" id="document-upload" multiple onChange={handleFileChange} style={{display: 'none'}} /><label htmlFor="document-upload" className="file-upload-button"><i className="fas fa-camera"></i><span>Choose file(s)</span></label></div><div className="file-name-display">{fileNames}</div></div>
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
export default StudentRequestForm;