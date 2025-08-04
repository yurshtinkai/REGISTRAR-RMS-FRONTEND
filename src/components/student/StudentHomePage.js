import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';
import StudentRegistrationForm from './StudentRegistrationForm';

function StudentHomePage() {
    const [isRegistered, setIsRegistered] = useState(null); // Use null to indicate loading state
    const [isLoading, setIsLoading] = useState(true);
    const firstName = localStorage.getItem('firstName') || 'Student';

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                console.log('Checking registration status...');
                // This endpoint will need to be created in your backend
                const response = await fetch(`${API_BASE_URL}/students/registration-status`, {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                console.log('Response received:', response);
                const data = await response.json();
                console.log('Registration data:', data);
                if (response.ok) {
                    setIsRegistered(data.isRegistered);
                    console.log('Is registered:', data.isRegistered);
                }
            } catch (error) {
                console.error("Failed to check registration status:", error);
                setIsRegistered(false); // Assume not registered if there's an error
            } finally {
                setIsLoading(false);
            }
        };

        checkRegistrationStatus();
    }, []);

    const handleRegistrationComplete = () => {
        setIsRegistered(true);
    };

    if (isLoading) {
        return <div className="container-fluid text-center mt-5"><p>Loading...</p></div>;
    }

    if (!isRegistered) {
        return <StudentRegistrationForm onRegistrationComplete={handleRegistrationComplete} />;
    }

    return (
        <div className="container-fluid" style={{ marginTop: '0.5rem' }}>
            <div className="row justify-content-center" style={{ minHeight: '220px' }}>
                <div className="col-auto d-flex justify-content-center">
                    <img
                        src="/student.png"
                        className="img-fluid"
                        alt="bcstudent"
                        style={{ maxWidth: '342px', width: '100%', height: 'auto', display: 'block' }}
                    />
                </div>
                <div className="col d-flex flex-column justify-content-start" style={{ minHeight: '220px', paddingLeft: '0' }}>
                    <div style={{ marginTop: '60px', marginLeft: '30px' }}>
                        <h2 className="mb-0" style={{ fontWeight: 600 }}>Welcome, {firstName}!</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentHomePage;