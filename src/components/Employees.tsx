import React from 'react';
import { useAuth } from '../AuthContext';
import { Users, Shield, Plus, Edit, Trash2 } from 'lucide-react';

export const Employees: React.FC = () => {
  const { user } = useAuth();
  
  // Dummy employees list
  const employees = [
    { id: 1, name: 'احمد', role: 'Owner', email: 'admin@stc.com', status: 'فعال' },
    { id: 2, name: 'محمود', role: 'Cashier', email: 'cashier@stc.com', status: 'فعال' },
    { id: 3, name: 'کریم', role: 'Warehouse Staff', email: 'stock@stc.com', status: 'غیرفعال' }
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">کارمندان و کاربران</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت پرسنل فروشگاه و تعیین سطح دسترسی</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md">
          <Plus className="w-5 h-5" />
          افزودن کارمند جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 p-6 flex flex-col items-center justify-center border-b border-slate-100 relative">
              <div className="w-20 h-20 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center text-slate-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="mt-4 font-bold text-slate-800 text-lg">{emp.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">{emp.email}</p>
              <span className={`absolute top-4 right-4 text-[10px] px-2 py-1 rounded font-bold ${emp.status === 'فعال' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {emp.status}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-sm text-[#0B1F3A] font-bold mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                سمت: {emp.role}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 flex justify-center items-center gap-1">
                  <Edit className="w-4 h-4" /> ویرایش
                </button>
                <button className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-lg text-sm font-bold hover:bg-rose-100 flex justify-center items-center gap-1">
                  <Trash2 className="w-4 h-4" /> حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
