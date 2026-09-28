const PImage = require('pureimage');
const fs = require('fs');
const https = require('https');

// एक शानदार और बोल्ड फॉन्ट डाउनलोड करना
const fontUrl = 'https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Black.ttf';
const fontPath = 'Roboto-Black.ttf';

const downloadFont = () => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fontPath);
        https.get(fontUrl, (response) => {
            response.pipe(file);
            file.on('finish', () => { file.close(resolve); });
        }).on('error', reject);
    });
};

const createIcon = async () => {
    console.log('\n🌟 1. आपका कस्टम फॉन्ट डाउनलोड हो रहा है...');
    await downloadFont();

    const fnt = PImage.registerFont(fontPath, 'Roboto');
    await new Promise(resolve => fnt.load(resolve));

    console.log('🎨 2. OX News का नया आइकॉन डिज़ाइन हो रहा है...');
    const img = PImage.make(1024, 1024);
    const ctx = img.getContext('2d');

    // प्रीमियम डार्क रेड (Dark Red) बैकग्राउंड
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(0, 0, 1024, 1024);

    // नीचे की तरफ एक डार्क न्यूज़ स्ट्रिप
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 700, 1024, 324);

    // एक शानदार वाइट बॉर्डर
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 24;
    ctx.strokeRect(30, 30, 964, 964);

    // बीच में बड़ा और बोल्ड "OX"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "320pt 'Roboto'";
    ctx.fillText("OX", 190, 550);

    // नीचे न्यूज़ स्ट्रिप पर "NEWS"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "160pt 'Roboto'";
    ctx.fillText("NEWS", 210, 900);

    console.log('✅ 3. आपका ओरिजिनल .png आइकॉन सेव हो रहा है...');
    await new Promise(resolve => {
        PImage.encodePNGToStream(img, fs.createWriteStream('assets/icon.png')).then(resolve);
    });
    await new Promise(resolve => {
        PImage.encodePNGToStream(img, fs.createWriteStream('assets/adaptive-icon.png')).then(resolve);
    });
    
    console.log('\n🎉 बधाई हो! आपका खुद का नया OX News आइकॉन सेट हो गया है!\n');
};

createIcon().catch(console.error);
