import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDummyCurriculum } from '../../data/dummyData';
import CurriculumTrackModal from './CurriculumTrackModal';
import './StudentDetailView.css';
import './CurriculumTrackModal.css';
import { API_BASE_URL, getToken } from '../../utils/api';

function StudentDetailView({ enrolledStudents }) {
  const { idNo } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student details from backend
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const enrolledStudent = enrolledStudents.find(s => s.idNo === idNo);
        
        if (!enrolledStudent) {
          setError('Student not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/students/${enrolledStudent.id}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (response.ok) {
          const studentData = await response.json();
          console.log('Student data from backend:', studentData); // Debug log
          console.log('Student details:', studentData.studentDetails); // Debug log for student details
          setStudent(studentData);
        } else {
          setError('Failed to fetch student details');
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        setError('Error fetching student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [idNo, enrolledStudents]);

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num) => {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const studentDetails = useMemo(() => {
    if (!student) return null;
    
    return {
      documentRequests: [],
      enrolledSubjects: {},
      allTakenSubjects: [],
      curriculum: getDummyCurriculum(student.studentDetails?.course?.name || student.course),
      academicInfo: {
        status: student.studentDetails?.academicStatus || 'Not registered',
        semester: `${student.studentDetails?.currentSemester || 1}${getOrdinalSuffix(student.studentDetails?.currentSemester || 1)} Semester`,
        yearOfEntry: student.studentDetails?.yearOfEntry || 'N/A',
        yearOfGraduation: student.studentDetails?.estimatedYearOfGraduation || 'N/A'
      }
    };
  }, [student]);

  const [currentSemester, setCurrentSemester] = useState('');
  const [isCurriculumModalOpen, setCurriculumModalOpen] = useState(false);

  // FIX: Memoize currentSubjects to satisfy the exhaustive-deps rule
  const currentSubjects = useMemo(() => studentDetails?.enrolledSubjects?.[currentSemester] || [], [studentDetails?.enrolledSubjects, currentSemester]);
   
  const { totalUnits, weightedAverage } = useMemo(() => {
    let totalUnits = 0;
    let totalWeight = 0;
    currentSubjects.forEach(sub => {
      const grade = parseFloat(sub.finalGrade);
      if (!isNaN(grade)) {
        totalUnits += sub.units;
        totalWeight += grade * sub.units;
      }
    });
    const weightedAverage = totalUnits > 0 ? (totalWeight / totalUnits).toFixed(4) : 'N/A';
    return { totalUnits, weightedAverage };
  }, [currentSubjects]);

  if (loading) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading student details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <Link to="/admin/all-students" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container-fluid text-center mt-5">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Student Not Found</h4>
          <p>The student with ID No. {idNo} could not be found.</p>
          <hr />
          <Link to="/admin/all-students" className="btn btn-primary">Back to Student List</Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'ready for pick-up':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  const getSubjectStatusBadge = (status) => {
    return status.toLowerCase() === 'taken' ? 'badge bg-primary' : 'badge bg-info';
  };

  // Extract student details for easier access
  const details = student.studentDetails || {};
  const user = student;

  return (
    <div className="student-detail-view container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-user-graduate text-primary me-2"></i>
                Student Information
              </h2>
              <p className="text-muted mb-0">Complete student profile and academic records</p>
            </div>
            <Link to="/admin/all-students" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left me-2"></i>Back to List
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Student Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-id-card me-2"></i>
                Student Profile
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="profile-pic-wrapper mb-3">
                <div className="profile-avatar">
                  <i className="fas fa-user-circle fa-4x text-white"></i>
                </div>
              </div>
              <h4 className="mb-1">{details.fullName || `${user.firstName} ${user.lastName}`}</h4>
              <p className="text-muted mb-2">Student No. {details.studentNumber || user.idNumber}</p>
              <p className="text-muted mb-3">{details.course?.name || user.course || 'Not registered'}</p>
              
              {/* Academic Status Badge */}
              <div className="mb-3">
                <span className={`badge ${details.academicStatus === 'Regular' ? 'bg-success' : 'bg-warning'} fs-6`}>
                  {details.academicStatus || 'Not registered'}
                </span>
              </div>

              {/* Quick Info */}
              <div className="row text-start">
                <div className="col-6">
                  <small className="text-muted">Gender</small>
                  <p className="mb-2">{details.gender || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Birth Date</small>
                  <p className="mb-2">{details.dateOfBirth ? new Date(details.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Contact</small>
                  <p className="mb-2">{details.contactNumber || user.phoneNumber || 'N/A'}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Email</small>
                  <p className="mb-0">{details.email || user.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-8">
          {/* Personal Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Personal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Personal Data</h6>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Full Name:</strong></div>
                    <div className="col-8">{details.fullName || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Gender:</strong></div>
                    <div className="col-8">{details.gender || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Marital Status:</strong></div>
                    <div className="col-8">{details.maritalStatus || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Birth Date:</strong></div>
                    <div className="col-8">{details.dateOfBirth ? new Date(details.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Place of Birth:</strong></div>
                    <div className="col-8">{details.placeOfBirth || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Religion:</strong></div>
                    <div className="col-8">{details.religion || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Citizenship:</strong></div>
                    <div className="col-8">{details.citizenship || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Country:</strong></div>
                    <div className="col-8">{details.country || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Contact Information</h6>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Email:</strong></div>
                    <div className="col-8">{details.email || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Contact:</strong></div>
                    <div className="col-8">{details.contactNumber || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>City Address:</strong></div>
                    <div className="col-8">{details.cityAddress || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Provincial Address:</strong></div>
                    <div className="col-8">{details.provincialAddress || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Background */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Family Background
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Father's Information</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Name:</strong></div>
                    <div className="col-7">{details.fatherName || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Occupation:</strong></div>
                    <div className="col-7">{details.fatherOccupation || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Company:</strong></div>
                    <div className="col-7">{details.fatherCompany || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Contact:</strong></div>
                    <div className="col-7">{details.fatherContactNumber || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Income:</strong></div>
                    <div className="col-7">{details.fatherIncome || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Mother's Information</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Name:</strong></div>
                    <div className="col-7">{details.motherName || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Occupation:</strong></div>
                    <div className="col-7">{details.motherOccupation || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Company:</strong></div>
                    <div className="col-7">{details.motherCompany || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Contact:</strong></div>
                    <div className="col-7">{details.motherContactNumber || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Income:</strong></div>
                    <div className="col-7">{details.motherIncome || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Guardian's Information</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Name:</strong></div>
                    <div className="col-7">{details.guardianName || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Occupation:</strong></div>
                    <div className="col-7">{details.guardianOccupation || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Company:</strong></div>
                    <div className="col-7">{details.guardianCompany || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Contact:</strong></div>
                    <div className="col-7">{details.guardianContactNumber || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Income:</strong></div>
                    <div className="col-7">{details.guardianIncome || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-graduation-cap me-2"></i>
                Academic Background
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success mb-3">Current Academic Information</h6>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Course:</strong></div>
                    <div className="col-8">{details.course?.name || 'Not selected'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Major:</strong></div>
                    <div className="col-8">{details.major || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Student Type:</strong></div>
                    <div className="col-8">{details.studentType || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Semester Entry:</strong></div>
                    <div className="col-8">{details.semesterEntry || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Year of Entry:</strong></div>
                    <div className="col-8">{details.yearOfEntry || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Application Type:</strong></div>
                    <div className="col-8">{details.applicationType || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-success mb-3">Academic Status</h6>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Status:</strong></div>
                    <div className="col-8">
                      <span className={`badge ${details.academicStatus === 'Regular' ? 'bg-success' : 'bg-warning'}`}>
                        {details.academicStatus || 'Not registered'}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Current Semester:</strong></div>
                    <div className="col-8">{details.currentSemester ? `${details.currentSemester}${getOrdinalSuffix(details.currentSemester)} Semester` : 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Year Level:</strong></div>
                    <div className="col-8">{details.currentYearLevel || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>Units Earned:</strong></div>
                    <div className="col-8">{details.totalUnitsEarned || '0'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4"><strong>GPA:</strong></div>
                    <div className="col-8">{details.cumulativeGPA || '0.00'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic History */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Academic History
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Elementary Education</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>School:</strong></div>
                    <div className="col-7">{details.elementarySchool || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Address:</strong></div>
                    <div className="col-7">{details.elementaryAddress || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Year Graduated:</strong></div>
                    <div className="col-7">{details.elementaryYearGraduated || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Honor:</strong></div>
                    <div className="col-7">{details.elementaryHonor || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Junior High School</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>School:</strong></div>
                    <div className="col-7">{details.juniorHighSchool || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Address:</strong></div>
                    <div className="col-7">{details.juniorHighAddress || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Year Graduated:</strong></div>
                    <div className="col-7">{details.juniorHighYearGraduated || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Honor:</strong></div>
                    <div className="col-7">{details.juniorHighHonor || 'N/A'}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Senior High School</h6>
                  <div className="row mb-2">
                    <div className="col-5"><strong>School:</strong></div>
                    <div className="col-7">{details.seniorHighSchool || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Address:</strong></div>
                    <div className="col-7">{details.seniorHighAddress || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Strand:</strong></div>
                    <div className="col-7">{details.seniorHighStrand || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Year Graduated:</strong></div>
                    <div className="col-7">{details.seniorHighYearGraduated || 'N/A'}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-5"><strong>Honor:</strong></div>
                    <div className="col-7">{details.seniorHighHonor || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Academic Information */}
          {(details.ncaeGrade || details.specialization || details.lastCollegeAttended) && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Additional Academic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <h6 className="text-dark mb-3">NCAE & Specialization</h6>
                    <div className="row mb-2">
                      <div className="col-5"><strong>NCAE Grade:</strong></div>
                      <div className="col-7">{details.ncaeGrade || 'N/A'}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-5"><strong>Specialization:</strong></div>
                      <div className="col-7">{details.specialization || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <h6 className="text-dark mb-3">Previous College (if any)</h6>
                    <div className="row mb-2">
                      <div className="col-3"><strong>College:</strong></div>
                      <div className="col-9">{details.lastCollegeAttended || 'N/A'}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-3"><strong>Year Taken:</strong></div>
                      <div className="col-9">{details.lastCollegeYearTaken || 'N/A'}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-3"><strong>Course:</strong></div>
                      <div className="col-9">{details.lastCollegeCourse || 'N/A'}</div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-3"><strong>Major:</strong></div>
                      <div className="col-9">{details.lastCollegeMajor || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum Modal */}
      {isCurriculumModalOpen && (
        <CurriculumTrackModal
          studentName={student.name}
          curriculum={studentDetails.curriculum}
          takenSubjects={studentDetails.allTakenSubjects}
          onClose={() => setCurriculumModalOpen(false)}
        />
      )}
    </div>
  );
}

export default StudentDetailView;