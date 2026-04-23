const fs = require('fs');
const path = require('path');

function getDimensions(filePath) {
    if (!fs.existsSync(filePath)) return 'File not found';
    const buffer = fs.readFileSync(filePath);
    // PNG signature
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
        return 'Not a PNG';
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

console.log('icon_backup.png:', getDimensions(path.join(__dirname, 'assets/icon_backup.png')));
console.log('adaptive-icon_backup.png:', getDimensions(path.join(__dirname, 'assets/adaptive-icon_backup.png')));
