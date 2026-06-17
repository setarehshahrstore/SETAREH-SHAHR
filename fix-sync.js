
const fs = require('fs');
let content = fs.readFileSync('src/firebaseSync.ts', 'utf8');

const target = \      setState(prev => { 
        if (data.length === 0 && prev[col as keyof AppState] && (prev[col as keyof AppState] as any[]).length > 0) {
          // If firebase is empty but local has data, seed firebase!
          (prev[col as keyof AppState] as any[]).forEach(item => {
            setDoc(doc(db, col, item.id || Date.now().toString()), item).catch(console.error);
          });
          return prev;
        }
        return { ...prev, [col]: data, _fromFirebase: true } as AppState; 
      });\;

const replacement = \      setState(prev => { 
        return { ...prev, [col]: data, _fromFirebase: true } as AppState; 
      });\;

content = content.replace(target, replacement);
fs.writeFileSync('src/firebaseSync.ts', content);
console.log('Fixed sync');
