import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../types';

export const Categories: React.FC = () => {
  const { state } = useAppState();
  
  // Note: Since Categories was added to AppState recently, we need to handle potential undefined
  const categories = state.categories || [
    { id: '1', name: 'خواربار و مواد غذایی', description: 'انواع برنج، روغن، حبوبات و...' },
    { id: '2', name: 'نوشیدنی‌ها', description: 'آب معدنی، نوشابه، آبمیوه' },
    { id: '3', name: 'مواد شوینده و بهداشتی', description: 'پودر لباسشویی، صابون، شامپو' },
    { id: '4', name: 'لبنیات', description: 'شیر، ماست، پنیر' },
  ];

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">دسته‌بندی محصولات</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت گروه‌ها و کتگوری‌های کالا</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          افزودن دسته‌بندی جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{cat.name}</h3>
            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{cat.description || 'بدون توضیحات'}</p>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
              <button className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 py-2 rounded-xl transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> ویرایش
              </button>
              <button className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
