import React, { useState, useEffect } from 'react';
import { 
  Clock, Store, Calendar, CheckCircle2, XCircle, AlertCircle, 
  Edit3, Save, Sparkles, RefreshCw, Sun, Moon, Info, ShieldCheck, 
  ChevronRight, CalendarDays, Check, X, ShieldAlert, Bell
} from 'lucide-react';
import { StoreOperatingHours, StoreDailyHours } from '../types';
import { 
  DEFAULT_STORE_OPERATING_HOURS,
  formatTime12h, parse24hTo12hParts, convert12hPartsTo24h, checkStoreOpenStatus 
} from '../utils';
import { useAppState } from '../AppContext';

const DAYS_LIST: { key: keyof StoreOperatingHours; nameFa: string; isWeekend?: boolean }[] = [
  { key: 'Saturday', nameFa: 'شنبه' },
  { key: 'Sunday', nameFa: 'یکشنبه' },
  { key: 'Monday', nameFa: 'دوشنبه' },
  { key: 'Tuesday', nameFa: 'سه‌شنبه' },
  { key: 'Wednesday', nameFa: 'چهارشنبه' },
  { key: 'Thursday', nameFa: 'پنج‌شنبه' },
  { key: 'Friday', nameFa: 'جمعه', isWeekend: true }
];

interface StoreHoursManagerProps {
  isAdminMode?: boolean;
  requireAdminPin?: (action: () => void) => void;
  onApplyToEmployeeShifts?: (storeHours: StoreOperatingHours) => void;
}

