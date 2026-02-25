/**
 * Comprehensive search for unwrapped text values
 */

const fs = require('fs');

const files = [
  'src/screens/main/HomeScreen.js',
  'src/screens/booking/BookingConfirmScreen.js',
  'src/components/BookingCard.js'
];

console.log('🔍 Searching for ALL Text components with dynamic values...\n');

files.forEach(file => {
  console.log(`\n📄 ${file}`);
  console.log('='.repeat(70));
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  // Find all <Text> components
  const textRegex = /<Text[^>]*>[\s\S]*?<\/Text>/g;
  const matches = content.match(textRegex);
  
  if (matches) {
    matches.forEach((match, index) => {
      // Check if it contains dynamic content
      if (match.includes('{') && match.includes('}')) {
        // Extract the dynamic part
        const dynamicContent = match.match(/\{([^}]+)\}/g);
        
        if (dynamicContent) {
          dynamicContent.forEach(dynamic => {
            // Check if it's NOT wrapped with String()
            if (!dynamic.includes('String(') && 
                !dynamic.startsWith('{\'') && 
                !dynamic.startsWith('{"') &&
                !dynamic.includes('styles.') &&
                !dynamic.includes('theme.') &&
                !dynamic.includes('color:') &&
                !dynamic.includes('fontSize:') &&
                !dynamic.includes('fontWeight:') &&
                !dynamic.includes('fontFamily:')) {
              
              // Find line number
              const matchIndex = content.indexOf(match);
              const lineNumber = content.substring(0, matchIndex).split('\n').length;
              
              console.log(`\n⚠️  Line ${lineNumber}:`);
              console.log(`   Dynamic value: ${dynamic}`);
              console.log(`   Context: ${match.substring(0, 150)}...`);
            }
          });
        }
      }
    });
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n✅ Search complete!');
