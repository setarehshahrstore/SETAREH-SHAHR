import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, Tag, X, Trash2, Edit2 } from 'lucide-react';

export const Expenses: React.FC = () => {
  const { state, addExpense, deleteExpense } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'کرایه دوکان',
    description: '',
    amount: '',
    currency: 'AFN'
  });

  const filteredExpenses = useMemo(() => {
    const expenses = state.expenses || [];
    return expenses.filter(e => {
      const eDate = e.date.split('T')[0];
      const matchesDate = eDate >= dateRange.from && eDate <= dateRange.to;
      const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.expenses, dateRange, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;

    const amount = parseFloat(expenseForm.amount);
    
    addExpense({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: expenseForm.category,
      description: expenseForm.description,
      amount: amount,
      currency: expenseForm.currency,
      amountAFN: expenseForm.currency === 'AFN' ? amount : 0,
      amountUSD: expenseForm.currency === 'USD' ? amount : 0
    });

    setIsModalOpen(false);
    setExpenseForm({
      category: 'کرایه دوکان',
      description: '',
      amount: '',
      currency: 'AFN'
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('آیا از حذف این مصرف اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مصارف</h1>
          <p className="text-xs text-slate-500 mt-1">ثبت و پیگیری مصارف روزانه فروشگاه</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#123B66] transition-all shadow-md"
        >
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
        <div className="text-left bg-rose-50 border border-rose-100 text-rose-800 px-4 py-2 rounded-xl flex gap-6">
          <div>
            <p className="text-xs font-bold opacity-80 mb-0.5">مجموع مصارف افغانی:</p>
            <p className="text-lg font-black font-mono">{formatCurrency(filteredExpenses.reduce((sum, e) => sum + (e.amountAFN || 0), 0), 'AFN')}</p>
          </div>
          <div>
            <p className="text-xs font-bold opacity-80 mb-0.5">مجموع مصارف دالر:</p>
            <p className="text-lg font-black font-mono">${filteredExpenses.reduce((sum, e) => sum + (e.amountUSD || 0), 0).toFixed(2)}</p>
          </div>
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
                  <td className="px-4 py-3 font-mono font-bold text-rose-600">{expense.amountAFN > 0 ? formatCurrency(expense.amountAFN, 'AFN') : '-'}</td>
                  <td className="px-4 py-3 font-mono font-bold text-rose-600">{expense.amountUSD > 0 ? `$${expense.amountUSD.toFixed(2)}` : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(expense.id)} className="text-rose-500 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">ثبت مصرف جدید</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">دسته‌بندی مصرف</label>
                  <select 
                    value={expenseForm.category} 
                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="کرایه دوکان">کرایه دوکان</option>
                    <option value="برق و آب">برق و آب</option>
                    <option value="معاش پرسنل">معاش پرسنل</option>
                    <option value="غذا و چای">غذا و چای</option>
                    <option value="ترانسپورت">ترانسپورت / کرایه بار</option>
                    <option value="متفرقه">متفرقه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ارز (Currency)</label>
                  <select 
                    value={expenseForm.currency} 
                    onChange={e => setExpenseForm({...expenseForm, currency: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="AFN">افغانی</option>
                    <option value="USD">دالر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ مصرف <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  step="any" 
                  dir="ltr" 
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right font-mono text-xl" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">شرح مصرف (توضیحات) <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={expenseForm.description} 
                  onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                  placeholder="مثال: کرایه باربری مزار، بل برق ماه جوزا..." 
                />
              </div>

              <button type="submit" className="w-full bg-[#0B1F3A] text-white hover:bg-[#123B66] py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4">
                ثبت و کسر از صندوق
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
