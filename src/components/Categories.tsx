import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Grid, Plus, Edit, Trash2, Search } from 'lucide-react';
import { SecurityGateModal } from './SecurityGate';

export const Categories: React.FC = () => {
  const { state } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Extract unique categories from products
  const categories = Array.from(new Set(state.products.map(p => p.category)));
  
  const filtered = categories.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت کتگوری‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">دسته‌بندی اصناف کالاهای فروشگاه</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          افزودن دسته‌بندی
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی کتگوری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((cat, idx) => {
          const count = state.products.filter(p => p.category === cat).length;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-[#0B1F3A] transition-colors">
                  <Grid className="w-6 h-6 text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{cat}</h3>
                <p className="text-sm text-slate-500 mt-1">{count} محصول ثبت شده</p>
              </div>
              <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
                <button className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 flex-1 flex justify-center"><Edit className="w-4 h-4" /></button>
                <button className="text-rose-600 bg-rose-50 p-2 rounded-lg hover:bg-rose-100 flex-1 flex justify-center"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500 font-bold">هیچ دسته‌بندی یافت نشد.</div>
        )}
      </div>
    </div>
  );
};
