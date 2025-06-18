import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../utils/api'; 

function Login({ onLoginSuccess }) {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idNumber, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('idNumber', data.user.idNumber);
      onLoginSuccess(data.user.role);
    } catch (err) { setError(err.message); }
  };
  
  const handleFaceUnlock = async () => {
      setIsScanning(true);
      setError('');
      let stream;
      try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
            throw new Error("Video element not found.");
          }
          
          // FIX: Wait for the video to be playable before continuing.
          await new Promise((resolve, reject) => {
              const video = videoRef.current;
              if (!video) return reject(new Error("Video element disappeared."));
              if (video.readyState >= 3) return resolve(); // Already ready
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

          stream.getTracks().forEach(track => track.stop());

          const response = await fetch(`${API_BASE_URL}/auth/face-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ faceImage })
          });
          
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Face login failed.');
          }
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('idNumber', data.user.idNumber);
          onLoginSuccess(data.user.role);

      } catch (err) {
          setError(err.message || "Could not access camera. Please grant permission and try again.");
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
      } finally {
          setIsScanning(false);
      }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4 position-relative"> 
            <div className="text-center mb-3">
                <button className="btn btn-outline-secondary rounded-circle" onClick={handleFaceUnlock} disabled={isScanning} style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-camera fa-2x"></i>
                </button>
            </div>
            {isScanning && (
                <div className="scanning-overlay">
                    <video ref={videoRef} autoPlay playsInline muted className="live-video-feed-small"></video>
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-white">Scanning...</p>
                </div>
            )}

            <h2 className="text-center mb-4">Login to Registrar Portal</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3"><label htmlFor="idNumber">ID Number</label><input type="text" className="form-control" id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required /></div>
                <div className="mb-3"><label htmlFor="password">Password</label><input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid"><button type="submit" className="btn btn-primary btn-lg" disabled={isScanning}>Login</button></div>
                <p className="text-center mt-3 text-muted"><small>Dummy Accounts: Student (S001/password) | Admin (A001/adminpass)</small></p>
            </form>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
