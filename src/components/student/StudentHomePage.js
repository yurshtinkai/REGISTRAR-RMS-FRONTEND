function StudentHomePage() {
    const fullName = localStorage.getItem('fullName');
    const course = localStorage.getItem('coure');

    return (
        <div className="container-fluid mt-3">
            {/* Welcome Section */}
            <div className="row align-items-center mb-4">
                <div className="col-auto">
                    <img 
                        src="/student.png" 
                        className="img-fluid"
                        alt="bcstudent"
                        style={{ maxWidth: '120px', borderRadius: '50%' }}
                    />
                </div>
                <div className="col">
                    <h1 className="mb-1 fw-bold">Welcome, {fullName}!</h1>
                    <h2 className="mb-1 fw-bold">{course} Course</h2>
                    <p className="text-muted">Manage your student records and requests easily.</p>
                </div>
            </div>

        </div>
    );
}

export default StudentHomePage;
