import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, Tag } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { state } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    // Return empty array if state.expenses is not yet initialized in context
    const expenses = state.expenses || [];
    return expenses.filter(e => {
      const eDate = e.date.split('T')[0];
      const matchesDate = eDate >= dateRange.from && eDate <= dateRange.to;
      const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [state.expenses, dateRange, searchQuery]);

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مصارف</h1>
          <p className="text-xs text-slate-500 mt-1">ثبت و پیگیری مصارف روزانه فروشگاه</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#123B66] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          ثبت مصرف جدید
        </button>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center gap-4">
        <div className="relative max-w-md w-full flex-1">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در توضیحات یا دسته‌بندی..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-left bg-rose-50 border border-rose-100 text-rose-800 px-4 py-2 rounded-xl">
          <p className="text-xs font-bold opacity-80 mb-0.5">مجموع مصارف در این بازه:</p>
          <p className="text-lg font-black font-mono">{formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amountAFN, 0), 'AFN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ</th>
                <th className="px-4 py-4">دسته‌بندی</th>
                <th className="px-4 py-4">توضیحات</th>
                <th className="px-4 py-4">مبلغ مصرف (افغانی)</th>
                <th className="px-4 py-4">مبلغ مصرف (دالر)</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(expense.date).toLocaleDateString('fa-IR')}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-1.5 mt-1"><Tag className="w-3.5 h-3.5 text-slate-400" /> {expense.category}</td>
                  <td className="px-4 py-3 text-slate-600">{expense.description}</td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-600">{formatCurrency(expense.amountAFN, 'AFN')}</td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-600">${expense.amountUSD.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold">ویرایش</button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    هیچ مصرفی در این بازه ثبت نشده است
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
