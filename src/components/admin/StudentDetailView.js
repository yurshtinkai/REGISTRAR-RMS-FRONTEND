import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDummyCurriculum } from '../../data/dummyData';
import BsitProspectusModal from './BsitProspectusModal';
import './StudentDetailView.css';
import NewRequestModal from './NewRequestModal';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import { getStudentAvatar } from '../../utils/avatarUtils';
import GradeSlipContent from './GradeSlipContent'; // Make sure this file exists and is exported

function StudentDetailView({ enrolledStudents }) {
  const { idNo } = useParams();
  const [student, setStudent] = useState(null);
  const [studentRegistration, setStudentRegistration] = useState(null);
  const [enrolledSubjects, setEnrolledSubjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [photoUploadModalOpen, setPhotoUploadModalOpen] = useState(false);
  const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const [requestToPrint, setRequestToPrint] = useState(null);
  const componentRef = useRef();

  const [balance, setBalance] = useState(0);
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);
  
  // Requirements state
  const [requirements, setRequirements] = useState({
    psa: false,
    validId: false,
    form137: false,
    idPicture: false
  });
  const [requirementsModalOpen, setRequirementsModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch student details from backend
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const enrolledStudent = enrolledStudents.find(s => s.idNumber === idNo);
        
        if (!enrolledStudent) {
          setError('Student not found');
          setLoading(false);
          return;
        }

        // Use the data we already have from enrolledStudents
        console.log('🔍 Frontend - Setting student from enrolledStudents:', enrolledStudent);
        console.log('🔍 Frontend - enrolledStudent.id:', enrolledStudent.id);
        console.log('🔍 Frontend - enrolledStudent.idNumber:', enrolledStudent.idNumber);
        setStudent(enrolledStudent);

        // Fetch user data with profile photo if not already present
        if (!enrolledStudent.profilePhoto) {
          try {
            const userResponse = await fetch(`${API_BASE_URL}/students/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.profilePhoto) {
                setStudent(prev => ({
                  ...prev,
                  profilePhoto: userData.profilePhoto
                }));
              }
            }
          } catch (error) {
            console.error("Error fetching user photo:", error);
          }
        }

        // --- START: Fetch student registration data for personal details ---
        try {
          console.log('🔍 Fetching registration data for student ID:', enrolledStudent.id);
          console.log('🔗 API URL:', `${API_BASE_URL}/students/registration/${enrolledStudent.id}`);
          console.log('🔑 Session Token:', getSessionToken() ? 'EXISTS' : 'MISSING');
          
          const registrationResponse = await fetch(`${API_BASE_URL}/students/registration/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          
          console.log('📡 Registration Response Status:', registrationResponse.status);
          console.log('📡 Registration Response OK:', registrationResponse.ok);
          
          if (registrationResponse.ok) {
              const registrationData = await registrationResponse.json();
              console.log('📋 Registration Data Received:', registrationData);
              setStudentRegistration(registrationData);
          } else {
              const errorText = await registrationResponse.text();
              console.error("Failed to fetch student registration data. Status:", registrationResponse.status);
              console.error("Error response:", errorText);
          }
        } catch (error) {
          console.error("Error fetching student registration:", error);
        }
        // --- END: Fetch registration data ---

        // --- START: Fetch enrolled subjects for this student ---
        try {
          console.log('📚 Fetching enrolled subjects for student ID:', enrolledStudent.id);
          const subjectsResponse = await fetch(`${API_BASE_URL}/students/enrolled-subjects/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          
          if (subjectsResponse.ok) {
              const subjectsData = await subjectsResponse.json();
              console.log('📋 Enrolled Subjects Data:', subjectsData);
              // Set the entire subjects data (includes yearLevel, semester, totalUnits, subjects array)
              setEnrolledSubjects(subjectsData);
          } else {
              console.error("Failed to fetch enrolled subjects. Status:", subjectsResponse.status);
          }
        } catch (error) {
          console.error("Error fetching enrolled subjects:", error);
        }
        // --- END: Fetch enrolled subjects ---

        // --- START: Fetch the document requests for this student ---
        try {
          const requestsResponse = await fetch(`${API_BASE_URL}/requests/student/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          if (requestsResponse.ok) {
              const requestsData = await requestsResponse.json();
              setDocumentRequests(requestsData);
          } else {
              console.error("Failed to fetch student's document requests.");
          }
        } catch (error) {
          console.error("Error fetching document requests:", error);
        }
        // --- END: Fetch requests ---

        // --- START: Fetch announcement history for this student ---
        try {
          setLoadingHistory(true);
          const historyResponse = await fetch(`${API_BASE_URL}/notifications/student/${enrolledStudent.id}`, {
              headers: { 'X-Session-Token': getSessionToken() }
          });
          if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              // Filter for requirements announcements only
              const requirementsAnnouncements = historyData.filter(notif => 
                notif.type === 'requirements_reminder'
              );
              setAnnouncementHistory(requirementsAnnouncements);
          } else {
              console.error("Failed to fetch announcement history.");
          }
        } catch (error) {
          console.error("Error fetching announcement history:", error);
        } finally {
          setLoadingHistory(false);
        }

        if (enrolledStudent) {
          try {
            const balanceResponse = await fetch(`${API_BASE_URL}/accounting/${enrolledStudent.id}/balance`, {
                headers: { 'X-Session-Token': getSessionToken() }
            });
            if (balanceResponse.ok) {
                const balanceData = await balanceResponse.json();
                setBalance(balanceData.tuitionBalance);
                setNewBalance(balanceData.tuitionBalance.toString()); // Pre-fill modal input
            }
          } catch (err) {
            console.error("Could not fetch student balance:", err);
          }
        }
        // --- END: Fetch announcement history ---
      } catch (error) {
        console.error('Error fetching student details:', error);
        setError('Error fetching student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [idNo, enrolledStudents]);

  // Debug: Monitor student state changes
  useEffect(() => {
    console.log('🔍 Student state changed:', student);
    console.log('🔍 Student profilePhoto:', student?.profilePhoto);
  }, [student]);

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

  // Requirements summary calculations
  const submittedCount = Object.values(requirements).filter(Boolean).length;
  const pendingCount = Object.values(requirements).filter(Boolean => !Boolean).length;

  const studentDetails = useMemo(() => {
    if (!student) return null;
    
    return {
      documentRequests: [],
      enrolledSubjects: {},
      allTakenSubjects: [],
      curriculum: getDummyCurriculum(student.course || 'Bachelor of Science in Information Technology'),
      academicInfo: {
        status: studentRegistration?.registrationStatus || student.registrationStatus || 'Not registered',
        semester: studentRegistration?.semester || `${student.currentSemester || 1}${getOrdinalSuffix(student.currentSemester || 1)} Semester`,
        yearOfEntry: student.createdAt || 'N/A',
        yearOfGraduation: 'N/A'
      }
    };
  }, [student, studentRegistration]);

  const [currentSemester, setCurrentSemester] = useState('');
  const [isCurriculumModalOpen, setCurriculumModalOpen] = useState(false);

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

  const handleUpdateBalance = async () => {
    if (!student || newBalance === '') return;
    setUpdatingBalance(true);
    try {
      const response = await fetch(`${API_BASE_URL}/accounting/${student.id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken(),
        },
        body: JSON.stringify({ newBalance: parseFloat(newBalance) })
      });

      if (response.ok) {
        const result = await response.json();
        setBalance(result.updatedBalance);
        alert('Balance updated successfully!');
        setBalanceModalOpen(false);
      } else {
        const error = await response.json();
        alert(`Failed to update balance: ${error.message}`);
      }
    } catch (err) {
      alert('An error occurred while updating the balance.');
      console.error(err);
    } finally {
      setUpdatingBalance(false);
    }
  };

  // Photo upload functions
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    try {
      setUploadingPhoto(true);
      
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      const response = await fetch(`${API_BASE_URL}/photos/upload/${student.id}`, {
        method: 'POST',
        headers: { 'X-Session-Token': getSessionToken() },
        body: formData
      });

             if (response.ok) {
         const result = await response.json();
         
         console.log('📸 Photo upload successful:', result);
         console.log('📸 New photo URL:', result.photoUrl);
         
                   // Update the user object with new photo URL
          setStudent(prev => {
            const updated = {
              ...prev,
              profilePhoto: result.photoUrl
            };
            console.log('📸 Updated student object:', updated);
            console.log('📸 New profilePhoto value:', updated.profilePhoto);
            return updated;
          });
         
         // Also update the enrolledStudents array in the parent component
         // This ensures the photo persists when navigating back to the list
         if (window.updateEnrolledStudents) {
           window.updateEnrolledStudents(prev => 
             prev.map(s => 
               s.id === student.id 
                 ? { ...s, profilePhoto: result.photoUrl }
                 : s
             )
           );
         }
         
         // Close modal and reset states
         setPhotoUploadModalOpen(false);
         setSelectedPhoto(null);
         setPhotoPreview(null);
         
         // Show success message
         alert('Photo uploaded successfully!');
       } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!student.profilePhoto) return;

    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/photos/${student.id}`, {
          method: 'DELETE',
          headers: { 'X-Session-Token': getSessionToken() }
        });

        if (response.ok) {
          // Update the user object to remove photo
          setStudent(prev => ({
            ...prev,
            profilePhoto: null
          }));
          
          alert('Photo deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Delete failed: ${error.message}`);
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Delete failed. Please try again.');
      }
    }
  };

  // Function to handle photo preview
  const handlePhotoPreview = () => {
    if (student.profilePhoto) {
      setPhotoPreviewModalOpen(true);
    }
  };

  // Requirements handling functions
  const handleRequirementToggle = (requirementType) => {
    setRequirements(prev => ({
      ...prev,
      [requirementType]: !prev[requirementType]
    }));
  };

  const handleDocumentUpload = async (requirementType, file) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('requirementType', requirementType);
      formData.append('studentId', student.id);

      const response = await fetch(`${API_BASE_URL}/requirements/upload`, {
        method: 'POST',
        headers: { 'X-Session-Token': getSessionToken() },
        body: formData
      });

      if (response.ok) {
        // Update requirements state
        handleRequirementToggle(requirementType);
        alert(`${requirementType.toUpperCase()} document uploaded successfully!`);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const refreshAnnouncementHistory = async () => {
    if (!student?.id) return;
    
    try {
      setLoadingHistory(true);
      const historyResponse = await fetch(`${API_BASE_URL}/notifications/student/${student.id}`, {
          headers: { 'X-Session-Token': getSessionToken() }
      });
      if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const requirementsAnnouncements = historyData.filter(notif => 
            notif.type === 'requirements_reminder'
          );
          setAnnouncementHistory(requirementsAnnouncements);
      }
    } catch (error) {
      console.error("Error refreshing announcement history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) {
      alert('Please enter an announcement message.');
      return;
    }

    console.log('🔍 Frontend - About to send announcement');
    console.log('🔍 Frontend - Student object:', student);
    console.log('🔍 Frontend - Student ID being sent:', student.id);
    console.log('🔍 Frontend - Announcement text:', announcementText);

    try {
      setSendingAnnouncement(true);
      const response = await fetch(`${API_BASE_URL}/requirements/announcement`, {
        method: 'POST',
        headers: { 
          'X-Session-Token': getSessionToken(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: student.id,
          message: announcementText,
          type: 'requirements_reminder'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Frontend - Announcement sent successfully:', result);
        alert('Announcement sent successfully to the student!');
        setAnnouncementText('');
        setAnnouncementModalOpen(false);
        
        // Refresh announcement history
        await refreshAnnouncementHistory();
      } else {
        const error = await response.json();
        console.log('❌ Frontend - Failed to send announcement:', error);
        alert(`Failed to send announcement: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      alert('Failed to send announcement. Please try again.');
    } finally {
      setSendingAnnouncement(false);
    }
  };
  

  
  const handlePrintRequest = (request) => {
    // FIX: Check if student data exists before attempting to print.
    // This prevents the action from failing if the main data hasn't loaded yet.
    if (!student) {
      alert('Student details are still loading. Please wait a moment and try again.');
      return;
    }

    if (request.documentType === 'Final Grade') {
      setRequestToPrint(request);
    } else {
      alert(`Printing for "${request.documentType}" is not yet implemented.`);
    }
  };

  const handleConfirmRequest = async (requestData) => {
    // Create a new request object with default values
    const newRequest = {
      id: Date.now(), // Temporary ID for frontend
      documentType: requestData.documentType,
      schoolYear: requestData.schoolYear,
      semester: requestData.semester,
      amount: requestData.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Optimistically add to table
    setDocumentRequests(prev => [...prev, newRequest]);

    // Send to backend
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': getSessionToken(),
        },
        body: JSON.stringify({
          ...requestData,
          studentId: student.id,
        }),
      });
      if (response.ok) {
        const savedRequest = await response.json();
        // Replace the temporary request with the one from backend (if needed)
        setDocumentRequests(prev =>
          prev.map(r => r.id === newRequest.id ? savedRequest : r)
        );
        alert('Request submitted successfully!');
      } else {
        alert('Failed to submit request.');
      }
    } catch (error) {
      alert('Error submitting request.');
    }
  };

  // Extract student details for easier access
  const details = student || {};
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
            <Link to="/admin/all-students" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>Back to List
            </Link>
          </div>
        </div>
      </div>

      {(userRole === 'accounting') && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0"><i className="fas fa-money-bill-wave me-2"></i>Accounting Details</h5>
          </div>
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 className="card-title mb-1">Current Balance:</h6>
              <p className="card-text fs-4 fw-bold mb-0">₱ {parseFloat(balance).toFixed(2)}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setBalanceModalOpen(true)}>
              <i className="fas fa-edit me-2"></i>Update Balance
            </button>
          </div>
        </div>
      )}

      {isBalanceModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Student Balance</h5>
                  <button type="button" className="btn-close" onClick={() => setBalanceModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Enter the new outstanding balance for {student.firstName} {student.lastName}.</p>
                  <div className="mb-3">
                    <label htmlFor="newBalanceAmount" className="form-label">New Balance Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      id="newBalanceAmount"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setBalanceModalOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleUpdateBalance}
                    disabled={updatingBalance}
                  >
                    {updatingBalance ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {(userRole === 'admin') && (
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
                                   <div 
                    className="profile-avatar clickable-photo"
                    title="Click photo to view, click camera to upload"
                  >
                                       {(() => {
                                         const avatar = getStudentAvatar(student);
                                         if (avatar.isFallback) {
                                           return (
                                             <div 
                                               className="fallback-avatar"
                                               style={{
                                                 width: '150px',
                                                 height: '150px',
                                                 borderRadius: '50%',
                                                 backgroundColor: avatar.color || '#6c757d',
                                                 display: 'flex',
                                                 alignItems: 'center',
                                                 justifyContent: 'center',
                                                 color: 'white',
                                                 fontSize: '48px',
                                                 fontWeight: 'bold',
                                                 cursor: 'pointer'
                                               }}
                                               onClick={handlePhotoPreview}
                                               title="Click to view avatar in full screen"
                                             >
                                               {avatar.initials}
                                             </div>
                                           );
                                         }
                                         return (
                                           <img 
                                             src={avatar.src} 
                                             alt="Student Photo" 
                                             className="profile-photo"
                                             onClick={handlePhotoPreview}
                                             title="Click to view photo in full screen"
                                             onError={(e) => {
                                               console.log('❌ Photo failed to load:', e.target.src);
                                               // If photo fails to load, show fallback avatar
                                               e.target.style.display = 'none';
                                               const fallbackAvatar = document.createElement('div');
                                               fallbackAvatar.className = 'fallback-avatar';
                                               fallbackAvatar.style.cssText = `
                                                 width: 150px;
                                                 height: 150px;
                                                 border-radius: 50%;
                                                 background-color: ${avatar.color || '#6c757d'};
                                                 display: flex;
                                                 align-items: center;
                                                 justify-content: center;
                                                 color: white;
                                                 font-size: 48px;
                                                 font-weight: bold;
                                                 cursor: pointer;
                                               `;
                                               fallbackAvatar.textContent = avatar.initials;
                                               fallbackAvatar.onclick = handlePhotoPreview;
                                               e.target.parentNode.appendChild(fallbackAvatar);
                                             }}
                                           />
                                         );
                                       })()}
                    <div 
                      className="photo-upload-overlay"
                      onClick={() => setPhotoUploadModalOpen(true)}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      title="Click to upload/change photo"
                    >
                      <i className="fas fa-camera fa-2x"></i>
                      <span>Upload Photo</span>
                    </div>
                 </div>
               </div>
              <h4 className="mb-1">{`${user.lastName}, ${user.firstName} ${user.middleName || ''}`.trim()}</h4>
              <p className="text-muted mb-2">Student No. {user.idNumber}</p>
              <p className="text-muted mb-3">{user.course || 'Bachelor of Science in Information Technology'}</p>
              
              {/* Academic Status Badge */}
              <div className="mb-3">
                <span className={`badge ${(studentRegistration?.registrationStatus || user.registrationStatus) === 'Approved' ? 'bg-success' : 'bg-warning'} fs-6`}>
                    {(studentRegistration?.registrationStatus || user.registrationStatus) === 'Approved' ? 'Enrolled' : (studentRegistration?.registrationStatus || user.registrationStatus || 'Not registered')}
                </span>
              </div>

              {/* Quick Info */}
              <div className="row text-start">
                <div className="col-6">
                  <small className="text-muted">Gender</small>
                  <p className="mb-2">{studentRegistration?.gender || user.gender || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Registration Date</small>
                  <p className="mb-2">{studentRegistration?.createdAt ? new Date(studentRegistration.createdAt).toISOString().split('T')[0] : 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Year Level</small>
                  <p className="mb-2">{studentRegistration?.yearLevel || user.currentYearLevel || 'N/A'}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Semester</small>
                  <p className="mb-2">{studentRegistration?.semester || user.currentSemester || 'N/A'}</p>
                </div>
                <div className="col-12">
                  <small className="text-muted">Email</small>
                  <p className="mb-0">{studentRegistration?.email || user.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">

          <div className="card shadow-sm mb-4">
    <div className="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">Document Requests</h5>
      <button className="btn btn-sm btn-outline-primary" onClick={() => setIsRequestModalOpen(true)}>
                <i className="fas fa-plus me-1"></i> New Request
              </button>
    </div>
    <div className="card-body">
      <div className="table-responsive">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
                      {documentRequests.length > 0 ? (
                        documentRequests.map((req) => (
                          <tr key={req.id}>
                              <td>
                                  <div>{req.documentType}</div>
                                  {req.schoolYear && <small className="text-muted">{req.schoolYear} / {req.semester}</small>}
                              </td>
                              <td><span className={`badge ${getStatusBadge(req.status)}`}>
                                  {req.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td>₱ (req.amount || 0).toFixed(2)</td>
                              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                              <td>
                                {/* --- START: NEW ACTIONS DROPDOWN --- */}
                                <div className="dropdown">
                                    <button className="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="fas fa-ellipsis-h"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <button className="dropdown-item" onClick={() => handlePrintRequest(req)}>
                                                <i className="fas fa-print fa-fw me-2"></i>Print
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" onClick={() => alert('Marking as complete!')}>
                                                <i className="fas fa-check fa-fw me-2"></i>Mark as Complete
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={() => alert('Cancelling request!')}>
                                                <i className="fas fa-times fa-fw me-2"></i>Cancel Request
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                              </td>
                          </tr>
                        ))
                        ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No document requests found.</td>
                        </tr>
                        )}
                  </tbody>
        </table>
      </div>
    </div>
  </div>

  {/* ENROLLMENT REQUIREMENTS Section */}
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 className="mb-0">
        <i className="fas fa-clipboard-check me-2"></i>
        ENROLLMENT REQUIREMENTS
      </h5>
      <button className="btn btn-sm btn-light" onClick={() => setRequirementsModalOpen(true)}>
        <i className="fas fa-plus me-1"></i>
        Manage Requirements
      </button>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-md-8">
          <h6 className="text-primary mb-3">Required Documents</h6>
          <div className="requirements-grid">
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-id-card text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>PSA Birth Certificate</strong>
                <small className="text-muted d-block">Philippine Statistics Authority</small>
                <span className={`badge ${requirements.psa ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.psa ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-credit-card text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>Valid ID</strong>
                <small className="text-muted d-block">Government-issued ID</small>
                <span className={`badge ${requirements.validId ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.validId ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-file-alt text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>Form 137</strong>
                <small className="text-muted d-block">High School Records</small>
                <span className={`badge ${requirements.form137 ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.form137 ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="requirement-item">
              <div className="requirement-icon">
                <i className="fas fa-image text-primary"></i>
              </div>
              <div className="requirement-details">
                <strong>2x2 ID Picture</strong>
                <small className="text-muted d-block">Recent photo</small>
                <span className={`badge ${requirements.idPicture ? 'bg-success' : 'bg-warning'}`}>
                  {requirements.idPicture ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <h6 className="text-primary mb-3">Requirements Status</h6>
          <div className="requirements-summary">
            <div className="summary-item">
              <span className="summary-label">Submitted:</span>
              <span className="summary-value text-success">{submittedCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pending:</span>
              <span className="summary-value text-warning">{pendingCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total:</span>
              <span className="summary-value text-primary">4</span>
            </div>
          </div>
          
          <div className="mt-3">
            <button 
              className="btn btn-warning btn-sm w-100 mb-2"
              onClick={() => setAnnouncementModalOpen(true)}
            >
              <i className="fas fa-bell me-1"></i>
              Send Announcement
            </button>
            <button 
              className="btn btn-info btn-sm w-100"
              onClick={() => setRequirementsModalOpen(true)}
            >
              <i className="fas fa-upload me-1"></i>
              Upload Documents
            </button>
          </div>

          {/* Message Tracker */}
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-primary mb-0">Message Tracker</h6>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={refreshAnnouncementHistory}
                disabled={loadingHistory}
                title="Refresh message history"
              >
                <i className={`fas ${loadingHistory ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              </button>
            </div>
            {loadingHistory ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : announcementHistory.length > 0 ? (
              <div className="message-history">
                {announcementHistory.map((announcement, index) => (
                  <div key={announcement.id || index} className="message-item">
                    <div className="message-header">
                      <i className="fas fa-bell text-warning me-2"></i>
                      <small className="text-muted">
                        {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </small>
                    </div>
                    <div className="message-content">
                      <small className="text-dark">{announcement.message}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted">
                <small>No announcements sent yet</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enrolled Subjects</h5>
                <div className="d-flex align-items-center">
                                         <select 
                         className="form-select form-select-sm me-2" 
                         style={{width: '200px'}}
                         value={currentSemester}
                         onChange={(e) => setCurrentSemester(e.target.value)}
                     >
                         <option value="">Select Semester</option>
                         {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 ? (
                             <option value="current">{enrolledSubjects.yearLevel} Year - {enrolledSubjects.semester} Semester</option>
                         ) : (
                             <option value="no-subjects">No subjects available</option>
                         )}
                     </select>
                                         <button onClick={() => setCurriculumModalOpen(true)} className="btn btn-sm btn-info">View BSIT Prospectus</button>
                </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                                     <thead>
                     <tr>
                       <th>Course Code & Title</th>
                       <th className="text-center">Units</th>
                       <th className="text-center">Final Grade</th>
                       <th className="text-center">Status</th>
                       <th>Action</th>
                     </tr>
                   </thead>
                  <tbody>
                                         {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 ? (
                       enrolledSubjects.subjects.map((subject, index) => (
                         <tr key={subject.id}>
                           <td>
                             <div>
                               <strong>{subject.courseCode}</strong>
                               <br />
                               <small className="text-muted">{subject.courseTitle}</small>
                             </div>
                           </td>
                           <td className="text-center">{subject.units}</td>
                           <td className="text-center">{subject.finalGrade}</td>
                           <td className="text-center">
                             <span className={`badge ${subject.isEnrolled ? 'bg-success' : 'bg-secondary'}`}>
                               {subject.status}
                             </span>
                           </td>
                           <td>
                                                           <button className="btn btn-sm btn-warning" title="View Course Details">
                                <i className="fas fa-info-circle"></i>
                              </button>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan="5" className="text-center text-muted">
                           {enrolledSubjects ? 'No subjects available for current semester' : 'Loading subjects...'}
                         </td>
                       </tr>
                     )}
                  </tbody>
                                     {enrolledSubjects && enrolledSubjects.subjects && enrolledSubjects.subjects.length > 0 && (
                     <tfoot>
                       <tr className="table-light">
                         <td colSpan="2" className="text-end fw-bold">
                           Total Units: <span className="fw-normal">{enrolledSubjects.totalUnits}</span>
                         </td>
                         <td colSpan="3" className="text-end fw-bold">
                           Semester: <span className="fw-normal">{enrolledSubjects.yearLevel} Year - {enrolledSubjects.semester} Semester</span>
                         </td>
                       </tr>
                     </tfoot>
                   )}
                </table>
              </div>
            </div>
          </div>

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
                     <div className="col-8">{studentRegistration ? `${studentRegistration.firstName} ${studentRegistration.middleName || ''} ${studentRegistration.lastName}`.trim() : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Gender:</strong></div>
                     <div className="col-8">{studentRegistration?.gender || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Marital Status:</strong></div>
                     <div className="col-8">{studentRegistration?.maritalStatus || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Birth Date:</strong></div>
                     <div className="col-8">{studentRegistration?.dateOfBirth ? new Date(studentRegistration.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Place of Birth:</strong></div>
                     <div className="col-8">{studentRegistration?.placeOfBirth || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Religion:</strong></div>
                     <div className="col-8">{studentRegistration?.religion || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Citizenship:</strong></div>
                     <div className="col-8">{studentRegistration?.nationality || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Country:</strong></div>
                     <div className="col-8">{studentRegistration?.country || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Contact Information</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Email:</strong></div>
                     <div className="col-8">{studentRegistration?.email || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Contact:</strong></div>
                     <div className="col-8">{studentRegistration?.contactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>City Address:</strong></div>
                     <div className="col-8">{studentRegistration?.cityAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Provincial Address:</strong></div>
                     <div className="col-8">{studentRegistration?.provincialAddress || 'N/A'}</div>
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
                     <div className="col-7">{studentRegistration?.fatherName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.fatherIncome || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Mother's Information</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>Name:</strong></div>
                     <div className="col-7">{studentRegistration?.motherName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.motherOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.motherCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.motherContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.motherIncome || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-warning mb-3">Guardian's Information</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>Name:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianName || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Occupation:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianOccupation || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Company:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianCompany || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Contact:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianContactNumber || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Income:</strong></div>
                     <div className="col-7">{studentRegistration?.guardianIncome || 'N/A'}</div>
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
                     <div className="col-8">{studentRegistration?.course || 'Bachelor of Science in Information Technology'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Major:</strong></div>
                     <div className="col-8">{studentRegistration?.major || 'Information Technology'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Student Type:</strong></div>
                     <div className="col-8">{studentRegistration?.studentType || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Semester Entry:</strong></div>
                     <div className="col-8">{studentRegistration?.semesterEntry || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Year of Entry:</strong></div>
                     <div className="col-8">{studentRegistration?.yearOfEntry || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Application Type:</strong></div>
                     <div className="col-8">{studentRegistration?.applicationType || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-6">
                  <h6 className="text-success mb-3">Academic Status</h6>
                                     <div className="row mb-2">
                     <div className="col-4"><strong>Status:</strong></div>
                     <div className="col-8">
                       <span className={`badge ${studentRegistration?.registrationStatus === 'Approved' ? 'bg-success' : 'bg-warning'}`}>
                         {studentRegistration?.registrationStatus === 'Approved' ? 'Enrolled' : (studentRegistration?.registrationStatus || 'Not registered')}
                       </span>
                     </div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Current Semester:</strong></div>
                     <div className="col-8">{studentRegistration?.semester ? `${studentRegistration.semester}${getOrdinalSuffix(studentRegistration.semester)} Semester` : 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Year Level:</strong></div>
                     <div className="col-8">{studentRegistration?.yearLevel || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>School Year:</strong></div>
                     <div className="col-8">{studentRegistration?.schoolYear || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-4"><strong>Registration Date:</strong></div>
                     <div className="col-8">{studentRegistration?.createdAt ? new Date(studentRegistration.createdAt).toLocaleDateString() : 'N/A'}</div>
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
                     <div className="col-7">{studentRegistration?.elementarySchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.elementaryHonor || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Junior High School</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>School:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighSchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.juniorHighHonor || 'N/A'}</div>
                   </div>
                </div>
                <div className="col-md-4">
                  <h6 className="text-secondary mb-3">Senior High School</h6>
                                     <div className="row mb-2">
                     <div className="col-5"><strong>School:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighSchool || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Address:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighAddress || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Strand:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighStrand || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Year Graduated:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighYearGraduated || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Honor:</strong></div>
                     <div className="col-7">{studentRegistration?.seniorHighHonor || 'N/A'}</div>
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
                     <div className="col-7">{studentRegistration?.ncaeGrade || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-5"><strong>Specialization:</strong></div>
                     <div className="col-7">{studentRegistration?.specialization || 'N/A'}</div>
                   </div>
                  </div>
                  <div className="col-md-8">
                    <h6 className="text-dark mb-3">Previous College (if any)</h6>
                                       <div className="row mb-2">
                     <div className="col-3"><strong>College:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeAttended || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Year Taken:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeYearTaken || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Course:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeCourse || 'N/A'}</div>
                   </div>
                   <div className="row mb-2">
                     <div className="col-3"><strong>Major:</strong></div>
                     <div className="col-9">{studentRegistration?.lastCollegeMajor || 'N/A'}</div>
                   </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

             {/* BSIT Prospectus Modal */}
       {isCurriculumModalOpen && (
         <BsitProspectusModal
           isOpen={isCurriculumModalOpen}
           onClose={() => setCurriculumModalOpen(false)}
           studentName={`${student.firstName} ${student.lastName}`}
         />
       )}

       {/* Photo Upload Modal */}
       {photoUploadModalOpen && (
         <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
           <div className="modal-dialog modal-dialog-centered">
             <div className="modal-content">
               <div className="modal-header">
                 <h5 className="modal-title">
                   <i className="fas fa-camera me-2"></i>
                   Upload Student Photo
                 </h5>
                 <button 
                   type="button" 
                   className="btn-close" 
                   onClick={() => setPhotoUploadModalOpen(false)}
                 ></button>
               </div>
               <div className="modal-body">
                 <div className="text-center mb-3">
                   <label htmlFor="photoInput" className="btn btn-outline-primary btn-lg">
                     <i className="fas fa-upload me-2"></i>
                     Choose Photo from Library
                   </label>
                   <input
                     id="photoInput"
                     type="file"
                     accept="image/*"
                     onChange={handlePhotoSelect}
                     style={{ display: 'none' }}
                   />
                 </div>
                 
                 {photoPreview && (
                   <div className="text-center">
                     <h6>Photo Preview:</h6>
                     <img 
                       src={photoPreview} 
                       alt="Preview" 
                       className="img-fluid rounded mb-3"
                       style={{ maxHeight: '200px' }}
                     />
                   </div>
                 )}

                                   {(() => {
                                     const avatar = getStudentAvatar(student);
                                     if (avatar.isFallback) {
                                       return (
                                         <div className="text-center mb-3">
                                           <h6>Current Avatar:</h6>
                                           <div 
                                             className="fallback-avatar mx-auto mb-2"
                                             style={{
                                               width: '150px',
                                               height: '150px',
                                               borderRadius: '50%',
                                               backgroundColor: avatar.color || '#6c757d',
                                               display: 'flex',
                                               alignItems: 'center',
                                               justifyContent: 'center',
                                               color: 'white',
                                               fontSize: '48px',
                                               fontWeight: 'bold'
                                             }}
                                           >
                                             {avatar.initials}
                                           </div>
                                           <small className="text-muted">No profile photo uploaded yet</small>
                                         </div>
                                       );
                                     }
                                     return (
                                       <div className="text-center mb-3">
                                         <h6>Current Photo:</h6>
                                         <img 
                                           src={avatar.src} 
                                           alt="Current" 
                                           className="img-fluid rounded mb-2"
                                           style={{ maxHeight: '150px' }}
                                         />
                                         <br />
                                         <button 
                                           className="btn btn-outline-danger btn-sm"
                                           onClick={handleDeletePhoto}
                                         >
                                           <i className="fas fa-trash me-1"></i>
                                           Delete Current Photo
                                         </button>
                                       </div>
                                     );
                                   })()}
               </div>
               <div className="modal-footer">
                 <button 
                   type="button" 
                   className="btn btn-secondary" 
                   onClick={() => setPhotoUploadModalOpen(false)}
                 >
                   Cancel
                 </button>
                 <button 
                   type="button" 
                   className="btn btn-primary" 
                   onClick={handlePhotoUpload}
                   disabled={!selectedPhoto || uploadingPhoto}
                 >
                   {uploadingPhoto ? (
                     <>
                       <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                       Uploading...
                     </>
                   ) : (
                     <>
                       <i className="fas fa-upload me-2"></i>
                       Upload Photo
                     </>
                   )}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

               {/* Modal Backdrop */}
        {photoUploadModalOpen && (
          <div className="modal-backdrop fade show"></div>
        )}

        {/* Photo Preview Modal */}
        {photoPreviewModalOpen && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="fas fa-image me-2"></i>
                    Student Photo
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setPhotoPreviewModalOpen(false)}
                  ></button>
                </div>
                                 <div className="modal-body text-center p-0">
                   {(() => {
                     const avatar = getStudentAvatar(student);
                     if (avatar.isFallback) {
                       return (
                         <div 
                           className="fallback-avatar mx-auto"
                           style={{
                             width: '300px',
                             height: '300px',
                             borderRadius: '50%',
                             backgroundColor: avatar.color || '#6c757d',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             color: 'white',
                             fontSize: '120px',
                             fontWeight: 'bold',
                             margin: '20px auto'
                           }}
                         >
                           {avatar.initials}
                         </div>
                       );
                     }
                     return (
                       <img 
                         src={avatar.src} 
                         alt="Student Photo" 
                         className="img-fluid"
                         style={{ 
                           maxHeight: '80vh', 
                           maxWidth: '100%',
                           objectFit: 'contain'
                         }}
                       />
                     );
                   })()}
                 </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setPhotoPreviewModalOpen(false)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => {
                      setPhotoPreviewModalOpen(false);
                      setPhotoUploadModalOpen(true);
                    }}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Modal Backdrop */}
        {photoPreviewModalOpen && (
          <div className="modal-backdrop fade show"></div>
        )}

        {/* Requirements Management Modal */}
        {requirementsModalOpen && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-clipboard-check me-2"></i>
                    Manage Enrollment Requirements
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setRequirementsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Upload Documents</h6>
                      <div className="mb-3">
                        <label className="form-label">PSA Birth Certificate</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload('psa', e.target.files[0]);
                            }
                          }}
                        />
                        <small className="text-muted">Accepted: PDF, JPG, PNG (Max 5MB)</small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Valid ID</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload('validId', e.target.files[0]);
                            }
                          }}
                        />
                        <small className="text-muted">Accepted: PDF, JPG, PNG (Max 5MB)</small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Form 137</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload('form137', e.target.files[0]);
                            }
                          }}
                        />
                        <small className="text-muted">Accepted: PDF, JPG, PNG (Max 5MB)</small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">2x2 ID Picture</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload('idPicture', e.target.files[0]);
                            }
                          }}
                        />
                        <small className="text-muted">Accepted: JPG, PNG (Max 5MB)</small>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Requirements Status</h6>
                      <div className="requirements-status">
                        <div className="requirement-status-item mb-2">
                          <span className="requirement-label">PSA Birth Certificate:</span>
                          <span className={`badge ${requirements.psa ? 'bg-success' : 'bg-warning'}`}>
                            {requirements.psa ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        <div className="requirement-status-item mb-2">
                          <span className="requirement-label">Valid ID:</span>
                          <span className={`badge ${requirements.validId ? 'bg-success' : 'bg-warning'}`}>
                            {requirements.validId ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        <div className="requirement-status-item mb-2">
                          <span className="requirement-label">Form 137:</span>
                          <span className={`badge ${requirements.form137 ? 'bg-success' : 'bg-warning'}`}>
                            {requirements.form137 ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        <div className="requirement-status-item mb-2">
                          <span className="requirement-label">2x2 ID Picture:</span>
                          <span className={`badge ${requirements.idPicture ? 'bg-success' : 'bg-warning'}`}>
                            {requirements.idPicture ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h6 className="text-warning">Quick Actions</h6>
                        <button 
                          className="btn btn-warning btn-sm w-100 mb-2"
                          onClick={() => {
                            setRequirementsModalOpen(false);
                            setAnnouncementModalOpen(true);
                          }}
                        >
                          <i className="fas fa-bell me-1"></i>
                          Send Reminder
                        </button>
                        <button 
                          className="btn btn-info btn-sm w-100"
                          onClick={() => {
                            // Mark all as submitted (for testing)
                            setRequirements({
                              psa: true,
                              validId: true,
                              form137: true,
                              idPicture: true
                            });
                          }}
                        >
                          <i className="fas fa-check me-1"></i>
                          Mark All Complete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setRequirementsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {announcementModalOpen && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="fas fa-bell me-2"></i>
                    Send Announcement to Student
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setAnnouncementModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`${student.firstName} ${student.lastName}`}
                      readOnly
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Announcement Message *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter your announcement message here..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                    ></textarea>
                    <small className="text-muted">
                      This message will be sent to the student about their enrollment requirements.
                    </small>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Tip:</strong> Be specific about which documents are missing and when they should be submitted.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setAnnouncementModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning" 
                    onClick={handleSendAnnouncement}
                    disabled={!announcementText.trim() || sendingAnnouncement}
                  >
                    {sendingAnnouncement ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Send Announcement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Backdrops */}
        {(requirementsModalOpen || announcementModalOpen) && (
          <div className="modal-backdrop fade show"></div>
        )}

        <NewRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onConfirm={handleConfirmRequest}
      />

       <div style={{ display: 'none' }}>
        <GradeSlipContent ref={componentRef} request={requestToPrint} student={student} />
      </div>
     </div>
   );
 }

export default StudentDetailView;