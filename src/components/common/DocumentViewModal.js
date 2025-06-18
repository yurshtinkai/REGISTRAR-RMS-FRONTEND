import React, { useEffect } from 'react';

function DocumentViewModal({ modalData, onClose }) {
    
    // This useEffect hook is the key to the fix. 
    // It creates a cleanup function that runs ONLY when the modal is closed (unmounted).
    // This prevents the URL from being revoked too early.
    useEffect(() => {
        return () => {
            if (modalData && modalData.url) {
                window.URL.revokeObjectURL(modalData.url);
            }
        };
    }, [modalData]); // This effect re-runs if the modalData changes

    if (!modalData) return null;

    return (
        <div className="image-view-modal" onClick={onClose}>
            <span className="close-modal-button">&times;</span>
            <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
                {modalData.type.startsWith('image/') ? (
                    <img src={modalData.url} alt="Document" className="enlarged-document-image" />
                ) : (
                    // Fallback for non-image files like PDFs
                    <iframe src={modalData.url} title="Document" width="100%" height="100%"></iframe>
                )}
            </div>
        </div>
    );
}

export default DocumentViewModal;
