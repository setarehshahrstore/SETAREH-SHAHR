const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to replace hardcoded strings with state values.
  // First, ensure useAppState is imported.
  const hasUseAppState = content.includes('useAppState');
  
  if (content.includes('فروشگاه ستاره شهر') || content.includes('0799445566') || content.includes('چهارراهی پشتونستان')) {
    
    // Auto import useAppState if missing, assuming it's in most components
    if (!hasUseAppState && !file.includes('AppContext') && !file.includes('mockData')) {
      const depth = file.split('/').length - 2;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      content = content.replace(/(import React.*?;\n)/, `$1import { useAppState } from '${prefix}AppContext';\n`);
    }

    // Now, some files don't have `const { state } = useAppState();`
    // It's a bit tricky to inject it automatically into every functional component.
    // However, many files already have it.
    
    // Instead of doing it everywhere, let's just use regular expressions where state is already available
    // or let's do a generic replacement if we know how.

  }
});
