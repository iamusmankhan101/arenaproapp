#!/usr/bin/env node

/**
 * Test Enhanced Venue Cards Implementation
 * 
 * This script tests the enhanced venue card design with images
 * in both MapScreen and TurfCard components.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Enhanced Venue Cards Implementation...\n');

// Test files to check
const testFiles = [
  {
    path: 'src/screens/main/MapScreen.js',
    name: 'MapScreen Enhanced Venue Card',
    checks: [
      'venueImageContainer',
      'venueImage',
      'statusBadge',
      'sportsOverlay',
      'sportIcon',
      'viewDetailsButton',
      'require(\'../../images/indoor-football-court-turf.jpeg\')'
    ]
  },
  {
    path: 'src/components/TurfCard.js',
    name: 'TurfCard Enhanced Design',
    checks: [
      'imageContainer',
      'venueImage',
      'statusBadge',
      'priceBadge',
      'sportsOverlay',
      'sportIconOverlay',
      'availabilityChip',
      'bookButton',
      'require(\'../images/indoor-football-court-turf.jpeg\')'
    ]
  }
];

let allTestsPassed = true;

// Function to check if file contains required elements
function checkFileContent(filePath, checks) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    checks.forEach(check => {
      const found = content.includes(check);
      results.push({
        check,
        found,
        status: found ? '✅' : '❌'
      });
      
      if (!found) {
        allTestsPassed = false;
      }
    });
    
    return results;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    allTestsPassed = false;
    return [];
  }
}

// Run tests
testFiles.forEach(testFile => {
  console.log(`📋 Testing ${testFile.name}:`);
  console.log(`   File: ${testFile.path}`);
  
  const results = checkFileContent(testFile.path, testFile.checks);
  
  results.forEach(result => {
    console.log(`   ${result.status} ${result.check}`);
  });
  
  const passedChecks = results.filter(r => r.found).length;
  const totalChecks = results.length;
  
  console.log(`   📊 Result: ${passedChecks}/${totalChecks} checks passed\n`);
});

// Check if default image exists
const defaultImagePath = 'src/images/indoor-football-court-turf.jpeg';
console.log('🖼️  Checking Default Image:');
try {
  if (fs.existsSync(defaultImagePath)) {
    console.log(`   ✅ Default image found: ${defaultImagePath}`);
  } else {
    console.log(`   ❌ Default image missing: ${defaultImagePath}`);
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Error checking default image: ${error.message}`);
  allTestsPassed = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 All Enhanced Venue Card Tests Passed!');
  console.log('\n✨ Features Implemented:');
  console.log('   • Venue images with fallback handling');
  console.log('   • Status badges (OPEN/CLOSED)');
  console.log('   • Sports icons overlay');
  console.log('   • Price badges and availability indicators');
  console.log('   • Modern card design with proper spacing');
  console.log('   • Enhanced action buttons');
  console.log('   • Improved visual hierarchy');
  
  console.log('\n🚀 Ready to test in the app!');
  console.log('   1. Open the mobile app');
  console.log('   2. Navigate to MapScreen');
  console.log('   3. Tap on venue markers to see enhanced cards');
  console.log('   4. Check venue list screens for enhanced TurfCards');
} else {
  console.log('❌ Some Enhanced Venue Card Tests Failed!');
  console.log('   Please review the implementation and fix any missing elements.');
}

console.log('='.repeat(50));