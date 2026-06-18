import React, { useState } from 'react';
import { Shield, KeyRound, X } from 'lucide-react';

interface AdminPasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const AdminPasswordPrompt: React.FC<AdminPasswordPromptProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = 'تأیید امنیتی ادمین',
  description = 'برای انجام این عملیات حساس، لطفاً رمز عبور ادمین را وارد کنید.'
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Admin$') {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('رمز عبور وارد شده اشتباه است.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-black">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors relative z-10">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
            {description}
          </p>
          
          <div className="mb-6 relative">
            <label className="block text-xs font-bold text-slate-700 mb-2">رمز عبور ادمین</label>
            <div className="relative">
              <KeyRound className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`w-full pr-12 pl-4 py-3 bg-slate-50 border rounded-xl text-left font-mono transition-colors focus:outline-none ${
                  error ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
                dir="ltr"
                autoFocus
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            {error && (
              <p className="text-xs text-rose-500 mt-2 font-bold animate-in slide-in-from-top-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              لغو
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-[#D4AF37] text-[#0B1F3A] py-3.5 rounded-xl font-black hover:bg-[#F2D06B] transition-colors shadow-md"
            >
              تأیید و ادامه
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
