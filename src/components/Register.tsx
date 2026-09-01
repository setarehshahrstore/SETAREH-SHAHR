import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User as UserIcon } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('رمز عبور و تایید آن مطابقت ندارند.');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCred.user, { displayName: name });
      await sendEmailVerification(userCred.user);
      
      await setDoc(doc(db, 'userRoles', userCred.user.uid), {
        role: userCred.user.email === 'setarehshahrstore@gmail.com' ? 'Owner' : 'Customer',
        fullName: name,
        email: email
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.');
      } else {
        setError('خطا در ثبت نام. لطفاً دوباره تلاش کنید.');
      }
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
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('ورود با گوگل با مشکل مواجه شد.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <h2 className="text-2xl font-black text-emerald-600 mb-4">ثبت‌نام موفق!</h2>
          <p className="text-slate-600 mb-6">ایمیل تایید به آدرس شما ارسال شد. لطفاً صندوق پستی خود (و پوشه اسپم) را بررسی کرده و روی لینک تایید کلیک کنید.</p>
          <Link to="/login" className="inline-block bg-[#0B1F3A] hover:bg-[#152e52] transition-colors text-white px-6 py-3 rounded-xl font-bold">رفتن به صفحه ورود</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8">
        <h2 className="text-2xl font-black text-[#0B1F3A] mb-6 text-center">ثبت‌نام مشتری جدید</h2>
        
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">نام کامل</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="نام و نام خانوادگی" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ایمیل</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="example@gmail.com" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="حداقل ۶ کاراکتر" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">تکرار رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]" placeholder="تکرار رمز..." dir="ltr" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#0B1F3A] hover:bg-[#152e52] disabled:bg-slate-300 text-white py-3.5 rounded-xl text-sm font-black transition-all shadow-lg mt-2">
            {loading ? 'در حال ثبت نام...' : 'ایجاد حساب کاربری'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center">
          <span className="w-full border-t border-slate-200"></span>
          <span className="bg-white px-3 text-xs text-slate-400 font-bold">یا</span>
          <span className="w-full border-t border-slate-200"></span>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-[#D4AF37] hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl text-sm font-bold transition-all">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          ثبت‌نام با حساب گوگل
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            قبلاً ثبت نام کرده‌اید؟ <Link to="/login" className="text-[#0B1F3A] font-bold hover:underline">وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
