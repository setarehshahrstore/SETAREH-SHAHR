import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { formatCurrency, formatStock, getUnitOptions, decomposeStock } from '../utils';
import { SecurityGateModal } from './SecurityGate';
import { 
  Layers, 
  Plus, 
  Filter, 
  PackageCheck, 
  RefreshCw, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Search,
  MapPin,
  Barcode,
  Printer,
  Package,
  X
} from 'lucide-react';
import { Product, Purchase, PurchaseItem } from '../types';

// High-quality image presets for diverse Afghan markets (sanitary, groceries, dry fruits, spices, carpets)
const IMAGE_PRESETS = [
  { name: '🥫 مواد غذایی و کنسرواجات', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250' },
  { name: '🥤 نوشابه‌ها و مایعات معطر', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { name: '🧼 شامپو و لوازم روانی بهداشتی', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=250' },
  { name: '🥜 میوه جات خشک و خسته‌باب', url: 'https://images.unsplash.com/photo-1514986872470-76d747e29237?auto=format&fit=crop&q=80&w=250' },
  { name: '🌶️ زعفران و ادویه‌جات تند', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' },
  { name: '🌾 برنج باریک، حبوبات و غله', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=250' },
  { name: '🧴 صابون و کرم‌های معطر سنتی', url: 'https://images.unsplash.com/photo-1607006342446-2c93fa80d0d8?auto=format&fit=crop&q=80&w=250' },
  { name: '📦 کارتن و اجناس پکیج عمومی', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=250' }
];

export const Inventory: React.FC = () => {
  const { state, addProduct, editProduct, deleteProduct, deleteProducts, addPurchase } = useAppState();
  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      setIsAddModalOpen(true);
    }
  }, [location]);

  // Editing Product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Canvas barcode print feature states
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [barcodeDisplayPrice, setBarcodeDisplayPrice] = useState<'Retail' | 'Wholesale' | 'Both' | 'None'>('Retail');
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!barcodeProduct || !barcodeCanvasRef.current) return;
    
    const canvas = barcodeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions for high-resolution thermal sticky labels
    canvas.width = 400;
    canvas.height = 245;

    // Background fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative frame
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Enterprise logo emblem
    const storeTitleText = localStorage.getItem('AFG_STORE_NAME') || 'فرشگاه ستاره شهر';
    ctx.fillStyle = '#10b981'; // Professional emerald
    ctx.font = 'bold 13px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(storeTitleText, canvas.width / 2, 28);

    // Divider accent line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 36);
    ctx.lineTo(canvas.width - 15, 36);
    ctx.stroke();

    // Product name handling (supports dynamic Persian/English text layout wraps)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px Tahoma, sans-serif';
    let pName = barcodeProduct.name;
    if (pName.length > 32) {
      pName = pName.slice(0, 29) + '...';
    }
    ctx.fillText(pName, canvas.width / 2, 56);

    // Draw customized 1D scannable barcode lines
    const barcodeY = 74;
    const barcodeHeight = 72;
    const sku = barcodeProduct.sku || 'N/A';
    
    // Seed generator to ensure barcode lines map uniquely per product SKU
    let seed = 0;
    for (let i = 0; sku && i < sku.length; i++) {
      seed += sku.charCodeAt(i) * (i + 1);
    }
    
    const randomWithSeed = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    let startX = 45;
    const availableWidth = canvas.width - 90;
    let currentX = startX;
    
    // Left Start Guard Group
    ctx.fillStyle = '#000000';
    ctx.fillRect(currentX, barcodeY, 3, barcodeHeight); currentX += 5;
    ctx.fillRect(currentX, barcodeY, 1.5, barcodeHeight); currentX += 4;
    ctx.fillRect(currentX, barcodeY, 3, barcodeHeight); currentX += 5;

    const stopGuardX = startX + availableWidth - 20;
    let charIdx = 0;
    let sVal = seed;

    while (currentX < stopGuardX) {
      const charCode = sku.charCodeAt(charIdx % sku.length) || 65;
      sVal = sVal + charCode + charIdx;
      
      const rand = randomWithSeed(sVal);
      const barWidth = rand < 0.3 ? 1.5 : rand < 0.65 ? 3 : rand < 0.9 ? 4.5 : 6;
      const spaceWidth = randomWithSeed(sVal + 0.5) < 0.52 ? 2.5 : 4;

      ctx.fillRect(currentX, barcodeY, barWidth, barcodeHeight);
      currentX += barWidth + spaceWidth;
      charIdx++;
    }

    // Right Stop Guard Group
    currentX = stopGuardX;
    ctx.fillRect(currentX, barcodeY, 3, barcodeHeight); currentX += 5;
    ctx.fillRect(currentX, barcodeY, 1.5, barcodeHeight); currentX += 4;
    ctx.fillRect(currentX, barcodeY, 3, barcodeHeight);

    // Human-scannable SKU below layout
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px Courier New, monospace';
    ctx.fillText(sku, canvas.width / 2, 162);

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(15, 172);
    ctx.lineTo(canvas.width - 15, 172);
    ctx.stroke();

    // Price rendering
    let priceText = '';
    if (barcodeDisplayPrice === 'Retail') {
      priceText = `نرخ پرچون: ${formatCurrency(barcodeProduct.retailPriceAFN, 'AFN')} (${formatCurrency(barcodeProduct.retailPriceUSD, 'USD')})`;
    } else if (barcodeDisplayPrice === 'Wholesale') {
      priceText = `نرخ عمده: ${formatCurrency(barcodeProduct.wholesalePriceAFN, 'AFN')} (${formatCurrency(barcodeProduct.wholesalePriceUSD, 'USD')})`;
    } else if (barcodeDisplayPrice === 'Both') {
      priceText = `تک: ${formatCurrency(barcodeProduct.retailPriceAFN, 'AFN')} ∙ عمده: ${formatCurrency(barcodeProduct.wholesalePriceAFN, 'AFN')}`;
    } else {
      priceText = 'ستاره شهر - گدام انبار مرکزی';
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px Tahoma, sans-serif';
    ctx.fillText(priceText, canvas.width / 2, 194);

    // Header dimensions and threshold warning footnote
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Tahoma, sans-serif';
    ctx.fillText(`شناسه کالا: ${barcodeProduct.id} ∙ واحد پایه: ۱ ${barcodeProduct.baseUnit}`, canvas.width / 2, 214);

    // Tech watermark branding
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px Courier New, monospace';
    ctx.fillText(`STARA SHAHAR ENTERPRISE ERP ∙ 2026`, canvas.width / 2, 230);

  }, [barcodeProduct, barcodeDisplayPrice, state.exchangeRate]);

  // Security Gate validation states
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string, name: string } | null>(null);

  // Custom persistent categories database helper
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('AFG_CUSTOM_CATEGORIES');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return ['مواد بهداشتی و آرایشی', 'نوشیدنی‌ها', 'میوه خشک و خسته‌باب', 'خوارباره و مواد غذایی', 'حبوبات و غلات افغانی'];
  });

  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'خواربار و مواد غذایی', baseUnit: 'دانه',
    image: IMAGE_PRESETS[0].url, location: '',
    wholesalePriceUSD: '1.00', retailPriceUSD: '1.50', costPriceUSD: '0.80', 
    costPriceCarton: '800.00', stockPieces: '0', stockCartons: '0', minStock: '100',
    hasPack: true, packName: 'بسته', packQty: '10',
    hasBox: true, boxName: 'قوطی', boxQty: '100',
    hasCarton: true, cartonName: 'کارتن', cartonQty: '1000',
    minWholesaleQty: '', isDiscounted: false, isBestSeller: false
  });

  const handlePieceCostChange = (val: string) => {
    const pieceCost = parseFloat(val) || 0;
    const multiplier = parseInt(formData.cartonQty) || 1;
    setFormData(prev => ({
      ...prev,
      costPriceUSD: val,
      costPriceCarton: (pieceCost * multiplier).toFixed(2)
    }));
  };

  const handleCartonCostChange = (val: string) => {
    const cartonCost = parseFloat(val) || 0;
    const multiplier = parseInt(formData.cartonQty) || 1;
    setFormData(prev => ({
      ...prev,
      costPriceCarton: val,
      costPriceUSD: (cartonCost / multiplier).toFixed(2)
    }));
  };

  const handlePieceStockChange = (val: string) => {
    const pieces = parseInt(val) || 0;
    const multiplier = parseInt(formData.cartonQty) || 1;
    setFormData(prev => ({
      ...prev,
      stockPieces: val,
      stockCartons: (pieces / multiplier).toFixed(1)
    }));
  };

  const handleCartonStockChange = (val: string) => {
    const cartons = parseFloat(val) || 0;
    const multiplier = parseInt(formData.cartonQty) || 1;
    setFormData(prev => ({
      ...prev,
      stockCartons: val,
      stockPieces: Math.round(cartons * multiplier).toString()
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

  // Restock form states
  const [restockSupplierId, setRestockSupplierId] = useState('');
  const [restockProductId, setRestockProductId] = useState('');
  const [restockUnitKey, setRestockUnitKey] = useState('piece');
  const [restockQty, setRestockQty] = useState('10');
  const [restockPaidUSD, setRestockPaidUSD] = useState('0');

  // Load merged categories list
  const categoriesList = ['All', ...Array.from(new Set([
    ...customCategories, 
    ...state.products.map(p => p.category)
  ]))];

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = customCategoryMode && newCategoryName.trim() ? newCategoryName.trim() : formData.category;
    if (customCategoryMode && finalCategory && !customCategories.includes(finalCategory)) {
      const updated = [...customCategories, finalCategory];
      setCustomCategories(updated);
      localStorage.setItem('AFG_CUSTOM_CATEGORIES', JSON.stringify(updated));
    }

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
      stockInBaseUnits: editingProduct ? editingProduct.stockInBaseUnits : (parseInt(formData.stockPieces) || 0),
      minStockInBaseUnits: parseInt(formData.minStock) || 0,
      location: formData.location,
      units: {
        piece: formData.baseUnit,
        ...(formData.hasPack && { pack: { name: formData.packName, multiplier: parseInt(formData.packQty) || 1 } }),
        ...(formData.hasBox && { box: { name: formData.boxName, multiplier: parseInt(formData.boxQty) || 1 } }),
        ...(formData.hasCarton && { carton: { name: formData.cartonName, multiplier: parseInt(formData.cartonQty) || 1 } })
      },
      minWholesaleQty: parseInt(formData.minWholesaleQty) || undefined,
      isDiscounted: formData.isDiscounted,
      isBestSeller: formData.isBestSeller
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
      costPriceCarton: (p.costPriceUSD * (p.units.carton?.multiplier || 1)).toFixed(2),
      stockPieces: p.stockInBaseUnits.toString(),
      stockCartons: (p.stockInBaseUnits / (p.units.carton?.multiplier || 1)).toFixed(1),
      minStock: p.minStockInBaseUnits.toString(),
      hasPack: !!p.units.pack, packName: p.units.pack?.name || 'بسته', packQty: (p.units.pack?.multiplier || 10).toString(),
      hasBox: !!p.units.box, boxName: p.units.box?.name || 'قوطی', boxQty: (p.units.box?.multiplier || 100).toString(),
      hasCarton: !!p.units.carton, cartonName: p.units.carton?.name || 'کارتن', cartonQty: (p.units.carton?.multiplier || 1000).toString(),
      minWholesaleQty: p.minWholesaleQty ? p.minWholesaleQty.toString() : '',
      isDiscounted: p.isDiscounted || false,
      isBestSeller: p.isBestSeller || false
    });
    setEditingProduct(p);
    setIsAddModalOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockSupplierId || !restockProductId) return;

    const supplier = state.suppliers.find(s => s.id === restockSupplierId)!;
    const product = state.products.find(p => p.id === restockProductId)!;
    const unitOpts = getUnitOptions(product.units);
    const selectedOpt = unitOpts.find(o => o.key === restockUnitKey)!;

    const qty = parseInt(restockQty) || 0;
    const totalUSD = product.costPriceUSD * selectedOpt.multiplier * qty;
    const totalAFN = totalUSD * state.exchangeRate;

    const purchaseItem: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      selectedUnit: selectedOpt.name,
      multiplier: selectedOpt.multiplier,
      quantity: qty,
      costPriceUSD: product.costPriceUSD * selectedOpt.multiplier,
      costPriceAFN: product.costPriceAFN * selectedOpt.multiplier,
      totalUSD,
      totalAFN
    };

    const isPaid = parseFloat(restockPaidUSD) || 0;
    const isPaidAFN = isPaid * state.exchangeRate;

    const newPurchase: Purchase = {
      id: `purch-${Date.now()}`,
      invoiceNo: `KHARID-GAND-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [purchaseItem],
      totalUSD,
      totalAFN,
      paidUSD: isPaid,
      paidAFN: isPaidAFN,
      exchangeRate: state.exchangeRate,
      paymentMethod: isPaid >= totalUSD ? 'Cash' : 'Partial'
    };

    addPurchase(newPurchase);
    setIsRestocking(false);
    setRestockPaidUSD('0');
    setRestockProductId('');
    alert("سند خرید و چارج مجدد گدام با موفقیت ثبت گردید. موجودی گدام به‌روز شد و حساب سوداگر تصفیه متوازن گردید.");
  };



  const handleDeleteProductClick = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setSecurityModalOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (isBulkDeleting && selectedProductIds.length > 0) {
      deleteProducts(selectedProductIds);
      setSecurityModalOpen(false);
      setSelectedProductIds([]);
      setIsBulkDeleting(false);
      alert(`${selectedProductIds.length} محصول با موفقیت از سیستم حذف گردیدند.`);
    } else if (productToDelete) {
      deleteProduct(productToDelete.id);
      setSecurityModalOpen(false);
      setProductToDelete(null);
      alert('محصول با موفقیت پس از تایید رمز عبور ادمین از سیستم حذف گردید.');
    }
  };

  // Advanced multi-criteria search
  const filteredProducts = state.products.filter(p => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    return matchesCategory && (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.location && p.location.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Search and Filters Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-105 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="جستجو کالا (نام، بارکد، صنف، موقعیت)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pr-9 pl-3 text-xs text-right focus:outline-hidden focus:ring-1 focus:ring-emerald-505"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {selectedProductIds.length > 0 && (
              <button
                onClick={() => {
                  setIsBulkDeleting(true);
                  setSecurityModalOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                حذف انتخاب شده‌ها ({selectedProductIds.length})
              </button>
            )}
            <button
              onClick={() => setIsRestocking(!isRestocking)}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              ثبت فرمایش خرید (واردات به گدام)
            </button>
            <button
              onClick={() => { setEditingProduct(null); setIsAddModalOpen(true); }}
              className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              تعریف محصول جدید در سیستم
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 uppercase">صنف کالا:</span>
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 text-xs rounded transition-all font-semibold cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat === 'All' ? 'همه اقلام کالا' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restock dialog overlay standard simulation */}
      {isRestocking && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-lg text-right">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase pb-2 border-b border-slate-200">
            <PackageCheck className="text-emerald-600 w-5 h-5" />
            برگه واردات کالا به گدام (سند خرید مستقیم از سوداگران)
          </h3>
          
          <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs text-slate-755">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">نام سوداگر / تامین‌کننده کالا:</label>
                <select
                  required
                  value={restockSupplierId}
                  onChange={(e) => setRestockSupplierId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-right text-xs focus:outline-hidden"
                >
                  <option value="">-- سوداگر را انتخاب کنید --</option>
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">انتخاب جنس جهت شارژ گدام:</label>
                <select
                  required
                  value={restockProductId}
                  onChange={(e) => setRestockProductId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-right text-xs focus:outline-hidden"
                >
                  <option value="">-- کالا را انتخاب کنید --</option>
                  {state.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {restockProductId && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 font-semibold">بسته‌بندی ارسالی:</label>
                  <select
                    value={restockUnitKey}
                    onChange={(e) => setRestockUnitKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold"
                  >
                    {getUnitOptions(state.products.find(p => p.id === restockProductId)!.units).map(o => (
                      <option key={o.key} value={o.key}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 font-semibold">تعداد واحد ارسالی:</label>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-hidden text-xs font-bold font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 font-semibold">قیمت تمام‌شده به دالر (پایه):</label>
                  <div className="p-1.5 bg-slate-100 border border-slate-200 text-[11px] rounded font-bold text-center font-mono text-emerald-800">
                    ${state.products.find(p => p.id === restockProductId)!.costPriceUSD.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1 text-right">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">کل بدهی ارز دالر به سوداگر:</label>
                <div className="bg-slate-100 p-2 border border-slate-200 text-xs font-bold font-mono rounded text-slate-800 text-left">
                  {restockProductId ? (
                    `$${(state.products.find(p => p.id === restockProductId)!.costPriceUSD * 
                    getUnitOptions(state.products.find(p => p.id === restockProductId)!.units).find(o => o.key === restockUnitKey)!.multiplier * 
                    parseInt(restockQty || '0')).toFixed(2)}`
                  ) : '$0.00'}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">مبلغ تصفیه شده نقدی (دالر):</label>
                <input
                  type="number"
                  step="0.01"
                  value={restockPaidUSD}
                  onChange={(e) => setRestockPaidUSD(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 focus:border-emerald-500 font-mono text-left"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsRestocking(false)}
                className="bg-slate-200 hover:bg-slate-300 px-3.5 py-1.5 rounded-lg cursor-pointer"
              >
                انصراف
              </button>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg cursor-pointer">
                تایید نهایی و چارج انبار
              </button>
            </div>
          </form>
        </div>
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
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} className="hover:text-red-400"><X className="w-5 h-5" /></button>
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
                      <label className="block text-xs font-bold text-slate-600 mb-1">موقعیت گدام</label>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" placeholder="مثال: قفسه A-12" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2 flex justify-between items-center">
                  <span>قیمت‌گذاری ارزی (USD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">تبدیل خودکار قیمت کارتن و دانه فعال است</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">قیمت خرید (فی دانه)</label>
                    <input type="number" step="0.01" required value={formData.costPriceUSD} onChange={e => handlePieceCostChange(e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-800 mb-1">قیمت خرید (کارتن)</label>
                    <input type="number" step="0.01" required value={formData.costPriceCarton} onChange={e => handleCartonCostChange(e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">نرخ فروش عمده</label>
                    <input type="number" step="0.01" required value={formData.wholesalePriceUSD} onChange={e => setFormData({...formData, wholesalePriceUSD: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-left" dir="ltr" />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">حداقل خرید عمده (اختیاری)</label>
                    <input type="number" min="1" value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-left" dir="ltr" placeholder="مثال: 50" />
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">نرخ فروش پرچون</label>
                    <input type="number" step="0.01" required value={formData.retailPriceUSD} onChange={e => setFormData({...formData, retailPriceUSD: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-left" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Initial Stock */}
              {!editingProduct && (
                <div className="space-y-4">
                  <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span>موجودی اولیه در انبار</span>
                    <span className="text-[10px] text-slate-400 font-normal">تبدیل خودکار کارتن و دانه بر اساس تعداد کارتن فعال است</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="block text-xs font-bold text-blue-800 mb-1">موجودی اولیه (تعداد کارتن)</label>
                      <input type="number" step="0.1" value={formData.stockCartons} onChange={e => handleCartonStockChange(e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white font-mono text-left focus:border-blue-500" dir="ltr" />
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <label className="block text-xs font-bold text-blue-800 mb-1">موجودی اولیه (مجموع دانه‌ها)</label>
                      <input type="number" value={formData.stockPieces} onChange={e => handlePieceStockChange(e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white font-mono text-left focus:border-blue-500" dir="ltr" />
                    </div>
                  </div>
                </div>
              )}

              {/* Units */}
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2">واحدهای شمارش و بسته‌بندی</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">واحد پایه (تک)</label>
                    <input type="text" required value={formData.baseUnit} onChange={e => setFormData({...formData, baseUnit: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-[#D4AF37]" placeholder="دانه" />
                  </div>
                  <div className="col-span-1 md:col-span-3 flex flex-wrap gap-4 pt-4 md:pt-0 border-t border-slate-100 md:border-t-0 mt-4 md:mt-0">
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A] cursor-pointer">
                        <input type="checkbox" checked={formData.hasPack} onChange={e => setFormData({...formData, hasPack: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4" />
                        بسته کوچک
                      </label>
                      {formData.hasPack && (
                        <div className="flex items-center gap-2 mt-1">
                          <input type="text" value={formData.packName} onChange={e => setFormData({...formData, packName: e.target.value})} className="w-16 p-1 text-xs border rounded" placeholder="نام" />
                          <span className="text-xs text-slate-500">=</span>
                          <input type="number" min="1" value={formData.packQty} onChange={e => setFormData({...formData, packQty: e.target.value})} className="w-16 p-1 text-xs border rounded" placeholder="تعداد" />
                          <span className="text-[10px] text-slate-400">{formData.baseUnit}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A] cursor-pointer">
                        <input type="checkbox" checked={formData.hasBox} onChange={e => setFormData({...formData, hasBox: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4" />
                        جعبه / قوطی
                      </label>
                      {formData.hasBox && (
                        <div className="flex items-center gap-2 mt-1">
                          <input type="text" value={formData.boxName} onChange={e => setFormData({...formData, boxName: e.target.value})} className="w-16 p-1 text-xs border rounded" placeholder="نام" />
                          <span className="text-xs text-slate-500">=</span>
                          <input type="number" min="1" value={formData.boxQty} onChange={e => setFormData({...formData, boxQty: e.target.value})} className="w-16 p-1 text-xs border rounded" placeholder="تعداد" />
                          <span className="text-[10px] text-slate-400">{formData.baseUnit}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg flex-1">
                      <label className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A] cursor-pointer">
                        <input type="checkbox" checked={formData.hasCarton} onChange={e => setFormData({...formData, hasCarton: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4" />
                        کارتن بزرگ
                      </label>
                      {formData.hasCarton && (
                        <div className="flex items-center gap-2 mt-1">
                          <input type="text" value={formData.cartonName} onChange={e => setFormData({...formData, cartonName: e.target.value})} className="w-16 p-1 text-xs border rounded" placeholder="نام" />
                          <span className="text-xs text-slate-500">=</span>
                          <input type="number" min="1" value={formData.cartonQty} onChange={e => {
                            const newQty = e.target.value;
                            const multiplier = parseInt(newQty) || 1;
                            const costPiece = parseFloat(formData.costPriceUSD) || 0;
                            const stockCartons = parseFloat(formData.stockCartons) || 0;
                            setFormData({
                              ...formData, 
                              cartonQty: newQty,
                              costPriceCarton: (costPiece * multiplier).toFixed(2),
                              stockPieces: Math.round(stockCartons * multiplier).toString()
                            });
                          }} className="w-16 p-1 text-xs border rounded" placeholder="تعداد" />
                          <span className="text-[10px] text-slate-400">{formData.baseUnit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[#D4AF37] font-bold border-b border-slate-100 pb-2">تنظیمات پیشرفته مارکتینگ</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={formData.isDiscounted} onChange={e => setFormData({...formData, isDiscounted: e.target.checked})} className="accent-rose-500 w-5 h-5" />
                    <div>
                      <div className="font-bold text-rose-600 text-sm">لیلام / تخفیف ویژه</div>
                      <div className="text-[10px] text-slate-500">با انتخاب این گزینه برچسب قرمز لیلام روی محصول در فروشگاه نمایش داده می‌شود.</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="accent-amber-500 w-5 h-5" />
                    <div>
                      <div className="font-bold text-amber-600 text-sm">محصول پرفروش</div>
                      <div className="text-[10px] text-slate-500">با انتخاب این گزینه برچسب پرفروش روی محصول در فروشگاه نمایش داده می‌شود.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">لغو</button>
                <button type="submit" className="px-6 py-2.5 bg-[#0B1F3A] text-white rounded-xl font-bold hover:bg-[#123B66] shadow-lg flex items-center gap-2">
                  <Package className="w-5 h-5" /> ذخیره کالا در سیستم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main product levels spreadsheet view */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-x-auto">
        <table className="min-w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10.5px]">
            <tr>
              <th className="p-3.5 text-right w-10">
                <input 
                  type="checkbox"
                  checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="p-3.5 text-right">بارکد SKU</th>
              <th className="p-3.5 text-right">مشخصات کالا</th>
              <th className="p-3.5 text-right">صنف محصول</th>
              <th className="p-3.5 text-right">موجودی تفکیکی گدام</th>
              <th className="p-3.5 text-left">قیمت خرید (افغانی)</th>
              <th className="p-3.5 text-left">نرخ عمده‌فروشی</th>
              <th className="p-3.5 text-left">نرخ تک‌فروشی</th>
              <th className="p-3.5 text-center">وضعیت انبار</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-400 font-bold text-sm">
                  کالایی با فیلترها و عبارت جستجوی فوق پیدا نگردید.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const decomposed = decomposeStock(p.stockInBaseUnits, p.units);
                const isLow = p.stockInBaseUnits <= p.minStockInBaseUnits;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5">
                      <input 
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                          }
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[10px]">{p.sku}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.image || IMAGE_PRESETS[0].url} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200" 
                          referrerPolicy="no-referrer" 
                        />
                        <div>
                          <span className="font-extrabold text-slate-800 block text-sm">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            موقعیت: {p.location || 'گدام مرکزی'} ∙ واحد پایه: ۱ {p.baseUnit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-650 px-2.5 py-1 text-[10.5px] font-bold rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-800 font-mono text-right">
                      <span className="font-extrabold text-emerald-800 block text-xs">{formatStock(p.stockInBaseUnits, p.units)}</span>
                      <span className="text-[10px] text-slate-400 font-sans font-bold">مجموع کسرها: {p.stockInBaseUnits} {p.baseUnit}</span>
                    </td>
                    <td className="p-3.5 text-left font-semibold font-mono">
                      <span className="block text-slate-705">{formatCurrency(p.costPriceAFN, 'AFN')}</span>
                      <span className="block text-[10px] text-slate-400">${p.costPriceUSD.toFixed(2)}</span>
                    </td>
                    <td className="p-3.5 text-left font-semibold font-mono">
                      <span className="block text-slate-705">{formatCurrency(p.wholesalePriceAFN, 'AFN')}</span>
                      <span className="block text-[10px] text-slate-400">${p.wholesalePriceUSD.toFixed(2)}</span>
                    </td>
                    <td className="p-3.5 text-left font-semibold font-mono">
                      <span className="block text-emerald-700">{formatCurrency(p.retailPriceAFN, 'AFN')}</span>
                      <span className="block text-[10px] text-slate-400">${p.retailPriceUSD.toFixed(2)}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      {isLow ? (
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          کمبود موجودی
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded">
                          موجودی کافی
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setBarcodeProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                          title="چاپ لیبل بارکد"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                          title="ویرایش مشخصات"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(p.id, p.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="حذف دائمی کالا"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Security Gate modal popup */}
      <SecurityGateModal 
        isOpen={securityModalOpen}
        onClose={() => {
          setSecurityModalOpen(false);
          setProductToDelete(null);
          setIsBulkDeleting(false);
        }}
        onConfirm={confirmDeleteProduct}
        title={isBulkDeleting ? `حذف دائمی ${selectedProductIds.length} کالا` : `حذف دائمی محصول: ${productToDelete?.name || ''}`}
        description="توجه! با انجام این عملیات، محصول مزبور دائم با تمام موازنه انبار از پایگاه سوابق کسر می‌گردد."
      />

      {/* Printable Barcode Label Canvas Modal */}
      {barcodeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-2xl p-6 max-w-lg w-full text-right shadow-2xl animate-fade-in space-y-5">
            
            <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600 shrink-0" />
                شبیه‌ساز و چاپ لیبل بارکد هوشمند کالا
              </h3>
              <button 
                onClick={() => setBarcodeProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs font-bold"
              >
                ✕ بستن
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800 flex justify-center">
              <canvas 
                ref={barcodeCanvasRef} 
                className="border-2 border-slate-300 dark:border-slate-700 rounded-lg shadow-md max-w-full bg-white"
              />
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">انتخاب نرخ قیمتی روی برچسب:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'Retail', label: 'قیمت پرچون' },
                    { key: 'Wholesale', label: 'قیمت عمده' },
                    { key: 'Both', label: 'هردو نرخ' },
                    { key: 'None', label: 'بدون نرخ' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setBarcodeDisplayPrice(opt.key as any)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-center cursor-pointer ${
                        barcodeDisplayPrice === opt.key
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-normal">
                  این بارکد با محاسبات خطی و کدهای اسکی (ASCII) ثبت شده مطابقت دارد و به همراه نام محصول و قیمت تعیین شده از طریق پرینترهای حرارتی (Thermal Labels) قابل پرینت و اتسال است.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  if (!barcodeCanvasRef.current) return;
                  const dataUrl = barcodeCanvasRef.current.toDataURL('image/jpeg', 1.0);
                  const link = document.createElement('a');
                  link.download = `BARCODE_LABEL_${barcodeProduct.sku}_${barcodeProduct.name.replace(/\s+/g, '_')}.jpg`;
                  link.href = dataUrl;
                  link.click();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                💾 دانلود عکس لیبل
              </button>

              <button
                onClick={() => {
                  if (!barcodeCanvasRef.current) return;
                  const dataUrl = barcodeCanvasRef.current.toDataURL('image/png');
                  const win = window.open("", "_blank");
                  if (win) {
                    win.document.write(`
                      <html>
                        <head>
                          <title>برچسب بارکد - ${barcodeProduct.name}</title>
                          <style>
                            body {
                              margin: 0;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              height: 100vh;
                              background: #fff;
                            }
                            img {
                              max-width: 100%;
                              height: auto;
                            }
                            @media print {
                              body { margin: 0; }
                              img { max-width: 100%; height: auto; page-break-inside: avoid; }
                            }
                          </style>
                        </head>
                        <body onload="window.print(); window.close();">
                          <img src="${dataUrl}" />
                        </body>
                      </html>
                    `);
                    win.document.close();
                  } else {
                    // fall back print instructions
                    alert("از دکمه 'دانلود عکس لیبل' استفاده کنید یا این صفحه را در تب جدید باز کنید تا منوی چاپ مستقیم فعال شود.");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                چاپ مستقیم پرینتر
              </button>

              <button
                onClick={() => setBarcodeProduct(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2 px-3 rounded-xl cursor-pointer"
              >
                انصراف و لغو
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
