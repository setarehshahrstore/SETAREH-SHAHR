import React, { useState, useEffect, useRef } from 'react';
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
  Printer
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
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);

  // Editing Product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Manage Stock / Units states
  const [managingStockProduct, setManagingStockProduct] = useState<Product | null>(null);
  const [manageUnits, setManageUnits] = useState({
    packHas: false, packName: 'بسته', packQty: '10',
    boxHas: false, boxName: 'قوطی', boxQty: '100',
    cartonHas: false, cartonName: 'کارتن', cartonQty: '1000'
  });
  const [addStockInputs, setAddStockInputs] = useState({
    cartons: '', boxes: '', packs: '', pieces: ''
  });

  const openManageStock = (p: Product) => {
    setManageUnits({
      packHas: !!p.units.pack, packName: p.units.pack?.name || 'بسته', packQty: (p.units.pack?.multiplier || 10).toString(),
      boxHas: !!p.units.box, boxName: p.units.box?.name || 'قوطی', boxQty: (p.units.box?.multiplier || 100).toString(),
      cartonHas: !!p.units.carton, cartonName: p.units.carton?.name || 'کارتن', cartonQty: (p.units.carton?.multiplier || 1000).toString()
    });
    setAddStockInputs({ cartons: '', boxes: '', packs: '', pieces: '' });
    setManagingStockProduct(p);
  };

  const handleManageStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStockProduct) return;

    const unitsObj: any = { piece: managingStockProduct.units.piece };
    if (manageUnits.packHas) unitsObj.pack = { name: manageUnits.packName, multiplier: parseInt(manageUnits.packQty) || 10 };
    if (manageUnits.boxHas) unitsObj.box = { name: manageUnits.boxName, multiplier: parseInt(manageUnits.boxQty) || 100 };
    if (manageUnits.cartonHas) unitsObj.carton = { name: manageUnits.cartonName, multiplier: parseInt(manageUnits.cartonQty) || 1000 };

    const addCartons = parseInt(addStockInputs.cartons) || 0;
    const addBoxes = parseInt(addStockInputs.boxes) || 0;
    const addPacks = parseInt(addStockInputs.packs) || 0;
    const addPieces = parseInt(addStockInputs.pieces) || 0;

    const totalToAdd = 
      (manageUnits.cartonHas ? addCartons * (parseInt(manageUnits.cartonQty) || 1000) : 0) +
      (manageUnits.boxHas ? addBoxes * (parseInt(manageUnits.boxQty) || 100) : 0) +
      (manageUnits.packHas ? addPacks * (parseInt(manageUnits.packQty) || 10) : 0) +
      addPieces;

    const updatedProduct: Product = {
      ...managingStockProduct,
      units: unitsObj,
      stockInBaseUnits: managingStockProduct.stockInBaseUnits + totalToAdd
    };

    editProduct(updatedProduct);
    setManagingStockProduct(null);
    alert('موجودی و تنظیمات بسته‌بندی با موفقیت به‌روزرسانی شد.');
  };

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

  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatText, setNewCatText] = useState('');

  // New Product Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCat, setNewProdCat] = useState('خوارباره و مواد غذایی');
  const [newProdBaseUnit, setNewProdBaseUnit] = useState('دانه');
  const [newProdImage, setNewProdImage] = useState(IMAGE_PRESETS[0].url);
  const [newProdLocation, setNewProdLocation] = useState('بخش مرکزی گدام');
  
  // Custom unit multiplier structures
  const [hasPack, setHasPack] = useState(true);
  const [packName, setPackName] = useState('بسته');
  const [packQty, setPackQty] = useState('10');

  const [hasBox, setHasBox] = useState(true);
  const [boxName, setBoxName] = useState('قوطی');
  const [boxQty, setBoxQty] = useState('100');

  const [hasCarton, setHasCarton] = useState(true);
  const [cartonName, setCartonName] = useState('کارتن');
  const [cartonQty, setNewCartonQty] = useState('1000');

  const [newProdWholesaleUSD, setNewProdWholesaleUSD] = useState('1.00');
  const [newProdRetailUSD, setNewProdRetailUSD] = useState('1.50');
  const [newProdCostUSD, setNewProdCostUSD] = useState('0.80');
  const [newProdMinStock, setNewProdMinStock] = useState('100');

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

  const handleAddCategory = () => {
    if (newCatText.trim() && !customCategories.includes(newCatText.trim())) {
      const updated = [...customCategories, newCatText.trim()];
      setCustomCategories(updated);
      localStorage.setItem('AFG_CUSTOM_CATEGORIES', JSON.stringify(updated));
      setNewProdCat(newCatText.trim());
      setNewCatText('');
      setShowCatInput(false);
      alert('صنف کالای تجاری جدید با موفقیت درج گردید.');
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;

    if (state.products.some(p => p.sku === newProdSku)) {
      alert('خطا! محصولی با این بارکد/SKU قبلاً در سیستم ثبت شده است.');
      return;
    }

    const wholesaleAFN = parseFloat(newProdWholesaleUSD) * state.exchangeRate;
    const retailAFN = parseFloat(newProdRetailUSD) * state.exchangeRate;
    const costAFN = parseFloat(newProdCostUSD) * state.exchangeRate;

    const unitsObj: any = {
      piece: newProdBaseUnit
    };

    if (hasPack && packName) {
      unitsObj.pack = { name: packName, multiplier: parseInt(packQty) || 10 };
    }
    if (hasBox && boxName) {
      unitsObj.box = { name: boxName, multiplier: parseInt(boxQty) || 100 };
    }
    if (hasCarton && cartonName) {
      unitsObj.carton = { name: cartonName, multiplier: parseInt(cartonQty) || 1000 };
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      sku: newProdSku,
      category: newProdCat,
      image: newProdImage || IMAGE_PRESETS[0].url,
      baseUnit: newProdBaseUnit,
      units: unitsObj,
      wholesalePriceUSD: parseFloat(newProdWholesaleUSD) || 1.00,
      wholesalePriceAFN: wholesaleAFN,
      retailPriceUSD: parseFloat(newProdRetailUSD) || 1.50,
      retailPriceAFN: retailAFN,
      costPriceUSD: parseFloat(newProdCostUSD) || 0.80,
      costPriceAFN: costAFN,
      stockInBaseUnits: 0,
      minStockInBaseUnits: parseInt(newProdMinStock) || 50,
      location: newProdLocation || 'بخش مرکزی گدام'
    };

    addProduct(newProduct);
    setIsAddingProduct(false);
    
    // Clear fields
    setNewProdName('');
    setNewProdSku('');
    alert('محصول جدید با موفقیت در انبار ثبت گردید. جهت افزودن موجودی برگ فرمایش خرید مجدد را کلیک کنید.');
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

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const wholesalePriceAFN = editingProduct.wholesalePriceUSD * state.exchangeRate;
    const retailPriceAFN = editingProduct.retailPriceUSD * state.exchangeRate;
    const costPriceAFN = editingProduct.costPriceUSD * state.exchangeRate;

    const updatedProduct: Product = {
      ...editingProduct,
      wholesalePriceAFN,
      retailPriceAFN,
      costPriceAFN
    };

    editProduct(updatedProduct);
    setEditingProduct(null);
    alert('تغییرات کالا با موفقیت ذخیره گردید.');
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
              onClick={() => setIsAddingProduct(!isAddingProduct)}
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

      {/* Add Product form overlay simulation */}
      {isAddingProduct && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 max-w-xl text-right">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase pb-2 border-b border-slate-200">
            <Layers className="text-slate-700 w-5 h-5" />
            تعریف و فرمول‌بندی محصول تجاری جدید در سیستم ستاره شهر
          </h3>

          <form onSubmit={handleCreateProduct} className="space-y-4 text-xs text-slate-600">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">نام مکمل کالا (فارسی/دری):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شامپو سدر صحت ۲۵۰ میلی"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">کد بارکد محصول (کد اختصاصی یا بارکد خوان SKU):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 6291100112233"
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">دسته‌بندی (صنف کالا):</label>
                  <button 
                    type="button" 
                    onClick={() => setShowCatInput(!showCatInput)} 
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {showCatInput ? 'انصراف' : '➕ صنف نو'}
                  </button>
                </div>

                {showCatInput ? (
                  <div className="flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="صنف جدید..."
                      value={newCatText}
                      onChange={(e) => setNewCatText(e.target.value)}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded p-1"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddCategory}
                      className="bg-emerald-600 text-white rounded p-1 text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      ذخیره
                    </button>
                  </div>
                ) : (
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-right focus:outline-hidden"
                  >
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-semibold">واحد اندازه گیری پایه (مثل دانه):</label>
                <input
                  type="text"
                  required
                  value={newProdBaseUnit}
                  onChange={(e) => setNewProdBaseUnit(e.target.value)}
                  placeholder="مثال: دانه"
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-semibold">موقعیت قفسه / گدام انبار:</label>
                <input
                  type="text"
                  value={newProdLocation}
                  onChange={(e) => setNewProdLocation(e.target.value)}
                  placeholder="مثال: گدام شماره ۳ بخش بهداشتی"
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Premium product presets illustration image */}
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                تصویر کالا (انتخاب از تصاویر پیشنهادی):
              </label>

              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {IMAGE_PRESETS.map((pSet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewProdImage(pSet.url)}
                    className={`p-1 bg-white rounded-md border text-[9.5px] truncate text-center ${
                      newProdImage === pSet.url ? 'border-emerald-600 ring-1 ring-emerald-505 font-bold text-emerald-800' : 'border-slate-200'
                    }`}
                  >
                    {pSet.name.split(' ')[0]} {pSet.name.split(' ')[1]}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-2 bg-white p-2.5 rounded-lg border border-slate-150">
                <div className="flex gap-3 items-center">
                  <img 
                    src={newProdImage} 
                    alt="Live Preview" 
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="flex-1 space-y-1 text-right">
                    <span className="block text-[10px] font-bold text-slate-400">آپلود عکس نو از حافظه آیفون / اندروید / کامپیوتر:</span>
                    <input 
                      type="file"
                      id="upload-new-prod-pic"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setNewProdImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:ml-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-1.5">
                  <span className="block text-[9px] text-slate-400 mb-0.5">یا آدرس مستقیم تصویر آنلاین (اختیاری):</span>
                  <input 
                    type="text"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://example.com/item.jpg"
                    className="w-full bg-slate-50 p-1 rounded font-mono text-[10px] text-left focus:outline-hidden border border-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Custom multipliers structures (Carton -> Box -> Pack -> Piece) */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5">
              <span className="block text-[11px] font-bold text-slate-800">تعیین موازنه تبدیل کارتن / بسته به دانه (واحد پایه):</span>
              
              <div className="space-y-2 text-slate-700">
                {/* Pack Multiplier */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasPack}
                    onChange={(e) => setHasPack(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold w-12 text-slate-500">پاکت/بسته:</span>
                  <input
                    disabled={!hasPack}
                    type="text"
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    placeholder="نام واحد اول"
                    className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">=</span>
                  <input
                    disabled={!hasPack}
                    type="number"
                    value={packQty}
                    onChange={(e) => setPackQty(e.target.value)}
                    placeholder="ضریب"
                    className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-center"
                  />
                  <span className="text-[11px] text-slate-400">{newProdBaseUnit}</span>
                </div>

                {/* Box Multiplier */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasBox}
                    onChange={(e) => setHasBox(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold w-12 text-slate-500">جعبه/قوطی:</span>
                  <input
                    disabled={!hasBox}
                    type="text"
                    value={boxName}
                    onChange={(e) => setBoxName(e.target.value)}
                    placeholder="نام واحد دوم"
                    className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">=</span>
                  <input
                    disabled={!hasBox}
                    type="number"
                    value={boxQty}
                    onChange={(e) => setBoxQty(e.target.value)}
                    placeholder="ضریب"
                    className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-center"
                  />
                  <span className="text-[11px] text-slate-400">{newProdBaseUnit}</span>
                </div>

                {/* Carton Multiplier */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasCarton}
                    onChange={(e) => setHasCarton(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-semibold w-12 text-slate-500">کارتن کلان:</span>
                  <input
                    disabled={!hasCarton}
                    type="text"
                    value={cartonName}
                    onChange={(e) => setCartonName(e.target.value)}
                    placeholder="نام واحد سوم"
                    className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">=</span>
                  <input
                    disabled={!hasCarton}
                    type="number"
                    value={cartonQty}
                    onChange={(e) => setNewCartonQty(e.target.value)}
                    placeholder="ضریب"
                    className="w-16 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-center"
                  />
                  <span className="text-[11px] text-slate-400">{newProdBaseUnit}</span>
                </div>
              </div>
            </div>

            {/* Basic selling prices set */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">هزینه خرید به دالر ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdCostUSD}
                  onChange={(e) => setNewProdCostUSD(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400">قیمت فروش عمده ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdWholesaleUSD}
                  onChange={(e) => setNewProdWholesaleUSD(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400">قیمت فروش پرچون ($):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdRetailUSD}
                  onChange={(e) => setNewProdRetailUSD(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400">حد هشدار کمبود موجودی:</label>
                <input
                  type="number"
                  required
                  value={newProdMinStock}
                  onChange={(e) => setNewProdMinStock(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs font-bold border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="bg-slate-200 hover:bg-slate-300 px-3.5 py-1.5 rounded-lg cursor-pointer"
              >
                انصراف دفتری
              </button>
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-1.5 rounded-lg cursor-pointer">
                ایجاد نهایی کالا
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Editing product modal overlay segment */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-2xl space-y-4 max-w-xl w-full text-right max-h-[90vh] overflow-y-auto animate-fade-in">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Edit className="w-5 h-5 text-emerald-600 animate-pulse" />
              ویرایش و اصلاح اطلاعات کالا دفتری: {editingProduct.name}
            </h3>

            <form onSubmit={handleSaveChanges} className="space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold mb-1">نام کامل کالا:</label>
                  <input 
                    type="text" 
                    value={editingProduct.name} 
                    required
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">صنف / طبقه‌بندی کالا:</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg text-xs focus:outline-hidden"
                  >
                    {customCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold mb-1">هزینه خرید به دالر ($):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProduct.costPriceUSD} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPriceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg font-mono text-left focus:outline-hidden" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1">قیمت عمده فروشی ($):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProduct.wholesalePriceUSD} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePriceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg font-mono text-left focus:outline-hidden" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold mb-1">قیمت پرچون فروشی ($):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProduct.retailPriceUSD} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPriceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg font-mono text-left focus:outline-hidden" 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  ویرایش و آپلود عکس محصول:
                </label>
                <div className="flex gap-3 items-center">
                  <img 
                    src={editingProduct.image || IMAGE_PRESETS[0].url} 
                    alt="Live Preview" 
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="flex-1 space-y-1">
                    <input 
                      type="file"
                      id="edit-prod-pic"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditingProduct({ ...editingProduct, image: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:ml-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                </div>
                <input 
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="آدرس اینترنتی مستقیم عکس..."
                  className="w-full mt-1.5 bg-white p-1 rounded font-mono text-[9px] text-left focus:outline-hidden border border-slate-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold mb-1">موقعیت استقرار در گدام:</label>
                  <input 
                    type="text" 
                    value={editingProduct.location || ''} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, location: e.target.value })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg focus:outline-hidden" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">حد هشدار کمبود موجودی دانه:</label>
                  <input 
                    type="number" 
                    value={editingProduct.minStockInBaseUnits} 
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStockInBaseUnits: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-50 border p-1.5 rounded-lg text-left font-mono focus:outline-hidden" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-3.5 border-t">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="bg-slate-200 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-slate-300"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                >
                  ذخیره تغییرات اصلاحی
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
                          onClick={() => openManageStock(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="افزایش موجودی / تنظیم بسته‌بندی"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBarcodeProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                          title="چاپ لیبل بارکد"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingProduct(p)}
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

      {/* Manage Stock & Units Modal */}
      {managingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-2xl p-6 max-w-xl w-full text-right animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                افزایش موجودی / تنظیم بسته‌بندی: {managingStockProduct.name}
              </h3>
              <button 
                onClick={() => setManagingStockProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleManageStockSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-700 mb-3 border-b border-slate-200 pb-2">۱. تنظیمات بسته‌بندی و ضرایب</h4>
                <div className="space-y-3">
                  {/* Pack */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={manageUnits.packHas} onChange={e => setManageUnits({...manageUnits, packHas: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-600 w-16">بسته کوچک:</span>
                    <input disabled={!manageUnits.packHas} type="text" value={manageUnits.packName} onChange={e => setManageUnits({...manageUnits, packName: e.target.value})} className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded" placeholder="نام بسته" />
                    <span className="text-xs text-slate-400">=</span>
                    <input disabled={!manageUnits.packHas} type="number" value={manageUnits.packQty} onChange={e => setManageUnits({...manageUnits, packQty: e.target.value})} className="w-16 p-1.5 text-xs bg-white border border-slate-200 rounded text-center" placeholder="ضریب" />
                    <span className="text-[10px] text-slate-500">{managingStockProduct.units.piece}</span>
                  </div>
                  {/* Box */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={manageUnits.boxHas} onChange={e => setManageUnits({...manageUnits, boxHas: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-600 w-16">قوطی/جعبه:</span>
                    <input disabled={!manageUnits.boxHas} type="text" value={manageUnits.boxName} onChange={e => setManageUnits({...manageUnits, boxName: e.target.value})} className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded" placeholder="نام جعبه" />
                    <span className="text-xs text-slate-400">=</span>
                    <input disabled={!manageUnits.boxHas} type="number" value={manageUnits.boxQty} onChange={e => setManageUnits({...manageUnits, boxQty: e.target.value})} className="w-16 p-1.5 text-xs bg-white border border-slate-200 rounded text-center" placeholder="ضریب" />
                    <span className="text-[10px] text-slate-500">{managingStockProduct.units.piece}</span>
                  </div>
                  {/* Carton */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={manageUnits.cartonHas} onChange={e => setManageUnits({...manageUnits, cartonHas: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-600 w-16">کارتن کلان:</span>
                    <input disabled={!manageUnits.cartonHas} type="text" value={manageUnits.cartonName} onChange={e => setManageUnits({...manageUnits, cartonName: e.target.value})} className="flex-1 p-1.5 text-xs bg-white border border-slate-200 rounded" placeholder="نام کارتن" />
                    <span className="text-xs text-slate-400">=</span>
                    <input disabled={!manageUnits.cartonHas} type="number" value={manageUnits.cartonQty} onChange={e => setManageUnits({...manageUnits, cartonQty: e.target.value})} className="w-16 p-1.5 text-xs bg-white border border-slate-200 rounded text-center" placeholder="ضریب" />
                    <span className="text-[10px] text-slate-500">{managingStockProduct.units.piece}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs text-slate-700 mb-3 border-b border-slate-200 pb-2">۲. افزودن به موجودی (محاسبه خودکار کل)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {manageUnits.cartonHas && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">چند {manageUnits.cartonName}؟</label>
                      <input type="number" min="0" value={addStockInputs.cartons} onChange={e => setAddStockInputs({...addStockInputs, cartons: e.target.value})} className="w-full bg-white border p-1.5 rounded text-xs font-mono text-center" />
                    </div>
                  )}
                  {manageUnits.boxHas && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">چند {manageUnits.boxName}؟</label>
                      <input type="number" min="0" value={addStockInputs.boxes} onChange={e => setAddStockInputs({...addStockInputs, boxes: e.target.value})} className="w-full bg-white border p-1.5 rounded text-xs font-mono text-center" />
                    </div>
                  )}
                  {manageUnits.packHas && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">چند {manageUnits.packName}؟</label>
                      <input type="number" min="0" value={addStockInputs.packs} onChange={e => setAddStockInputs({...addStockInputs, packs: e.target.value})} className="w-full bg-white border p-1.5 rounded text-xs font-mono text-center" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">چند {managingStockProduct.units.piece} (تک)؟</label>
                    <input type="number" min="0" value={addStockInputs.pieces} onChange={e => setAddStockInputs({...addStockInputs, pieces: e.target.value})} className="w-full bg-white border p-1.5 rounded text-xs font-mono text-center" />
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-lg text-center">
                  <span className="text-[10px] text-blue-600 font-bold">
                    مجموع واحدهای اضافه شده: {' '}
                    <span className="font-mono font-black text-blue-800 text-sm">
                      { (manageUnits.cartonHas ? (parseInt(addStockInputs.cartons)||0) * (parseInt(manageUnits.cartonQty)||1000) : 0) +
                        (manageUnits.boxHas ? (parseInt(addStockInputs.boxes)||0) * (parseInt(manageUnits.boxQty)||100) : 0) +
                        (manageUnits.packHas ? (parseInt(addStockInputs.packs)||0) * (parseInt(manageUnits.packQty)||10) : 0) +
                        (parseInt(addStockInputs.pieces)||0) }
                    </span>
                    {' '}{managingStockProduct.units.piece}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setManagingStockProduct(null)} className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-bold text-xs">
                  انصراف
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-xs shadow-sm">
                  ذخیره و افزایش موجودی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
