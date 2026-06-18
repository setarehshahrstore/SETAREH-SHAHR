import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { DateFilter, DateRange } from './DateFilter';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, ShoppingCart, 
  Receipt, PackageX, Clock, PlusCircle, PackagePlus, FilePlus, UserPlus, 
  CreditCard, Printer, Activity, CheckCircle, XCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { state, updateExchangeRate } = useAppState();
  
  // Date Filter State
  const todayDate = new Date().toLocaleDateString('en-CA');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('en-CA'),
    to: todayDate
  });

  const [rateInput, setRateInput] = useState<string>(state.exchangeRate.toString());
  const [isEditingRate, setIsEditingRate] = useState(false);

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateExchangeRate(parsed);
      setIsEditingRate(false);
    }
  };

  // -----------------------------
  // Data Filtering & Processing
  // -----------------------------
  
  // Filter Sales
  const filteredSales = useMemo(() => {
    return state.sales.filter(s => {
      const saleDate = s.date.split('T')[0];
      return saleDate >= dateRange.from && saleDate <= dateRange.to;
    });
  }, [state.sales, dateRange]);

  // Filter Purchases
  const filteredPurchases = useMemo(() => {
    return state.purchases.filter(p => {
      const pDate = p.date.split('T')[0];
      return pDate >= dateRange.from && pDate <= dateRange.to;
    });
  }, [state.purchases, dateRange]);

  // Metrics Calculations
  const salesUSD = filteredSales.reduce((sum, s) => sum + (s.finalUSD || 0), 0);
  const salesAFN = filteredSales.reduce((sum, s) => sum + (s.finalAFN || 0), 0);

  const salesCashAFN = filteredSales.filter(s => s.paymentMethod === 'Cash').reduce((sum, s) => sum + (s.finalAFN || 0), 0);
  const salesCreditAFN = filteredSales.filter(s => s.paymentMethod === 'Credit').reduce((sum, s) => sum + (s.finalAFN || 0), 0);

  const costUSD = filteredSales.reduce((sum, s) => sum + (s.items || []).reduce((itemSum, item) => {
    const prod = state.products.find(p => p.id === item.productId);
    const costPerBase = prod ? (prod.costPriceUSD || 0) : 0;
    return itemSum + ((item.quantity || 0) * (item.multiplier || 1) * costPerBase);
  }, 0), 0);

  const profitUSD = salesUSD - costUSD;
  const profitAFN = salesAFN - (costUSD * state.exchangeRate);

  const expensesAFN = 0; // Hooks up to actual expenses state if exists
  const expensesUSD = 0;

  const newOrders = filteredSales.filter(s => s.status !== 'Completed').length;
  
  // Low Stock
  const lowStockProducts = state.products.filter(p => p.stockInBaseUnits <= p.minStockInBaseUnits);

  // Debts
  const customersWithDebt = state.customers.filter(c => c.debtAFN > 0 || c.debtUSD > 0).slice(0, 5);
  const totalDebtAFN = state.customers.reduce((sum, c) => sum + c.debtAFN, 0);

  // Best Selling Products
  const bestSellers = useMemo(() => {
    const productSales: Record<string, { name: string, qty: number, total: number }> = {};
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, qty: 0, total: 0 };
        }
        productSales[item.productId].qty += (item.quantity * item.multiplier);
        productSales[item.productId].total += item.totalAFN;
      });
    });
    return Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredSales]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    const dataMap: Record<string, { date: string, فروش: number, مفاد: number }> = {};
    filteredSales.forEach(s => {
      const d = s.date.split('T')[0];
      if (!dataMap[d]) dataMap[d] = { date: d, فروش: 0, مفاد: 0 };
      
      const sCostUSD = (s.items || []).reduce((sum, item) => {
        const prod = state.products.find(p => p.id === item.productId);
        return sum + ((item.quantity * item.multiplier) * (prod?.costPriceUSD || 0));
      }, 0);

      dataMap[d].فروش += s.finalAFN;
      dataMap[d].مفاد += (s.finalAFN - (sCostUSD * state.exchangeRate));
    });
    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, state.products, state.exchangeRate]);

  // Empty State Check
  const hasData = filteredSales.length > 0 || filteredPurchases.length > 0;

  return (
    <div className="space-y-6 pb-20 font-sans" dir="rtl">
      
      {/* Top Welcome Section */}
      <div className="bg-gradient-to-l from-[#0B1F3A] to-[#1A3A5F] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            خوش آمدید، مالک فروشگاه <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
            گزارش زنده فروش، سفارشات، موجودی و حساب‌های فروشگاه ستاره شهر. در اینجا می‌توانید نمای کلی از کسب و کار خود را مدیریت کنید.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col items-end gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-200 text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>تاریخ امروز:</span>
            <span className="font-bold text-white tracking-widest" dir="ltr">{todayDate}</span>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-300">نرخ امروز دالر:</span>
            {isEditingRate ? (
              <form onSubmit={handleUpdateRate} className="flex gap-2">
                <input 
                  type="number" step="0.01" value={rateInput} onChange={e => setRateInput(e.target.value)} 
                  className="w-20 px-2 py-1 text-sm text-slate-900 font-bold rounded" dir="ltr" autoFocus
                />
                <button type="submit" className="bg-[#D4AF37] hover:bg-[#B8942E] text-white px-2 rounded text-xs font-bold">ثبت</button>
              </form>
            ) : (
              <button onClick={() => setIsEditingRate(true)} className="font-black text-[#D4AF37] text-lg hover:underline flex items-center gap-1">
                {state.exchangeRate} ؋ <span className="text-xs text-slate-400 font-normal">/ $1</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { to: '/admin/sales', icon: ShoppingCart, label: 'فروش جدید', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:border-emerald-600' },
          { to: '/admin/inventory?add=true', icon: PackagePlus, label: 'افزودن محصول', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600' },
          { to: '/admin/purchases', icon: FilePlus, label: 'ثبت خرید', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600' },
          { to: '/admin/customers', icon: UserPlus, label: 'افزودن مشتری', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white hover:border-amber-600' },
          { to: '/admin/finances', icon: CreditCard, label: 'ثبت پرداخت', color: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600' },
          { to: '/admin/reports', icon: Printer, label: 'چاپ گزارش', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-700' }
        ].map((btn, idx) => (
          <Link key={idx} to={btn.to} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group shadow-sm hover:shadow-md ${btn.color}`}>
            <btn.icon className="w-6 h-6 mb-2 transition-transform group-hover:scale-110" />
            <span className="text-xs font-bold">{btn.label}</span>
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="مجموع فروش" amount={salesAFN} usd={salesUSD} icon={TrendingUp} color="emerald" trend="در بازه زمانی انتخاب شده" />
        <SummaryCard title="مجموع مفاد (سود)" amount={profitAFN} usd={profitUSD} icon={DollarSign} color="amber" trend="سود خالص ناویژه" />
        <SummaryCard title="سفارشات در انتظار" count={newOrders} icon={Receipt} color="blue" trend="نیاز به بررسی" />
        <SummaryCard title="طلب از مشتریان" amount={totalDebtAFN} icon={Users} color="rose" trend="کل قرضه‌های سیستم" />
      </div>

      {/* Main Charts Area */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              نمودار فروش و مفاد
            </h3>
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value, 'AFN'), '']}
                  />
                  <Line type="monotone" dataKey="فروش" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="مفاد" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              تفکیک فروش نقدی / قرضه
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-600">فروش نقدی</span>
                  <span className="font-black text-emerald-600">{formatCurrency(salesCashAFN, 'AFN')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(salesCashAFN / (salesAFN || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-600">فروش اعتباری (قرضه)</span>
                  <span className="font-black text-rose-500">{formatCurrency(salesCreditAFN, 'AFN')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${(salesCreditAFN / (salesAFN || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-1">مجموع ارز خارجی در فروش</p>
                <p className="text-xl font-black text-[#0B1F3A]" dir="ltr">${salesUSD.toFixed(2)}</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">هیچ معلوماتی در این تاریخ پیدا نشد</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">در این بازه زمانی هیچگونه اطلاعات فروش یا خریدی ثبت نشده است.</p>
          <Link to="/sales" className="bg-[#0B1F3A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#123B66] transition-colors">
            ثبت فروش جدید
          </Link>
        </div>
      )}

      {/* Bottom Grid Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-400" /> آخرین سفارشات</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">مشاهده همه</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">شماره سفارش</th>
                  <th className="px-4 py-3 font-bold">نام مشتری</th>
                  <th className="px-4 py-3 font-bold">مبلغ</th>
                  <th className="px-4 py-3 font-bold">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.slice(0, 5).map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{sale.invoiceNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{sale.customerName}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600">{formatCurrency(sale.finalAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        sale.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        sale.status === 'Pending Delivery' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {sale.status === 'Completed' ? 'تحویل شده' : 'در انتظار تأیید'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs font-bold">سفارشی یافت نشد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-rose-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-rose-50 bg-rose-50/30 flex justify-between items-center">
            <h3 className="font-black text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              محصولات با موجودی کم
            </h3>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {lowStockProducts.slice(0, 5).map(p => (
              <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">حد هشدار: {p.minStockInBaseUnits} {p.baseUnit}</p>
                </div>
                <div className="text-center bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200">
                  <span className="block font-black text-rose-700 text-sm" dir="ltr">{p.stockInBaseUnits}</span>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">موجودی انبار نرمال است 🎉</div>
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> پرفروش‌ترین محصولات</h3>
          </div>
          <div className="divide-y divide-slate-100 p-2">
            {bestSellers.map((prod, idx) => (
              <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-amber-700/10 text-amber-800' : 'bg-slate-50 text-slate-400'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{prod.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{prod.qty} عدد فروخته شده</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600 text-sm font-mono">{formatCurrency(prod.total, 'AFN')}</span>
              </div>
            ))}
            {bestSellers.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-bold">داده‌ای برای نمایش نیست</div>
            )}
          </div>
        </div>

        {/* Customer Debts */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> مشتریان قرضه‌دار</h3>
            <Link to="/admin/debts" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">مدیریت حساب‌ها</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">نام مشتری</th>
                  <th className="px-4 py-3 font-bold">شماره تماس</th>
                  <th className="px-4 py-3 font-bold">مبلغ قرض</th>
                  <th className="px-4 py-3 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersWithDebt.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs" dir="ltr">{c.phone}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">
                      {c.debtAFN > 0 && <div>{formatCurrency(c.debtAFN, 'AFN')}</div>}
                      {c.debtUSD > 0 && <div className="text-[10px] text-rose-400">${c.debtUSD.toFixed(2)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/admin/finances" className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100">ثبت پرداخت</Link>
                    </td>
                  </tr>
                ))}
                {customersWithDebt.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs font-bold">هیچ مشتری بدهکاری وجود ندارد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Summary Card Component
const SummaryCard = ({ title, amount, usd, count, icon: Icon, color, trend }: any) => {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    amber: 'border-amber-500 text-amber-600 bg-amber-50',
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    rose: 'border-rose-500 text-rose-600 bg-rose-50',
  };
  
  return (
    <div className={`bg-white rounded-3xl p-5 border-r-4 shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md ${colors[color].split(' ')[0]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-bold text-slate-500 mb-1.5">{title}</p>
          {amount !== undefined ? (
            <h3 className="text-2xl font-black text-slate-800 font-mono">{formatCurrency(amount, 'AFN')}</h3>
          ) : (
            <h3 className="text-2xl font-black text-slate-800">{count} <span className="text-sm font-bold text-slate-500">مورد</span></h3>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${colors[color].split(' ')[2]} ${colors[color].split(' ')[1]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {usd !== undefined && usd > 0 && (
        <p className="text-xs text-slate-400 font-mono mb-3" dir="ltr">${usd.toFixed(2)}</p>
      )}
      
      <div className="mt-auto pt-4 border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-400 bg-slate-50 inline-block px-2 py-1 rounded-md">{trend}</p>
      </div>
    </div>
  );
};
