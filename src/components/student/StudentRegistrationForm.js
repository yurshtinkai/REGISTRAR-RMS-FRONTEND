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
        semester: '',
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
    const [semesters, setSemesters] = useState([]);
    const [loadingSemesters, setLoadingSemesters] = useState(true);
    const [curriculum, setCurriculum] = useState(null);
    const [loadingCurriculum, setLoadingCurriculum] = useState(false);
    
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

    // Fetch semesters from API
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                setLoadingSemesters(true);
                const response = await fetch(`${API_BASE_URL}/semesters`, {
                    headers: {
                        'X-Session-Token': sessionToken,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const semestersData = await response.json();
                    console.log('📅 Fetched semesters:', semestersData);
                    
                    // Transform the data to match the expected format
                    const transformedSemesters = semestersData.map(semester => ({
                        value: semester.code.toLowerCase(),
                        label: semester.name,
                        id: semester.id,
                        code: semester.code,
                        name: semester.name,
                        description: semester.description
                    }));
                    
                    setSemesters(transformedSemesters);
                } else {
                    console.error('Failed to fetch semesters:', response.status);
                    // Fallback to hardcoded semesters if API fails
                    setSemesters([
                        { value: '1st', label: '1st Semester' },
                        { value: '2nd', label: '2nd Semester' },
                        { value: 'sum', label: 'Summer' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching semesters:', error);
                // Fallback to hardcoded semesters if API fails
                setSemesters([
                    { value: '1st', label: '1st Semester' },
                    { value: '2nd', label: '2nd Semester' },
                    { value: 'sum', label: 'Summer' }
                ]);
            } finally {
                setLoadingSemesters(false);
            }
        };

        if (sessionToken) {
            fetchSemesters();
        }
    }, [sessionToken]);

    // Fetch curriculum when year level or semester changes
    const fetchCurriculum = async (yearLevel, semester) => {
        console.log('🔄 fetchCurriculum called with:', { yearLevel, semester });
        
        if (!yearLevel || !semester) {
            console.log('❌ Missing yearLevel or semester, clearing curriculum');
            setCurriculum(null);
            return;
        }

        try {
            setLoadingCurriculum(true);
            const url = `${API_BASE_URL}/curriculum/curriculum?yearLevel=${yearLevel}&semester=${semester}`;
            console.log('📡 Fetching curriculum from:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const curriculumData = await response.json();
                console.log('✅ Curriculum data received:', curriculumData);
                setCurriculum(curriculumData);
            } else {
                console.error('❌ Failed to fetch curriculum:', response.status);
                setCurriculum(null);
            }
        } catch (error) {
            console.error('❌ Error fetching curriculum:', error);
            setCurriculum(null);
        } finally {
            setLoadingCurriculum(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: value
            };

            // Fetch curriculum when year level or semester changes
            if (name === 'yearLevel' || name === 'semester') {
                fetchCurriculum(newFormData.yearLevel, newFormData.semester);
            }

            return newFormData;
        });
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
                        yearLevel: '', semester: '', schoolYear: '2025-2026', applicationType: 'Freshmen',
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
                            disabled={loadingSemesters}
                        >
                            <option value="">Select Semester</option>
                            {loadingSemesters ? (
                                <option value="" disabled>Loading semesters...</option>
                            ) : (
                                semesters.map(sem => (
                                    <option key={sem.value} value={sem.value}>
                                        {sem.label}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>
                
                <div className="review-summary">
                    <h5>Registration Summary</h5>
                    <p><strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                    <p><strong>Course:</strong> {formData.course}</p>
                    <p><strong>Year Level:</strong> {formData.yearLevel ? yearLevels.find(level => level.value === formData.yearLevel)?.label || formData.yearLevel : 'Not selected'}</p>
                    <p><strong>Semester:</strong> {formData.semester ? semesters.find(sem => sem.value === formData.semester)?.label || formData.semester : 'Not selected'}</p>
                    <p><strong>School Year:</strong> {formData.schoolYear}</p>
                </div>

                {/* Curriculum Display */}
                {formData.yearLevel && formData.semester && (
                    <div className="curriculum-display mt-4">
                        <h5 className="mb-3">
                            <i className="fas fa-book me-2"></i>
                            Your Subjects and Schedule
                        </h5>
                        
                        
                        {loadingCurriculum ? (
                            <div className="text-center py-3">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading subjects...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading your subjects and schedule...</p>
                            </div>
                        ) : curriculum && curriculum.subjects && curriculum.subjects.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover">
                                    <thead className="table-primary">
                                        <tr>
                                            <th>COURSE CODE</th>
                                            <th>COURSE DESCRIPTION</th>
                                            <th>NO. OF UNITS</th>
                                            <th>DAY</th>
                                            <th>TIME</th>
                                            <th>ROOM</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {curriculum.subjects.map((subject) => (
                                            <tr key={subject.courseCode}>
                                                <td><strong>{subject.courseCode}</strong></td>
                                                <td>{subject.courseDescription}</td>
                                                <td className="text-center">{subject.units}</td>
                                                <td className="text-center">
                                                    {subject.schedules.map((schedule, idx) => (
                                                        <React.Fragment key={schedule.id || idx}>
                                                            {schedule.dayOfWeek}
                                                            {idx < subject.schedules.length - 1 && <br />}
                                                        </React.Fragment>
                                                    ))}
                                                </td>
                                                <td className="text-center">
                                                     {subject.schedules.map((schedule, idx) => (
                                                        <React.Fragment key={schedule.id || idx}>
                                                            {schedule.startTime} - {schedule.endTime}
                                                            {schedule.courseType && <span className="badge bg-secondary ms-1">{schedule.courseType}</span>}
                                                            {idx < subject.schedules.length - 1 && <br />}
                                                        </React.Fragment>
                                                    ))}
                                                </td>
                                                <td className="text-center">
                                                     {subject.schedules.map((schedule, idx) => (
                                                        <React.Fragment key={schedule.id || idx}>
                                                            {schedule.room || 'TBA'}
                                                            {idx < subject.schedules.length - 1 && <br />}
                                                        </React.Fragment>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <td colSpan="2" className="text-end fw-bold">
                                                <strong>Total Number of Units &gt;&gt;&gt;</strong>
                                            </td>
                                            <td className="text-center fw-bold">{curriculum.totalUnits}</td>
                                            <td colSpan="3"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                                
                                <div className="curriculum-info mt-3">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Year Level:</strong> {curriculum.yearLevel}</p>
                                            <p className="mb-1"><strong>Semester:</strong> {curriculum.semester}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-1"><strong>Total Subjects:</strong> {curriculum.totalSubjects}</p>
                                            <p className="mb-1"><strong>Total Units:</strong> {curriculum.totalUnits}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                {formData.semester === 'sum' || formData.semester === 'Summer' ? 
                                    'No subjects for summer' : 
                                    `No subjects found for ${formData.yearLevel} - ${formData.semester}. Please select a different year level or semester.`
                                }
                            </div>
                        )}
                    </div>
                )}
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