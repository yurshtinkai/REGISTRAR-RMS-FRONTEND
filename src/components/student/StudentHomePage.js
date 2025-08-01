
function StudentHomePage() {
    const firstName = localStorage.getItem('firstName') || 'Student';

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