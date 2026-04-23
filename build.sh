#!/bin/bash

# Arena Pro Admin Panel - Build Script
echo "🚀 Building Arena Pro Admin Panel..."

# Navigate to admin-web directory
cd admin-web

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building production version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📊 Build output:"
    ls -la build/
    echo ""
    echo "🌐 Ready for deployment!"
    echo "📁 Build directory: admin-web/build"
else
    echo "❌ Build failed!"
    exit 1
fi