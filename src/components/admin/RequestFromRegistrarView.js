import React, { useEffect, useState } from 'react';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

function RequestFromRegistrarView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/registrar-requests`, {
      headers: { 'X-Session-Token': getSessionToken() }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id, status) => {
    await fetch(`${API_BASE_URL}/registrar-requests/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': getSessionToken()
      },
      body: JSON.stringify({ status })
    });
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h3>Requests From Registrar</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID No.</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Course</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.student?.idNumber}</td>
              <td>{req.student ? `${req.student.lastName}, ${req.student.firstName}` : ''}</td>
              <td>{req.student?.gender}</td>
              <td>{req.student?.course}</td>
              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
              <td>
                {req.status === 'pending' ? (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => handleStatusChange(req.id, 'approved')}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStatusChange(req.id, 'rejected')}>Reject</button>
                  </>
                ) : (
                  <span className={`badge ${req.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>{req.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RequestFromRegistrarView;