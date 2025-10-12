import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import { authenticatedFetch } from '../../utils/apiHelpers';
import './BillingPage.css'; // Create this CSS file next

function BillingPage() {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [askingBalance, setAskingBalance] = useState(false);
    const [askMessage, setAskMessage] = useState('');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const studentName = userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : 'Student';

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    setError('Session expired. Please login again.');
                    setLoading(false);
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                const response = await fetch(`${API_BASE_URL}/students/me/balance`, {
                    headers: { 'X-Session-Token': sessionToken }
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

    const handleAskBalance = async () => {
        setAskingBalance(true);
        setAskMessage(''); // Clear previous messages
        try {
            console.log('🔍 Balance inquiry - Starting request...');
            
            const response = await authenticatedFetch('/students/balance-inquiry', {
                method: 'POST',
                body: JSON.stringify({
                    message: 'Student is asking about their tuition balance'
                })
            });

            console.log('🔍 Balance inquiry - Response status:', response.status);
            console.log('🔍 Balance inquiry - Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Balance inquiry - Success data:', data);
                setAskMessage('✅ Your inquiry has been sent to the accounting office. They will review your balance and update it accordingly.');
            } else {
                const errorData = await response.json();
                console.log('🔍 Balance inquiry - Error data:', errorData);
                setAskMessage(`❌ Failed to send inquiry: ${errorData.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Error sending balance inquiry:', error);
            setAskMessage(`❌ ${error.message || 'Network error. Please try again.'}`);
        } finally {
            setAskingBalance(false);
        }
    };

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
                        {isPaid ? "You can ask your balance. Thank you!" : "Please settle your balance at the accounting office."}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mt-5 billing-page">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 className="mb-0"><i className="fas fa-file-invoice-dollar me-2"></i>Tuition Balance</h4>
                    <button 
                        className="btn btn-outline-light btn-sm"
                        onClick={handleAskBalance}
                        disabled={askingBalance}
                    >
                        {askingBalance ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-question-circle me-2"></i>
                                Ask About My Balance
                            </>
                        )}
                    </button>
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
                        
                        {/* Ask Message */}
                        {askMessage && (
                            <div className={`alert ${askMessage.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3`}>
                                {askMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BillingPage;