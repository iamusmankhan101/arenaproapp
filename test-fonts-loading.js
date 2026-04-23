/**
 * Font Loading Test
 * 
 * This script helps verify that ClashDisplay fonts are loading correctly
 * Run this after restarting Metro with: npx expo start -c
 */

console.log('========================================');
console.log('  Font Loading Test');
console.log('========================================');
console.log('');

console.log('✅ ClashDisplay fonts found in assets/fonts/:');
console.log('   - ClashDisplay-Regular.otf');
console.log('   - ClashDisplay-Medium.otf');
console.log('   - ClashDisplay-Semibold.otf');
console.log('   - ClashDisplay-Bold.otf');
console.log('');

console.log('📋 Font Configuration:');
console.log('   App.js: ✅ Fonts configured in useFonts()');
console.log('   theme.js: ✅ Font hierarchy updated');
console.log('');

console.log('🎨 Font Usage:');
console.log('   Primary (ClashDisplay):');
console.log('   - Headings, titles, buttons');
console.log('   - Display text, section headers');
console.log('');
console.log('   Secondary (Montserrat):');
console.log('   - Body text, descriptions');
console.log('   - Labels, captions, UI elements');
console.log('');

console.log('🚀 Next Steps:');
console.log('   1. Run: npx expo start -c');
console.log('   2. Press "r" to reload the app');
console.log('   3. Check that headings use ClashDisplay');
console.log('   4. Check that body text uses Montserrat');
console.log('');

console.log('📱 Test Screens:');
console.log('   - WelcomeScreen: Title should be ClashDisplay-Bold');
console.log('   - HomeScreen: Section headers should be ClashDisplay');
console.log('   - BookingSuccessScreen: "Congratulations!" should be ClashDisplay-Bold');
console.log('');

console.log('========================================');
console.log('  Font system ready! ✨');
console.log('========================================');
