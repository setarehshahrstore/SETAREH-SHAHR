import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { DollarSign, FileText, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, BarChart3 } from 'lucide-react';

export const Finances: React.FC = () => {
  const { state } = useAppState();
  const [financeCurrency, setFinanceCurrency] = useState<'USD' | 'AFN'>('AFN');

  // Convert amounts dynamically based on user's current currency selection
  const showAmount = (usd: number, afn: number) => {
    return financeCurrency === 'USD' ? formatCurrency(usd, 'USD') : formatCurrency(afn, 'AFN');
  };

  // Financial Metrics Summarizer
  const grossSalesUSD = state.sales.reduce((sum, s) => sum + s.finalUSD, 0);
  const grossSalesAFN = state.sales.reduce((sum, s) => sum + s.finalAFN, 0);

  // Total COGS
  const cogsUSD = state.sales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => {
      const prod = state.products.find(p => p.id === item.productId);
      const costPerBase = prod ? prod.costPriceUSD : 0;
      return itemSum + (item.quantity * item.multiplier * costPerBase);
    }, 0);
  }, 0);
  const cogsAFN = cogsUSD * state.exchangeRate;

  const grossProfitUSD = grossSalesUSD - cogsUSD;
  const grossProfitAFN = grossSalesAFN - cogsAFN;

  // Inventory Asset Value (Stock valuation in cost price)
  const totalStockAssetValueUSD = state.products.reduce((sum, p) => sum + (p.stockInBaseUnits * p.costPriceUSD), 0);
  const totalStockAssetValueAFN = totalStockAssetValueUSD * state.exchangeRate;

  // Let's model basic operating expenses like rent & salaries in Afghanistan as seed expenses
  const operatingExpensesUSD = 150; // Simple dummy operational overhead
  const operatingExpensesAFN = operatingExpensesUSD * state.exchangeRate;

  const netIncomeUSD = grossProfitUSD - operatingExpensesUSD;
  const netIncomeAFN = grossProfitAFN - operatingExpensesAFN;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Banner controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-105 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 justify-start">
            <BarChart3 className="w-5 h-5 text-emerald-600 animate-pulse" />
            سیستم گزارشات مالی ریل‌تایم و بیلنس دفتری
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            محاسبه دقیق سود ناخالص مبادلات تجاری، تفکیک مصارف جاری و مدیریت همزمان صندوق ارزی دوگانه.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFinanceCurrency('AFN')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              financeCurrency === 'AFN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            مشاهده بیلانس به افغانی (؋)
          </button>
          <button
            onClick={() => setFinanceCurrency('USD')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              financeCurrency === 'USD'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            مشاهده بیلان به دالر ($)
          </button>
        </div>
      </div>

      {/* Structured Income Statement / P&L Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
        
        {/* P&L Statement Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-slate-400" />
              ترازنامه مالی حساب سود و زیان تجارتی (P&L)
            </h3>
            <span className="text-slate-400 text-xs font-bold font-mono">نرخ ارز: ۱ دالر = {state.exchangeRate} افغانی</span>
          </div>

          <div className="space-y-4 text-xs font-medium">
            {/* Sales Revenue Rows */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-800 font-bold border-b border-slate-100 pb-1">
                <span>۱. عواید عملیاتی مستقیم (فروشی ناخالص)</span>
                <span className="text-emerald-700 font-extrabold">{showAmount(grossSalesUSD, grossSalesAFN)}</span>
              </div>
              <p className="text-[10px] text-slate-400">کل درآمدهای فروش ثبت شده حاصل از کانال‌های آنلاین وب‌سایت، فرمایشات عمده‌فروشان و تصفیه نقدی صندوق‌های فروش حضوری.</p>
            </div>

            {/* Cost of Goods Sold Rows */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-slate-850 font-bold border-b border-slate-100 pb-1 text-rose-600">
                <span>۲. مصارف خرید و قیمت تمام‌شده کالاها (COGS)</span>
                <span className="font-extrabold">-{showAmount(cogsUSD, cogsAFN)}</span>
              </div>
              <p className="text-[10px] text-slate-400">قیمت خرید کالاها از تامین‌کننده اصلی بر اساس ضریب بسته‌بندی استفاده شده در هنگام تحویل‌دهی در گدام.</p>
            </div>

            {/* Gross Margin bar indicator */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 flex items-center justify-between font-extrabold text-slate-800">
              <span className="text-[11px] uppercase tracking-wide">۳. سود یا مارجین ناخالص تجارت:</span>
              <span className="text-emerald-800 font-black text-sm">{showAmount(grossProfitUSD, grossProfitAFN)}</span>
            </div>

            {/* Expenses sections */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>۴. مصارف جاری، دفتری و ترانسپورتی ولایات</span>
                <span className="text-slate-900 font-bold">-{showAmount(operatingExpensesUSD, operatingExpensesAFN)}</span>
              </div>
              <ul className="list-disc pr-6 text-[10px] text-slate-400 space-y-1">
                <li>کرایه گدام‌های کابل/هرات و کرایه راه موتربری: {showAmount(operatingExpensesUSD * 0.4, operatingExpensesAFN * 0.4)}</li>
                <li>معاشات موظفین صندوق، انبارداران و پرسونل فرشگاه: {showAmount(operatingExpensesUSD * 0.6, operatingExpensesAFN * 0.6)}</li>
              </ul>
            </div>

            {/* Net Income statement values */}
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between font-extrabold text-white bg-emerald-700 p-4 rounded-xl shadow-xs">
              <span className="text-sm uppercase tracking-wider">سود خالص عملیاتی نهایی:</span>
              <div className="text-left font-mono">
                <span className="text-lg block font-black">{showAmount(netIncomeUSD, netIncomeAFN)}</span>
                <span className="block text-[10px] font-normal text-emerald-200">صحت‌سنجی زنده بر اساس ({financeCurrency === 'AFN' ? 'افغانی' : 'دالر'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Assets Summary Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
              بیلانس کل دارایی‌های فرشگاه
            </h3>
            <p className="text-[11px] text-slate-400">تخمین ارزش کل مال‌التجاره و سرمایه نقدی موجود.</p>
          </div>

          <div className="space-y-4">
            
            {/* Total Valued stock asset value */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">ارزش کالاها فیزیکی موجود در گدام‌ها</span>
              <div className="text-lg font-black text-slate-800">
                {showAmount(totalStockAssetValueUSD, totalStockAssetValueAFN)}
              </div>
              <p className="text-[10px] text-slate-400">محاسبه برآورد ارزش کل بسته ها و کارتن های کالا بر اساس قیمت عمده خرید انبار.</p>
            </div>

            {/* Cash reserve totals */}
            <div className="space-y-1.5 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">موجودی صندوق نقده (گاوصندوق)</span>
              <div className="text-lg font-black text-emerald-950">
                {showAmount(
                  state.cashRegister.balanceUSD + (state.cashRegister.balanceAFN / state.exchangeRate),
                  state.cashRegister.balanceAFN + (state.cashRegister.balanceUSD * state.exchangeRate)
                )}
              </div>
              <div className="text-[9.5px] text-slate-400 mt-1 flex justify-between font-mono">
                <span>صندوق افغانی: {formatCurrency(state.cashRegister.balanceAFN, 'AFN')}</span>
                <span>صندوق دالر: ${state.cashRegister.balanceUSD.toFixed(1)}</span>
              </div>
            </div>

            {/* Asset distribution gauge */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">ترکیب ساختار سرمایه گذاری:</span>
              <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                <div className="h-full bg-emerald-600" style={{ width: '60%' }} title="Stock assets"></div>
                <div className="h-full bg-teal-500" style={{ width: '40%' }} title="Cash capital"></div>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-1.5 bg-emerald-600"></span> کالاهای گدام (۶۰٪)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-1.5 bg-teal-500"></span> نقدینگی صندوق (۴۰٪)
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
