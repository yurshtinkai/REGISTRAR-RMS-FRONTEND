import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import './BillingPage.css'; // Create this CSS file next

function BillingPage() {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const studentName = userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'Student';

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/students/me/balance`, {
                    headers: { 'X-Session-Token': getSessionToken() }
                });

                if (response.ok) {
                    const data = await response.json();
                    setBalance(data.tuitionBalance);
                } else {
                    setError('Failed to fetch billing information.');
                }
            } catch (err) {
                setError('A network error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    const renderBalanceInfo = () => {
        if (loading) {
            return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;
        }
        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }
        if (balance !== null) {
            const isPaid = parseFloat(balance) <= 0;
            return (
                <div className="balance-display">
                    <h3 className="balance-label">Current Outstanding Balance</h3>
                    <h1 className={`balance-amount ${isPaid ? 'paid' : 'unpaid'}`}>
                        ₱ {parseFloat(balance).toFixed(2)}
                    </h1>
                    <p className={`balance-status ${isPaid ? 'paid' : 'unpaid'}`}>
                        {isPaid ? "Your account is fully paid. Thank you!" : "Please settle your balance at the accounting office."}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mt-5 billing-page">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0"><i className="fas fa-file-invoice-dollar me-2"></i>Balance</h4>
                </div>
                <div className="card-body p-4">
                    <div className="billing-details mb-4">
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Student Name:</strong></p>
                                <p>{studentName}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Course:</strong></p>
                                <p>Bachelor of Science in Information Technology</p>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="text-center mt-4">
                        {renderBalanceInfo()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillingPage;