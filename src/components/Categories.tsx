import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Tag, Plus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';
import { Category } from '../types';

export const Categories: React.FC = () => {
  const { state, addCategory, editCategory, deleteCategory } = useAppState();
  
  const categories = state.categories || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  const [adminPinModal, setAdminPinModal] = useState<{ isOpen: boolean, action: () => void }>({ isOpen: false, action: () => {} });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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
    if (editingCat) {
      editCategory({ ...editingCat, name: catForm.name, description: catForm.description });
    } else {
      addCategory({ id: Date.now().toString(), name: catForm.name, description: catForm.description });
    }
    setIsModalOpen(false);
    setCatForm({ name: '', description: '' });
    setEditingCat(null);
  };

  const handleDelete = (id: string) => {
    requireAdminPin(() => deleteCategory(id));
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">دسته‌بندی محصولات</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت گروه‌ها و کتگوری‌های کالا</p>
        </div>
        <button 
          onClick={() => {
            setEditingCat(null);
            setCatForm({ name: '', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          افزودن دسته‌بندی جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div key={cat.id || idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">{cat.name}</h3>
            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{cat.description || 'بدون توضیحات'}</p>
            
            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
              <button 
                onClick={() => openEdit(cat)}
                className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> ویرایش
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
           <div className="col-span-full text-center py-12 text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">
             هیچ دسته‌بندی ثبت نشده است. لطفاً یک دسته‌بندی جدید اضافه کنید.
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">{editingCat ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نام دسته‌بندی <span className="text-rose-500">*</span></label>
                <input required type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">توضیحات</label>
                <textarea rows={3} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl mt-4">
                {editingCat ? 'ذخیره تغییرات' : 'ثبت دسته‌بندی'}
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
            <p className="text-slate-500 text-sm mb-8">برای حذف، رمز عبور ادمین را وارد کنید.</p>
            
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
