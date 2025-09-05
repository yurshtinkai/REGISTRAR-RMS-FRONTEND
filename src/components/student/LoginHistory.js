import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './LoginHistory.css';

function LoginHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchLoginHistory = async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const sessionToken = sessionManager.getSessionToken();
            if (!sessionToken) {
                setError('No session token found. Please login again.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/sessions/history?page=${page}&limit=20`, {
                headers: {
                    'X-Session-Token': sessionToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.history);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
                setTotalCount(data.totalCount);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch login history');
            }
        } catch (err) {
            console.error('Error fetching login history:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoginHistory(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchLoginHistory(newPage);
        }
    };

    const getActionIcon = (action) => {
        return action === 'login' ? '🔓' : '🔒';
    };

    const getActionColor = (action) => {
        return action === 'login' ? '#28a745' : '#dc3545';
    };

    const getActionText = (action) => {
        return action === 'login' ? 'Login' : 'Logout';
    };

    if (loading) {
        return (
            <div className="login-history-container">
                <div className="section">
                    <h2 className="section-title">
                        <i className="fas fa-history me-2 text-primary"></i>
                        Login/Logout History
                    </h2>
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading login history...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="login-history-container">
                <div className="section">
                    <h2 className="section-title">
                        <i className="fas fa-history me-2 text-primary"></i>
                        Login/Logout History
                    </h2>
                    <div className="alert alert-danger">
                        <h4>Error Loading History</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => fetchLoginHistory(currentPage)}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-history-container">
            <div className="section">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fas fa-history me-2 text-primary"></i>
                        Login/Logout History
                    </h2>
                    <div className="history-count">
                        <span className="badge bg-primary rounded-pill">{totalCount} records</span>
                    </div>
                </div>

                {history.length > 0 ? (
                    <>
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Action</th>
                                        <th>IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((record) => (
                                        <tr key={record.id}>
                                            <td className="history-date">{record.date}</td>
                                            <td className="history-time">{record.time}</td>
                                            <td className="history-action">
                                                <span 
                                                    className="action-badge"
                                                    style={{ 
                                                        backgroundColor: getActionColor(record.action),
                                                        color: 'white'
                                                    }}
                                                >
                                                    <span className="action-icon">{getActionIcon(record.action)}</span>
                                                    {getActionText(record.action)}
                                                </span>
                                            </td>
                                            <td className="history-ip">{record.ipAddress || 'Unknown'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <nav aria-label="Login history pagination">
                                    <ul className="pagination justify-content-center">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                                Previous
                                            </button>
                                        </li>
                                        
                                        {/* Page numbers */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                
                                <div className="pagination-info">
                                    <small className="text-muted">
                                        Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} records
                                    </small>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="history-empty-state">
                        <div className="empty-state-icon">
                            <i className="fas fa-history"></i>
                        </div>
                        <h5 className="empty-state-title">No Login History</h5>
                        <p className="empty-state-description">
                            No login/logout history available. Your activity will be recorded here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginHistory;
