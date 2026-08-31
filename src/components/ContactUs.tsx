import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle, 
  MessageSquare, Sparkles, Truck, ShieldCheck, Store
} from 'lucide-react';
import { useAppState } from '../AppContext';
import { motion } from 'motion/react';

export const ContactUs: React.FC = () => {
  const { addInquiry } = useAppState();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: 'سفارش عمده / استعلام قیمت',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addInquiry({
        id: `inquiry-${Date.now()}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: `[${formData.subject}]\n${formData.message.trim()}`,
        date: new Date().toISOString(),
        status: 'Pending'
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        subject: 'سفارش عمده / استعلام قیمت',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      
      {/* Header Banner */}
      <section className="relative bg-gradient-to-b from-[#0B1F3A] via-[#0E284D] to-[#0B1F3A] text-white py-16 md:py-24 overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-amber-400/30 rounded-full text-xs font-bold text-amber-300 mb-4">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>پشتیبانی همه‌روزه و مستقیم</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            تماس با <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#F5D76E] via-[#D4AF37] to-amber-200">ستاره شهر</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            جهت استعلام قیمت روز، سفارش عمده، ثبت نمایندگی و یا هرگونه پرسش، از راه‌های ارتباطی زیر با ما در تماس باشید.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-6 text-right">
            <div>
              <h2 className="text-2xl font-black text-[#0B1F3A] mb-2">اطلاعات تماس و نشانی</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                همکاران ما در بخش مدیریت، انبارداری و ارسال، آماده خدمت‌رسانی به هموطنان گرامی هستند.
              </p>
            </div>

            <div className="space-y-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">شماره تلفن و واتساپ</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-1.5">پاسخگویی سریع جهت سفارشات عمده و پرچون</p>
                  <a href="tel:+93796626004" className="text-base font-black font-mono text-emerald-700 hover:text-emerald-800" dir="ltr">
                    +93 796 626 004
                  </a>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">نشانی گدام و فروشگاه مرکزی</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    افغانستان، ولایت بلخ، شهر مزار شریف، مرکز تجاری شهر، انبار مرکزی ستاره شهر
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ساعات کاری</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    شنبه تا پنج‌شنبه: ۸:۰۰ صبح الی ۸:۰۰ شب
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    (پذیرش سفارشات آنلاین و واتساپ به‌صورت ۲۴ ساعته)
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ایمیل ارتباطی</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-1">مکاتبات رسمی و قراردادها</p>
                  <a href="mailto:setarehshahrhelp@mail.com" className="text-xs font-mono text-indigo-600 hover:underline">
                    setarehshahrhelp@mail.com
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] text-amber-300 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0B1F3A]">ارسال پیام آنلاین</h3>
                <p className="text-xs text-slate-500">پیام شما مستقیماً در پنل مدیریت دریافت و بررسی می‌شود.</p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center text-emerald-800 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-slate-900">پیام شما با موفقیت دریافت شد!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  از تماس شما سپاسگزاریم. مسوول مربوطه در اسرع وقت با شما هماهنگ خواهد شد.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  ارسال پیام دیگر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      نام و نام خانوادگی / نام دکان <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="نام شما یا فروشگاه..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      شماره تماس (واتساپ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      dir="ltr"
                      placeholder="07XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-right focus:border-amber-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">موضوع درخواست</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="سفارش عمده / استعلام قیمت">سفارش عمده / استعلام قیمت کالا</option>
                    <option value="پیگیری سفارش قبلی">پیگیری سفارش قبلی</option>
                    <option value="همکاری و تأمین کالا">پیشنهاد تأمین کالا و همکاری تجاری</option>
                    <option value="پیشنهاد و انتقاد">پیشنهاد، انتقاد یا شکایت</option>
                    <option value="سایر موضوعات">سایر موارد</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    متن پیام شما <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="شرح درخواست، لیست اقلام یا سوال خود را اینجا بنویسید..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0B1F3A] hover:bg-[#15345d] text-amber-300 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ثبت و ارسال پیام</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
};
