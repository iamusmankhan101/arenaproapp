const fs = require('fs');
const path = require('path');

function getDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    // PNG signature
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
        return 'Not a PNG';
    }
    // IHDR chunk starts at byte 16 (after signature + IHDR length + IHDR type)
    // Width at byte 16, Height at byte 20 (big endian)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

console.log('icon.png:', getDimensions(path.join(__dirname, 'assets/icon.png')));
console.log('adaptive-icon.png:', getDimensions(path.join(__dirname, 'assets/adaptive-icon.png')));
