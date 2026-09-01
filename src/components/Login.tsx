import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, Building2, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred.user.emailVerified) {
        setError('لطفاً ابتدا ایمیل خود را تایید کنید. (پوشه اسپم را نیز چک کنید)');
        setLoading(false);
        return;
      }
      
      const roleDoc = await getDoc(doc(db, 'userRoles', userCred.user.uid));
      if (roleDoc.exists() && roleDoc.data().role !== 'Customer') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('ایمیل یا رمز عبور اشتباه است.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      const roleDoc = await getDoc(doc(db, 'userRoles', userCred.user.uid));
      if (!roleDoc.exists()) {
        await setDoc(doc(db, 'userRoles', userCred.user.uid), {
          role: userCred.user.email === 'setarehshahrstore@gmail.com' ? 'Owner' : 'Customer',
          fullName: userCred.user.displayName || 'کاربر گوگل',
          email: userCred.user.email
        });
        navigate('/');
      } else {
        if (roleDoc.data().role !== 'Customer') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('ورود با گوگل با مشکل مواجه شد.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-[#0B1F3A] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#D4AF37] rounded-full blur-[80px] opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-[#D4AF37] mb-4 overflow-hidden p-1">
                <Building2 className="w-8 h-8 text-[#0B1F3A]" />
              </div>
              <h2 className="text-2xl font-black text-white">ورود به سیستم</h2>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ایمیل</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="example@gmail.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="رمز عبور..."
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-bold mt-1">
                <Link to="/forgot-password" className="text-slate-500 hover:text-[#D4AF37] transition-colors">فراموشی رمز؟</Link>
                <Link to="/register" className="text-slate-500 hover:text-[#0B1F3A] transition-colors">ثبت‌نام جدید</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8942E] disabled:bg-slate-300 text-white py-3.5 rounded-xl text-sm font-black transition-all shadow-lg hover:shadow-[#D4AF37]/40 hover:-translate-y-0.5"
              >
                <ShieldCheck className="w-5 h-5" />
                {loading ? 'در حال بررسی...' : 'ورود'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <span className="w-full border-t border-slate-200"></span>
              <span className="bg-white px-3 text-xs text-slate-400 font-bold">یا</span>
              <span className="w-full border-t border-slate-200"></span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-[#D4AF37] hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl text-sm font-bold transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              ورود با حساب گوگل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
