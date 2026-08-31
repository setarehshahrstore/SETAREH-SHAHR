const fs = require('fs');
let content = fs.readFileSync('src/components/Employees.tsx', 'utf-8');

if (!content.includes('interface TimeRecord')) {
  content = content.replace(
    'interface AppUser {',
    `interface TimeRecord {
  id: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
}

interface AppUser {`
  );
}

if (!content.includes('timeRecords?: TimeRecord[]')) {
  content = content.replace(
    'payments?: PaymentRecord[];',
    'payments?: PaymentRecord[];\n  timeRecords?: TimeRecord[];'
  );
}

// Ensure the DEFAULT_USERS has timeRecords: []
content = content.replace(/payments: \[\] \}/g, 'payments: [], timeRecords: [] }');

fs.writeFileSync('src/components/Employees.tsx', content);
