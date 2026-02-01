#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting PitchIt Admin Web Panel...');

// Ensure we're in the admin-web directory
const adminWebDir = __dirname;
const packageJsonPath = path.join(adminWebDir, 'package.json');

console.log('📁 Admin web directory:', adminWebDir);
console.log('📁 Current working directory:', process.cwd());

// Verify we have the correct package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found in admin-web directory!');
  console.log('Make sure you run this script from the admin-web directory.');
  process.exit(1);
}

// Verify adminApi service exists
const adminApiPath = path.join(adminWebDir, 'src', 'services', 'adminApi.js');
if (!fs.existsSync(adminApiPath)) {
  console.error('❌ adminApi.js not found!');
  console.log('Expected path:', adminApiPath);
  process.exit(1);
}

console.log('✅ All required files found');

// Change to the admin-web directory
process.chdir(adminWebDir);
console.log('📁 Changed working directory to:', process.cwd());

// Check if node_modules exists
const nodeModulesPath = path.join(adminWebDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const installProcess = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminWebDir
  });
  
  installProcess.on('close', (code) => {
    if (code === 0) {
      startReactApp();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startReactApp();
}

function startReactApp() {
  console.log('🌐 Starting React development server...');
  
  // Start the React development server
  const child = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminWebDir,
    env: {
      ...process.env,
      BROWSER: 'none', // Don't auto-open browser
      PORT: process.env.PORT || '3000'
    }
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start admin panel:', error);
    process.exit(1);
  });

  child.on('close', (code) => {
    console.log(`Admin panel process exited with code ${code}`);
    process.exit(code);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down admin panel...');
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down admin panel...');
    child.kill('SIGTERM');
  });

  // Show success message after a delay
  setTimeout(() => {
    console.log('\n✅ Admin panel should be starting...');
    console.log('🌐 Open http://localhost:3000 in your browser');
    console.log('🔑 Login with: admin@pitchit.com / admin123');
  }, 3000);
}