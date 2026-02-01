#!/bin/bash
echo "🚀 Building Arena Pro Admin Panel for Vercel..."

# Navigate to admin-web directory
cd admin-web

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building production build..."
npm run build

# Copy build to root for Vercel
echo "📁 Preparing build for deployment..."
cp -r build/* ../

echo "✅ Build completed successfully!"