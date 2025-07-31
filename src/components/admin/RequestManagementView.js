import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function RequestManagementView({ setDocumentModalData }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole');
  const isReadOnly = userRole === 'accounting';
  const isAdmin = userRole === 'admin';

  const fetchAllRequests = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setRequests(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllRequests(); }, []);

  const handleApproveOrReject = async (requestId, newStatus) => {
    if (userRole !== 'admin') {
      return;
    }

    const notes = prompt(`Enter notes for this action (${newStatus}):`);
    if (notes === null) return;

    try {
      await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });   
      fetchAllRequests();
    } catch (err) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleViewDocument = (request) => {
    if (request.filePath && Array.isArray(request.filePath) && request.filePath.length > 0) {
      setDocumentModalData({
        filePaths: request.filePath,
        requestId: request.id,
      });
    }
  };

  const handlePrint = async (requestToPrint) => {
    try {
        await fetch(`${API_BASE_URL}/requests/${requestToPrint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ status: 'ready for pick-up', notes: 'Document printed and ready for collection.' }),
        });
        await fetchAllRequests();
  
        const studentName = requestToPrint.User 
            ? `${requestToPrint.User.lastName}, ${requestToPrint.User.firstName} ${requestToPrint.User.middleName || ''}` 
            : '[Student Full Name]'; 
        const studentCourse = requestToPrint.User?.course || '[Student Course]';
        const academicYear = '2024-2025';
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        let printContent = '';
        switch (requestToPrint.documentType.toUpperCase()) {
            case 'GOOD MORAL':
                printContent = `<div class="print-container"><div class="header"><h1>CERTIFICATE OF GOOD MORAL CHARACTER</h1></div><p class="date">${today}</p><p class="body-text">This is to certify that <b>${studentName}</b>, a student of <b>${studentCourse}</b> for Academic Year ${academicYear}, is of good moral character.</p><p class="body-text">This certification is issued upon the request of the student for <b>${requestToPrint.purpose}</b> purposes only.</p><div class="signature-block"><p><b>[REGISTRAR'S NAME]</b></p><p>School Registrar</p></div></div>`;
                break;
            case 'TOR':
                printContent = `<div class="print-container"><div class="header"><h1>OFFICIAL TRANSCRIPT OF RECORDS</h1></div><div><b>Student:</b> ${studentName}</div><div><b>Student No:</b> ${requestToPrint.User?.idNumber}</div><p><i>(Simplified for demonstration)</i></p><table class="grades-table"><thead><tr><th>Code</th><th>Description</th><th>Grade</th></tr></thead><tbody><tr><td>CS101</td><td>Intro to Programming</td><td>1.5</td></tr></tbody></table></div>`;
                break;
            default:
                printContent = `<h1>${requestToPrint.documentType}</h1><p>Template for this document is not yet available.</p>`;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Print</title><style>body{font-family:serif;margin:40px}.print-container{max-width:800px;margin:auto}.header{text-align:center;margin-bottom:40px}.date{text-align:right}.body-text{line-height:1.6;margin:20px 0}.signature-block{margin-top:80px;text-align:right}.grades-table{width:100%;border-collapse:collapse;margin-top:20px}.grades-table th,td{border:1px solid #ccc;padding:8px}</style></head><body>${printContent}<script>setTimeout(()=>{window.print();window.close()},250)</script></body></html>`);
        printWindow.document.close();
    } catch(err) {
        console.error("Error during print process:", err);
        setError(`Failed to print and update status: ${err.message}`);
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
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container-fluid">
        <h2 className="mb-4">Request Management</h2>
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                    <table className="table table-hover">
                        <thead className="table-dark sticky-top">
                            <tr><th>ID</th><th>Student</th><th>Doc Type</th><th>Purpose</th><th>Status</th><th>Notes</th><th>Document</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.id}</td><td>{req.User?.idNumber || 'N/A'}</td><td>{req.documentType}</td><td>{req.purpose}</td>
                                    <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status.replace(/_/g, ' ')}</span></td>
                                    <td>{req.notes || 'N/A'}</td>
                                    <td>{req.filePath && req.filePath.length > 0 ? (
                                      <button
                                        className="btn btn-sm btn-info"
                                        onClick={(e) => {
                                        // First, check for permissions from handleViewClick
                                        if (!isAdmin) {
                                        e.preventDefault();
                                        return;
                                        }
                                        // If permissions are okay, then open the document
                                        handleViewDocument(req);
                                      }}
                                      >View</button>) : 'N/A'}</td>

                                    <td>
                                      <div className="d-flex">
                                        {req.status === 'pending' && (
                                          <>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => handleApproveOrReject(req.id, 'approved')}>Approve</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleApproveOrReject(req.id, 'rejected')}>Reject</button>
                                          </>
                                        )}
                                        {req.status === 'approved' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handlePrint(req)} disabled={isReadOnly}>
                                              Print
                                            </button>
                                        )}
                                        {req.status === 'ready for pick-up' && (
                                            <button className="btn btn-sm btn-secondary" onClick={() => handlePrint(req)} disabled={isReadOnly}>
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
    </div>
  );
}
export default RequestManagementView;