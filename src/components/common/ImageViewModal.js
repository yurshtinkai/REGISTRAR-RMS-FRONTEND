import React from 'react';

function ImageViewModal({ imageUrl, onClose }) {
    return (
        <div className="image-view-modal" onClick={onClose}>
            <span className="close-modal-button">&times;</span>
            <img src={imageUrl} alt="Profile" className="enlarged-profile-pic" />
        </div>
    );
}

export default ImageViewModal;
