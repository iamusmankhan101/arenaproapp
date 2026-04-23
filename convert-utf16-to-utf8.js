const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'main', 'HomeScreen.js');

try {
    // Read the raw buffer
    const buffer = fs.readFileSync(filePath);

    // It appears the file is encoded in UTF-16LE (e.g., 'i' is [105, 0])
    // We specify 'utf16le' as the encoding to properly convert it to a JavaScript string
    const contentStr = buffer.toString('utf16le');

    // Check if we accidentally created a string of null characters or garbage by reading UTF-8 as UTF-16
    // But our previous check confirmed it's UTF-16.
    if (contentStr.startsWith("import ") || contentStr.startsWith("import\n") || contentStr.startsWith("import\r")) {
        console.log("Successfully decoded UTF-16LE content.");
    } else {
        console.log("Warning: Content didn't start with 'import' after UTF-16 decoding. Might need another encoding format.");
        console.log("Preview of decoded text:", contentStr.substring(0, 50));
    }

    // Remove any stray BOMs if they exist in the decoded string
    let finalStr = contentStr;
    if (finalStr.charCodeAt(0) === 0xFEFF || finalStr.charCodeAt(0) === 0xFFFE) {
        finalStr = finalStr.slice(1);
    }

    // Write it back explicitly as utf8
    fs.writeFileSync(filePath, finalStr, 'utf8');
    console.log('Successfully converted HomeScreen.js from UTF-16LE to UTF-8');
} catch (error) {
    console.error('Error converting file:', error);
}
