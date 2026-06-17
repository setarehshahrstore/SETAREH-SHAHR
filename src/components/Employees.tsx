import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Mail, Phone, MapPin, Plus } from 'lucide-react';

interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'Admin' | 'Salesperson' | 'Assistant' | 'Staff';
  phone?: string;
  status?: 'Active' | 'Inactive';
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<AppUser[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployees(parsed);
        }
      } catch (err) {
        console.error("Failed to parse local users", err);
      }
    } else {
      setEmployees([
        {
          username: 'ADMIN@STC.COM',
          passwordHash: 'Admin$',
          fullName: 'مدیر کل سیستم (ادمین)',
          role: 'Admin',
          status: 'Active'
        }
      ]);
    }
  }, []);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت کارمندان</h1>
          <p className="text-xs text-slate-500 mt-1">مشاهده پرسنل، حساب‌های کاربری و دسترسی‌ها</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          افزودن کارمند جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute top-0 right-0 w-2 h-full ${emp.role === 'Admin' ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`}></div>
            
            <div className="flex items-start justify-between mb-4 pl-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${emp.role === 'Admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-indigo-50 text-indigo-600'}`}>
                  {emp.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{emp.fullName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className={`w-3.5 h-3.5 ${emp.role === 'Admin' ? 'text-[#D4AF37]' : 'text-indigo-400'}`} />
                    <span className="text-xs font-bold text-slate-500">{emp.role === 'Admin' ? 'مدیر سیستم' : 'فروشنده / کارمند'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-xs" dir="ltr">{emp.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-xs">{emp.phone || 'ثبت نشده'}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors">ویرایش مشخصات</button>
              <button className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors">غیرفعال‌سازی</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
