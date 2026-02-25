/**
 * Debug Script: Text Rendering Error
 * 
 * This script helps identify where objects or non-string values
 * are being rendered directly in Text components
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/screens/main/HomeScreen.js',
  'src/screens/booking/BookingConfirmScreen.js',
  'src/components/BookingCard.js'
];

console.log('🔍 Searching for potential text rendering issues...\n');

// Patterns that might cause issues
const problematicPatterns = [
  {
    name: 'Direct object property without String()',
    regex: /<Text[^>]*>\s*\{[^}S]*\.[^}]*\}/g,
    description: 'Text component with direct property access not wrapped in String()'
  },
  {
    name: 'Conditional without String()',
    regex: /<Text[^>]*>\s*\{[^}]*\?[^:]*:[^}S]*\}/g,
    description: 'Ternary operator in Text without String() wrapper'
  },
  {
    name: 'Template literal without String()',
    regex: /<Text[^>]*>\s*\{`[^`]*\$\{[^}]*\}[^`]*`\}/g,
    description: 'Template literal in Text without String() wrapper'
  },
  {
    name: 'Array/Object method result',
    regex: /<Text[^>]*>\s*\{[^}]*\.(map|filter|reduce|join|slice)[^}]*\}/g,
    description: 'Array/Object method result without String() wrapper'
  }
];

filesToCheck.forEach(filePath => {
  console.log(`\n📄 Checking: ${filePath}`);
  console.log('='.repeat(60));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let issuesFound = 0;
    
    problematicPatterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches && matches.length > 0) {
        console.log(`\n⚠️  ${pattern.name}:`);
        console.log(`   ${pattern.description}`);
        console.log(`   Found ${matches.length} potential issue(s):\n`);
        
        matches.forEach((match, index) => {
          // Find line number
          const matchIndex = content.indexOf(match);
          const lineNumber = content.substring(0, matchIndex).split('\n').length;
          
          console.log(`   ${index + 1}. Line ${lineNumber}:`);
          console.log(`      ${match.substring(0, 100)}${match.length > 100 ? '...' : ''}`);
        });
        
        issuesFound += matches.length;
      }
    });
    
    if (issuesFound === 0) {
      console.log('✅ No obvious issues found');
    } else {
      console.log(`\n❌ Total potential issues: ${issuesFound}`);
    }
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 RECOMMENDATIONS:');
console.log('1. Wrap all dynamic values in Text components with String()');
console.log('2. Provide fallback values: String(value || \'\')');
console.log('3. Check for objects being passed to Text components');
console.log('4. Verify all template literals are wrapped with String()');
console.log('\n📝 Example fixes:');
console.log('   BAD:  <Text>{user.name}</Text>');
console.log('   GOOD: <Text>{String(user?.name || \'Guest\')}</Text>');
console.log('\n   BAD:  <Text>{`Price: ${price}`}</Text>');
console.log('   GOOD: <Text>{String(`Price: ${price}`)}</Text>');
console.log('\n');
