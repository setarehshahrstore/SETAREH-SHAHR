import React, { useState } from 'react';
import { 
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Plus, 
  CalendarDays, User, Users, Edit3, Trash2, 
  FileText, Check, X, Sun, Moon, Coffee, Briefcase, Store
} from 'lucide-react';
import { AppUser, WeeklySchedule, DailyShift, LeaveRequest, LeaveType, StoreOperatingHours } from '../types';
import { useAppState } from '../AppContext';
import { formatTime12h, parse24hTo12hParts, convert12hPartsTo24h, getStoreHours } from '../utils';

interface EmployeeScheduleManagerProps {
  employees: AppUser[];
  onUpdateEmployees: (updated: AppUser[]) => void;
  requireAdminPin: (action: () => void) => void;
}

const DAYS_OF_WEEK: { key: keyof WeeklySchedule; nameFa: string; en: string }[] = [
  { key: 'Saturday', nameFa: 'شنبه', en: 'Saturday' },
  { key: 'Sunday', nameFa: 'یکشنبه', en: 'Sunday' },
  { key: 'Monday', nameFa: 'دوشنبه', en: 'Monday' },
  { key: 'Tuesday', nameFa: 'سه‌شنبه', en: 'Tuesday' },
  { key: 'Wednesday', nameFa: 'چهارشنبه', en: 'Wednesday' },
  { key: 'Thursday', nameFa: 'پنج‌شنبه', en: 'Thursday' },
  { key: 'Friday', nameFa: 'جمعه (تعطیل عمومی)', en: 'Friday' }
];

