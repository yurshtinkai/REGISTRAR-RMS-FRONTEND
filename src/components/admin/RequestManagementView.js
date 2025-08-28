import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { API_BASE_URL, getSessionToken } from '../../utils/api';

// Simple CSS for the modal overlay and centering
const modalStyles = `
    .modal-backdrop-custom {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1050;
    }
    .modal-dialog-custom {
        max-width: 500px;
        width: 90%;
        margin: auto;
    }
`;

function RequestManagementView({ setDocumentModalData }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userRole = localStorage.getItem('userRole');
    const isReadOnly = userRole === 'accounting';
    const navigate = useNavigate();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState(null);
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAllRequests = async () => {
        setLoading(true); setError('');
        try {
            // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
            const response = await fetch(`${API_BASE_URL}/requests`, { 
                headers: { 
                    'X-Session-Token': getSessionToken() 
                } 
            });
            const responseText = await response.text();
            if (!response.ok) {
                 // Try to parse as JSON, but fall back to text if it fails
                 try {
                     const errorJson = JSON.parse(responseText);
                     throw new Error(errorJson.message || 'Failed to fetch requests');
                 } catch (e) {
                     throw new Error(responseText || 'Failed to fetch requests');
                 }
            }
            const data = JSON.parse(responseText);
            setRequests(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllRequests(); }, []);

    const handleApprove = (request) => {
        navigate(`/admin/requests/approve-document/${request.id}`);
    };

    const openRejectModal = (request) => {
        setRejectionTarget(request);
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setIsRejectModalOpen(false);
        setRejectionTarget(null);
        setRejectionNotes('');
        setIsSubmitting(false);
    };

    const handleConfirmReject = async () => {
        if (!rejectionTarget) return;
        setIsSubmitting(true);
        try {
            // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
            await fetch(`${API_BASE_URL}/requests/${rejectionTarget.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-Session-Token': getSessionToken() 
                },
                body: JSON.stringify({ status: 'rejected', notes: rejectionNotes }),
            });
            await fetchAllRequests();
            closeRejectModal();
        } catch (err) {
            setError(err.message);
            alert(`Error updating status: ${err.message}`);
            setIsSubmitting(false);
        }
    };
    
    const handleReprint = (request) => {
        const content = `<h1>Reprint: ${request.documentType}</h1>`; 
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Reprint</title></head><body>${content}</body><script>setTimeout(() => { window.print(); window.close(); }, 250);</script></html>`);
        printWindow.document.close();
    };

    const handleViewDocument = (request) => {
        if (request.filePath && Array.isArray(request.filePath) && request.filePath.length > 0) {
            setDocumentModalData({
                filePaths: request.filePath,
                requestId: request.id,
            });
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
    if (error) return <div className="alert alert-danger">Error: {JSON.stringify(error)}</div>;

    return (
        <div className="container-fluid">
            <style>{modalStyles}</style>
            
            <h2 className="mb-4">Request Management</h2>
            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th>Student ID</th><th>Doc Type</th><th>Purpose</th><th>Status</th>
                                    <th>Notes</th><th>Date</th><th>Document</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.student?.idNumber || 'N/A'}</td><td>{req.documentType}</td><td>{req.purpose}</td>
                                        <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status.replace(/_/g, ' ')}</span></td>
                                        <td>{req.notes || 'N/A'}</td>
                                        <td>{new Date(req.createdAt).toISOString().split('T')[0]}</td>
                                        <td>{req.filePath && req.filePath.length > 0 ? (
                                            <button className="btn btn-sm btn-info" onClick={() => handleViewDocument(req)}>View</button>
                                        ) : 'N/A'}</td>
                                        <td>
                                            <div className="d-flex">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-3" onClick={() => handleApprove(req)}>
                                                            Approve
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => openRejectModal(req)}>
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'ready for pick-up' && (
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleReprint(req)} disabled={isReadOnly}>
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

            {isRejectModalOpen && (
                <div className="modal-backdrop-custom">
                    <div className="modal-dialog-custom">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Reject Request</h5>
                                <button type="button" className="btn-close" onClick={closeRejectModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p>Please provide a reason for rejecting this request. This note will be visible to the student.</p>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={rejectionNotes}
                                    onChange={(e) => setRejectionNotes(e.target.value)}
                                    placeholder="e.g., Missing required documents, incorrect purpose stated..."
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={handleConfirmReject} 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RequestManagementView;