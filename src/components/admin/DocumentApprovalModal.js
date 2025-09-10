import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getSessionToken } from '../../utils/api';

// The generateDocumentContent function remains the same and is omitted for brevity...
const generateDocumentContent = (request) => {
    if (!request) return '';

    // --- Placeholder data from old code ---
    const personalInfo = { civilStatus: 'Single', dateOfBirth: 'January 23, 2006', placeOfBirth: 'Mandaue City, Cebu', parentGuardian: 'Maria Dela Cruz', permanentAddress: 'Sangi, Cal-oocan, Mandaue City', previousSchool: 'Mandaue City Science High School' };
    const educationalData = { elementary: { name: 'Mabolo Elementary School', year: '2018' }, secondary: { name: 'Cebu Eastern College', year: '2022' } };
    const gradesData = [
        { semester: 'First Year, First Semester', year: '2024-2025', subjects: [ { code: 'IT 111', desc: 'Introduction to Computing', grade: '1.5', units: 3 }, { code: 'GE 1', desc: 'Understanding the Self', grade: '1.2', units: 3 }, { code: 'FIL 1', desc: 'Komunikasyon sa Akademikong Filipino', grade: '1.7', units: 3 }, { code: 'NSTP 1', desc: 'National Service Training Program 1', grade: 'P', units: 3 } ]},
        { semester: 'First Year, Second Semester', year: '2024-2025', subjects: [ { code: 'IT 121', desc: 'Computer Programming 1', grade: '1.8', units: 3 }, { code: 'IT 122', desc: 'Data Structures and Algorithms', grade: '2.0', units: 3 }, { code: 'GE 5', desc: 'Purposive Communication', grade: '1.5', units: 3 }, { code: 'NSTP 2', desc: 'National Service Training Program 2', grade: 'P', units: 3 } ]}
    ];
    const diplomaDetails = { dean: "JAYPEE Y. ZOILO, DBA", schoolDirector: "RANULFO L. VISAYA JR., DevEdD.", registrar: "WENELITO M. LAYSON", president: "LILIAN BENEDICTO-HUAN", graduationDate: "this 26th day of May 2022", specialOrder: "No. 30-346201-0196, s. 2022 dated December 15, 2022" };

    // Helper variables...
    const studentName = request.student ? `${request.student.lastName}, ${request.student.firstName} ${request.student.middleName || ''}`.trim() : 'Juan Dela Cruz';
    const studentIdNumber = request.student?.idNumber || 'N/A';
    const studentCourse = request.student?.studentDetails?.course?.name || 'Bachelor of Science in Information Technology';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const academicYear = '2024-2025';

    switch (request.documentType.toUpperCase()) {
        
        case 'GOOD MORAL FOR GRADUATES':
            return `
                <style>
                    .good-moral-preview { font-family: serif; }
                    .good-moral-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .good-moral-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .good-moral-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .good-moral-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .good-moral-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: center; }
                    .good-moral-preview .signature-block { margin-top: 80px; text-align: center; padding: 85px; }
                </style>
                <div class="good-moral-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATE OF GOOD MORAL CHARACTER</div>
                        <p class="date">${today}</p>
                        <p class="body-text">THIS IS TO CERTIFY THAT <b>${studentName}</b>, was graduate of the degree of <b>${studentCourse}</b> on "Date Here" with Special
                        Order No. 50-5140101-0135 s. 2025 issued by the Commission on Higher Education on ${today}</p>

                        <p class="body-text1">During his/her stay in Benedicto College, he/she did not commit any infraction against the school's
                        rules and regulations nor was he/she involved in any immoral illegal activity that would mar his/her reputation as a person.</p>

                        <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>
                        <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p><p>School Registrar</p></div>
                    </div>
                </div>
            `;
    case 'GOOD MORAL FOR NON-GRADUATES':
            return `
                <style>
                    .good-moral-preview { font-family: serif; }
                    .good-moral-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .good-moral-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .good-moral-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .good-moral-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .good-moral-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: center; }
                    .good-moral-preview .signature-block { margin-top: 80px; text-align: center; padding: 85px; }
                </style>
                <div class="good-moral-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATE OF GOOD MORAL CHARACTER</div>
                        <p class="date">${today}</p>
                        <p class="body-text">THIS IS TO CERTIFY THAT <b>${studentName}</b>, was enrolled in the <b>${studentCourse}</b> during the
                        first semester of School Year Here</p>

                        <p class="body-text1">During his/her stay in Benedicto College, he/she did not commit any infraction against the school's
                        rules and regulations nor was he/she involved in any immoral illegal activity that would mar his/her reputation as a person.</p>

                        <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>
                        <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p><p>School Registrar</p></div>
                    </div>
                </div>
            `;

        case 'GRADE SLIP':
             const currentSemesterGrades = gradesData[0];
             let totalUnits = 0, totalWeight = 0;
             currentSemesterGrades.subjects.forEach(sub => {
                 const grade = parseFloat(sub.grade);
                 totalUnits += sub.units;
                 if (!isNaN(grade)) { totalWeight += grade * sub.units; }
             });
             const weightedAverage = totalWeight > 0 ? (totalWeight / totalUnits).toFixed(4) : 'N/A';
            return `
                <style>
                     .gradeslip-preview { font-family: Arial, sans-serif; }
                     .gradeslip-preview .gradeslip-container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ccc; }
                     .gradeslip-preview .gradeslip-header { 
                     display: flex; 
                     align-items: center; 
                     justify-content: center;
                     gap:40px;
                     text-align: center; 
                     border-bottom: 2px solid black; 
                     padding-bottom: 10px; 
                     margin-bottom: 20px; 
                     }
                     .gradeslip-preview .logo { width: 60px; height: 60px; }
                     .gradeslip-preview h2, .gradeslip-preview p, .gradeslip-preview h3 { margin: 0; line-height: 1.2; }
                     .gradeslip-preview .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; font-size: 11pt; }
                     .gradeslip-preview .info-table td { padding: 5px; }
                     .gradeslip-preview .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                     .gradeslip-preview .grades-table th, .gradeslip-preview .grades-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                     .gradeslip-preview .grades-table thead { background-color: #f2f2f2; }
                     .gradeslip-preview .text-center { text-align: center; }
                     .gradeslip-preview .text-right { text-align: right; }
                </style>
                <div class="gradeslip-preview">
                    <div class="gradeslip-container">
                        <div class="gradeslip-header"><img src="/bc.png" alt="Logo" class="logo"><div><h2>BENEDICTO COLLEGE</h2><p>A.S. Fortuna Street, Mandaue City</p><h3>GRADE SLIP</h3></div><img src="/bc.png" alt="Logo" class="logo"></div>
                        <table class="info-table">
                            <tr><td><strong>STUDENT NAME:</strong></td><td>${studentName.toUpperCase()}</td><td><strong>STUDENT ID:</strong></td><td>${studentIdNumber}</td></tr>
                            <tr><td><strong>COURSE:</strong></td><td>${studentCourse}</td><td><strong>ACADEMIC YEAR:</strong></td><td>${currentSemesterGrades.year}</td></tr>
                            <tr><td><strong>SEMESTER:</strong></td><td colspan="3">${currentSemesterGrades.semester}</td></tr>
                        </table>
                        <table class="grades-table">
                            <thead><tr><th>CODE</th><th>DESCRIPTION</th><th>UNITS</th><th>GRADE</th></tr></thead>
                            <tbody>${currentSemesterGrades.subjects.map(sub => `<tr><td>${sub.code}</td><td>${sub.desc}</td><td class="text-center">${sub.units}</td><td class="text-center">${sub.grade}</td></tr>`).join('')}</tbody>
                            <tfoot><tr><td colspan="2" class="text-right"><strong>TOTAL UNITS:</strong></td><td class="text-center"><strong>${totalUnits}</strong></td><td></td></tr><tr><td colspan="2" class="text-right"><strong>WEIGHTED AVERAGE:</strong></td><td colspan="2" class="text-center"><strong>${weightedAverage}</strong></td></tr></tfoot>
                        </table>
                    </div>
                </div>
            `;
        case 'GWA CERTIFICATE':
            return `
                <style>
                    .gwaCert-preview { font-family: serif; }
                    .gwaCert-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .gwaCert-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .gwaCert-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .gwaCert-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .gwaCert-preview .signature-block { margin-top: 80px; text-align: center; padding: 85px; }
                </style>
                <div class="gwaCert-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATION</div>
                        
                        <p class="body-text">This is to certify that according to the records available in this office, <b>${studentName}</b>, was conferred the degree <b>${studentCourse}</b> 
                        during the graduation ceremony help on "INSERT DATE HERE" with Special Order No. 50-5140101-0135 s. 2025 issued by the Commission on Higher Education on ${today}
                        at the Benedicto College, Inc., Mandaue City, Cebu. This is to certify further that she received a <b>General Weighted Average</b> of <b>"Insert Grade Here"</b></p>

                        <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>

                        <p class="body-text1">Issued on the "INSERT DATE HERE", at Mandaue City,Cebu.</p>
                        <div class="signature-block"><p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p><p>School Registrar</p></div>
                    </div>
                </div>
            `;
        
        case 'TOR':
            const torHTML = `
                <div class="tor-container">
                    <div class="tor-header">
                        <img src="/bc.png" alt="Logo" class="tor-logo">
                        <h2>BENEDICTO COLLEGE</h2><p>A.S. Fortuna Street, Mandaue City 6014, Cebu, Philippines</p>
                        <h3>OFFICIAL TRANSCRIPT OF RECORDS</h3>
                    </div>
                    <table class="info-table">
                        <tr><td colspan="4" class="section-header">PERSONAL INFORMATION</td><td rowspan="6" class="photo-box">1.5x1.5<br>PHOTO</td></tr>
                        <tr><td><strong>NAME:</strong></td><td colspan="3">${studentName.toUpperCase()}</td></tr>
                        <tr><td><strong>ID Number:</strong></td><td>${studentIdNumber}</td><td><strong>Civil Status:</strong></td><td>${personalInfo.civilStatus}</td></tr>
                        <tr><td><strong>Date of Birth:</strong></td><td>${personalInfo.dateOfBirth}</td><td><strong>Place of Birth:</strong></td><td>${personalInfo.placeOfBirth}</td></tr>
                        <tr><td><strong>Parent/Guardian:</strong></td><td colspan="3">${personalInfo.parentGuardian}</td></tr>
                        <tr><td><strong>Permanent Address:</strong></td><td colspan="3">${personalInfo.permanentAddress}</td></tr>
                        <tr><td><strong>Previous School:</strong></td><td colspan="2">${personalInfo.previousSchool}</td><td><strong>Course:</strong></td><td>${studentCourse}</td></tr>
                    </table>
                    <table class="info-table">
                        <tr><td colspan="3" class="section-header">EDUCATIONAL DATA</td></tr>
                        <tr><th>COURSE</th><th>NAME & ADDRESS OF SCHOOL</th><th>DATE GRADUATED</th></tr>
                        <tr><td>Elementary</td><td>${educationalData.elementary.name}</td><td>${educationalData.elementary.year}</td></tr>
                        <tr><td>Secondary</td><td>${educationalData.secondary.name}</td><td>${educationalData.secondary.year}</td></tr>
                    </table>
                    ${gradesData.map(sem => `
                        <div class="semester-grades">
                            <p><strong>${sem.semester}, SY ${sem.year}</strong></p>
                            <table class="grades-table">
                                <thead><tr><th>Code</th><th>Description</th><th>Grade</th><th>Units</th></tr></thead>
                                <tbody>${sem.subjects.map(sub => `<tr><td>${sub.code}</td><td>${sub.desc}</td><td>${sub.grade}</td><td>${sub.units}</td></tr>`).join('')}</tbody>
                            </table>
                        </div>
                    `).join('')}
                    <div class="remarks-section"><p><strong>REMARKS:</strong> FOR EVALUATION PURPOSES ONLY.</p><p class="date-issued"><strong>DATE ISSUED:</strong> ${today}</p></div>
                    <div class="signature-section">
                        <div><p>Prepared by:</p><p class="signature-name">JUSTINE M. SUCGANG</p><p class="signature-title">Records-in-Charge</p></div>
                        <div><p>Certified by:</p><p class="signature-name">WENELITO M. LAYSON</p><p class="signature-title">College Registrar</p></div>
                    </div>
                    <p class="footer-note">Not valid without school seal</p>
                </div>
            `;
            const torCSS = `
                .tor-preview { font-family: Arial, sans-serif; font-size: 11pt; }
                .tor-preview .tor-container { max-width: 8.5in; margin: auto; padding: 0.5in; }
                .tor-preview .tor-header { text-align: center; margin-bottom: 20px; }
                .tor-preview .tor-logo { width: 70px; height: 70px; margin-bottom: 10px; }
                .tor-preview .tor-header h2, .tor-preview .tor-header h3, .tor-preview .tor-header p { margin: 0; line-height: 1.2; }
                .tor-preview .tor-header h2 { font-size: 16pt; }
                .tor-preview .tor-header h3 { font-size: 14pt; margin-top: 5px; }
                .tor-preview .tor-header p { font-size: 10pt; }
                .tor-preview .info-table, .tor-preview .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
                .tor-preview .info-table td, .tor-preview .info-table th { border: 1px solid black; padding: 4px 8px; }
                .tor-preview .info-table th { text-align: center; }
                .tor-preview .grades-table td, .tor-preview .grades-table th { border: 1px solid black; padding: 4px 8px; text-align: left; }
                .tor-preview .grades-table th { text-align: center; background-color: #f2f2f2; }
                .tor-preview .section-header { text-align: center; font-weight: bold; background-color: #f2f2f2; }
                .tor-preview .photo-box { width: 1.5in; height: 1.5in; border: 1px solid black; text-align: center; vertical-align: middle; }
                .tor-preview .semester-grades { margin-top: 15px; page-break-inside: avoid; }
                .tor-preview .semester-grades p { margin: 0 0 5px 0; font-weight: bold; }
                .tor-preview .remarks-section { margin-top: 30px; font-size: 10pt; }
                .tor-preview .date-issued { float: right; }
                .tor-preview .signature-section { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
                .tor-preview .signature-section p { margin: 0; }
                .tor-preview .signature-name { font-weight: bold; margin-top: 30px; }
                .tor-preview .signature-title { border-top: 1px solid black; padding-top: 2px; }
                .tor-preview .footer-note { font-style: italic; font-size: 9pt; margin-top: 30px; }
            `;
            return `<style>${torCSS}</style><div class="tor-preview">${torHTML}</div>`;

        case 'DIPLOMA':
            return `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Old+Standard+TT:wght@400;700&family=Roboto:wght@400;500&display=swap');
                    .diploma-preview { 
                        font-family: 'Times New Roman', serif; 
                        color: #333;
                    }
                    .diploma-container {
                        max-width: 11in;
                        min-height: 8.5in;
                        margin: auto;
                        padding: 1in;
                        text-align: center;
                        border: 10px double #666;
                        background-color: #fcfcfc;
                    }
                    .diploma-header { margin-bottom: 30px; }
                    .diploma-logo { width: 90px; margin-bottom: 10px; }
                    .diploma-header h1 { 
                        font-family: 'Playfair Display', serif;
                        font-size: 28pt;
                        letter-spacing: 2px;
                        margin: 0;
                    }
                    .diploma-header .motto { font-style: italic; margin: 5px 0; }
                    .diploma-header .address { font-size: 10pt; }
                    
                    .diploma-body p { margin: 15px 0; }
                    .salutation { font-family: 'Old Standard TT', serif; font-size: 16pt; }
                    .body-text { font-size: 12pt; line-height: 1.6; text-align: justify; }
                    .last-paragraph { margin-top: 30px; }
                    
                    .student-name {
                        font-family: 'Playfair Display', serif;
                        font-size: 26pt;
                        font-weight: 700;
                        margin: 20px 0 !important;
                    }
                    .degree-intro { font-size: 14pt; }
                    .degree-name {
                        font-family: 'Old Standard TT', serif;
                        font-size: 20pt;
                        font-weight: 700;
                        margin: 20px 0 !important;
                    }
                    .given-at { font-size: 11pt; margin-top: 30px; }

                    .signature-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px 50px;
                        margin-top: 50px;
                        text-align: center;
                    }
                    .signature-box { padding-top: 10px; }
                    .signature-name {
                        font-family: 'Roboto', sans-serif;
                        font-weight: 500;
                        font-size: 11pt;
                        margin-bottom: 2px !important;
                    }
                    .signature-title {
                        font-size: 10pt;
                        border-top: 1px solid #333;
                        padding-top: 5px;
                        margin-top: 0 !important;
                    }
                </style>
                <div class="diploma-preview">
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
                </div>
            `;
        
        case 'CERTIFICATE OF ENROLLMENT':
            return `
            <style>
                    .certificateofEnrollment-preview { font-family: serif; }
                    .certificateofEnrollment-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .certificateofEnrollment-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .certificateofEnrollment-preview .date { text-align: right; margin-top: 10px; padding-bottom: 55px; }
                    .certificateofEnrollment-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .certificateofEnrollment-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: center; }
                    .certificateofEnrollment-preview .signature-block { margin-top: 80px; text-align: right; padding: 85px; }
                </style>
                <div class="certificateofEnrollment-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATION</div>
                        
                        <p class="body-text">This is to certify that according to our records <b>${studentName}</b>, is officially enrolled as a "Year lvl here" in the <b>${studentCourse}</b> 
                        program of Benedicto College Inc. this 1st Semester of School Year 2025-2026.</p>


                        <p class="body-text1">This certification is issued upon the request of the above mentioned graduate for <b>${request.purpose}</b> purposes only.</p>

                        <p class="body-text1">Issued this 3rd day of September, 2025 at Mandaue City, Cebu, Philippines.</p>
                        <div class="signature-block">
                            <div style="display:inline-block;text-align:center;">
                                <p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p>
                                <p style="margin:0;text-align:center;">School Registrar</p>
                            </div>
                        </div>
                    </div>
                </div>`

        case 'CERTIFICATE OF GRADUATION':
            return `
            <style>
                    .certificateofGraduation-preview { font-family: serif; }
                    .certificateofGraduation-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .certificateofGraduation-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .certificateofGraduation-preview .body-text2 { text-align: left; margin-top: 10px; padding-bottom: 25px; font-size: 14pt;}
                    .certificateofGraduation-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .certificateofGraduation-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: center; }
                    .certificateofGraduation-preview .signature-block { margin-top: 80px; text-align: right; padding: 85px; }
                </style>
                <div class="certificateofGraduation-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATION</div>
                        <p class="body-text2">To Whom it May Concern:</p>

                        <p class="body-text">This is to certify that <b>${studentName}</b> satisfactorily completed the four-year course
                        in College of Computer Studies at Benedicto College, Inc. leading to the degree of <b>${studentCourse}</b> in accordance 
                        with the policies and standards of the <b>Commission on Higher Education (CHED)</b>, and the requirements prescribed by
                        the institution. The degree was conferred on him/her on "Date of Graduation here".</p>


                        <p class="body-text1">This certification is issued upon the request for <b>${request.purpose}</b> purposes only.</p>

                        <p class="body-text1">Given this 3rd day of September, 2025 at the Benedicto College, Inc. Mandaue City, Cebu.</p>
                        <div class="signature-block">
                            <div style="display:inline-block;text-align:center;">
                                <p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p>
                                <p style="margin:0;text-align:center;">School Registrar</p>
                            </div>
                        </div>
                    </div>
                </div>`
        case 'CERTIFICATE OF GRADUATION WITH HONORS':
            return `
            <style>
                    .certificateofGraduation-preview { font-family: serif; }
                    .certificateofGraduation-preview .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 0px;
                    }
                    .print-container {
                    padding:15px;
                    }
                    .certificateofGraduation-preview .cert-title {
                        text-align: center;
                        font-size: 20pt;
                        font-weight: bold;
                        margin: 18px 0 10px 0;
                        letter-spacing: 2px;
                        padding: 80px 20px 80px 20px;
                    }
                    .certificateofGraduation-preview .body-text { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .certificateofGraduation-preview .body-text1 { line-height: 1.8; text-indent: 40px; margin-top: 20px; font-size: 14pt; text-align: left; }
                    .certificateofGraduation-preview .signature-block { margin-top: 80px; text-align: right; padding: 85px; }
                </style>
                <div class="certificateofGraduation-preview">
                    <div class="print-container">
                        <div class="header-row">
                            <div class="headerlogo"><img src="/bcformat.png" alt="Logo" style="width:100%;height:100%"></div>
                        </div>
                        <div class="cert-title">CERTIFICATION</div>

                        <p class="body-text"><b>THIS IS TO CERTIFY</b> that according to the records available in this office,<b>${studentName}</b> was conferred
                        the degree of <b>${studentCourse}</b> on "INSERT DATE HERE" at the Benedicto College A.S Fortuna St. Mandaue City.</p>


                        <p class="body-text1">This is to certify further that she received an academic award for being a "INSERT LATIN HONORS HERE".</p>

                        <p class="body-text1">This certification is issued upon the request of the above mentioned student for whatever legal purposes it may
                        serve him/her.</p>

                         <p class="body-text1">Issued on the "INSERT DATE HERE", at Mandaue City, Cebu.</p>
                        <div class="signature-block">
                            <div style="display:inline-block;text-align:center;">
                                <p style="border-bottom:1px solid #222;display:inline-block;padding:0 40px 2px 40px;"><b>WENELITO M. LAYSON</b></p>
                                <p style="margin:0;text-align:center;">School Registrar</p>
                            </div>
                        </div>
                    </div>
                </div>`

        default:
            return `<div style="font-family: sans-serif; padding: 20px;"><h1 style="color: #dc3545;">Template Not Available</h1><p>A template for "<strong>${request.documentType}</strong>" has not been created.</p></div>`;
    }

};

