import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, X, Printer, Edit2, RotateCcw, Trash2, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { ShiftCloseModal } from './ShiftCloseModal';
import { SecurityGateModal } from './SecurityGate';

export const Finances: React.FC = () => {
  const { state, addTransaction, addCapitalLog, deleteCapitalLog, updateCashRegister, resetFinancials } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Security Gate state
  const [securityOpen, setSecurityOpen] = useState(false);
  const [securityTitle, setSecurityTitle] = useState('');
  const [securityDesc, setSecurityDesc] = useState('');
  const [securityCallback, setSecurityCallback] = useState<(() => void) | null>(null);

  const triggerSecureAction = (title: string, desc: string, callback: () => void) => {
    setSecurityTitle(title);
    setSecurityDesc(desc);
    setSecurityCallback(() => callback);
    setSecurityOpen(true);
  };

  const handleConfirmSecurity = () => {
    if (securityCallback) {
      securityCallback();
    }
    setSecurityOpen(false);
    setSecurityCallback(null);
  };

  // Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCurrency, setTxCurrency] = useState<'AFN' | 'USD'>('AFN');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');

  // Cash Register Edit Modal State
  const [isCashEditModalOpen, setIsCashEditModalOpen] = useState(false);
  const [editAFN, setEditAFN] = useState(state.cashRegister?.balanceAFN?.toString() || '0');
  const [editUSD, setEditUSD] = useState(state.cashRegister?.balanceUSD?.toString() || '0');
  const [cashSavedMessage, setCashSavedMessage] = useState(false);

  // Capital Modal State
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [capType, setCapType] = useState<'Add' | 'Withdraw'>('Add');
  const [capCurrency, setCapCurrency] = useState<'AFN' | 'USD'>('AFN');
  const [capAmount, setCapAmount] = useState('');
  const [capNote, setCapNote] = useState('');

  // Reset Confirm Modal State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const openCashEditor = () => {
    setEditAFN(state.cashRegister?.balanceAFN?.toString() || '0');
    setEditUSD(state.cashRegister?.balanceUSD?.toString() || '0');
    setCashSavedMessage(false);
    setIsCashEditModalOpen(true);
  };

  const handleSaveCashRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const valAFN = parseFloat(editAFN) || 0;
    const valUSD = parseFloat(editUSD) || 0;
    
    triggerSecureAction(
      "تأیید ویرایش موجودی نقد صندوق",
      `آیا تنظیم موجودی صندوق به (${valAFN.toLocaleString()} افغانی و $${valUSD}) را تأیید می‌فرمایید؟ برای ثبت نهایی نیاز به رمز ادمین (Admin$) می‌باشد.`,
      () => {
        updateCashRegister(valAFN, valUSD);
        setCashSavedMessage(true);
        setTimeout(() => {
          setIsCashEditModalOpen(false);
          setCashSavedMessage(false);
        }, 600);
      }
    );
  };

  const handleZeroOutCash = () => {
    triggerSecureAction(
      "تأیید صفر کردن موجودی صندوق",
      "آیا صفر کردن موجودی نقد صندوق (افغانی و دالر) به رقم 0 را تأیید می‌فرمایید؟ برای ادامه رمز ادمین (Admin$) را وارد کنید.",
      () => {
        setEditAFN('0');
        setEditUSD('0');
        updateCashRegister(0, 0);
      }
    );
  };

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
    const amountVal = parseFloat(txAmount);
    if (!txAmount || isNaN(amountVal) || amountVal <= 0) return;

    triggerSecureAction(
      "تأیید ثبت تراکنش مالی صندوق",
      `آیا ثبت تراکنش [${txType === 'Income' ? 'ورود وجه به صندوق (+)' : 'خروج وجه از صندوق (-)'}] به مبلغ ${amountVal.toLocaleString()} ${txCurrency === 'AFN' ? 'افغانی' : 'دالر'} را تایید می‌فرمایید؟ برای ثبت نهایی نیاز به رمز ادمین (Admin$) می‌باشد.`,
      () => {
        addTransaction({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: txType,
          currency: txCurrency,
          amount: amountVal,
          description: txDescription
        });

        setIsModalOpen(false);
        setTxAmount('');
        setTxDescription('');
      }
    );
  };

  const handleCapitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(capAmount);
    if (!capAmount || isNaN(amountVal) || amountVal <= 0) return;
    
    triggerSecureAction(
      capType === 'Add' ? "تأیید افزایش سرمایه" : "تأیید برداشت از سرمایه",
      `آیا ${capType === 'Add' ? 'افزایش' : 'برداشت'} سرمایه به مبلغ ${amountVal.toLocaleString()} ${capCurrency === 'AFN' ? 'افغانی' : 'دالر'} را تایید می‌فرمایید؟ برای اعمال در ترازنامه نیاز به رمز ادمین (Admin$) می‌باشد.`,
      () => {
        addCapitalLog({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: capType,
          currency: capCurrency,
          amount: amountVal,
          note: capNote || (capType === 'Add' ? 'افزایش سرمایه' : 'برداشت سرمایه')
        });

        setCapAmount('');
        setCapNote('');
      }
    );
  };

  const handleDeleteCapital = (log: any) => {
    triggerSecureAction(
      "تأیید حذف ردیف سرمایه",
      `آیا حذف رکورد ${log.type === 'Add' ? 'افزایش' : 'برداشت'} سرمایه به مبلغ ${log.currency === 'AFN' ? formatCurrency(log.amount, 'AFN') : `$${log.amount}`} (${log.note || 'بدون توضیح'}) را تایید می‌فرمایید؟ برای حذف نیاز به رمز ادمین (Admin$) می‌باشد.`,
      () => {
        deleteCapitalLog(log.id);
      }
    );
  };

  const handleExecuteReset = () => {
    triggerSecureAction(
      "تأیید نهایی صفر کردن ارقام مالی و سرمایه",
      "هشدار: موجودی نقد صندوق و تمام لاگ‌های سرمایه به 0 ریست خواهند شد. جهت تایید نهایی رمز عبور ادمین (Admin$) را وارد نمایید.",
      () => {
        resetFinancials();
        setIsResetConfirmOpen(false);
      }
    );
  };

  // --- Financial Metrics Calculations ---
  const { exchangeRate } = state;
  const safeRate = exchangeRate || 71.5;

  const cashAFN = (state.cashRegister?.balanceAFN || 0) + ((state.cashRegister?.balanceUSD || 0) * safeRate);
  
  const inventoryValueAFN = state.products.reduce((acc, p) => acc + (p.costPriceAFN * p.stockInBaseUnits), 0);
  
  const customerDebtsAFN = state.customers.reduce((acc, c) => acc + c.debtAFN + (c.debtUSD * safeRate), 0);
  const supplierDebtsAFN = state.suppliers.reduce((acc, s) => acc + s.debtAFN + (s.debtUSD * safeRate), 0);

  const totalAssetsAFN = cashAFN + inventoryValueAFN + customerDebtsAFN;
  const totalLiabilitiesAFN = supplierDebtsAFN;
  const netWorthAFN = totalAssetsAFN - totalLiabilitiesAFN;

  // Separate Capital: AFN from personal pocket vs USD from personal pocket (No forced conversions)
  const totalInvestedAFN = (state.capitalLogs || []).reduce((acc: number, log: any) => {
    if (log.currency !== 'AFN') return acc;
    return log.type === 'Add' ? acc + log.amount : acc - log.amount;
  }, 0);

  const totalInvestedUSD = (state.capitalLogs || []).reduce((acc: number, log: any) => {
    if (log.currency !== 'USD') return acc;
    return log.type === 'Add' ? acc + log.amount : acc - log.amount;
  }, 0);

  // Combined Equivalent for Net Balance calculation
  const totalInvestedCapitalAFN = totalInvestedAFN + (totalInvestedUSD * safeRate);

  const profitAFN = netWorthAFN - totalInvestedCapitalAFN;
  const profitUSD = profitAFN / safeRate;
  const circulatingMoneyAFN = inventoryValueAFN + customerDebtsAFN; // Money in goods and receivables

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-[11px] font-black text-amber-800 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>بخش حفاظت شده با رمز ارشد ادمین (Admin$)</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت مالی و صندوق</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت موجودی نقدی، سرمایه اولیه پرداختی (افغانی و دالر)، دریافت‌ها، پرداخت‌ها و ترازنامه</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200"
            title="صفر کردن ارقام مالی صندوق و سرمایه"
          >
            <RotateCcw className="w-4 h-4" />
            صفر کردن ارقام مالی
          </button>
          <button 
            onClick={openCashEditor}
            className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            ویرایش موجودی صندوق
          </button>
          <button 
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            بستن شیفت و راپور
          </button>
          <button 
            onClick={() => setIsCapitalModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            مدیریت سرمایه اولیه
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#B8942E] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            ثبت تراکنش صندوق
          </button>
        </div>
      </div>

      {/* KPI Cards: Distinct AFN & USD Initial Capital with real-time conversion sub-labels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
        {/* Card 1: AFN Capital */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-bold mb-1">سرمایه اولیه (افغانی)</p>
            <button 
              onClick={() => setIsCapitalModalOpen(true)}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold opacity-80 group-hover:opacity-100 flex items-center gap-0.5"
              title="تنظیم سرمایه افغانی"
            >
              <Edit2 className="w-3 h-3" /> تنظیم
            </button>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-indigo-700 font-mono">{formatCurrency(totalInvestedAFN, 'AFN')}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono" dir="ltr">~ ${(totalInvestedAFN / safeRate).toFixed(2)}</p>
          </div>
        </div>

        {/* Card 2: USD Capital */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500 font-bold mb-1">سرمایه اولیه (دالر)</p>
            <button 
              onClick={() => setIsCapitalModalOpen(true)}
              className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold opacity-80 group-hover:opacity-100 flex items-center gap-0.5"
              title="تنظیم سرمایه دالری"
            >
              <Edit2 className="w-3 h-3" /> تنظیم
            </button>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-emerald-700 font-mono" dir="ltr">${totalInvestedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">~ {formatCurrency(totalInvestedUSD * safeRate, 'AFN')}</p>
          </div>
        </div>

        {/* Card 3: Net Market Worth */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] text-slate-500 font-bold mb-1">ارزش کل مارکت (دارایی خالص)</p>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0B1F3A] font-mono">{formatCurrency(netWorthAFN, 'AFN')}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono" dir="ltr">~ ${(netWorthAFN / safeRate).toFixed(2)}</p>
          </div>
        </div>

        {/* Card 4: Circulating Capital */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] text-slate-500 font-bold mb-1">پول در گردش (اموال + طلبات)</p>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-600 font-mono">{formatCurrency(circulatingMoneyAFN, 'AFN')}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono" dir="ltr">~ ${(circulatingMoneyAFN / safeRate).toFixed(2)}</p>
          </div>
        </div>

        {/* Card 5: Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <p className="text-[11px] text-slate-500 font-bold mb-1">مفاد خالص کل</p>
          <div>
            <h3 className={`text-base sm:text-lg font-black font-mono ${profitAFN >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {profitAFN >= 0 ? '+' : ''}{formatCurrency(profitAFN, 'AFN')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono" dir="ltr">~ {profitUSD >= 0 ? '+' : ''}${profitUSD.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Cash Register Display Cards with Edit Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-l from-[#0B1F3A] to-[#1A3A5F] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-slate-300 font-bold">موجودی نقد صندوق (افغانی)</p>
            <button
              onClick={openCashEditor}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> ویرایش
            </button>
          </div>
          <h2 className="text-3xl font-black font-mono tracking-widest mt-2">{formatCurrency(state.cashRegister?.balanceAFN || 0, 'AFN')}</h2>
          <CreditCard className="absolute left-6 bottom-6 w-12 h-12 text-white/10" />
        </div>
        
        <div className="bg-gradient-to-l from-emerald-600 to-emerald-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-emerald-100 font-bold">موجودی نقد صندوق (دالر)</p>
            <button
              onClick={openCashEditor}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> ویرایش
            </button>
          </div>
          <h2 className="text-3xl font-black font-mono tracking-widest mt-2" dir="ltr">${(state.cashRegister?.balanceUSD || 0).toFixed(2)}</h2>
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
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">تراکنش‌ها در بازه زمانی انتخاب شده</h3>
          <span className="text-xs text-slate-500 font-bold">{filteredTransactions.length} تراکنش</span>
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

      {/* Cash Edit Modal */}
      {isCashEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  ویرایش و تنظیم موجودی صندوق
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">تنظیم موجودی نقد فیزیکی در هر زمان</p>
              </div>
              <button onClick={() => setIsCashEditModalOpen(false)} className="text-slate-300 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCashRegister} className="p-6 space-y-4 text-sm">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-900 font-bold">تنظیم سریع به صفر</p>
                  <p className="text-[11px] text-emerald-700">برای شروع با موجودی صفر، این دکمه را بزنید</p>
                </div>
                <button
                  type="button"
                  onClick={handleZeroOutCash}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  صفر کردن (0)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موجودی نقد افغانی (AFN)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    dir="ltr"
                    value={editAFN}
                    onChange={(e) => setEditAFN(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono text-xl font-bold text-right"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">AFN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  موجودی نقد دالر (USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    dir="ltr"
                    value={editUSD}
                    onChange={(e) => setEditUSD(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono text-xl font-bold text-right"
                    placeholder="0"
                  />
                  <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">USD</span>
                </div>
              </div>

              {cashSavedMessage && (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  موجودی صندوق با موفقیت بروزرسانی شد
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCashEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  ذخیره موجودی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
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
                    <option value="Income">ورود پول به صندوق (+)</option>
                    <option value="Expense">خروج پول از صندوق (-)</option>
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

      {/* Capital Management Modal */}
      {isCapitalModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 bg-indigo-700 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black">مدیریت سرمایه اولیه و پایه‌گذاری</h2>
                <p className="text-xs text-indigo-200 mt-0.5">ثبت جداگانه سرمایه پرداختی شخصی (افغانی و دالر) بدون تبدیل اجباری</p>
              </div>
              <button onClick={() => setIsCapitalModalOpen(false)} className="text-indigo-200 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Distinct Capital Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4">
                  <span className="text-[11px] text-indigo-800 font-bold block">سرمایه اولیه افغانی (پرداختی از جیب)</span>
                  <h3 className="text-lg font-black text-indigo-950 font-mono mt-1">{formatCurrency(totalInvestedAFN, 'AFN')}</h3>
                  <span className="text-[10px] text-indigo-600 font-mono block mt-0.5" dir="ltr">معادل روز: ~${(totalInvestedAFN / safeRate).toFixed(2)}</span>
                </div>
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
                  <span className="text-[11px] text-emerald-800 font-bold block">سرمایه اولیه دالری (پرداختی از جیب)</span>
                  <h3 className="text-lg font-black text-emerald-950 font-mono mt-1" dir="ltr">${totalInvestedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  <span className="text-[10px] text-emerald-600 font-mono block mt-0.5">معادل روز: ~{formatCurrency(totalInvestedUSD * safeRate, 'AFN')}</span>
                </div>
              </div>

              {/* Add/Withdraw Form */}
              <form onSubmit={handleCapitalSubmit} className="space-y-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs">ثبت تغییر جدید در سرمایه اولیه:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">نوع تغییر</label>
                    <select value={capType} onChange={e => setCapType(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-bold">
                      <option value="Add">افزایش سرمایه (+)</option>
                      <option value="Withdraw">برداشت از سرمایه (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">ارز سرمایه (Currency)</label>
                    <select value={capCurrency} onChange={e => setCapCurrency(e.target.value as any)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 font-bold">
                      <option value="AFN">افغانی (AFN)</option>
                      <option value="USD">دالر (USD)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ <span className="text-rose-500">*</span></label>
                  <input required type="number" min="0" step="any" dir="ltr" value={capAmount} onChange={e => setCapAmount(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-right font-mono text-lg font-bold" placeholder="0" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات / منبع سرمایه</label>
                  <input type="text" value={capNote} onChange={e => setCapNote(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500" placeholder="مثال: سرمایه نقدی پایه از جیب شخصی، برداشت صاحب کسب‌وکار..." />
                </div>

                <button type="submit" className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
                  capType === 'Add' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}>
                  {capType === 'Add' ? '+ ثبت افزایش سرمایه' : '- ثبت برداشت سرمایه'}
                </button>
              </form>

              {/* Capital History List */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs mb-3">تاریخچه ثبت سرمایه‌ها:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(state.capitalLogs || []).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${log.type === 'Add' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                            {log.type === 'Add' ? 'افزایش' : 'برداشت'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {log.currency === 'AFN' ? formatCurrency(log.amount, 'AFN') : `$${log.amount.toLocaleString()}`}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({log.currency === 'AFN' ? `~$${(log.amount / safeRate).toFixed(2)}` : `~${formatCurrency(log.amount * safeRate, 'AFN')}`})
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-1">{log.note || 'بدون توضیح'}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCapital(log)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="حذف ردیف سرمایه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!state.capitalLogs || state.capitalLogs.length === 0) && (
                    <p className="text-center py-4 text-xs text-slate-400 font-bold bg-slate-50 rounded-xl">
                      هنوز سرمایه‌ای ثبت نشده است (سرمایه کل = 0)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">صفر کردن ارقام مالی؟</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                این کار موجودی نقد صندوق (افغانی و دالر) و همچنین سرمایه کل را به <strong className="text-slate-800 font-mono">0</strong> بازنشانی می‌کند تا بتوانید از ابتدا مبالغ دلخواه را وارد کنید. برای تایید نهایی نیاز به رمز ادمین خواهد بود.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                ادامه و تأیید با رمز
              </button>
            </div>
          </div>
        </div>
      )}

      {isShiftModalOpen && <ShiftCloseModal onClose={() => setIsShiftModalOpen(false)} />}

      {/* Security Gate Confirmation Modal for Financial & Capital edits */}
      <SecurityGateModal 
        isOpen={securityOpen}
        onClose={() => {
          setSecurityOpen(false);
          setSecurityCallback(null);
        }}
        onConfirm={handleConfirmSecurity}
        title={securityTitle}
        description={securityDesc}
      />
    </div>
  );
};

