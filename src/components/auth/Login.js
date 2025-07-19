import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';

function Login({ onLoginSuccess }) {
  const [accountType, setAccountType] = useState(null);
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAccountSelect = (type) => {
    setAccountType(type);
  };

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

  if (!accountType) {
    return (
      <div className="optionContainer d-flex justify-content-center align-items-center ">
        <div className="account-selection text-center bg-white p-5 rounded shadow">
          <h4 className="mb-4">Choose Account Type</h4>

          {/* Student */}
          <div className="account-row d-flex justify-content-between align-items-center mb-3">
            <span className="account-label">
              <i className="bi bi-mortarboard"></i> Student
            </span>
            <button className="icon-button" onClick={() => handleAccountSelect('student')}>
              <i className="bi bi-box-arrow-in-right"></i>
            </button>
          </div>
          <hr />

          {/* Registrar */}
          <div className="account-row d-flex justify-content-between align-items-center mb-3">
            <span className="account-label">
              <i className="bi bi-folder2-open"></i> Registrar
            </span>
            <button className="icon-button" onClick={() => handleAccountSelect('registrar')}>
              <i className="bi bi-box-arrow-in-right"></i>
            </button>
          </div>
          <hr />

          {/* Accounting */}
          <div className="account-row d-flex justify-content-between align-items-center">
            <span className="account-label">
              <i className="bi bi-cash-stack"></i> Accounting
            </span>
            <button className="icon-button" onClick={() => handleAccountSelect('accounting')}>
              <i className="bi bi-box-arrow-in-right"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For login form
  const isStudent = accountType === 'student';
  const loginTitle = accountType.charAt(0).toUpperCase() + accountType.slice(1) + ' Portal';
  const labelID = isStudent ? 'ID Number' : 'Username';

  return (
    <div className="container mt-5 w-75">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4">
            <h2 className="text-center mb-4 text-black">{loginTitle}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 d-flex flex-column align-items-center">
                <label htmlFor="idNumber" className="text-black m-2">{labelID}</label>
                <input
                  type="text"
                  className="form-control bg-transparent border-2 border-info rounded-pill w-75"
                  placeholder={`Enter ${isStudent ? 'ID' : 'Username'}`}
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 d-flex flex-column align-items-center">
                <label htmlFor="password" className="text-black m-2">Password</label>
                <input
                  type="password"
                  className="form-control bg-transparent border-2 border-info  rounded-pill w-75"
                  placeholder='Enter password'
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="text-center">
                <button type="submit" className="btn btn-outline-primary btn-md rounded-pill w-50">Login</button>
              </div>
              <p className="text-center mt-3 text-black">
                <small>Dummy Accounts: Student (S001/password) | Admin (A001/adminpass)</small>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

