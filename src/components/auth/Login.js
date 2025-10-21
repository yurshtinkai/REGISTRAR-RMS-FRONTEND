import React, { useState} from 'react';
import UnifiedLogin from './UnifiedLogin';
import StudentRegistration from './StudentRegistration';
import sessionManager from '../../utils/sessionManager';
import { useFooter } from '../../contexts/FooterContext';

function Login({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'register'
  const [error, setError] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { footerYear } = useFooter();

  const handleLoginSuccess = (result) => {
    // Store session token using session manager
    sessionManager.setSessionToken(result.sessionToken);
    
    // Store user info
    localStorage.setItem('userRole', result.user.role);
    localStorage.setItem('idNumber', result.user.idNumber);
    localStorage.setItem('userId', result.user.id); // Store the actual user ID from database

    // Clear any old cached display names to prevent conflicts
    try {
      localStorage.removeItem('displayFullName');
      localStorage.removeItem(`displayFullName:${result.user.idNumber}`);
    } catch {}

    if (result.user.role === 'student') {
      const fullName = `${result.user.firstName} ${result.user.middleName || ''} ${result.user.lastName}`;
      localStorage.setItem('fullName', fullName.trim());
      localStorage.setItem('firstName', result.user.firstName || '');
      localStorage.setItem('lastName', result.user.lastName || '');
      localStorage.setItem('middleName', result.user.middleName || '');
    } else {
      // For admin/accounting users, include middle name if available
      const fullName = `${result.user.firstName} ${result.user.middleName || ''} ${result.user.lastName}`;
      localStorage.setItem('fullName', fullName.trim());
      localStorage.setItem('firstName', result.user.firstName || '');
      localStorage.setItem('lastName', result.user.lastName || '');
      localStorage.setItem('middleName', result.user.middleName || '');
    }

    onLoginSuccess(result.user.role);
  };

  const handleRegistrationSuccess = () => {
    // After successful registration, switch to login
    setView('login');
    setError('');
    // Show success message
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
    <div className="container login-page-container">
      <div className="row align-items-center justify-content-center">
        <div className="col-lg-5 d-none d-lg-flex justify-content-center">
          <img src="/bcleads.png" alt="Registrar Logo" style={{ maxWidth: '850px', width: '100%', height: 'auto' }} className="mb-4" />
        </div>
        <div className="col-12 col-lg-7 d-flex justify-content-center justify-content-lg-end">
        <div className="loginCard shadow-lg p-4 w-100 d-flex flex-column align-items-center" style={{ maxWidth: '500px' }}>
            {renderCurrentView()}
            
            {/* Error Message */}
            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}

            {view !== 'register' && (
              <footer className="text-center mt-4" style={{ color: '#b0b0b0' }}>
                © {footerYear} - Online Records Management System
              </footer>
            )}
            
            {/* FIX: Removed the redundant buttons from here */}
          </div>
        </div>
      </div>
    </div>
  );

}



export default Login;