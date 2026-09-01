import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Printer, Download, QrCode, ShieldCheck, Phone, MapPin, 
  Calendar, CheckCircle2, Building2, User, Sparkles, CreditCard
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppUser } from '../types';

interface EmployeeIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: AppUser | null;
}

export const EmployeeIdCardModal: React.FC<EmployeeIdCardModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  const [cardLayout, setCardLayout] = useState<'VERTICAL' | 'HORIZONTAL'>('VERTICAL');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Store information
  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'مرکز تجارتی ستاره شهر';
  const storePhone = localStorage.getItem('AFG_STORE_PHONE') || '0799445566';
  const storeCity = localStorage.getItem('AFG_STORE_CITY') || 'کابل';
  const storeAddress = localStorage.getItem('AFG_STORE_ADDRESS') || 'چهارراهی پشتونستان، مرکز تجارتی ستاره شهر';

  useEffect(() => {
    if (employee) {
      // Standard STS employee QR format: "STC_EMP:STS1001"
      const payload = `STC_EMP:${employee.employeeCode || employee.username}`;
      QRCode.toDataURL(payload, {
        width: 400,
        margin: 1,
        color: {
          dark: '#0B1F3A',
          light: '#FFFFFF'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const getRoleFa = (role: string) => {
    switch (role) {
      case 'Owner': return 'مالک و مدیر ارشد';
      case 'Manager': return 'مدیر داخلی و اجرایی';
      case 'Cashier': return 'صندوق‌دار و کارشناس فروش';
      case 'Warehouse Staff': return 'مسئول گدام و موجودی';
      default: return role;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[130] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        
        {/* Modal Top Bar */}
        <div className="bg-[#0B1F3A] text-white p-4 px-6 flex items-center justify-between shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm text-white flex items-center gap-2">
                کارت شناسایی و تردد رسمی پرسنل
                <span className="bg-[#D4AF37] text-[#0B1F3A] text-[10px] font-black px-2 py-0.5 rounded-md">
                  {employee.employeeCode}
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">کارت پرسنلی مجهز به بارکد QR، عکس رسمی و مشخصات فروشگاه</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#D4AF37] hover:bg-[#B8942E] text-[#0B1F3A] font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              چاپ کارت پرسنلی
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout Switcher & Options */}
        <div className="bg-slate-100 p-3 px-6 flex items-center justify-between border-b border-slate-200 print:hidden text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">طرح کارت:</span>
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCardLayout('VERTICAL')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  cardLayout === 'VERTICAL'
                    ? 'bg-[#0B1F3A] text-[#D4AF37] font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                آویز گردنی (عمودی)
              </button>
              <button
                type="button"
                onClick={() => setCardLayout('HORIZONTAL')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  cardLayout === 'HORIZONTAL'
                    ? 'bg-[#0B1F3A] text-[#D4AF37] font-black shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                کارت PVC جیبی (افقی)
              </button>
            </div>
          </div>

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`QR-${employee.employeeCode || employee.username}.png`}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود فایل بارکد QR
            </a>
          )}
        </div>

        {/* Printable Card Area */}
        <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-100/60" id="printable-employee-card">
          
          {/* ================= VERTICAL BADGE LAYOUT ================= */}
          {cardLayout === 'VERTICAL' && (
            <div 
              ref={cardRef}
              className="w-full max-w-[340px] bg-gradient-to-b from-[#0B1F3A] via-[#102A4E] to-[#0B1F3A] text-white rounded-3xl p-6 shadow-2xl border-2 border-[#D4AF37]/50 relative overflow-hidden flex flex-col justify-between"
              style={{ minHeight: '520px' }}
            >
              {/* Decorative Holographic Background Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

              {/* Lanyard Punch Hole Mockup */}
              <div className="w-12 h-2.5 bg-slate-950/70 border border-white/20 rounded-full mx-auto mb-4 shrink-0 shadow-inner"></div>

              {/* Store Header */}
              <div className="text-center pb-4 border-b border-white/15 relative">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    <Building2 className="w-5 h-5 text-[#0B1F3A]" />
                  </div>
                  <h3 className="font-black text-sm text-white tracking-tight">{storeName}</h3>
                </div>
                <p className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase">
                  کارت شناسایی و تردد هوشمند پرسنل
                </p>
              </div>

              {/* Employee Photo & STS Code */}
              <div className="flex flex-col items-center text-center my-4 relative">
                <div className="relative mb-3">
                  <div className="w-28 h-28 rounded-2xl p-1 bg-gradient-to-tr from-[#D4AF37] via-amber-200 to-[#D4AF37] shadow-xl">
                    <img 
                      src={employee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                      alt={employee.fullName} 
                      className="w-full h-full object-cover rounded-xl bg-slate-800"
                    />
                  </div>
                  <span className="absolute -bottom-2 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md border border-emerald-300">
                    پرسنل رسمی
                  </span>
                </div>

                <h4 className="font-black text-lg text-white mt-1">{employee.fullName}</h4>
                <p className="text-xs font-bold text-[#D4AF37] mt-0.5">{getRoleFa(employee.role)}</p>
                
                {/* Employee ID Badge Number */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1 rounded-xl border border-white/20 shadow-inner">
                  <span className="text-[10px] text-slate-300 font-bold">شماره پرسنلی:</span>
                  <span className="font-mono text-sm font-black text-amber-300 tracking-wider">
                    {employee.employeeCode || 'STS1001'}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 text-[11px] space-y-1.5 my-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">تلفن تماس:</span>
                  <span className="font-mono font-bold text-white" dir="ltr">{employee.phone || '0799445566'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">دیپارتمنت:</span>
                  <span className="font-bold text-white">{employee.department || 'شعبه مرکزی'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">تاریخ صدور / اعتبار:</span>
                  <span className="font-mono font-bold text-white">{new Date().toLocaleDateString('fa-IR', { year: 'numeric' })}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                <div className="bg-white p-1.5 rounded-xl shadow-md shrink-0">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-600">بارکد</div>
                  )}
                </div>
                <div className="text-[9px] text-slate-300 leading-relaxed">
                  <p className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    کارت هوشمند تردد کیوسک
                  </p>
                  <p className="text-slate-400 mt-0.5">اسکن سریع در کیوسک تردد جهت ثبت ورود و خروج رسمی</p>
                </div>
              </div>

              {/* Bottom Security Footer */}
              <div className="mt-3 pt-2 border-t border-white/10 text-center text-[8px] text-slate-400 font-mono">
                SETARAH SHAHR COMMERCIAL STORE • KABUL
              </div>
            </div>
          )}

          {/* ================= HORIZONTAL CARD LAYOUT ================= */}
          {cardLayout === 'HORIZONTAL' && (
            <div 
              ref={cardRef}
              className="w-full max-w-[500px] bg-gradient-to-r from-[#0B1F3A] via-[#123B66] to-[#0B1F3A] text-white rounded-3xl p-6 shadow-2xl border-2 border-[#D4AF37]/50 relative overflow-hidden flex flex-col justify-between"
              style={{ minHeight: '310px' }}
            >
              {/* Glowing effects */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                    <Building2 className="w-5 h-5 text-[#0B1F3A]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white tracking-tight">{storeName}</h3>
                    <span className="text-[9px] text-[#D4AF37] font-bold block">کارت شناسایی رسمی و تردد پرسنل</span>
                  </div>
                </div>

                <div className="bg-[#D4AF37] text-[#0B1F3A] font-black text-xs px-3 py-1 rounded-xl shadow-md font-mono">
                  {employee.employeeCode || 'STS1001'}
                </div>
              </div>

              {/* Middle Section: Photo + Info + QR */}
              <div className="grid grid-cols-12 gap-3 items-center my-2">
                {/* Photo */}
                <div className="col-span-3 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#D4AF37] to-amber-200 shadow-md">
                    <img 
                      src={employee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                      alt={employee.fullName} 
                      className="w-full h-full object-cover rounded-xl bg-slate-800"
                    />
                  </div>
                </div>

                {/* Employee Details */}
                <div className="col-span-6 space-y-1 text-xs">
                  <h4 className="font-black text-base text-white">{employee.fullName}</h4>
                  <p className="text-xs font-bold text-[#D4AF37]">{getRoleFa(employee.role)}</p>
                  
                  <div className="pt-1.5 space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">تلفن:</span>
                      <span className="font-mono text-white font-bold" dir="ltr">{employee.phone || '0799445566'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">شناسه سیستم:</span>
                      <span className="font-mono text-amber-300 font-bold">{employee.username}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="col-span-3 flex flex-col items-center justify-center">
                  <div className="bg-white p-1.5 rounded-xl shadow-md">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-18 h-18 object-contain" />
                    ) : (
                      <div className="w-18 h-18 bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-600">بارکد</div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-300 font-bold mt-1">اسکن تردد</span>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[9px] text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  {storeAddress}
                </span>
                <span className="font-mono text-slate-400">
                  VERIFIED • SECURE QR
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Instructions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
            این کارت مجهز به کد پرسنلی <strong className="text-indigo-700 font-mono">{employee.employeeCode}</strong> و بارکد اختصاصی جهت ثبت ورود/خروج سریع در کیوسک است.
          </p>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  );
};
