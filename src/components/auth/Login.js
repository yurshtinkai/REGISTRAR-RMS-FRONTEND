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
      <div className="row align-items-center justify-content-center">
        <div className="col-md-5 d-flex justify-content-center">
          <img src="/bcleads.png" alt="Registrar Logo" style={{ maxWidth: '850px', width: '100%', height: 'auto' }} className="mb-4" />
        </div>
        <div className="col-md-7 d-flex justify-content-end">
          <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center" style={{ maxWidth: '400px' }}>
            <i className="fa-solid fa-user mb-1 fs-1" style={{color:'#dd5618'}}></i>
            <h2 className="text-center mb-3" style={{color:'#dd5618'}}>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-3 w-100 d-flex flex-column align-items-center">
                    <label htmlFor="idNumber" className="mb-1 fs-5" style={{color:'#dd5618'}}>ID Number</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3 text-center" 
                      style={{maxWidth: '260px'}} 
                      id="idNumber" 
                      value={idNumber} 
                      onChange={(e) => setIdNumber(e.target.value)} 
                      required 
                      placeholder='Enter your ID number'
                    />
                  </div>
                  <div className="mb-3 w-100 d-flex flex-column align-items-center">
                    <label htmlFor="password" className="mb-1 fs-5" style={{color:'#dd5618'}}>Password</label>
                    <input 
                      type="password" 
                      className="form-control rounded-3 text-center" 
                      style={{maxWidth: '260px'}} 
                      id="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required
                      placeholder='Enter your password'
                    />
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid">
                  <button type="submit" className="btn btn-outline-orange rounded-pill mt-2">Login</button>
                </div>
                <p className="text-center mt-3 text-white fs-6">
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