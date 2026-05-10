const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');
content = content.replace(/cursor-none/g, '');
fs.writeFileSync('src/components/Footer.tsx', content);
