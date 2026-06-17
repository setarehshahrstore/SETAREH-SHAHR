import React from 'react';
import { BarChart, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">گزارشات و آمار</h1>
          <p className="text-xs text-slate-500 mt-1">بررسی وضعیت سود، زیان، و عملکرد فروشگاه</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold">
            <option>امروز</option>
            <option>این هفته</option>
            <option>این ماه</option>
            <option>امسال</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold">کل فروش</p>
              <h3 className="text-2xl font-black text-[#0B1F3A] mt-2 font-mono">245,000 ؋</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded">+12% رشد نسبت به قبل</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold">سود خالص</p>
              <h3 className="text-2xl font-black text-[#0B1F3A] mt-2 font-mono">45,200 ؋</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded">+8% رشد نسبت به قبل</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold">تعداد فاکتورها</p>
              <h3 className="text-2xl font-black text-[#0B1F3A] mt-2 font-mono">124 فاکتور</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 font-bold bg-slate-50 w-fit px-2 py-1 rounded flex items-center gap-1">
            <Calendar className="w-3 h-3" /> در این بازه زمانی
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col items-center justify-center text-slate-400">
        <BarChart className="w-16 h-16 mb-4 opacity-20" />
        <p className="font-bold">نمودار پیشرفته در حال بارگذاری اطلاعات...</p>
      </div>
    </div>
  );
};
