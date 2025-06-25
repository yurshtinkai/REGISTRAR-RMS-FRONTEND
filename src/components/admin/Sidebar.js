import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';


function Sidebar({ onProfileClick, setStudentToEnroll }) {
    // const adminIdNumber = localStorage.getItem('idNumber');
    const location = useLocation(); // Hook to get the current URL
    const [pendingRequestCount, setPendingRequestCount] = useState(0);

    
    // State to manage collapsible menus
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/admin/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/admin/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/admin/students'));
    
    const [profilePic, setProfilePic] = useState(null);
    const userRole = localStorage.getItem('userRole');
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));

    useEffect(() => {
    const fetchPendingRequests = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/requests`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            const pendingCount = data.filter(req => req.status === 'pending').length;
            setPendingRequestCount(pendingCount);
        } catch (err) {
            console.error('Failed to fetch pending requests:', err);
        }
    };

    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 10000); // update every 10 seconds
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
        { name: 'Assessment', path: '/admin/assessment', icon: 'fa-clipboard-list' },
        { 
  name: 'Requests', 
  path: '/admin/requests', 
  icon: 'fa-folder-open', 
  badge: pendingRequestCount 
},


        {name: 'Manage',
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
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                localStorage.setItem('adminProfilePic', base64String);
                setProfilePic(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMenuClick = (e, itemName) => {
        e.preventDefault();
        if (itemName === 'Students') setStudentOpen(!isStudentOpen);
        if (itemName === 'Registration') setRegistrationOpen(!isRegistrationOpen);
        if (itemName === 'Enrollment') setEnrollmentOpen(!isEnrollmentOpen);
        if (itemName === 'Manage') setManageOpen(!isManageOpen);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header text-center">
                <div className="sidebar-profile-container">
                    <div onClick={() => profilePic && onProfileClick(profilePic)}>
                        {profilePic ? (<img src={profilePic} alt="Admin Profile" className="sidebar-profile-pic" />) : (<i className="fas fa-user-circle"></i>)}
                    </div>
                    <label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label>
                    <input id="profile-pic-upload" type="file" onChange={handleProfilePicChange} style={{display:'none'}}/>
                </div>
                <h5>{userRole === 'accounting' ? 'Accounting' : 'Registrar'}</h5>
                {/* <p className="text-muted small">{adminIdNumber}</p> */}
            </div>
            
            <div className="sidebar-nav">
                <ul className="nav flex-column">
                    {menuItems.map(item => (
                        <li className="nav-item" key={item.name}>
                            {item.subItems ? (
                                <>
                                    <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e) => handleMenuClick(e, item.name)}>
                                        <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                        <i className={`fas fa-chevron-down transition-transform ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen))?'rotate-180':''}`}></i>
                                    </a>
                                    <div className={`collapse ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen))?'show':''}`}>
                                        <ul className="nav flex-column ps-3">
                                            {item.subItems.map(subItem => (
                                                <li className="nav-item" key={subItem.name}>
                                                    <Link to={subItem.path} className={`nav-link sub-item ${location.pathname === subItem.path ? 'active' : ''}`} onClick={() => subItem.path === '/admin/enrollment/new' && setStudentToEnroll(null)}>
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