function DocumentApprovalForm() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const previewRef = useRef(null);
    const selectionRef = useRef(null);

    // Removed font/size UI controls per request

    useEffect(() => {
        const fetchRequestDetails = async () => {
            if (!requestId) return;
            setLoading(true);
            try {
                // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
                const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, { headers: { 'X-Session-Token': getSessionToken() } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch');
                setRequest(data);
                setContent(generateDocumentContent(data));
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchRequestDetails();
    }, [requestId]);
    
    useEffect(() => {
        if (previewRef.current) {
            previewRef.current.contentEditable = isEditing;
            if (isEditing) {
                previewRef.current.focus();
            }
        }
    }, [isEditing]);

    // Removed local font enumeration per request

    // Preserve selection when toolbar is used
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            selectionRef.current = selection.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (selection && selectionRef.current) {
            selection.removeAllRanges();
            selection.addRange(selectionRef.current);
        }
    };

    const exec = (command, value = null) => {
        restoreSelection();
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(command, false, value);
        saveSelection();
        // Sync content state while editing so Save captures latest
        if (previewRef.current) setContent(previewRef.current.innerHTML);
    };

    // Removed font/size apply helpers per request

    const handleFinalizeAndPrint = async () => {
        if (!request) return;
        try {
            // --- FIX: Changed 'Authorization' header to 'X-Session-Token' ---
            await fetch(`${API_BASE_URL}/requests/${request.id}`, { 
                method: 'PATCH', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-Session-Token': getSessionToken() 
                }, 
                body: JSON.stringify({ status: 'ready for pick-up', notes: 'Document is ready.' }) 
            });
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>Print</title></head><body>${content}</body><script>setTimeout(() => { window.print(); window.close(); }, 250);</script></html>`);
            printWindow.document.close();
            navigate('/admin/requests');
        } catch (err) { alert(`Failed to print: ${err.message}`); }
    };
    
    const handleToggleEdit = () => {
        if (isEditing && previewRef.current) {
            setContent(previewRef.current.innerHTML);
        }
        setIsEditing(!isEditing);
    };
    
    if (loading) return <p className="text-center mt-5">Loading document...</p>;
    if (error) return <div className="alert alert-danger mx-3">Error: {error}</div>;

    return (
        <div className="container-fluid my-4">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Approve and Preview: {request?.documentType}</h5>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        &larr; Back to Requests
                    </button>
                </div>
                <div className="card-body">
                    {isEditing && (
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
                            <button type="button" className="btn btn-sm btn-outline-dark me-1 fw-bold" title="Bold" onClick={() => exec('bold')}>B</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-1 fst-italic" title="Italic" onClick={() => exec('italic')}>I</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-2 text-decoration-underline" title="Underline" onClick={() => exec('underline')}>U</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-2" title="Strikethrough" onClick={() => exec('strikeThrough')}>ab</button>
                            <button type="button" className="btn btn-sm btn-outline-dark me-1" title="Subscript" onClick={() => exec('subscript')}>x<sub>2</sub></button>
                            <button type="button" className="btn btn-sm btn-outline-dark" title="Superscript" onClick={() => exec('superscript')}>x<sup>2</sup></button>
                        </div>
                    )}
                    <div 
                        ref={previewRef}
                        className="border p-4" 
                        style={{ 
                            minHeight: '60vh', 
                            backgroundColor: '#f8f9fa', 
                            overflow: 'auto',
                            outline: isEditing ? '2px solid #0d6efd' : 'none',
                            cursor: isEditing ? 'text' : 'default'
                        }}
                        onKeyUp={saveSelection}
                        onMouseUp={saveSelection}
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </div>
                <div className="card-footer text-end">
                    <button className={`btn me-2 ${isEditing ? 'btn-success' : 'btn-secondary'}`} onClick={handleToggleEdit}>
                        {isEditing ? 'Save Changes' : 'Edit Document'}
                    </button>
                    
                    {!isEditing && (
                        <button className="btn btn-primary" onClick={handleFinalizeAndPrint}>
                            Finalize and Print
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DocumentApprovalForm;