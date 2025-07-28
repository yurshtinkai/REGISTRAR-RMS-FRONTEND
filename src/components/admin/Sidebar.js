import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';


function Sidebar({ onProfileClick, setStudentToEnroll }) {
    const location = useLocation();
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/admin/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/admin/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/admin/all-students') || location.pathname.startsWith('/admin/students/'));
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));
    const [isAssessmentOpen, setAssessmentOpen] = useState(location.pathname.startsWith('/admin/assessment'));
    
    const [profilePic, setProfilePic] = useState(null);
    const userRole = localStorage.getItem('userRole');

    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    useEffect(() => {
        // TODO: Replace this with your actual API call to fetch school years
        const fetchSchoolYears = async () => {
            // This is dummy data that mimics an API response.
            const dummyData = [
                { id: 1, start_year: 2025, end_year: 2026, semester: '1st Semester' },
                { id: 2, start_year: 2024, end_year: 2025, semester: '2nd Semester' },
                { id: 3, start_year: 2024, end_year: 2025, semester: '1st Semester' },
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
                const res = await fetch(`${API_BASE_URL}/requests`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const pendingCount = data.filter(req => req.status === 'pending').length;
                    setPendingRequestCount(pendingCount);
                }
            } catch (err) {
                console.error('Failed to fetch pending requests:', err);
            }
        };

        fetchPendingRequests();
        const interval = setInterval(fetchPendingRequests, 10000);
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
        { name: 'Manage',
          icon: 'fa-cogs',
          subItems: [
            { name: 'Subject Schedules', path: '/admin/manage/subject-schedules' },
            { name: 'School Year & Semester', path: '/admin/manage/school-year-semester' },
            { name: 'View Grades', path: '/admin/manage/view-grades' },
            { name: 'Encode Enrollments', path: '/admin/manage/encode-enrollments' }
          ]
        },
    ];

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

    return (
        <div className="sidebar">
            <div className="sidebar-header text-center">
                <div className="sidebar-profile-container">
                    <div onClick={() => profilePic && onProfileClick(profilePic)}>
                        {profilePic ? (<img src={profilePic} alt="Admin Profile" className="sidebar-profile-pic" />) : (<i className="fas fa-user-circle"></i>)}
                    </div>
                    <label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label>
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
                    {menuItems.map(item => (
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
    );
}

export default Sidebar;