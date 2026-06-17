import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Customer } from '../types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { state, addCustomer } = useAppState();

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    city: 'کابل',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    // Check if username or phone already exists
    const existingCustomer = state.customers.find(
      c => c.username?.toLowerCase() === formData.username.toLowerCase() || c.phone === formData.phone
    );

    if (existingCustomer) {
      setError('یک حساب با این نام کاربری یا شماره تماس از قبل وجود دارد.');
      return;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: formData.name,
      lastName: formData.lastName,
      username: formData.username,
      passwordHash: formData.password, // In a real app, hash this!
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      address: formData.address,
      debtAFN: 0,
      debtUSD: 0,
      creditLimitUSD: 0
    };

    addCustomer(newCustomer);
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">حساب شما با موفقیت ساخته شد!</h2>
          <p className="text-slate-500 mb-6">در حال انتقال به صفحه ورود...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 bg-[#0B1F3A] text-white relative">
          <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold">
            <ArrowRight className="w-4 h-4" /> بازگشت
          </Link>
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h2 className="text-xl font-black">ثبت‌نام مشتری جدید</h2>
              <p className="text-xs text-slate-400 mt-1">ساخت حساب کاربری در ستاره شهر</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-bold border border-rose-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">نام <span className="text-rose-500">*</span></label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">نام خانوادگی <span className="text-rose-500">*</span></label>
              <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">نام کاربری (Username) <span className="text-rose-500">*</span></label>
              <input required type="text" dir="ltr" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right" placeholder="مثال: ali123" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">شماره تماس <span className="text-rose-500">*</span></label>
              <input required type="tel" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right font-mono" placeholder="07XXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ایمیل (اختیاری)</label>
            <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">آدرس دقیق منزل/مغازه <span className="text-rose-500">*</span></label>
            <textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">رمز عبور <span className="text-rose-500">*</span></label>
              <input required type="password" dir="ltr" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">تکرار رمز عبور <span className="text-rose-500">*</span></label>
              <input required type="password" dir="ltr" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl mt-8">
            ساخت حساب کاربری
          </button>
        </form>
      </div>
    </div>
  );
};
