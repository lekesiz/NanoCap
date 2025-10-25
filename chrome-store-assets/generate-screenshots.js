// Generate placeholder screenshots for Chrome Web Store
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const screenshots = [
    {
        filename: 'screenshot-1.png',
        title: 'Main Interface',
        subtitle: 'Simple one-click recording',
        features: ['Quality presets', 'Audio options', 'Size estimates', 'Easy controls']
    },
    {
        filename: 'screenshot-2.png',
        title: 'Recording Active',
        subtitle: 'Real-time status and timer',
        features: ['Live timer', 'Recording indicator', 'Stop button', 'CPU usage monitor']
    },
    {
        filename: 'screenshot-3.png',
        title: 'Ultra Compression',
        subtitle: 'Files 80% smaller than competitors',
        features: ['VP9/AV1 codecs', '1-5 MB per minute', 'No quality loss', 'Fast processing']
    },
    {
        filename: 'screenshot-4.png',
        title: 'Privacy First',
        subtitle: '100% local processing',
        features: ['No data collection', 'No server uploads', 'Open source code', 'Fully secure']
    },
    {
        filename: 'screenshot-5.png',
        title: 'Advanced Features',
        subtitle: 'Professional recording tools',
        features: ['Microphone mixing', 'Auto-split recording', 'Multiple formats', 'Custom quality']
    }
];

function createScreenshot(config) {
    const canvas = createCanvas(1280, 800);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d2d2d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 800);
    
    // Add subtle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(i * 64, j * 40, 64, 40);
            }
        }
    }
    
    // Red accent bar
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(0, 0, 1280, 8);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(config.title, 640, 200);
    
    // Subtitle
    ctx.fillStyle = '#ff3333';
    ctx.font = '36px Arial';
    ctx.fillText(config.subtitle, 640, 280);
    
    // Feature box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(240, 340, 800, 300);
    
    // Features
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    config.features.forEach((feature, i) => {
        ctx.fillText(`✓  ${feature}`, 640, 400 + i * 60);
    });
    
    // Logo/Brand
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎥 NanoCap', 50, 750);
    
    // Version
    ctx.fillStyle = '#888888';
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('v0.3.0', 1230, 750);
    
    return canvas;
}

// Create screenshots directory if it doesn't exist
const outputDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Generate each screenshot
screenshots.forEach((config, index) => {
    console.log(`Generating ${config.filename}...`);
    
    const canvas = createScreenshot(config);
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(outputDir, config.filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Saved ${config.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
});

console.log(`\nAll ${screenshots.length} screenshots generated successfully!`);
console.log(`Location: ${outputDir}`);