export const getCurrentWeekDates = (): { key: keyof WeeklySchedule; nameFa: string; en: string; dateStr: string; isToday: boolean; formattedFaDate: string }[] => {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysSinceSaturday = (currentDayOfWeek + 1) % 7; // Sunday (0) -> 1; Monday (1) -> 2; ... Friday (5) -> 6; Saturday (6) -> 0
  
  const saturdayDate = new Date(now);
  saturdayDate.setDate(now.getDate() - daysSinceSaturday);
  
  const todayIso = now.toISOString().split('T')[0];

  return DAYS_OF_WEEK.map((d, index) => {
    const dayDate = new Date(saturdayDate);
    dayDate.setDate(saturdayDate.getDate() + index);
    const dateStr = dayDate.toISOString().split('T')[0];
    const month = (dayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = dayDate.getDate().toString().padStart(2, '0');
    return {
      ...d,
      dateStr,
      isToday: dateStr === todayIso,
      formattedFaDate: `${month}/${day}`
    };
  });
};

export const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  Saturday: { day: 'Saturday', dayNameFa: 'شنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Sunday: { day: 'Sunday', dayNameFa: 'یکشنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Monday: { day: 'Monday', dayNameFa: 'دوشنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Tuesday: { day: 'Tuesday', dayNameFa: 'سه‌شنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Wednesday: { day: 'Wednesday', dayNameFa: 'چهارشنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Thursday: { day: 'Thursday', dayNameFa: 'پنج‌شنبه', shiftType: 'Morning', startTime: '08:00', endTime: '16:00', isOff: false },
  Friday: { day: 'Friday', dayNameFa: 'جمعه', shiftType: 'Off', startTime: '', endTime: '', isOff: true, note: 'تعطیل هفتگی' }
};

export const EmployeeScheduleManager: React.FC<EmployeeScheduleManagerProps> = ({
  employees,
  onUpdateEmployees,
  requireAdminPin
}) => {
  const { state, addLeaveRequest, updateLeaveRequestStatus, deleteLeaveRequest } = useAppState();
  
  // Tab inside scheduling
  const [activeSubTab, setActiveSubTab] = useState<'ROSTER' | 'TODAY_ROSTER' | 'LEAVE_REQUESTS' | 'MY_SCHEDULE'>('ROSTER');

  // Edit Schedule Modal
  const [editingScheduleEmp, setEditingScheduleEmp] = useState<AppUser | null>(null);
  const [tempSchedule, setTempSchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY_SCHEDULE);

  // Leave Request Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveEmployeeUsername, setLeaveEmployeeUsername] = useState<string>('');
  const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
  const [leaveStartDate, setLeaveStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [leaveHours, setLeaveHours] = useState<string>('8');
  const [leaveReason, setLeaveReason] = useState<string>('');

  // Manager Review Note Modal
  const [reviewingRequest, setReviewingRequest] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  // Self-service employee filter
  const [selectedMyEmpUsername, setSelectedMyEmpUsername] = useState<string>(() => employees[0]?.username || '');

  // Filter leave requests
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL');

  const leaveRequests: LeaveRequest[] = state.leaveRequests || [];
  const storeHours = state.storeHours || getStoreHours();

  // Helper to get day of week in english from current date
  const getTodayDayOfWeekKey = (): keyof WeeklySchedule => {
    const dayNum = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const map: Record<number, keyof WeeklySchedule> = {
      6: 'Saturday',
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday'
    };
    return map[dayNum] || 'Saturday';
  };

  const todayKey = getTodayDayOfWeekKey();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentWeekDates = getCurrentWeekDates();

  // Open Edit Schedule
  const openEditSchedule = (emp: AppUser) => {
    requireAdminPin(() => {
      setEditingScheduleEmp(emp);
      setTempSchedule(emp.schedule || DEFAULT_WEEKLY_SCHEDULE);
    });
  };

  // Save Schedule
  const handleSaveSchedule = () => {
    if (!editingScheduleEmp) return;
    const updated = employees.map(emp => {
      if (emp.username === editingScheduleEmp.username) {
        return {
          ...emp,
          schedule: tempSchedule
        };
      }
      return emp;
    });
    onUpdateEmployees(updated);
    setEditingScheduleEmp(null);
  };

  // Apply Schedule Presets (Strict 12-Hour format times)
  const applyPreset = (presetType: 'MORNING' | 'EVENING' | 'FULL_DAY' | 'STORE_HOURS') => {
    const updated: WeeklySchedule = { ...tempSchedule };
    DAYS_OF_WEEK.forEach(d => {
      if (d.key === 'Friday') {
        if (presetType === 'STORE_HOURS' && storeHours.Friday.isOpen) {
          updated[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            shiftType: 'Evening',
            startTime: storeHours.Friday.openTime,
            endTime: storeHours.Friday.closeTime,
            isOff: false,
            note: 'شیفت کاری جمعه (بعد از نماز)'
          };
        } else {
          updated[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            shiftType: 'Off',
            startTime: '',
            endTime: '',
            isOff: true,
            note: 'تعطیل هفتگی'
          };
        }
      } else {
        if (presetType === 'MORNING') {
          updated[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            shiftType: 'Morning',
            startTime: '08:00',
            endTime: '16:00',
            isOff: false
          };
        } else if (presetType === 'EVENING') {
          updated[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            shiftType: 'Evening',
            startTime: '14:00',
            endTime: '22:00',
            isOff: false
          };
        } else if (presetType === 'FULL_DAY') {
          updated[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            shiftType: 'FullDay',
            startTime: '08:30',
            endTime: '20:00',
            isOff: false
          };
        } else if (presetType === 'STORE_HOURS') {
          const storeDay = storeHours[d.key as keyof StoreOperatingHours] as any;
          if (storeDay && storeDay.isOpen) {
            updated[d.key] = {
              day: d.key,
              dayNameFa: d.nameFa,
              shiftType: 'FullDay',
              startTime: storeDay.openTime,
              endTime: storeDay.closeTime,
              isOff: false
            };
          }
        }
      }
    });
    setTempSchedule(updated);
  };

  // Submit Leave Request
  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find(u => u.username === leaveEmployeeUsername);
    if (!targetEmp) {
      alert('لطفاً کارمند را انتخاب نمایید.');
      return;
    }
    if (!leaveReason.trim()) {
      alert('لطفاً دلیل درخواست مرخصی / روز تعطیلی را بنویسید.');
      return;
    }

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      employeeUsername: targetEmp.username,
      employeeName: targetEmp.fullName,
      employeeCode: targetEmp.employeeCode || 'STS1001',
      type: leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      hours: leaveType === 'Hourly' ? parseFloat(leaveHours) || 2 : undefined,
      reason: leaveReason,
      requestDate: new Date().toISOString(),
      status: 'Pending'
    };

    addLeaveRequest(newReq);
    setIsLeaveModalOpen(false);
    setLeaveReason('');
    alert('درخواست مرخصی با موفقیت ثبت شد و به کارتابل تایید مدیریت ارسال گردید.');
  };

  // Handle Review (Approve / Reject)
  const handleConfirmReview = () => {
    if (!reviewingRequest) return;
    requireAdminPin(() => {
      updateLeaveRequestStatus(
        reviewingRequest.id,
        reviewAction,
        reviewNoteInput || (reviewAction === 'Approved' ? 'تایید شد' : 'رد شد'),
        'مدیریت فروشگاه'
      );
      setReviewingRequest(null);
      setReviewNoteInput('');
    });
  };

  // Check if employee is on approved leave today
  const isEmployeeOnLeaveToday = (username: string, dateStr: string = todayDateStr) => {
    return leaveRequests.some(req => 
      req.employeeUsername === username &&
      req.status === 'Approved' &&
      req.startDate <= dateStr &&
      req.endDate >= dateStr
    );
  };

  // 12-Hour formatted shift badge
  const getShiftBadge = (shift?: DailyShift, isOnLeave?: boolean) => {
    if (isOnLeave) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          مرخصی تایید شده
        </span>
      );
    }
    if (!shift || shift.isOff || shift.shiftType === 'Off') {
      return (
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
          <Coffee className="w-3 h-3 text-slate-400" />
          تعطیل (Off)
        </span>
      );
    }

    const formattedStart = formatTime12h(shift.startTime, { usePersianMeridiem: true });
    const formattedEnd = formatTime12h(shift.endTime, { usePersianMeridiem: true });

    switch (shift.shiftType) {
      case 'Morning':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-lg">
            <Sun className="w-3 h-3 text-amber-500" />
            صبح ({formattedStart} تا {formattedEnd})
          </span>
        );
      case 'Evening':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-lg">
            <Moon className="w-3 h-3 text-purple-600" />
            عصر ({formattedStart} تا {formattedEnd})
          </span>
        );
      case 'FullDay':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-lg">
            <Briefcase className="w-3 h-3 text-amber-600" />
            تمام وقت ({formattedStart} تا {formattedEnd})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
            <Clock className="w-3 h-3 text-slate-600" />
            {formattedStart} تا {formattedEnd}
          </span>
        );
    }
  };

  const getLeaveTypeFa = (type: LeaveType) => {
    switch (type) {
      case 'Vacation': return 'مرخصی استحقاقی (سالانه)';
      case 'Sick': return 'مرخصی استعلاجی (مریضی)';
      case 'Emergency': return 'مرخصی اضطراری / خانوادگی';
      case 'ShiftOff': return 'درخواست روز تعطیلی شیفت';
      case 'Hourly': return 'مرخصی ساعتی';
      default: return type;
    }
  };

  const pendingLeaveCount = leaveRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#123B66] to-[#0B1F3A] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                برنامه‌ریزی شیفت ۱ هفته، تقویم کاری و سیستم مرخصی پرسنل
                <span className="bg-[#D4AF37] text-[#0B1F3A] text-xs px-2.5 py-0.5 rounded-full font-black">
                  فرمت ۱۲ ساعته
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                تنظیم روزهای حضور ۱ هفته‌ای (شنبه تا جمعه)، ساعات قبل/بعد از ظهر و بررسی درخواست‌های عدم حضور
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setLeaveEmployeeUsername(employees[0]?.username || '');
                setIsLeaveModalOpen(true);
              }}
              className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              ثبت درخواست مرخصی / روز تعطیل
            </button>
          </div>
        </div>

        {/* PROMINENT SCHEDULE NOTICE (AS REQUESTED) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-white block mb-0.5">
              ⚠️ توجه بسیار مهم: برنامه کاری ممکن است تغییر کند، لطفاً همواره بررسی نمایید!
            </span>
            <p className="text-slate-200 leading-relaxed">
              ساعات کاری و شیفت‌های هفتگی پرسنل و زمان‌بندی باز بودن فروشگاه ممکن است بر اساس نیاز فروشگاه، مناسبت‌ها و تغییرات مدیریتی به‌روزرسانی شود. لطفاً همواره شیفت خود را از این جدول یا تابلوی اعلانات بررسی نمایید.
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('ROSTER')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'ROSTER'
                ? 'bg-white text-[#0B1F3A] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            جدول شیفت ۱ هفته پرسنل (Weekly Roster)
          </button>

          <button
            onClick={() => setActiveSubTab('TODAY_ROSTER')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'TODAY_ROSTER'
                ? 'bg-white text-[#0B1F3A] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            شیفت امروز و پرسنل موظف
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
              امروز: {DAYS_OF_WEEK.find(d => d.key === todayKey)?.nameFa}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('LEAVE_REQUESTS')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer relative ${
              activeSubTab === 'LEAVE_REQUESTS'
                ? 'bg-white text-[#0B1F3A] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            درخواست‌های مرخصی و رخصتی
            {pendingLeaveCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingLeaveCount} جدید
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('MY_SCHEDULE')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'MY_SCHEDULE'
                ? 'bg-white text-[#0B1F3A] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-4 h-4" />
            برنامه کاری من (پرسنل)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: WEEKLY ROSTER MATRIX (1 WEEK VIEW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-[#0B1F3A] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  برنامه کاری ۱ هفته‌ای پرسنل (شنبه تا جمعه - فرمت ۱۲ ساعته)
                </h3>
                <p className="text-[11px] text-slate-500">
                  برای تغییر برنامه کاری یا روزهای تعطیل هر کارمند، بر روی دکمه «ویرایش شیفت» کلیک کنید.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                  <Sun className="w-3 h-3 text-amber-500" /> صبح
                </span>
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md border border-purple-200">
                  <Moon className="w-3 h-3 text-purple-600" /> عصر
                </span>
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                  <Briefcase className="w-3 h-3 text-amber-600" /> تمام وقت
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  <Coffee className="w-3 h-3 text-slate-400" /> تعطیل
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-black">
                    <th className="py-3 px-4 rounded-r-2xl">کارمند / کد پرسنلی</th>
                    {currentWeekDates.map(d => (
                      <th key={d.key} className={`py-3 px-3 text-center ${d.isToday ? 'bg-amber-100/70 text-amber-950 font-black' : ''}`}>
                        {d.nameFa}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{d.formattedFaDate}</span>
                        {d.isToday && (
                          <span className="block text-[9px] text-amber-800 font-normal">(امروز)</span>
                        )}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center rounded-l-2xl">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employees.map(emp => {
                    const schedule = emp.schedule || DEFAULT_WEEKLY_SCHEDULE;
                    return (
                      <tr key={emp.username} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                              alt={emp.fullName} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                            />
                            <div>
                              <div className="font-black text-slate-900 flex items-center gap-1.5">
                                {emp.fullName}
                                <span className="bg-[#0B1F3A] text-[#D4AF37] font-mono text-[10px] font-black px-1.5 py-0.2 rounded">
                                  {emp.employeeCode || 'STS1001'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">{emp.role}</span>
                            </div>
                          </div>
                        </td>

                        {currentWeekDates.map(d => {
                          const shift = schedule[d.key];
                          const onLeave = isEmployeeOnLeaveToday(emp.username, d.dateStr);
                          return (
                            <td key={d.key} className={`py-3 px-2 text-center ${d.isToday ? 'bg-amber-50/50' : ''}`}>
                              {getShiftBadge(shift, onLeave)}
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditSchedule(emp)}
                            className="bg-slate-100 hover:bg-[#0B1F3A] hover:text-[#D4AF37] text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 mx-auto text-xs cursor-pointer active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            ویرایش شیفت
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: TODAY'S ROSTER & WHO IS WORKING */}
      {/* ========================================================================= */}
      {activeSubTab === 'TODAY_ROSTER' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Summary Cards */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">کل پرسنل فعال</span>
                <span className="text-xl font-black text-slate-900">{employees.length} نفر</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Sun className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">موظفین شیفت امروز ({DAYS_OF_WEEK.find(d => d.key === todayKey)?.nameFa})</span>
                <span className="text-xl font-black text-emerald-700">
                  {employees.filter(e => {
                    const shift = (e.schedule || DEFAULT_WEEKLY_SCHEDULE)[todayKey];
                    return shift && !shift.isOff && shift.shiftType !== 'Off' && !isEmployeeOnLeaveToday(e.username);
                  }).length} نفر
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">رخصت و روز تعطیل امروز</span>
                <span className="text-xl font-black text-slate-700">
                  {employees.filter(e => {
                    const shift = (e.schedule || DEFAULT_WEEKLY_SCHEDULE)[todayKey];
                    return !shift || shift.isOff || shift.shiftType === 'Off';
                  }).length} نفر
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">مرخصی‌های تایید شده امروز</span>
                <span className="text-xl font-black text-purple-700">
                  {employees.filter(e => isEmployeeOnLeaveToday(e.username)).length} نفر
                </span>
              </div>
            </div>

          </div>

          {/* Today's Staff List */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            <h3 className="font-black text-sm text-[#0B1F3A] mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              وضعیت حضور و شیفت کاری تک‌تک پرسنل برای امروز ({DAYS_OF_WEEK.find(d => d.key === todayKey)?.nameFa} - {todayDateStr})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map(emp => {
                const shift = (emp.schedule || DEFAULT_WEEKLY_SCHEDULE)[todayKey];
                const isOnLeave = isEmployeeOnLeaveToday(emp.username);
                const records = emp.timeRecords || [];
                const todayRecord = records.find(r => r.date === todayDateStr);
                const isCurrentlyPresent = todayRecord && !todayRecord.clockOutTime;

                return (
                  <div 
                    key={emp.username} 
                    className={`p-4 rounded-2xl border transition-all ${
                      isOnLeave 
                        ? 'bg-purple-50/40 border-purple-200' 
                        : shift?.isOff || shift?.shiftType === 'Off'
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : isCurrentlyPresent 
                            ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                            : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                          alt={emp.fullName} 
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                            {emp.fullName}
                            <span className="bg-[#0B1F3A] text-[#D4AF37] font-mono text-[10px] font-black px-2 py-0.5 rounded-md">
                              {emp.employeeCode || 'STS1001'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{emp.role} • {emp.phone || '0799445566'}</p>
                        </div>
                      </div>

                      <div>
                        {getShiftBadge(shift, isOnLeave)}
                      </div>
                    </div>

                    {/* Attendance live status (12-hour formatted) */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">وضعیت تردد کیوسک:</span>
                      <div>
                        {isOnLeave ? (
                          <span className="text-purple-700 font-black">مرخصی موجه تایید شده</span>
                        ) : isCurrentlyPresent ? (
                          <span className="text-emerald-700 font-black flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            حاضر در فروشگاه (ورود: {formatTime12h(todayRecord.clockInTime)})
                          </span>
                        ) : todayRecord?.clockOutTime ? (
                          <span className="text-slate-700 font-bold">
                            پایان شیفت (خروج: {formatTime12h(todayRecord.clockOutTime)})
                          </span>
                        ) : shift?.isOff ? (
                          <span className="text-slate-400 font-medium">روز رخصتی</span>
                        ) : (
                          <span className="text-amber-600 font-bold">هنوز ثبت ورود نکرده است</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: LEAVE & DAY OFF REQUESTS APPROVAL DASHBOARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'LEAVE_REQUESTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-[#0B1F3A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  مدیریت درخواست‌های مرخصی و رخصتی پرسنل
                  {pendingLeaveCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendingLeaveCount} مورد در انتظار بررسی
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  کارمندان می‌توانند درخواست مرخصی ثبت کنند و مدیریت با یک کلیک تایید یا رد می‌نماید.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">فیلتر وضعیت:</span>
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setLeaveStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      leaveStatusFilter === 'ALL' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    همه ({leaveRequests.length})
                  </button>
                  <button
                    onClick={() => setLeaveStatusFilter('Pending')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      leaveStatusFilter === 'Pending' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    در انتظار ({leaveRequests.filter(r => r.status === 'Pending').length})
                  </button>
                  <button
                    onClick={() => setLeaveStatusFilter('Approved')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      leaveStatusFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    تایید شده ({leaveRequests.filter(r => r.status === 'Approved').length})
                  </button>
                  <button
                    onClick={() => setLeaveStatusFilter('Rejected')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      leaveStatusFilter === 'Rejected' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    رد شده ({leaveRequests.filter(r => r.status === 'Rejected').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Requests List */}
            {leaveRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30 text-indigo-400" />
                <p className="font-bold text-slate-600 text-sm">هیچ درخواست مرخصی‌ای ثبت نشده است.</p>
                <p className="text-xs text-slate-400 mt-1">با زدن دکمه بالای صفحه می‌توانید اولین درخواست مرخصی را ثبت کنید.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests
                  .filter(r => leaveStatusFilter === 'ALL' || r.status === leaveStatusFilter)
                  .map(req => {
                    const emp = employees.find(u => u.username === req.employeeUsername);
                    return (
                      <div 
                        key={req.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          req.status === 'Pending' 
                            ? 'bg-amber-50/40 border-amber-200' 
                            : req.status === 'Approved'
                              ? 'bg-emerald-50/30 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          
                          {/* Employee Info */}
                          <div className="flex items-center gap-3">
                            <img 
                              src={emp?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                              alt={req.employeeName} 
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-slate-900">{req.employeeName}</h4>
                                <span className="bg-[#0B1F3A] text-[#D4AF37] font-mono text-[10px] font-black px-1.5 py-0.2 rounded">
                                  {req.employeeCode}
                                </span>
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {getLeaveTypeFa(req.type)}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1 font-bold text-slate-700">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  از: {req.startDate} تا: {req.endDate}
                                </span>
                                {req.hours && (
                                  <span className="text-amber-700 font-bold">({req.hours} ساعت)</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="flex-1 max-w-md bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                            <span className="text-slate-400 font-bold block text-[10px]">دلیل / توضیحات کارمند:</span>
                            <p className="text-slate-800 font-medium mt-0.5">{req.reason}</p>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-2">
                            {req.status === 'Pending' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setReviewingRequest(req);
                                    setReviewAction('Approved');
                                    setReviewNoteInput('تایید شد، شیفت کاری ثبت گردید.');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                                >
                                  <Check className="w-4 h-4" />
                                  تایید مرخصی
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewingRequest(req);
                                    setReviewAction('Rejected');
                                    setReviewNoteInput('متاسفانه به علت نیاز به حضور در فروشگاه تایید نشد.');
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                >
                                  <X className="w-4 h-4" />
                                  رد درخواست
                                </button>
                              </div>
                            ) : req.status === 'Approved' ? (
                              <div className="text-left">
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-xl">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  تایید شده توسط مدیریت
                                </span>
                                {req.reviewNote && (
                                  <p className="text-[10px] text-slate-500 mt-1">{req.reviewNote}</p>
                                )}
                              </div>
                            ) : (
                              <div className="text-left">
                                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black px-3 py-1 rounded-xl">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  رد شده
                                </span>
                                {req.reviewNote && (
                                  <p className="text-[10px] text-slate-500 mt-1">{req.reviewNote}</p>
                                )}
                              </div>
                            )}

                            {/* Delete Request */}
                            <button
                              onClick={() => {
                                requireAdminPin(() => deleteLeaveRequest(req.id));
                              }}
                              className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="حذف رکورد"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MY WORK SCHEDULE (EMPLOYEE SELF-SERVICE) */}
      {/* ========================================================================= */}
      {activeSubTab === 'MY_SCHEDULE' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-[#0B1F3A] flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  برنامه کاری ۱ هفته‌ای و وضعیت مرخصی‌های پرسنل
                </h3>
                <p className="text-[11px] text-slate-500">
                  کارمند محترم می‌تواند شیفت هفتگی با فرمت ۱۲ ساعته و وضعیت مرخصی‌های خود را مشاهده کند.
                </p>
              </div>

              {/* Employee Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">انتخاب کارمند:</span>
                <select
                  value={selectedMyEmpUsername}
                  onChange={(e) => setSelectedMyEmpUsername(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {employees.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.fullName} ({u.employeeCode || u.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Employee View */}
            {(() => {
              const currentEmp = employees.find(u => u.username === selectedMyEmpUsername) || employees[0];
              if (!currentEmp) return null;
              const schedule = currentEmp.schedule || DEFAULT_WEEKLY_SCHEDULE;
              const myRequests = leaveRequests.filter(r => r.employeeUsername === currentEmp.username);

              return (
                <div className="space-y-5">
                  {/* Top Employee Profile Strip */}
                  <div className="bg-gradient-to-r from-slate-900 to-[#0B1F3A] text-white p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={currentEmp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                        alt={currentEmp.fullName} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-md"
                      />
                      <div>
                        <h4 className="font-black text-base text-white">{currentEmp.fullName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                          <span className="bg-[#D4AF37] text-[#0B1F3A] font-mono font-black text-[11px] px-2 py-0.5 rounded">
                            {currentEmp.employeeCode || 'STS1001'}
                          </span>
                          <span>سمت: {currentEmp.role}</span>
                          <span>•</span>
                          <span>تلفن: {currentEmp.phone || '0799445566'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setLeaveEmployeeUsername(currentEmp.username);
                        setIsLeaveModalOpen(true);
                      }}
                      className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      درخواست مرخصی برای من
                    </button>
                  </div>

                  {/* 7-Day Card Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-xs text-slate-700">برنامه کاری ۱ هفته‌ای موظفیت:</h4>
                      <span className="text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        ⚠️ برنامه کاری ممکن است تغییر کند، لطفاً همواره بررسی نمایید
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                      {currentWeekDates.map(d => {
                        const shift = schedule[d.key];
                        const isToday = d.isToday;
                        const onLeave = isEmployeeOnLeaveToday(currentEmp.username, d.dateStr);
                        return (
                          <div 
                            key={d.key} 
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isToday 
                                ? 'bg-amber-50/80 border-amber-300 shadow-sm ring-2 ring-amber-400' 
                                : shift?.isOff || onLeave
                                  ? 'bg-slate-50 border-slate-200' 
                                  : 'bg-white border-slate-200 shadow-sm'
                            }`}
                          >
                            <span className={`text-[11px] font-black block ${isToday ? 'text-amber-900 font-black' : 'text-slate-700'}`}>
                              {d.nameFa}
                              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{d.formattedFaDate}</span>
                              {isToday && <span className="text-[9px] text-amber-700 block font-normal mt-0.5">(امروز)</span>}
                            </span>

                            <div className="mt-2">
                              {getShiftBadge(shift, onLeave)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* My Leave Requests List */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="font-black text-xs text-slate-700 mb-2.5 flex items-center justify-between">
                      <span>درخواست‌های مرخصی و رخصتی من:</span>
                      <span className="text-slate-400 font-normal">({myRequests.length} مورد)</span>
                    </h4>

                    {myRequests.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                        تاکنون هیچ درخواست مرخصی‌ای توسط این پرسنل ثبت نشده است.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {myRequests.map(req => (
                          <div key={req.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800">{getLeaveTypeFa(req.type)}</span>
                                <span className="text-slate-500 font-bold">از {req.startDate} تا {req.endDate}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">دلیل: {req.reason}</p>
                            </div>

                            <div>
                              {req.status === 'Pending' && (
                                <span className="bg-amber-100 text-amber-800 font-black text-[10px] px-2.5 py-1 rounded-lg">
                                  در انتظار بررسی مدیریت
                                </span>
                              )}
                              {req.status === 'Approved' && (
                                <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-1 rounded-lg">
                                  ✓ تایید شده
                                </span>
                              )}
                              {req.status === 'Rejected' && (
                                <span className="bg-rose-100 text-rose-800 font-black text-[10px] px-2.5 py-1 rounded-lg">
                                  ✗ رد شده
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT EMPLOYEE SCHEDULE (STRICT 12-HOUR FORMAT) */}
      {/* ========================================================================= */}
      {editingScheduleEmp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[140] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  تنظیم شیفت ۱ هفته‌ای: {editingScheduleEmp.fullName}
                  <span className="bg-[#D4AF37] text-[#0B1F3A] font-mono text-xs px-2 py-0.5 rounded font-black">
                    {editingScheduleEmp.employeeCode}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">ساعات کاری با فرمت ۱۲ ساعته (قبل از ظهر / بعد از ظهر) تنظیم می‌شود.</p>
              </div>
              <button
                onClick={() => setEditingScheduleEmp(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Bar */}
            <div className="bg-slate-100 p-3 px-6 flex items-center gap-2 flex-wrap border-b border-slate-200 text-xs font-bold">
              <span className="text-slate-500">الگوهای سریع:</span>
              <button
                type="button"
                onClick={() => applyPreset('MORNING')}
                className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                شیفت صبح (۰۸:۰۰ ق.ظ - ۰۴:۰۰ ب.ظ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('EVENING')}
                className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                شیفت عصر (۰۲:۰۰ ب.ظ - ۱۰:۰۰ ب.ظ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('FULL_DAY')}
                className="bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                تمام وقت استاندارد (۰۸:۳۰ ق.ظ - ۰۸:۰۰ ب.ظ)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('STORE_HOURS')}
                className="bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Store className="w-3 h-3" />
                مطابق با ساعات رسمی فروشگاه
              </button>
            </div>

            {/* Body 7-day configuration */}
            <div className="p-6 overflow-y-auto space-y-3">
              {DAYS_OF_WEEK.map(d => {
                const currentDayShift = tempSchedule[d.key] || {
                  day: d.key,
                  dayNameFa: d.nameFa,
                  shiftType: 'Morning',
                  startTime: '08:00',
                  endTime: '16:00',
                  isOff: false
                };

                const startParts = parse24hTo12hParts(currentDayShift.startTime || '08:00');
                const endParts = parse24hTo12hParts(currentDayShift.endTime || '16:00');

                return (
                  <div 
                    key={d.key} 
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      currentDayShift.isOff ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="w-32">
                      <span className="font-black text-xs text-slate-900 block">{d.nameFa}</span>
                      <label className="inline-flex items-center gap-1.5 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentDayShift.isOff}
                          onChange={(e) => {
                            setTempSchedule(prev => ({
                              ...prev,
                              [d.key]: {
                                ...currentDayShift,
                                isOff: e.target.checked,
                                shiftType: e.target.checked ? 'Off' : 'Morning',
                                startTime: e.target.checked ? '' : '08:00',
                                endTime: e.target.checked ? '' : '16:00'
                              }
                            }));
                          }}
                          className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                        />
                        <span className="text-[11px] text-slate-600 font-bold">روز تعطیل (Off)</span>
                      </label>
                    </div>

                    {!currentDayShift.isOff && (
                      <div className="flex items-center gap-3 flex-1 flex-wrap text-xs">
                        <select
                          value={currentDayShift.shiftType}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            let start = currentDayShift.startTime;
                            let end = currentDayShift.endTime;
                            if (val === 'Morning') { start = '08:00'; end = '16:00'; }
                            if (val === 'Evening') { start = '14:00'; end = '22:00'; }
                            if (val === 'FullDay') { start = '08:30'; end = '20:00'; }
                            setTempSchedule(prev => ({
                              ...prev,
                              [d.key]: { ...currentDayShift, shiftType: val, startTime: start, endTime: end }
                            }));
                          }}
                          className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-800"
                        >
                          <option value="Morning">شیفت صبح (Morning)</option>
                          <option value="Evening">شیفت عصر (Evening)</option>
                          <option value="FullDay">تمام وقت (Full Day)</option>
                          <option value="Custom">ساعات سفارشی</option>
                        </select>

                        {/* 12-Hour formatted start/end selector */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-bold text-[10px]">از:</span>
                          <select
                            value={startParts.hour}
                            onChange={(e) => {
                              const newH = parseInt(e.target.value, 10);
                              const newTime24 = convert12hPartsTo24h(newH, startParts.minute, startParts.meridiem);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, startTime: newTime24 }
                              }));
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-bold"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                              <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <span className="text-slate-400">:</span>
                          <select
                            value={startParts.minute}
                            onChange={(e) => {
                              const newM = parseInt(e.target.value, 10);
                              const newTime24 = convert12hPartsTo24h(startParts.hour, newM, startParts.meridiem);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, startTime: newTime24 }
                              }));
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-bold"
                          >
                            {[0, 15, 30, 45].map(m => (
                              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newMer = startParts.meridiem === 'AM' ? 'PM' : 'AM';
                              const newTime24 = convert12hPartsTo24h(startParts.hour, startParts.minute, newMer);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, startTime: newTime24 }
                              }));
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                              startParts.meridiem === 'AM' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                            }`}
                          >
                            {startParts.meridiem === 'AM' ? 'ق.ظ' : 'ب.ظ'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <span className="text-slate-500 font-bold text-[10px]">تا:</span>
                          <select
                            value={endParts.hour}
                            onChange={(e) => {
                              const newH = parseInt(e.target.value, 10);
                              const newTime24 = convert12hPartsTo24h(newH, endParts.minute, endParts.meridiem);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, endTime: newTime24 }
                              }));
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-bold"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                              <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <span className="text-slate-400">:</span>
                          <select
                            value={endParts.minute}
                            onChange={(e) => {
                              const newM = parseInt(e.target.value, 10);
                              const newTime24 = convert12hPartsTo24h(endParts.hour, newM, endParts.meridiem);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, endTime: newTime24 }
                              }));
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-mono font-bold"
                          >
                            {[0, 15, 30, 45].map(m => (
                              <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newMer = endParts.meridiem === 'AM' ? 'PM' : 'AM';
                              const newTime24 = convert12hPartsTo24h(endParts.hour, endParts.minute, newMer);
                              setTempSchedule(prev => ({
                                ...prev,
                                [d.key]: { ...currentDayShift, endTime: newTime24 }
                              }));
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                              endParts.meridiem === 'AM' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'
                            }`}
                          >
                            {endParts.meridiem === 'AM' ? 'ق.ظ' : 'ب.ظ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingScheduleEmp(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] font-black px-6 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                ذخیره برنامه ۱ هفته‌ای
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT LEAVE / DAY OFF REQUEST */}
      {/* ========================================================================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[140] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto">
            
            {/* Header */}
            <div className="bg-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">ثبت درخواست مرخصی / روز تعطیل</h3>
                  <p className="text-[11px] text-slate-300">ارسال به سیستم جهت تایید توسط مدیریت</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLeaveRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">کارمند متقاضی:</label>
                <select
                  value={leaveEmployeeUsername}
                  onChange={(e) => setLeaveEmployeeUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  {employees.map(u => (
                    <option key={u.username} value={u.username}>
                      {u.fullName} ({u.employeeCode || u.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع مرخصی / درخواست:</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="Vacation">مرخصی استحقاقی (روزانه / سالانه)</option>
                  <option value="Sick">مرخصی استعلاجی (بیماری / معالجه)</option>
                  <option value="ShiftOff">درخواست روز تعطیلی / جابجایی شیفت (Off Day)</option>
                  <option value="Emergency">رخصتی اضطراری / خانوادگی</option>
                  <option value="Hourly">مرخصی ساعتی</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">از تاریخ:</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تا تاریخ:</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {leaveType === 'Hourly' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تعداد ساعت مرخصی:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={leaveHours}
                    onChange={(e) => setLeaveHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">دلیل و توضیحات درخواست:</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="لطفاً دلیل نیاز به مرخصی یا جابجایی روز تعطیل را شرح دهید..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] font-black px-6 py-2 rounded-xl shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  ثبت و ارسال به مدیریت
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANAGER REVIEW CONFIRMATION */}
      {/* ========================================================================= */}
      {reviewingRequest && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto">
            
            <div className={`p-4 text-white flex items-center justify-between ${reviewAction === 'Approved' ? 'bg-emerald-700' : 'bg-rose-700'}`}>
              <h3 className="font-black text-sm flex items-center gap-2">
                {reviewAction === 'Approved' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {reviewAction === 'Approved' ? 'تایید درخواست مرخصی پرسنل' : 'رد درخواست مرخصی'}
              </h3>
              <button onClick={() => setReviewingRequest(null)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">نام پرسنل:</span>
                  <span className="font-black text-slate-900">{reviewingRequest.employeeName} ({reviewingRequest.employeeCode})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">بازه تاریخ:</span>
                  <span className="font-mono text-slate-800 font-bold">از {reviewingRequest.startDate} تا {reviewingRequest.endDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">نوع:</span>
                  <span className="font-bold text-indigo-700">{getLeaveTypeFa(reviewingRequest.type)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">یادداشت و دستور مدیر (اختیاری):</label>
                <input
                  type="text"
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="مثلاً: تایید شد، همکار جانشین تعیین گردید."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingRequest(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReview}
                  className={`font-black px-6 py-2 rounded-xl text-white shadow-md cursor-pointer transition-all active:scale-95 ${
                    reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  ثبت تصمیم نهایی
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
