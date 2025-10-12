import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';


function Sidebar({ onProfileClick, setStudentToEnroll }) {
    const location = useLocation();
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [pendingRegistrarCount, setPendingRegistrarCount] = useState(0);
    const [pendingBalanceInquiriesCount, setPendingBalanceInquiriesCount] = useState(0);
    
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/admin/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/admin/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/admin/all-students') || location.pathname.startsWith('/admin/students/'));
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));
    const [isAssessmentOpen, setAssessmentOpen] = useState(location.pathname.startsWith('/admin/assessment'));
    
    const [profilePic, setProfilePic] = useState(() => {
        // Try to get profile pic from localStorage on initial load
        const cachedProfilePic = localStorage.getItem('adminProfilePic');
        return cachedProfilePic || null;
    });
    const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);
    const userRole = localStorage.getItem('userRole');
    console.log('🔍 Sidebar - User role from localStorage:', userRole);
    console.log('🔍 Sidebar - All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 Sidebar - Initial profilePic state:', profilePic);

    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    useEffect(() => {
        // TODO: Replace this with your actual API call to fetch school years
        const fetchSchoolYears = async () => {
            // This is dummy data that mimics an API response.
            const dummyData = [
                { id: 1, start_year: 2025, end_year: 2026, semester: '1st Semester' },
                { id: 2, start_year: 2025, end_year: 2026, semester: '2nd Semester' },
                { id: 3, start_year: 2025, end_year: 2026, semester: 'Summer' },
            ];
            setSchoolYears(dummyData);
            // Set the default selected value to the most recent one
            if (dummyData.length > 0) {
                setSelectedSchoolYear(dummyData[0].id);
            }
        };
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                // Validate and refresh session first
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    console.error('Session expired. Please login again.');
                    return;
                }
                
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/requests`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const data = await res.json();
                if (res.ok) {
                    // Count only online student-initiated requests that still need registrar action
                    // Keep counting through 'pending', 'payment_required', and 'payment_approved'.
                    // Decrease only after registrar approves (status becomes 'approved').
                    const pendingCount = data.filter(req => 
                        req.initiatedBy === 'student' && 
                        req.status !== 'approved' && 
                        req.status !== 'ready for pick-up'
                    ).length;
                    setPendingRequestCount(pendingCount);
                }
            } catch (err) {
                console.error('Failed to fetch pending requests:', err);
            }
        };

        const fetchPendingPayments = async () => {
            try {
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    console.error('Session expired. Please login again.');
                    return;
                }
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/payments/pending`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const json = await res.json();
                if (res.ok) {
                    const pending = Array.isArray(json?.data) ? json.data.length : 0;
                    setPendingRegistrarCount(pending);
                }
            } catch (err) {
                console.error('Failed to fetch pending payments:', err);
            }
        };

        const fetchBalanceInquiriesCount = async () => {
            try {
                const sessionValid = await sessionManager.validateAndRefreshSession();
                if (!sessionValid) {
                    console.error('Session expired. Please login again.');
                    return;
                }
                const sessionToken = sessionManager.getSessionToken();
                const res = await fetch(`${API_BASE_URL}/accounting/balance-inquiries`, {
                    headers: { 'X-Session-Token': sessionToken }
                });
                const json = await res.json();
                if (res.ok) {
                    const count = Array.isArray(json?.data) ? json.data.length : 0;
                    setPendingBalanceInquiriesCount(count);
                }
            } catch (err) {
                console.error('Failed to fetch balance inquiries count:', err);
            }
        };

        fetchPendingRequests();
        fetchPendingPayments();
        fetchBalanceInquiriesCount();
        const interval = setInterval(() => {
            fetchPendingRequests();
            fetchPendingPayments();
            fetchBalanceInquiriesCount();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        console.log('🔍 Sidebar - profilePic state changed to:', profilePic);
    }, [profilePic]);

    // Function to load profile photo (can be called multiple times)
    const loadAdminProfilePhoto = async (forceReload = false) => {
        console.log('🔍 Loading admin profile photo for userRole:', userRole);
        
        // Check if user role is admin or accounting (handle different formats)
        if (userRole !== 'admin' && userRole !== 'accounting') {
            console.log('🔍 User role is not admin or accounting, skipping profile photo load');
            return;
        }
        
        // Check if profile photo is already loaded to prevent unnecessary reloads
        if (profilePic && !forceReload) {
            console.log('🔍 Profile photo already loaded, skipping reload');
            return;
        }
        
        try {
            // Validate and refresh session first
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                console.error('Session expired. Please login again.');
                return;
            }
            
            const sessionToken = sessionManager.getSessionToken();
            const response = await fetch(`${API_BASE_URL}/admin-photos/profile`, {
                headers: { 'X-Session-Token': sessionToken }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('📸 Load profile response data:', data);
                
                if (data.profilePhoto) {
                    // Convert relative URL to full URL
                    const fullPhotoUrl = data.profilePhoto.startsWith('http') 
                        ? data.profilePhoto 
                        : `${API_BASE_URL}${data.profilePhoto}`;
                    
                    console.log('📸 Loaded profile photo URL:', fullPhotoUrl);
                    setProfilePic(fullPhotoUrl);
                    // Cache the profile photo URL in localStorage
                    localStorage.setItem('adminProfilePic', fullPhotoUrl);
                } else {
                    console.log('📸 No profile photo found in database');
                    setProfilePic(null);
                    // Clear cached profile photo
                    localStorage.removeItem('adminProfilePic');
                }
            } else {
                console.error('Failed to load admin profile photo, status:', response.status);
                setProfilePic(null);
            }
        } catch (error) {
            console.error('Error loading admin profile photo:', error);
            setProfilePic(null);
        }
    };

    // Single useEffect to load profile photo only once on mount
    useEffect(() => {
        loadAdminProfilePhoto();
    }, []); // Run only once on mount

    // Cleanup function to clear profile photo cache when component unmounts
    useEffect(() => {
        return () => {
            // Don't clear the cache on unmount, keep it for next session
            console.log('🔍 Sidebar unmounting, keeping profile photo cache');
        };
    }, []);

    // Debug: Log when userRole changes
    useEffect(() => {
        console.log('🔍 Sidebar - userRole changed to:', userRole);
    }, [userRole]);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Students', icon: 'fa-users', subItems: [ { name: 'All Students', path: '/admin/all-students' }, { name: 'New Student', path: '/admin/enrollment/new' }] },
        { name: 'Registration', icon: 'fa-file-alt', subItems: [ { name: 'All Registrations', path: '/admin/all-registrations' } ] },
        { name: 'Enrollment', icon: 'fa-user-check',
            subItems: [ 
              { name: 'Unenrolled Registrations', path: '/admin/enrollment/unenrolled' }, 
              { name: 'New Enrollment', path: '/admin/enrollment/new' } 
            ] 
        },
        { name: 'Assessment', path: '/admin/assessment', icon: 'fa-clipboard-list', 
            subItems: [
                { name : 'Unassessed Student', path: '/admin/assessment/unassessed-student'},
                { name : 'View Assessment', path: '/admin/assessment/view-assessment'}
            ]
        },
        { 
          name: 'Requests', 
          path: '/admin/requests', 
          icon: 'fa-folder-open', 
          badge: pendingRequestCount 
        },
        { 
          name: 'Request from Registrar',
          path: '/admin/request-from-registrar',
          icon: 'fa-envelope-open-text',
          badge: pendingRegistrarCount
        },
        { 
          name: 'Balance Inquiries',
          path: '/admin/balance-inquiries',
          icon: 'fa-question-circle',
          badge: pendingBalanceInquiriesCount
        },
        { name: 'Manage',
          icon: 'fa-cogs',
          subItems: [
            { name: 'Subject Schedules', path: '/admin/manage/subject-schedules' },
            { name: 'School Year & Semester', path: '/admin/manage/school-year-semester' },
            { name: 'View Grades', path: '/admin/manage/view-grades' },
            { name: 'Encode Enrollments', path: '/admin/manage/encode-enrollments' }
          ]
        },
        { name: 'Accounts', path: '/admin/accounts', icon: 'fa-user-shield' },
        { name: 'Settings', path: '/admin/settings', icon: 'fa-cog' }
    ];

    // Function to handle photo preview
    const handlePhotoPreview = () => {
        if (profilePic) {
            setPhotoPreviewModalOpen(true);
        }
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File too large. Maximum size is 5MB.');
            return;
        }

        try {
            // Validate and refresh session first
            const sessionValid = await sessionManager.validateAndRefreshSession();
            if (!sessionValid) {
                alert('Session expired. Please login again.');
                return;
            }

            const sessionToken = sessionManager.getSessionToken();
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch(`${API_BASE_URL}/admin-photos/upload`, {
                method: 'POST',
                headers: {
                    'X-Session-Token': sessionToken
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📸 Upload response data:', data);
                
                // Convert relative URL to full URL
                const fullPhotoUrl = data.photoUrl.startsWith('http') 
                    ? data.photoUrl 
                    : `${API_BASE_URL}${data.photoUrl}`;
                
                console.log('📸 Full photo URL:', fullPhotoUrl);
                console.log('📸 Setting profile picture to:', fullPhotoUrl);
                console.log('📸 API_BASE_URL:', API_BASE_URL);
                console.log('📸 data.photoUrl:', data.photoUrl);
                
                // Set the profile pic immediately and also refresh from server
                setProfilePic(fullPhotoUrl);
                // Cache the new profile photo URL in localStorage
                localStorage.setItem('adminProfilePic', fullPhotoUrl);
                // Also refresh from server to ensure consistency
                setTimeout(() => loadAdminProfilePhoto(true), 100);
            } else {
                const errorData = await response.json();
                alert(`Failed to upload photo: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            alert('Failed to upload profile photo. Please try again.');
        }
    };

    const handleMenuClick = (e, itemName) => {
        e.preventDefault();
        if (itemName === 'Students') setStudentOpen(!isStudentOpen);
        if (itemName === 'Registration') setRegistrationOpen(!isRegistrationOpen);
        if (itemName === 'Enrollment') setEnrollmentOpen(!isEnrollmentOpen);
        if (itemName === 'Assessment') setAssessmentOpen(!isAssessmentOpen);
        if (itemName === 'Manage') setManageOpen(!isManageOpen);
    };

     const handleSchoolYearChange = (e) => {
        setSelectedSchoolYear(e.target.value);
        // TODO: You might want to update a global state or context here
        // so other parts of your application know the selected SY has changed.
        console.log("Selected School Year ID:", e.target.value);
    };
    let visibleMenuItems;

    if (userRole === 'accounting') {
      visibleMenuItems = menuItems
        .filter(item =>
          ['Registration', 'Assessment', 'Request from Registrar', 'Balance Inquiries'].includes(item.name)
        )
        .map(item => {
          if (item.name === 'Students') {
            return {
              ...item,
              subItems: item.subItems.filter(subItem => subItem.name !== 'New Student')
            };
          }
          return item;
        });
    } else if (userRole === 'admin') {
      visibleMenuItems = menuItems
        .filter(item => item.name !== 'Registration' && item.name !== 'Request from Registrar' && item.name !== 'Balance Inquiries');
    } else {
      visibleMenuItems = menuItems;
    }

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header text-center">
                    <div className="sidebar-profile-container">
                        <div onClick={handlePhotoPreview} title="Click to view photo in full screen">
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt="Admin Profile" 
                                    className="sidebar-profile-pic" 
                                    onLoad={(e) => {
                                        console.log('✅ Profile image loaded successfully:', profilePic);
                                        console.log('✅ Image element:', e.target);
                                    }}
                                    onError={(e) => {
                                        console.error('❌ Profile image failed to load:', profilePic);
                                        console.error('❌ Error details:', e);
                                        console.error('❌ Image src that failed:', e.target.src);
                                        console.error('❌ Image element:', e.target);
                                        console.error('❌ Network error? Check if URL is accessible:', profilePic);
                                        // Don't clear the profilePic immediately, let's debug first
                                        // setProfilePic(null);
                                    }}
                                />
                            ) : (
                                <i className="fas fa-user-circle"></i>
                            )}
                        </div>
                        <label htmlFor="profile-pic-upload" className="profile-pic-edit-button" title="Click to upload/change photo"><i className="fas fa-camera"></i></label>
                        <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{display:'none'}}/>
                    </div>
                    <h5>{userRole === 'accounting' ? 'Accounting' : 'Registrar'}</h5>
                </div>
                
                {/* --- START: Added School Year Selector --- */}
                <div className="sidebar-sy-selector">
                    <select 
                        className="form-select sy-dropdown"
                        value={selectedSchoolYear}
                        onChange={handleSchoolYearChange}
                    >
                        {schoolYears.map(sy => (
                            <option key={sy.id} value={sy.id}>
                                SY {sy.start_year} - {sy.end_year} {sy.semester}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="sidebar-nav">
                    <ul className="nav flex-column">
                        {visibleMenuItems.map(item => (
                            <li className="nav-item" key={item.name}>
                                {item.subItems ? (
                                    <>
                                        {/* FIX: Changed 'itemName' to 'item.name' to pass the correct value */}
                                        <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e) => handleMenuClick(e, item.name)}>
                                            <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                            <i className={`fas fa-chevron-down transition-transform ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'rotate-180':''}`}></i>
                                        </a>
                                        <div className={`collapse ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'show':''}`}>
                                            <ul className="nav flex-column ps-3">
                                                {item.subItems.map(subItem => (
                                                    <li className="nav-item" key={subItem.name}>
                                                        <Link 
                                                            to={subItem.path} 
                                                            className={`nav-link sub-item ${
                                                                (location.pathname === subItem.path || (subItem.path === '/admin/all-students' && location.pathname.startsWith('/admin/students/'))) 
                                                                ? 'active' 
                                                                : ''
                                                            }`} 
                                                            onClick={() => subItem.path === '/admin/enrollment/new' && setStudentToEnroll(null)}>
                                                            {subItem.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <Link to={item.path} className={`nav-link d-flex justify-content-between align-items-center ${location.pathname === item.path ? 'active' : ''}`}>
                                        <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                        {item.badge > 0 && (
                                        <span className="badge bg-danger rounded-pill small-badge">{item.badge}</span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {photoPreviewModalOpen && (
                <div className="modal fade show" style={{ display: 'block', zIndex: 9999 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content profile-preview-modal">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title text-center w-100">
                                    <i className="fas fa-user-circle me-2"></i>
                                    Profile Photo
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close position-absolute" 
                                    style={{ right: '1rem', top: '1rem' }}
                                    onClick={() => setPhotoPreviewModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center p-4">
                                <div className="profile-preview-container">
                                    <img 
                                        src={profilePic} 
                                        alt="Profile Photo" 
                                        className="profile-preview-image"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 justify-content-center">
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary btn-sm" 
                                    onClick={() => setPhotoPreviewModalOpen(false)}
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Preview Modal Backdrop */}
            {photoPreviewModalOpen && (
                <div className="photo-preview-overlay" onClick={() => setPhotoPreviewModalOpen(false)}>
                    <div className="photo-preview-circle">
                        <img 
                            src={profilePic} 
                            alt="Profile Photo" 
                            className="photo-preview-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;