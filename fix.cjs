const fs = require('fs');
let content = fs.readFileSync('src/pages/Order.tsx', 'utf8');
content = content.replace(/cursor-none/g, '');
fs.writeFileSync('src/pages/Order.tsx', content);
