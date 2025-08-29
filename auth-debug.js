/**
 * Authentication Debug and Clear Script
 * 
 * This script helps debug authentication issues by:
 * 1. Checking current localStorage authentication state
 * 2. Clearing all authentication data for fresh start
 * 3. Providing detailed debug information
 */

console.log('=== Authentication Debug Script ===');

// Function to check current auth state
function checkAuthState() {
  console.log('\n--- Current Authentication State ---');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
  
  console.log('User exists:', !!user);
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User data:', userData);
    } catch (e) {
      console.log('User data parsing error:', e.message);
    }
  }
  
  console.log('Refresh token exists:', !!refreshToken);
  
  // Check token format if exists
  if (token) {
    const parts = token.split('.');
    console.log('Token parts count:', parts.length);
    console.log('Is JWT format:', parts.length === 3);
    
    // Try to decode JWT payload (basic decode, no verification)
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token payload:', payload);
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log('Token expires:', expDate);
          console.log('Token expired:', expDate < now);
        }
      } catch (e) {
        console.log('Token payload decode error:', e.message);
      }
    }
  }
}

// Function to clear all auth data
function clearAuthData() {
  console.log('\n--- Clearing Authentication Data ---');
  
  const itemsToRemove = ['token', 'user', 'refreshToken'];
  
  itemsToRemove.forEach(item => {
    const existed = localStorage.getItem(item) !== null;
    localStorage.removeItem(item);
    console.log(`${item}: ${existed ? 'removed' : 'was not present'}`);
  });
  
  console.log('Authentication data cleared successfully!');
}

// Function to simulate auth state check like the app
function simulateAuthCheck() {
  console.log('\n--- Simulating App Auth Check ---');
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.log('User data is corrupted:', e.message);
    }
  }
  
  console.log('Auth check results:');
  console.log('- Token exists:', !!token);
  console.log('- User exists:', !!user);
  console.log('- Combined check (!!user && !!token):', !!(user && token));
  
  if (token) {
    const tokenParts = token.split('.');
    const validFormat = tokenParts.length === 3;
    console.log('- Token format valid:', validFormat);
    console.log('- Full auth check:', !!(user && token && validFormat));
  }
}

// Main execution
console.log('Starting authentication debug...');

// Check current state
checkAuthState();

// Simulate auth check
simulateAuthCheck();

console.log('\n=== Debug Options ===');
console.log('Run these commands in console:');
console.log('1. checkAuthState() - Check current auth state');
console.log('2. clearAuthData() - Clear all auth data');
console.log('3. simulateAuthCheck() - Simulate app auth logic');

// Make functions available globally
window.checkAuthState = checkAuthState;
window.clearAuthData = clearAuthData;
window.simulateAuthCheck = simulateAuthCheck;

// Auto-clear option (uncomment to auto-clear on load)
// console.log('\n--- Auto-clearing authentication data ---');
// clearAuthData();
// console.log('Page will be reloaded in 2 seconds...');
// setTimeout(() => location.reload(), 2000);

console.log('\n=== Script loaded successfully ===');
console.log('Authentication debug tools are now available!');