export const StoreHoursManager: React.FC<StoreHoursManagerProps> = ({
  isAdminMode = true,
  requireAdminPin,
  onApplyToEmployeeShifts
}) => {
  const { state, updateStoreHours } = useAppState() as any;
  const storeHours = state.storeHours || DEFAULT_STORE_OPERATING_HOURS;
  
  const [editingDay, setEditingDay] = useState<keyof StoreOperatingHours | null>(null);
  
  // 12-Hour Editor State for modal/in-place edit
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [editOpenHour, setEditOpenHour] = useState(8);
  const [editOpenMinute, setEditOpenMinute] = useState(0);
  const [editOpenMeridiem, setEditOpenMeridiem] = useState<'AM' | 'PM'>('AM');
  
  const [editCloseHour, setEditCloseHour] = useState(9);
  const [editCloseMinute, setEditCloseMinute] = useState(0);
  const [editCloseMeridiem, setEditCloseMeridiem] = useState<'AM' | 'PM'>('PM');
  
  const [editSpecialNote, setEditSpecialNote] = useState('');
  const [generalNoteInput, setGeneralNoteInput] = useState(storeHours.generalNote || '');
  const [savedToast, setSavedToast] = useState(false);

  // Live status update every 30 seconds
  const [openStatus, setOpenStatus] = useState(() => checkStoreOpenStatus(storeHours));

  useEffect(() => {
    setGeneralNoteInput(storeHours.generalNote || '');
    setOpenStatus(checkStoreOpenStatus(storeHours));
  }, [storeHours]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOpenStatus(checkStoreOpenStatus(storeHours));
    }, 30000);
    return () => clearInterval(timer);
  }, [storeHours]);

  const openDayEdit = (dayKey: keyof StoreOperatingHours) => {
    if (dayKey === 'generalNote') return;
    const dayData = storeHours[dayKey] as StoreDailyHours;
    if (!dayData) return;

    const openParts = parse24hTo12hParts(dayData.openTime);
    const closeParts = parse24hTo12hParts(dayData.closeTime);

    setEditingDay(dayKey);
    setEditIsOpen(dayData.isOpen);
    setEditOpenHour(openParts.hour);
    setEditOpenMinute(openParts.minute);
    setEditOpenMeridiem(openParts.meridiem);

    setEditCloseHour(closeParts.hour);
    setEditCloseMinute(closeParts.minute);
    setEditCloseMeridiem(closeParts.meridiem);

    setEditSpecialNote(dayData.specialNote || '');
  };

  const handleSaveDay = () => {
    if (!editingDay || editingDay === 'generalNote') return;

    const performSave = () => {
      const openTime24 = convert12hPartsTo24h(editOpenHour, editOpenMinute, editOpenMeridiem);
      const closeTime24 = convert12hPartsTo24h(editCloseHour, editCloseMinute, editCloseMeridiem);

      const dayObj = storeHours[editingDay] as StoreDailyHours;
      const updated: StoreOperatingHours = {
        ...storeHours,
        [editingDay]: {
          ...dayObj,
          isOpen: editIsOpen,
          openTime: openTime24,
          closeTime: closeTime24,
          specialNote: editSpecialNote.trim()
        }
      };

      
      updateStoreHours(updated);
      setEditingDay(null);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    };

    if (requireAdminPin) {
      requireAdminPin(performSave);
    } else {
      performSave();
    }
  };

  const handleSaveGeneralNote = () => {
    const performSave = () => {
      const updated: StoreOperatingHours = {
        ...storeHours,
        generalNote: generalNoteInput.trim()
      };
      
      updateStoreHours(updated);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    };

    if (requireAdminPin) {
      requireAdminPin(performSave);
    } else {
      performSave();
    }
  };

  const handleApplyPreset = (preset: 'STANDARD_7DAYS' | 'FULL_OPEN_WEEK' | 'RAMADAN_EVENING') => {
    const performApply = () => {
      let updated: StoreOperatingHours = { ...storeHours };

      if (preset === 'STANDARD_7DAYS') {
        DAYS_LIST.forEach(d => {
          if (d.key === 'Friday') {
            (updated as any)[d.key] = {
              day: d.key,
              dayNameFa: d.nameFa,
              isOpen: true,
              openTime: '13:30',
              closeTime: '21:30',
              specialNote: 'بازگشایی بعد از ادای نماز جمعه'
            };
          } else {
            (updated as any)[d.key] = {
              day: d.key,
              dayNameFa: d.nameFa,
              isOpen: true,
              openTime: '08:00',
              closeTime: '21:00',
              specialNote: 'روز کاری معمول'
            };
          }
        });
        updated.generalNote = 'شنبه تا پنج‌شنبه از ۰۸:۰۰ صبح الی ۰۹:۰۰ شب، جمعه‌ها از ۰۱:۳۰ بعد از ظهر الی ۰۹:۳۰ شب';
      } else if (preset === 'FULL_OPEN_WEEK') {
        DAYS_LIST.forEach(d => {
          (updated as any)[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            isOpen: true,
            openTime: '08:00',
            closeTime: '22:00',
            specialNote: 'فعالیت همه‌روزه تمام وقت'
          };
        });
        updated.generalNote = 'فروشگاه در تمام ایام هفته از ساعت ۰۸:۰۰ صبح الی ۱۰:۰۰ شب بدون وقفه باز می‌باشد.';
      } else if (preset === 'RAMADAN_EVENING') {
        DAYS_LIST.forEach(d => {
          (updated as any)[d.key] = {
            day: d.key,
            dayNameFa: d.nameFa,
            isOpen: true,
            openTime: '09:00',
            closeTime: '23:30',
            specialNote: 'ساعات کاری شبانه ویژه ایام ماه مبارک و اعیاد'
          };
        });
        updated.generalNote = 'ساعات کاری ویژه شبانه از ۰۹:۰۰ صبح الی ۱۱:۳۰ شب (همراه با شیفت بعد از افطار)';
      }

      
      setGeneralNoteInput(updated.generalNote || '');
      updateStoreHours(updated);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    };

    if (requireAdminPin) {
      requireAdminPin(performApply);
    } else {
      performApply();
    }
  };

  const getTodayDayKey = (): keyof StoreOperatingHours => {
    const dayNum = new Date().getDay(); // 0 = Sun, 6 = Sat
    const map: Record<number, keyof StoreOperatingHours> = {
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

  const todayKey = getTodayDayKey();

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          تنظیمات ساعات کاری فروشگاه با موفقیت ذخیره گردید.
        </div>
      )}

      {/* Main Card Header */}
      <div className="bg-gradient-to-r from-[#0B1F3A] via-[#123B66] to-[#0B1F3A] text-white p-6 rounded-3xl shadow-lg border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  تقویم و ساعات کاری رسمی فروشگاه (۷ روز هفته)
                </h2>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  openStatus.isOpenNow ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  {openStatus.isOpenNow ? 'هم‌اکنون باز است' : 'هم‌اکنون بسته است'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                ساعات رسمی بازگشایی و بستن درگاه فروشگاه با فرمت ۱۲ ساعته (قبل از ظهر / بعد از ظهر) جهت اطلاع مشتریان و تنظیم شیفت پرسنل
              </p>
            </div>
          </div>

          {/* Quick Actions for Admin */}
          {isAdminMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyPreset('STANDARD_7DAYS')}
                className="bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="شنبه تا پنج‌شنبه ۸ صبح تا ۹ شب، جمعه باز بعد از نماز"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                الگوی استاندارد ۷ روزه
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('FULL_OPEN_WEEK')}
                className="bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="همه‌روزه ۸ صبح تا ۱۰ شب"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                الگوی تمام هفته (۸ ق.ظ - ۱۰ ب.ظ)
              </button>

              {onApplyToEmployeeShifts && (
                <button
                  type="button"
                  onClick={() => onApplyToEmployeeShifts(storeHours)}
                  className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] text-xs px-4 py-2 rounded-xl font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  اعمال ساعات فروشگاه به شیفت پرسنل
                </button>
              )}
            </div>
          )}
        </div>

        {/* Prominent Disclaimer Notice */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-white block mb-0.5">⚠️ اطلاعیه مهم تغییرات برنامه کاری و شیفت‌ها:</span>
            برنامه کاری فروشگاه و شیفت‌های هفتگی پرسنل ممکن است بر اساس ضرورت کاری، ایام اعیاد، روزهای ویژه و شرایط محیطی تغییر کند. لطفاً همواره ساعات کاری ثبت شده و تابلوی اعلانات را بررسی فرمایید.
          </div>
        </div>
      </div>

      {/* 7-Day Table / Cards Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-sm text-[#0B1F3A] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              جدول زمان‌بندی ساعات کاری فروشگاه (شنبه تا جمعه)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              نمایش ساعات بازگشایی و تعطیلی با فرمت ۱۲ ساعته (AM / PM)
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
            <span>امروز:</span>
            <span className="font-black text-[#0B1F3A]">{DAYS_LIST.find(d => d.key === todayKey)?.nameFa}</span>
            <span>•</span>
            <span className="text-emerald-700 font-mono font-bold">
              {openStatus.formattedHours}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
          {DAYS_LIST.map(day => {
            const dayData = (storeHours[day.key] as StoreDailyHours) || {
              day: day.key,
              dayNameFa: day.nameFa,
              isOpen: true,
              openTime: '08:00',
              closeTime: '21:00'
            };
            const isToday = day.key === todayKey;

            return (
              <div 
                key={day.key}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isToday 
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400 shadow-md' 
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isToday && (
                  <div className="absolute top-0 right-0 left-0 bg-amber-500 text-slate-950 font-black text-[9px] text-center py-0.5">
                    امروز (روز جاری)
                  </div>
                )}

                <div className={isToday ? 'mt-2' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-slate-800">{day.nameFa}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      dayData.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {dayData.isOpen ? 'باز' : 'تعطیل'}
                    </span>
                  </div>

                  {dayData.isOpen ? (
                    <div className="space-y-1.5 my-2">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block font-bold">شروع به کار:</span>
                        <span className="text-xs font-mono font-black text-indigo-900">
                          {formatTime12h(dayData.openTime, { usePersianMeridiem: true })}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block font-bold">پایان و بستن:</span>
                        <span className="text-xs font-mono font-black text-indigo-900">
                          {formatTime12h(dayData.closeTime, { usePersianMeridiem: true })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center my-3 font-bold">
                      فروشگاه در این روز تعطیل می‌باشد.
                    </div>
                  )}

                  {dayData.specialNote && (
                    <div className="text-[10px] text-slate-600 bg-amber-100/60 border border-amber-200 p-2 rounded-xl font-medium mt-2">
                      <span className="font-bold text-amber-900 block">یادداشت:</span>
                      {dayData.specialNote}
                    </div>
                  )}
                </div>

                {isAdminMode && (
                  <button
                    type="button"
                    onClick={() => openDayEdit(day.key)}
                    className="mt-3 w-full py-1.5 bg-white hover:bg-[#0B1F3A] hover:text-[#D4AF37] text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    ویرایش ساعات
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* General Store Announcement Section */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              پیام و اطلاعیه عمومی ساعات کاری فروشگاه (نمایش به مشتریان و عموم):
            </h4>
          </div>

          {isAdminMode ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={generalNoteInput}
                onChange={(e) => setGeneralNoteInput(e.target.value)}
                placeholder="مثلاً: ساعات کاری فروشگاه در ایام عید قربان از ۹ صبح تا ۱۲ شب می‌باشد..."
                className="flex-1 w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveGeneralNote}
                className="w-full sm:w-auto bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-sm"
              >
                ذخیره پیام عمومی
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
              {storeHours.generalNote || 'ساعات کاری معمول شنبه الی پنج‌شنبه ۸ صبح تا ۹ شب و جمعه‌ها بعد از ظهر.'}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12-Hour Daily Hour Edit Modal */}
      {/* ========================================================================= */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200 text-right">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0B1F3A]">
                    ویرایش ساعات کاری: {DAYS_LIST.find(d => d.key === editingDay)?.nameFa}
                  </h3>
                  <p className="text-xs text-slate-400">فرمت ۱۲ ساعته (قبل از ظهر / بعد از ظهر)</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingDay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Is Open Toggle */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 block">وضعیت فعالیت فروشگاه در این روز</span>
                <span className="text-[11px] text-slate-500">آیا فروشگاه در این روز باز است یا تعطیل رسمی؟</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditIsOpen(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    editIsOpen ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  فروشگاه باز است
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsOpen(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !editIsOpen ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  تعطیل رسمی
                </button>
              </div>
            </div>

            {/* 12-Hour Clock Pickers */}
            {editIsOpen && (
              <div className="space-y-4">
                
                {/* Open Time (12h format) */}
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      ساعت بازگشایی و شروع به کار (Open Time):
                    </label>
                    <span className="font-mono text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      {editOpenHour.toString().padStart(2, '0')}:{editOpenMinute.toString().padStart(2, '0')} {editOpenMeridiem === 'AM' ? 'قبل از ظهر (AM)' : 'بعد از ظهر (PM)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">ساعت (۱ تا ۱۲):</span>
                      <select
                        value={editOpenHour}
                        onChange={(e) => setEditOpenHour(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                          <option key={h} value={h}>{h} ({h.toString().padStart(2, '0')})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">دقیقه:</span>
                      <select
                        value={editOpenMinute}
                        onChange={(e) => setEditOpenMinute(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        {[0, 15, 30, 45].map(m => (
                          <option key={m} value={m}>{m.toString().padStart(2, '0')} دقیقه</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">نوبت روز:</span>
                      <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setEditOpenMeridiem('AM')}
                          className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            editOpenMeridiem === 'AM' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          ق.ظ (AM)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditOpenMeridiem('PM')}
                          className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            editOpenMeridiem === 'PM' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          ب.ظ (PM)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Time (12h format) */}
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-purple-600" />
                      ساعت پایان و بستن فروشگاه (Close Time):
                    </label>
                    <span className="font-mono text-xs font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                      {editCloseHour.toString().padStart(2, '0')}:{editCloseMinute.toString().padStart(2, '0')} {editCloseMeridiem === 'AM' ? 'قبل از ظهر (AM)' : 'بعد از ظهر (PM)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">ساعت (۱ تا ۱۲):</span>
                      <select
                        value={editCloseHour}
                        onChange={(e) => setEditCloseHour(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                          <option key={h} value={h}>{h} ({h.toString().padStart(2, '0')})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">دقیقه:</span>
                      <select
                        value={editCloseMinute}
                        onChange={(e) => setEditCloseMinute(parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        {[0, 15, 30, 45].map(m => (
                          <option key={m} value={m}>{m.toString().padStart(2, '0')} دقیقه</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold mb-1">نوبت روز:</span>
                      <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setEditCloseMeridiem('AM')}
                          className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            editCloseMeridiem === 'AM' ? 'bg-purple-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          ق.ظ (AM)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditCloseMeridiem('PM')}
                          className={`py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            editCloseMeridiem === 'PM' ? 'bg-purple-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          ب.ظ (PM)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Special Note for this day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                یادداشت ویژه برای این روز (اختیاری):
              </label>
              <input
                type="text"
                value={editSpecialNote}
                onChange={(e) => setEditSpecialNote(e.target.value)}
                placeholder="مثلاً: جمعه بعد از ادای نماز جمعه / تحویل فوری بار"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDay}
                className="flex-1 bg-[#0B1F3A] hover:bg-[#123B66] text-[#D4AF37] py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                ذخیره تغییرات ساعت
              </button>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                انصراف
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
