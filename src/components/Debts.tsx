import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Users, Building2, CreditCard } from 'lucide-react';

export const Debts: React.FC = () => {
  const { state } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [activeTab, setActiveTab] = useState<'Customers' | 'Suppliers'>('Customers');

  // Debts are mostly current state, but we can show payments in the date range
  // related to debts. For now, we will show current debts but also list recent payments.
  
  const customersWithDebt = state.customers.filter(c => c.debtAFN > 0 || c.debtUSD > 0);
  const suppliersWithDebt = state.suppliers.filter(s => s.debtAFN > 0 || s.debtUSD > 0);

  const filteredPayments = state.payments.filter(p => {
    const pDate = p.date.split('T')[0];
    return pDate >= dateRange.from && pDate <= dateRange.to && p.partnerType === (activeTab === 'Customers' ? 'Customer' : 'Supplier');
  });

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت قرضه‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">حسابات دریافتنی (مشتریان) و پرداختنی (تامین‌کنندگان)</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('Customers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Customers' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-4 h-4" /> قرض مشتریان
        </button>
        <button 
          onClick={() => setActiveTab('Suppliers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Suppliers' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 className="w-4 h-4" /> طلب فروشندگان
        </button>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">وضعیت فعلی قرضه‌ها</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-right">
              <thead className="bg-[#0B1F3A] text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">نام</th>
                  <th className="px-4 py-3 font-bold">مبلغ (افغانی)</th>
                  <th className="px-4 py-3 font-bold">مبلغ (دالر)</th>
                  <th className="px-4 py-3 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'Customers' ? customersWithDebt : suppliersWithDebt).map(person => (
                  <tr key={person.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{person.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">{formatCurrency(person.debtAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">${person.debtUSD.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100">
                        <CreditCard className="w-3 h-3" /> ثبت پرداخت
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'Customers' ? customersWithDebt : suppliersWithDebt).length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-bold">هیچ قرضه فعالی وجود ندارد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-emerald-50 text-emerald-800">
            <h3 className="font-bold">تاریخچه پرداخت‌ها (در بازه انتخاب شده)</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-right">
              <thead className="bg-emerald-600 text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">تاریخ</th>
                  <th className="px-4 py-3 font-bold">نام</th>
                  <th className="px-4 py-3 font-bold">مبلغ پرداخت</th>
                  <th className="px-4 py-3 font-bold">توضیحات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{new Date(payment.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{payment.partnerName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                      {payment.amountAFN > 0 ? formatCurrency(payment.amountAFN, 'AFN') : `$${payment.amountUSD.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{payment.notes || '-'}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-bold">هیچ پرداختی در این بازه ثبت نشده است</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
