import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { SecurityGateModal } from './SecurityGate';
import { Permissions, ROLE_CONFIGS } from '../utils/permissions';
import { 
  Store, 
  Coins, 
  Percent, 
  Users, 
  Database, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Check, 
  Image as ImageIcon,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Calculator,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { ExchangeRateDisplay } from './ExchangeRateDisplay';
import { AppUser } from '../types';

type TabType = 'store' | 'pricing' | 'users' | 'backup';

export const Settings: React.FC = () => {
  // @ts-ignore
  const { state, updateExchangeRate, resetState, editProduct, updateStoreConfig, updateUsers } = useAppState();
  const { user } = useAuth();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabType>('store');

  // Store Brand Settings & Monogram Custom Logo
  const [storeName, setStoreName] = useState(state.storeConfig?.storeName || 'فروشگاه ستاره شهر');
  const [phone, setPhone] = useState(state.storeConfig?.phone || '0799445566');
  const [city, setCity] = useState(state.storeConfig?.city || 'کابل');
  const [address, setAddress] = useState(state.storeConfig?.address || 'چهارراهی پشتونستان، مرکز تجارتی ستاره');
  const [logoPreview, setLogoPreview] = useState(state.storeConfig?.logoBase64 || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when loaded from firebase
  React.useEffect(() => {
    if (state.storeConfig) {
      setStoreName(state.storeConfig.storeName || 'فروشگاه ستاره شهر');
      setPhone(state.storeConfig.phone || '0799445566');
      setCity(state.storeConfig.city || 'کابل');
      setAddress(state.storeConfig.address || 'چهارراهی پشتونستان، مرکز تجارتی ستاره');
      setLogoPreview(state.storeConfig.logoBase64 || '');
    }
  }, [state.storeConfig]);

  // Exchange rate setting
  const [rateInput, setRateInput] = useState(state.exchangeRate.toString());
  const [rateUpdatedSuccess, setRateUpdatedSuccess] = useState(false);

  // Global Margin Markup
  const [markupCostPercent, setMarkupCostPercent] = useState('25');
  const [wholesaleMarkupPercent, setWholesaleMarkupPercent] = useState('15');
  const [markupAppliedSuccess, setMarkupAppliedSuccess] = useState(false);

  // Security Gate parameters
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityTitle, setSecurityTitle] = useState('');
  const [securityDesc, setSecurityDesc] = useState('');
  const [securityCallback, setSecurityCallback] = useState<(() => void) | null>(null);

  // Users Database & Inputs
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const usersList = state.users && state.users.length > 0 ? state.users : [
    {
      username: 'ADMIN@STC.COM',
      passwordHash: 'Admin$',
      fullName: 'مدیر کل سیستم (ادمین)',
      role: 'Owner'
    } as AppUser
  ];

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Owner' | 'Manager' | 'Cashier' | 'Warehouse Staff'>('Cashier');

  // Active Cashier Shift Tracker (Deprecating local storage list since we have users)
  const cashierList = usersList.map(u => u.fullName);

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
    updateStoreConfig({
      storeName,
      phone,
      city,
      address,
      logoBase64: logoPreview
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const handleUpdateExchangeRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert('لطفاً نرخ ارز معتبر برای هر دالر به افغانی وارد کنید.');
      return;
    }

    triggerSecureAction(
      "تغییر نرخ تسعیر اسعار (دالر به افغانی)",
      `آیا مایل هستید نرخ تبادل هر دالر را از ${state.exchangeRate} به ${parsed} افغانی تغییر دهید؟ تمام محاسبات صندوق و فاکتورها متوازن خواهد شد.`,
      () => {
        updateExchangeRate(parsed);
        setRateUpdatedSuccess(true);
        setTimeout(() => setRateUpdatedSuccess(false), 3000);
      }
    );
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim().toUpperCase();
    const pass = newPassword.trim();
    const fname = newFullName.trim();

    if (!uname || !pass || !fname) {
      alert('لطفاً تمامی گزینه‌های فرم را تکمیل فرمایید.');
      return;
    }

    if (usersList.some(u => u.username.toUpperCase() === uname)) {
      alert('این نام کاربری / ایمیل قبلاً در سیستم ثبت شده است.');
      return;
    }

    const newUser: AppUser = {
      username: uname,
      passwordHash: pass,
      fullName: fname,
      role: newUserRole as any,
      employeeCode: `STS${1000 + usersList.length + 1}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'Active',
      baseSalaryAFN: 0,
      payments: [],
      timeRecords: []
    };

    const roleLabels: Record<string, string> = {
      Owner: 'مالک / مدیر کل',
      Manager: 'مدیر داخلی',
      Cashier: 'صندوق‌دار',
      'Warehouse Staff': 'مسئول گدام'
    };

    triggerSecureAction(
      "ایجاد حساب کاربری جدید",
      `آیا تایید می‌فرمایید که کاربر [${fname}] با نقش [${roleLabels[newUserRole]}] ایجاد گردد؟`,
      () => {
        const updated = [...usersList, newUser];
        updateUsers(updated);

        setNewUsername('');
        setNewPassword('');
        setNewFullName('');
        setShowAddUserModal(false);
      }
    );
  };

  const handleDeleteUserClick = (usernameToDelete: string, fullNameToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (usernameToDelete.toUpperCase() === 'ADMIN@STC.COM') {
      alert('اکانت سوپر ادمین اصلی سیستم غیرقابل حذف است.');
      return;
    }

    triggerSecureAction(
      "حذف حساب کاربری",
      `آیا مطمئن هستید که می‌خواهید دسترسی [ ${fullNameToDelete} ] را به طور کامل از سیستم حذف کنید؟`,
      () => {
        const updated = usersList.filter(u => u.username !== usernameToDelete);
        updateUsers(updated);

        const curUserRaw = localStorage.getItem('AFG_CURRENT_USER');
        if (curUserRaw) {
          try {
            const parsed = JSON.parse(curUserRaw);
            if (parsed.username === usernameToDelete) {
              localStorage.removeItem('AFG_CURRENT_USER');
              window.location.reload();
              return;
            }
          } catch(err) {}
        }
      }
    );
  };

  const handleApplyGlobalMarkupSubmit = () => {
    const costPercent = parseFloat(markupCostPercent);
    const wholesalePercent = parseFloat(wholesaleMarkupPercent);

    if (isNaN(costPercent) || isNaN(wholesalePercent)) {
      alert('لطفاً درصدهای سود را به درستی وارد کنید.');
      return;
    }

    triggerSecureAction(
      "اعمال سراسری قیمت‌گذاری خودکار کالاها",
      `آیا مایل هستید قیمت تمام کالاها بر اساس قیمت خرید محاسبه شود؟ (پرچون: +${costPercent}٪ | عمده: +${wholesalePercent}٪)`,
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
        setMarkupAppliedSuccess(true);
        setTimeout(() => setMarkupAppliedSuccess(false), 3500);
      }
    );
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SETAREH_SHAHR_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.products && parsed.customers && parsed.cashRegister) {
            localStorage.setItem('AFG_ERP_STATE', JSON.stringify(parsed));
            alert('فایل پشتیبان با موفقیت بازیابی شد. صفحه مجدداً بارگذاری می‌شود.');
            window.location.reload();
          } else {
            alert('قالب فایل پشتیبان نامعتبر است.');
          }
        } catch (err) {
          alert('خطا در خواندن فایل پشتیبان!');
        }
      };
    }
  };

  const handleResetSystemClick = () => {
    triggerSecureAction(
      "پاکسازی کلی و شروع مجدد از صفر",
      "هشدار بسیار مهم! تمامی اجناس انبار، فاکتورهای فروش، حساب مشتریان، طلب‌ها، هزینه‌ها و تنظیمات پاک شده و برنامه به حالت خام اولیه بازمی‌گردد.",
      () => {
        resetState();
        localStorage.clear();
        alert('سیستم با موفقیت به حالت اولیه کارخانه بازگردانده شد.');
        window.location.reload();
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-right pb-12 font-sans" dir="rtl">
      
      {/* Header & Quick Summary Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>مرکز کنترل و تنظیمات مدیریتی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
              تنظیمات جامع فروشگاه
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              مدیریت هویت سازمانی، نرخ روزانه ارز، فرمول قیمت‌گذاری، دسترسی پرسونل و پشتیبان‌گیری
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-black">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">نرخ تبادل فعال</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">1 USD = {state.exchangeRate} AFN</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-black">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">پرسونل فعال</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">{usersList.length} کاربر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-[#0B1F3A] text-amber-300 shadow-md ring-2 ring-amber-400/20'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Store className="w-4 h-4" />
            مشخصات و برند فروشگاه
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#0B1F3A] text-amber-300 shadow-md ring-2 ring-amber-400/20'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Coins className="w-4 h-4" />
            نرخ ارز و فرمول قیمت‌گذاری
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#0B1F3A] text-amber-300 shadow-md ring-2 ring-amber-400/20'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            کاربران و سطوح دسترسی
            {user?.role !== 'Owner' && (
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">محدود</span>
            )}
            {user?.role === 'Owner' && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full mr-1">
                {usersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-[#0B1F3A] text-amber-300 shadow-md ring-2 ring-amber-400/20'
                : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Database className="w-4 h-4" />
            پشتیبان‌گیری و نگهداری داده‌ها
          </button>
        </div>
      </div>

      {/* --- TAB CONTENT 1: STORE IDENTITY & BRAND --- */}
      {activeTab === 'store' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">هویت سازمانی و سربرگ فاکتورها</h2>
              <p className="text-xs text-slate-500">اطلاعات وارد شده در سربرگ فاکتورهای چاپی، رسیدها و صفحه نخست فروشگاه درج می‌شود</p>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative group">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Shop Logo" 
                  className="w-full h-full object-contain p-1" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold">بدون لوگو</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-right">
              <h3 className="text-sm font-black text-slate-800">مونوگرام و لوگوی رسمی فروشگاه</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                تصویر آپلود شده به صورت خودکار بر روی فاکتورهای حرارتی A4 و رسیدهای چاپی مشتریان قرار می‌گیرد. (فرمت‌های PNG یا JPG)
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
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
                          updateStoreConfig({ storeName, phone, city, address, logoBase64: reader.result });
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
                  className="bg-[#0B1F3A] hover:bg-[#15345d] text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  بارگذاری تصویر لوگو
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('آیا می‌خواهید لوگوی بارگذاری شده حذف شود؟')) {
                        setLogoPreview('');
                        updateStoreConfig({ storeName, phone, city, address, logoBase64: '' });
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف لوگو
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Store Details Form */}
          <form onSubmit={handleSaveBrand} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  نام رسمی فروشگاه / مارکت
                </label>
                <input 
                  type="text" 
                  required
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: فروشگاه عمده و پرچون ستاره شهر"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  شماره‌های تماس عمومی
                </label>
                <input 
                  type="text" 
                  required
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0799445566 / 0788112233"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 font-mono text-left focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  ولایت / شهر اصلی
                </label>
                <input 
                  type="text" 
                  required
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: کابل / مزار شریف"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  آدرس دقیق دکان / انبار مرکزی
                </label>
                <input 
                  type="text" 
                  required
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: چهارراهی پشتونستان، مرکز تجارتی ستاره، منزل اول"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                type="submit"
                className="bg-gradient-to-l from-[#0B1F3A] to-[#15345d] text-amber-300 hover:text-white px-8 py-3.5 rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg active:scale-98"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    تنظیمات با موفقیت ذخیره شد!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    ذخیره تغییرات مشخصات فروشگاه
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* --- TAB CONTENT 2: EXCHANGE RATE & PRICING RULES --- */}
      {activeTab === 'pricing' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Live Google Exchange Rate with Buy (-0.50) and Sell (+0.50) */}
          <ExchangeRateDisplay variant="full" />

          {/* Smart Pricing Margin Calculator */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">فرمول هوشمند حاشیه سود کالاها</h2>
                  <p className="text-xs text-slate-500">محاسبه سراسری قیمت فروش عمده و پرچون از روی قیمت خرید</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                با تعیین درصدهای سود زیر، قیمت تمام محصولات موجود در گدام بر اساس فرمول (قیمت خرید + درصد سود) به طور اتوماتیک بازنویسی می‌گردد:
              </p>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">سود تک‌فروشی (پرچون):</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={markupCostPercent} 
                      onChange={(e) => setMarkupCostPercent(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-left pl-7 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-hidden"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">٪</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">سود عمده‌فروشی (کارتن):</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={wholesaleMarkupPercent} 
                      onChange={(e) => setWholesaleMarkupPercent(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-left pl-7 text-sm font-bold text-slate-900 focus:border-indigo-500 outline-hidden"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">٪</span>
                  </div>
                </div>
              </div>

              {/* Real-time formula preview */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 space-y-1.5 text-xs text-indigo-950 mb-5">
                <div className="flex items-center gap-1.5 font-black text-indigo-900">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  <span>نمونه محاسبه برای کالای ۱۰ دالری:</span>
                </div>
                <div className="flex justify-between text-[11px] text-indigo-800">
                  <span>نرخ پرچون: <strong>${(10 * (1 + parseFloat(markupCostPercent || '0')/100)).toFixed(2)}</strong> ({formatCurrency(10 * (1 + parseFloat(markupCostPercent || '0')/100) * state.exchangeRate, 'AFN')})</span>
                  <span>نرخ عمده: <strong>${(10 * (1 + parseFloat(wholesaleMarkupPercent || '0')/100)).toFixed(2)}</strong> ({formatCurrency(10 * (1 + parseFloat(wholesaleMarkupPercent || '0')/100) * state.exchangeRate, 'AFN')})</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleApplyGlobalMarkupSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                محاسبه و بازنویسی قیمت‌های کل گدام
              </button>

              {markupAppliedSuccess && (
                <p className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> تمام قیمت‌های گدام با فرمول جدید به‌روزرسانی شدند.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* --- TAB CONTENT 3: TEAM & ACCESS CONTROL --- */}
      {activeTab === 'users' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
        >
          {user?.role !== 'Owner' ? (
            <div className="p-8 text-center bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-amber-950">دسترسی محرمانه سیستم (محدود به مالک)</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
                مدیریت پرسونل، تغییر نقش‌ها و رمزهای عبور کاربران صرفاً در حیطه اختیارات <strong>مالک فروشگاه (Owner)</strong> می‌باشد. شما به عنوان <strong>{user?.role ? ROLE_CONFIGS[user.role]?.titleFa : 'مدیر'}</strong> امکان مشاهده و ویرایش کاربران را ندارید.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">مدیریت پرسونل و حساب‌های کاربری</h2>
                    <p className="text-xs text-slate-500">تعریف رمز ورود و نقش‌های دسترسی برای صندوقداران و مدیران</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(!showAddUserModal)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  {showAddUserModal ? 'بستن فرم' : 'افزودن کاربر جدید'}
                </button>
              </div>

              {/* Expandable Add User Form */}
              <AnimatePresence>
                {showAddUserModal && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddUserSubmit}
                    className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 overflow-hidden"
                  >
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      مشخصات کاربر و کارمند جدید:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">نام و تخلص:</label>
                        <input 
                          type="text" 
                          required
                          placeholder="مثال: سهراب افغان"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">سطح دسترسی و نقش:</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-hidden"
                        >
                          <option value="Owner">👑 مالک / مدیر کل</option>
                          <option value="Manager">👮 مدیر داخلی</option>
                          <option value="Cashier">💵 صندوق‌دار</option>
                          <option value="Warehouse Staff">📦 مسئول گدام</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">ایمیل یا یوزرنیم لاگین:</label>
                        <input 
                          type="text" 
                          required
                          placeholder="SOHRAB@STC.COM"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 outline-hidden text-left"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">رمز ورود (Password):</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Sohrab$99"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 outline-hidden text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        ثبت و ذخیره کاربر
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* User List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {usersList.map(u => {
                  const isOwner = u.role === 'Owner';
                  const isManager = u.role === 'Manager';
                  const isCashier = u.role === 'Cashier';
                  const isWarehouse = u.role === 'Warehouse Staff';

                  const roleLabel = isOwner ? 'مالک / مدیر کل' : isManager ? 'مدیر داخلی' : isCashier ? 'صندوق‌دار' : 'مسئول گدام';
                  const roleBadgeColor = isOwner ? 'bg-amber-100 text-amber-800 border-amber-200' : isManager ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : isCashier ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200';

                  return (
                    <div 
                      key={u.username}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-sm border border-slate-200">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{u.fullName}</h4>
                            <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md border mt-1 ${roleBadgeColor}`}>
                              {roleLabel}
                            </span>
                          </div>
                        </div>

                        {u.username.toUpperCase() !== 'ADMIN@STC.COM' ? (
                          <button
                            onClick={(e) => handleDeleteUserClick(u.username, u.fullName, e)}
                            className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"
                            title="حذف کاربر"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            ادمین اصلی
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs font-mono" dir="ltr">
                        <span className="text-slate-600 font-bold">{u.username}</span>
                        
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span>{revealedPasswords[u.username] ? u.passwordHash : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="نمایش / پنهان کردن رمز"
                          >
                            {revealedPasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* --- TAB CONTENT 4: BACKUP & SYSTEM RESET --- */}
      {activeTab === 'backup' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Backup & Restore Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">پشتیبان‌گیری از اطلاعات (Backup)</h2>
                <p className="text-xs text-slate-500">دانلود و بازیابی فایل کامل دیتابیس، فاکتورها و انبار</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              توصیه می‌شود به صورت هفتگی از دیتابیس فروشگاه نسخه پشتیبان دانلود کرده و روی فلش یا کامپیوتر خود نگهداری فرمایید.
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <Download className="w-4 h-4" />
                دانلود فایل پشتیبان کامل دیتابیس (Export JSON)
              </button>

              <label className="w-full flex items-center justify-center gap-2 p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs transition-all cursor-pointer border border-slate-200 active:scale-98">
                <Upload className="w-4 h-4 text-indigo-600" />
                بازیابی اطلاعات از فایل پشتیبان قبلی (Import JSON)
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Danger Zone: Factory Reset */}
          <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border-2 border-rose-200/80 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-rose-200/60 pb-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-rose-950">منطقه حساس: راه‌اندازی مجدد از صفر</h2>
                  <p className="text-xs text-rose-700 font-bold">پاکسازی کامل داده‌ها و بازگشت به موازنه اولیه</p>
                </div>
              </div>

              <p className="text-xs text-rose-800 leading-relaxed">
                با اجرای این عملیات، تمامی محصولات گدام، فاکتورهای فروش، حساب و قرض مشتریان، سوابق صندوق صرافی و کاربران برای همیشه پاکسازی می‌گردد.
              </p>
            </div>

            {user?.role === 'Owner' ? (
              <button 
                onClick={handleResetSystemClick}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                حذف دائمی تمام اطلاعات و ریست به حالت صفر کارخانه
              </button>
            ) : (
              <div className="bg-rose-100/70 border border-rose-200 rounded-2xl p-3 text-center text-xs font-bold text-rose-800">
                این عملیات حساس صرفاً با ورود مستقیم حساب کاربری مالک (Owner) امکان‌پذیر است.
              </div>
            )}
          </div>
        </motion.div>
      )}

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
