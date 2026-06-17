import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Printer, TrendingUp, DollarSign, Activity, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Reports: React.FC = () => {
  const { state } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [reportType, setReportType] = useState<'Sales' | 'Profit' | 'Inventory'>('Sales');

  const filteredSales = useMemo(() => {
    return state.sales.filter(s => {
      const sDate = s.date.split('T')[0];
      return sDate >= dateRange.from && sDate <= dateRange.to;
    });
  }, [state.sales, dateRange]);

  const salesAFN = filteredSales.reduce((sum, s) => sum + s.finalAFN, 0);
  
  const costUSD = filteredSales.reduce((sum, s) => sum + (s.items || []).reduce((itemSum, item) => {
    const prod = state.products.find(p => p.id === item.productId);
    const costPerBase = prod ? (prod.costPriceUSD || 0) : 0;
    return itemSum + ((item.quantity || 0) * (item.multiplier || 1) * costPerBase);
  }, 0), 0);

  const profitAFN = salesAFN - (costUSD * state.exchangeRate);

  const expensesAFN = (state.expenses || [])
    .filter(e => e.date.split('T')[0] >= dateRange.from && e.date.split('T')[0] <= dateRange.to)
    .reduce((sum, e) => sum + e.amountAFN, 0);

  const netProfitAFN = profitAFN - expensesAFN;

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

  const handleExportCSV = () => {
    // Generate CSV for inventory
    const headers = ['نام محصول', 'دسته بندی', 'موجودی (کارتن)', 'ارزش کل (دالر)'];
    const rows = state.products.map(p => {
      const stock = Math.floor(p.stockInBaseUnits / p.multiplier);
      const val = stock * p.costPriceUSD;
      return [p.name, p.category, stock.toString(), val.toFixed(2)];
    });
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${todayDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">گزارشات و بیلان</h1>
          <p className="text-xs text-slate-500 mt-1">تهیه راپورهای مالی، فروشات و موجودی</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#123B66] transition-all shadow-md print:hidden"
        >
          <Printer className="w-5 h-5" />
          چاپ گزارش
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setReportType('Sales')} className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${reportType === 'Sales' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <TrendingUp className="w-4 h-4" /> گزارش فروش
        </button>
        <button onClick={() => setReportType('Profit')} className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${reportType === 'Profit' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <DollarSign className="w-4 h-4" /> گزارش سود و زیان (بیلان)
        </button>
        <button onClick={() => setReportType('Inventory')} className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${reportType === 'Inventory' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Activity className="w-4 h-4" /> موجودی انبار
        </button>
      </div>

      {reportType !== 'Inventory' && (
        <DateFilter 
          dateRange={dateRange} 
          onDateChange={setDateRange} 
          onSearch={() => {}} 
          onClear={() => setDateRange({ from: todayDate, to: todayDate })}
        />
      )}

      {reportType === 'Sales' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">نمودار فروشات در بازه زمانی</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value, 'AFN'), '']}
                />
                <Bar dataKey="فروش" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {reportType === 'Profit' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-3 flex justify-between items-center bg-gradient-to-l from-indigo-900 to-slate-900 text-white">
            <div>
              <p className="text-indigo-200 font-bold mb-1">سود خالص (بعد از کسر مصارف)</p>
              <h2 className="text-4xl font-black font-mono tracking-widest">{formatCurrency(netProfitAFN, 'AFN')}</h2>
            </div>
            <DollarSign className="w-16 h-16 text-white/10" />
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-emerald-900">
            <p className="text-sm font-bold opacity-80 mb-1">مجموع فروشات</p>
            <h3 className="text-2xl font-black font-mono">{formatCurrency(salesAFN, 'AFN')}</h3>
          </div>
          
          <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-rose-900">
            <p className="text-sm font-bold opacity-80 mb-1">قیمت خرید (تمام شد)</p>
            <h3 className="text-2xl font-black font-mono">{formatCurrency(costUSD * state.exchangeRate, 'AFN')}</h3>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-amber-900">
            <p className="text-sm font-bold opacity-80 mb-1">مصارف فروشگاه</p>
            <h3 className="text-2xl font-black font-mono">{formatCurrency(expensesAFN, 'AFN')}</h3>
          </div>
        </div>
      )}

      {reportType === 'Inventory' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">ارزش کل موجودی انبار</h3>
            <button onClick={handleExportCSV} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-slate-50 print:hidden">
              <Download className="w-3 h-3" /> خروجی اکسل
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold mb-1">ارزش کل به دالر (قیمت خرید)</p>
              <h3 className="text-xl font-black font-mono text-slate-800" dir="ltr">
                ${state.products.reduce((sum, p) => sum + (p.stockInBaseUnits * (p.costPriceUSD || 0)), 0).toFixed(2)}
              </h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 font-bold mb-1">تعداد کل اقلام موجود</p>
              <h3 className="text-xl font-black font-mono text-slate-800" dir="ltr">
                {state.products.reduce((sum, p) => sum + p.stockInBaseUnits, 0)} واحد
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
