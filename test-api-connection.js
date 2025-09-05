// Test script to verify API connectivity
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : 'http://localhost:5000/api';

console.log('Testing API connection...');
console.log('API URL:', API_BASE_URL);

// Test health endpoint
fetch(`${API_BASE_URL.replace('/api', '')}/health`)
  .then(response => {
    console.log('Health check status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Health check response:', data);
  })
  .catch(error => {
    console.error('Health check failed:', error);
  });

// Test login endpoint
fetch(`${API_BASE_URL}/sessions/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    idNumber: 'test',
    password: 'test'
  })
})
  .then(response => {
    console.log('Login test status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Login test response:', data);
  })
  .catch(error => {
    console.error('Login test failed:', error);
  });
