const fs = require('fs');
let text = fs.readFileSync('src/components/ContactUs.tsx', 'utf8');
text = text.replace(/<a href=\{`tel:\$\{state\.storeConfig\?\.phone \|\| "\{state\.storeConfig\?\.phone \|\| "\+93 796 626 004"\}"\}`\}/g, '<a href={`tel:${state.storeConfig?.phone || "+93 796 626 004"}`}');
fs.writeFileSync('src/components/ContactUs.tsx', text);
