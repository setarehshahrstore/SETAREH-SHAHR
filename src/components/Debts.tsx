import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Users, Building2, CreditCard, X } from 'lucide-react';

export const Debts: React.FC = () => {
  const { state, addPayment } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [activeTab, setActiveTab] = useState<'Customers' | 'Suppliers'>('Customers');
  
  // Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountAFN: '',
    amountUSD: '',
    notes: ''
  });

  const customersWithDebt = state.customers.filter(c => c.debtAFN > 0 || c.debtUSD > 0);
  const suppliersWithDebt = state.suppliers.filter(s => s.debtAFN > 0 || s.debtUSD > 0);

  const filteredPayments = state.payments.filter(p => {
    const pDate = p.date.split('T')[0];
    return pDate >= dateRange.from && pDate <= dateRange.to && p.partnerType === (activeTab === 'Customers' ? 'Customer' : 'Supplier');
  });

  const handleOpenPayment = (partner: any) => {
    setSelectedPartner(partner);
    setPaymentForm({
      amountAFN: '',
      amountUSD: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    const afn = parseFloat(paymentForm.amountAFN) || 0;
    const usd = parseFloat(paymentForm.amountUSD) || 0;
    
    if (afn <= 0 && usd <= 0) {
      alert('مبلغ پرداختی را وارد کنید.');
      return;
    }

    addPayment({
      id: Date.now().toString(),
      partnerId: selectedPartner.id,
      partnerType: activeTab === 'Customers' ? 'Customer' : 'Supplier',
      partnerName: selectedPartner.name,
      amountUSD: usd,
      amountAFN: afn,
      exchangeRate: state.exchangeRate,
      date: new Date().toISOString(),
      notes: paymentForm.notes || 'تسویه حساب قرضه'
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت قرضه‌ها و پرداخت‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">حسابات دریافتنی (مشتریان) و پرداختنی (تامین‌کنندگان) به همراه سابقه پرداخت</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('Customers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Customers' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="w-4 h-4" /> قرض مشتریان
        </button>
        <button 
          onClick={() => setActiveTab('Suppliers')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'Suppliers' ? 'border-[#0B1F3A] text-[#0B1F3A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 className="w-4 h-4" /> طلب فروشندگان
        </button>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">وضعیت فعلی قرضه‌ها</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-right">
              <thead className="bg-[#0B1F3A] text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">نام</th>
                  <th className="px-4 py-3 font-bold">مبلغ (افغانی)</th>
                  <th className="px-4 py-3 font-bold">مبلغ (دالر)</th>
                  <th className="px-4 py-3 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'Customers' ? customersWithDebt : suppliersWithDebt).map(person => (
                  <tr key={person.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{person.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">{formatCurrency(person.debtAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">${person.debtUSD.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleOpenPayment(person)}
                        className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100"
                      >
                        <CreditCard className="w-3 h-3" /> ثبت پرداخت
                      </button>
                    </td>
                  </tr>
                ))}
                {(activeTab === 'Customers' ? customersWithDebt : suppliersWithDebt).length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-bold">هیچ قرضه فعالی وجود ندارد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-emerald-50 text-emerald-800">
            <h3 className="font-bold">تاریخچه پرداخت‌ها (در بازه انتخاب شده)</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-right">
              <thead className="bg-emerald-600 text-white text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold">تاریخ</th>
                  <th className="px-4 py-3 font-bold">نام</th>
                  <th className="px-4 py-3 font-bold">مبلغ پرداخت</th>
                  <th className="px-4 py-3 font-bold">توضیحات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{new Date(payment.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{payment.partnerName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                      {payment.amountAFN > 0 ? formatCurrency(payment.amountAFN, 'AFN') : `$${payment.amountUSD.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{payment.notes || '-'}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-400 font-bold">هیچ پرداختی در این بازه ثبت نشده است</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">ثبت پرداخت برای: {selectedPartner.name}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-slate-100 p-4 mx-6 mt-6 rounded-xl flex justify-between items-center text-sm font-bold border border-slate-200">
              <span className="text-slate-600">قرضه باقیمانده:</span>
              <span className="text-rose-600 font-mono text-lg">{formatCurrency(selectedPartner.debtAFN, 'AFN')}</span>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (افغانی)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={paymentForm.amountAFN} 
                    onChange={e => setPaymentForm({...paymentForm, amountAFN: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (دالر)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={paymentForm.amountUSD} 
                    onChange={e => setPaymentForm({...paymentForm, amountUSD: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات پرداخت</label>
                <input 
                  type="text" 
                  value={paymentForm.notes} 
                  onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                  placeholder="مثال: تسویه حساب ماهانه، کارت به کارت..." 
                />
              </div>

              <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] hover:bg-[#123B66] py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4">
                ثبت پرداخت در سیستم
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
