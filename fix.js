const fs = require('fs');
const file = 'frontend/src/components/profile/EditProfile.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\"/g, '"');
fs.writeFileSync(file, content);
