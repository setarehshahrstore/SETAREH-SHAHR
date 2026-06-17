import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign } from 'lucide-react';

export const Finances: React.FC = () => {
  const { state } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPayments = useMemo(() => {
    return state.payments.filter(p => {
      const pDate = p.date.split('T')[0];
      const matchesDate = pDate >= dateRange.from && pDate <= dateRange.to;
      const matchesSearch = p.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [state.payments, dateRange, searchQuery]);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مالی و پرداخت‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت صندوق، دریافت‌ها و پرداخت‌ها</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          ثبت تراکنش جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-l from-[#0B1F3A] to-[#1A3A5F] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm text-slate-300 font-bold mb-1">موجودی صندوق (افغانی)</p>
          <h2 className="text-3xl font-black font-mono tracking-widest">{formatCurrency(state.cashRegister.balanceAFN, 'AFN')}</h2>
          <CreditCard className="absolute left-6 bottom-6 w-12 h-12 text-white/10" />
        </div>
        
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm text-emerald-100 font-bold mb-1">موجودی صندوق (دالر)</p>
          <h2 className="text-3xl font-black font-mono tracking-widest" dir="ltr">${state.cashRegister.balanceUSD.toFixed(2)}</h2>
          <DollarSign className="absolute left-6 bottom-6 w-12 h-12 text-white/10" />
        </div>
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
            placeholder="جستجوی شخص یا شرکت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">تراکنش‌ها در بازه زمانی انتخاب شده</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ</th>
                <th className="px-4 py-4">نوع تراکنش</th>
                <th className="px-4 py-4">شخص/شرکت</th>
                <th className="px-4 py-4">مبلغ (افغانی)</th>
                <th className="px-4 py-4">مبلغ (دالر)</th>
                <th className="px-4 py-4">توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => {
                const isIncoming = payment.partnerType === 'Customer';
                return (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(payment.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3">
                      {isIncoming ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                          <ArrowDownRight className="w-3 h-3" /> دریافت (ورود پول)
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                          <ArrowUpRight className="w-3 h-3" /> پرداخت (خروج پول)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{payment.partnerName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{formatCurrency(payment.amountAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">${payment.amountUSD.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{payment.notes || '-'}</td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    هیچ تراکنشی در این تاریخ پیدا نشد
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
