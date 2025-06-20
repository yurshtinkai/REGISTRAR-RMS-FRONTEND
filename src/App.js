import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import components
import Login from './components/auth/Login';
import StudentRequestForm from './components/student/StudentRequestForm';
import Sidebar from './components/admin/Sidebar';
import AllRegistrationsView from './components/admin/AllRegistrationsView';
import UnenrolledRegistrationsView from './components/admin/UnenrolledRegistrationsView';
import NewEnrollmentView from './components/admin/NewEnrollmentView';
import RequestManagementView from './components/admin/RequestManagementView';
import PlaceholderView from './components/admin/PlaceholderView';
import ImageViewModal from './components/common/ImageViewModal';
import DocumentViewModal from './components/common/DocumentViewModal';
import AllStudentsView from './components/admin/AllStudentsView';

// Import data and utils
import { createDummyRegistrations } from './data/dummyData';
import { getUserRole, getToken } from './utils/api';


function App() {
  const [userRole, setUserRole] = useState(getUserRole());
  const [adminView, setAdminView] = useState('dashboard'); 
  const [modalImage, setModalImage] = useState(null);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [registrations, setRegistrations] = useState(createDummyRegistrations());
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);


  useEffect(() => {
    if (getToken()) setUserRole(getUserRole());
    if (!getUserRole()) {
        document.body.classList.add('login-background');
    } else {
        document.body.classList.remove('login-background');
    }
    return () => {
        document.body.classList.remove('login-background');
    };
  }, [userRole]);

  useEffect(() => {
    if (modalImage || documentModalData) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [modalImage, documentModalData]);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    if (role === 'admin') setAdminView('dashboard');
  };
  
  const handleLogout = () => { 
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('idNumber');
      setUserRole(null); 
      window.location.reload();
  };

  const handleEnrollStudent = (student) => {
      setStudentToEnroll(student);
      setAdminView('enrollment_new');
  };
  
  const handleCompleteEnrollment = (enrolledStudent) => {
    const newStudent = {
      ...enrolledStudent,
      id: enrolledStudents.length + 1, 
      idNo: `2024-${1000 + enrolledStudents.length + 1}`,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setEnrolledStudents(prev => [...prev, newStudent]);

    setRegistrations(prev => prev.map(reg => 
      reg.id === enrolledStudent.id ? { ...reg, status: 'enrolled' } : reg
    ));

    setStudentToEnroll(null);
    setAdminView('all_students');
    alert('Enrollment Complete! Student has been added to the master list.');
  };

  const renderAdminContent = () => {
    switch (adminView) {
        case 'requests': return <RequestManagementView setDocumentModalData={setDocumentModalData} />;
        case 'all_registrations': return <AllRegistrationsView registrations={registrations} setRegistrations={setRegistrations} />;
        case 'enrollment_unenrolled': return <UnenrolledRegistrationsView registrations={registrations} onEnrollStudent={handleEnrollStudent} />;
        case 'enrollment_new': return <NewEnrollmentView student={studentToEnroll} onCompleteEnrollment={handleCompleteEnrollment} registrations={registrations} setStudentToEnroll={setStudentToEnroll} />;
        case 'all_students': return <AllStudentsView enrolledStudents={enrolledStudents} />;
        case 'change_password': return <PlaceholderView title="Change Password" />;
        default: return <PlaceholderView title={adminView.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />;
    }
  };
  
  const closeDocumentModal = () => {
    setDocumentModalData(null);
  };

  return (
    <div id="app-wrapper">
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom-gradient shadow-sm fixed-top">
        <div className="container-fluid">
          {/* REMOVED the navbar-brand link */}
          <div className="d-flex ms-auto">{/* Added ms-auto to push content to the right */}
            {userRole && (
              <>
                <span className="navbar-text me-3">Logged in as: <strong>{localStorage.getItem('idNumber')}</strong> ({userRole})</span>
                <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="content-wrapper">
        {!userRole ? <Login onLoginSuccess={handleLoginSuccess} /> : userRole === 'student' ? <StudentRequestForm /> : (
            <div className="admin-layout">
                <Sidebar setView={setAdminView} currentView={adminView} onProfileClick={setModalImage} setStudentToEnroll={setStudentToEnroll} />
                <main className="main-content">{renderAdminContent()}</main>
            </div>
        )}
      </div>
      {modalImage && <ImageViewModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
      {documentModalData && <DocumentViewModal modalData={documentModalData} onClose={closeDocumentModal} />}
    </div>
  );
}

export default App;
