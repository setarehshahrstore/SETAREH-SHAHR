import React, { useState } from 'react';
import { formatCurrency } from '../utils';
import { Receipt, Plus, Search, Calendar } from 'lucide-react';

export const Expenses: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy expenses
  const expenses = [
    { id: 'EXP-01', date: '1402/10/12', category: 'کرایه دکان', amountUSD: 500, amountAFN: 35000, desc: 'کرایه ماه جدی' },
    { id: 'EXP-02', date: '1402/10/14', category: 'برق', amountUSD: 50, amountAFN: 3500, desc: 'بل برق برج قوس' }
  ];

  const filtered = expenses.filter(e => e.category.includes(searchQuery) || e.desc.includes(searchQuery));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مصارف</h1>
          <p className="text-xs text-slate-500 mt-1">ثبت هزینه‌های روزمره، کرایه، معاشات و بل‌ها</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          ثبت مصرف جدید
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی مصرف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ</th>
                <th className="px-4 py-4">دسته‌بندی مصرف</th>
                <th className="px-4 py-4">توضیحات</th>
                <th className="px-4 py-4">مبلغ (دالر)</th>
                <th className="px-4 py-4">مبلغ (افغانی)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400"/> {e.date}</td>
                  <td className="px-4 py-3 font-bold text-[#0B1F3A]"><span className="bg-slate-100 px-2 py-1 rounded-lg">{e.category}</span></td>
                  <td className="px-4 py-3 text-slate-600">{e.desc}</td>
                  <td className="px-4 py-3 font-bold font-mono text-rose-600">{formatCurrency(e.amountUSD, 'USD')}</td>
                  <td className="px-4 py-3 font-bold font-mono text-rose-600">{formatCurrency(e.amountAFN, 'AFN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
