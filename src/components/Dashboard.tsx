import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Receipt,
  RefreshCw,
  PackageX,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { state, updateExchangeRate } = useAppState();
  const [currencyView, setCurrencyView] = useState<'USD' | 'AFN'>('AFN');
  const [rateInput, setRateInput] = useState<string>(state.exchangeRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);

  const showAmount = (usdValue: number, afnValue: number) => {
    return currencyView === 'USD' ? formatCurrency(usdValue, 'USD') : formatCurrency(afnValue, 'AFN');
  };

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateExchangeRate(parsed);
      setIsEditingRate(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const todaySales = state.sales.filter(s => s.date.startsWith(today));
  const monthSales = state.sales.filter(s => s.date.startsWith(thisMonth));

  const totalSalesTodayUSD = todaySales.reduce((sum, s) => sum + (s.finalUSD || 0), 0);
  const totalSalesTodayAFN = todaySales.reduce((sum, s) => sum + (s.finalAFN || 0), 0);
  
  const totalSalesMonthUSD = monthSales.reduce((sum, s) => sum + (s.finalUSD || 0), 0);
  const totalSalesMonthAFN = monthSales.reduce((sum, s) => sum + (s.finalAFN || 0), 0);

  const getCost = (salesList: any[]) => salesList.reduce((sum, s) => {
    if (!s.items || !Array.isArray(s.items)) return sum;
    return sum + s.items.reduce((itemSum: number, item: any) => {
      const prod = state.products.find(p => p.id === item.productId);
      const costPerBase = prod ? (prod.costPriceUSD || 0) : 0;
      return itemSum + ((item.quantity || 0) * (item.multiplier || 1) * costPerBase);
    }, 0);
  }, 0);

  const costTodayUSD = getCost(todaySales);
  const costMonthUSD = getCost(monthSales);

  const profitTodayUSD = totalSalesTodayUSD - costTodayUSD;
  const profitTodayAFN = totalSalesTodayAFN - (costTodayUSD * state.exchangeRate);
  
  const profitMonthUSD = totalSalesMonthUSD - costMonthUSD;
  const profitMonthAFN = totalSalesMonthAFN - (costMonthUSD * state.exchangeRate);

  const customerDebtAFN = state.customers.reduce((sum, c) => sum + c.debtAFN, 0);
  const customerDebtUSD = state.customers.reduce((sum, c) => sum + c.debtUSD, 0);

  const lowStockCount = state.products.filter(p => p.stockInBaseUnits <= p.minStockInBaseUnits).length;
  const newOrdersCount = state.sales.filter(s => s.deliveryStatus === 'Pending').length;

  const todayExpensesAFN = 0; // Coming soon
  const todayExpensesUSD = 0;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top Header & Currency Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">
            داشبورد مدیریت
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            گزارشات زنده و لحظه‌ای سیستم فروشگاه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setCurrencyView('AFN')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                currencyView === 'AFN'
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              افغانی (؋)
            </button>
            <button
              onClick={() => setCurrencyView('USD')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                currencyView === 'USD'
                  ? 'bg-[#0B1F3A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              دالر ($)
            </button>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            {isEditingRate ? (
              <form onSubmit={handleUpdateRate} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold">۱ دالر =</span>
                <input
                  type="number"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-20 px-2 py-1 text-xs font-bold text-center bg-white border border-[#D4AF37] rounded-lg focus:outline-none"
                  step="0.05"
                  autoFocus
                />
                <button type="submit" className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">ذخیره</button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold">نرخ روز:</span>
                <span className="text-xs font-black text-[#0B1F3A]">۱ دالر = {state.exchangeRate} ؋</span>
                <button
                  onClick={() => {
                    setRateInput(state.exchangeRate.toString());
                    setIsEditingRate(true);
                  }}
                  className="text-[10px] text-white bg-[#D4AF37] px-2 py-1 rounded-md font-bold"
                >
                  ویرایش
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#2E7D5B]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">فروش امروز</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(totalSalesTodayUSD, totalSalesTodayAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2E7D5B]">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#123B66]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">فروش این ماه</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(totalSalesMonthUSD, totalSalesMonthAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#123B66]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">مفاد امروز</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(profitTodayUSD, profitTodayAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#D4AF37]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">مفاد این ماه</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(profitMonthUSD, profitMonthAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">سفارشات جدید</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{newOrdersCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#F59E0B]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">قرض مشتریان</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(customerDebtUSD, customerDebtAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#F59E0B]">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#DC2626]"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">موجودی کم</p>
              <h3 className="text-2xl font-black text-[#DC2626]">{lowStockCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#DC2626]">
              <PackageX className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">مصارف امروز</p>
              <h3 className="text-2xl font-black text-[#0B1F3A]">{showAmount(todayExpensesUSD, todayExpensesAFN)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
        
      </div>

    </div>
  );
};
