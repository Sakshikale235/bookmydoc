const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ui/chatbot/intents/normalization/medicalMap.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Extract the object content
const start = content.indexOf('{');
const end = content.lastIndexOf('}');
const objectContent = content.slice(start + 1, end);

// Split by lines
const lines = objectContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//'));

const map = {};
const duplicates = [];

for (let line of lines) {
  if (line.includes(':')) {
    const colonIndex = line.indexOf(':');
    const key = line.substring(0, colonIndex).trim().replace(/"/g, '');
    const value = line.substring(colonIndex + 1).trim().replace(/"/g, '').replace(',', '');
    if (map[key]) {
      duplicates.push(key);
    } else {
      map[key] = value;
    }
  }
}

console.log('Duplicate keys:', duplicates);
