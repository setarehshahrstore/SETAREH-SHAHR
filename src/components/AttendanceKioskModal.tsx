import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, QrCode, UserCheck, X, CheckCircle2, 
  AlertCircle, RefreshCw, KeyRound, Sparkles, Clock, Volume2, ShieldCheck, Download
} from 'lucide-react';
import jsQR from 'jsqr';

export interface TimeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO string
  clockOutTime?: string; // ISO string
  clockInPhoto?: string; // Base64 snapshot image
  clockOutPhoto?: string; // Base64 snapshot image
  clockInMethod?: 'QR_CODE' | 'FACE_SCAN' | 'EMPLOYEE_ID' | 'BULK_ADMIN' | 'MANUAL';
  clockOutMethod?: 'QR_CODE' | 'FACE_SCAN' | 'EMPLOYEE_ID' | 'BULK_ADMIN' | 'MANUAL';
  deviceInfo?: string;
  note?: string;
}

export interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: string;
  employeeCode?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
  avatar?: string;
  baseSalaryAFN?: number;
  payments?: any[];
  timeRecords?: TimeRecord[];
}

interface AttendanceKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttendanceRecorded?: () => void;
}

export const AttendanceKioskModal: React.FC<AttendanceKioskModalProps> = ({ isOpen, onClose, onAttendanceRecorded }) => {
  const [mode, setMode] = useState<'QR_SCAN' | 'FACE_SNAP' | 'EMPLOYEE_ID'>('QR_SCAN');
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [employeeCodeInput, setEmployeeCodeInput] = useState<string>('');
  
  // Camera States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Success / Status feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    user?: AppUser;
    action?: 'IN' | 'OUT';
    time?: string;
    photo?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const loadUsers = (): AppUser[] => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize codes to STS + 4 digits if legacy EMP
          return parsed.map((u: any, idx: number) => ({
            ...u,
            employeeCode: u.employeeCode && u.employeeCode.startsWith('STS')
              ? u.employeeCode
              : `STS${1001 + idx}`,
            avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          }));
        }
      } catch (e) {}
    }
    return [
      { username: 'admin@stc.com', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', employeeCode: 'STS1001', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
      { username: 'admin', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', employeeCode: 'STS1001', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
      { username: 'manager', passwordHash: 'manager', fullName: 'مدیر کل', role: 'Manager', employeeCode: 'STS1002', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', status: 'Active', baseSalaryAFN: 25000, payments: [], timeRecords: [] },
      { username: 'cashier', passwordHash: 'cashier', fullName: 'صندوق‌دار', role: 'Cashier', employeeCode: 'STS1003', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', status: 'Active', baseSalaryAFN: 15000, payments: [], timeRecords: [] },
      { username: 'warehouse', passwordHash: 'warehouse', fullName: 'مسئول گدام', role: 'Warehouse Staff', employeeCode: 'STS1004', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80', status: 'Active', baseSalaryAFN: 12000, payments: [], timeRecords: [] }
    ];
  };

  useEffect(() => {
    if (isOpen) {
      const users = loadUsers();
      setEmployees(users);
      if (users.length > 0) {
        setSelectedUser(users[0].username);
      }
      setFeedback(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
          startQrScanningLoop();
        }
      } else {
        setCameraError('دسترسی به دوربین در این مرورگر پشتیبانی نمی‌شود.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('لطفاً دسترسی به دوربین را مجاز کنید یا از حالت ثبت با کد کارمندی استفاده نمایید.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture current camera video frame as Base64 JPEG photo
  const capturePhoto = (): string | undefined => {
    if (!videoRef.current || !cameraActive) return undefined;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.75);
      }
    } catch (e) {
      console.error('Failed to capture photo:', e);
    }
    return undefined;
  };

  // QR Scanning Loop using jsQR
  const startQrScanningLoop = () => {
    isScanningRef.current = true;

    const scanFrame = () => {
      if (!isScanningRef.current) return;

      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            handleQrCodeDetected(code.data);
            return; // Pause scanning while processing
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  // Play audio beep sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  };

  // Process QR code content
  const handleQrCodeDetected = (qrContent: string) => {
    // Expected format: "STC_EMP:<username_or_code>" or JSON or raw username
    let identifier = qrContent.trim();
    if (identifier.startsWith('STC_EMP:')) {
      identifier = identifier.replace('STC_EMP:', '').trim();
    } else {
      try {
        const parsed = JSON.parse(identifier);
        if (parsed.username) identifier = parsed.username;
        else if (parsed.code) identifier = parsed.code;
      } catch (e) {}
    }

    const allUsers = loadUsers();
    const targetUser = allUsers.find(u => 
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.fullName.toLowerCase() === identifier.toLowerCase() ||
      (u.employeeCode && u.employeeCode.toLowerCase() === identifier.toLowerCase())
    );

    if (targetUser) {
      playBeep();
      processPunch(targetUser, 'QR_CODE');
    } else {
      setFeedback({
        type: 'error',
        title: 'کد شناسایی نامعتبر',
        message: `پرسنلی با کد یا بارکد "${identifier}" در سیستم یافت نشد.`
      });
      // resume scan after 2.5 seconds
      setTimeout(() => {
        if (isScanningRef.current) startQrScanningLoop();
      }, 2500);
    }
  };

  // Process Clock In / Clock Out punch
  const processPunch = (user: AppUser, method: 'QR_CODE' | 'FACE_SCAN' | 'EMPLOYEE_ID') => {
    setLoading(true);
    const photo = capturePhoto();
    const allUsers = loadUsers();
    const index = allUsers.findIndex(u => u.username === user.username);
    
    if (index === -1) {
      setFeedback({
        type: 'error',
        title: 'خطا',
        message: 'کاربر مورد نظر در پایگاه داده پیدا نشد.'
      });
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    const todayDate = now.split('T')[0];
    const formattedTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const records = allUsers[index].timeRecords || [];

    // Check if user is currently clocked in (last record has no clockOutTime)
    const hasOpenShift = records.length > 0 && !records[records.length - 1].clockOutTime;

    let action: 'IN' | 'OUT' = 'IN';

    if (hasOpenShift) {
      // Clock Out
      action = 'OUT';
      records[records.length - 1].clockOutTime = now;
      records[records.length - 1].clockOutPhoto = photo;
      records[records.length - 1].clockOutMethod = method;
    } else {
      // Clock In
      action = 'IN';
      const newRecord: TimeRecord = {
        id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: todayDate,
        clockInTime: now,
        clockInPhoto: photo,
        clockInMethod: method
      };
      records.push(newRecord);
    }

    allUsers[index].timeRecords = records;
    localStorage.setItem('AFG_STORE_USERS', JSON.stringify(allUsers));
    setEmployees(allUsers);

    setFeedback({
      type: 'success',
      title: action === 'IN' ? 'شروع شیفت کاری با موفقیت ثبت شد' : 'پایان شیفت کاری با موفقیت ثبت شد',
      message: `${user.fullName} (${user.role}) - ساعت ${formattedTime}`,
      user: allUsers[index],
      action,
      time: formattedTime,
      photo
    });

    setLoading(false);
    if (onAttendanceRecorded) onAttendanceRecorded();

    // Auto resume scanner after 4 seconds if in QR mode
    setTimeout(() => {
      if (mode === 'QR_SCAN' && isOpen) {
        setFeedback(null);
        startQrScanningLoop();
      }
    }, 4000);
  };

  const handleFaceSnapSubmit = () => {
    const allUsers = loadUsers();
    const target = allUsers.find(u => u.username === selectedUser);
    if (target) {
      playBeep();
      processPunch(target, 'FACE_SCAN');
    }
  };

  const handleEmployeeCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCodeInput.trim()) return;

    const allUsers = loadUsers();
    const code = employeeCodeInput.trim().toLowerCase();
    const target = allUsers.find(u => 
      (u.employeeCode && u.employeeCode.toLowerCase() === code) ||
      u.username.toLowerCase() === code ||
      u.phone === code
    );

    if (target) {
      playBeep();
      processPunch(target, 'EMPLOYEE_ID');
      setEmployeeCodeInput('');
    } else {
      setFeedback({
        type: 'error',
        title: 'کد پرسنلی اشتباه است',
        message: `کارمندی با شماره پرسنلی "${employeeCodeInput}" ثبت نشده است.`
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1F3A] via-[#123B66] to-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                کیوسک و سیستم هوشمند ثبت حضور و غیاب
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">زنده</span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">اسکن QR بارکد پرسنلی، ثبت چهره تصویری یا کد کارمندی</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-100 p-2 grid grid-cols-3 gap-1 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => { setMode('QR_SCAN'); setFeedback(null); startQrScanningLoop(); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'QR_SCAN' 
                ? 'bg-white text-[#0B1F3A] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            اسکن بارکد QR (گوشی یا کارت)
          </button>
          
          <button
            onClick={() => { setMode('FACE_SNAP'); setFeedback(null); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'FACE_SNAP' 
                ? 'bg-white text-[#0B1F3A] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            ثبت تصویری چهره (Face Snap)
          </button>

          <button
            onClick={() => { setMode('EMPLOYEE_ID'); setFeedback(null); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'EMPLOYEE_ID' 
                ? 'bg-white text-[#0B1F3A] shadow-sm font-black' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-600" />
            کد پرسنلی / شناسه
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* Camera Viewport (Used for QR and Face Snap) */}
          {(mode === 'QR_SCAN' || mode === 'FACE_SNAP') && (
            <div className="relative w-full aspect-[4/3] max-h-[300px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-2 border-slate-700 flex items-center justify-center">
              
              {/* Video Element */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror transform -scale-x-100"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning Target Box for QR */}
              {mode === 'QR_SCAN' && cameraActive && !feedback && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-[#D4AF37] rounded-3xl relative animate-pulse">
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl"></div>
                    
                    {/* Laser scanning line */}
                    <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] absolute top-1/2 -translate-y-1/2 animate-bounce"></div>
                  </div>
                  <div className="absolute bottom-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                    کارت پرسنلی یا بارکد روی گوشی را مقابل دوربین نگه دارید
                  </div>
                </div>
              )}

              {/* Camera Offline Warning */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                  <button 
                    onClick={startCamera}
                    className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    تلاش مجدد اتصال دوربین
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback Card (Shown on Punch In / Out) */}
          {feedback && (
            <div className={`p-4 rounded-2xl border ${
              feedback.type === 'success' 
                ? feedback.action === 'IN' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            } flex items-center gap-4 animate-in zoom-in-95 duration-200 shadow-sm`}>
              
              {feedback.photo ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-200">
                  <img src={feedback.photo} alt="Punch Photo" className="w-full h-full object-cover" />
                  <div className={`absolute bottom-0 inset-x-0 text-[8px] font-black text-center text-white py-0.5 ${
                    feedback.action === 'IN' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {feedback.action === 'IN' ? 'ورود' : 'خروج'}
                  </div>
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  feedback.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {feedback.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-black text-sm">{feedback.title}</h4>
                  {feedback.time && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/80 border font-bold">
                      {feedback.time}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-90">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* Mode 2: Face Snap Form */}
          {mode === 'FACE_SNAP' && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">انتخاب پرسنل جهت ثبت چهره:</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B1F3A]"
                >
                  {employees.filter(e => e.status !== 'Inactive').map(emp => {
                    const hasOpen = emp.timeRecords && emp.timeRecords.length > 0 && !emp.timeRecords[emp.timeRecords.length - 1].clockOutTime;
                    return (
                      <option key={emp.username} value={emp.username}>
                        {emp.fullName} ({emp.role}) - {hasOpen ? '🟢 حاضر (ثبت خروج)' : '⚪ خارج (ثبت ورود)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleFaceSnapSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0B1F3A] to-[#123B66] hover:from-[#123B66] hover:to-[#0B1F3A] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                گرفتن عکس زنده و ثبت تردد (Clock In / Out)
              </button>
            </div>
          )}

          {/* Mode 3: Employee ID Form */}
          {mode === 'EMPLOYEE_ID' && (
            <form onSubmit={handleEmployeeCodeSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره پرسنلی یا نام کاربری:</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="مثال: EMP-001 یا cashier یا manager"
                    value={employeeCodeInput}
                    onChange={(e) => setEmployeeCodeInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">پرسنل می‌توانند کد پرسنلی اختصاصی خود را وارد نموده و تایید کنند.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1F3A] hover:bg-[#123B66] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                ثبت ورود / خروج با کد پرسنلی
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-3 px-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            تمامی ترددها همراه با عکس زنده و تاریخچه در سیستم ذخیره می‌گردند.
          </span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
