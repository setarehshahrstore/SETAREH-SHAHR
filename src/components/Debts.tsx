import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { Wallet, Search, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

export const Debts: React.FC = () => {
  const { state } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');

  const customers = state.customers.filter(c => c.debtUSD > 0 || c.debtAFN > 0);
  const suppliers = state.suppliers.filter(s => s.debtUSD > 0 || s.debtAFN > 0);

  const allDebts = [
    ...customers.map(c => ({ id: c.id, name: c.name, type: 'Customer', debtUSD: c.debtUSD, debtAFN: c.debtAFN })),
    ...suppliers.map(s => ({ id: s.id, name: s.name, type: 'Supplier', debtUSD: s.debtUSD, debtAFN: s.debtAFN }))
  ];

  const filtered = allDebts.filter(d => d.name.includes(searchQuery));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">قرض‌ها و طلبات</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت حساب‌های دریافتنی (مشتریان) و پرداختنی (شرکت‌ها)</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <CreditCard className="w-5 h-5" />
          ثبت پرداختی جدید
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام شخص یا شرکت..."
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
                <th className="px-4 py-4 rounded-tr-2xl">نام طرف حساب</th>
                <th className="px-4 py-4">نوع حساب</th>
                <th className="px-4 py-4">مبلغ (دالر)</th>
                <th className="px-4 py-4">مبلغ (افغانی)</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">هیچ حساب قرضی یافت نشد.</td>
                </tr>
              ) : (
                filtered.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{d.name}</td>
                    <td className="px-4 py-3">
                      {d.type === 'Customer' ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><ArrowDownRight className="w-3 h-3"/> مشتری (طلب ما)</span>
                      ) : (
                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><ArrowUpRight className="w-3 h-3"/> شرکت (بدهی ما)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold font-mono">{formatCurrency(d.debtUSD, 'USD')}</td>
                    <td className="px-4 py-3 font-bold font-mono">{formatCurrency(d.debtAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-bold text-xs flex items-center gap-1">
                          <Wallet className="w-4 h-4" /> تصفیه حساب
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
