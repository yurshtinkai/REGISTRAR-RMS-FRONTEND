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
