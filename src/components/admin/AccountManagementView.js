import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function AccountManagementView() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // This state will now hold the info for the reset password modal
    const [resetInfo, setResetInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // ... fetchAccounts function remains the same
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/accounts`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch accounts. Please log in again.');
                }
                const data = await response.json();
                setAccounts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    // --- START: This function now handles resetting the password ---
    const handleResetPassword = async (account) => {
        // Confirm before resetting
        if (!window.confirm(`Are you sure you want to reset the password for ${account.idNumber}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/accounts/${account.id}/reset-password`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            if (!response.ok) {
                throw new Error('Failed to reset password.');
            }
            
            const data = await response.json();

            // Set state to show the modal with the new password
            setResetInfo({
                idNumber: data.idNumber,
                password: data.newPassword,
            });

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
    // --- END: This function now handles resetting the password ---
    const filteredAccounts = accounts.filter(acc => {
        const fullName = `${acc.lastName}, ${acc.firstName} ${acc.middleName || ''}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return acc.idNumber.toLowerCase().includes(search) || fullName.includes(search);
    });

    if (loading) return <p>Loading accounts...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Account Management</h2>
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Student Account List</h4>
                </div>
                <div className="card-body">
                     <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by ID Number or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>ID Number</th>
                                    <th>Name of Student</th>
                                    <th>Date Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.length > 0 ? filteredAccounts.map(acc => (
                                    <tr key={acc.id}>
                                        <td>{acc.idNumber}</td>
                                        <td>{`${acc.lastName}, ${acc.firstName} ${acc.middleName || ''}`}</td>
                                        <td>{new Date(acc.createdAt).toLocaleString()}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-warning"  
                                                title="Reset Password"
                                                onClick={() => handleResetPassword(acc)}
                                            >
                                                <i className="fas fa-key"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No student accounts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- START: Updated modal to show new password --- */}
            {resetInfo && (
                <div className="modal-overlay" onClick={() => setResetInfo(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Password Reset Successfully</h3>
                        <div className="modal-body">
                            <p>Please provide the student with their new credentials:</p>
                            <pre>
                                {`ID Number: ${resetInfo.idNumber}\nNew Password: ${resetInfo.password}`}
                            </pre>
                        </div>
                        <button onClick={() => setResetInfo(null)} className="btn btn-primary">
                            OK
                        </button>
                    </div>
                </div>
            )}
            {/* --- END: Updated modal --- */}
        </div>
    );
}

export default AccountManagementView;