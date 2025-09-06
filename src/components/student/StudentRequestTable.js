import React, { useEffect, useState } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';

function StudentRequestTable({ refresh }) {
    const [requests, setRequests] = useState([]);
    const getStatusBadge = (status) => ({'approved': 'bg-success', 'pending': 'bg-warning text-dark', 'rejected': 'bg-danger', 'ready for pick-up': 'bg-info'}[status] || 'bg-secondary');

    const fetchRequests = async () => {
        try {
            // Validate and refresh session first
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                console.error('Session expired. Please login again.');
                return;
            }
            
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/requests/my-requests`, { headers: { 'X-Session-Token': sessionToken } });
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

    useEffect(() => {
        fetchRequests();
    }, [refresh]);

    return (
         <div className="container-fluid mt-5 position-relative py-2 px-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 mb-4">
                    <div className="card shadow-lg p-4 h-100">
                        <h3 className="card-title mb-3">Your Requests</h3>
                        <div className="table-responsive" style={{maxHeight: '450px', overflowY: 'auto'}}>
                            <table className="table table-hover">
                                <thead className="table-dark sticky-top">
                                    <tr><th>Doc Type</th><th>Purpose</th><th>Status</th><th>Notes</th><th>Date</th></tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id}>
                                            <td>{req.documentType}</td>
                                            <td>{req.purpose}</td>
                                            <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span></td>
                                            <td>{req.notes || 'N/A'}</td>
                                            <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentRequestTable;
