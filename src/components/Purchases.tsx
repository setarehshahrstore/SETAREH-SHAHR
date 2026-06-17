import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, FileText } from 'lucide-react';

export const Purchases: React.FC = () => {
  const { state } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPurchases = useMemo(() => {
    return state.purchases.filter(p => {
      const pDate = p.date.split('T')[0];
      const matchesDate = pDate >= dateRange.from && pDate <= dateRange.to;
      const matchesSearch = p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [state.purchases, dateRange, searchQuery]);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت خریدها</h1>
          <p className="text-xs text-slate-500 mt-1">لیست فاکتورهای خرید از تامین‌کنندگان</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          ثبت خرید جدید
        </button>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی شماره فاکتور یا نام فروشنده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ خرید</th>
                <th className="px-4 py-4">شماره فاکتور</th>
                <th className="px-4 py-4">نام فروشنده</th>
                <th className="px-4 py-4">مبلغ کل</th>
                <th className="px-4 py-4">پرداخت شده</th>
                <th className="px-4 py-4">باقی حساب</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map(purchase => {
                const balanceAFN = purchase.totalAFN - purchase.paidAFN;
                return (
                  <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(purchase.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{purchase.invoiceNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{purchase.supplierName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{formatCurrency(purchase.totalAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600">{formatCurrency(purchase.paidAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">{formatCurrency(balanceAFN, 'AFN')}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <FileText className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    هیچ معلوماتی در این تاریخ پیدا نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
