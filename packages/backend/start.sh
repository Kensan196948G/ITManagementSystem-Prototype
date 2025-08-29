#!/bin/bash

# IT Management System Backend Startup Script

echo "=== IT Management System Backend ==="
echo "Starting Flask application..."
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/pyvenv.cfg" ] || ! pip list | grep -q flask; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the Flask application
echo "Starting Flask server on http://localhost:5000..."
python app.py