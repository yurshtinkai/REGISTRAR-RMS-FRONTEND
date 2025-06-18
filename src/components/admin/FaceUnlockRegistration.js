import React, { useState, useRef, useEffect, useCallback } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function FaceUnlockRegistration() {
    const [videoStream, setVideoStream] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
    }, [videoStream]);

    const startCamera = async () => {
        setError('');
        setSuccess('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
            setVideoStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure you have granted permission.");
        }
    };
    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleRegisterFace = async () => {
        if (!videoRef.current || !videoRef.current.srcObject) {
            setError('Camera is not active. Please start the camera first.');
            return;
        }

        setIsRegistering(true);
        setError('');
        setSuccess('');

        try {
            // FIX: This promise waits for the 'oncanplay' event, which is the most reliable
            // way to ensure the video stream is fully initialized and ready.
            await new Promise((resolve, reject) => {
                const video = videoRef.current;
                if (!video) {
                    return reject(new Error("Video element not found."));
                }
                // If video is already playable, resolve immediately.
                if (video.readyState >= 3) {
                    return resolve();
                }
                // Otherwise, wait for the 'oncanplay' event.
                video.oncanplay = () => resolve();
                video.onerror = () => reject(new Error("Video stream error."));
            });
            
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const faceImage = canvas.toDataURL('image/jpeg');

            const response = await fetch(`${API_BASE_URL}/auth/register-face`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ faceImage })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to register face.');
            }
            
            setSuccess('Face registered successfully! You can now use it to log in.');
            stopCamera();

        } catch (err) {
            setError(err.message || "Could not capture image from camera.");
        } finally {
            setIsRegistering(false);
        }
    };


    return (
        <div className="container-fluid">
            <h2 className="mb-4">Face Unlock Registration</h2>
            <div className="card shadow-sm">
                <div className="card-body">
                    <p className="card-text text-muted">
                        Register your face to enable quick and secure login. Position your face in the center of the frame and ensure good lighting.
                    </p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="text-center my-4">
                        <div className="video-container bg-dark">
                            {videoStream ? (
                                <video ref={videoRef} autoPlay playsInline muted className="live-video-feed"></video>
                            ) : (
                                <div className="camera-placeholder">
                                    <i className="fas fa-camera fa-5x text-muted"></i>
                                    <p className="mt-2">Camera is off</p>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        {!videoStream ? (
                            <button className="btn btn-primary" onClick={startCamera}>Start Camera</button>
                        ) : (
                            <>
                                <button className="btn btn-success" onClick={handleRegisterFace} disabled={isRegistering}>
                                    {isRegistering ? 'Registering...' : 'Capture and Register Face'}
                                </button>
                                <button className="btn btn-secondary" onClick={stopCamera}>Stop Camera</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default FaceUnlockRegistration;
