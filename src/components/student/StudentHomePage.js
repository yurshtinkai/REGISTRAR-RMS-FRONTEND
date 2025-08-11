function StudentHomePage() {
    const fullName = localStorage.getItem('fullName');

    const announcements = [
        { id: 1, title: 'Enrollment for 1st Semester AY 2025-2026 now open!', date: 'July 15, 2025' },
        { id: 2, title: 'Deadline for TOR requests: August 5, 2025', date: 'July 30, 2025' }
    ];

    const quickLinks = [
        { title: 'Request Document', icon: 'fa-file-alt', path: '/student/requests' },
        { title: 'View Grades', icon: 'fa-graduation-cap', path: '/student/grades' },
        { title: 'Enrollment Status', icon: 'fa-user-check', path: '/student/enrollment-status' },
        { title: 'Profile', icon: 'fa-user', path: '/student/profile' }
    ];

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
                    <h2 className="mb-1 fw-bold">Welcome, {fullName}!</h2>
                    <p className="text-muted mb-0">Here’s what’s happening in your account today.</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="row g-3 mb-4">
                {quickLinks.map((link, index) => (
                    <div className="col-6 col-md-3" key={index}>
                        <a href={link.path} className="card text-center shadow-sm text-decoration-none text-dark">
                            <div className="card-body">
                                <i className={`fas ${link.icon} fa-2x mb-2 text-primary`}></i>
                                <h6 className="card-title">{link.title}</h6>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            {/* Announcements */}
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white fw-bold">
                    Announcements
                </div>
                <div className="list-group list-group-flush">
                    {announcements.map(announcement => (
                        <div key={announcement.id} className="list-group-item">
                            <h6 className="mb-1">{announcement.title}</h6>
                            <small className="text-muted">{announcement.date}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StudentHomePage;
