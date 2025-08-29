#!/bin/bash

# IT Management System Health Check Script
# This script performs comprehensive health checks for the running system

echo "=========================================="
echo "IT Management System Health Check"
echo "Started at: $(date)"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is open
check_port() {
    local port=$1
    local service=$2
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ $service (port $port) is running${NC}"
        return 0
    else
        echo -e "${RED}✗ $service (port $port) is not accessible${NC}"
        return 1
    fi
}

# Function to make API call and check response
api_test() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    response=$(curl -s -w "\n%{http_code}" "http://localhost:5001$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" -eq "$expected_status" ]; then
            echo -e "${GREEN}✓ $description - Status: $http_code${NC}"
            if [ "$endpoint" = "/api/health" ] || [ "$endpoint" = "/api/status" ]; then
                echo "  Response: $body"
            fi
        else
            echo -e "${YELLOW}⚠ $description - Unexpected status: $http_code${NC}"
            echo "  Response: $body"
        fi
    else
        echo -e "${RED}✗ $description - Connection failed${NC}"
    fi
}

echo -e "\n${BLUE}1. CHECKING SERVER STATUS${NC}"
echo "----------------------------------------"

# Check backend API server
backend_running=false
if check_port 5001 "Backend API Server"; then
    backend_running=true
fi

# Check frontend server
frontend_running=false
if check_port 3001 "Frontend Server"; then
    frontend_running=true
fi

echo -e "\n${BLUE}2. TESTING BACKEND API ENDPOINTS${NC}"
echo "----------------------------------------"

if [ "$backend_running" = true ]; then
    # Test health/status endpoints
    api_test "/api/health" "Health Check Endpoint"
    api_test "/api/status" "Status Endpoint"
    
    # Test main API endpoints
    api_test "/api/tickets" "Tickets Endpoint"
    api_test "/api/assets" "Assets Endpoint"
    api_test "/api/users" "Users Endpoint"
    api_test "/api/departments" "Departments Endpoint"
    
    # Test authentication endpoints
    api_test "/api/auth/status" "Auth Status Endpoint"
    
    echo -e "\n${BLUE}Testing API Response Times:${NC}"
    for endpoint in "/api/health" "/api/tickets" "/api/assets"; do
        response_time=$(curl -s -w "%{time_total}" -o /dev/null "http://localhost:5001$endpoint" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "  $endpoint: ${response_time}s"
        fi
    done
else
    echo -e "${RED}Skipping API tests - Backend server not running${NC}"
fi

echo -e "\n${BLUE}3. DATABASE CONNECTIVITY CHECK${NC}"
echo "----------------------------------------"

if [ "$backend_running" = true ]; then
    # Check database through API
    db_response=$(curl -s "http://localhost:5001/api/health" 2>/dev/null)
    if echo "$db_response" | grep -q "database.*ok\|db.*ok\|connected" 2>/dev/null; then
        echo -e "${GREEN}✓ Database connectivity appears healthy${NC}"
    else
        # Try to get more info from a simple query endpoint
        tickets_response=$(curl -s -w "%{http_code}" "http://localhost:5001/api/tickets" 2>/dev/null)
        http_code=$(echo "$tickets_response" | tail -n1)
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✓ Database connectivity verified through API${NC}"
        else
            echo -e "${YELLOW}⚠ Database connectivity unclear - API response: $http_code${NC}"
        fi
    fi
    
    # Check if there are any database-related processes
    if pgrep -f "postgres\|mysql\|sqlite" > /dev/null; then
        echo -e "${GREEN}✓ Database process detected${NC}"
    else
        echo -e "${YELLOW}⚠ No obvious database processes found${NC}"
    fi
else
    echo -e "${RED}Cannot check database - Backend server not running${NC}"
fi

echo -e "\n${BLUE}4. FRONTEND SERVER CHECK${NC}"
echo "----------------------------------------"

if [ "$frontend_running" = true ]; then
    # Test frontend main page
    frontend_response=$(curl -s -w "%{http_code}" "http://localhost:3001" 2>/dev/null)
    http_code=$(echo "$frontend_response" | tail -n1)
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Frontend server responding correctly${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend server returned status: $http_code${NC}"
    fi
else
    echo -e "${RED}✗ Frontend server not accessible${NC}"
fi

echo -e "\n${BLUE}5. SYSTEM RESOURCE CHECK${NC}"
echo "----------------------------------------"

# Check memory usage
memory_info=$(free -h | grep "Mem:")
echo "Memory: $memory_info"

# Check disk space
disk_info=$(df -h . | tail -1)
echo "Disk: $disk_info"

# Check CPU load
load_avg=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average: $load_avg"

echo -e "\n${BLUE}6. PROCESS CHECK${NC}"
echo "----------------------------------------"

# Check for Node.js processes (likely our servers)
node_processes=$(pgrep -f "node" | wc -l)
echo "Node.js processes running: $node_processes"

if [ $node_processes -gt 0 ]; then
    echo "Node.js process details:"
    ps aux | grep -E "node.*[35]001" | grep -v grep | while read line; do
        echo "  $line"
    done
fi

echo -e "\n${BLUE}7. LOG FILE CHECK${NC}"
echo "----------------------------------------"

# Check for common log files and recent errors
log_files=("./logs/app.log" "./logs/error.log" "./server.log" "../frontend/build.log")

for log_file in "${log_files[@]}"; do
    if [ -f "$log_file" ]; then
        echo "Found log file: $log_file"
        recent_errors=$(tail -50 "$log_file" 2>/dev/null | grep -i "error\|warning\|fail" | tail -5)
        if [ -n "$recent_errors" ]; then
            echo "Recent errors/warnings:"
            echo "$recent_errors" | sed 's/^/  /'
        else
            echo "  No recent errors found"
        fi
    fi
done

echo -e "\n=========================================="
echo "HEALTH CHECK SUMMARY"
echo "=========================================="

# Summary
summary_status="HEALTHY"

if [ "$backend_running" = false ]; then
    echo -e "${RED}✗ Backend API Server (port 5001) - NOT RUNNING${NC}"
    summary_status="CRITICAL"
else
    echo -e "${GREEN}✓ Backend API Server (port 5001) - RUNNING${NC}"
fi

if [ "$frontend_running" = false ]; then
    echo -e "${RED}✗ Frontend Server (port 3001) - NOT RUNNING${NC}"
    if [ "$summary_status" != "CRITICAL" ]; then
        summary_status="WARNING"
    fi
else
    echo -e "${GREEN}✓ Frontend Server (port 3001) - RUNNING${NC}"
fi

echo -e "\nOverall System Status: ${summary_status}"

case $summary_status in
    "HEALTHY")
        echo -e "${GREEN}All systems operational${NC}"
        exit 0
        ;;
    "WARNING")
        echo -e "${YELLOW}Some issues detected but system partially functional${NC}"
        exit 1
        ;;
    "CRITICAL")
        echo -e "${RED}Critical issues detected - system may not be functional${NC}"
        exit 2
        ;;
esac

echo "Health check completed at: $(date)"
echo "=========================================="