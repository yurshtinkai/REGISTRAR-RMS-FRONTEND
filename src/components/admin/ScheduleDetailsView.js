import React, { useState, useEffect } from 'react';
// FIX: Removed 'Link' as it was not being used in this component.
import { useParams } from 'react-router-dom';
import { createDummySubjectSchedules } from '../../data/dummyData';

// Helper function to generate a list of dummy students for a schedule
const generateEnrolledStudents = (count) => {
    const students = [];
    const firstNames = ["Juan", "Maria", "Jose", "Anna", "Luis", "Sofia", "Carlos", "Isabella", "Miguel", "Camila", "John", "Jane", "Peter", "Mary", "James", "Patricia"];
    const lastNames = ["Dela Cruz", "Garcia", "Reyes", "Santos", "Ramos", "Mendoza", "Gonzales", "Flores", "Villanueva", "Lim", "Tan", "Lee", "Kim", "Park"];
    const courses = ["BSIT", "BSCS", "BSBA-MKTG", "BSBA-HRDM", "BSED-EN", "BS-ARCH", "BSHM"];
    const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    for (let i = 0; i < count; i++) {
        const studentId = `2022-000${94 + i}`.slice(-6);
        students.push({
            id: studentId,
            name: `${lastNames[i % lastNames.length]}, ${firstNames[i % firstNames.length]} ${String.fromCharCode(65 + (i % 26))}.`,
            gender: i % 3 === 0 ? 'Male' : 'Female',
            course: courses[i % courses.length],
            yearLevel: yearLevels[i % yearLevels.length],
            enrollmentDate: new Date(2025, 4, 27 - i).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
        });
    }
    return students;
}


function ScheduleDetailsView() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);

    useEffect(() => {
        // In a real app, you would fetch this data from an API using the `id`.
        // For now, we find it in our dummy data.
        const allSchedules = createDummySubjectSchedules();
        const foundSchedule = allSchedules.find(s => s.id.toString() === id);
        
        if (foundSchedule) {
            setSchedule(foundSchedule);
            setEnrolledStudents(generateEnrolledStudents(foundSchedule.enrollees));
        }
    }, [id]);

    if (!schedule) {
        return <div className="container-fluid"><p>Loading schedule details...</p></div>;
    }

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Schedule Details</h2>
                <span className="text-muted fw-bold">SUBJECT SCHEDULES / SHOW</span>
            </div>

            {/* Schedule Details Card */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <p className="mb-1"><strong>Subject:</strong> {schedule.subject}</p>
                            <p className="mb-1"><strong>Description:</strong> {schedule.description}</p>
                            <p className="mb-0"><strong>Schedule:</strong> {schedule.days} {schedule.time}</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="mb-1"><strong>Teacher:</strong> [Teacher Name]</p>
                            <p className="mb-1"><strong>Total Students:</strong> {schedule.enrollees}</p>
                            <p className="mb-0"><strong>Room:</strong> {schedule.room}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List Card */}
            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Student List</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2">
                            <i className="fas fa-file-export me-1"></i> Export
                        </button>
                        <button className="btn btn-outline-secondary">
                            <i className="fas fa-print me-1"></i> Print
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Enrollment Status</label>
                            <select className="form-select">
                                <option>Enrolled and Assessed</option>
                                <option>Enrolled Only</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Course</th>
                                    <th>Year Level</th>
                                    <th>Enrollment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrolledStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.gender}</td>
                                        <td>{student.course}</td>
                                        <td>{student.yearLevel}</td>
                                        <td>{student.enrollmentDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleDetailsView;