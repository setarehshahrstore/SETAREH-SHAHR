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
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Hardcoded categories list from earlier version
  const categoriesList: string[] = ['All', 'خواربار و مواد غذایی', 'نوشیدنی‌ها', 'مواد شوینده و بهداشتی', 'لبنیات', 'تنقلات و شیرینی‌جات', 'آرایشی', 'سایر'];

  // Filtered Products
  const filteredProducts = state.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [barcodeDisplayPrice, setBarcodeDisplayPrice] = useState<'Retail' | 'Wholesale' | 'Both' | 'None'>('Retail');
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

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



    </div>
  );
};
