import React, { useState } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';
import './StudentRegistrationForm.css';

function StudentRegistrationForm({ onRegistrationComplete }) {
    const [formData, setFormData] = useState({
        gender: 'Male',
        dateOfBirth: '',
        placeOfBirth: '',
        civilStatus: 'Single',
        religion: '',
        parentGuardian: '',
        permanentAddress: '',
        previousSchool: '',
        yearOfEntry: new Date().getFullYear(),
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/register/student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit registration.');
            }

            setSuccess('Registration successful! Your data has been saved.');
            setTimeout(() => {
                onRegistrationComplete();
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="registration-form-container">
            <div className="card shadow-lg">
                <div className="card-header">
                    <h3 className="mb-0">Complete Your Registration</h3>
                    <p className="text-muted mb-0">Please provide your personal information to complete your student profile.</p>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Place of Birth</label>
                                <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Civil Status</label>
                                <select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="form-select">
                                    <option>Single</option>
                                    <option>Married</option>
                                    <option>Widowed</option>
                                    <option>Separated</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Religion</label>
                                <input type="text" name="religion" value={formData.religion} onChange={handleChange} className="form-control" required />
                            </div>
                             <div className="col-md-4 mb-3">
                                <label className="form-label">Year of Entry</label>
                                <input type="number" name="yearOfEntry" value={formData.yearOfEntry} onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="col-md-12 mb-3">
                                <label className="form-label">Parent/Guardian Name</label>
                                <input type="text" name="parentGuardian" value={formData.parentGuardian} onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="col-md-12 mb-3">
                                <label className="form-label">Permanent Address</label>
                                <input type="text" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="form-control" required />
                            </div>
                             <div className="col-md-12 mb-3">
                                <label className="form-label">Previous School Attended</label>
                                <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="form-control" required />
                            </div>
                        </div>

                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                        {success && <div className="alert alert-success mt-3">{success}</div>}

                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary">Submit Registration</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StudentRegistrationForm;