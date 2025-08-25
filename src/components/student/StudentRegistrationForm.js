import React, { useState, useEffect } from 'react';
import './StudentRegistrationForm.css';
import { API_BASE_URL } from '../../utils/api';

function StudentRegistrationForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Basic Information
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        gender: '',
        maritalStatus: '',
        nationality: 'Filipino',
        religion: '',
        
        // Contact Information
        email: '',
        contactNumber: '',
        cityAddress: '',
        cityTelNumber: '',
        provincialAddress: '',
        provincialTelNumber: '',
        
        // Family Background
        fatherName: '',
        fatherAddress: '',
        fatherOccupation: '',
        fatherCompany: '',
        fatherContactNumber: '',
        fatherIncome: '',
        
        motherName: '',
        motherAddress: '',
        motherOccupation: '',
        motherCompany: '',
        motherContactNumber: '',
        motherIncome: '',
        
        guardianName: '',
        guardianAddress: '',
        guardianOccupation: '',
        guardianCompany: '',
        guardianContactNumber: '',
        guardianIncome: '',
        
        // Academic Information
        yearLevel: '',
        semester: '1st',
        schoolYear: '2025-2026',
        applicationType: 'Freshmen',
        studentType: 'First',
        
        // Academic Background
        elementarySchool: '',
        elementaryAddress: '',
        elementaryHonor: '',
        elementaryYearGraduated: '',
        
        juniorHighSchool: '',
        juniorHighAddress: '',
        juniorHighHonor: '',
        juniorHighYearGraduated: '',
        
        seniorHighSchool: '',
        seniorHighAddress: '',
        seniorHighStrand: '',
        seniorHighHonor: '',
        seniorHighYearGraduated: '',
        
        ncaeGrade: '',
        specialization: '',
        
        // College Background (if applicable)
        lastCollegeAttended: '',
        lastCollegeYearTaken: '',
        lastCollegeCourse: '',
        lastCollegeMajor: '',
        
        // Course Information
        course: 'Bachelor of Science in Information Technology',
        major: 'Information Technology'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Get session token from localStorage
    const sessionToken = localStorage.getItem('sessionToken');
    
    // Debug: Log what we found
    console.log('Session token:', sessionToken);

    const yearLevels = [
        { value: '1st', label: '1st Year' },
        { value: '2nd', label: '2nd Year' },
        { value: '3rd', label: '3rd Year' },
        { value: '4th', label: '4th Year' }
    ];

    const semesters = [
        { value: '1st', label: '1st Semester' },
        { value: '2nd', label: '2nd Semester' },
        { value: 'Summer', label: 'Summer' }
    ];

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
        setSuccess('');

        try {
            // Check if user is authenticated
            if (!sessionToken) {
                setError('User not authenticated. Please login again.');
                setLoading(false);
                return;
            }
            
            // Validate required fields
            if (!formData.firstName || !formData.lastName || !formData.yearLevel) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Submit form data
            const response = await fetch(`${API_BASE_URL}/students/complete-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Token': sessionToken
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccess('Registration completed successfully! Your schedule and subjects have been loaded.');
                // Reset form after successful submission
                setTimeout(() => {
                    setFormData({
                        firstName: '', middleName: '', lastName: '', dateOfBirth: '', placeOfBirth: '',
                        gender: '', maritalStatus: '', nationality: 'Filipino', religion: '',
                        email: '', contactNumber: '', cityAddress: '', cityTelNumber: '',
                        provincialAddress: '', provincialTelNumber: '', fatherName: '', fatherAddress: '',
                        fatherOccupation: '', fatherCompany: '', fatherContactNumber: '', fatherIncome: '',
                        motherName: '', motherAddress: '', motherOccupation: '', motherCompany: '',
                        motherContactNumber: '', motherIncome: '', guardianName: '', guardianAddress: '',
                        guardianOccupation: '', guardianCompany: '', guardianContactNumber: '', guardianIncome: '',
                        yearLevel: '', semester: '1st', schoolYear: '2025-2026', applicationType: 'Freshmen',
                        studentType: 'First', elementarySchool: '', elementaryAddress: '', elementaryHonor: '',
                        elementaryYearGraduated: '', juniorHighSchool: '', juniorHighAddress: '', juniorHighHonor: '',
                        juniorHighYearGraduated: '', seniorHighSchool: '', seniorHighAddress: '', seniorHighStrand: '',
                        seniorHighHonor: '', seniorHighYearGraduated: '', ncaeGrade: '', specialization: '',
                        lastCollegeAttended: '', lastCollegeYearTaken: '', lastCollegeCourse: '', lastCollegeMajor: '',
                        course: 'Bachelor of Science in Information Technology', major: 'Information Technology'
                    });
                    setCurrentStep(1);
                }, 3000);
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

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3, 4].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                    <span className="step-number">{step}</span>
                    <span className="step-label">
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Contact & Family'}
                        {step === 3 && 'Academic Background'}
                        {step === 4 && 'Review & Submit'}
                    </span>
                </div>
            ))}
        </div>
    );

    const renderBasicInfo = () => (
        <div className="form-section">
            <h3>Basic Information</h3>
            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">First Name *</label>
                    <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Last Name *</label>
                    <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                        type="date"
                        className="form-control"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Place of Birth</label>
                    <input
                        type="text"
                        className="form-control"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Marital Status</label>
                    <select
                        className="form-select"
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Nationality</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Religion</label>
                    <input
                        type="text"
                        className="form-control"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );

    const renderContactFamily = () => (
        <div className="form-section">
            <h3>Contact Information & Family Background</h3>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Contact Number</label>
                    <input
                        type="tel"
                        className="form-control"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">City Address</label>
                    <textarea
                        className="form-control"
                        name="cityAddress"
                        value={formData.cityAddress}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Provincial Address</label>
                    <textarea
                        className="form-control"
                        name="provincialAddress"
                        value={formData.provincialAddress}
                        onChange={handleInputChange}
                        rows="3"
                    />
                </div>
                
                {/* Father's Information */}
                <div className="col-12">
                    <h5 className="section-subtitle">Father's Information</h5>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Father's Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Father's Occupation</label>
                    <input
                        type="text"
                        className="form-control"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleInputChange}
                    />
                </div>
                
                {/* Mother's Information */}
                <div className="col-12">
                    <h5 className="section-subtitle">Mother's Information</h5>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Mother's Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Mother's Occupation</label>
                    <input
                        type="text"
                        className="form-control"
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );

    const renderAcademicBackground = () => (
        <div className="form-section">
            <h3>Academic Background</h3>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Elementary School</label>
                    <input
                        type="text"
                        className="form-control"
                        name="elementarySchool"
                        value={formData.elementarySchool}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Elementary Year Graduated</label>
                    <input
                        type="number"
                        className="form-control"
                        name="elementaryYearGraduated"
                        value={formData.elementaryYearGraduated}
                        onChange={handleInputChange}
                        min="1980"
                        max="2030"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Junior High School</label>
                    <input
                        type="text"
                        className="form-control"
                        name="juniorHighSchool"
                        value={formData.juniorHighSchool}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Junior High Year Graduated</label>
                    <input
                        type="number"
                        className="form-control"
                        name="juniorHighYearGraduated"
                        value={formData.juniorHighYearGraduated}
                        onChange={handleInputChange}
                        min="1980"
                        max="2030"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Senior High School</label>
                    <input
                        type="text"
                        className="form-control"
                        name="seniorHighSchool"
                        value={formData.seniorHighSchool}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Senior High Strand</label>
                    <input
                        type="text"
                        className="form-control"
                        name="seniorHighStrand"
                        value={formData.seniorHighStrand}
                        onChange={handleInputChange}
                        placeholder="e.g., STEM, ABM, HUMSS"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Senior High Year Graduated</label>
                    <input
                        type="number"
                        className="form-control"
                        name="seniorHighYearGraduated"
                        value={formData.seniorHighYearGraduated}
                        onChange={handleInputChange}
                        min="1980"
                        max="2030"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">NCAE Grade</label>
                    <input
                        type="text"
                        className="form-control"
                        name="ncaeGrade"
                        value={formData.ncaeGrade}
                        onChange={handleInputChange}
                        placeholder="e.g., 95.5"
                    />
                </div>
            </div>
        </div>
    );

    const renderReviewSubmit = () => (
        <div className="form-section">
            <h3>Review & Submit</h3>
            <div className="review-container">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label">Year Level *</label>
                        <select
                            className="form-select"
                            name="yearLevel"
                            value={formData.yearLevel}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Semester</label>
                        <select
                            className="form-select"
                            name="semester"
                            value={formData.semester}
                            onChange={handleInputChange}
                        >
                            {semesters.map(sem => (
                                <option key={sem.value} value={sem.value}>
                                    {sem.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="review-summary">
                    <h5>Registration Summary</h5>
                    <p><strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                    <p><strong>Course:</strong> {formData.course}</p>
                    <p><strong>Year Level:</strong> {formData.yearLevel || 'Not selected'}</p>
                    <p><strong>Semester:</strong> {formData.semester}</p>
                    <p><strong>School Year:</strong> {formData.schoolYear}</p>
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderBasicInfo();
            case 2: return renderContactFamily();
            case 3: return renderAcademicBackground();
            case 4: return renderReviewSubmit();
            default: return renderBasicInfo();
        }
    };

    return (
        <div className="student-registration-form">
            {/* Header */}
            <div className="registration-header">
                <div className="welcome-banner">
                    <h1>🎓 Welcome to Bachelor of Science in Information Technology</h1>
                    <p>Complete your permanent student data registration to access your academic schedule and subjects</p>
                </div>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Form */}
            <form onSubmit={handleSubmit} className="registration-form">
                {renderCurrentStep()}

                {/* Navigation Buttons */}
                <div className="form-navigation">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={prevStep}
                            disabled={loading}
                        >
                            ← Previous
                        </button>
                    )}
                    
                    {currentStep < 4 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={nextStep}
                            disabled={loading}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </button>
                    )}
                </div>
            </form>

            {/* Messages */}
            {error && (
                <div className="alert alert-danger mt-3">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="alert alert-success mt-3">
                    {success}
                </div>
            )}
        </div>
    );
}

export default StudentRegistrationForm;