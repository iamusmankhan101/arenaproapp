#!/bin/bash

echo ""
echo "========================================"
echo "   PitchIt Admin Panel Startup"
echo "========================================"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script location: $SCRIPT_DIR"

# Change to the script directory (admin-web)
cd "$SCRIPT_DIR"
echo "Current directory: $(pwd)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo ""
    echo "❌ ERROR: package.json not found!"
    echo "This script must be run from the admin-web directory."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if this is the admin web package
if ! grep -q "pitchit-admin-web" package.json; then
    echo ""
    echo "❌ ERROR: Wrong package.json found!"
    echo "Make sure you're running this from the admin-web directory."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "✅ Correct directory confirmed!"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to install dependencies"
        echo "Try running: npm install"
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo "✅ Dependencies installed!"
    echo ""
fi

echo "🚀 Starting admin panel..."
echo ""
echo "🌐 The admin panel will open at: http://localhost:3000"
echo "🔑 Login credentials:"
echo "   Email: admin@pitchit.com"
echo "   Password: admin123"
echo ""
echo "💡 To stop the server, press Ctrl+C in this terminal"
echo ""

# Start the development server
npm start

echo ""
echo "👋 Admin panel stopped."
read -p "Press Enter to exit..."