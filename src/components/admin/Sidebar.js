import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';
import sessionManager from '../../utils/sessionManager';


function Sidebar({ onProfileClick, setStudentToEnroll }) {
    const location = useLocation();
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [pendingRegistrarCount, setPendingRegistrarCount] = useState(0);
    
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/admin/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/admin/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/admin/all-students') || location.pathname.startsWith('/admin/students/'));
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));
    const [isAssessmentOpen, setAssessmentOpen] = useState(location.pathname.startsWith('/admin/assessment'));
    
    const [profilePic, setProfilePic] = useState(null);
    const [photoPreviewModalOpen, setPhotoPreviewModalOpen] = useState(false);
    const userRole = localStorage.getItem('userRole');

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

        fetchPendingRequests();
        fetchPendingPayments();
        const interval = setInterval(() => {
            fetchPendingRequests();
            fetchPendingPayments();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const savedPic = localStorage.getItem(`${userRole}ProfilePic`);
        if (savedPic) setProfilePic(savedPic);
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

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                try {
                    localStorage.setItem(`${userRole}ProfilePic`, dataUrl);
                    setProfilePic(dataUrl);
                } catch (error) {
                    alert("Could not save the profile picture. The image might still be too large or your browser's storage is full.");
                    console.error("Error saving profile picture to localStorage:", error);
                }
            };
            img.onerror = () => {
                alert("The selected file couldn't be loaded as an image.");
            };
        };
        reader.onerror = () => {
            alert("Failed to read the selected file.");
        };
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
          ['Registration', 'Assessment', 'Students', 'Request from Registrar'].includes(item.name)
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
        .filter(item => item.name !== 'Registration' && item.name !== 'Request from Registrar');
    } else {
      visibleMenuItems = menuItems;
    }

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header text-center">
                    <div className="sidebar-profile-container">
                        <div onClick={handlePhotoPreview} title="Click to view photo in full screen">
                            {profilePic ? (<img src={profilePic} alt="Admin Profile" className="sidebar-profile-pic" />) : (<i className="fas fa-user-circle"></i>)}
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