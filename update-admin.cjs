const fs = require('fs');

let content = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf-8');

// Insert logic for clock in/out
if (!content.includes('const [isClockedIn')) {
  content = content.replace(
    'const navigate = useNavigate();',
    `const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedUsers = localStorage.getItem('AFG_STORE_USERS');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        const currentUser = parsed.find((u: any) => u.username === user.username);
        if (currentUser && currentUser.timeRecords && currentUser.timeRecords.length > 0) {
          const lastRecord = currentUser.timeRecords[currentUser.timeRecords.length - 1];
          if (!lastRecord.clockOutTime) {
            setIsClockedIn(true);
            setClockInTime(lastRecord.clockInTime);
          } else {
            setIsClockedIn(false);
            setClockInTime(null);
          }
        }
      }
    }
  }, [user]);

  const handleToggleClock = () => {
    if (!user) return;
    const savedUsers = localStorage.getItem('AFG_STORE_USERS');
    if (!savedUsers) return;
    const parsed = JSON.parse(savedUsers);
    const userIndex = parsed.findIndex((u: any) => u.username === user.username);
    if (userIndex === -1) return;
    
    const now = new Date().toISOString();
    
    if (isClockedIn) {
      // Clock out
      const timeRecords = parsed[userIndex].timeRecords || [];
      if (timeRecords.length > 0) {
        timeRecords[timeRecords.length - 1].clockOutTime = now;
      }
      setIsClockedIn(false);
      setClockInTime(null);
    } else {
      // Clock in
      const newRecord = {
        id: \`time-\${Date.now()}\`,
        date: new Date().toISOString().split('T')[0],
        clockInTime: now
      };
      if (!parsed[userIndex].timeRecords) {
        parsed[userIndex].timeRecords = [];
      }
      parsed[userIndex].timeRecords.push(newRecord);
      setIsClockedIn(true);
      setClockInTime(now);
    }
    
    localStorage.setItem('AFG_STORE_USERS', JSON.stringify(parsed));
  };`
  );
}

// Insert button in the header
if (!content.includes('onClick={handleToggleClock}')) {
  content = content.replace(
    '<div className="flex items-center gap-3">',
    `<div className="flex items-center gap-3">
            <button 
              onClick={handleToggleClock}
              className={\`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors \${isClockedIn ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}\`}
            >
              {isClockedIn ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  پایان کار (خروج)
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  شروع کار (ورود)
                </>
              )}
            </button>`
  );
}

fs.writeFileSync('src/layouts/AdminLayout.tsx', content);
