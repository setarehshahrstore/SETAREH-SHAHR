import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, Building2 } from 'lucide-react';
import { useAuth, UserRole } from '../AuthContext';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر';
  const logoBase64 = localStorage.getItem('AFG_STORE_LOGO');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Load registered users from local storage or use defaults
    let usersList = [
      {
        username: 'admin',
        passwordHash: 'admin',
        fullName: 'مالک فروشگاه',
        role: 'Owner'
      },
      {
        username: 'manager',
        passwordHash: 'manager',
        fullName: 'مدیر کل',
        role: 'Manager'
      },
      {
        username: 'cashier',
        passwordHash: 'cashier',
        fullName: 'صندوق‌دار',
        role: 'Cashier'
      },
      {
        username: 'warehouse',
        passwordHash: 'warehouse',
        fullName: 'مسئول گدام',
        role: 'Warehouse Staff'
      },
      {
        username: 'customer',
        passwordHash: 'customer',
        fullName: 'مشتری تست',
        role: 'Customer'
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
    }

    const foundUser = usersList.find(
      u => u.username.toLowerCase() === trimmedUser && u.passwordHash === trimmedPass
    );

    if (foundUser) {
      login(foundUser.fullName, foundUser.role as UserRole);
      
      // Navigate based on role
      if (foundUser.role === 'Customer') {
        navigate('/account', { replace: true });
      } else if (foundUser.role === 'Cashier') {
        navigate('/admin/sales', { replace: true });
      } else if (foundUser.role === 'Warehouse Staff') {
        navigate('/admin/inventory', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } else {
      setError('ایمیل یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-[#0B1F3A] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37] rounded-full blur-[80px] opacity-20"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#D4AF37] mb-4 overflow-hidden p-1">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-8 h-8 text-[#0B1F3A]" />
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{storeName}</h2>
              <p className="text-[#D4AF37] text-sm mt-1 font-medium">ورود به سیستم</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نام کاربری / ایمیل</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="admin"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="رمز عبور..."
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8942E] text-white py-3.5 rounded-xl text-sm font-black transition-all shadow-lg hover:shadow-[#D4AF37]/40 hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-5 h-5" />
                {isLogin ? 'ورود امن' : 'ثبت نام مشتری'}
              </button>

            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
              {isLogin ? (
                <p className="text-sm text-slate-600">
                  حساب کاربری ندارید؟ <button type="button" onClick={() => setIsLogin(false)} className="text-[#D4AF37] font-bold hover:underline">ثبت نام کنید</button>
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  قبلاً ثبت نام کرده‌اید؟ <button type="button" onClick={() => setIsLogin(true)} className="text-[#0B1F3A] font-bold hover:underline">وارد شوید</button>
                </p>
              )}
              
              <p className="text-xs text-slate-500 font-mono" dir="ltr">
                AFG ERP System v2.0 &copy; 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
