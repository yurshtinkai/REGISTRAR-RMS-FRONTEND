import React from 'react';
import './App.css'; // We'll create this CSS file next

function CustomAlert({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>
        <button onClick={onClose} className="btn btn-primary">OK</button>
      </div>
    </div>
  );
}

export default CustomAlert;