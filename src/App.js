import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
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
import DashboardView from './components/admin/DashboardView'; // <-- IMPORT a new component

// Import data and utils
import { createDummyRegistrations } from './data/dummyData';
import { getUserRole } from './utils/api'; 

// Admin Layout Component
const AdminLayout = ({ onProfileClick, setStudentToEnroll }) => (
  <div className="admin-layout">
    <Sidebar onProfileClick={onProfileClick} setStudentToEnroll={setStudentToEnroll} />
    <main className="main-content">
      <Outlet /> {/* Child routes will render here */}
    </main>
  </div>
);

function App() {
  const [userRole, setUserRole] = useState(getUserRole());
  const [modalImage, setModalImage] = useState(null);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [registrations, setRegistrations] = useState(createDummyRegistrations());
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    if (role) {
      setUserRole(role);
    } else {
       document.body.classList.add('login-background');
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
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'student') {
      navigate('/student/dashboard');
    }
  };
  
  const handleLogout = () => { 
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('idNumber');
      setUserRole(null); 
      navigate('/login');
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
    navigate('/admin/all-students');
    alert('Enrollment Complete! Student has been added to the master list.');
  };
  
  const closeDocumentModal = () => {
    setDocumentModalData(null);
  };

  // A protected route component for authenticated users
  const ProtectedRoute = ({ children }) => {
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div id="app-wrapper">
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom-gradient shadow-sm fixed-top">
        <div className="container-fluid">
          <div className="d-flex ms-auto">
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
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute><StudentRequestForm /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout onProfileClick={setModalImage} setStudentToEnroll={setStudentToEnroll} />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardView enrolledStudents={enrolledStudents} />} />
            <Route path="all-students" element={<AllStudentsView enrolledStudents={enrolledStudents} />} />
            <Route path="all-registrations" element={<AllRegistrationsView registrations={registrations} setRegistrations={setRegistrations} />} />
            <Route 
              path="enrollment/unenrolled" 
              element={<UnenrolledRegistrationsView registrations={registrations} onEnrollStudent={setStudentToEnroll} />} 
            />
            <Route path="enrollment/new" element={<NewEnrollmentView student={studentToEnroll} onCompleteEnrollment={handleCompleteEnrollment} registrations={registrations} setStudentToEnroll={setStudentToEnroll} />} />
            <Route path="assessment" element={<PlaceholderView title="Assessment" />} />
            <Route path="requests" element={<RequestManagementView setDocumentModalData={setDocumentModalData} />} />
          </Route>

          {/* Redirect root path to login or dashboard */}
          <Route path="*" element={<Navigate to={userRole ? (userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/login'} replace />} />
        </Routes>
      </div>
      {modalImage && <ImageViewModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
      {documentModalData && <DocumentViewModal modalData={documentModalData} onClose={closeDocumentModal} />}
    </div>
  );
}

export default App;
