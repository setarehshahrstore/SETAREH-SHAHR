const fs = require('fs');

const current = fs.readFileSync('src/components/Storefront.tsx', 'utf8');
const backup = fs.readFileSync('src/components/Storefront_backup.tsx', 'utf8');

// Extract the sections from backup (Hero to Contact Form)
const heroStart = backup.indexOf('{/* --- 2. Hero Section --- */}');
const footerStart = backup.indexOf('{/* --- 9. Footer --- */}');
if (heroStart === -1 || footerStart === -1) {
    console.error("Could not find sections in backup!");
    process.exit(1);
}
const sectionsToInject = backup.substring(heroStart, footerStart);

// Remove the duplicate header from current
const currentHeaderStart = current.indexOf('{/* Header */}');
const currentCatalogStart = current.indexOf('{/* Main Catalog */}');
if (currentHeaderStart === -1 || currentCatalogStart === -1) {
    console.error("Could not find sections in current!");
    process.exit(1);
}
let modifiedCurrent = current.substring(0, currentHeaderStart) + sectionsToInject + current.substring(currentCatalogStart);

// Also need to add imports if missing
const importsToAdd = ['Phone', 'Tag', 'Star', 'Users', 'Truck', 'ArrowLeft', 'Mail', 'MapPin', 'Clock', 'ShieldCheck', 'MessageCircle', 'ChevronLeft', 'Droplets', 'Coffee', 'Home', 'Baby', 'Box'];
let importMatch = modifiedCurrent.match(/import \{([^}]+)\} from 'lucide-react';/);
if (importMatch) {
  let existingImports = importMatch[1].split(',').map(s => s.trim());
  let newImports = new Set([...existingImports, ...importsToAdd]);
  modifiedCurrent = modifiedCurrent.replace(importMatch[0], `import { ${Array.from(newImports).join(', ')} } from 'lucide-react';`);
}

// Add motion import
if (!modifiedCurrent.includes('motion/react')) {
  modifiedCurrent = modifiedCurrent.replace(/import React[^;]+;/, match => match + "\nimport { motion, AnimatePresence } from 'motion/react';");
}

fs.writeFileSync('src/components/Storefront.tsx', modifiedCurrent);
console.log('Merge complete!');
