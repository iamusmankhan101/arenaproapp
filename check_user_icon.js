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

const userIconPath = 'src/images/Screenshot 2026-02-10 155650.png';
console.log('User Icon:', getDimensions(path.join(__dirname, userIconPath)));
