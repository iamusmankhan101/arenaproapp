#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up PitchIt Admin Panel...\n');

// Check if we're in the right directory
const currentDir = process.cwd();
const adminWebDir = path.join(currentDir, 'admin-web');

console.log('📁 Current directory:', currentDir);
console.log('📁 Looking for admin-web at:', adminWebDir);

if (!fs.existsSync(adminWebDir)) {
  console.error('❌ admin-web directory not found!');
  console.log('Make sure you run this script from the project root directory.');
  console.log('Expected structure:');
  console.log('  project-root/');
  console.log('  ├── src/');
  console.log('  ├── admin-web/');
  console.log('  └── setup-admin.js');
  process.exit(1);
}

// Check if admin-web has the correct structure
const adminWebPackageJson = path.join(adminWebDir, 'package.json');
const adminWebSrcDir = path.join(adminWebDir, 'src');
const adminApiPath = path.join(adminWebDir, 'src', 'services', 'adminApi.js');

if (!fs.existsSync(adminWebPackageJson)) {
  console.error('❌ admin-web/package.json not found!');
  process.exit(1);
}

if (!fs.existsSync(adminWebSrcDir)) {
  console.error('❌ admin-web/src directory not found!');
  process.exit(1);
}

if (!fs.existsSync(adminApiPath)) {
  console.error('❌ admin-web/src/services/adminApi.js not found!');
  process.exit(1);
}

console.log('✅ Directory structure verified');

try {
  console.log('📦 Installing web admin dependencies...');
  process.chdir(adminWebDir);
  console.log('📁 Changed to directory:', process.cwd());
  
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Web admin setup complete!');
  console.log('\n🎯 Next steps:');
  console.log('1. Start the backend API server on port 3001');
  console.log('2. Run one of these commands:');
  console.log('   • cd admin-web && npm start');
  console.log('   • node admin-web/start-admin.js');
  console.log('   • admin-web/start-admin.bat (Windows)');
  console.log('3. Open http://localhost:3000 in your browser');
  console.log('4. Login with: admin@pitchit.com / admin123');
  
  // Ask if user wants to start the server now
  console.log('\n❓ Would you like to start the admin panel now? (y/n)');
  
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (key) => {
    const input = key.toString().toLowerCase();
    if (input === 'y' || input === '\r' || input === '\n') {
      console.log('\n🚀 Starting admin panel...');
      startAdminPanel();
    } else if (input === 'n') {
      console.log('\n👋 Setup complete! Run the commands above when ready.');
      process.exit(0);
    } else if (input === '\u0003') { // Ctrl+C
      console.log('\n👋 Setup complete!');
      process.exit(0);
    }
  });
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure Node.js and npm are installed');
  console.log('2. Check your internet connection');
  console.log('3. Try running: cd admin-web && npm install');
  process.exit(1);
}

function startAdminPanel() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  
  const child = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminWebDir
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start admin panel:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    child.kill('SIGINT');
    process.exit(0);
  });
}