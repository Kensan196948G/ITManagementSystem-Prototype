#!/usr/bin/env python3
"""
Simple test script to verify the Flask API endpoints are working
"""

import requests
import json
import sys
from time import sleep

def test_endpoint(url, method='GET', data=None):
    """Test an API endpoint"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, headers={'Content-Type': 'application/json'}, timeout=5)
        
        print(f"✓ {method} {url} - Status: {response.status_code}")
        if response.headers.get('content-type') == 'application/json':
            print(f"  Response: {json.dumps(response.json(), indent=2)[:200]}...")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ {method} {url} - Error: {e}")
        return False

def main():
    base_url = "http://localhost:5000"
    
    print("=== Testing IT Management System API ===")
    print(f"Base URL: {base_url}")
    print()
    
    # Wait a moment for server to start if just launched
    sleep(2)
    
    # Test endpoints
    endpoints = [
        ('/api/health', 'GET'),
        ('/api/status', 'GET'),
        ('/api/incidents', 'GET'),
        ('/api/problems', 'GET'),
        ('/api/users', 'GET'),
        ('/api/db-test', 'GET'),
    ]
    
    success_count = 0
    total_count = len(endpoints)
    
    for endpoint, method in endpoints:
        url = f"{base_url}{endpoint}"
        if test_endpoint(url, method):
            success_count += 1
        print()
    
    # Test POST endpoint
    print("Testing POST endpoint...")
    post_data = {
        "title": "Test incident",
        "description": "This is a test incident created by the test script"
    }
    
    if test_endpoint(f"{base_url}/api/incidents", 'POST', post_data):
        success_count += 1
    total_count += 1
    
    print()
    print(f"=== Test Results ===")
    print(f"Passed: {success_count}/{total_count}")
    
    if success_count == total_count:
        print("✓ All tests passed!")
        sys.exit(0)
    else:
        print("✗ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()