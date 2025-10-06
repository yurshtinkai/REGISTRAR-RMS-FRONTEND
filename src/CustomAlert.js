import React from 'react';
import './App.css'; // We'll create this CSS file next

function CustomAlert({ isOpen, onClose, title, children, hideDefaultButton = false, actions = null, contentStyle = {} }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={contentStyle}>
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>
        {!hideDefaultButton && !actions && (
          <button onClick={onClose} className="btn btn-primary">OK</button>
        )}
        {actions && (
          <div className="modal-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomAlert;