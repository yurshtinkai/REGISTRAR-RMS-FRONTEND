import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDummyCurriculum } from '../../data/dummyData'; // Import curriculum data
import CurriculumTrackModal from './CurriculumTrackModal'; // Import the new modal
import './StudentDetailView.css';
import './CurriculumTrackModal.css'; // Import modal CSS

// Dummy data generator for this specific view
const generateStudentDetails = (student) => {
  const requestPool = [
    { document: 'Transcript of Records', status: 'Ready for Pick-up', amount: '150.00', date: '2025-07-20' },
    { document: 'Good Moral Certificate', status: 'Pending', amount: '50.00', date: '2025-07-25' },
    { document: 'Grade Slip', status: 'Rejected', amount: '0.00', date: '2025-07-15' },
  ];

  const allTakenSubjects = [
      { code: 'FIL 2', finalGrade: '2.5' }, { code: 'IT 223', finalGrade: '1.75' },
      { code: 'GE 5', finalGrade: '1.25' }, { code: 'GE 1', finalGrade: '1.5' },
      { code: 'IT 222', finalGrade: '2.0' }, { code: 'NSTP 1', finalGrade: 'P' },
      { code: 'IT 111', finalGrade: '1.0' }, { code: 'IT 112', finalGrade: '1.25' },
  ];

  const enrolledSubjectsBySemester = {
    '2024 - 2025 2nd Semester': [
      { subject: 'FIL 2', units: 3, finalGrade: '2.5', status: 'TAKEN' },
      { subject: 'IT 223', units: 3, finalGrade: '1.75', status: 'TAKEN' },
      { subject: 'GE 5', units: 3, finalGrade: '1.25', status: 'TAKEN' },
    ],
    '2024 - 2025 1st Semester': [
      { subject: 'GE 1', units: 3, finalGrade: '1.5', status: 'TAKEN' },
      { subject: 'IT 222', units: 3, finalGrade: '2.0', status: 'TAKEN' },
      { subject: 'NSTP 1', units: 3, finalGrade: 'P', status: 'TAKEN' },
    ]
  };
  
  const idNum = parseInt((student?.idNo || '0000').slice(-4), 10);
  
  return {
    documentRequests: idNum % 2 === 1 ? [requestPool[0], requestPool[1]] : [],
    enrolledSubjects: enrolledSubjectsBySemester,
    allTakenSubjects,
    curriculum: getDummyCurriculum(student?.course),
    academicInfo: {
        status: 'Regular',
        semester: '2nd Semester',
        yearOfEntry: '2024',
        yearOfGraduation: ''
    }
  };
};

