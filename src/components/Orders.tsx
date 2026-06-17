import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { ClipboardList, Search, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

export const Orders: React.FC = () => {
  const { state } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy orders for now, will connect to real state later if order state exists
  const orders = [
    { id: 'ORD-001', customer: 'احمد محمود', date: '1402/10/12', amountAFN: 4500, status: 'Pending' },
    { id: 'ORD-002', customer: 'فروشگاه برادران', date: '1402/10/12', amountAFN: 12000, status: 'Delivered' }
  ];

  const filtered = orders.filter(o => o.id.includes(searchQuery) || o.customer.includes(searchQuery));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">سفارشات آنلاین</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت سفارشاتی که مشتریان از سایت ثبت کرده‌اند</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی شماره سفارش یا نام مشتری..."
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
                <th className="px-4 py-4 rounded-tr-2xl">شماره سفارش</th>
                <th className="px-4 py-4">مشتری</th>
                <th className="px-4 py-4">تاریخ ثبت</th>
                <th className="px-4 py-4">مبلغ کل</th>
                <th className="px-4 py-4">وضعیت</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">سفارشی یافت نشد.</td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{o.id}</td>
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{o.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{o.date}</td>
                    <td className="px-4 py-3 font-bold text-[#2E7D5B]">{formatCurrency(o.amountAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      {o.status === 'Pending' ? (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3"/> در انتظار</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> تکمیل شده</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="مشاهده جزئیات">
                          <Eye className="w-4 h-4" />
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
