// This file holds the dummy data generators.

export const createDummyRegistrations = () => {
    const registrations = [];
    const firstNames = ["Juan", "Maria", "Jose", "Anna", "Luis", "Sofia", "Carlos", "Isabella", "Miguel", "Camila"];
    const lastNames = ["Dela Cruz", "Garcia", "Reyes", "Santos", "Ramos", "Mendoza", "Gonzales", "Flores", "Villanueva", "Lim"];
    const courses = ["BSIT", "BSCS", "BSBA-HRDM", "BSED-EN", "BS-ARCH"];

    for (let i = 1; i <= 10; i++) {
        registrations.push({
            id: i, regNo: `2024-P${1000 + i}`, name: `${lastNames[i-1]}, ${firstNames[i-1]} M.`, date: new Date(2024, 5, i).toISOString().split('T')[0], status: 'pending', course: courses[i % 5], gender: i % 2 === 0 ? 'Male' : 'Female'
        });
    }
    for (let i = 1; i <= 20; i++) {
        registrations.push({
            id: 10 + i, regNo: `2024-A${2000 + i}`, name: `${lastNames[i % 10]}, ${firstNames[(i + 1) % 10]} S.`, date: new Date(2024, 4, i).toISOString().split('T')[0], status: 'approved', course: courses[i % 5], gender: i % 2 === 0 ? 'Male' : 'Female'
        });
    }
    return registrations;
};

export const dummySubjects = [
    { code: 'IT223', description: 'Information Management', units: 3, schedule: '08:00 AM - 10:30 AM', days: 'MTWTH', room: '314', prereq: 'IT222' },
    { code: 'FILI1', description: 'The Philippine Society in the IT Era', units: 3, schedule: '10:30 AM - 12:00 PM', days: 'TF', room: '210', prereq: null },
    { code: 'IT324', description: 'Social Issues and Professional Practices', units: 3, schedule: '01:00 PM - 02:30 PM', days: 'MW', room: '401', prereq: 'IT223' },
    { code: 'IT325', description: 'Quantitative Methods', units: 3, schedule: '02:30 PM - 04:00 PM', days: 'TF', room: '401', prereq: 'MATH101' },
];

// FIX: Added dummy data generator for subject schedules
export const createDummySubjectSchedules = () => {
  const subjects = [
    { code: 'BC100', description: 'Basic Computing' },
    { code: 'BL', description: 'Business Law' },
    { code: 'CE400', description: 'Civil Engineering Fundamentals' },
    { code: 'EE400', description: 'Electrical Engineering Fundamentals' },
    { code: 'FBS101', description: 'Food & Beverage Service' },
    { code: 'FILIT', description: 'Filipino sa Iba\'t Ibang Disiplina' },
    { code: 'IT223', description: 'Information Management' },
    { code: 'ENG101', description: 'English Composition' },
    { code: 'MATH201', description: 'Advanced Mathematics' },
    { code: 'PHY101', description: 'General Physics' }
  ];

  const days = ['MTWTHF', 'TTH', 'MWF', 'T', 'F'];
  const times = ['10:00AM - 12:00PM', '01:00PM - 03:00PM', '03:00PM - 05:00PM', '09:00AM - 12:00PM', '12:30PM - 02:30PM', '11:30AM - 02:30PM'];
  const rooms = ['308', '307', '312', '309', '314', '401', '402'];

  return subjects.map((subject, index) => ({
    id: index + 1,
    subject: subject.code,
    description: subject.description,
    days: days[index % days.length],
    time: times[index % times.length],
    room: rooms[index % rooms.length],
    enrollees: Math.floor(Math.random() * 50) + 1,
  }));
};

// FIX: Added function to generate dummy data for school years and semesters
export const createDummySchoolYears = () => {
    return [
        { id: 1, schoolYear: '2024 - 2025', semester: 'Summer', status: 'Current' },
        { id: 2, schoolYear: '2024 - 2025', semester: '2nd Semester', status: 'Open' },
        { id: 3, schoolYear: '2024 - 2025', semester: '1st Semester', status: 'Open' },
        { id: 4, schoolYear: '2023 - 2024', semester: 'Summer', status: 'Closed' },
        { id: 5, schoolYear: '2023 - 2024', semester: '2nd Semester', status: 'Closed' },
        { id: 6, schoolYear: '2023 - 2024', semester: '1st Semester', status: 'Closed' },
        { id: 7, schoolYear: '2022 - 2023', semester: 'Summer', status: 'Closed' },
        { id: 8, schoolYear: '2022 - 2023', semester: '2nd Semester', status: 'Closed' },
    ];
};


// FIX: Added function to generate dummy data for the grading view
export const createDummyGradingData = () => {
    return [
        {
            id: 1,
            name: 'Amoguis, Allan M.',
            subjects: [
                { id: 101, name: 'IM212 (Information Management)', schedule: 'F 08:30 AM - 11:30 AM', students: [
                    { id: '2022-00146', name: 'Cobarde, Trixcy Shian M.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                    { id: '2022-00068', name: 'Maratas, Yvon B.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                ]},
                { id: 102, name: 'CS311 (Advanced Programming)', schedule: 'M 01:00 PM - 04:00 PM', students: [
                    { id: '2022-00111', name: 'Reyes, Jose P.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                ]},
                { id: 103, name: 'GE101 (Understanding the Self)', schedule: 'W 10:00 AM - 12:00 PM', students: [
                     { id: '2022-00146', name: 'Cobarde, Trixcy Shian M.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                     { id: '2022-00068', name: 'Maratas, Yvon B.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                     { id: '2022-00111', name: 'Reyes, Jose P.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                ]},
            ]
        },
        {
            id: 2,
            name: 'Garcia, Maria C.',
            subjects: [
                { id: 201, name: 'ENG202 (Technical Writing)', schedule: 'TTH 09:00 AM - 10:30 AM', students: [
                    { id: '2021-00305', name: 'Mendoza, Sofia L.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                    { id: '2021-00412', name: 'Lim, Carlos F.', grades: { prelims: '', midterms: '', finalMidterm: '', finals: '', final: '' } },
                ]}
            ]
        }
    ];
};



// FIX: Added function to generate a list of all possible subjects for encoding
export const getLegacySubjects = () => {
    return [
        { id: 1, code: 'ACCED221', description: 'IT Application Tools in Business' },
        { id: 2, code: 'ACCED222', description: 'Auditing & Assurance Principles' },
        { id: 3, code: 'ACCED223', description: 'Management Science' },
        { id: 4, code: 'ACCED224', description: 'Intermediate Accounting 1' },
        { id: 5, code: 'IT101', description: 'Introduction to Computing' },
        { id: 6, code: 'ENG101', description: 'Purposive Communication' },
        { id: 7, code: 'MATH101', description: 'Mathematics in the Modern World' },
        { id: 8, code: 'FIL101', description: 'Kontekstwalisadong Komunikasyon' },
    ];
};

// FIX: Added function to generate a list of legacy students to search from
export const getLegacyStudents = () => {
    return [
        { id: '2010-00123', name: 'Rizal, Jose P.', gender: 'Male', course: 'BSIT' },
        { id: '2011-00456', name: 'Bonifacio, Andres C.', gender: 'Male', course: 'BSCS' },
        { id: '2012-00789', name: 'Silang, Gabriela M.', gender: 'Female', course: 'BSBA-MKTG' },
    ];
};