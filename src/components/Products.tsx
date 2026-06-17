import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { Product } from '../types';
import { 
  Package, Plus, Search, Filter, Edit, Trash2, Printer, 
  Image as ImageIcon, X, AlertCircle, Barcode
} from 'lucide-react';
import { SecurityGateModal } from './SecurityGate';

const IMAGE_PRESETS = [
  { name: 'آیتم عمومی', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=250' },
  { name: 'مواد غذایی', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250' },
  { name: 'نوشیدنی‌ها', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { name: 'مواد بهداشتی', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=250' }
];

export const Products: React.FC = () => {
  const { state, addProduct, editProduct, deleteProduct } = useAppState();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Hardcoded categories list from earlier version
  const categoriesList: string[] = ['All', 'خواربار و مواد غذایی', 'نوشیدنی‌ها', 'مواد شوینده و بهداشتی', 'لبنیات', 'تنقلات و شیرینی‌جات', 'آرایشی', 'سایر'];

  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [barcodeDisplayPrice, setBarcodeDisplayPrice] = useState<'Retail' | 'Wholesale' | 'Both' | 'None'>('Retail');
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // New Product State
  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'خواربار و مواد غذایی', baseUnit: 'دانه',
    image: IMAGE_PRESETS[0].url, location: '',
    wholesalePriceUSD: '1.00', retailPriceUSD: '1.50', costPriceUSD: '0.80', minStock: '100'
  });

  const handlePieceCostChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      costPriceUSD: val
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Products
  const filteredProducts = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = customCategoryMode && newCategoryName.trim() ? newCategoryName.trim() : formData.category;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `PROD-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      category: finalCategory,
      image: formData.image,
      baseUnit: formData.baseUnit,
      wholesalePriceUSD: parseFloat(formData.wholesalePriceUSD) || 0,
      wholesalePriceAFN: (parseFloat(formData.wholesalePriceUSD) || 0) * state.exchangeRate,
      retailPriceUSD: parseFloat(formData.retailPriceUSD) || 0,
      retailPriceAFN: (parseFloat(formData.retailPriceUSD) || 0) * state.exchangeRate,
      costPriceUSD: parseFloat(formData.costPriceUSD) || 0,
      costPriceAFN: (parseFloat(formData.costPriceUSD) || 0) * state.exchangeRate,
      stockInBaseUnits: editingProduct ? editingProduct.stockInBaseUnits : 0,
      minStockInBaseUnits: parseInt(formData.minStock) || 0,
      location: formData.location,
      units: editingProduct ? editingProduct.units : {
        piece: formData.baseUnit
      }
    };

    if (editingProduct) {
      editProduct(newProduct);
    } else {
      addProduct(newProduct);
    }
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const openEdit = (p: Product) => {
    setFormData({
      name: p.name, sku: p.sku, category: p.category, baseUnit: p.baseUnit,
      image: p.image, location: p.location || '',
      wholesalePriceUSD: p.wholesalePriceUSD.toString(),
      retailPriceUSD: p.retailPriceUSD.toString(),
      costPriceUSD: p.costPriceUSD.toString(),
      minStock: p.minStockInBaseUnits.toString()
    });
    setEditingProduct(p);
    setIsAddModalOpen(true);
  };

  // Barcode Render
  useEffect(() => {
    if (!barcodeProduct || !barcodeCanvasRef.current) return;
    const canvas = barcodeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400; canvas.height = 245;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0B1F3A'; ctx.lineWidth = 2; ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    ctx.fillStyle = '#2E7D5B'; ctx.font = 'bold 13px Tahoma, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر', canvas.width / 2, 28);
    
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 15px Tahoma, sans-serif';
    ctx.fillText(barcodeProduct.name.length > 32 ? barcodeProduct.name.slice(0, 29) + '...' : barcodeProduct.name, canvas.width / 2, 56);

    // Simplified dummy barcode draw for visual effect
    let currentX = 45;
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 40; i++) {
      const barWidth = Math.random() > 0.5 ? 2 : 4;
      ctx.fillRect(currentX, 74, barWidth, 72);
      currentX += barWidth + (Math.random() > 0.5 ? 2 : 4);
    }

    ctx.fillStyle = '#334155'; ctx.font = 'bold 11px Courier New';
    ctx.fillText(barcodeProduct.sku, canvas.width / 2, 162);

    let priceText = '';
    if (barcodeDisplayPrice === 'Retail') priceText = `نرخ پرچون: ${formatCurrency(barcodeProduct.retailPriceAFN, 'AFN')}`;
    else if (barcodeDisplayPrice === 'Wholesale') priceText = `نرخ عمده: ${formatCurrency(barcodeProduct.wholesalePriceAFN, 'AFN')}`;
    else priceText = 'ستاره شهر - گدام انبار مرکزی';
    
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 13px Tahoma, sans-serif';
    ctx.fillText(priceText, canvas.width / 2, 194);
  }, [barcodeProduct, barcodeDisplayPrice, state.exchangeRate]);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت محصولات</h1>
          <p className="text-xs text-slate-500 mt-1">لیست اجناس، قیمت‌گذاری و چاپ بارکد</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          افزودن محصول جدید
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام کالا یا بارکد..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[#D4AF37]"
          >
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'همه دسته‌بندی‌ها' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">کالا</th>
                <th className="px-4 py-4">دسته‌بندی</th>
                <th className="px-4 py-4">بارکد (SKU)</th>
                <th className="px-4 py-4">نرخ عمده</th>
                <th className="px-4 py-4">نرخ پرچون</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">هیچ محصولی یافت نشد.</td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 font-mono text-slate-500" dir="ltr">{p.sku}</td>
                    <td className="px-4 py-3 font-bold text-[#0B1F3A]">{formatCurrency(p.wholesalePriceAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-bold text-[#2E7D5B]">{formatCurrency(p.retailPriceAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setBarcodeProduct(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="چاپ بارکد">
                          <Barcode className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setProductToDelete(p)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Print Modal */}
      {barcodeProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#0B1F3A] flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Printer className="w-5 h-5" /> چاپ لیبل بارکد</h3>
              <button onClick={() => setBarcodeProduct(null)} className="hover:text-red-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 bg-slate-50 flex flex-col items-center">
              <div className="bg-white p-4 shadow-md border border-slate-200 rounded-xl mb-6">
                <canvas ref={barcodeCanvasRef} className="max-w-full" />
              </div>
              <div className="flex gap-2">
                <select value={barcodeDisplayPrice} onChange={e => setBarcodeDisplayPrice(e.target.value as any)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold">
                  <option value="Retail">نمایش نرخ پرچون</option>
                  <option value="Wholesale">نمایش نرخ عمده</option>
                  <option value="Both">نمایش هر دو نرخ</option>
                  <option value="None">بدون نمایش قیمت</option>
                </select>
                <button className="bg-[#D4AF37] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#B8942E] flex items-center gap-2">
                  <Printer className="w-4 h-4" /> چاپ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal using SecurityGate */}
      {productToDelete && (
        <SecurityGateModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => {
            deleteProduct(productToDelete.id);
            setProductToDelete(null);
          }}
          title="حذف کالا از سیستم"
          description={`آیا مطمئن هستید که می‌خواهید "${productToDelete.name}" را حذف کنید؟ این عمل غیرقابل بازگشت است و ممکن است روی گزارش‌های مالی تاثیر بگذارد.`}
        />
      )}

      {/* Add/Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto pt-10 pb-20">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative">
            <div className="p-4 bg-[#0B1F3A] flex justify-between items-center text-white sticky top-0 z-10">
              <h3 className="font-bold flex items-center gap-2">
                <Package className="w-5 h-5" /> 
                {editingProduct ? 'ویرایش کالا' : 'ثبت کالای جدید'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:text-red-400"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2">اطلاعات اولیه و تصویر</h4>
                
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden bg-slate-50 relative group cursor-pointer">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImageIcon className="text-white w-6 h-6" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">نام محصول</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" placeholder="مثال: شامپو صحت" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">بارکد (SKU)</label>
                      <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37] font-mono text-left" dir="ltr" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-slate-600">دسته‌بندی</label>
                        <button type="button" onClick={() => setCustomCategoryMode(!customCategoryMode)} className="text-[10px] text-blue-600 font-bold hover:underline">
                          {customCategoryMode ? 'انتخاب از لیست' : 'افزودن دسته‌بندی جدید'}
                        </button>
                      </div>
                      {customCategoryMode ? (
                        <input type="text" required placeholder="نام دسته‌بندی جدید..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" />
                      ) : (
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]">
                          {categoriesList.filter(c=>c!=='All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">واحد پایه (تک)</label>
                      <input type="text" required value={formData.baseUnit} onChange={e => setFormData({...formData, baseUnit: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" placeholder="دانه" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">حداقل موجودی مجاز</label>
                      <input type="number" required value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2">قیمت‌گذاری ارزی (USD)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">قیمت خرید (فی دانه)</label>
                    <input type="number" step="0.01" required value={formData.costPriceUSD} onChange={e => handlePieceCostChange(e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">نرخ فروش عمده</label>
                    <input type="number" step="0.01" required value={formData.wholesalePriceUSD} onChange={e => setFormData({...formData, wholesalePriceUSD: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-left" dir="ltr" />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">نرخ فروش پرچون</label>
                    <input type="number" step="0.01" required value={formData.retailPriceUSD} onChange={e => setFormData({...formData, retailPriceUSD: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-left" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">لغو</button>
                <button type="submit" className="px-6 py-2.5 bg-[#0B1F3A] text-white rounded-xl font-bold hover:bg-[#123B66] shadow-lg flex items-center gap-2">
                  <Package className="w-5 h-5" /> ذخیره کالا در سیستم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
