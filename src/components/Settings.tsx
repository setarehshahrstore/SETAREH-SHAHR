import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [storeName, setStoreName] = useState(localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر');
  const [currency, setCurrency] = useState('AFN');

  const handleSave = () => {
    localStorage.setItem('AFG_STORE_NAME', storeName);
    alert('تنظیمات با موفقیت ذخیره شد.');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">تنظیمات سیستم</h1>
          <p className="text-xs text-slate-500 mt-1">پیکربندی اطلاعات پایه فروشگاه</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">نام فروشگاه (نمایش در فاکتورها)</label>
            <input 
              type="text" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#D4AF37]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">واحد پولی پیش‌فرض</label>
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:border-[#D4AF37]"
            >
              <option value="AFN">افغانی (AFN)</option>
              <option value="USD">دالر آمریکا (USD)</option>
            </select>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#123B66] mt-4">
            <Save className="w-5 h-5" /> ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};
