import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, X, Printer } from 'lucide-react';
import { ShiftCloseModal } from './ShiftCloseModal';

export const Finances: React.FC = () => {
  const { state, addTransaction, addCapitalLog } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCurrency, setTxCurrency] = useState<'AFN' | 'USD'>('AFN');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');

  // Let's include both app state generic transactions and payments
  const allTransactions = useMemo(() => {
    let txs: any[] = [];
    
    // Add partner payments
    state.payments.forEach(p => {
      txs.push({
        id: p.id,
        date: p.date,
        type: p.partnerType === 'Customer' ? 'Income' : 'Expense',
        amountAFN: p.amountAFN,
        amountUSD: p.amountUSD,
        description: `بابت ${p.partnerName} - ${p.notes || ''}`,
        source: 'Payment'
      });
    });

    // Add general state transactions if available
    if (state.transactions) {
      state.transactions.forEach((t: any) => {
        txs.push({
          id: t.id,
          date: t.date,
          type: t.type,
          amountAFN: t.currency === 'AFN' ? t.amount : 0,
          amountUSD: t.currency === 'USD' ? t.amount : 0,
          description: t.description,
          source: 'General'
        });
      });
    }
    
    // Add general expenses if available
    if (state.expenses) {
      state.expenses.forEach((e: any) => {
        txs.push({
          id: e.id,
          date: e.date,
          type: 'Expense',
          amountAFN: e.currency === 'AFN' ? e.amount : 0,
          amountUSD: e.currency === 'USD' ? e.amount : 0,
          description: `مصرف: ${e.category} - ${e.description}`,
          source: 'Expense'
        });
      });
    }

    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.payments, state.transactions, state.expenses]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const pDate = t.date.split('T')[0];
      const matchesDate = pDate >= dateRange.from && pDate <= dateRange.to;
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [allTransactions, dateRange, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || parseFloat(txAmount) <= 0) return;

    addTransaction({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: txType,
      currency: txCurrency,
      amount: parseFloat(txAmount),
      description: txDescription
    });

    setIsModalOpen(false);
    setTxAmount('');
    setTxDescription('');
  };

  // Capital Modal State
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [capType, setCapType] = useState<'Add' | 'Withdraw'>('Add');
  const [capCurrency, setCapCurrency] = useState<'AFN' | 'USD'>('AFN');
  const [capAmount, setCapAmount] = useState('');
  const [capNote, setCapNote] = useState('');

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const handleCapitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capAmount || parseFloat(capAmount) <= 0) return;
    
    addCapitalLog({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: capType,
      currency: capCurrency,
      amount: parseFloat(capAmount),
      note: capNote
    });

    setIsCapitalModalOpen(false);
    setCapAmount('');
    setCapNote('');
  };

  // --- Financial Metrics Calculations ---
  const { exchangeRate } = state;
  const safeRate = exchangeRate || 71.5;

  const cashAFN = state.cashRegister.balanceAFN + (state.cashRegister.balanceUSD * safeRate);
  
  const inventoryValueAFN = state.products.reduce((acc, p) => acc + (p.costPriceAFN * p.stockInBaseUnits), 0);
  
  const customerDebtsAFN = state.customers.reduce((acc, c) => acc + c.debtAFN + (c.debtUSD * safeRate), 0);
  const supplierDebtsAFN = state.suppliers.reduce((acc, s) => acc + s.debtAFN + (s.debtUSD * safeRate), 0);

  const totalAssetsAFN = cashAFN + inventoryValueAFN + customerDebtsAFN;
  const totalLiabilitiesAFN = supplierDebtsAFN;
  const netWorthAFN = totalAssetsAFN - totalLiabilitiesAFN;

  const totalInvestedCapitalAFN = (state.capitalLogs || []).reduce((acc: number, log: any) => {
    const valAFN = log.currency === 'AFN' ? log.amount : log.amount * safeRate;
    return log.type === 'Add' ? acc + valAFN : acc - valAFN;
  }, 0);

  const profitAFN = netWorthAFN - totalInvestedCapitalAFN;
  const circulatingMoneyAFN = inventoryValueAFN + customerDebtsAFN; // Money in goods and receivables

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مالی و پرداخت‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت صندوق، دریافت‌ها و پرداخت‌ها</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
          >
            <Printer className="w-5 h-5" />
            بستن شیفت و راپور امروز
          </button>
          <button 
            onClick={() => setIsCapitalModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            مدیریت سرمایه
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            ثبت تراکنش صندوق
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-500 font-bold mb-1">سرمایه کل وارد شده</p>
          <h3 className="text-lg font-black text-indigo-700">{formatCurrency(totalInvestedCapitalAFN, 'AFN')}</h3>
          <p className="text-[10px] text-slate-400 mt-1" dir="ltr">~ ${(totalInvestedCapitalAFN / safeRate).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-500 font-bold mb-1">ارزش کل مارکت (دارایی خالص)</p>
          <h3 className="text-lg font-black text-[#0B1F3A]">{formatCurrency(netWorthAFN, 'AFN')}</h3>
          <p className="text-[10px] text-slate-400 mt-1" dir="ltr">~ ${(netWorthAFN / safeRate).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-500 font-bold mb-1">پول در گردش (اموال + طلبات)</p>
          <h3 className="text-lg font-black text-amber-600">{formatCurrency(circulatingMoneyAFN, 'AFN')}</h3>
          <p className="text-[10px] text-slate-400 mt-1" dir="ltr">~ ${(circulatingMoneyAFN / safeRate).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-500 font-bold mb-1">مفاد خالص</p>
          <h3 className={`text-lg font-black ${profitAFN >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {profitAFN >= 0 ? '+' : ''}{formatCurrency(profitAFN, 'AFN')}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1" dir="ltr">~ ${(profitAFN / safeRate).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-l from-[#0B1F3A] to-[#1A3A5F] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm text-slate-300 font-bold mb-1">موجودی نقد صندوق (افغانی)</p>
          <h2 className="text-3xl font-black font-mono tracking-widest">{formatCurrency(state.cashRegister.balanceAFN, 'AFN')}</h2>
          <CreditCard className="absolute left-6 bottom-6 w-12 h-12 text-white/10" />
        </div>
        
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <p className="text-sm text-emerald-100 font-bold mb-1">موجودی نقد صندوق (دالر)</p>
          <h2 className="text-3xl font-black font-mono tracking-widest" dir="ltr">${state.cashRegister.balanceUSD.toFixed(2)}</h2>
          <DollarSign className="absolute left-6 bottom-6 w-12 h-12 text-white/10" />
        </div>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی در توضیحات تراکنش..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">تراکنش‌ها در بازه زمانی انتخاب شده</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ</th>
                <th className="px-4 py-4">نوع تراکنش</th>
                <th className="px-4 py-4">مبلغ (افغانی)</th>
                <th className="px-4 py-4">مبلغ (دالر)</th>
                <th className="px-4 py-4">توضیحات و منبع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => {
                const isIncoming = t.type === 'Income';
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(t.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3">
                      {isIncoming ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                          <ArrowDownRight className="w-3 h-3" /> ورود پول
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                          <ArrowUpRight className="w-3 h-3" /> خروج پول
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{t.amountAFN > 0 ? formatCurrency(t.amountAFN, 'AFN') : '-'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-600">{t.amountUSD > 0 ? `$${t.amountUSD.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3 text-slate-700 text-xs font-bold">
                      {t.description}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5 border border-slate-200 px-1 py-0.5 rounded w-max bg-white">سیستم: {t.source}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                    هیچ تراکنشی در این تاریخ پیدا نشد
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
              <h2 className="text-xl font-black">ثبت تراکنش جدید در صندوق</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نوع تراکنش</label>
                  <select value={txType} onChange={e => setTxType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold">
                    <option value="Income">ورود پول به صندوق</option>
                    <option value="Expense">خروج پول از صندوق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ارز (Currency)</label>
                  <select value={txCurrency} onChange={e => setTxCurrency(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold">
                    <option value="AFN">افغانی</option>
                    <option value="USD">دالر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ <span className="text-rose-500">*</span></label>
                <input required type="number" min="0" step="any" dir="ltr" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right font-mono text-xl" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات تراکنش <span className="text-rose-500">*</span></label>
                <input required type="text" value={txDescription} onChange={e => setTxDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="مثال: شارژ صندوق، دریافت طلب..." />
              </div>

              <button type="submit" className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4 ${
                txType === 'Income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}>
                ثبت تراکنش در سیستم
              </button>
            </form>
          </div>
        </div>
      )}

      {isCapitalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-indigo-700 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">مدیریت سرمایه</h2>
              <button onClick={() => setIsCapitalModalOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCapitalSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">عملیات</label>
                  <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold">
                    <option value="Add">افزایش سرمایه</option>
                    <option value="Withdraw">برداشت از سرمایه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ارز (Currency)</label>
                  <select value={capCurrency} onChange={e => setCapCurrency(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 font-bold">
                    <option value="AFN">افغانی</option>
                    <option value="USD">دالر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ <span className="text-rose-500">*</span></label>
                <input required type="number" min="0" step="any" dir="ltr" value={capAmount} onChange={e => setCapAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right font-mono text-xl" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات / منبع سرمایه</label>
                <input type="text" value={capNote} onChange={e => setCapNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="مثال: سرمایه اولیه شرکت، سود برداشت شده..." />
              </div>

              <button type="submit" className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4 ${
                capType === 'Add' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}>
                ثبت سرمایه
              </button>
            </form>
          </div>
        </div>
      )}

      {isShiftModalOpen && <ShiftCloseModal onClose={() => setIsShiftModalOpen(false)} />}
    </div>
  );
};
