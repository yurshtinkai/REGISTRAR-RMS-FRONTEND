import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api'; 

function Login({ onLoginSuccess }) {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ idNumber, password }) 
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('idNumber', data.user.idNumber);
      onLoginSuccess(data.user.role);
    } catch (err) {
      setError(err.message); 
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4 position-relative"> 
            <h2 className="text-center mb-4">Login to Registrar Portal</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="idNumber">ID Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="idNumber" 
                    value={idNumber} 
                    onChange={(e) => setIdNumber(e.target.value)} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    className="form-control"
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">Login</button>
                </div>
                <p className="text-center mt-3 text-muted">
                  <small>Dummy Accounts: Student (S001/password) | Admin (A001/adminpass)| Accounting (AC001/accountingpass)</small>
                </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;