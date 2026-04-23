#!/bin/bash

echo "========================================"
echo "    Arena Pro Backend Setup"
echo "========================================"
echo

echo "Checking if MongoDB is running..."
if ! nc -z localhost 27017; then
    echo "❌ MongoDB is not running on port 27017"
    echo "Please start MongoDB first:"
    echo "  - Start MongoDB service, or"
    echo "  - Run: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo
    exit 1
fi
echo "✅ MongoDB is running"

echo
echo "Installing dependencies..."
cd backend
npm install

echo
echo "Starting backend server..."
echo "========================================"
echo "Backend will run on: http://localhost:3001"
echo "Health check: http://localhost:3001/health"
echo "Admin API: http://localhost:3001/api/admin/dashboard/stats"
echo "========================================"
echo
echo "To seed sample data, run: npm run seed"
echo "To stop server, press Ctrl+C"
echo

npm run dev