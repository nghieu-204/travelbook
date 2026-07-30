const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace variants
    content = content.replace(/SkyTravel/g, 'TravelBook');
    content = content.replace(/skytravel/g, 'travelbook');
    content = content.replace(/SKYTRAVEL/g, 'TRAVELBOOK');
    content = content.replace(/Sky Travel/g, 'Travel Book');
    content = content.replace(/sky travel/g, 'travel book');
    content = content.replace(/SKY-/g, 'TB-');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.agent' || file === '.antigravityignore') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (/\.(js|jsx|ts|tsx|md|json|css|html|env)$/.test(file)) {
            replaceInFile(fullPath);
        }
    }
}

traverse('d:/travel-booking-website/frontend');
traverse('d:/travel-booking-website/backend');
