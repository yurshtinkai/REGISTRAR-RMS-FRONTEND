import React, { useEffect } from 'react';

function DocumentViewModal({ modalData, onClose }) {
    useEffect(() => {
      // This effect runs when the component mounts and whenever the modalData.url changes.
      // It does not need a body, as its only job is to set up the cleanup.
      
      // The cleanup function will run when the component unmounts OR before the effect runs again.
      return () => {
        // We check for modalData.url to ensure we don't try to revoke a null/undefined value
        if (modalData && modalData.url) {
          window.URL.revokeObjectURL(modalData.url);
        }
      };
    }, [modalData]); // By depending on the modalData object, the hook is correctly configured.

    if (!modalData) {
        return null;
    }

    return (
        <div className="image-view-modal" onClick={onClose}>
            <span className="close-modal-button">&times;</span>
            <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
                {modalData.type.startsWith('image/') ? (
                    <img src={modalData.url} alt="Document" className="enlarged-document-image" />
                ) : (
                    <iframe src={modalData.url} title="Document" width="100%" height="100%"></iframe>
                )}
            </div>
        </div>
    );
}

export default DocumentViewModal;