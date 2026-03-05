#!/usr/bin/env node

/**
 * Test script to verify sports icons are using secondary color
 * This script checks the TurfDetailScreen implementation
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Testing Sports Icons Secondary Color Implementation...\n');

// Read the TurfDetailScreen file
const turfDetailPath = path.join(__dirname, 'src/screens/turf/TurfDetailScreen.js');

if (!fs.existsSync(turfDetailPath)) {
  console.error('❌ TurfDetailScreen.js not found!');
  process.exit(1);
}

const turfDetailContent = fs.readFileSync(turfDetailPath, 'utf8');

// Test 1: Check if sports icons use secondary color for background
console.log('1. Checking sports icon background color...');
if (turfDetailContent.includes('backgroundColor: theme.colors.secondary')) {
  console.log('✅ Sports icons are using secondary color for background');
} else if (turfDetailContent.includes('backgroundColor: theme.colors.primary')) {
  console.log('❌ Sports icons are still using primary color for background');
} else {
  console.log('⚠️  Could not find background color setting for sports icons');
}

// Test 2: Check if sports icons use primary color for icon tint
console.log('\n2. Checking sports icon tint color...');
if (turfDetailContent.includes('tintColor: theme.colors.primary')) {
  console.log('✅ Sports icons are using primary color for icon tint (good contrast)');
} else if (turfDetailContent.includes('tintColor: \'white\'')) {
  console.log('❌ Sports icons are still using white tint color');
} else {
  console.log('⚠️  Could not find tint color setting for sports icons');
}

// Test 3: Check if hardcoded background color is removed from styles
console.log('\n3. Checking for hardcoded background colors in styles...');
const sportIconStyleMatch = turfDetailContent.match(/sportIcon:\s*{[^}]*}/s);
if (sportIconStyleMatch) {
  const sportIconStyle = sportIconStyleMatch[0];
  if (sportIconStyle.includes('backgroundColor:')) {
    console.log('❌ sportIcon style still contains hardcoded backgroundColor');
  } else {
    console.log('✅ sportIcon style does not contain hardcoded backgroundColor');
  }
} else {
  console.log('⚠️  Could not find sportIcon style definition');
}

// Test 4: Check theme colors
console.log('\n4. Checking theme colors...');
const themePath = path.join(__dirname, 'src/theme/theme.js');
if (fs.existsSync(themePath)) {
  const themeContent = fs.readFileSync(themePath, 'utf8');
  
  if (themeContent.includes('secondary: \'#cdec6a\'')) {
    console.log('✅ Secondary color is set to #cdec6a (light green)');
  } else {
    console.log('⚠️  Secondary color definition not found or different');
  }
  
  if (themeContent.includes('primary: \'#004d43\'')) {
    console.log('✅ Primary color is set to #004d43 (dark teal)');
  } else {
    console.log('⚠️  Primary color definition not found or different');
  }
} else {
  console.log('❌ Theme file not found');
}

console.log('\n🎨 Sports Icons Color Test Complete!');
console.log('\nExpected Result:');
console.log('- Sports icon backgrounds should be light green (#cdec6a)');
console.log('- Sports icon images should be dark teal (#004d43) for good contrast');
console.log('- This provides better visual hierarchy and brand consistency');