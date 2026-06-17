import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Users, Building2, CreditCard, X, Edit, Trash2, Plus, FileText, Search, KeyRound } from 'lucide-react';
import { AdminPasswordPrompt } from './AdminPasswordPrompt';
import { DebtPayment } from '../types';

export const Debts: React.FC = () => {
  const { state, addPayment, updateCustomerDebt, updateSupplierDebt, deletePayment, editPayment, addCustomer, addSupplier, editCustomer } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [activeTab, setActiveTab] = useState<'Customers' | 'Suppliers'>('Customers');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Security Modal
  const [adminPrompt, setAdminPrompt] = useState<{isOpen: boolean; action: () => void; title: string}>({
    isOpen: false, action: () => {}, title: ''
  });

  // Add/Edit Debt Modal
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ afn: '', usd: '' });

  // New Debt Form Modal (Add any person)
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [newDebtForm, setNewDebtForm] = useState({ 
    mode: 'existing' as 'existing' | 'new',
    partnerId: '', 
    name: '',
    phone: '',
    company: '',
    afn: '', 
    usd: '' 
  });

  // Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DebtPayment | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountAFN: '',
    amountUSD: '',
    notes: ''
  });

  const searchQ = searchQuery.toLowerCase();
  const customersWithDebt = state.customers.filter(c => 
    searchQ ? (c.name.toLowerCase().includes(searchQ) || c.phone.includes(searchQ) || (c.companyName && c.companyName.toLowerCase().includes(searchQ))) : true
  );
  const suppliersWithDebt = state.suppliers.filter(s => 
    searchQ ? (s.name.toLowerCase().includes(searchQ) || s.phone.includes(searchQ) || (s.companyName && s.companyName.toLowerCase().includes(searchQ))) : true
  );

  const filteredPayments = state.payments.filter(p => {
    const pDate = p.date.split('T')[0];
    return pDate >= dateRange.from && pDate <= dateRange.to && p.partnerType === (activeTab === 'Customers' ? 'Customer' : 'Supplier');
  });

  const handleOpenPayment = (partner: any, paymentToEdit?: DebtPayment) => {
    setSelectedPartner(partner);
    if (paymentToEdit) {
      setEditingPayment(paymentToEdit);
      setPaymentForm({
        amountAFN: paymentToEdit.amountAFN.toString(),
        amountUSD: paymentToEdit.amountUSD.toString(),
        notes: paymentToEdit.notes || ''
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({
        amountAFN: '',
        amountUSD: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDebt = (partner: any) => {
    setSelectedPartner(partner);
    setDebtForm({ afn: partner.debtAFN.toString(), usd: partner.debtUSD.toString() });
    setIsDebtModalOpen(true);
  };

  const handleDeletePayment = (id: string) => {
    setAdminPrompt({
      isOpen: true,
      title: 'حذف تراکنش',
      action: () => deletePayment(id)
    });
  };

  const handleSubmitDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    setAdminPrompt({
      isOpen: true,
      title: 'تغییر میزان قرضه',
      action: () => {
        const afn = parseFloat(debtForm.afn) || 0;
        const usd = parseFloat(debtForm.usd) || 0;
        if (activeTab === 'Customers') updateCustomerDebt(selectedPartner.id, afn, usd);
        else updateSupplierDebt(selectedPartner.id, afn, usd);
        setIsDebtModalOpen(false);
      }
    });
  };

  const handleCreateNewDebt = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newDebtForm.mode === 'existing' && !newDebtForm.partnerId) {
      alert('لطفاً یک شخص را انتخاب کنید.');
      return;
    }
    if (newDebtForm.mode === 'new' && !newDebtForm.name.trim()) {
      alert('لطفاً نام شخص را وارد کنید.');
      return;
    }

    setAdminPrompt({
      isOpen: true,
      title: 'ثبت قرضه جدید',
      action: () => {
        const afn = parseFloat(newDebtForm.afn) || 0;
        const usd = parseFloat(newDebtForm.usd) || 0;
        
        let targetId = newDebtForm.partnerId;

        if (newDebtForm.mode === 'new') {
          targetId = (activeTab === 'Customers' ? 'c' : 's') + Date.now();
          if (activeTab === 'Customers') {
            addCustomer({
              id: targetId,
              name: newDebtForm.name,
              phone: newDebtForm.phone,
              companyName: newDebtForm.company,
              city: 'نامشخص',
              debtAFN: afn,
              debtUSD: usd,
              creditLimitUSD: 0
            });
          } else {
            addSupplier({
              id: targetId,
              name: newDebtForm.name,
              phone: newDebtForm.phone,
              companyName: newDebtForm.company,
              city: 'نامشخص',
              debtAFN: afn,
              debtUSD: usd
            });
          }
        } else {
          // Update existing
          if (activeTab === 'Customers') updateCustomerDebt(targetId, afn, usd);
          else updateSupplierDebt(targetId, afn, usd);
        }

        setIsNewDebtModalOpen(false);
        setNewDebtForm({ mode: 'existing', partnerId: '', name: '', phone: '', company: '', afn: '', usd: '' });
      }
    });
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    const afn = parseFloat(paymentForm.amountAFN) || 0;
    const usd = parseFloat(paymentForm.amountUSD) || 0;
    
    if (afn <= 0 && usd <= 0) {
      alert('مبلغ پرداخت نباید صفر باشد.');
      return;
    }

    if (editingPayment) {
      setAdminPrompt({
        isOpen: true,
        title: 'ویرایش تراکنش پرداخت / تقسیط',
        action: () => {
          editPayment({
            ...editingPayment,
            amountAFN: afn,
            amountUSD: usd,
            notes: paymentForm.notes
          });
          setIsModalOpen(false);
          setEditingPayment(null);
        }
      });
    } else {
      addPayment({
        id: Date.now().toString(),
        partnerId: selectedPartner.id,
        partnerType: activeTab === 'Customers' ? 'Customer' : 'Supplier',
        partnerName: selectedPartner.name,
        amountUSD: usd,
        amountAFN: afn,
        exchangeRate: state.exchangeRate,
        date: new Date().toISOString(),
        notes: paymentForm.notes || 'پرداخت بابت حساب'
      });
      setIsModalOpen(false);
    }
  };

  const handleResetPassword = (customer: any) => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setAdminPrompt({
      isOpen: true,
      title: 'بازیابی رمز عبور مشتری',
      action: () => {
        editCustomer({ ...customer, passwordHash: randomOtp, requirePasswordChange: true });
        alert(`رمز یکبار مصرف تولید شد:\n\n${randomOtp}\n\nاین رمز را به مشتری بدهید تا با آن وارد شود و رمز جدیدی انتخاب کند.`);
      }
    });
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت قرضه‌ها و پرداخت‌ها</h1>
          <p className="text-xs text-slate-500 mt-1">حساب‌های دریافتی (مشتریان) و پرداختی (تامین‌کنندگان) به همراه سابقه پرداخت</p>
        </div>
        <button 
          onClick={() => setIsNewDebtModalOpen(true)}
          className="bg-amber-500 text-white hover:bg-amber-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" /> افزودن قرضه جدید
        </button>
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

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="جستجوی شخص با نام، شماره تماس، یا شرکت..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800"
        />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-400" /></button>}
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
                      <div className="flex items-center gap-2 justify-end">
                        {activeTab === 'Customers' && (
                          <button 
                            onClick={() => handleResetPassword(person)}
                            className="text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-100"
                            title="تغییر رمز عبور مشتری به رمز یکبار مصرف"
                          >
                            <KeyRound className="w-3 h-3" /> بازیابی رمز
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenDebt(person)}
                          className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-amber-100"
                          title="ویرایش/ثبت قرضه جدید"
                        >
                          <Edit className="w-3 h-3" /> ثبت/ویرایش
                        </button>
                        <button 
                          onClick={() => handleOpenPayment(person)}
                          className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-100"
                        >
                          <CreditCard className="w-3 h-3" /> پرداخت
                        </button>
                      </div>
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
                  <th className="px-4 py-3 font-bold text-center">عملیات</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            const partner = (activeTab === 'Customers' ? state.customers : state.suppliers).find(p => p.id === payment.partnerId);
                            if (partner) handleOpenPayment(partner, payment);
                          }}
                          className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="ویرایش قسط / پرداخت"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePayment(payment.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف کامل تراکنش"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
              <h2 className="text-xl font-black">{editingPayment ? 'ویرایش تراکنش قسط' : 'ثبت پرداخت جدید'}: {selectedPartner.name}</h2>
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
                {editingPayment ? 'تأیید و ذخیره تغییرات' : 'ثبت پرداخت در سیستم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isDebtModalOpen && selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">ثبت/تغییر میزان قرضه: {selectedPartner.name}</h2>
              <button onClick={() => setIsDebtModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitDebt} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">کل قرضه (افغانی)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={debtForm.afn} 
                    onChange={e => setDebtForm({...debtForm, afn: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-right font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">کل قرضه (دالر)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={debtForm.usd} 
                    onChange={e => setDebtForm({...debtForm, usd: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-right font-mono" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600 py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4">
                ذخیره میزان قرضه
              </button>
            </form>
          </div>
        </div>
      )}

      {isNewDebtModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">ثبت قرضه جدید</h2>
              <button onClick={() => setIsNewDebtModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNewDebt} className="p-6 space-y-4 text-sm">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setNewDebtForm({...newDebtForm, mode: 'existing'})}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${newDebtForm.mode === 'existing' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                >
                  شخص موجود
                </button>
                <button
                  type="button"
                  onClick={() => setNewDebtForm({...newDebtForm, mode: 'new'})}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${newDebtForm.mode === 'new' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                >
                  ثبت شخص جدید
                </button>
              </div>

              {newDebtForm.mode === 'existing' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    انتخاب {activeTab === 'Customers' ? 'مشتری' : 'تامین‌کننده'}
                  </label>
                  <select 
                    value={newDebtForm.partnerId} 
                    onChange={e => setNewDebtForm({...newDebtForm, partnerId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 font-bold"
                    required
                  >
                    <option value="">-- انتخاب کنید --</option>
                    {(activeTab === 'Customers' ? state.customers : state.suppliers).map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.companyName ? `(${p.companyName})` : ''}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      required
                      value={newDebtForm.name} 
                      onChange={e => setNewDebtForm({...newDebtForm, name: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">شماره تماس</label>
                    <input 
                      type="text" 
                      dir="ltr"
                      value={newDebtForm.phone} 
                      onChange={e => setNewDebtForm({...newDebtForm, phone: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500 text-right font-mono" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">شرکت/فروشگاه (اختیاری)</label>
                    <input 
                      type="text" 
                      value={newDebtForm.company} 
                      onChange={e => setNewDebtForm({...newDebtForm, company: e.target.value})} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500" 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">میزان قرضه (افغانی)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={newDebtForm.afn} 
                    onChange={e => setNewDebtForm({...newDebtForm, afn: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-right font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">میزان قرضه (دالر)</label>
                  <input 
                    type="number" 
                    min="0" 
                    step="any" 
                    dir="ltr" 
                    value={newDebtForm.usd} 
                    onChange={e => setNewDebtForm({...newDebtForm, usd: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-right font-mono" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600 py-4 rounded-xl font-black text-lg transition-all shadow-xl mt-4">
                ثبت قرضه در سیستم
              </button>
            </form>
          </div>
        </div>
      )}

      <AdminPasswordPrompt 
        isOpen={adminPrompt.isOpen} 
        onClose={() => setAdminPrompt({ ...adminPrompt, isOpen: false })} 
        onSuccess={() => {
          adminPrompt.action();
          setAdminPrompt({ ...adminPrompt, isOpen: false });
        }}
        title={adminPrompt.title}
      />
    </div>
  );
};
