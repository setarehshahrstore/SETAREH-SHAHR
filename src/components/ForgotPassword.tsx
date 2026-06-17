import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { KeyRound, ArrowRight, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { state, editCustomer } = useAppState();

  const [usernameOrPhone, setUsernameOrPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const searchStr = usernameOrPhone.trim().toLowerCase();
    
    // Find customer by username or phone
    const customer = state.customers.find(
      c => c.username?.toLowerCase() === searchStr || c.phone === searchStr
    );

    if (customer) {
      // Mark as requested
      editCustomer({ ...customer, passwordResetRequested: true });
      setSuccess(true);
    } else {
      // For security, it's better to show success anyway, but we'll show an error here for simplicity
      setError('حسابی با این مشخصات یافت نشد.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">درخواست با موفقیت ثبت شد!</h2>
          <p className="text-slate-500 mb-6">درخواست بازیابی رمز عبور شما برای مدیریت فروشگاه ارسال گردید. به زودی همکاران ما با شما تماس گرفته و رمز عبور جدید را در اختیارتان قرار می‌دهند.</p>
          <Link to="/login" className="inline-block bg-[#0B1F3A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#123B66]">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 bg-[#0B1F3A] text-white relative">
          <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold">
            <ArrowRight className="w-4 h-4" /> بازگشت
          </Link>
          <div className="flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h2 className="text-xl font-black">فراموشی رمز عبور</h2>
              <p className="text-xs text-slate-400 mt-1">بازیابی حساب کاربری</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            شماره موبایل یا نام کاربری خود را وارد کنید. سیستم مدیریت را از درخواست شما آگاه می‌کند و رمز جدید برای شما صادر خواهد شد.
          </p>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-bold border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">نام کاربری یا شماره تماس <span className="text-rose-500">*</span></label>
            <input 
              required 
              type="text" 
              dir="ltr" 
              value={usernameOrPhone} 
              onChange={e => setUsernameOrPhone(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-right font-mono" 
              placeholder="07XXXXXXXX یا username" 
            />
          </div>

          <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl mt-8">
            ثبت درخواست بازیابی
          </button>
        </form>
      </div>
    </div>
  );
};
