import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api'; 
import StudentLogin from './StudentLogin';
import StudentRegistration from './StudentRegistration';
import AdminLogin from './AdminLogin';

function Login({ onLoginSuccess }) {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSuccess = (result) => {
    // Store session token and user info
    localStorage.setItem('sessionToken', result.sessionToken);
    localStorage.setItem('userRole', result.user.role);
    localStorage.setItem('idNumber', result.user.idNumber);
    localStorage.setItem('userId', result.user.id); // Store the actual user ID from database

    if (result.user.role === 'student') {
      const fullName = `${result.user.firstName} ${result.user.middleName || ''} ${result.user.lastName}`;
      localStorage.setItem('fullName', fullName.trim());
    }

    onLoginSuccess(result.user.role);
  };

  const handleRegistrationSuccess = (result) => {
    // After successful registration, switch to login
    setShowRegistration(false);
    setError('');
    // Show success message
    alert('Registration successful! You can now login with your School ID and password.');
  };

  const handleAdminLoginSuccess = (result) => {
    // Store session token and user info
    localStorage.setItem('sessionToken', result.sessionToken);
    localStorage.setItem('userRole', result.user.role);
    localStorage.setItem('idNumber', result.user.idNumber);
    localStorage.setItem('userId', result.user.id); // Store the actual user ID from database
    localStorage.setItem('fullName', `${result.user.firstName} ${result.user.lastName}`);
    
    onLoginSuccess(result.user.role);
  };

  return (
    <div className="container mt-5">
      <div className="row align-items-center justify-content-center">
        <div className="col-md-5 d-flex justify-content-center">
          <img src="/bcleads.png" alt="Registrar Logo" style={{ maxWidth: '850px', width: '100%', height: 'auto' }} className="mb-4" />
        </div>
        <div className="col-md-7 d-flex justify-content-end">
          <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center" style={{ maxWidth: '500px' }}>
            {showAdminLogin ? (
              <AdminLogin 
                onLoginSuccess={handleAdminLoginSuccess}
                onSwitchToStudent={() => setShowAdminLogin(false)}
              />
            ) : !showRegistration ? (
              <StudentLogin 
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setShowRegistration(true)}
                onSwitchToAdmin={() => setShowAdminLogin(true)}
              />
            ) : (
              <StudentRegistration 
                onRegistrationSuccess={handleRegistrationSuccess}
                onSwitchToLogin={() => setShowRegistration(false)}
              />
            )}
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}
            
            {/* Sample Accounts Info */}
            <div className="text-center mt-3 text-white fs-6">
              <small>Sample Accounts: Student (2022-00037/password) | Admin (A001/adminpass)</small>
            </div>
            
            {/* Switch to Admin Login */}
            {!showRegistration && !showAdminLogin && (
              <button 
                className="btn btn-outline-light btn-sm mt-2"
                onClick={() => setShowAdminLogin(true)}
              >
                Login as Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;