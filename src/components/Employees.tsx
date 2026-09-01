import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, ShieldCheck, Mail, Phone, Plus, X, ShieldAlert, Edit2, Trash2, 
  KeyRound, Banknote, CalendarClock, CreditCard, Printer, FileText, 
  CheckCircle2, CheckSquare, Camera, QrCode, Clock, Eye, Download, 
  Search, Filter, PlayCircle, StopCircle, RefreshCw, UserCheck, AlertCircle, 
  ChevronDown, CalendarDays, Upload, Image as ImageIcon, Sparkles, Building2, MapPin
} from 'lucide-react';
import QRCode from 'qrcode';
import { UserRole } from '../AuthContext';
import { useAppState } from '../AppContext';
import { AttendanceKioskModal } from './AttendanceKioskModal';
import { EmployeeIdCardModal } from './EmployeeIdCardModal';
import { EmployeeScheduleManager, DEFAULT_WEEKLY_SCHEDULE } from './EmployeeScheduleManager';
import { StoreHoursManager } from './StoreHoursManager';
import { AppUser, PaymentRecord, TimeRecord, WeeklySchedule } from '../types';

export const generateNextStsCode = (users: AppUser[]): string => {
  let highest = 1000;
  users.forEach(u => {
    if (u.employeeCode) {
      const match = u.employeeCode.match(/STS(\d{4})/i);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > highest) {
          highest = val;
        }
      }
    }
  });
  return `STS${highest + 1}`;
};

const DEFAULT_USERS: AppUser[] = [
  { 
    username: 'admin@stc.com', 
    passwordHash: 'Admin$', 
    fullName: 'مالک فروشگاه', 
    role: 'Owner', 
    employeeCode: 'STS1001', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    phone: '0799445566',
    department: 'مدیریت ارشد',
    status: 'Active', 
    baseSalaryAFN: 0, 
    schedule: DEFAULT_WEEKLY_SCHEDULE,
    payments: [], 
    timeRecords: [] 
  },
  { 
    username: 'admin', 
    passwordHash: 'Admin$', 
    fullName: 'مالک فروشگاه', 
    role: 'Owner', 
    employeeCode: 'STS1001', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    phone: '0799445566',
    department: 'مدیریت ارشد',
    status: 'Active', 
    baseSalaryAFN: 0, 
    schedule: DEFAULT_WEEKLY_SCHEDULE,
    payments: [], 
    timeRecords: [] 
  },
  { 
    username: 'manager', 
    passwordHash: 'manager', 
    fullName: 'مدیر کل اجرایی', 
    role: 'Manager', 
    employeeCode: 'STS1002', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    phone: '0788112233',
    department: 'مدیریت داخلی',
    status: 'Active', 
    baseSalaryAFN: 25000, 
    schedule: DEFAULT_WEEKLY_SCHEDULE,
    payments: [], 
    timeRecords: [] 
  },
  { 
    username: 'cashier', 
    passwordHash: 'cashier', 
    fullName: 'صندوق‌دار شعبه ۱', 
    role: 'Cashier', 
    employeeCode: 'STS1003', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    phone: '0777556677',
    department: 'صندوق و فروشات',
    status: 'Active', 
    baseSalaryAFN: 15000, 
    schedule: DEFAULT_WEEKLY_SCHEDULE,
    payments: [], 
    timeRecords: [] 
  },
  { 
    username: 'warehouse', 
    passwordHash: 'warehouse', 
    fullName: 'مسئول گدام مرکزی', 
    role: 'Warehouse Staff', 
    employeeCode: 'STS1004', 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    phone: '0744998877',
    department: 'انبار و گدام',
    status: 'Active', 
    baseSalaryAFN: 12000, 
    schedule: DEFAULT_WEEKLY_SCHEDULE,
    payments: [], 
    timeRecords: [] 
  }
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
];

