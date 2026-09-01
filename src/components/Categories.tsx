import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Tag, Plus, Edit2, Trash2, X, ShieldAlert, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';
import { Category } from '../types';
import { CATEGORY_VISUALS, getCategoryImage, getCategoryVisual } from '../categoryData';

export const Categories: React.FC = () => {
  const { state, addCategory, editCategory, deleteCategory } = useAppState();
  
  const categories = state.categories || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', imageUrl: '' });

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
    const finalImageUrl = catForm.imageUrl || getCategoryImage(catForm.name);
    if (editingCat) {
      editCategory({ 
        ...editingCat, 
        name: catForm.name, 
        description: catForm.description,
        imageUrl: finalImageUrl
      });
    } else {
      addCategory({ 
        id: Date.now().toString(), 
        name: catForm.name, 
        description: catForm.description,
        imageUrl: finalImageUrl
      });
    }
    setIsModalOpen(false);
    setCatForm({ name: '', description: '', imageUrl: '' });
    setEditingCat(null);
  };

  const handleDelete = (id: string) => {
    requireAdminPin(() => deleteCategory(id));
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ 
      name: cat.name, 
      description: cat.description || '', 
      imageUrl: cat.imageUrl || getCategoryImage(cat.name)
    });
    setIsModalOpen(true);
  };

  // Helper to count products in each category
  const getProductCount = (catName: string) => {
    return state.products.filter(p => p.category === catName).length;
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">دسته‌بندی‌های بصری اجناس</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 mr-9">مدیریت عکس‌ها، نام‌ها و گروه‌های کالا جهت شناسایی آسان توسط مشتریان و خریداران</p>
        </div>
        <button 
          onClick={() => {
            setEditingCat(null);
            setCatForm({ name: '', description: '', imageUrl: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-l from-[#D4AF37] to-[#F5D76E] text-[#0B1F3A] px-5 py-3 rounded-2xl font-black hover:shadow-lg transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          افزودن دسته‌بندی با عکس
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const visual = getCategoryVisual(cat.name);
          const imgSrc = cat.imageUrl || visual.image;
          const count = getProductCount(cat.name);

          return (
            <div key={cat.id || idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative group hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Category Image Header */}
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img 
                  src={imgSrc} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                
                {/* Floating Badges */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  {visual.badge}
                </div>

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-mono font-bold shadow-sm border border-white/10">
                  {count} جنس موجود
                </div>

                <div className="absolute bottom-3 right-3 left-3">
                  <h3 className="font-black text-white text-lg drop-shadow-md leading-tight">{cat.name}</h3>
                  <p className="text-[11px] text-amber-200/90 font-medium line-clamp-1">{visual.dariName}</p>
                </div>
              </div>

              {/* Category Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px] line-clamp-2">
                  {cat.description || visual.description || `اجناس مرغوب ${state.storeConfig?.storeName || "فروشگاه ستاره شهر"}`}
                </p>
                
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4">
                  <button 
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> ویرایش عکس و نام
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                    title="حذف دسته‌بندی"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
           <div className="col-span-full text-center py-16 text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-200">
             <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
             هیچ دسته‌بندی ثبت نشده است. لطفاً یک دسته‌بندی جدید با تصویر اضافه کنید.
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black">{editingCat ? 'ویرایش دسته‌بندی و عکس' : 'افزودن دسته‌بندی جدید با عکس'}</h2>
                  <p className="text-[11px] text-slate-400">تصویر واضح باعث تشخیص فوری کالا توسط مشتریان می‌شود</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نام دسته‌بندی <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  placeholder="مثلاً: نوشیدنی‌ها، مواد پاککاری، میوه خشک..."
                  value={catForm.name} 
                  onChange={e => {
                    const val = e.target.value;
                    const autoImg = !catForm.imageUrl ? getCategoryImage(val) : catForm.imageUrl;
                    setCatForm({ ...catForm, name: val, imageUrl: autoImg });
                  }} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">انتخاب سریع از تصاویر آماده:</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {CATEGORY_VISUALS.slice(0, 8).map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setCatForm({ ...catForm, imageUrl: preset.image, name: catForm.name || preset.name })}
                      className={`relative rounded-xl overflow-hidden border-2 aspect-video group text-right transition-all ${
                        catForm.imageUrl === preset.image ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={preset.image} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1 flex items-end">
                        <span className="text-[9px] font-bold text-white leading-tight">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">لینک مستقیم تصویر (URL)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={catForm.imageUrl} 
                  onChange={e => setCatForm({...catForm, imageUrl: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono text-left focus:outline-none focus:border-amber-500" 
                  dir="ltr"
                />
              </div>

              {/* Preview Box */}
              {catForm.imageUrl && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <img src={catForm.imageUrl} alt="پیش‌نمایش" className="w-16 h-12 object-cover rounded-xl shadow-sm" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">پیش‌نمایش تصویر انتخابی</p>
                    <p className="text-[11px] text-emerald-600 font-medium">این عکس در صفحه اصلی و اپ نمایش داده خواهد شد</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات مختصر</label>
                <textarea 
                  rows={2} 
                  placeholder="توضیحات یا نمونه اجناس این دسته‌بندی..."
                  value={catForm.description} 
                  onChange={e => setCatForm({...catForm, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-[#0B1F3A] text-amber-400 py-3.5 rounded-2xl font-black text-base hover:bg-[#123B66] transition-all shadow-xl">
                  {editingCat ? 'ذخیره تغییرات' : 'ثبت دسته‌بندی با عکس'}
                </button>
              </div>
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
                تایید و حذف
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
