import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Building2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { username: string; fullName: string; role: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر';
  const logoBase64 = localStorage.getItem('AFG_STORE_LOGO');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toUpperCase();
    const trimmedPass = password.trim();

    // Load registered users from local storage
    let usersList = [
      {
        username: 'ADMIN@STC.COM',
        passwordHash: 'Admin$',
        fullName: 'مدیر کل سیستم (ادمین)',
        role: 'Admin'
      }
    ];

    const savedUsers = localStorage.getItem('AFG_STORE_USERS');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          usersList = parsed;
        }
      } catch (err) {
        console.error("Failed to parse system users list", err);
      }
    } else {
      // Set default on first load
      localStorage.setItem('AFG_STORE_USERS', JSON.stringify(usersList));
    }

    // Match credentials
    const foundUser = usersList.find(
      u => u.username.toUpperCase() === trimmedUser && u.passwordHash === trimmedPass
    );

    if (foundUser) {
      const sessionUser = {
        username: foundUser.username,
        fullName: foundUser.fullName,
        role: foundUser.role
      };
      localStorage.setItem('AFG_CURRENT_USER', JSON.stringify(sessionUser));
      // Set active cashier automatically
      localStorage.setItem('AFG_STORE_CASHIER', foundUser.fullName);
      onLoginSuccess(sessionUser);
      alert(`خوش آمدید، ${foundUser.fullName}! ورود شما به پنل با موفقیت تایید گردید.`);
    } else {
      setError('ایمیل آدرس یا رمز عبور اشتباه است! لطفاً مجدداً بررسی کنید.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50" dir="rtl">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center bg-radial from-emerald-600 to-emerald-400 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-500/10">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="w-8 h-8 rounded object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <Building2 className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{storeName}</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">پنل امنیت مرکزی و احراز هویت دکان</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs text-slate-650">
          <div>
            <label className="block text-[10px] text-slate-450 font-bold mb-1.5 uppercase">ایمیل آدرس یا نام کاربری:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ایمیل یا نام کاربری را وارد کنید..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 font-semibold focus:outline-hidden text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-450 font-bold mb-1.5 uppercase">رمز عبور امنیتی:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-left focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11.5px] leading-relaxed text-rose-600 font-bold flex gap-2 items-center text-right">
              <AlertCircle className="w-4 h-4 text-rose-550 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl py-3 text-xs transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-1.5 uppercase"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ورود به سیستم و دوسیه‌ها
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-50">
          <p className="text-[10px] text-slate-404 font-medium leading-normal">
            تمامی جزییات فاکتورهای فروش و دیون جاری گدام در حافظه محلی مرورگر شما به صورت رمزنگاری همگام‌سازی می‌گردد.
          </p>
        </div>

      </div>
    </div>
  );
};
