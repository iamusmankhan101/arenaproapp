#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting and starting admin panel...\n');

// Ensure we're in the admin-web directory
const adminWebDir = __dirname;
process.chdir(adminWebDir);

console.log('📁 Working directory:', process.cwd());

try {
  // Remove node_modules and package-lock.json
  console.log('🗑️  Removing node_modules and package-lock.json...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Clear npm cache
  console.log('🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ Reset complete! Starting development server...\n');

  // Start the development server
  const child = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminWebDir,
    env: {
      ...process.env,
      BROWSER: 'none',
      PORT: process.env.PORT || '3000'
    }
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start admin panel:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down admin panel...');
    child.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down admin panel...');
    child.kill('SIGTERM');
    process.exit(0);
  });

  // Show success message after a delay
  setTimeout(() => {
    console.log('\n✅ Admin panel should be starting...');
    console.log('🌐 Open http://localhost:3000 in your browser');
    console.log('🔑 Login with: admin@pitchit.com / admin123');
  }, 5000);

} catch (error) {
  console.error('❌ Reset failed:', error.message);
  console.log('\n🔧 Manual steps:');
  console.log('1. cd admin-web');
  console.log('2. rm -rf node_modules package-lock.json');
  console.log('3. npm install');
  console.log('4. npm start');
  process.exit(1);
}