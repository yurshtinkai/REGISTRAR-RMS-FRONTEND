import React, { useState, useEffect } from 'react';

function Sidebar({ setView, currentView, onProfileClick, setStudentToEnroll }) {
    const adminIdNumber = localStorage.getItem('idNumber');
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(false);
    const [isRegistrationOpen, setRegistrationOpen] = useState(false);
    const [isStudentOpen, setStudentOpen] = useState(false);
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const savedPic = localStorage.getItem('adminProfilePic');
        if (savedPic) setProfilePic(savedPic);
    }, []);

    const menuItems = [
        { name: 'Dashboard', view: 'dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Students', icon: 'fa-users', subItems: [ { name: 'All Students', view: 'all_students' }, { name: 'New Student', view: 'new_student' }] },
        { name: 'Registration', icon: 'fa-file-alt', subItems: [ { name: 'All Registrations', view: 'all_registrations' } ] },
        { name: 'Enrollment', icon: 'fa-user-check',
            subItems: [ { name: 'All Enrollments', view: 'enrollment_all' }, { name: 'Unenrolled Registrations', view: 'enrollment_unenrolled' }, { name: 'New Enrollment', view: 'enrollment_new' } ] },
        { name: 'Assessment', view: 'assessment', icon: 'fa-clipboard-list' },
        { name: 'Requests', view: 'requests', icon: 'fa-folder-open' },
    ];
    
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]; if(file){const reader = new FileReader(); reader.onloadend = () => {localStorage.setItem('adminProfilePic', reader.result); setProfilePic(reader.result)}; reader.readAsDataURL(file)}
    };
    
    const handleNewEnrollmentClick = (e) => {
        e.preventDefault();
        setStudentToEnroll(null); 
        setView('enrollment_new');
    };

    const handleMenuClick = (e, itemName) => {
        e.preventDefault();
        if (itemName === 'Students') setStudentOpen(!isStudentOpen);
        if (itemName === 'Registration') setRegistrationOpen(!isRegistrationOpen);
        if (itemName === 'Enrollment') setEnrollmentOpen(!isEnrollmentOpen);
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
                <h5>Registrar</h5>
                <p className="text-muted small">{adminIdNumber}</p>
            </div>
            
            {/* This new div will wrap the navigation and become the scrollable area */}
            <div className="sidebar-nav">
                <ul className="nav flex-column">
                    {menuItems.map(item => (
                        <li className="nav-item" key={item.name}>
                            {item.subItems ? (
                                <>
                                    <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e)=>handleMenuClick(e, item.name)}>
                                        <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                        <i className={`fas fa-chevron-down transition-transform ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen))?'rotate-180':''}`}></i>
                                    </a>
                                    <div className={`collapse ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen))?'show':''}`}>
                                        <ul className="nav flex-column ps-3">
                                            {item.subItems.map(subItem => (
                                                <li className="nav-item" key={subItem.name}>
                                                    <a href="#!" className={`nav-link sub-item ${currentView===subItem.view?'active':''}`} 
                                                       onClick={(e) => {
                                                           if (subItem.view === 'enrollment_new') { handleNewEnrollmentClick(e); } 
                                                           else { e.preventDefault(); setView(subItem.view); }
                                                       }}>{subItem.name}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <a href="#!" className={`nav-link ${currentView===item.view?'active':''}`} onClick={(e)=>{e.preventDefault();setView(item.view);}}>
                                    <i className={`fas ${item.icon} me-2`}></i>{item.name}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;