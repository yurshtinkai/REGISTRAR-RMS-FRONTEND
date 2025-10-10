import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';
import './UnifiedLogin.css';

const ENV_HEADER = process.env.REACT_APP_STUDENT_LOGIN_HEADER || '🎓 🔐 Welcome Back';
const LOCAL_STORAGE_KEY_HEADER = 'studentLogin.headerText';

function UnifiedLogin({ onLoginSuccess, onSwitchToRegister }) {
    const [formData, setFormData] = useState({
        idNumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginTitle, setLoginTitle] = useState('🔐 Welcome Back');
    const [loginSubtitle, setLoginSubtitle] = useState('Sign in to your account with your ID and password');

    // Fetch login settings on component mount
    useEffect(() => {
        const fetchLoginSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/settings?category=ui`);
                if (response.ok) {
                    const data = await response.json();
                    const settings = data.data || [];
                    
                    const titleSetting = settings.find(s => s.key === 'login_title');
                    const subtitleSetting = settings.find(s => s.key === 'login_subtitle');
                    
                    if (titleSetting) setLoginTitle(titleSetting.value);
                    if (subtitleSetting) setLoginSubtitle(subtitleSetting.value);
                }
            } catch (error) {
                console.error('Error fetching login settings:', error);
                // Keep default values if fetch fails
            }
        };

        fetchLoginSettings();
        
        // Set up interval to check for settings changes every 30 seconds
        const interval = setInterval(fetchLoginSettings, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/sessions/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber: formData.idNumber,
                    password: formData.password
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Store session token using session manager
                sessionManager.setSessionToken(result.sessionToken);
                
                // Store user info
                localStorage.setItem('userInfo', JSON.stringify(result.user));
                
                // Clear form
                setFormData({
                    idNumber: '',
                    password: ''
                });

                // Notify parent component about successful login
                if (onLoginSuccess) {
                    onLoginSuccess(result);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPlaceholderText = () => {
        const idNumber = formData.idNumber;
        if (idNumber.startsWith('A')) {
            return 'Enter Admin ID (e.g., A001)';
        } else if (idNumber.startsWith('ACC')) {
            return 'Enter Accounting ID (e.g., ACC01)';
        } else {
            return 'Enter School ID (e.g., 2022-00037)';
        }
    };

    const getLoginButtonText = () => {
        const idNumber = formData.idNumber;
        if (idNumber.startsWith('A')) {
            return loading ? 'Logging in as Admin...' : 'Login as Administrator';
        } else if (idNumber.startsWith('ACC')) {
            return loading ? 'Logging in as Accounting...' : 'Login as Accounting';
        } else {
            return loading ? 'Signing In...' : 'Sign In as Student';
        }
    };
const HEADER_TEXT = process.env.REACT_APP_STUDENT_LOGIN_HEADER || '🔐 Welcome Back';
    return (
        <div className="unified-login-container">
            <div className="login-header">
                <h2>{loginTitle}</h2>
                <p>{loginSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="idNumber">ID Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        placeholder="Enter your ID number"
                        required
                        maxLength="10"
                    />
                    <small className="form-text">
                        {formData.idNumber && (
                            <>
                                {formData.idNumber.startsWith('A') && 'Admin ID detected'}
                                {formData.idNumber.startsWith('ACC') && 'Accounting ID detected'}
                                {!formData.idNumber.startsWith('A') && !formData.idNumber.startsWith('ACC') && 'Student ID detected'}
                            </>
                        )}
                    </small>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {getLoginButtonText()}
                    </button>
                </div>

                <div className="form-footer">
                    <p>Don't have an account? 
                        <button 
                            type="button" 
                            className="btn-link"
                            onClick={onSwitchToRegister}
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default UnifiedLogin;
