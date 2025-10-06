// Dashboard display fix
// This script will help debug and fix dashboard display issues

console.log('🔧 Dashboard Display Fix Tool');

// Function to test session storage
function testSessionStorage() {
    console.log('📋 Testing session storage...');
    
    const sessionData = {
        sessionToken: localStorage.getItem('sessionToken'),
        userRole: localStorage.getItem('userRole'),
        idNumber: localStorage.getItem('idNumber'),
        userId: localStorage.getItem('userId'),
        fullName: localStorage.getItem('fullName'),
        userInfo: localStorage.getItem('userInfo')
    };
    
    console.log('Current session data:', sessionData);
    
    // Check if we have a valid session
    if (!sessionData.sessionToken || sessionData.sessionToken === 'null') {
        console.log('❌ No valid session token found');
        return false;
    }
    
    console.log('✅ Session token found');
    return true;
}

// Function to test backend connectivity
async function testBackendConnectivity() {
    console.log('🌐 Testing backend connectivity...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:5000/health');
        console.log('Health endpoint status:', healthResponse.status);
        
        if (healthResponse.status === 404) {
            console.log('⚠️ Health endpoint not found, trying alternative...');
            // Try the API base
            const apiResponse = await fetch('http://localhost:5000/api');
            console.log('API base status:', apiResponse.status);
        }
        
        return true;
    } catch (error) {
        console.log('❌ Backend not responding:', error.message);
        return false;
    }
}

// Function to test dashboard data fetch
async function testDashboardData() {
    console.log('📊 Testing dashboard data fetch...');
    
    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken || sessionToken === 'null') {
        console.log('❌ No session token for dashboard test');
        return false;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
            headers: {
                'X-Session-Token': sessionToken,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Dashboard API status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dashboard data received:', data);
            return true;
        } else {
            const errorData = await response.json();
            console.log('❌ Dashboard API error:', errorData);
            return false;
        }
    } catch (error) {
        console.log('❌ Dashboard fetch error:', error.message);
        return false;
    }
}

// Function to clear and reset session
function resetSession() {
    console.log('🔄 Resetting session...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Session cleared');
}

// Function to simulate login
async function simulateLogin() {
    console.log('🔐 Simulating login...');
    
    try {
        const response = await fetch('http://localhost:5000/api/sessions/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idNumber: 'A001',
                password: 'admin123'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Login successful');
            
            // Store session data
            localStorage.setItem('sessionToken', result.sessionToken);
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('idNumber', result.user.idNumber);
            localStorage.setItem('userId', result.user.id);
            localStorage.setItem('fullName', `${result.user.firstName} ${result.user.lastName}`);
            localStorage.setItem('userInfo', JSON.stringify(result.user));
            
            console.log('✅ Session data stored');
            return true;
        } else {
            const errorData = await response.json();
            console.log('❌ Login failed:', errorData);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('🚀 Running complete diagnostics...');
    
    // Step 1: Test session storage
    const hasSession = testSessionStorage();
    
    // Step 2: Test backend connectivity
    const backendOk = await testBackendConnectivity();
    
    if (!backendOk) {
        console.log('❌ Backend is not running. Please start the backend server first.');
        return;
    }
    
    // Step 3: If no session, try to login
    if (!hasSession) {
        console.log('🔄 No session found, attempting login...');
        const loginOk = await simulateLogin();
        if (!loginOk) {
            console.log('❌ Login failed. Check backend server and credentials.');
            return;
        }
    }
    
    // Step 4: Test dashboard data
    const dashboardOk = await testDashboardData();
    
    if (dashboardOk) {
        console.log('✅ All tests passed! Dashboard should work now.');
        console.log('🔄 Please refresh the page to see the dashboard.');
    } else {
        console.log('❌ Dashboard data fetch failed. Check backend logs.');
    }
}

// Export functions for use in browser console
window.dashboardFix = {
    testSessionStorage,
    testBackendConnectivity,
    testDashboardData,
    resetSession,
    simulateLogin,
    runDiagnostics
};

console.log('🔧 Dashboard fix tools loaded. Use dashboardFix.runDiagnostics() to test everything.');
