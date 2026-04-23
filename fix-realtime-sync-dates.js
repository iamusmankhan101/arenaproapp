/**
 * Fix all unsafe Date operations in realtimeSync.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/realtimeSync.js');

// Read the current file
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing unsafe Date operations in realtimeSync.js...');

// Replace all unsafe Date constructor calls with safe utilities
const replacements = [
  {
    from: /new Date\(a\.createdAt\)/g,
    to: 'safeDate(a.createdAt)'
  },
  {
    from: /new Date\(b\.createdAt\)/g,
    to: 'safeDate(b.createdAt)'
  },
  {
    from: /isNaN\(dateA\.getTime\(\)\) \|\| isNaN\(dateB\.getTime\(\)\)/g,
    to: '!isValidDate(dateA) || !isValidDate(dateB)'
  },
  {
    from: /return dateB - dateA;/g,
    to: 'return safeCompareDate(dateB, dateA);'
  },
  {
    from: /data\.createdAt\?\.toDate\(\) \|\| new Date\(\)/g,
    to: 'safeFirestoreTimestampToISO(data.createdAt)'
  },
  {
    from: /data\.startTime\?\.toDate\(\) \|\| new Date\(\)/g,
    to: 'safeFirestoreTimestampToISO(data.startTime)'
  },
  {
    from: /data\.endTime\?\.toDate\(\) \|\| new Date\(\)/g,
    to: 'safeFirestoreTimestampToISO(data.endTime)'
  },
  {
    from: /data\.proposedDateTime\?\.toDate\(\) \|\| new Date\(\)/g,
    to: 'safeFirestoreTimestampToISO(data.proposedDateTime)'
  },
  {
    from: /new Date\(\)\.toISOString\(\)/g,
    to: 'safeToISOString(new Date())'
  }
];

// Apply all replacements
replacements.forEach(({ from, to }) => {
  const beforeCount = (content.match(from) || []).length;
  content = content.replace(from, to);
  const afterCount = (content.match(from) || []).length;
  if (beforeCount > afterCount) {
    console.log(`✅ Replaced ${beforeCount - afterCount} instances of unsafe date operation`);
  }
});

// Add missing import for safe date utilities
if (!content.includes('safeFirestoreTimestampToISO')) {
  content = content.replace(
    "import { safeDate, safeCompareDate, isValidDate } from '../utils/dateUtils';",
    "import { safeDate, safeCompareDate, isValidDate, safeFirestoreTimestampToISO, safeToISOString } from '../utils/dateUtils';"
  );
}

// Write the fixed content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed all unsafe Date operations in realtimeSync.js');
console.log('📋 Applied fixes:');
console.log('  - Replaced new Date() calls with safeDate()');
console.log('  - Replaced date validation with isValidDate()');
console.log('  - Replaced date comparison with safeCompareDate()');
console.log('  - Replaced Firestore timestamp conversion with safeFirestoreTimestampToISO()');
console.log('  - Added missing imports for safe date utilities');