function StudentDetailView({ enrolledStudents }) {
  const { idNo } = useParams();
  const student = enrolledStudents.find(s => s.idNo === idNo);
  const studentDetails = useMemo(() => generateStudentDetails(student), [student]);

  const [currentSemester, setCurrentSemester] = useState(Object.keys(studentDetails.enrolledSubjects)[0]);
  const [isCurriculumModalOpen, setCurriculumModalOpen] = useState(false);

  // FIX: Memoize currentSubjects to satisfy the exhaustive-deps rule
  const currentSubjects = useMemo(() => studentDetails.enrolledSubjects[currentSemester] || [], [studentDetails.enrolledSubjects, currentSemester]);
  
  const { totalUnits, weightedAverage } = useMemo(() => {
    let totalUnits = 0;
    let totalWeight = 0;
    currentSubjects.forEach(sub => {
      const grade = parseFloat(sub.finalGrade);
      if (!isNaN(grade)) {
        totalUnits += sub.units;
        totalWeight += grade * sub.units;
      }
    });
    const weightedAverage = totalUnits > 0 ? (totalWeight / totalUnits).toFixed(4) : 'N/A';
    return { totalUnits, weightedAverage };
  }, [currentSubjects]);


  if (!student) {
    return (
      <div className="container-fluid text-center mt-5">
        <h2>Student Not Found</h2>
        <p>The student with ID No. {idNo} could not be found.</p>
        <Link to="/admin/all-students" className="btn btn-primary">Back to Student List</Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'ready for pick-up':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  
  const getSubjectStatusBadge = (status) => {
    return status.toLowerCase() === 'taken' ? 'badge bg-primary' : 'badge bg-info';
  };

  return (
    <div className="student-detail-view container-fluid">
      <div className="row">
        <div className="col-lg-3">
          <div className="card shadow-sm student-profile-card">
            <div className="card-body text-center">
              <div className="profile-pic-wrapper mb-3">
                <i className="fas fa-user-circle fa-6x text-muted"></i>
              </div>
              <h4>{student.name}</h4>
              <p className="text-muted mb-0">Student No. {student.idNo}</p>
              <p className="text-muted">{student.course}</p>
            </div>
            <div className="list-group list-group-flush">
                <div className="list-group-item">
                    <strong>Academic Info</strong>
                    <ul className="list-unstyled mt-2 text-muted small">
                        <li>Status: <span className="float-end">{studentDetails.academicInfo.status}</span></li>
                        <li>Semester: <span className="float-end">{studentDetails.academicInfo.semester}</span></li>
                        <li>Year of Entry: <span className="float-end">{studentDetails.academicInfo.yearOfEntry}</span></li>
                        <li>Year of Graduation: <span className="float-end">{studentDetails.academicInfo.yearOfGraduation || 'N/A'}</span></li>
                    </ul>
                </div>
                <div className="list-group-item">
                    <strong>Personal Data</strong>
                    <p className="small text-muted mt-2">Additional personal details like contact number, address, etc., would be displayed here.</p>
                </div>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Document Requests</h5>
              <button className="btn btn-sm btn-outline-primary">New Request</button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetails.documentRequests.length > 0 ? (
                      studentDetails.documentRequests.map((req, index) => (
                        <tr key={index}>
                          <td>{req.document}</td>
                          <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span></td>
                          <td>{req.amount}</td>
                          <td>{req.date}</td>
                          <td><button className="btn btn-sm btn-info"><i className="fas fa-eye"></i></button></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">No matching records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enrolled Subjects</h5>
                <div className="d-flex align-items-center">
                    <select 
                        className="form-select form-select-sm me-2" 
                        style={{width: '200px'}}
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(e.target.value)}
                    >
                        {Object.keys(studentDetails.enrolledSubjects).map(semester => (
                            <option key={semester} value={semester}>{semester}</option>
                        ))}
                    </select>
                    <button onClick={() => setCurriculumModalOpen(true)} className="btn btn-sm btn-outline-secondary">View Student Curriculum Track</button>
                </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-sm">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="text-center">Units</th>
                      <th className="text-center">Final Grade</th>
                      <th className="text-center">Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubjects.length > 0 ? (
                      currentSubjects.map((sub, index) => (
                        <tr key={index}>
                          <td>{sub.subject}</td>
                          <td className="text-center">{sub.units}</td>
                          <td className="text-center">{sub.finalGrade}</td>
                          <td className="text-center"><span className={getSubjectStatusBadge(sub.status)}>{sub.status}</span></td>
                          <td><button className="btn btn-sm btn-link">More Info</button></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">No subjects found for this semester.</td>
                      </tr>
                    )}
                  </tbody>
                  {currentSubjects.length > 0 && (
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan="2" className="text-end fw-bold">Total Units: <span className="fw-normal">{totalUnits}</span></td>
                        <td colSpan="3" className="text-end fw-bold">Weighted Average: <span className="fw-normal">{weightedAverage}</span></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCurriculumModalOpen && (
        <CurriculumTrackModal
          studentName={student.name}
          curriculum={studentDetails.curriculum}
          takenSubjects={studentDetails.allTakenSubjects}
          onClose={() => setCurriculumModalOpen(false)}
        />
      )}
    </div>
  );
}

export default StudentDetailView;