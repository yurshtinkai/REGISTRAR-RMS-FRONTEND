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
        setMessage('');
        setError('');
        // Client-side validation
        if (!documentType.trim()) {
            setError('Please select a document type.');
            return;
        }
        if (!purpose.trim()) {
            setError('Please enter the purpose.');
            return;
        }
        // Require at least one file:
        if (files.length === 0) {
            setError('Please attach at least one requirement.');
            return;
        }
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
    return (
  <div className="container-fluid mt-4">
    <div className="row justify-content-center">
      <div className="col-12 col-md-10 col-lg-8 mb-4">
        <div className="card shadow-lg p-4">
          <h3 className="card-title mb-4 fw-bold">Submit New Request</h3>

          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Left column */}
              <div className="col-md-6">
                {/* Document Type */}
                <div className="mb-4">
                  <label htmlFor="documentType" className="form-label">Document Type</label>
                  <select className="form-select border border-2 rounded-pill" id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required>
                    <option value="" disabled>Select...</option>
                    <option value="TOR">TOR</option>
                    <option value="GRADE SLIP">GRADE SLIP</option>
                    <option value="GOOD MORAL">GOOD MORAL</option>
                    <option value="CERTIFICATION">CERTIFICATION</option>
                  </select>
                </div>

                {/* Purpose */}
                <div className="mb-4">
                  <label htmlFor="purpose" className="form-label">Purpose</label>
                  <textarea className="form-control border border-2 rounded-4" id="purpose" rows="4" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
                </div>
              </div>

              {/* Right column */}
              <div className="col-md-6">
                {/* Attach Requirement(s) */}
                <div className="mb-3">
                  <label className="form-label">Attach Requirement(s)</label>
                  <div className="file-upload-wrapper  p-2">
                    <input type="file" id="document-upload" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                    <label htmlFor="document-upload" className="file-upload-button d-block text-muted">
                      <i className="fas fa-camera me-2"></i>
                      <span>Choose file(s)</span>
                    </label>
                  </div>
                  <div className="file-name-display small mt-2">{fileNames}</div>
                </div>

                {/* Error / Success Messages */}
                <div style={{ minHeight: '24px', fontSize: '1rem', marginBottom: '12px' }}>
                  {message && <span style={{ color: 'green', fontWeight: 500 }}>{message}</span>}
                  {error && <span style={{ color: 'red', fontWeight: 500 }}>{error}</span>}
                </div>

                {/* Submit Button */}
                <div className="d-grid">
                  <button type="submit" className="btn btn-success btn-lg rounded-pill">Submit</button>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
);

}
export default StudentRequestForm;