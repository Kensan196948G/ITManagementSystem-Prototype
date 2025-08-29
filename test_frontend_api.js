#!/usr/bin/env node

/**
 * Test script for API-Frontend integration
 */

import axios from 'axios';

const API_BASE_URL = 'http://192.168.3.135:8000/api';

async function testLogin() {
    console.log('Testing login endpoint...');
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('Token:', response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

async function testProtectedEndpoint(token) {
    console.log('\nTesting protected endpoint...');
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Protected endpoint accessed!');
        console.log('User data:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Protected endpoint failed:', error.response?.data || error.message);
        return false;
    }
}

async function testIncidentsList(token) {
    console.log('\nTesting incidents list endpoint...');
    try {
        const response = await axios.get(`${API_BASE_URL}/incidents`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Incidents endpoint accessed!');
        console.log('Incidents count:', response.data.items.length);
        return true;
    } catch (error) {
        console.error('❌ Incidents endpoint failed:', error.response?.data || error.message);
        return false;
    }
}

async function runTests() {
    console.log('===========================================');
    console.log('API-Frontend Integration Test');
    console.log('===========================================\n');
    
    // Test login
    const token = await testLogin();
    if (!token) {
        console.log('\n❌ Tests failed: Unable to login');
        process.exit(1);
    }
    
    // Test protected endpoints
    const protectedSuccess = await testProtectedEndpoint(token);
    const incidentsSuccess = await testIncidentsList(token);
    
    console.log('\n===========================================');
    console.log('Test Results:');
    console.log('- Login: ✅');
    console.log(`- Protected Endpoint: ${protectedSuccess ? '✅' : '❌'}`);
    console.log(`- Incidents List: ${incidentsSuccess ? '✅' : '❌'}`);
    console.log('===========================================');
    
    if (protectedSuccess && incidentsSuccess) {
        console.log('\n✅ All tests passed!');
        console.log('\nYou can now access the application at:');
        console.log('  Frontend: http://192.168.3.135:5174');
        console.log('  API Docs: http://192.168.3.135:8000/docs');
        console.log('\nLogin with:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
    } else {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(console.error);