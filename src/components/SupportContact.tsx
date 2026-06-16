import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Mail, Phone, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const SupportContact: React.FC = () => {
  const { state, addInquiry } = useAppState();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert('لطفاً تمامی فیلدها را به درستی تکمیل نمائید.');
      return;
    }

    setIsSubmitting(true);

    // Simulate database write
    setTimeout(() => {
      const newInquiry = {
        id: `inquiry-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        date: new Date().toISOString(),
        status: 'Pending' as const
      };

      addInquiry(newInquiry);
      setIsSubmitting(false);
      setSuccess(true);
      setName('');
      setPhone('');
      setMessage('');

      // Auto clear success banner
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  const activeInquiries = (state.inquiries || []).filter(inq => inq.phone === phone);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 text-right" dir="rtl" id="support-contact-form">
      <div>
        <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          ارتباط با پشتیبانی و ثبت درخواست تماس
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          سوالات، پیشنهادات و نظرات خود را از این طریق ارسال نمائید تا کارشناسان ما به زودی با شما تماس حاصل فرمایند.
        </p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2.5"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">درخواست شما با موفقیت ثبت گردید!</p>
            <p className="text-emerald-600 mt-0.5">همکاران ما در اسرع وقت با شماره تماس شما ارتباط برقرار خواهند کرد.</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">نام و تخلص شما*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: جلیل احمدی"
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3 transition-all focus:outline-hidden"
              id="support-input-name"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">شماره تماس فعال (واتساپ / مخابرات)*</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 0796626004"
              className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3 transition-all focus:outline-hidden font-mono"
              id="support-input-phone"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-600">شرح درخواست یا پیام شما*</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="لطفاً پیام خود را همراه با جزئیات لازم در این قسمت درج فرمائید..."
            className="w-full text-xs bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3 transition-all focus:outline-hidden resize-none"
            id="support-input-message"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
          id="support-submit-btn"
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          ثبت پیام و ارسال درخواست بررسی
        </button>
      </form>

      {/* State visualizer showing recent submitted inquiries */}
      {state.inquiries && state.inquiries.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">پیام‌های اخیراً ثبت شده در سیستم:</span>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {state.inquiries.length} پیام فعال
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {state.inquiries.map((inq) => (
              <div key={inq.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-start text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {inq.name} ({inq.phone})
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">{inq.message}</p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(inq.date).toLocaleTimeString('fa-AF', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold inline-block mt-1">
                    در انتظار تماس
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
