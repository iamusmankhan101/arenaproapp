const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'main', 'HomeScreen.js');

// Read the file with UTF-16 LE encoding
const content = fs.readFileSync(filePath, 'utf16le');

// Write it back as UTF-8 without BOM
fs.writeFileSync(filePath, content, 'utf8');

console.log('File encoding fixed!');