export const Employees: React.FC = () => {
  const { addExpense, deleteExpense } = useAppState();
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [activeTab, setActiveTab] = useState<'STAFF' | 'SCHEDULE_LEAVE' | 'ATTENDANCE_LOGS' | 'BULK_ATTENDANCE' | 'QR_BADGES' | 'STORE_HOURS'>('STAFF');
  
  // Modals
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);

  // ID Card Badge Modal
  const [idCardModalEmp, setIdCardModalEmp] = useState<AppUser | null>(null);

  // Edit Time Record Modal
  const [editingTimeRecord, setEditingTimeRecord] = useState<{ user: AppUser; record: TimeRecord } | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editNote, setEditNote] = useState('');

  // Bulk Attendance State
  const [selectedEmpUsernames, setSelectedEmpUsernames] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'IN' | 'OUT'>('IN');
  const [bulkTime, setBulkTime] = useState<string>('');
  const [bulkNote, setBulkNote] = useState<string>('ثبت گروهی توسط مدیریت');

  // Filter logs state
  const [logFilterUser, setLogFilterUser] = useState<string>('ALL');
  const [logFilterDate, setLogFilterDate] = useState<string>('');

  // Employee Add/Edit Form
  const [empForm, setEmpForm] = useState<AppUser>({
    username: '',
    passwordHash: '',
    fullName: '',
    role: 'Cashier',
    employeeCode: 'STS1001',
    phone: '',
    department: 'فروشگاه',
    status: 'Active',
    avatar: '',
    baseSalaryAFN: 0,
    payments: [],
    timeRecords: [],
    schedule: DEFAULT_WEEKLY_SCHEDULE
  });
  const [photoError, setPhotoError] = useState(false);

  // Live Camera Snapshot tool state for modal
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Admin Security Pin Modal
  const [adminPinModal, setAdminPinModal] = useState<{ isOpen: boolean, action: () => void }>({ isOpen: false, action: () => {} });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // HR Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeEmp, setActiveEmp] = useState<AppUser | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [receiptData, setReceiptData] = useState<{ payment: PaymentRecord; emp: AppUser } | null>(null);

  const loadFromStorage = () => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize codes to STS + 4 digits format if EMP
          const normalized = parsed.map((u: any, idx: number) => {
            let code = u.employeeCode;
            if (!code || !code.startsWith('STS')) {
              code = `STS${1001 + idx}`;
            }
            return {
              ...u,
              employeeCode: code,
              avatar: u.avatar || PRESET_AVATARS[idx % PRESET_AVATARS.length],
              schedule: u.schedule || DEFAULT_WEEKLY_SCHEDULE,
              timeRecords: u.timeRecords || [],
              payments: u.payments || []
            };
          });
          setEmployees(normalized);
          return;
        }
      } catch (err) {}
    }
    setEmployees(DEFAULT_USERS);
  };

  useEffect(() => {
    loadFromStorage();
  }, []);

  const saveToStorage = (users: AppUser[]) => {
    setEmployees(users);
    localStorage.setItem('AFG_STORE_USERS', JSON.stringify(users));
  };

  const requireAdminPin = (action: () => void) => {
    setPinInput('');
    setPinError(false);
    setAdminPinModal({ isOpen: true, action });
  };

  const verifyPinAndExecute = () => {
    let isValid = pinInput === 'Admin$' || pinInput === 'admin';
    if (!isValid) {
      const savedUsers = localStorage.getItem('AFG_STORE_USERS');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          if (Array.isArray(parsed)) {
            const adminUser = parsed.find((u: any) => u.role === 'Owner' || u.username?.toLowerCase() === 'admin@stc.com' || u.username?.toLowerCase() === 'admin');
            if (adminUser && adminUser.passwordHash === pinInput) {
              isValid = true;
            }
          }
        } catch (e) {}
      }
    }

    if (isValid) {
      adminPinModal.action();
      setAdminPinModal({ isOpen: false, action: () => {} });
    } else {
      setPinError(true);
    }
  };

  // Camera Management for Photo Capture
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('دوربین در این مرورگر پشتیبانی نمی‌شود.');
      }
    } catch (e) {
      setCameraError('دسترسی به دوربین داده نشد یا دستگاه دوربین متصل نیست.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw centered square crop from video
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 480;
        const size = Math.min(vw, vh);
        const sx = (vw - size) / 2;
        const sy = (vh - size) / 2;
        ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEmpForm(prev => ({ ...prev, avatar: dataUrl }));
        setPhotoError(false);
        stopCamera();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle File Upload for Avatar
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEmpForm(prev => ({ ...prev, avatar: reader.result as string }));
          setPhotoError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that photo is required!
    if (!empForm.avatar || empForm.avatar.trim() === '') {
      setPhotoError(true);
      alert('عکس پرسنلی برای صدور کارت شناسایی و کیوسک تردد الزامی است. لطفاً عکس آپلود کنید یا با دوربین عکس بگیرید.');
      return;
    }

    requireAdminPin(() => {
      let updated: AppUser[];
      const code = empForm.employeeCode || generateNextStsCode(employees);
      const payload: AppUser = { 
        ...empForm, 
        employeeCode: code,
        schedule: empForm.schedule || DEFAULT_WEEKLY_SCHEDULE
      };

      if (editingUsername) {
        updated = employees.map(emp => emp.username === editingUsername ? payload : emp);
      } else {
        if (employees.find(e => e.username.toLowerCase() === empForm.username.toLowerCase())) {
          alert('این نام کاربری از قبل وجود دارد.');
          return;
        }
        updated = [...employees, payload];
      }
      saveToStorage(updated);
      setIsModalOpen(false);
      stopCamera();
    });
  };

  const handleDelete = (username: string) => {
    if (username === 'admin@stc.com' || username === 'admin') {
      alert('اکانت مالک اصلی قابل حذف نیست!');
      return;
    }
    requireAdminPin(() => {
      saveToStorage(employees.filter(emp => emp.username !== username));
    });
  };

  const openEdit = (emp: AppUser) => {
    setEmpForm({
      ...emp,
      avatar: emp.avatar || PRESET_AVATARS[0],
      employeeCode: emp.employeeCode || generateNextStsCode(employees)
    });
    setEditingUsername(emp.username);
    setPhotoError(false);
    setIsCameraActive(false);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    const nextCode = generateNextStsCode(employees);
    setEmpForm({
      username: '',
      passwordHash: '',
      fullName: '',
      role: 'Cashier',
      employeeCode: nextCode,
      phone: '',
      department: 'فروشگاه',
      status: 'Active',
      avatar: PRESET_AVATARS[0],
      baseSalaryAFN: 0,
      payments: [],
      timeRecords: [],
      schedule: DEFAULT_WEEKLY_SCHEDULE
    });
    setEditingUsername(null);
    setPhotoError(false);
    setIsCameraActive(false);
    setIsModalOpen(true);
  };

  const openPaymentModal = (emp: AppUser) => {
    requireAdminPin(() => {
      setActiveEmp(emp);
      setPayAmount('');
      setPayNote('');
      setIsPaymentModalOpen(true);
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmp || !payAmount) return;

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amountNum,
      currency: 'AFN',
      note: payNote || 'پرداخت حقوق'
    };

    addExpense({
      id: newPayment.id,
      date: newPayment.date,
      category: 'حقوق و دستمزد',
      description: `پرداختی به ${activeEmp.fullName} - ${newPayment.note}`,
      amountAFN: amountNum,
      amountUSD: 0,
      amount: amountNum,
      currency: 'AFN'
    });

    const updatedEmp = {
      ...activeEmp,
      payments: [...(activeEmp.payments || []), newPayment]
    };

    const updatedEmployees = employees.map(emp => emp.username === activeEmp.username ? updatedEmp : emp);
    saveToStorage(updatedEmployees);
    setActiveEmp(updatedEmp);
    setPayAmount('');
    setPayNote('');
    setReceiptData({ payment: newPayment, emp: updatedEmp });
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!activeEmp) return;
    deleteExpense(paymentId);
    const updatedEmp = {
      ...activeEmp,
      payments: (activeEmp.payments || []).filter(p => p.id !== paymentId)
    };
    const updatedEmployees = employees.map(emp => emp.username === activeEmp.username ? updatedEmp : emp);
    saveToStorage(updatedEmployees);
    setActiveEmp(updatedEmp);
  };

  // Bulk Attendance Execution by Admin
  const handleExecuteBulkAttendance = () => {
    if (selectedEmpUsernames.length === 0) {
      alert('لطفاً حداقل یک کارمند را انتخاب نمایید.');
      return;
    }

    requireAdminPin(() => {
      const now = bulkTime ? new Date(bulkTime).toISOString() : new Date().toISOString();
      const dateStr = now.split('T')[0];

      const updated = employees.map(emp => {
        if (!selectedEmpUsernames.includes(emp.username)) return emp;

        const records = [...(emp.timeRecords || [])];
        if (bulkActionType === 'IN') {
          records.push({
            id: `time-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            date: dateStr,
            clockInTime: now,
            clockInMethod: 'BULK_ADMIN',
            note: bulkNote || 'ورود گروهی توسط مدیر'
          });
        } else {
          if (records.length > 0 && !records[records.length - 1].clockOutTime) {
            records[records.length - 1].clockOutTime = now;
            records[records.length - 1].clockOutMethod = 'BULK_ADMIN';
            records[records.length - 1].note = (records[records.length - 1].note ? records[records.length - 1].note + ' - ' : '') + (bulkNote || 'خروج گروهی توسط مدیر');
          } else {
            records.push({
              id: `time-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              date: dateStr,
              clockInTime: now,
              clockOutTime: now,
              clockInMethod: 'BULK_ADMIN',
              clockOutMethod: 'BULK_ADMIN',
              note: bulkNote || 'خروج گروهی توسط مدیر'
            });
          }
        }
        return { ...emp, timeRecords: records };
      });

      saveToStorage(updated);
      setSelectedEmpUsernames([]);
      alert(`عملیات ${bulkActionType === 'IN' ? 'ورود گروهی' : 'خروج گروهی'} برای ${selectedEmpUsernames.length} کارمند با موفقیت ثبت شد.`);
    });
  };

  // Open Edit Time Record Modal
  const openEditTimeRecord = (user: AppUser, record: TimeRecord) => {
    requireAdminPin(() => {
      setEditingTimeRecord({ user, record });
      setEditClockIn(record.clockInTime ? record.clockInTime.slice(0, 16) : '');
      setEditClockOut(record.clockOutTime ? record.clockOutTime.slice(0, 16) : '');
      setEditNote(record.note || '');
    });
  };

  // Save Edited Time Record
  const handleSaveEditedTimeRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeRecord) return;

    const { user, record } = editingTimeRecord;
    const updatedUsers = employees.map(emp => {
      if (emp.username !== user.username) return emp;
      const updatedRecords = (emp.timeRecords || []).map(r => {
        if (r.id !== record.id) return r;
        return {
          ...r,
          clockInTime: editClockIn ? new Date(editClockIn).toISOString() : r.clockInTime,
          clockOutTime: editClockOut ? new Date(editClockOut).toISOString() : undefined,
          note: editNote
        };
      });
      return { ...emp, timeRecords: updatedRecords };
    });

    saveToStorage(updatedUsers);
    setEditingTimeRecord(null);
    alert('رکورد تردد با موفقیت ویرایش گردید.');
  };

  // Delete Time Record
  const handleDeleteTimeRecord = (username: string, recordId: string) => {
    requireAdminPin(() => {
      const updatedUsers = employees.map(emp => {
        if (emp.username !== username) return emp;
        return {
          ...emp,
          timeRecords: (emp.timeRecords || []).filter(r => r.id !== recordId)
        };
      });
      saveToStorage(updatedUsers);
      alert('رکورد تردد مورد نظر حذف شد.');
    });
  };

  // Flatten all logs for the Attendance Log Table
  const allLogs: { user: AppUser; record: TimeRecord }[] = [];
  employees.forEach(u => {
    (u.timeRecords || []).forEach(r => {
      allLogs.push({ user: u, record: r });
    });
  });
  allLogs.sort((a, b) => new Date(b.record.clockInTime).getTime() - new Date(a.record.clockInTime).getTime());

  // Filter logs
  const filteredLogs = allLogs.filter(item => {
    if (logFilterUser !== 'ALL' && item.user.username !== logFilterUser) return false;
    if (logFilterDate && item.record.date !== logFilterDate) return false;
    return true;
  });

  const calculateWorkDays = (timeRecords?: TimeRecord[]) => {
    if (!timeRecords || timeRecords.length === 0) return 0;
    const distinctDates = new Set(timeRecords.map(r => r.date));
    return distinctDates.size;
  };

  const calculateTotalWorkHours = (timeRecords?: TimeRecord[]) => {
    if (!timeRecords || timeRecords.length === 0) return 0;
    let totalMs = 0;
    timeRecords.forEach(r => {
      if (r.clockInTime && r.clockOutTime) {
        const diff = new Date(r.clockOutTime).getTime() - new Date(r.clockInTime).getTime();
        if (diff > 0) totalMs += diff;
      }
    });
    return Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
  };

  return (
    <div className="space-y-6 font-sans pb-12" dir="rtl">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] text-[#D4AF37] flex items-center justify-center shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">سیستم جامع منابع انسانی، شیفت‌ها و تردد پرسنل</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                کارت شناسایی با کد اختصاصی STS، تقویم کاری و شیفت‌های هفتگی، سیستم مرخصی و کیوسک هوشمند
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Launch Live Attendance Kiosk Scanner */}
          <button 
            onClick={() => setIsKioskOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3 rounded-2xl font-black text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-200 animate-pulse" />
            کیوسک زنده تردد (اسکن QR و چهره)
          </button>

          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-[#123B66] text-white px-4 py-3 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            افزودن کارمند جدید (STS)
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'STAFF'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          لیست پرسنل ({employees.filter(e => e.role !== 'Customer').length})
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULE_LEAVE')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'SCHEDULE_LEAVE'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-500" />
          شیفت‌ها و مرخصی پرسنل
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE_LOGS')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ATTENDANCE_LOGS'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          لاگ‌ها و عکس‌های تردد ({allLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('BULK_ATTENDANCE')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'BULK_ATTENDANCE'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          ثبت تردد گروهی
        </button>

        <button
          onClick={() => setActiveTab('QR_BADGES')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'QR_BADGES'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          کارت‌های شناسایی و QR
        </button>
        <button
          onClick={() => setActiveTab('STORE_HOURS')}
          className={`py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'STORE_HOURS'
              ? 'bg-[#0B1F3A] text-[#D4AF37] shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-500" />
          ساعات کار فروشگاه
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: Store Hours Manager */}
      {/* ========================================================================= */}
      {activeTab === 'STORE_HOURS' && (
        <StoreHoursManager />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: Staff Profiles, Cards, Salaries */}
      {/* ========================================================================= */}
      {activeTab === 'STAFF' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.filter(emp => emp.role !== 'Customer').map((emp, idx) => {
            const totalPaid = (emp.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const daysWorked = calculateWorkDays(emp.timeRecords);
            const totalHours = calculateTotalWorkHours(emp.timeRecords);
            const isOnline = emp.timeRecords && emp.timeRecords.length > 0 && !emp.timeRecords[emp.timeRecords.length - 1].clockOutTime;
            
            return (
              <div key={emp.username} className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${emp.status === 'Inactive' ? 'opacity-60' : ''}`}>
                <div className={`absolute top-0 right-0 w-2 h-full ${emp.role === 'Owner' || emp.role === 'Manager' ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`}></div>
                
                <div className="flex items-start justify-between mb-4 pl-2">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img 
                        src={emp.avatar || PRESET_AVATARS[0]} 
                        alt={emp.fullName} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37]/50 shadow-md bg-slate-100"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} title={isOnline ? 'حاضر در فروشگاه' : 'خارج از فروشگاه'}></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-base">{emp.fullName}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-mono font-black text-[#D4AF37] bg-[#0B1F3A] px-2 py-0.5 rounded-md">
                          {emp.employeeCode || `STS${1001 + idx}`}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {emp.role === 'Owner' ? 'مالک سیستم' : emp.role === 'Manager' ? 'مدیر کل' : emp.role === 'Warehouse Staff' ? 'مسئول گدام' : 'صندوق‌دار'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ID Card Button */}
                  <button 
                    onClick={() => setIdCardModalEmp(emp)} 
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-[#0B1F3A] text-slate-600 hover:text-[#D4AF37] transition-all border border-slate-200/80 shadow-sm cursor-pointer"
                    title="مشاهده و چاپ کارت پرسنلی رسمی و بارکد QR"
                  >
                    <CreditCard className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2.5 mt-4 border-t border-slate-50 pt-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-xs" dir="ltr">{emp.phone || '0799445566'}</span>
                    </div>
                    <div className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono border border-slate-200 flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-slate-400" /> {emp.passwordHash}
                    </div>
                  </div>

                  {/* Attendance Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-emerald-800 font-bold block">روزهای کاری (حضور)</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">{daysWorked} روز</span>
                    </div>
                    <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 text-center">
                      <span className="text-[10px] text-indigo-800 font-bold block">مجموع ساعات کار</span>
                      <span className="font-mono font-black text-indigo-700 text-sm">{totalHours} ساعت</span>
                    </div>
                  </div>
                  
                  {/* Financial Summary */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">معاش پایه ماهانه</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">{emp.baseSalaryAFN?.toLocaleString() || 0} AFN</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-bold">مجموع دریافتی</span>
                      <span className="font-mono font-bold text-emerald-600 text-xs">{totalPaid.toLocaleString()} AFN</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button 
                    onClick={() => setIdCardModalEmp(emp)} 
                    className="w-full flex justify-center items-center gap-1.5 bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" /> کارت شناسایی و بارکد تردد
                  </button>

                  <button onClick={() => openEdit(emp)} className="flex-1 flex justify-center items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> ویرایش
                  </button>
                  <button onClick={() => handleDelete(emp.username)} className="flex-1 flex justify-center items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                  <button onClick={() => openPaymentModal(emp)} className="w-full flex justify-center items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    <Banknote className="w-4 h-4" /> فیش حقوق و پرداختی
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCHEDULE & LEAVE REQUESTS MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'SCHEDULE_LEAVE' && (
        <EmployeeScheduleManager
          employees={employees}
          onUpdateEmployees={saveToStorage}
          requireAdminPin={requireAdminPin}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTENDANCE LOGS & PHOTO SNAPSHOTS */}
      {/* ========================================================================= */}
      {activeTab === 'ATTENDANCE_LOGS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          
          {/* Log Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">فیلتر بر اساس کارمند:</label>
                <select
                  value={logFilterUser}
                  onChange={(e) => setLogFilterUser(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">همه پرسنل</option>
                  {employees.filter(e => e.role !== 'Customer').map(e => (
                    <option key={e.username} value={e.username}>{e.fullName} ({e.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">فیلتر بر اساس تاریخ:</label>
                <input
                  type="date"
                  value={logFilterDate}
                  onChange={(e) => setLogFilterDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {logFilterDate && (
                <button
                  onClick={() => setLogFilterDate('')}
                  className="text-xs text-rose-600 font-bold self-end pb-2 cursor-pointer hover:underline"
                >
                  پاک کردن تاریخ
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">تعداد کل رکوردها:</span>
              <span className="bg-[#0B1F3A] text-[#D4AF37] px-3 py-1 rounded-xl text-xs font-mono font-black">{filteredLogs.length}</span>
            </div>
          </div>

          {/* Logs Table */}
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">هیچ رکورد حضوری با این مشخصات یافت نشد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0B1F3A] text-white">
                  <tr>
                    <th className="p-3.5 font-bold">کارمند / کد</th>
                    <th className="p-3.5 font-bold">تاریخ</th>
                    <th className="p-3.5 font-bold">ورود (Clock In)</th>
                    <th className="p-3.5 font-bold">عکس ورود</th>
                    <th className="p-3.5 font-bold">خروج (Clock Out)</th>
                    <th className="p-3.5 font-bold">عکس خروج</th>
                    <th className="p-3.5 font-bold">روش ثبت</th>
                    <th className="p-3.5 font-bold">مدت زمان</th>
                    <th className="p-3.5 font-bold text-center">عملیات ادمین</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map(({ user, record }) => {
                    const inDate = new Date(record.clockInTime);
                    const outDate = record.clockOutTime ? new Date(record.clockOutTime) : null;
                    let durationStr = '---';
                    if (outDate) {
                      const diffMinutes = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60));
                      const hours = Math.floor(diffMinutes / 60);
                      const mins = diffMinutes % 60;
                      durationStr = `${hours} ساعت و ${mins} دقیقه`;
                    }

                    return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <img src={user.avatar || PRESET_AVATARS[0]} alt={user.fullName} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <span>{user.fullName}</span>
                              <span className="block font-mono text-[10px] text-indigo-600">{user.employeeCode}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{record.date}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-700">
                          {inDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-3.5">
                          {record.clockInPhoto ? (
                            <button
                              onClick={() => setViewingPhoto({ url: record.clockInPhoto!, title: `عکس ورود: ${user.fullName}` })}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-emerald-500 cursor-pointer transition-all"
                            >
                              <img src={record.clockInPhoto} alt="Clock In" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">بدون عکس</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-rose-700">
                          {outDate ? outDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">حاضر در شیفت</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {record.clockOutPhoto ? (
                            <button
                              onClick={() => setViewingPhoto({ url: record.clockOutPhoto!, title: `عکس خروج: ${user.fullName}` })}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-rose-500 cursor-pointer transition-all"
                            >
                              <img src={record.clockOutPhoto} alt="Clock Out" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">بدون عکس</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold">
                            {record.clockInMethod === 'QR_CODE' ? 'بارکد QR' : record.clockInMethod === 'FACE_SCAN' ? 'تشخیص چهره' : record.clockInMethod === 'BULK_ADMIN' ? 'ثبت ادمین' : 'کد پرسنلی'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700 font-bold">{durationStr}</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditTimeRecord(user, record)}
                              className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors cursor-pointer"
                              title="ویرایش ساعت با رمز ادمین"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTimeRecord(user.username, record.id)}
                              className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                              title="حذف سابقه تردد با رمز ادمین"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BULK ATTENDANCE BY ADMIN */}
      {/* ========================================================================= */}
      {activeTab === 'BULK_ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#123B66] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#D4AF37]" />
                ثبت ورود و خروج دسته‌جمعی پرسنل توسط مدیریت
              </h3>
              <p className="text-xs text-slate-300 mt-1">کارمندان مورد نظر را علامت بزنید تا ساعت ورود یا خروج همه به صورت همزمان ثبت گردد.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 font-bold text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmpUsernames.length === employees.filter(e => e.role !== 'Customer').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmpUsernames(employees.filter(emp => emp.role !== 'Customer').map(emp => emp.username));
                      } else {
                        setSelectedEmpUsernames([]);
                      }
                    }}
                    className="w-4 h-4 rounded text-[#0B1F3A]"
                  />
                  انتخاب همه پرسنل
                </label>
                <span className="text-xs font-bold text-slate-500">انتخاب شده: {selectedEmpUsernames.length} نفر</span>
              </div>

              <div className="space-y-2">
                {employees.filter(emp => emp.role !== 'Customer').map(emp => {
                  const isSelected = selectedEmpUsernames.includes(emp.username);
                  const isOnline = emp.timeRecords && emp.timeRecords.length > 0 && !emp.timeRecords[emp.timeRecords.length - 1].clockOutTime;
                  return (
                    <div
                      key={emp.username}
                      onClick={() => {
                        setSelectedEmpUsernames(prev => 
                          isSelected ? prev.filter(u => u !== emp.username) : [...prev, emp.username]
                        );
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-indigo-50/60 border-indigo-300 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by container
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                        <img src={emp.avatar || PRESET_AVATARS[0]} alt={emp.fullName} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{emp.fullName}</div>
                          <span className="font-mono text-[10px] text-slate-500">{emp.employeeCode} • {emp.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isOnline ? 'حاضر در فروشگاه' : 'خارج'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bulk Form */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <h4 className="font-black text-sm text-slate-800">تنظیمات ثبت گروهی</h4>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نوع عملیات:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkActionType('IN')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bulkActionType === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ورود گروهی (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkActionType('OUT')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bulkActionType === 'OUT' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    خروج گروهی (OUT)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ساعت و تاریخ (اختیاری):</label>
                <input
                  type="datetime-local"
                  value={bulkTime}
                  onChange={(e) => setBulkTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">در صورت خالی بودن، زمان فعلی درج می‌شود.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">یادداشت ثبت:</label>
                <input
                  type="text"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleExecuteBulkAttendance}
                className="w-full bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] py-3 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                ثبت نهایی تردد {selectedEmpUsernames.length} نفر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: QR CODES & ALL ID BADGES */}
      {/* ========================================================================= */}
      {activeTab === 'QR_BADGES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-[#0B1F3A] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                کارت‌های شناسایی پرسنلی و بارکدهای QR تردد هوشمند
              </h3>
              <p className="text-xs text-slate-500">
                مشاهده و چاپ کارت‌های شناسایی رسمی پرسنل با عکس، کد اختصاصی STS، و مشخصات فروشگاه
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              چاپ همه کارت‌ها (Batch Print)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.filter(e => e.role !== 'Customer').map(emp => (
              <div key={emp.username} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <img src={emp.avatar || PRESET_AVATARS[0]} alt={emp.fullName} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{emp.fullName}</h4>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                      {emp.employeeCode}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{emp.role}</p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs my-2">
                  <span className="text-slate-500 font-bold">اسکن سریع در کیوسک:</span>
                  <span className="text-emerald-700 font-bold font-mono">STC_EMP:{emp.employeeCode}</span>
                </div>

                <button
                  onClick={() => setIdCardModalEmp(emp)}
                  className="w-full mt-2 bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <CreditCard className="w-4 h-4" />
                  مشاهده و چاپ کارت رسمی
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO PREVIEW MODAL */}
      {/* ========================================================================= */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 max-w-lg w-full">
            <div className="flex items-center justify-between text-white pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm">{viewingPhoto.title}</h3>
              <button onClick={() => setViewingPhoto(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center aspect-[4/3] mt-3">
              <img src={viewingPhoto.url} alt="Snap Preview" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT EMPLOYEE MODAL (WITH MANDATORY PHOTO & WEBCAM TOOL) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl my-auto max-h-[95vh] flex flex-col">
            
            <div className="p-5 px-6 bg-[#0B1F3A] text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  {editingUsername ? 'ویرایش اطلاعات و عکس کارمند' : 'افزودن کارمند جدید'}
                </h2>
                <p className="text-[11px] text-slate-300">کد پرسنلی با پیشوند STS و عکس رسمی جهت صدور کارت الزامی است.</p>
              </div>
              <button 
                onClick={() => { stopCamera(); setIsModalOpen(false); }} 
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* PHOTO SECTION (REQUIRED) */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    عکس پرسنلی رسمی (الزامی برای کارت و کیوسک) <span className="text-rose-500">*</span>
                  </label>
                  {empForm.avatar && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ عکس تنظیم شد
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 border-2 border-[#D4AF37] shrink-0 shadow-md relative">
                    {empForm.avatar ? (
                      <img src={empForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        بدون عکس
                      </div>
                    )}
                  </div>

                  {/* Photo Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCameraActive) stopCamera();
                          else startCamera();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {isCameraActive ? 'بستن کمره' : 'عکس گرفتن با کمره زنده'}
                      </button>

                      <label className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        آپلود فایل عکس
                        <input type="file" accept="image/*" onChange={handlePhotoFileUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Quick Avatar selector */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 block mb-1">یا انتخاب از عکس‌های آماده:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {PRESET_AVATARS.map((url, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setEmpForm(prev => ({ ...prev, avatar: url })); setPhotoError(false); }}
                            className={`w-8 h-8 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              empForm.avatar === url ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt="Preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Webcam Viewfinder */}
                {isCameraActive && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-2xl flex flex-col items-center gap-3">
                    <div className="w-full aspect-[4/3] max-h-[220px] bg-black rounded-xl overflow-hidden relative">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                    </div>
                    {cameraError && <p className="text-rose-400 text-xs">{cameraError}</p>}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        ثبت این عکس
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}

                {photoError && (
                  <p className="text-rose-600 font-bold text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    عکس پرسنلی الزامی است. لطفاً عکس انتخاب فرمایید.
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و تخلص کامل <span className="text-rose-500">*</span></label>
                  <input required type="text" value={empForm.fullName} onChange={e => setEmpForm({...empForm, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد پرسنلی (STS + 4 رقم) <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    dir="ltr" 
                    value={empForm.employeeCode || ''} 
                    onChange={e => setEmpForm({...empForm, employeeCode: e.target.value.toUpperCase()})} 
                    placeholder="STS1001" 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-black text-amber-700 focus:outline-none focus:border-indigo-500 text-right" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام کاربری ورود <span className="text-rose-500">*</span></label>
                  <input required type="text" disabled={!!editingUsername && (empForm.username === 'admin@stc.com' || empForm.username === 'admin')} dir="ltr" value={empForm.username} onChange={e => setEmpForm({...empForm, username: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500 text-right disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رمز عبور <span className="text-rose-500">*</span></label>
                  <input required type="text" dir="ltr" value={empForm.passwordHash} onChange={e => setEmpForm({...empForm, passwordHash: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500 text-right" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تلفن تماس</label>
                  <input type="text" dir="ltr" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} placeholder="0799445566" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">معاش پایه ماهوار (AFN)</label>
                  <input type="number" dir="ltr" value={empForm.baseSalaryAFN || ''} onChange={e => setEmpForm({...empForm, baseSalaryAFN: parseFloat(e.target.value) || 0})} placeholder="15000" className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500 text-right" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نقش و دسترسی <span className="text-rose-500">*</span></label>
                  <select value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500">
                    <option value="Cashier">صندوق‌دار (بخش فروش و صندوق)</option>
                    <option value="Warehouse Staff">مسئول گدام (موجودی و گدام)</option>
                    <option value="Manager">مدیر کل (دسترسی به تمامی بخش‌ها)</option>
                    <option value="Owner">مالک فروشگاه (دسترسی نامحدود)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">دیپارتمنت / بخش</label>
                  <input type="text" value={empForm.department || ''} onChange={e => setEmpForm({...empForm, department: e.target.value})} placeholder="فروشگاه، گدام، مالی..." className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => { stopCamera(); setIsModalOpen(false); }} 
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] py-3 rounded-xl font-black transition-all shadow-md cursor-pointer active:scale-95"
                >
                  ذخیره اطلاعات و صدور کد STS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT TIME RECORD MODAL (ADMIN KEY PROTECTED) */}
      {/* ========================================================================= */}
      {editingTimeRecord && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#D4AF37]" />
                ویرایش سابقه تردد - {editingTimeRecord.user.fullName}
              </h3>
              <button onClick={() => setEditingTimeRecord(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTimeRecord} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">زمان ورود (Clock In):</label>
                <input
                  type="datetime-local"
                  required
                  value={editClockIn}
                  onChange={(e) => setEditClockIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">زمان خروج (Clock Out):</label>
                <input
                  type="datetime-local"
                  value={editClockOut}
                  onChange={(e) => setEditClockOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توضیحات و دلیل ویرایش:</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="مثال: تصحیح ساعت توسط مدیر به دلیل فراموشی کارمند"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:outline-none focus:border-[#0B1F3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTimeRecord(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#0B1F3A] hover:bg-[#123B66] text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HR PAYMENT & SALARY CALCULATOR MODAL */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && activeEmp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Banknote className="w-6 h-6 text-[#D4AF37]" />
                  سیستم حقوق و دستمزد: {activeEmp.fullName}
                </h2>
                <span className="text-xs text-slate-300 mt-1 block">محاسبه دقیق حقوق ماهانه، ساعتی و تاریخچه پرداختی‌ها</span>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Salary Breakdown Formula */}
              {(() => {
                const base = activeEmp.baseSalaryAFN || 0;
                const daily = Math.round(base / 30);
                const hourly = Math.round(base / (30 * 8));
                const weekly = Math.round(base / 4);
                const yearly = base * 12;

                return (
                  <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-amber-50/30 p-5 rounded-2xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">تفکیک استاندارد معاش (بر پایه ۸ ساعت کار روزانه)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">معاش هر ساعت</span>
                        <span className="font-mono font-black text-indigo-600 text-sm">{hourly.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 mr-1">AFN</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">معاش هر روز</span>
                        <span className="font-mono font-black text-indigo-600 text-sm">{daily.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 mr-1">AFN</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">معاش هر هفته</span>
                        <span className="font-mono font-black text-indigo-600 text-sm">{weekly.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 mr-1">AFN</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">معاش سالانه</span>
                        <span className="font-mono font-black text-indigo-600 text-sm">{yearly.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 mr-1">AFN</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Record New Payment Form */}
              <form onSubmit={handleRecordPayment} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  ثبت پرداخت جدید و صدور چک فیش
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (AFN) <span className="text-rose-500">*</span></label>
                    <input required type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="مثال: 15000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">بابت / توضیحات</label>
                    <input type="text" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="مثال: معاش ماه جوزا، مساعده" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer">
                  <CheckCircle2 className="w-4 h-4" />
                  ثبت و صدور خودکار چک و رسید پرداخت
                </button>
              </form>

              {/* Payments History */}
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                  <CalendarClock className="w-4 h-4 text-slate-400" />
                  تاریخچه پرداختی‌ها
                </h3>
                {(!activeEmp.payments || activeEmp.payments.length === 0) ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold">هیچ پرداختی تا کنون ثبت نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...activeEmp.payments].reverse().map((pay) => (
                      <div key={pay.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-200 transition-colors shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm mb-1">{pay.note}</span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md self-start">
                            {new Date(pay.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <span className="font-mono font-black text-emerald-600 text-lg">{pay.amount.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 font-bold mr-1">AFN</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => setReceiptData({ payment: pay, emp: activeEmp })} 
                              className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors cursor-pointer" 
                              title="مشاهده و چاپ چک / رسید پرداخت"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePayment(pay.id)} 
                              className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer" 
                              title="حذف تراکنش"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE SALARY CHECK & RECEIPT MODAL */}
      {/* ========================================================================= */}
      {receiptData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-sm text-white">چک و فیش رسمی پرداخت معاش</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  چاپ چک (Print)
                </button>
                <button
                  onClick={() => setReceiptData(null)}
                  className="text-slate-300 hover:text-white p-1 cursor-pointer transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 bg-[#FCFDFE] text-slate-800" id="printable-salary-receipt">
              <div className="border-2 border-dashed border-[#D4AF37]/50 rounded-2xl p-6 bg-gradient-to-br from-amber-50/20 via-white to-slate-50 relative overflow-hidden shadow-sm">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-sm border border-slate-100 flex items-center justify-center">
                      <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                      <Building2 className="w-6 h-6 text-[#0B1F3A]" />
                    </div>
                    <div>
                      <h2 className="font-black text-lg text-[#0B1F3A]">مرکز تجارتی ستاره شهر</h2>
                      <span className="text-[11px] font-bold text-slate-500 block">سند پرداخت معاش و چک داخلی پرسنل</span>
                    </div>
                  </div>
                  
                  <div className="text-left font-mono text-xs text-slate-500 space-y-1 self-end sm:self-auto">
                    <div>
                      <span className="text-slate-400">شماره سند: </span>
                      <span className="font-bold text-slate-800">{receiptData.payment.id.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">تاریخ پرداخت: </span>
                      <span className="font-bold text-slate-800">
                        {new Date(receiptData.payment.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-b border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block mb-0.5">در وجه محترم / محترمه:</span>
                    <span className="font-black text-sm text-slate-900">{receiptData.emp.fullName} ({receiptData.emp.employeeCode})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">سمت کاری:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md inline-block">{receiptData.emp.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">بابت / شرح پرداخت:</span>
                    <span className="font-bold text-emerald-700">{receiptData.payment.note}</span>
                  </div>
                </div>

                <div className="my-5 bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-emerald-800 font-bold block mb-1">مبلغ پرداختی این سند (تحویل نقدی):</span>
                    <div className="text-2xl md:text-3xl font-black text-emerald-700 font-mono tracking-tight">
                      {receiptData.payment.amount.toLocaleString()} <span className="text-sm font-bold text-emerald-900">افغانی (AFN)</span>
                    </div>
                  </div>
                  <div className="sm:text-left text-xs text-emerald-800/80 bg-white/80 p-2 px-3 rounded-xl border border-emerald-100 font-medium">
                    روش پرداخت: <span className="font-bold text-emerald-900">نقدی / تحویل فوری</span>
                  </div>
                </div>

                {(() => {
                  const baseSalary = receiptData.emp.baseSalaryAFN || 0;
                  const allPayments = receiptData.emp.payments || [];
                  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
                  const balance = Math.max(0, baseSalary - totalPaid);
                  const isOverpaid = totalPaid > baseSalary;

                  return (
                    <div className="grid grid-cols-3 gap-3 text-center pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">معاش ماهانه تعیین‌شده</span>
                        <span className="font-mono text-sm font-black text-slate-800">{baseSalary.toLocaleString()} AFN</span>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <span className="text-[10px] text-indigo-600 font-bold block mb-1">مجموع دریافتی تا کنون</span>
                        <span className="font-mono text-sm font-black text-indigo-800">{totalPaid.toLocaleString()} AFN</span>
                      </div>
                      <div className={`p-3 rounded-xl border ${balance === 0 ? 'bg-emerald-50 border-emerald-200' : isOverpaid ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
                        <span className={`text-[10px] font-bold block mb-1 ${balance === 0 ? 'text-emerald-700' : isOverpaid ? 'text-amber-700' : 'text-rose-700'}`}>
                          {balance === 0 ? 'وضعیت تسویه' : isOverpaid ? 'اضافه پرداختی / پاداش' : 'باقی‌مانده معاش'}
                        </span>
                        <span className={`font-mono text-sm font-black ${balance === 0 ? 'text-emerald-800' : isOverpaid ? 'text-amber-800' : 'text-rose-800'}`}>
                          {balance === 0 ? 'تسویه کامل' : `${(isOverpaid ? totalPaid - baseSalary : balance).toLocaleString()} AFN`}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200 text-center text-xs">
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 mb-10">امضا و مهر مدیریت و امور مالی:</span>
                    <div className="w-36 border-b border-dashed border-slate-400"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-slate-400 mb-10">امضا و اثر انگشت کارمند (تحویل‌گیرنده):</span>
                    <div className="w-36 border-b border-dashed border-slate-400"></div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between print:hidden">
              <span className="text-[11px] text-slate-400">این سند به عنوان رسید معتبر مالی پرسنل در فروشگاه ستاره شهر صادر گردیده است.</span>
              <button
                onClick={() => setReceiptData(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MASTER SECURITY PIN DIALOG */}
      {/* ========================================================================= */}
      {adminPinModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all animate-in zoom-in-95 duration-150">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">تأیید امنیتی مدیریت (Admin Key)</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              برای انجام این عملیات یا اعمال تغییرات، لطفاً رمز امنیتی مدیریت را وارد نمایید.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); verifyPinAndExecute(); }}>
              <div className="relative mb-4">
                <input 
                  type="password" 
                  autoFocus
                  placeholder="کلید امنیتی را وارد کنید"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full bg-slate-50 border ${pinError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'} rounded-2xl py-3 px-4 text-center text-lg font-mono font-bold focus:outline-none focus:border-[#0B1F3A] transition-all`}
                />
                {pinError && (
                  <span className="text-xs text-rose-500 font-bold block mt-2 animate-bounce">
                    کلید امنیتی اشتباه است!
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setAdminPinModal({ isOpen: false, action: () => {} })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#0B1F3A] hover:bg-[#123B66] text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer"
                >
                  تأیید و اجرا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMPLOYEE OFFICIAL ID CARD MODAL */}
      {/* ========================================================================= */}
      <EmployeeIdCardModal
        isOpen={!!idCardModalEmp}
        onClose={() => setIdCardModalEmp(null)}
        employee={idCardModalEmp}
      />

      {/* ========================================================================= */}
      {/* LIVE ATTENDANCE KIOSK MODAL */}
      {/* ========================================================================= */}
      <AttendanceKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        onAttendanceRecorded={() => loadFromStorage()}
      />

    </div>
  );
};
