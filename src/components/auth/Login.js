import React, { useState, useEffect } from 'react';
import UnifiedLogin from './UnifiedLogin';
import StudentRegistration from './StudentRegistration';
import sessionManager from '../../utils/sessionManager';

function Login({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'register'
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleLoginSuccess = (result) => {
    // Store session token using session manager
    sessionManager.setSessionToken(result.sessionToken);
    
    // Store user info
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
    setView('login');
    setError('');
    // Show success message
    alert('Registration successful! You can now login with your School ID and password.');
  };

  const switchToRegister = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView('register');
      setIsTransitioning(false);
    }, 150);
  };

  const switchToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView('login');
      setIsTransitioning(false);
    }, 150);
  };

  const renderCurrentView = () => {
    const formClass = `form-view ${isTransitioning ? 'fade-out' : 'fade-in'}`;
    
    switch (view) {
      case 'register':
        return (
          <div className={formClass}>
            <StudentRegistration 
              onRegistrationSuccess={handleRegistrationSuccess} 
              onSwitchToLogin={switchToLogin} 
            />
          </div>
        );
      case 'login':
      default:
        return (
          <div className={formClass}>
            <UnifiedLogin 
              onLoginSuccess={handleLoginSuccess} 
              onSwitchToRegister={switchToRegister}
            />
          </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;