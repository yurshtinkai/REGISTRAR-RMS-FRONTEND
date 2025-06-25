import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function DocumentViewModal({ modalData, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDocument = useCallback(async (index) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/requests/${modalData.requestId}/document/${index}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Could not fetch file.');
            }

            const blob = await response.blob();
            const contentType = response.headers.get('content-type');
            const url = window.URL.createObjectURL(blob);
            setCurrentDocument({ url, type: contentType });
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [modalData]);

    useEffect(() => {
        if (modalData?.filePaths?.length > 0) {
            fetchDocument(currentIndex);
        }
    }, [currentIndex, modalData, fetchDocument]);

    useEffect(() => {
        return () => {
            if (currentDocument && currentDocument.url) {
                window.URL.revokeObjectURL(currentDocument.url);
            }
        };
    }, [currentDocument]);

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % modalData.filePaths.length);
    };

    const handlePrev = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + modalData.filePaths.length) % modalData.filePaths.length);
    };

    if (!modalData) {
        return null;
    }

    const stopPropagation = (e) => e.stopPropagation();

    return (
        // The main flexbox container now lays out the buttons and content horizontally
        <div className="image-view-modal" onClick={onClose}>
            <span className="close-modal-button" onClick={onClose}>&times;</span>
            
            {/* FIX: Previous Button */}
            {modalData.filePaths.length > 1 && (
                <button
                    onClick={(e) => { stopPropagation(e); handlePrev(); }}
                    className="btn btn-light"
                    style={{ zIndex: 1051, fontSize: '1.5rem', lineHeight: 1, padding: '0.5rem 1rem', marginRight: '1rem' }}
                >
                    &lt;
                </button>
            )}

            <div className="document-modal-content" onClick={stopPropagation}>
                {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger m-3">{error}</div>
                ) : currentDocument && (
                    currentDocument.type.startsWith('image/') ? (
                        <img src={currentDocument.url} alt="Document" className="enlarged-document-image" />
                    ) : (
                        <iframe src={currentDocument.url} title="Document" width="100%" height="100%"></iframe>
                    )
                )}
            </div>

            {/* FIX: Next Button */}
            {modalData.filePaths.length > 1 && (
                <button
                    onClick={(e) => { stopPropagation(e); handleNext(); }}
                    className="btn btn-light"
                    style={{ zIndex: 1051, fontSize: '1.5rem', lineHeight: 1, padding: '0.5rem 1rem', marginLeft: '1rem' }}
                >
                    &gt;
                </button>
            )}

            {/* Document Counter */}
            {modalData.filePaths.length > 1 && (
                 <div className="position-absolute bottom-0 text-white mb-2" style={{ left: '50%', transform: 'translateX(-50%)', fontSize: '0.9em' }}>
                    {currentIndex + 1} / {modalData.filePaths.length}
                </div>
            )}
        </div>
    );
}

export default DocumentViewModal;