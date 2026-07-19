const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            // Remove all dark: classes (e.g. dark:bg-black, dark:text-white, dark:hover:bg-[#1a1a1a])
            // Also handle newlines or spaces before dark:
            content = content.replace(/\bdark:[^\s"'`]+(?=\s|["'`])/g, '');
            // Cleanup any double spaces created by removal
            content = content.replace(/\s{2,}/g, ' ');
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'frontend/src'));
console.log('Finished removing dark mode classes.');
