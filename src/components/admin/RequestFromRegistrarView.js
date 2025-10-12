import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import useDebounce from '../../hooks/useDebounce';

function RequestFromRegistrarView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/pending`, {
        headers: { 'X-Session-Token': getSessionToken() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else {
        console.error('Failed to fetch pending payments');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/completed`, {
        headers: { 'X-Session-Token': getSessionToken() }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else {
        console.error('Failed to fetch completed payments');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching completed payments:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    if (showArchive) {
      fetchCompletedPayments();
    } else {
      fetchPendingPayments();
    }
  };

  useEffect(() => {
    fetchData();
  }, [showArchive]);

  const handleProcessPayment = async (requestId, amount, studentName) => {
    const confirmPayment = window.confirm(
      `Confirm payment processing:\n\n` +
      `Student: ${studentName}\n` +
      `Amount: ₱${amount?.toFixed(2)}\n\n` +
      `Has the student paid this amount in cash?`
    );

    if (!confirmPayment) return;

    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken()
        },
        body: JSON.stringify({
          requestId: requestId,
          amount: amount,
          paymentMethod: 'cash',
          receiptNumber: `RCP-${Date.now()}`,
          remarks: `Payment received from ${studentName} - processed by accounting`
        })
      });

      if (response.ok) {
        alert(`✅ Payment processed successfully!\n\nReceipt: RCP-${Date.now()}\nStudent: ${studentName}\nAmount: ₱${amount?.toFixed(2)}\n\nThe registrar has been notified.`);
        fetchData(); // Refresh the current view
      } else {
        const error = await response.json();
        alert(`❌ Failed to process payment: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Error processing payment. Please try again.');
    }
  };

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return requests;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return requests.filter(request => {
      const studentName = request.student 
        ? `${request.student.firstName} ${request.student.lastName}`.toLowerCase()
        : '';
      const studentId = request.student?.idNumber?.toLowerCase() || '';
      const documentType = request.documentType?.toLowerCase() || '';

      return studentName.includes(searchLower) || 
             studentId.includes(searchLower) || 
             documentType.includes(searchLower);
    });
  }, [requests, debouncedSearchTerm]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          Payment Requests from Registrar
          {showArchive && <span className="badge bg-warning ms-2">Archived</span>}
        </h3>
        <div className="d-flex align-items-center">
          <span className={`badge ${showArchive ? 'bg-warning' : 'bg-info'} me-2`}>
            {filteredRequests.length} of {requests.length} {showArchive ? 'completed' : 'pending'} requests
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
                  placeholder="Search by student name, ID, or document type..."
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
            
            {/* Archive Button */}
            <div className="col-md-6 d-flex justify-content-end">
              <button 
                className={`btn ${showArchive ? 'btn-warning' : 'btn-outline-secondary'}`}
                onClick={() => setShowArchive(!showArchive)}
                title={showArchive ? 'View Pending Requests' : 'View Completed Requests'}
              >
                <i className={`fas ${showArchive ? 'fa-folder-open' : 'fa-archive'}`}></i>
                {showArchive ? ' Pending Requests' : ' Archive'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {filteredRequests.length === 0 && requests.length === 0 ? (
            <div className="text-center text-muted">
              <h5>No {showArchive ? 'completed' : 'pending'} payment requests</h5>
              <p>
                {showArchive 
                  ? 'No completed payment requests in archive.'
                  : 'When registrars request documents for students, they will appear here for payment processing.'
                }
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center text-muted">
              <h5>No results found</h5>
              <p>
                {showArchive
                  ? `No completed payment requests match your search criteria: "${debouncedSearchTerm}"`
                  : `No pending payment requests match your search criteria: "${debouncedSearchTerm}"`
                }
              </p>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Document Type</th>
                    <th>Amount</th>
                    <th>Requested By</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td>{req.student?.idNumber || 'N/A'}</td>
                      <td>
                        {req.student ? 
                          `${req.student.lastName}, ${req.student.firstName}` : 
                          'Loading...'
                        }
                      </td>
                      <td>
                        <span className="badge bg-info">{req.documentType}</span>
                      </td>
                      <td>
                        <strong>₱{req.amount?.toFixed(2) || '0.00'}</strong>
                      </td>
                      <td>{req.requestedBy || 'Registrar'}</td>
                      <td>{new Date(req.requestedAt || req.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'payment_required' ? 'bg-warning' :
                          req.status === 'payment_approved' ? 'bg-success' :
                          'bg-secondary'
                        }`}>
                          {req.status === 'payment_required' ? 'Awaiting Payment' : 
                           req.status === 'payment_approved' ? 'Payment Approved' :
                           req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === 'payment_required' ? (
                          <button 
                            className="btn btn-success btn-sm" 
                            onClick={() => handleProcessPayment(
                              req.id, 
                              req.amount, 
                              req.student ? `${req.student.firstName} ${req.student.lastName}` : 'Unknown Student'
                            )}
                          >
                            ✅ Confirm Payment
                          </button>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestFromRegistrarView;