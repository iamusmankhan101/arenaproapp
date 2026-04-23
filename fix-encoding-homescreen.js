const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'main', 'HomeScreen.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check for BOM (Byte Order Mark) and remove it
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
        console.log('Removed standard BOM.');
    }

    // Check for the specific garbage characters '' or 'ï»¿' resulting from bad encoding reads
    if (content.startsWith('ï»¿')) {
        content = content.slice(3);
        console.log('Removed UTF-8 BOM interpreted as latin1.');
    }

    // Check for '' (often UTF-16 LE/BE BOM misinterpreted)
    // Just strip any non-ascii characters at the very beginning before the word 'import'
    const importMatch = content.match(/^[^A-Za-z0-9_]*import/);
    if (importMatch && importMatch[0].length > 6) { // 'import' is 6 chars, if longer, there's garbage
        const badPrefixLength = importMatch[0].length - 6;
        content = content.slice(badPrefixLength);
        console.log(`Removed ${badPrefixLength} garbage characters from start of file.`);
    } else if (content.charCodeAt(0) === 65533) {
        // Removing replacement character 
        while (content.charCodeAt(0) === 65533 || content.charCodeAt(0) === 65279) {
            content = content.slice(1);
        }
        console.log('Removed replacement characters () from start.');
    }

    // Always write explicitly as utf8 to avoid further issues
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully fixed encoding for HomeScreen.js');
} catch (error) {
    console.error('Error fixing encoding:', error);
}
