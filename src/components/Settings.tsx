import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { SecurityGateModal } from './SecurityGate';
import { 
  Settings as SettingsIcon, 
  Save, 
  Users, 
  Database, 
  Coins, 
  Percent, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Download, 
  Upload, 
  Store,
  UserPlus,
  ShieldAlert,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'Admin' | 'Salesperson' | 'Assistant' | 'Staff';
}

export const Settings: React.FC = () => {
  const { state, updateExchangeRate, resetState, editProduct } = useAppState();

  // Store Brand Settings & Monogram Custom Logo
  const [storeName, setStoreName] = useState(() => localStorage.getItem('AFG_STORE_NAME') || 'فرشگاه ستاره شهر');
  const [phone, setPhone] = useState(() => localStorage.getItem('AFG_STORE_PHONE') || '0799445566');
  const [city, setCity] = useState(() => localStorage.getItem('AFG_STORE_CITY') || 'کابل');
  const [address, setAddress] = useState(() => localStorage.getItem('AFG_STORE_ADDRESS') || 'چهارراهی پشتونستان، مرکز تجارتی ستاره');
  const [logoPreview, setLogoPreview] = useState(() => localStorage.getItem('AFG_STORE_LOGO') || '');

  // Exchange rate setting
  const [rateInput, setRateInput] = useState(state.exchangeRate.toString());

  // Global Margin Markup
  const [markupCostPercent, setMarkupCostPercent] = useState('25'); // 25% margin
  const [wholesaleMarkupPercent, setWholesaleMarkupPercent] = useState('15');

  // Security Gate parameters
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityTitle, setSecurityTitle] = useState('');
  const [securityDesc, setSecurityDesc] = useState('');
  const [securityCallback, setSecurityCallback] = useState<(() => void) | null>(null);

  // Users Database & Inputs
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.error("Failed to parse local users", err);
      }
    }
    return [
      {
        username: 'ADMIN@STC.COM',
        passwordHash: 'Admin$',
        fullName: 'مدیر کل سیستم (ادمین)',
        role: 'Admin'
      }
    ];
  });

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Salesperson' | 'Assistant' | 'Staff'>('Staff');

  // Active Cashier Shift Tracker (synchronous fallback to usersList names)
  const [activeCashier, setActiveCashier] = useState(() => localStorage.getItem('AFG_STORE_CASHIER') || 'مدیر سیستم (ادمین)');
  const [cashierList, setCashierList] = useState<string[]>(() => {
    const saved = localStorage.getItem('AFG_CASHIER_LIST');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      'مدیر کل سیستم (ادمین)',
      'احمد جاوید (صندوقدار نوبت صبح)',
      'سهراب کابلی (صندوقدار نوبت بعد از ظهر)'
    ];
  });

  const triggerSecureAction = (title: string, desc: string, callback: () => void) => {
    setSecurityTitle(title);
    setSecurityDesc(desc);
    setSecurityCallback(() => callback);
    setSecurityOpen(true);
  };

  const handleConfirmSecurityAuth = () => {
    if (securityCallback) {
      securityCallback();
    }
    setSecurityOpen(false);
    setSecurityCallback(null);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('AFG_STORE_NAME', storeName);
    localStorage.setItem('AFG_STORE_PHONE', phone);
    localStorage.setItem('AFG_STORE_CITY', city);
    localStorage.setItem('AFG_STORE_ADDRESS', address);
    alert('تنظیمات برند و مونوگرام دکان با موفقیت ذخیره گردید.');
    window.location.reload(); 
  };

  const handleUpdateExchangeRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert('لطفاً نرخ ارز معتبر برای هر دالر به افغانی وارد کنید.');
      return;
    }

    triggerSecureAction(
      "اصلاح عمومی کسر نرخ تسعیر صرافی",
      `آیا مایل هستید نرخ تبادل هر دالر را از ${state.exchangeRate} به ${parsed} افغانی تغییر دهید؟ کل موازنه دارایی به روز می‌شود.`,
      () => {
        updateExchangeRate(parsed);
        alert(`تغییر نرخ صرافی با موفقیت متوازن و ثبت گردید: دالر = ${parsed} افغانی`);
      }
    );
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim().toUpperCase();
    const pass = newPassword.trim();
    const fname = newFullName.trim();

    if (!uname || !pass || !fname) {
      alert('لطفاً تمامی گزینه‌های راجستر کاربر جدید را با موازنه کامل پر کنید.');
      return;
    }

    if (usersList.some(u => u.username.toUpperCase() === uname)) {
      alert('خطا! کاربری با این نام کاربری/ایمیل قبلاً در سیستم ثبت شده است.');
      return;
    }

    const newUser: AppUser = {
      username: uname,
      passwordHash: pass,
      fullName: fname,
      role: newUserRole
    };

    const roleLabels: Record<string, string> = {
      Admin: 'مدیر',
      Salesperson: 'فروشنده',
      Assistant: 'دستیار',
      Staff: 'کارمند'
    };
    const resolvedLabel = roleLabels[newUserRole] || newUserRole;

    triggerSecureAction(
      "اضافه کردن کاربر جدید با دسترسی سیستمی",
      `آیا تایید صلاحیت می‌کنید که کاربر جدید [${fname}] با نقش [${resolvedLabel}] ثبت شود؟`,
      () => {
        const updated = [...usersList, newUser];
        setUsersList(updated);
        localStorage.setItem('AFG_STORE_USERS', JSON.stringify(updated));

        // Sync helper shifts list as well
        const updatedShifts = [...cashierList];
        if (!updatedShifts.includes(fname)) {
          updatedShifts.push(fname);
          setCashierList(updatedShifts);
          localStorage.setItem('AFG_CASHIER_LIST', JSON.stringify(updatedShifts));
        }

        setNewUsername('');
        setNewPassword('');
        setNewFullName('');
        alert(`کاربر جدید [${fname}] پس از احراز هویت با موفقیت راجستر دفتری شد.`);
      }
    );
  };

  const handleDeleteUserClick = (usernameToDelete: string, fullNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (usernameToDelete.toUpperCase() === 'ADMIN@STC.COM') {
      alert('خطا! اکانت سوپر ادمین پیش‌فرض اصلی فروشگاه غیرقابل حذف است.');
      return;
    }

    triggerSecureAction(
      "حذف و خلع نهایی دسترسی کاربر",
      `آیا مطمئن هستید که می‌خواهید کاربر [ ${fullNameToDelete} ] را لغو صلاحیت نموده و از کل سیستم خارج کنید؟`,
      () => {
        const updated = usersList.filter(u => u.username !== usernameToDelete);
        setUsersList(updated);
        localStorage.setItem('AFG_STORE_USERS', JSON.stringify(updated));

        const updatedShifts = cashierList.filter(c => c !== fullNameToDelete);
        setCashierList(updatedShifts);
        localStorage.setItem('AFG_CASHIER_LIST', JSON.stringify(updatedShifts));

        // Check if deleted user is logged in
        const curUserRaw = localStorage.getItem('AFG_CURRENT_USER');
        if (curUserRaw) {
          try {
            const parsed = JSON.parse(curUserRaw);
            if (parsed.username === usernameToDelete) {
              localStorage.removeItem('AFG_CURRENT_USER');
              localStorage.setItem('AFG_STORE_CASHIER', 'مدیر کل سیستم (ادمین)');
              alert('یوزر حذف گردید و جلسه جاری خاتمه یافت.');
              window.location.reload();
              return;
            }
          } catch(err) {}
        }
        alert('کاربر با موفقیت و پس از تایید رمز عبور ادمین حذف شد.');
      }
    );
  };

  const handleSelectCashier = (cashierName: string) => {
    setActiveCashier(cashierName);
    localStorage.setItem('AFG_STORE_CASHIER', cashierName);
    alert(`کاربر فعال صندوق چرخشی به [${cashierName}] تغییر یافت.`);
  };

  // Pricing markup calculator changer
  const handleApplyGlobalMarkupSubmit = () => {
    const costPercent = parseFloat(markupCostPercent);
    const wholesalePercent = parseFloat(wholesaleMarkupPercent);

    if (isNaN(costPercent) || isNaN(wholesalePercent)) {
      alert('لطفاً نرخ‌های مارک‌آپ را به صورت صحیح عددی مکتوب کنید.');
      return;
    }

    triggerSecureAction(
      "اعمال سراسری موازنه و بازنویسی قیمت‌های فروش",
      `آیا مایل هستید قیمت‌های کل محصولات انبار را بر مبنای فرمول هزینه خرید + درصدهای سود بازنویسی کنید؟ پرچون: +${costPercent}% | عمده: +${wholesalePercent}%`,
      () => {
        state.products.forEach(p => {
          const retailPriceUSD = p.costPriceUSD * (1 + costPercent / 100);
          const wholesalePriceUSD = p.costPriceUSD * (1 + wholesalePercent / 100);

          const updatedProduct = {
            ...p,
            retailPriceUSD,
            retailPriceAFN: retailPriceUSD * state.exchangeRate,
            wholesalePriceUSD,
            wholesalePriceAFN: wholesalePriceUSD * state.exchangeRate,
          };
          editProduct(updatedProduct);
        });
        alert('عملیات هوشمند موازنه قیمت کل اقلام گدام با موفقیت خاتمه یافت.');
      }
    );
  };

  // Export database backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `STARA_SHAHAR_ERP_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import database backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.products && parsed.customers && parsed.cashRegister) {
            localStorage.setItem('AFG_ERP_STATE', JSON.stringify(parsed));
            alert('فایل پشتیبان با موفقیت بارگذاری گردید. به بازنشانی صفحه هدایت می‌شوید.');
            window.location.reload();
          } else {
            alert('خطا! قالب پرونده نامعتبر است.');
          }
        } catch (err) {
          alert('خطا در خواندن فایل!');
        }
      };
    }
  };

  // Clear system COMPLETELY to start from 0
  const handleResetSystemClick = () => {
    triggerSecureAction(
      "پاکسازی کلی پایگاه داده دکان (شروع مجدد از صفر)",
      "هشدار فوق حساس! این عمل کل سوابق فروش، پایگاه مشتریان قرضه، محصولات گدام انبار، فاکتورهای صادره، مونوگرام‌های فروشگاه و حساب‌های کاربری را برای همیشه حذف و سیستم را از صفر مطلق شروع می‌کند.",
      () => {
        resetState();
        localStorage.clear();
        alert('پایگاه داده به طور کامل پاکسازی شد و سیستم به موازنه خام صفر درصد کارخانه بازگشت.');
        window.location.reload();
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-right" dir="rtl">
      
      {/* Brand Profile Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase">
          <Store className="w-5 h-5 text-emerald-600" />
          تنظیمات هویت تجاری و مونوگرام دکان / مارکت
        </h3>

        {/* Custom logo select panel */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 font-extrabold overflow-hidden shrink-0 shadow-xs">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Shop Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <Store className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1 text-center sm:text-right space-y-1.5 w-full">
            <span className="block text-[11px] font-extrabold text-slate-700">مونوگرام و لوگوی چاپی فاکتورهای دکان:</span>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              <input 
                type="file"
                id="shop-logo-file-picker"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setLogoPreview(reader.result);
                        localStorage.setItem('AFG_STORE_LOGO', reader.result);
                        alert('لوگوی جدید با موفقیت بارگذاری شد و در سربرگ اعمال گردید.');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('shop-logo-file-picker')?.click()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer"
              >
                آپلود لوگوی رسمی فروشگاه 📁
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('آیا مایلید لوگوی شخصی را پاک نموده و لوگوی پیش‌فرض لود شود؟')) {
                      setLogoPreview('');
                      localStorage.removeItem('AFG_STORE_LOGO');
                      alert('لوگو برطرف گردید.');
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer"
                >
                  حذف لوگوی جاری 🗑️
                </button>
              )}
            </div>
            <p className="text-[9.5px] text-slate-400 leading-normal">فرمت‌های تصویری استاندارد متناسب با فاکتورهای چاپی و پرینترهای حرارتی</p>
          </div>
        </div>

        <form onSubmit={handleSaveBrand} className="space-y-4 text-xs text-slate-655">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">نام فروشگاه (برای هدر و اسناد):</label>
              <input 
                type="text" 
                required
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden text-right font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">نمبر تماس عمومی دکان:</label>
              <input 
                type="text" 
                required
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden font-mono text-left text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">نام ولایت / زادگاه تجارتی:</label>
              <input 
                type="text" 
                required
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden text-right text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">آدرس فیزیکی دقیق:</label>
              <input 
                type="text" 
                required
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden text-right text-slate-800"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-805 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            ذخیره و ثبت مشخصات دکان
          </button>
        </form>

        {/* Currency exchanging with lock */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-yellow-500 animate-spin-slow" />
            تغییر و تسعیر نرخ صرافی همکار (Secure exchange rate)
          </h4>
          <p className="text-[9.5px] text-slate-400 leading-normal leading-relaxed">
            تغییر نرخ ارز یک عملیات عمده حاکمیتی است که دیون مطالبات مشتریان، ارزش گدام و صندوق مالی را به شکل زنده تحت تاثیر جدی قرار می‌دهد. برای امنیت سیستم از شما درخواست رمز خواهد شد.
          </p>

          <form onSubmit={handleUpdateExchangeRateSubmit} className="flex gap-2 text-xs">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-[10px] text-slate-400 font-mono font-bold">1 USD =</span>
              <input 
                type="number" 
                value={rateInput} 
                onChange={(e) => setRateInput(e.target.value)}
                step="0.05"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-3 pl-14 text-xs font-mono font-bold text-left focus:outline-hidden text-slate-900"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-bold">افغانی</span>
            </div>
            <button 
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              به‌روزرسانی نرخ
            </button>
          </form>
        </div>
      </div>

      {/* Right Column modules */}
      <div className="space-y-6">
        
        {/* Global Markup pricing formula */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase">
            <Percent className="w-5 h-5 text-emerald-600" />
            فرمول هوشمند بازنویسی کلی قیمت‌های دکان (سراسری)
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
            با این گزینه قیمت خرید کل کالاها به طور سراسری ضرب در حاشیه سود شده و قیمت عمده و پرچون اتومات به دالر و افغانی متوازن می‌گردد. این کار نیاز به تاییدی ادمین دارد.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">مارک‌آپ سود تک‌فروشی (پرچون %):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={markupCostPercent} 
                  onChange={(e) => setMarkupCostPercent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-hidden font-mono text-left pl-6 text-slate-800"
                />
                <span className="absolute left-2.5 top-2 text-[10.5px] text-slate-450">%</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">مارک‌آپ سود عمده‌فروشی (%):</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={wholesaleMarkupPercent} 
                  onChange={(e) => setWholesaleMarkupPercent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-hidden font-mono text-left pl-6 text-slate-800"
                />
                <span className="absolute left-2.5 top-2 text-[10.5px] text-slate-450">%</span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleApplyGlobalMarkupSubmit}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Percent className="w-4 h-4 text-emerald-400" />
            اعمال و بازنویسی قیمت‌های کل گدام
          </button>
        </div>

        {/* Custom Security Gated User Management System */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase">
            <Users className="w-5 h-5 text-indigo-650" />
            ثبت کاربران و تعیین سطوح امنیتی پرسونل (Users Database)
          </h3>

          <p className="text-[10px] text-slate-400 leading-normal leading-relaxed">
            نام کاربری و رمزهای عبور را برای همکاران دفتری یا صندوقداران تعریف کنید تا با هویت مستقل خود لاگین نموده و فاکتور فروش بزنند.
          </p>

          <form onSubmit={handleAddUserSubmit} className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs">
            <span className="block text-[11px] font-black text-slate-700">➕ راجستر حساب کاربری مستقل جدید:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 mb-0.5">نام و تخلص کارمند:</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: سهراب افغان"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-right text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 mb-0.5">نوعیت سطح دسترسی:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-right font-bold"
                >
                  <option value="Admin">👮 مدیر</option>
                  <option value="Salesperson">🛍️ فروشنده</option>
                  <option value="Assistant">🤝 دستیار (سخنگو/همکار)</option>
                  <option value="Staff">👤 کارمند</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 mb-0.5">ایمیل / یوزرنیم لاگین (انگلیسی):</label>
                <input 
                  type="text" 
                  required
                  placeholder="SOHRAB@STC.COM"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-left font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 mb-0.5">رمز ورود اختصاصی (Password):</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: Sohrab$99"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-left font-mono text-xs"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-755 text-white font-extrabold rounded-lg py-1.5 mt-1 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              کدگذاری و ایجاد حساب پرسونل جدید
            </button>
          </form>

          {/* User profiles rendering list */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            <span className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">فهرست دوسیه حساب‌های فعال:</span>
            {usersList.map(u => (
              <div 
                key={u.username}
                className="p-3 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs font-semibold hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 p-1.5 rounded-lg text-[10px] font-extrabold">
                      {u.role === 'Admin' ? '👮 مدیر' : u.role === 'Salesperson' ? '🛍️ فروشنده' : u.role === 'Assistant' ? '🤝 دستیار' : '👤 کارمند'}
                    </span>
                    <span className="font-extrabold text-slate-800">{u.fullName}</span>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 pr-1">
                    <span>یوزرنیم: <strong className="text-slate-600 font-bold">{u.username}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>پسورد:</span>
                      <strong className="text-slate-600 font-bold select-none">
                        {revealedPasswords[u.username] ? u.passwordHash : '••••••••'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                        title="نمایش/پنهان‌سازی رمز"
                      >
                        {revealedPasswords[u.username] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                  </div>
                </div>

                {u.username.toUpperCase() !== 'ADMIN@STC.COM' ? (
                  <button
                    onClick={(e) => handleDeleteUserClick(u.username, u.fullName, e)}
                    className="p-1 px-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-150 rounded-md text-[9.5px] font-bold cursor-pointer"
                    title="حذف دائمی یوزر عبور کارمند"
                  >
                    حذف حساب کاربری 🗑️
                  </button>
                ) : (
                  <span className="text-[9.5px] text-emerald-700 font-black px-2 py-1 bg-emerald-50 rounded">غیر قابل حذف</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Database backups and start from 0 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2.5 uppercase">
            <Database className="w-5 h-5 text-indigo-505" />
            سوابق پشتیبانی و موازنه بازیابی کارخانه
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer border border-slate-200"
            >
              <Download className="w-4 h-4 text-emerald-600 shrink-0" />
              بارگیری کپی دیتابیس (Export)
            </button>

            <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold rounded-xl text-xs cursor-pointer border border-slate-200">
              <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
              بارگذاری کپی دیتابیس (Import)
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border-2 border-rose-100 space-y-2 text-xs">
            <div className="text-rose-900 font-black flex items-center gap-1.5 uppercase text-[11px]">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              پاکسازی زنده و دیسک کردن کل پایگاه مرکزی از صفر (Start from 0)
            </div>
            <p className="text-[9.5px] text-rose-700 leading-normal font-bold">
              با تایید این عملیات، گدام انبار کالاها، مونوگرام پیست شده، فاکتورهای قرض مشتری، مانده صندوق‌های صرافی و حساب کاربری همکاران راه‌اندازی جدید (صفر مطلق) می‌گردد.
            </p>
            <button 
              onClick={handleResetSystemClick}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2.5 px-4 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              حذف دائم اطلاعات و راه‌اندازی صفر موازنه تجاری
            </button>
          </div>
        </div>

      </div>

      {/* Security Gate Verification Modal Popup */}
      <SecurityGateModal 
        isOpen={securityOpen}
        onClose={() => {
          setSecurityOpen(false);
          setSecurityCallback(null);
        }}
        onConfirm={handleConfirmSecurityAuth}
        title={securityTitle}
        description={securityDesc}
      />

    </div>
  );
};
