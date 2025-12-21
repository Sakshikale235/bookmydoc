const fs = require('fs');

const content = fs.readFileSync('./src/components/ui/chatbot/intents/normalization/medicalMap.ts', 'utf8');

// Extract the object content between { and }
const match = content.match(/export const medicalMap: Record<string, string> = \{([\s\S]*?)\};/);
if (!match) {
  console.log('Could not find object');
  process.exit(1);
}

const objectContent = match[1];

// Find all keys
const keyRegex = /^\s*"([^"]+)":/gm;
const keys = [];
let match2;
while ((match2 = keyRegex.exec(objectContent)) !== null) {
  keys.push(match2[1]);
}

// Find duplicates
const seen = new Set();
const duplicates = new Set();

for (const key of keys) {
  if (seen.has(key)) {
    duplicates.add(key);
  } else {
    seen.add(key);
  }
}

if (duplicates.size > 0) {
  console.log('Duplicate keys found:');
  duplicates.forEach(key => console.log(`"${key}"`));
} else {
  console.log('No duplicate keys found');
}
