import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import useDebounce from '../../hooks/useDebounce';

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
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const userRole = localStorage.getItem('userRole');
    const isReadOnly = userRole === 'accounting';
    const navigate = useNavigate();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState(null);

    // Function to handle clicking on "Awaiting registrar action" to navigate to student detail
    const handleStudentDetailClick = (studentId, requestId) => {
        if (studentId) {
            const suffix = requestId ? `?requestId=${requestId}` : '';
            navigate(`/admin/students/${studentId}${suffix}`);
        }
    };
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAllRequests = async () => {
        setLoading(true); setError('');
        try {
            // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
            const response = await fetch(`${API_BASE_URL}/requests`, { 
                headers: { 
                    'X-Session-Token': sessionManager.getSessionToken() 
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

    const handleApprove = async (request) => {
        if (request.status !== 'payment_approved') {
            alert('⚠️ This request must be payment approved before final approval.');
            return;
        }

        const confirmApproval = window.confirm(
            `Approve document request?\n\n` +
            `Student: ${request.student?.firstName} ${request.student?.lastName}\n` +
            `Document: ${request.documentType}\n` +
            `Amount: ₱${request.amount?.toFixed(2)}\n\n` +
            `This will mark the request as approved and ready for printing.`
        );

        if (!confirmApproval) return;

        try {
            const response = await fetch(`${API_BASE_URL}/requests/${request.id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionManager.getSessionToken()
                },
                body: JSON.stringify({
                    notes: 'Request approved by registrar'
                })
            });

            if (response.ok) {
                // Navigate to document approval modal for editing and printing
                navigate(`/admin/requests/approve-document/${request.id}`);
            } else {
                const error = await response.json();
                alert(`❌ Failed to approve request: ${error.message}`);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('❌ Error approving request. Please try again.');
        }
    };

    const handlePrint = async (request) => {
        if (request.status !== 'approved') {
            alert('⚠️ This request must be approved before printing.');
            return;
        }

        const confirmPrint = window.confirm(
            `Print document?\n\n` +
            `Student: ${request.student?.firstName} ${request.student?.lastName}\n` +
            `Document: ${request.documentType}\n\n` +
            `This will mark the document as printed and ready for pickup.`
        );

        if (!confirmPrint) return;

        try {
            const response = await fetch(`${API_BASE_URL}/requests/${request.id}/print`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionManager.getSessionToken()
                }
            });

            if (response.ok) {
                alert('✅ Document marked as printed! Student will be notified for pickup.');
                fetchAllRequests(); // Refresh the list
            } else {
                const error = await response.json();
                alert(`❌ Failed to mark as printed: ${error.message}`);
            }
        } catch (error) {
            console.error('Error marking as printed:', error);
            alert('❌ Error marking as printed. Please try again.');
        }
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
                    'X-Session-Token': sessionManager.getSessionToken() 
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
        // Navigate to document approval modal for editing and reprinting
        navigate(`/admin/requests/approve-document/${request.id}`);
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
            case 'pending': return 'bg-secondary';
            case 'payment_required': return 'bg-warning text-dark';
            case 'payment_approved': return 'bg-primary';
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            case 'ready for pick-up': return 'bg-info';
            default: return 'bg-secondary';
        }
    };


    const getReleaseDate = (req) => {
    // Only show a release date if the status is 'ready for pick-up'
    if (req.status !== 'ready for pick-up') {
        return '—'; // Use a dash for items not yet ready
    }
    // The backend provides a `printedAt` field when the status is updated.
    if (!req.printedAt) {
        // Fallback if the date is somehow missing, but the status is correct
        return new Date(req.updatedAt).toLocaleDateString();
    }
    // Format and return the actual date the document was marked as printed
    return new Date(req.printedAt).toLocaleDateString();
};

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'payment_required': return 'Payment Required';
            case 'payment_approved': return 'Payment Approved';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'ready for pick-up': return 'Ready for Pickup';
            default: return status.replace(/_/g, ' ');
        }
    };

    // Filter requests: show ONLY online (student-initiated) requests, then apply search
    const filteredRequests = useMemo(() => {
        const onlineOnly = (requests || []).filter(r => r.initiatedBy === 'student');

        if (!debouncedSearchTerm.trim()) {
            return onlineOnly;
        }

        const searchLower = debouncedSearchTerm.toLowerCase();
        return onlineOnly.filter(request => {
            const studentName = request.student 
                ? `${request.student.firstName} ${request.student.lastName}`.toLowerCase()
                : '';
            const studentId = request.student?.idNumber?.toLowerCase() || '';
            const documentType = request.documentType?.toLowerCase() || '';
            const status = request.status?.toLowerCase() || '';

            return studentName.includes(searchLower) || 
                   studentId.includes(searchLower) || 
                   documentType.includes(searchLower) ||
                   status.includes(searchLower);
        });
    }, [requests, debouncedSearchTerm]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    if (error) return <div className="alert alert-danger">Error: {JSON.stringify(error)}</div>;

    return (
        <div className="container-fluid">
            <style>{modalStyles}</style>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Request Management</h2>
                <div className="d-flex align-items-center">
                    <span className="badge bg-info me-2">
                        {filteredRequests.length} of {requests.length} requests
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by student name, ID, document type, or status..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                            {debouncedSearchTerm && (
                                <small className="text-muted">
                                    Searching for: "{debouncedSearchTerm}"
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    {filteredRequests.length === 0 && requests.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <h5>No document requests found</h5>
                            <p>Document requests will appear here when students or registrars create them.</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <h5>No results found</h5>
                            <p>No requests match your search criteria: "{debouncedSearchTerm}"</p>
                            <button 
                                className="btn btn-outline-primary"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                            <table className="table table-hover">
                                <thead className="table-dark sticky-top">
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Doc Type</th>
                                        <th>purpose</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Release Date</th>
                                        <th>Requirements</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.student?.idNumber || 'N/A'}</td>
                                        <td>{req.student ? `${req.student.lastName}, ${req.student.firstName}` : 'Loading...'}</td>
                                        <td><span className="badge bg-info">{req.documentType}</span></td>
                                        <td>{req.purpose}</td>
                                        <td><span className={`badge ${getStatusBadge(req.status)}`}>{getStatusText(req.status)}</span></td>
                                        <td>{new Date(req.createdAt).toISOString().split('T')[0]}</td>
                                        <td>{getReleaseDate(req)}</td>
                                        <td>
                                            {Array.isArray(req.filePath) && req.filePath.length > 0 ? (
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View attached requirements"
                                                    onClick={() => handleViewDocument(req)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            ) : (
                                                <span className="text-muted">None</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <span 
                                                            className="text-muted small clickable-status" 
                                                            style={{ 
                                                                cursor: 'pointer', 
                                                                textDecoration: 'underline',
                                                                color: '#007bff',
                                                                transition: 'color 0.2s ease'
                                                            }}
                                                            onClick={() => handleStudentDetailClick(req.student?.idNumber, req.id)}
                                                            title="Click to view student details"
                                                            onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                                                            onMouseLeave={(e) => e.target.style.color = '#007bff'}
                                                        >
                                                            Awaiting registrar action
                                                        </span>
                                                    </>
                                                )}
                                                {req.status === 'payment_required' && (
                                                    <>
                                                        <span className="text-warning small">⏳ Awaiting payment</span>
                                                    </>
                                                )}
                                                {req.status === 'payment_approved' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-1" onClick={() => handleApprove(req)}>
                                                            ✅ Approve
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => openRejectModal(req)}>
                                                            ❌ Reject
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'approved' && (
                                                    <>
                                                        <button className="btn btn-sm btn-primary" onClick={() => handlePrint(req)}>
                                                            🖨️ Print
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'ready for pick-up' && (
                                                    <>
                                                        <button className="btn btn-sm btn-secondary" onClick={() => handleReprint(req)} disabled={isReadOnly}>
                                                            🔄 Reprint
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <span className="text-danger small">❌ Rejected</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
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