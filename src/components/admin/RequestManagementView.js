import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function RequestManagementView({ setDocumentModalData }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('userRole');
  const isReadOnly = userRole === 'accounting';
  const isAdmin = userRole === 'admin';

  const fetchAllRequests = async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/requests`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setRequests(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllRequests(); }, []);

  const handleApproveOrReject = async (requestId, newStatus) => {
    if (userRole !== 'admin') {
      return;
    }

    const notes = prompt(`Enter notes for this action (${newStatus}):`);
    if (notes === null) return;

    try {
      await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });   
      fetchAllRequests();
    } catch (err) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleViewDocument = (request) => {
    if (request.filePath && Array.isArray(request.filePath) && request.filePath.length > 0) {
      setDocumentModalData({
        filePaths: request.filePath,
        requestId: request.id,
      });
    }
  };

  const handlePrint = async (requestToPrint) => {
    try {
        await fetch(`${API_BASE_URL}/requests/${requestToPrint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ status: 'ready for pick-up', notes: 'Document printed and ready for collection.' }),
        });
        await fetchAllRequests();
  
        const studentName = requestToPrint.User 
            ? `${requestToPrint.User.lastName}, ${requestToPrint.User.firstName} ${requestToPrint.User.middleName || ''}` 
            : '[Student Full Name]'; 
        const studentCourse = requestToPrint.User?.course || '[Student Course]';
        const academicYear = '2024-2025';
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const personalInfo = {
            civilStatus: 'Single',
            dateOfBirth: 'January 23, 2006',
            placeOfBirth: 'Mandaue City, Cebu',
            religion: 'Roman Catholic',
            parentGuardian: 'Maria Dela Cruz',
            permanentAddress: 'Sangi, Cal-oocan, Mandaue City',
            previousSchool: 'Mandaue City Science High School',
        };
        const educationalData = {
            elementary: { name: 'Mabolo Elementary School', year: '2018' },
            secondary: { name: 'Cebu Eastern College', year: '2022' },
        };
        const gradesData = [
            {
                semester: 'First Year, First Semester',
                year: '2024-2025',
                subjects: [
                    { code: 'IT 111', desc: 'Introduction to Computing', grade: '1.5' },
                    { code: 'GE 1', desc: 'Understanding the Self', grade: '1.2' },
                    { code: 'FIL 1', desc: 'Komunikasyon sa Akademikong Filipino', grade: '1.7' },
                    { code: 'NSTP 1', desc: 'National Service Training Program 1', grade: 'P' },
                ]
            },
            {
                semester: 'First Year, Second Semester',
                year: '2024-2025',
                subjects: [
                    { code: 'IT 121', desc: 'Computer Programming 1', grade: '1.8' },
                    { code: 'IT 122', desc: 'Data Structures and Algorithms', grade: '2.0' },
                    { code: 'GE 5', desc: 'Purposive Communication', grade: '1.5' },
                    { code: 'NSTP 2', desc: 'National Service Training Program 2', grade: 'P' },
                ]
            }
        ];

        const diplomaDetails = {
            dean: "JAYPEE Y. ZOILO, DBA",
            schoolDirector: "RANULFO L. VISAYA JR., DevEdD.",
            registrar: "WENELITO M. LAYSON",
            president: "LILIAN BENEDICTO-HUAN",
            graduationDate: "this 26th day of May 2022",
            specialOrder: "No. 30-346201-0196, s. 2022 dated December 15, 2022"
        };

        let printContent = '';
        switch (requestToPrint.documentType.toUpperCase()) {
            case 'GOOD MORAL':
                printContent = `<div class="print-container"><div class="header"><h1>CERTIFICATE OF GOOD MORAL CHARACTER</h1></div><p class="date">${today}</p><p class="body-text">This is to certify that <b>${studentName}</b>, a student of <b>${studentCourse}</b> for Academic Year ${academicYear}, is of good moral character.</p><p class="body-text">This certification is issued upon the request of the student for <b>${requestToPrint.purpose}</b> purposes only.</p><div class="signature-block"><p><b>[REGISTRAR'S NAME]</b></p><p>School Registrar</p></div></div>`;
                break;
            case 'TOR':
                printContent = `
                <div class="tor-container">
                        <div class="tor-header">
                            <img src="/bc.png" alt="Logo" class="tor-logo">
                            <h2>BENEDICTO COLLEGE</h2>
                            <p>A.S. Fortuna Street, Mandaue City 6014, Cebu, Philippines</p>
                            <h3>OFFICIAL TRANSCRIPT OF RECORDS</h3>
                        </div>

                        <table class="info-table">
                            <tr>
                                <td colspan="4" class="section-header">PERSONAL INFORMATION</td>
                                <td rowspan="6" class="photo-box"></td>
                            </tr>
                            <tr>
                                <td><strong>NAME:</strong></td>
                                <td colspan="3">${studentName.toUpperCase()}</td>
                            </tr>
                            <tr>
                                <td><strong>ID Number:</strong></td>
                                <td>${requestToPrint.User?.idNumber || 'N/A'}</td>
                                <td><strong>Civil Status:</strong></td>
                                <td>${personalInfo.civilStatus}</td>
                            </tr>
                            <tr>
                                <td><strong>Date of Birth:</strong></td>
                                <td>${personalInfo.dateOfBirth}</td>
                                <td><strong>Place of Birth:</strong></td>
                                <td>${personalInfo.placeOfBirth}</td>
                            </tr>
                             <tr>
                                <td><strong>Parent/Guardian:</strong></td>
                                <td colspan="3">${personalInfo.parentGuardian}</td>
                            </tr>
                             <tr>
                                <td><strong>Permanent Address:</strong></td>
                                <td colspan="3">${personalInfo.permanentAddress}</td>
                            </tr>
                            <tr>
                                <td><strong>Previous School:</strong></td>
                                <td colspan="2">${personalInfo.previousSchool}</td>
                                <td><strong>Course:</strong></td>
                                <td>${studentCourse}</td>
                            </tr>
                        </table>

                        <table class="info-table">
                            <tr><td colspan="3" class="section-header">EDUCATIONAL DATA</td></tr>
                            <tr>
                                <th>COURSE</th>
                                <th>NAME & ADDRESS OF SCHOOL</th>
                                <th>DATE GRADUATED</th>
                            </tr>
                            <tr>
                                <td>Elementary</td>
                                <td>${educationalData.elementary.name}</td>
                                <td>${educationalData.elementary.year}</td>
                            </tr>
                            <tr>
                                <td>Secondary</td>
                                <td>${educationalData.secondary.name}</td>
                                <td>${educationalData.secondary.year}</td>
                            </tr>
                        </table>

                        ${gradesData.map(sem => `
                        <div class="semester-grades">
                            <p><strong>${sem.semester}, SY ${sem.year}</strong></p>
                            <table class="grades-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sem.subjects.map(sub => `
                                        <tr>
                                            <td>${sub.code}</td>
                                            <td>${sub.desc}</td>
                                            <td>${sub.grade}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        `).join('')}
                        
                        <div class="remarks-section">
                            <p><strong>REMARKS:</strong> FOR EVALUATION PURPOSES ONLY.</p>
                            <p class="date-issued"><strong>DATE ISSUED:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div class="signature-section">
                            <div>
                                <p>Prepared by:</p>
                                <p class="signature-name">JUSTINE M. SUCOANG</p>
                                <p class="signature-title">Records-in-Charge</p>
                            </div>
                            <div>
                                <p>Certified by:</p>
                                <p class="signature-name">MARIA FERPETUA G. SAURA</p>
                                <p class="signature-title">College Registrar</p>
                            </div>
                        </div>
                        <p class="footer-note">Not valid without school seal</p>
                    </div>
                `;
                break;

                case 'DIPLOMA':
                printContent = `
                    <div class="diploma-container">
                        <div class="diploma-header">
                            <img src="/bc.png" alt="Logo" class="diploma-logo">
                            <h1>BENEDICTO COLLEGE</h1>
                            <p class="motto">Your Education... Our Mission</p>
                            <p class="address">A.S. Fortuna Street, Bakilid, Mandaue City</p>
                        </div>
                        <div class="diploma-body">
                            <p class="salutation">To All Persons Who May Behold These Present</p>
                            <p class="body-text">
                                Be it known that the Board of Directors of the Benedicto College, by authority of the Republic of the Philippines and upon the recommendation of the Academic Council, confers upon
                            </p>
                            <p class="student-name">${studentName.toUpperCase()}</p>
                            <p class="degree-intro">the Degree of</p>
                            <p class="degree-name">${studentCourse}</p>
                            <p class="body-text">
                                with all the rights, honors, privileges, as well as the obligations and responsibilities thereunto appertaining.
                            </p>
                            <p class="body-text last-paragraph">
                                In witness whereof, the seal of Benedicto College and the signatures of the President, School Director, Department Dean and the Registrar are hereunto affixed.
                            </p>
                            <p class="given-at">
                                Given in Mandaue City, Philippines, ${diplomaDetails.graduationDate}.<br>
                                Special Order (B)(R-VII) ${diplomaDetails.specialOrder}.
                            </p>
                        </div>
                        <div class="signature-grid">
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.dean}</p>
                                <p class="signature-title">Dean, College of Business and Management</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.registrar}</p>
                                <p class="signature-title">Registrar</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.schoolDirector}</p>
                                <p class="signature-title">School Director</p>
                            </div>
                            <div class="signature-box">
                                <p class="signature-name">${diplomaDetails.president}</p>
                                <p class="signature-title">President</p>
                            </div>
                        </div>
                    </div>
                `;
                break;

            default:
                printContent = `<h1>${requestToPrint.documentType}</h1><p>Template for this document is not yet available.</p>`;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Transcript of Records</title>
                    <style>
                        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
                        .tor-container { max-width: 8.5in; margin: auto; padding: 0.5in; }
                        .tor-header { text-align: center; margin-bottom: 20px; }
                        .tor-logo { width: 70px; height: 70px; margin-bottom: 10px; }
                        .tor-header h2, .tor-header h3, .tor-header p { margin: 0; line-height: 1.2; }
                        .tor-header h2 { font-size: 16pt; }
                        .tor-header h3 { font-size: 14pt; margin-top: 5px; }
                        .tor-header p { font-size: 10pt; }
                        .info-table, .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
                        .info-table td, .info-table th { border: 1px solid black; padding: 4px 8px; }
                        .info-table th { text-align: center; }
                        .grades-table td, .grades-table th { border: 1px solid black; padding: 4px 8px; text-align: left; }
                        .grades-table th { text-align: center; background-color: #f2f2f2; }
                        .section-header { text-align: center; font-weight: bold; background-color: #f2f2f2; }
                        .photo-box { width: 1.5in; height: 1.5in; border: 1px solid black; }
                        .semester-grades { margin-top: 15px; }
                        .semester-grades p { margin: 0 0 5px 0; font-weight: bold; }
                        .remarks-section { margin-top: 30px; font-size: 10pt; }
                        .date-issued { float: right; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
                        .signature-section p { margin: 0; }
                        .signature-name { font-weight: bold; margin-top: 30px; }
                        .signature-title { border-top: 1px solid black; padding-top: 2px; }
                        .footer-note { font-style: italic; font-size: 9pt; margin-top: 30px; }
                        
                        @import url('https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@400;700&family=Playfair+Display:wght@700&display=swap');
                        .diploma-container { max-width: 11in; min-height: 8.5in; margin: auto; padding: 1in; box-sizing: border-box; text-align: center; border: 2px solid #333; position: relative; }
                        .diploma-header { margin-bottom: 30px; }
                        .diploma-logo { width: 80px; height: 80px; }
                        .diploma-header h1 { font-family: 'Old Standard TT', serif; font-size: 24pt; font-weight: 700; margin: 0; color: #003366; }
                        .diploma-header .motto, .diploma-header .address { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 0; }
                        .diploma-body p { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
                        .salutation { font-style: italic; }
                        .body-text { margin: 15px 40px; }
                        .last-paragraph { margin-bottom: 25px; }
                        .student-name { font-family: 'Playfair Display', serif; font-size: 28pt; font-weight: 700; margin: 15px 0; }
                        .degree-intro { font-size: 11pt; }
                        .degree-name { font-family: 'Old Standard TT', serif; font-size: 18pt; font-weight: 700; margin: 5px 0 15px 0; }
                        .given-at { font-size: 10pt; }
                        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; margin-top: 40px; }
                        .signature-box { text-align: center; }
                        .signature-name { font-family: 'Times New Roman', serif; font-weight: bold; font-size: 11pt; margin-top: 25px; margin-bottom: 0; border-bottom: 1px solid #000; padding-bottom: 2px;}
                        .signature-title { font-size: 10pt; }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        setTimeout(() => { 
                            window.print(); 
                            window.close(); 
                        }, 250);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    } catch(err) {
        console.error("Error during print process:", err);
        setError(`Failed to print and update status: ${err.message}`);
    }
  };
  
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-success';
            case 'pending': return 'bg-warning text-dark';
            case 'rejected': return 'bg-danger';
            case 'ready for pick-up': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container-fluid">
        <h2 className="mb-4">Request Management</h2>
        <div className="card shadow-sm">
            <div className="card-body">
                <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
                    <table className="table table-hover">
                        <thead className="table-dark sticky-top">
                            <tr><th>ID</th><th>Student</th><th>Doc Type</th><th>Purpose</th><th>Status</th><th>Notes</th><th>Document</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.id}</td><td>{req.User?.idNumber || 'N/A'}</td><td>{req.documentType}</td><td>{req.purpose}</td>
                                    <td><span className={`badge ${getStatusBadge(req.status)}`}>{req.status.replace(/_/g, ' ')}</span></td>
                                    <td>{req.notes || 'N/A'}</td>
                                    <td>{req.filePath && req.filePath.length > 0 ? (
                                      <button
                                        className="btn btn-sm btn-info"
                                        onClick={(e) => {
                                        // First, check for permissions from handleViewClick
                                        if (!isAdmin) {
                                        e.preventDefault();
                                        return;
                                        }
                                        // If permissions are okay, then open the document
                                        handleViewDocument(req);
                                      }}
                                      >View</button>) : 'N/A'}</td>

                                    <td>
                                      <div className="d-flex">
                                        {req.status === 'pending' && (
                                          <>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => handleApproveOrReject(req.id, 'approved')}>Approve</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleApproveOrReject(req.id, 'rejected')}>Reject</button>
                                          </>
                                        )}
                                        {req.status === 'approved' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => handlePrint(req)} disabled={isReadOnly}>
                                              Print
                                            </button>
                                        )}
                                        {req.status === 'ready for pick-up' && (
                                            <button className="btn btn-sm btn-secondary" onClick={() => handlePrint(req)} disabled={isReadOnly}>
                                              Reprint
                                            </button>
                                        )}
                                      </div>
                                    </td>
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
export default RequestManagementView;