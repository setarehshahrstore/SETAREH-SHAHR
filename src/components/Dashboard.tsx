import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency, convertCurrency } from '../utils';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  Users, 
  Layers, 
  Activity, 
  MapPin, 
  Percent,
  RefreshCw 
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { state, updateExchangeRate } = useAppState();
  const [currencyView, setCurrencyView] = useState<'USD' | 'AFN'>('AFN');
  const [rateInput, setRateInput] = useState<string>(state.exchangeRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);

  // Helper to convert dynamic values based on currencyView selection
  const showAmount = (usdValue: number, afnValue: number) => {
    if (currencyView === 'USD') {
      return formatCurrency(usdValue, 'USD');
    } else {
      return formatCurrency(afnValue, 'AFN');
    }
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateExchangeRate(parsed);
      setIsEditingRate(false);
    }
  };

  // 1. Calculate aggregated financial metrics
  const totalSalesUSD = state.sales.reduce((sum, s) => sum + s.finalUSD, 0);
  const totalSalesAFN = state.sales.reduce((sum, s) => sum + s.finalAFN, 0);

  const totalCostUSD = state.sales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => {
      const prod = state.products.find(p => p.id === item.productId);
      const costPerBase = prod ? prod.costPriceUSD : 0;
      return itemSum + (item.quantity * item.multiplier * costPerBase);
    }, 0);
  }, 0);
  
  const totalCostAFN = totalCostUSD * state.exchangeRate;

  const totalProfitUSD = totalSalesUSD - totalCostUSD;
  const totalProfitAFN = totalSalesAFN - totalCostAFN;

  // 2. Outstanding customer debts (Receivables)
  const totalReceivablesUSD = state.customers.reduce((sum, c) => sum + c.debtUSD, 0);
  const totalReceivablesAFN = state.customers.reduce((sum, c) => sum + c.debtAFN, 0);

  // 3. Outstanding supplier debts (Payables)
  const totalPayablesUSD = state.suppliers.reduce((sum, s) => sum + s.debtUSD, 0);
  const totalPayablesAFN = state.suppliers.reduce((sum, s) => sum + s.debtAFN, 0);

  // 4. Low stock checker
  const lowStockItems = state.products.filter(p => p.stockInBaseUnits <= p.minStockInBaseUnits);

  // 5. Recent operations merged list (Sales, Purchases, Payments)
  const recentActivities = [
    ...state.sales.map(s => ({
      type: 'فروش',
      id: s.id,
      title: `قالب فروش (${s.invoiceNo})`,
      detail: `${s.customerName} - ${s.items.length} قلم کالا`,
      usd: s.finalUSD,
      afn: s.finalAFN,
      date: s.date,
      positive: true,
    })),
    ...state.purchases.map(p => ({
      type: 'خرید برای گدام',
      id: p.id,
      title: `خرید کالا (${p.invoiceNo})`,
      detail: `${p.supplierName} - ${p.items.length} قلم کالا`,
      usd: -p.totalUSD,
      afn: -p.totalAFN,
      date: p.date,
      positive: false,
    })),
    ...state.payments.map(pmt => ({
      type: 'سند مالی',
      id: pmt.id,
      title: pmt.partnerType === 'Customer' ? `وصول طلب مشتری` : `پرداخت بدهی طلبکار`,
      detail: `${pmt.partnerName} (${pmt.notes || 'بدون یادداشت'})`,
      usd: pmt.partnerType === 'Customer' ? pmt.amountUSD : -pmt.amountUSD,
      afn: pmt.partnerType === 'Customer' ? pmt.amountAFN : -pmt.amountAFN,
      date: pmt.date,
      positive: pmt.partnerType === 'Customer',
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // 6. Province delivery tracker summaries
  const pendingDeliveriesCount = state.sales.filter(s => s.deliveryStatus === 'Pending' || s.deliveryStatus === 'In Transit').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-850 tracking-tight" id="dashboard-title">
            فرشگاه ستاره شهر (مدیریت ERP)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ردیابی همزمان سود و سرمایه به افغانی و دالر، پیکیجینگ چندگانه واحدها و نظارت مستقیم بر حسابات گدام.
          </p>
        </div>

        {/* Currency & Exchange controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dashboard currency toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setCurrencyView('AFN')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                currencyView === 'AFN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-850'
              }`}
            >
              افغانی (؋)
            </button>
            <button
              onClick={() => setCurrencyView('USD')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all ${
                currencyView === 'USD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-850'
              }`}
            >
              دالر ($)
            </button>
          </div>

          {/* Exchange rate quick display / editor */}
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            {isEditingRate ? (
              <form onSubmit={handleUpdateRate} className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">۱ دالر =</span>
                <input
                  type="number"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-16 px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                  step="0.05"
                  autoFocus
                />
                <button type="submit" className="text-emerald-600 text-xs font-bold px-1.5">ذخیره</button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">نرخ روز:</span>
                <span className="text-xs font-bold text-slate-800">۱ دالر = {state.exchangeRate} افغانی</span>
                <button
                  onClick={() => {
                    setRateInput(state.exchangeRate.toString());
                    setIsEditingRate(true);
                  }}
                  className="text-xs text-emerald-600 hover:underline font-bold"
                >
                  ویرایش
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">کل فروشات (ناخالص)</span>
            <div className="text-2xl font-black text-slate-800">
              {showAmount(totalSalesUSD, totalSalesAFN)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>فروش عمده و پرچون مجموعی</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Estimated Gross Profit */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">سود ناخالص تخمینی</span>
            <div className="text-2xl font-black text-emerald-750">
              {showAmount(totalProfitUSD, totalProfitAFN)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-semibold">
              حاشیه سود: {totalSalesUSD ? ((totalProfitUSD / totalSalesUSD) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Customer Receivables (Outstanding Debt) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">کل طلبات از مشتریان</span>
            <div className="text-2xl font-black text-rose-600">
              {showAmount(totalReceivablesUSD, totalReceivablesAFN)}
            </div>
            <div className="text-[10px] text-rose-600 mt-1 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">
              {state.customers.filter(c => c.debtUSD > 0 || c.debtAFN > 0).length} حساب بدهکار فعال
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Supplier Payables */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-start justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">کل بدهی ما به تامین‌کننده‌ها</span>
            <div className="text-2xl font-black text-amber-600">
              {showAmount(totalPayablesUSD, totalPayablesAFN)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-semibold">
              <span>دفتر حساب‌های پرداختنی</span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Layers className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Middle Section: Cache register details and Exchange details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Drawer Status Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            موجودی فعلی در گاوصندوق نقدی
          </h3>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">نقدینه صندوق افغانی:</span>
              <span className="text-base font-bold text-slate-800">
                {formatCurrency(state.cashRegister.balanceAFN, 'AFN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">نقدینه صندوق دالر:</span>
              <span className="text-base font-bold text-slate-800">
                {formatCurrency(state.cashRegister.balanceUSD, 'USD')}
              </span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="text-xs text-emerald-800">مجموع ارزش معادل کل:</span>
              <span className="text-sm">
                {currencyView === 'AFN' 
                  ? formatCurrency(state.cashRegister.balanceAFN + (state.cashRegister.balanceUSD * state.exchangeRate), 'AFN')
                  : formatCurrency(state.cashRegister.balanceUSD + (state.cashRegister.balanceAFN / state.exchangeRate), 'USD')
                }
              </span>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-red-50/65 rounded-lg border border-red-150">
              <span className="block text-xs font-bold text-red-800">رو به اتمام (گدام)</span>
              <span className="text-lg font-black text-red-905">{lowStockItems.length} قلم</span>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-105">
              <span className="block text-xs font-bold text-amber-800">ترانسپورت‌های معلق</span>
              <span className="text-lg font-black text-amber-900">{pendingDeliveriesCount} انتقال</span>
            </div>
          </div>
        </div>

        {/* Dynamic Sales Trend Graph (Custom SVG visualizer) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-slate-500 animate-pulse" />
              روند فروشات روزانه (به وقت کابل)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">نمودار ۵ روز گذشته</span>
          </div>

          <div className="relative pt-4 h-48 flex items-end justify-between gap-2 px-2">
            {/* Horizontal Gridlines */}
            <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-100"></div>
            <div className="absolute inset-x-0 top-18 border-b border-dashed border-slate-100"></div>
            <div className="absolute inset-x-0 top-32 border-b border-dashed border-slate-100"></div>

            {/* Custom Interactive Bars */}
            {[
              { day: 'چهارشنبه', amountUSD: 240, amountAFN: 17400, label: '۲۱ جوزا' },
              { day: 'پنجشنبه', amountUSD: 512, amountAFN: 37120, label: '۲۲ جوزا' },
              { day: 'جمعه', amountUSD: 120, amountAFN: 8700, label: '۲۳ جوزا' },
              { day: 'شنبه', amountUSD: 1420, amountAFN: 102950, label: '۲۴ جوزا' },
              { day: 'امروز', amountUSD: totalSalesUSD, amountAFN: totalSalesAFN, label: 'امروز' },
            ].map((trend, idx) => {
              const activeVal = currencyView === 'USD' ? trend.amountUSD : trend.amountAFN;
              
              // Max calculation
              const maxVal = currencyView === 'USD' ? 6000 : 435000;
              const pct = Math.min(100, Math.max(10, (activeVal / maxVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative z-10">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-md transition-opacity pointer-events-none whitespace-nowrap shadow-md z-30">
                    <span className="block font-semibold text-center">{trend.label}</span>
                    <span className="block font-bold text-emerald-400 text-center">{showAmount(trend.amountUSD, trend.amountAFN)}</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 group-hover:bg-slate-200 rounded-t-md transition-colors relative flex items-end overflow-hidden" style={{ height: `${pct}%` }}>
                    <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 h-full origin-bottom rounded-t-md"></div>
                  </div>

                  {/* X Axis Label */}
                  <span className="text-xs font-semibold text-slate-500 mt-2 text-center">{trend.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            <span>واحد ارز نمودار: {currencyView === 'AFN' ? 'افغانی' : 'دالر امریکایی'} (محاسبه آنی از فاکتورها)</span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
              فروشات ناخالص
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Transactions columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Watchlist */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4.5 h-4.5 animate-bounce" />
              کالاهای رو به اتمام گدام ({lowStockItems.length})
            </h3>
            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">بسیار فوری</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-76 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                ✨ موجودی گدام کاملاً آماده و با ظرفیت است.
              </div>
            ) : (
              lowStockItems.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                      <p className="text-[11px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded inline-block mt-1">
                        باقی‌مانده: {p.stockInBaseUnits} {p.baseUnit}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block font-semibold">حداقل موجودی: {p.minStockInBaseUnits} {p.baseUnit}</span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block bg-emerald-50 px-2 py-0.5 rounded-xs">
                      آماده سفارش خرید
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Ledger History */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-slate-500" />
              آرشیو دفترچه عملیات تجارتی اخیر
            </h3>
            <span className="text-xs text-slate-400 font-semibold">بروزرسانی زنده</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-76 overflow-y-auto">
            {recentActivities.map((act, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-2 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      act.type.includes('فروش') ? 'bg-emerald-50 text-emerald-700' :
                      act.type.includes('خرید') ? 'bg-amber-50 text-amber-700' :
                      'bg-sky-50 text-sky-700'
                    }`}>
                      {act.type}
                    </span>
                    <h4 className="text-xs font-bold text-slate-700">{act.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">{act.detail}</p>
                </div>
                
                <div className="text-left shrink-0">
                  <span className={`text-xs font-black block ${act.positive ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {act.positive ? '+' : ''}{showAmount(act.usd, act.afn)}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(act.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
