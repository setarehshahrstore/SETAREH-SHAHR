import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Mail, Phone, Plus, X, ShieldAlert, Edit2, Trash2, KeyRound, Banknote, CalendarClock, CreditCard } from 'lucide-react';
import { UserRole } from '../AuthContext';
import { useAppState } from '../AppContext';

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: 'AFN' | 'USD';
  note: string;
}

interface TimeRecord {
  id: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
}

interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  status?: 'Active' | 'Inactive';
  baseSalaryAFN?: number;
  payments?: PaymentRecord[];
  timeRecords?: TimeRecord[];
}

const DEFAULT_USERS: AppUser[] = [
  { username: 'admin@stc.com', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
  { username: 'admin', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
  { username: 'manager', passwordHash: 'manager', fullName: 'مدیر کل', role: 'Manager', status: 'Active', baseSalaryAFN: 25000, payments: [], timeRecords: [] },
  { username: 'cashier', passwordHash: 'cashier', fullName: 'صندوق‌دار', role: 'Cashier', status: 'Active', baseSalaryAFN: 15000, payments: [], timeRecords: [] },
  { username: 'warehouse', passwordHash: 'warehouse', fullName: 'مسئول گدام', role: 'Warehouse Staff', status: 'Active', baseSalaryAFN: 12000, payments: [], timeRecords: [] }
];

export const Employees: React.FC = () => {
  const { addExpense, deleteExpense } = useAppState();
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  
  const [empForm, setEmpForm] = useState<AppUser>({
    username: '',
    passwordHash: '',
    fullName: '',
    role: 'Cashier',
    phone: '',
    status: 'Active',
    baseSalaryAFN: 0,
    payments: []
  });

  const [adminPinModal, setAdminPinModal] = useState<{ isOpen: boolean, action: () => void }>({ isOpen: false, action: () => {} });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // HR Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeEmp, setActiveEmp] = useState<AppUser | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployees(parsed);
          return;
        }
      } catch (err) {}
    }
    setEmployees(DEFAULT_USERS);
  }, []);

  const saveToStorage = (users: AppUser[]) => {
    setEmployees(users);
    localStorage.setItem('AFG_STORE_USERS', JSON.stringify(users));
  };

  const requireAdminPin = (action: () => void) => {
    setPinInput('');
    setPinError(false);
    setAdminPinModal({ isOpen: true, action });
  };

  const verifyPinAndExecute = () => {
    if (pinInput === 'Admin$') {
      adminPinModal.action();
      setAdminPinModal({ isOpen: false, action: () => {} });
    } else {
      setPinError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAdminPin(() => {
      let updated: AppUser[];
      if (editingUsername) {
        updated = employees.map(emp => emp.username === editingUsername ? empForm : emp);
      } else {
        // Add new
        if (employees.find(e => e.username.toLowerCase() === empForm.username.toLowerCase())) {
          alert('این نام کاربری از قبل وجود دارد.');
          return;
        }
        updated = [...employees, empForm];
      }
      saveToStorage(updated);
      setIsModalOpen(false);
    });
  };

  const handleDelete = (username: string) => {
    if (username === 'admin@stc.com' || username === 'admin') {
      alert('اکانت مالک اصلی قابل حذف نیست!');
      return;
    }
    requireAdminPin(() => {
      saveToStorage(employees.filter(emp => emp.username !== username));
    });
  };

  const openEdit = (emp: AppUser) => {
    setEmpForm(emp);
    setEditingUsername(emp.username);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEmpForm({
      username: '',
      passwordHash: '',
      fullName: '',
      role: 'Cashier',
      phone: '',
      status: 'Active',
      baseSalaryAFN: 0,
      payments: []
    });
    setEditingUsername(null);
    setIsModalOpen(true);
  };

  const openPaymentModal = (emp: AppUser) => {
    requireAdminPin(() => {
      setActiveEmp(emp);
      setPayAmount('');
      setPayNote('');
      setIsPaymentModalOpen(true);
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmp || !payAmount) return;

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amountNum,
      currency: 'AFN',
      note: payNote || 'پرداخت حقوق'
    };

    // Add to global expenses
    addExpense({
      id: newPayment.id,
      date: newPayment.date,
      category: 'حقوق و دستمزد',
      description: `پرداختی به ${activeEmp.fullName} - ${newPayment.note}`,
      amountAFN: amountNum,
      amountUSD: 0,
      amount: amountNum,
      currency: 'AFN'
    });

    const updatedEmp = {
      ...activeEmp,
      payments: [...(activeEmp.payments || []), newPayment]
    };

    const updatedEmployees = employees.map(emp => emp.username === activeEmp.username ? updatedEmp : emp);
    saveToStorage(updatedEmployees);
    setActiveEmp(updatedEmp); // update modal view
    setPayAmount('');
    setPayNote('');
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!activeEmp) return;
    
    // Remove from global expenses
    deleteExpense(paymentId);
    
    // Deleting a payment doesn't require a second pin check since the modal is already secured
    const updatedEmp = {
      ...activeEmp,
      payments: (activeEmp.payments || []).filter(p => p.id !== paymentId)
    };
    
    const updatedEmployees = employees.map(emp => emp.username === activeEmp.username ? updatedEmp : emp);
    saveToStorage(updatedEmployees);
    setActiveEmp(updatedEmp);
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">سیستم منابع انسانی (HR)</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت پرسنل، حساب‌های کاربری، حقوق و پرداخت‌ها (کنترل امنیتی Admin$)</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          افزودن کارمند جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.filter(emp => emp.role !== 'Customer').map((emp, idx) => {
          const totalPaid = (emp.payments || []).reduce((sum, p) => sum + p.amount, 0);
          
          return (
            <div key={idx} className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow ${emp.status === 'Inactive' ? 'opacity-60' : ''}`}>
              <div className={`absolute top-0 right-0 w-2 h-full ${emp.role === 'Owner' || emp.role === 'Manager' ? 'bg-[#D4AF37]' : 'bg-indigo-500'}`}></div>
              
              <div className="flex items-start justify-between mb-4 pl-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${emp.role === 'Owner' || emp.role === 'Manager' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-indigo-50 text-indigo-600'}`}>
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{emp.fullName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className={`w-3.5 h-3.5 ${emp.role === 'Owner' || emp.role === 'Manager' ? 'text-[#D4AF37]' : 'text-indigo-400'}`} />
                      <span className="text-xs font-bold text-slate-500">
                        {emp.role === 'Owner' ? 'مالک سیستم' : emp.role === 'Manager' ? 'مدیر کل' : emp.role === 'Warehouse Staff' ? 'مسئول گدام' : 'صندوق‌دار'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6 border-t border-slate-50 pt-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-xs" dir="ltr">{emp.username}</span>
                  </div>
                  <div className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono border border-slate-200 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-400" /> {emp.passwordHash}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-xs">{emp.phone || 'ثبت نشده'}</span>
                </div>
                
                {/* Financial Summary */}
                <div className="bg-slate-50 rounded-xl p-3 mt-2 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">معاش پایه (AFN)</span>
                    <span className="font-mono font-bold text-slate-700">{emp.baseSalaryAFN?.toLocaleString() || 0}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block font-bold">مجموع پرداختی</span>
                    <span className="font-mono font-bold text-emerald-600">{totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={() => openEdit(emp)} className="flex-1 flex justify-center items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> ویرایش
                </button>
                <button onClick={() => handleDelete(emp.username)} className="flex-1 flex justify-center items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </button>
                <button onClick={() => openPaymentModal(emp)} className="w-full mt-1 flex justify-center items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-xs font-bold transition-colors">
                  <Banknote className="w-4 h-4" /> سیستم حقوق و پرداخت
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl my-auto">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">{editingUsername ? 'ویرایش اطلاعات کارمند' : 'افزودن کارمند جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نام کامل <span className="text-rose-500">*</span></label>
                  <input required type="text" value={empForm.fullName} onChange={e => setEmpForm({...empForm, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نام کاربری <span className="text-rose-500">*</span></label>
                  <input required type="text" disabled={!!editingUsername && (empForm.username === 'admin@stc.com' || empForm.username === 'admin')} dir="ltr" value={empForm.username} onChange={e => setEmpForm({...empForm, username: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رمز عبور <span className="text-rose-500">*</span></label>
                  <input required type="text" dir="ltr" value={empForm.passwordHash} onChange={e => setEmpForm({...empForm, passwordHash: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تلفن تماس</label>
                  <input type="text" dir="ltr" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نقش دسترسی <span className="text-rose-500">*</span></label>
                  <select disabled={empForm.username === 'admin@stc.com'} value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value as UserRole})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 disabled:opacity-50">
                    <option value="Manager">مدیر کل</option>
                    <option value="Cashier">صندوق‌دار / فروشنده</option>
                    <option value="Warehouse Staff">مسئول گدام</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">وضعیت اکانت <span className="text-rose-500">*</span></label>
                  <select disabled={empForm.username === 'admin@stc.com'} value={empForm.status} onChange={e => setEmpForm({...empForm, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 disabled:opacity-50">
                    <option value="Active">فعال</option>
                    <option value="Inactive">غیرفعال (تعلیق)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">معاش پایه / حقوق (AFN)</label>
                <input type="number" dir="ltr" value={empForm.baseSalaryAFN} onChange={e => setEmpForm({...empForm, baseSalaryAFN: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-right" placeholder="0" />
              </div>

              <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl mt-4 cursor-pointer">
                {editingUsername ? 'ذخیره تغییرات' : 'ثبت کارمند'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HR Payment Modal */}
      {isPaymentModalOpen && activeEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 bg-emerald-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black">حقوق و دستمزد کارمند</h2>
                  <p className="text-xs text-emerald-100 opacity-90">{activeEmp.fullName} - {activeEmp.role}</p>
                </div>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-emerald-200 hover:text-white transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Employee Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">معاش پایه ماهانه</span>
                    <div className="text-xl font-black text-slate-800 font-mono">
                      {activeEmp.baseSalaryAFN?.toLocaleString() || 0} <span className="text-xs text-slate-500 font-bold">AFN</span>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <span className="text-[11px] text-emerald-700 font-bold block mb-1">مجموع پرداختی‌های ثبت شده</span>
                    <div className="text-xl font-black text-emerald-800 font-mono">
                      {(activeEmp.payments || []).reduce((sum, p) => sum + p.amount, 0).toLocaleString()} <span className="text-xs text-emerald-600 font-bold">AFN</span>
                    </div>
                  </div>
                </div>
                
                {/* Salary Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-slate-200/60 mt-4">
                  <div className="bg-white rounded-lg p-2 border border-slate-100 text-center shadow-sm">
                    <span className="text-[9px] text-slate-400 font-bold block">ساعتی (تخمینی)</span>
                    <span className="font-mono text-sm font-bold text-slate-700">{Math.round((activeEmp.baseSalaryAFN || 0) / 208).toLocaleString()}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-100 text-center shadow-sm">
                    <span className="text-[9px] text-slate-400 font-bold block">روزانه (تخمینی)</span>
                    <span className="font-mono text-sm font-bold text-slate-700">{Math.round((activeEmp.baseSalaryAFN || 0) / 26).toLocaleString()}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-100 text-center shadow-sm">
                    <span className="text-[9px] text-slate-400 font-bold block">هفتگی</span>
                    <span className="font-mono text-sm font-bold text-slate-700">{Math.round((activeEmp.baseSalaryAFN || 0) / 4.33).toLocaleString()}</span>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100 text-center shadow-sm">
                    <span className="text-[9px] text-indigo-500 font-bold block">سالانه</span>
                    <span className="font-mono text-sm font-bold text-indigo-700">{((activeEmp.baseSalaryAFN || 0) * 12).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Record New Payment */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  ثبت پرداختی جدید
                </h3>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی (AFN)</label>
                      <input required type="number" dir="ltr" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-right font-mono text-lg font-bold" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">بابت (توضیحات)</label>
                      <input required type="text" value={payNote} onChange={e => setPayNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500" placeholder="مثال: حقوق برج جوزا، مساعده..." />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" /> ثبت پرداختی
                  </button>
                </form>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                  <CalendarClock className="w-4 h-4 text-slate-500" />
                  تاریخچه پرداختی‌ها
                </h3>
                {(!activeEmp.payments || activeEmp.payments.length === 0) ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold">هیچ پرداختی تا کنون ثبت نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...activeEmp.payments].reverse().map((pay) => (
                      <div key={pay.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-emerald-200 transition-colors shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm mb-1">{pay.note}</span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md self-start">
                            {new Date(pay.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <span className="font-mono font-black text-emerald-600 text-lg">{pay.amount.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 font-bold mr-1">AFN</span>
                          </div>
                          <button onClick={() => handleDeletePayment(pay.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer" title="حذف تراکنش">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance History */}
              <div className="pt-4 border-t border-slate-200 mt-6">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                  <CalendarClock className="w-4 h-4 text-indigo-500" />
                  سوابق حضور و غیاب (Clock In / Clock Out)
                </h3>
                {(!activeEmp.timeRecords || activeEmp.timeRecords.length === 0) ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-sm font-bold">هیچ رکورد حضوری برای این کارمند ثبت نشده است.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {[...activeEmp.timeRecords].reverse().map((record) => (
                      <div key={record.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm gap-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-xs mb-1">
                            {new Date(record.date).toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-600">ورود</span>
                            <span className="text-slate-700">{new Date(record.clockInTime).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div className="w-4 h-[1px] bg-slate-300"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-rose-600">خروج</span>
                            <span className="text-slate-700">{record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) : 'در حال کار'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {adminPinModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تایید هویت مدیریت</h3>
            <p className="text-slate-500 text-sm mb-8">برای اعمال تغییرات و دسترسی به اطلاعات مالی پرسنل، رمز عبور ادمین را وارد کنید.</p>
            
            <input 
              type="password" 
              placeholder="رمز عبور..." 
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  verifyPinAndExecute();
                }
              }}
              className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] focus:outline-none transition-colors mb-2 ${
                pinError ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-slate-200 focus:border-[#0B1F3A]'
              }`}
              dir="ltr"
              autoFocus
            />
            {pinError && <p className="text-xs text-rose-500 font-bold mb-6">رمز عبور اشتباه است!</p>}
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={verifyPinAndExecute}
                className="flex-1 bg-[#0B1F3A] text-[#D4AF37] py-3.5 rounded-xl font-black hover:bg-[#123B66] transition-colors cursor-pointer"
              >
                تایید
              </button>
              <button 
                onClick={() => setAdminPinModal({ isOpen: false, action: () => {} })}
                className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
