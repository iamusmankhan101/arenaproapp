#!/usr/bin/env node

/**
 * Arena Pro Admin Panel - Alternative Deployment Script
 * 
 * This script can be used if Vercel deployment continues to have issues.
 * It builds the admin panel and provides instructions for manual deployment.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Arena Pro Admin Panel - Deployment Script');
console.log('============================================\n');

try {
  // Check if admin-web directory exists
  const adminWebPath = path.join(__dirname, 'admin-web');
  if (!fs.existsSync(adminWebPath)) {
    throw new Error('admin-web directory not found!');
  }

  console.log('📁 Found admin-web directory');
  
  // Change to admin-web directory and install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { 
    cwd: adminWebPath, 
    stdio: 'inherit' 
  });

  // Build the project
  console.log('🔨 Building production version...');
  execSync('npm run build', { 
    cwd: adminWebPath, 
    stdio: 'inherit' 
  });

  // Check if build was successful
  const buildPath = path.join(adminWebPath, 'build');
  if (!fs.existsSync(buildPath)) {
    throw new Error('Build failed - build directory not found!');
  }

  console.log('\n✅ Build completed successfully!');
  console.log('📊 Build output:');
  
  // Show build directory contents
  const buildFiles = fs.readdirSync(buildPath);
  buildFiles.forEach(file => {
    const filePath = path.join(buildPath, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${file} ${stats.isDirectory() ? '(directory)' : ''}`);
  });

  console.log('\n🌐 Deployment Options:');
  console.log('1. Vercel: Push to GitHub and let Vercel auto-deploy');
  console.log('2. Netlify: Drag and drop the build folder to Netlify');
  console.log('3. Firebase Hosting: Use firebase deploy');
  console.log('4. Static hosting: Upload build folder contents to any web server');
  
  console.log('\n📁 Build location: admin-web/build/');
  console.log('🔗 Entry point: admin-web/build/index.html');
  
  console.log('\n🎯 Admin Panel Features:');
  console.log('- Dashboard with real-time statistics');
  console.log('- Venue management (add, edit, delete)');
  console.log('- Booking management');
  console.log('- Customer management');
  console.log('- Firebase integration');
  console.log('- Responsive design');
  
  console.log('\n🔐 Login Credentials:');
  console.log('Email: admin@pitchit.com');
  console.log('Password: admin123');
  
  console.log('\n🎉 Ready for deployment!');

} catch (error) {
  console.error('\n❌ Deployment failed:', error.message);
  process.exit(1);
}