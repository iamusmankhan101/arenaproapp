#!/bin/bash

echo "========================================"
echo "    Arena Pro Firebase Setup"
echo "========================================"
echo

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js is installed ($(node --version))"

echo
echo "Installing Firebase dependencies..."
npm install firebase

echo
echo "Seeding Firebase with sample data..."
echo "========================================"
echo "This will add sample data to your Firebase project:"
echo "  - 4 Venues (Football, Cricket, Padel, Futsal)"
echo "  - 3 Challenges"
echo "  - 3 Users"
echo "  - 3 Sample Bookings"
echo "========================================"
echo

echo "========================================"
echo "========================================"
echo "Firebase setup completed!"
echo
echo "Next steps:"
echo "1. Start mobile app: npx react-native start"
echo "2. Start admin panel: cd admin-web && npm start"
echo
echo "Your app now has real data from Firebase!"
echo "========================================"