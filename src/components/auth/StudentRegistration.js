import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './StudentRegistration.css';

function StudentRegistration({ onRegistrationSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        idNumber: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        middleName: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Validate School ID format (YYYY-XXXXX)
        const schoolIdPattern = /^\d{4}-\d{5}$/;
        if (!schoolIdPattern.test(formData.idNumber)) {
            setError('School ID must be in the format: YYYY-XXXXX (e.g., 2022-00037)');
            return false;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        // Validate required fields
        if (!formData.firstName || !formData.lastName) {
            setError('First Name and Last Name are required');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (!validateForm()) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/students/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idNumber: formData.idNumber,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    middleName: formData.middleName
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSuccess(result.message);
                
                // Persist a flag so we can show the welcome prompt after first login
                try {
                    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();
                    localStorage.setItem('showWelcomeRegistrationPrompt', '1');
                    localStorage.setItem('registeredStudentName', fullName);
                } catch (_) {}

                // Clear form
                setFormData({
                    idNumber: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: '',
                    middleName: ''
                });

                // Notify parent component immediately about successful registration
                if (onRegistrationSuccess) {
                    onRegistrationSuccess(result);
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-registration-container">
            <div className="registration-header">
                <h2>🎓 Register as New Student</h2>
                <p>Create your student account to access the student dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="idNumber">School ID Number *</label>
                        <input
                            type="text"
                            id="idNumber"
                            name="idNumber"
                            value={formData.idNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., 2022-00037"
                            required
                            maxLength="10"
                        />
                        <small>Format: YYYY-XXXXX (e.g., 2022-00037)</small>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="middleName">Middle Name</label>
                        <input
                            type="text"
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            placeholder="Enter your middle name"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create a password (min. 6 characters)"
                            required
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            required
                            minLength="6"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-register"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register as Student'}
                    </button>
                </div>

                <div className="form-footer">
                    <p>Already have an account? 
                        <button 
                            type="button" 
                            className="btn-link"
                            onClick={onSwitchToLogin}
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </form>

            {/* Messages */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            
        </div>
    );
}

export default StudentRegistration;
