import React, { useState } from 'react';
import { ShieldAlert, Key, X } from 'lucide-react';

interface SecurityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
}

export const SecurityGateModal: React.FC<SecurityGateModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  const [securityPassword, setSecurityPassword] = useState('');
  const [errorFlag, setErrorFlag] = useState(false);

  if (!isOpen) return null;

  const handleSubmitForce = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFlag(false);

    // Prompt specifies: "باید کلید ادمین را بخواهد PASSWORD: Admin$" 
    // We check if it matches "Admin$" or the user's registered admin password.
    if (securityPassword === 'Admin$') {
      setSecurityPassword('');
      onConfirm();
    } else {
      setErrorFlag(true);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs text-right" dir="rtl">
      <div className="bg-white border-2 border-amber-550 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
        
        {/* Close Button */}
        <button 
          onClick={() => {
            setSecurityPassword('');
            setErrorFlag(false);
            onClose();
          }}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warn Icon & Title */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mt-2">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
            <p className="text-[10px] text-slate-400 font-bold">بخش حاکمیتی و موازنه حساس سیستم</p>
          </div>
        </div>

        {description && (
          <p className="text-[11px] leading-relaxed text-slate-500 font-semibold bg-amber-50/50 p-2.5 rounded-lg border border-amber-150">
            {description}
          </p>
        )}

        {/* Pass Input Form */}
        <form onSubmit={handleSubmitForce} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] text-slate-450 font-extrabold mb-1.5 label-icon">رمز عبور ارشد ادمین (Admin$):</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input 
                type="password" 
                required
                value={securityPassword}
                onChange={(e) => setSecurityPassword(e.target.value)}
                placeholder="رمز عبور ادمین را وارد کنید..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-3 py-1.5 focus:outline-hidden text-left font-mono text-xs text-slate-900"
                autoFocus
              />
            </div>
          </div>

          {errorFlag && (
            <p className="text-[10px] text-rose-650 font-black">❌ رمز عبور وارد شده نامعتبر است! اقدام متوقف شد.</p>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={() => {
                setSecurityPassword('');
                setErrorFlag(false);
                onClose();
              }}
              className="bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-1.5 text-xs font-bold cursor-pointer text-slate-600"
            >
              انصراف دفتری
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-850 text-white rounded-lg px-4 py-1.5 text-xs font-black cursor-pointer"
            >
              تایید صلاحیت
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
