const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = 'C:\\Users\\Getaruch\\.gemini\\antigravity\\brain\\9cb8cf6a-fa33-4edf-ac81-b58d656d3965\\media__1776093832365.png';
const mainLogo = path.join(__dirname, 'public', 'logo.png');
const favicon = path.join(__dirname, 'public', 'favicon.png');

fs.copyFileSync(inputFile, mainLogo);

sharp(inputFile).metadata().then(metadata => {
    // Define crop for the flame (left side)
    const size = metadata.height; 
    // We assume the flame is roughly 35% of the total width
    const cropWidth = Math.floor(metadata.width * 0.35);
    
    sharp(inputFile)
        .extract({ left: 0, top: 0, width: cropWidth, height: size })
        .resize(128, 128, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toFile(favicon)
        .then(() => console.log('Favicon cropped successfully!'))
        .catch(err => console.error('Error cropping image:', err));
}).catch(console.error);
