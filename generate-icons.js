const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Dark background with rounded corners
    ctx.fillStyle = '#1a1a1a';
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    
    // Outer circle (white ring)
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.35;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner red recording dot
    const dotRadius = size * 0.18;
    
    // Add gradient to red dot
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, dotRadius);
    gradient.addColorStop(0, '#ff6666');
    gradient.addColorStop(1, '#cc0000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    return canvas;
}

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(imagesDir, `icon-${size}.png`);
    
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
});

console.log('All icons generated successfully!');