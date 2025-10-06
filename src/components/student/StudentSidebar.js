import React, { useEffect, useRef } from 'react';
import './StudentSidebar.css';

function StudentSidebar({ isOpen, onClose, navigate }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={sidebarRef} className={`student-sidebar${isOpen ? ' open' : ''}`}> 
      <div className="student-sidebar-header">
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <ul className="student-sidebar-nav">
        <li><button onClick={() => { onClose(); navigate('/student/home'); }}>Home</button></li>
        <li><button onClick={() => { onClose(); navigate('/student/request'); }}>Request</button></li>
        <li><button onClick={() => { onClose(); navigate('/student/my-request'); }}>My Request</button></li>
        <li><button onClick={() => { onClose(); navigate('/student/billing'); }}>Billing</button></li>
      </ul>
    </div>
  );
}

export default StudentSidebar;