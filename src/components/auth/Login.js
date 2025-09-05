import React, { useState } from 'react';
import StudentLogin from './StudentLogin';
import StudentRegistration from './StudentRegistration';
import AdminLogin from './AdminLogin';
import AccountingLogin from './AccountingLogin';

function Login({ onLoginSuccess }) {
  const [view, setView] = useState('student'); // 'student', 'register', 'admin', 'accounting'
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
    } else {
      localStorage.setItem('fullName', `${result.user.firstName} ${result.user.lastName}`);
    }

    onLoginSuccess(result.user.role);
  };

  const handleRegistrationSuccess = () => {
    // After successful registration, switch to login
    setView('student');
    setError('');
    // Show success message
    alert('Registration successful! You can now login with your School ID and password.');
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'admin':
        return <AdminLogin onLoginSuccess={handleLoginSuccess} onSwitchToStudent={() => setView('student')} />;
      case 'accounting':
        return <AccountingLogin onLoginSuccess={handleLoginSuccess} onSwitchToStudent={() => setView('student')} />;
      case 'register':
        return <StudentRegistration onRegistrationSuccess={handleRegistrationSuccess} onSwitchToLogin={() => setView('student')} />;
      case 'student':
      default:
        // FIX: Pass the required props to StudentLogin
        return (
          <StudentLogin 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setView('register')}
            onSwitchToAdmin={() => setView('admin')}
            onSwitchToAccounting={() => setView('accounting')}
          />
        );
    }
  };

  return (
    <div className="container mt-5">
      <div className="row align-items-center justify-content-center">
        <div className="col-md-5 d-flex justify-content-center">
          <img src="/bcleads.png" alt="Registrar Logo" style={{ maxWidth: '850px', width: '100%', height: 'auto' }} className="mb-4" />
        </div>
        <div className="col-md-7 d-flex justify-content-end">
          <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center" style={{ maxWidth: '500px' }}>
            {renderCurrentView()}
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}

            
            {/* Sample Accounts Info */}
            <div className="text-center mt-3 text-white fs-6">
              <small>Sample Accounts: Student (2022-00037/password) | Admin (A001/adminpass) | Accounting (ACC01/accpass)</small>
            </div>

            <footer className="text-center mt-4 text-muted">
            © 2025 - Online Records Management System
            </footer>
            
            {/* FIX: Removed the redundant buttons from here */}
          </div>
        </div>
      </div>
    </div>
  );

}



export default Login;