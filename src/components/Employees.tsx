import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Mail, Phone, Plus, X, ShieldAlert, Edit2, Trash2, KeyRound } from 'lucide-react';
import { UserRole } from '../AuthContext';

interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  status?: 'Active' | 'Inactive';
}

const DEFAULT_USERS: AppUser[] = [
  { username: 'admin@stc.com', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active' },
  { username: 'admin', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active' },
  { username: 'manager', passwordHash: 'manager', fullName: 'مدیر کل', role: 'Manager', status: 'Active' },
  { username: 'cashier', passwordHash: 'cashier', fullName: 'صندوق‌دار', role: 'Cashier', status: 'Active' },
  { username: 'warehouse', passwordHash: 'warehouse', fullName: 'مسئول گدام', role: 'Warehouse Staff', status: 'Active' }
];

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  
  const [empForm, setEmpForm] = useState<AppUser>({
    username: '',
    passwordHash: '',
    fullName: '',
    role: 'Cashier',
    phone: '',
    status: 'Active'
  });

  const [adminPinModal, setAdminPinModal] = useState<{ isOpen: boolean, action: () => void }>({ isOpen: false, action: () => {} });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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
      status: 'Active'
    });
    setEditingUsername(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت کارمندان</h1>
          <p className="text-xs text-slate-500 mt-1">مشاهده پرسنل، حساب‌های کاربری و دسترسی‌ها</p>
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
        {employees.filter(emp => emp.role !== 'Customer').map((emp, idx) => (
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
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={() => openEdit(emp)} className="flex-1 flex justify-center items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> ویرایش
              </button>
              <button onClick={() => handleDelete(emp.username)} className="flex-1 flex justify-center items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-bold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">{editingUsername ? 'ویرایش اطلاعات کارمند' : 'افزودن کارمند جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
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

              <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl mt-4">
                {editingUsername ? 'ذخیره تغییرات' : 'ثبت کارمند'}
              </button>
            </form>
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
            <p className="text-slate-500 text-sm mb-8">برای اعمال تغییرات در پرسنل، رمز عبور ادمین را وارد کنید.</p>
            
            <input 
              type="password" 
              placeholder="رمز عبور..." 
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
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
                className="flex-1 bg-[#0B1F3A] text-[#D4AF37] py-3.5 rounded-xl font-black hover:bg-[#123B66] transition-colors"
              >
                تایید
              </button>
              <button 
                onClick={() => setAdminPinModal({ isOpen: false, action: () => {} })}
                className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
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
