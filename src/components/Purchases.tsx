import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { Truck, Plus, Search, Calendar, FileText } from 'lucide-react';

export const Purchases: React.FC = () => {
  const { state } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');

  const purchases = state.purchases || [];
  const filtered = purchases.filter(p => p.invoiceNo.includes(searchQuery) || p.supplierName.includes(searchQuery));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت خریدها</h1>
          <p className="text-xs text-slate-500 mt-1">فاکتورهای خرید از شرکت‌ها و تامین‌کنندگان</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          ثبت فاکتور خرید جدید
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی شماره فاکتور یا نام شرکت..."
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
                <th className="px-4 py-4 rounded-tr-2xl">شماره فاکتور</th>
                <th className="px-4 py-4">تاریخ</th>
                <th className="px-4 py-4">نام شرکت / توزیع‌کننده</th>
                <th className="px-4 py-4">مبلغ کل (دالر)</th>
                <th className="px-4 py-4">مبلغ کل (افغانی)</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">هیچ فاکتور خریدی یافت نشد.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.invoiceNo}</td>
                    <td className="px-4 py-3 text-slate-600 flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400"/> {p.date}</td>
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{p.supplierName}</td>
                    <td className="px-4 py-3 font-bold text-[#2E7D5B]">{formatCurrency(p.totalUSD, 'USD')}</td>
                    <td className="px-4 py-3 font-bold text-[#2E7D5B]">{formatCurrency(p.totalAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="مشاهده فاکتور">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
