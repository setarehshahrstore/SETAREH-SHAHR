import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency, getUnitOptions } from '../utils';
import { 
  Scan, 
  Sparkles, 
  ShoppingBag, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Trash2, 
  Hash, 
  Search, 
  Filter, 
  Tag, 
  Layers,
  AlertTriangle,
  FolderPlus,
  Edit2,
  Lock,
  Users
} from 'lucide-react';
import { Sale, SaleItem, Product } from '../types';

// Image presets for new quick product additions
const QUICK_PRESETS = [
  { name: '🥫 مواد غذایی', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250' },
  { name: '🥤 نوشابه و مایعات', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { name: '🧼 مواد بهداشتی', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=250' },
  { name: '🥜 میوه خشک', url: 'https://images.unsplash.com/photo-1514986872470-76d747e29237?auto=format&fit=crop&q=80&w=250' },
  { name: '🌶️ ادویه‌جات', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' },
  { name: '📦 مال پکیج عمومی', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=250' }
];

export const POS: React.FC = () => {
  const { state, addSale, addProduct, editSale, deleteSale, deleteSales, addCustomer } = useAppState();
  
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [posSubTab, setPosSubTab] = useState<'POS' | 'Invoices'>('POS');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [editingInvoice, setEditingInvoice] = useState<Sale | null>(null);
  const [deletingSale, setDeletingSale] = useState<Sale | null>(null);
  const [changeConfirmData, setChangeConfirmData] = useState<{ changeAFN: number, method: 'Cash' | 'Credit' } | null>(null);

  // Scanned checkout items state
  const [posItems, setPosItems] = useState<Array<{
    productId: string;
    unitKey: string;
    quantity: number;
    mixedCartons?: number;
    mixedPieces?: number;
    customPriceAFN?: number;
  }>>([]);

  // Security Modal State
  const [securityAction, setSecurityAction] = useState<{
    type: 'remove' | 'editPrice';
    productId: string;
    unitKey: string;
    targetPriceAFN?: number;
  } | null>(null);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const DEFAULT_PIN = '1234';

  const [customerType, setCustomerType] = useState<'Retail' | 'Wholesale'>('Retail');
  const [customerId, setCustomerId] = useState<string>('walk-in');
  const [skuSearchInput, setSkuSearchInput] = useState<string>('');

  // Discounts and Printable Invoice Receipts
  const [completedSaleForInvoice, setCompletedSaleForInvoice] = useState<Sale | null>(null);
  const [discountType, setDiscountType] = useState<'Percentage' | 'Amount'>('Percentage');
  const [discountValue, setDiscountValue] = useState<string>('0');
  
  // Advanced touch grid filters
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posFilterCat, setPosFilterCat] = useState('All');

  // Mixed Currency checkout paid figures
  const [paidUSD, setPaidUSD] = useState<string>('0');
  const [paidAFN, setPaidAFN] = useState<string>('0');
  
  // Audio Feedback
  const audioContextRef = useRef<AudioContext | null>(null);

  // Scan detection indicator
  const [scanTargetName, setScanTargetName] = useState<string | null>(null);

  // Quick Register Modal popup states
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickSku, setQuickSku] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickCat, setQuickCat] = useState('خوارباره و مواد غذایی');
  const [quickBaseUnit, setQuickBaseUnit] = useState('دانه');
  const [quickCost, setQuickCost] = useState('0.80');
  const [quickWholesale, setQuickWholesale] = useState('1.00');
  const [quickRetail, setQuickRetail] = useState('1.50');
  const [quickImageUrl, setQuickImageUrl] = useState(QUICK_PRESETS[0].url);

  const [quickCustomCatOpen, setQuickCustomCatOpen] = useState(false);
  const [quickCustomCatText, setQuickCustomCatText] = useState('');

  // Quick Customer Modal
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', company: '' });

  // Local storage custom categories load
  const [localCategories, setLocalCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('AFG_CUSTOM_CATEGORIES');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return ['مواد بهداشتی و آرایشی', 'نوشیدنی‌ها', 'میوه خشک و خسته‌باب', 'خوارباره و مواد غذایی', 'حبوبات و غلات افغانی'];
  });

  const categories = ['All', ...Array.from(new Set([
    ...localCategories,
    ...state.products.map(p => p.category)
  ]))];

  // Play beep on scanning success
  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.log("Audio not play", e);
    }
  };

  // Play dual failure tone if unregistered item
  const playFailureBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) { }
  };

  // Trigger barcode search manually or by scan click
  const handleBarcodeScan = (scannedSku: string) => {
    const product = state.products.find(p => p.sku === scannedSku || p.id === scannedSku);
    if (product) {
      playBeep();
      setScanTargetName(product.name);
      setTimeout(() => setScanTargetName(null), 1500);

      // Add to checkout list (default base unit)
      setPosItems(prev => {
        const existing = prev.find(item => item.productId === product.id && item.unitKey === 'piece');
        if (existing) {
          return prev.map(item => 
            (item.productId === product.id && item.unitKey === 'piece')
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { productId: product.id, unitKey: 'piece', quantity: 1 }];
      });
      setSkuSearchInput('');
    } else {
      // Trigger unregistered missing SKU registration prompt
      playFailureBeep();
      setQuickSku(scannedSku);
      setShowQuickRegister(true);
    }
  };

  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSku || !quickName) return;

    const rate = state.exchangeRate;
    const costPriceUSD = parseFloat(quickCost) || 0.80;
    const costPriceAFN = costPriceUSD * rate;
    const wholesalePriceUSD = parseFloat(quickWholesale) || 1.00;
    const wholesalePriceAFN = wholesalePriceUSD * rate;
    const retailPriceUSD = parseFloat(quickRetail) || 1.50;
    const retailPriceAFN = retailPriceUSD * rate;

    // Standard multipliers for packaging (packs/box/carton)
    const unitsObj = {
      piece: quickBaseUnit,
      pack: { name: 'بسته', multiplier: 10 },
      box: { name: 'قوطی', multiplier: 100 },
      carton: { name: 'کارتن', multiplier: 1000 }
    };

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: quickName,
      sku: quickSku,
      category: quickCat,
      image: quickImageUrl || QUICK_PRESETS[0].url,
      baseUnit: quickBaseUnit,
      units: unitsObj,
      wholesalePriceUSD,
      wholesalePriceAFN,
      retailPriceUSD,
      retailPriceAFN,
      costPriceUSD,
      costPriceAFN,
      stockInBaseUnits: 150, // Pre-load 150 base retail units to enable instant checkout of newly registered item
      minStockInBaseUnits: 50,
      location: 'کمکی صندوق'
    };

    addProduct(newProd);
    setShowQuickRegister(false);

    // Dynamic POS checkout cart auto-append!
    setPosItems(prev => [
      ...prev,
      { productId: newProd.id, unitKey: 'piece', quantity: 1 }
    ]);

    // Clear form
    setQuickName('');
    alert(`کالای نو [ ${quickName} ] ثبت سیستم گردید، ۱۵۰ پایه موجودی اولیه به گدام شارژ شد و روی فاکتور صندوق درج گردید!`);
    playBeep();
  };

  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    
    const newId = `c${Date.now()}`;
    addCustomer({
      id: newId,
      name: newCustomerForm.name,
      phone: newCustomerForm.phone || '',
      companyName: newCustomerForm.company || '',
      city: 'نامشخص',
      debtAFN: 0,
      debtUSD: 0
    });
    setCustomerId(newId);
    setIsNewCustomerModalOpen(false);
    setNewCustomerForm({ name: '', phone: '', company: '' });
  };

  const handleAddQuickCustomCat = () => {
    if (quickCustomCatText.trim() && !localCategories.includes(quickCustomCatText.trim())) {
      const updated = [...localCategories, quickCustomCatText.trim()];
      setLocalCategories(updated);
      localStorage.setItem('AFG_CUSTOM_CATEGORIES', JSON.stringify(updated));
      setQuickCat(quickCustomCatText.trim());
      setQuickCustomCatText('');
      setQuickCustomCatOpen(false);
    }
  };

  const updatePOSQty = (productId: string, unitKey: string, newQty: number) => {
    if (newQty <= 0) {
      setPosItems(prev => prev.filter(item => !(item.productId === productId && item.unitKey === unitKey)));
    } else {
      setPosItems(prev => prev.map(item => 
        (item.productId === productId && item.unitKey === unitKey)
          ? { ...item, quantity: newQty }
          : item
      ));
    }
  };

  const handleUnitChange = (productId: string, oldUnitKey: string, newUnitKey: string) => {
    setPosItems(prev => prev.map(item => 
      (item.productId === productId && item.unitKey === oldUnitKey)
        ? { ...item, unitKey: newUnitKey, mixedCartons: 1, mixedPieces: 0 }
        : item
    ));
  };

  const removePOSItem = (productId: string, unitKey: string) => {
    setPosItems(prev => prev.filter(item => !(item.productId === productId && item.unitKey === unitKey)));
  };

  // Calculations
  const calculatedItems = posItems.map(pItem => {
    const prod = state.products.find(p => p.id === pItem.productId)!;
    const unitOpts = getUnitOptions(prod.units);
    
    const hasPackages = unitOpts.length > 1;
    const finalUnitOpts = [...unitOpts];
    if (hasPackages) {
      const packBoxOrCarton = unitOpts.find(o => o.key === 'carton') || unitOpts.find(o => o.key === 'box') || unitOpts.find(o => o.key === 'pack') || { name: 'بسته' };
      finalUnitOpts.push({ key: 'mixed', name: `📦 ترکیبی (${packBoxOrCarton.name} + دانه)`, multiplier: 1 });
    }

    const selUnitOpt = pItem.unitKey === 'mixed'
      ? { key: 'mixed', name: '📦 ترکیبی (کارتن و دانه)', multiplier: 1 }
      : unitOpts.find(o => o.key === pItem.unitKey)!;

    const cartonUnit = unitOpts.find(o => o.key === 'carton') || 
                       unitOpts.find(o => o.key === 'box') || 
                       unitOpts.find(o => o.key === 'pack') || 
                       { key: 'piece', name: prod.baseUnit, multiplier: 1 };
                       
    const cartonMultiplier = cartonUnit.multiplier;
    const cartonName = cartonUnit.name;

    let baseQty = 0;
    let label = '';
    if (pItem.unitKey === 'mixed') {
      const cartons = pItem.mixedCartons !== undefined ? pItem.mixedCartons : 1;
      const pieces = pItem.mixedPieces !== undefined ? pItem.mixedPieces : 0;
      baseQty = (cartons * cartonMultiplier) + pieces;
      label = `ترکیب (${cartons} ${cartonName} + ${pieces} ${prod.baseUnit})`;
    } else {
      baseQty = pItem.quantity * selUnitOpt.multiplier;
      label = `${pItem.quantity} ${selUnitOpt.name}`;
    }

    const basePriceUSD = customerType === 'Wholesale' ? prod.wholesalePriceUSD : prod.retailPriceUSD;
    const basePriceAFN = pItem.customPriceAFN !== undefined ? pItem.customPriceAFN : (customerType === 'Wholesale' ? prod.wholesalePriceAFN : prod.retailPriceAFN);
    const effectiveBasePriceUSD = pItem.customPriceAFN !== undefined ? (pItem.customPriceAFN / state.exchangeRate) : basePriceUSD;

    const totalUSD = effectiveBasePriceUSD * baseQty;
    const totalAFN = basePriceAFN * baseQty;

    const unitPriceUSD = pItem.unitKey === 'mixed' ? effectiveBasePriceUSD : effectiveBasePriceUSD * selUnitOpt.multiplier;
    const unitPriceAFN = pItem.unitKey === 'mixed' ? basePriceAFN : basePriceAFN * selUnitOpt.multiplier;

    return {
      ...pItem,
      product: prod,
      unitOpts: finalUnitOpts,
      selUnitOpt,
      unitPriceUSD,
      unitPriceAFN,
      totalUSD,
      totalAFN,
      baseQty,
      label,
      cartonMultiplier,
      cartonName
    };
  });

  const subtotalUSD = calculatedItems.reduce((sum, item) => sum + item.totalUSD, 0);
  const subtotalAFN = calculatedItems.reduce((sum, item) => sum + item.totalAFN, 0);

  const enteredUSD = parseFloat(paidUSD) || 0;
  const enteredAFN = parseFloat(paidAFN) || 0;

  const discValueNum = parseFloat(discountValue) || 0;
  const discountAFN = discountType === 'Percentage' ? (subtotalAFN * discValueNum) / 100 : discValueNum;
  const discountUSD = discountType === 'Percentage' ? (subtotalUSD * discValueNum) / 100 : discValueNum / state.exchangeRate;

  const finalAFN = Math.max(0, subtotalAFN - discountAFN);
  const finalUSD = Math.max(0, subtotalUSD - discountUSD);

  const totalAmountPaidInAFN = enteredAFN + (enteredUSD * state.exchangeRate);
  const changeDueInAFN = totalAmountPaidInAFN - finalAFN;
  const changeDueInUSD = changeDueInAFN / state.exchangeRate;

  const handlePOSCheckout = (paymentMethod: 'Cash' | 'Credit', skipChangeCheck = false) => {
    if (posItems.length === 0) return;

    if (paymentMethod === 'Cash' && !skipChangeCheck && changeDueInAFN > 0) {
      setChangeConfirmData({ changeAFN: changeDueInAFN, method: paymentMethod });
      return;
    }

    const invoiceNo = `POS-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const custObj = state.customers.find(c => c.id === customerId);
    const customerName = customerId === 'walk-in' ? 'مشتری گذری صندوق' : (custObj?.name || 'مشتری گذری');

    const saleItems: SaleItem[] = calculatedItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      selectedUnit: item.unitKey === 'mixed' ? item.label : item.selUnitOpt.name,
      multiplier: item.unitKey === 'mixed' ? 1 : item.selUnitOpt.multiplier,
      quantity: item.unitKey === 'mixed' ? item.baseQty : item.quantity,
      unitPriceUSD: item.unitKey === 'mixed' ? item.unitPriceUSD : item.unitPriceUSD / item.selUnitOpt.multiplier,
      unitPriceAFN: item.unitKey === 'mixed' ? item.unitPriceAFN : item.unitPriceAFN / item.selUnitOpt.multiplier,
      totalUSD: item.totalUSD,
      totalAFN: item.totalAFN
    }));

    const isCredit = paymentMethod === 'Credit';

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      customerType,
      customerId,
      customerName,
      items: saleItems,
      totalUSD: subtotalUSD,
      totalAFN: subtotalAFN,
      discountUSD,
      discountAFN,
      finalUSD: finalUSD,
      finalAFN: finalAFN,
      paidUSD: isCredit ? 0 : finalUSD,
      paidAFN: isCredit ? 0 : finalAFN,
      tenderedAFN: totalAmountPaidInAFN,
      changeAFN: changeDueInAFN > 0 ? changeDueInAFN : 0,
      paymentMethod: isCredit ? 'Credit' : 'Cash',
      exchangeRate: state.exchangeRate,
      status: 'Completed'
    };

    addSale(newSale);
    setCompletedSaleForInvoice(newSale); // Instantly trigger Printable Invoice Modal
    setPosItems([]);
    setPaidAFN('0');
    setPaidUSD('0');
    setDiscountValue('0');
  };

  // Filtered Products for the Touch Grid Lookup Panel
  const touchSearchProducts = state.products.filter(p => {
    const matchesCat = posFilterCat === 'All' || p.category === posFilterCat;
    const query = posSearchQuery.toLowerCase().trim();
    if (!query) return matchesCat;

    return matchesCat && (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 w-full text-right" dir="rtl">
      
      {/* Sub tabs switcher */}
      <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs justify-between sm:items-center gap-4 no-print">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950 p-2 rounded-xl text-emerald-600">
            <ShoppingBag className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-850 dark:text-slate-100">پیشخوان فروش و مدیریت فاکتورها کابل</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">صندوق فروشگاهی آنی، صدور بل رسید چاپی thermal و اصلاح/حذف اسناد مالی</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setPosSubTab('POS')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              posSubTab === 'POS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-350 hover:text-slate-850 dark:hover:text-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            صندوق فروش (POS)
          </button>
          <button
            onClick={() => {
              setPosSubTab('Invoices');
              setSelectedSaleIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              posSubTab === 'Invoices'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-350 hover:text-slate-850 dark:hover:text-slate-100'
            }`}
          >
            <span>📂</span>
            بایگانی فاکتورها ({state.sales.length})
          </button>
        </div>
      </div>

      {posSubTab === 'POS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Checkout list (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        
        {/* Sku & Barcode input scanning box */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            پیشخوان فروش فوری و مدیریت صندوق (فروشگاه ستاره شهر)
          </label>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Scan className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5" />
              <input
                type="text"
                placeholder="بارکد کالا را اسکن کنید یا بارکد (SKU) جدید جهت ثبت سریع تایپ کنید..."
                value={skuSearchInput}
                onChange={(e) => {
                  setSkuSearchInput(e.target.value);
                  const matchingSku = state.products.find(p => p.sku === e.target.value);
                  if (matchingSku) {
                    handleBarcodeScan(matchingSku.sku);
                  }
                }}
                className="w-full text-xs pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-left"
              />
            </div>
            <button
              onClick={() => {
                if (skuSearchInput) {
                  handleBarcodeScan(skuSearchInput.trim());
                }
              }}
              className="bg-slate-950 text-white rounded-xl px-5 py-2.5 text-xs font-bold hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              اسکن دستی کالا
            </button>
          </div>

          {scanTargetName && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              کالا با موفقیت اسکن شد: {scanTargetName} !
            </div>
          )}
        </div>

        {/* Selected checkout order items list */}
        <div className="border border-slate-100 rounded-xl overflow-hidden min-h-64 flex flex-col">
          <table className="min-w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3">نام و مشخصات کالا</th>
                <th className="p-3">واحد بسته‌بندی</th>
                <th className="p-3">تعداد</th>
                <th className="p-3 text-left">فی قیمت کالا</th>
                <th className="p-3 text-left">مجموع فاکتور (؋)</th>
                <th className="p-3 text-center">ویرایش/حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 flex-1">
              {posItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-24 text-slate-400">
                    <Scan className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>بارکد کالا را اسکن کنید، یا از پنل جستجوی لمسی سمت چپ محصولات را در سبد خرید تفکیک نمایید.</span>
                  </td>
                </tr>
              ) : (
                calculatedItems.map((item) => (
                  <tr key={`${item.productId}-${item.unitKey}`} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <span className="font-bold text-slate-800 block text-xs">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">بارکد: {item.product.sku}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={item.unitKey}
                        onChange={(e) => handleUnitChange(item.productId, item.unitKey, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded p-1 text-[11px] text-slate-800 font-bold"
                      >
                        {item.unitOpts.map(opt => (
                          <option key={opt.key} value={opt.key}>{opt.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      {item.unitKey === 'mixed' ? (
                        <div className="flex items-center gap-1.5 justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold block">{item.cartonName}</span>
                            <input
                              type="number"
                              min="0"
                              value={item.mixedCartons ?? 1}
                              onChange={(e) => {
                                const cartons = parseInt(e.target.value) || 0;
                                setPosItems(prev => prev.map(pi => 
                                  (pi.productId === item.productId && pi.unitKey === 'mixed')
                                    ? { ...pi, mixedCartons: cartons }
                                    : pi
                                ));
                              }}
                              className="w-11 p-1 border border-slate-200 rounded text-center font-bold"
                            />
                          </div>
                          <span className="text-slate-400 font-bold pt-3">+</span>
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-slate-400 font-bold block">دانه ({item.product.baseUnit})</span>
                            <input
                              type="number"
                              min="0"
                              value={item.mixedPieces ?? 0}
                              onChange={(e) => {
                                const pieces = parseInt(e.target.value) || 0;
                                setPosItems(prev => prev.map(pi => 
                                  (pi.productId === item.productId && pi.unitKey === 'mixed')
                                    ? { ...pi, mixedPieces: pieces }
                                    : pi
                                ));
                              }}
                              className="w-11 p-1 border border-slate-200 rounded text-center font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePOSQty(item.productId, item.unitKey, parseInt(e.target.value) || 1)}
                          className="w-12 p-1 border border-slate-300 rounded text-center font-bold"
                        />
                      )}
                      
                      {item.unitKey === 'mixed' && (
                        <span className="block text-[10px] text-emerald-700 text-center mt-1 font-bold">
                          = {item.baseQty} {item.product.baseUnit}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-left">
                      <span className="font-bold text-slate-800 text-xs block">
                        {item.unitKey === 'mixed' ? `${formatCurrency(item.unitPriceAFN * item.cartonMultiplier, 'AFN')} / کارتن` : formatCurrency(item.unitPriceAFN, 'AFN')}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.unitKey === 'mixed' ? `(فی دانه: ${formatCurrency(item.unitPriceAFN, 'AFN')})` : `$${item.unitPriceUSD.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="p-3 text-left font-black text-emerald-800 text-xs">
                      <span>{formatCurrency(item.totalAFN, 'AFN')}</span>
                      <span className="block text-[9px] text-slate-400 font-mono">(${item.totalUSD.toFixed(2)})</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setSecurityAction({ type: 'editPrice', productId: item.productId, unitKey: item.unitKey, targetPriceAFN: item.unitKey === 'mixed' ? item.unitPriceAFN : item.unitPriceAFN / item.selUnitOpt.multiplier })} className="text-emerald-500 hover:text-emerald-700 cursor-pointer" title="تغییر قیمت">
                          <Edit2 className="w-4 h-4 mx-auto" />
                        </button>
                        <button onClick={() => setSecurityAction({ type: 'remove', productId: item.productId, unitKey: item.unitKey })} className="text-rose-500 hover:text-rose-700 cursor-pointer" title="حذف از سبد">
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Live Search & Touch Selection Terminal (Replacing the static simulation panel) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <h4 className="text-xs font-black text-slate-750 flex items-center gap-1.5 uppercase">
              <Layers className="w-4 h-4 text-emerald-600 animate-pulse" />
              ترمینال لمسی فروش و سیستم جستجوی سریع کالا
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">*کلیک روی کارت کالا جهت درج بوق‌دار در سبد</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="جستجو بر اساس مشخصات، بارکد، صنف..."
                value={posSearchQuery}
                onChange={(e) => setPosSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg py-1.5 pr-8 pl-3 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={posFilterCat}
                onChange={(e) => setPosFilterCat(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg py-1.5 px-2 text-xs focus:outline-hidden"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'همه صنف‌ها مکتوب' : c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {touchSearchProducts.map(prod => (
              <button
                key={prod.id}
                onClick={() => handleBarcodeScan(prod.sku)}
                className="bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 transition-all rounded-lg p-2 text-right text-xs flex items-center gap-2.5 shadow-2xs cursor-pointer group"
              >
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="w-10 h-10 rounded object-cover border shrink-0" 
                  referrerPolicy="no-referrer" 
                />
                <div className="truncate flex-1">
                  <span className="font-extrabold text-slate-800 block truncate group-hover:text-emerald-700 leading-snug">{prod.name}</span>
                  <span className="text-[9.5px] text-slate-400 block mt-0.5 leading-none">بارکد: {prod.sku}</span>
                  <span className="text-[10px] font-black text-emerald-800 block mt-1 leading-none">{formatCurrency(prod.retailPriceAFN, 'AFN')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Cash Register Payment Desk (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-105 shadow-sm flex flex-col justify-between text-right">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              تصفیه صندوق و فاکتور نهایی
            </h3>
            <span className="bg-slate-100 text-slate-650 rounded-full px-3 py-0.5 text-[10px] font-black uppercase">
              {customerType === 'Wholesale' ? 'فروش عمده‌فروشی' : 'فروش تک‌فروشی دکان'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-650">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">نوع موازنه فروش صندوق:</label>
                <div className="bg-slate-100 p-1 rounded-lg flex">
                  <button
                    type="button"
                    onClick={() => setCustomerType('Retail')}
                    className={`flex-1 py-1 text-[10.5px] font-bold rounded ${
                      customerType === 'Retail' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    تک‌فروشی
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('Wholesale')}
                    className={`flex-1 py-1 text-[10.5px] font-bold rounded ${
                      customerType === 'Wholesale' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    عمده‌فروشی
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] text-slate-400 font-bold">انتخاب شخص / مشتری:</label>
                  <button 
                    onClick={() => setIsNewCustomerModalOpen(true)}
                    className="text-[9px] text-emerald-500 font-bold hover:text-emerald-400 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> ثبت مشتری جدید
                  </button>
                </div>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-none font-bold"
                >
                  <option value="walk-in">مشتری متفرقه (نقد بدون حساب)</option>
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price figures totals boxes */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2.5 font-mono">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">کل فاکتور نهایی (Dual Currency)</span>
              
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>مجموع ناخالص:</span>
                <span>{formatCurrency(subtotalAFN, 'AFN')} (${subtotalUSD.toFixed(2)})</span>
              </div>

              {discValueNum > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-400 border-t border-slate-800/80 pt-1.5">
                  <span>تخفیف کسر شده ({discountType === 'Percentage' ? `${discValueNum}%` : 'مبلغ'}):</span>
                  <span>-{formatCurrency(discountAFN, 'AFN')} (-${discountUSD.toFixed(2)})</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-sm font-extrabold text-white">
                <span className="text-emerald-400">مجموع قابل پرداخت:</span>
                <span className="text-lg">{formatCurrency(finalAFN, 'AFN')}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>معادل دالر بانکی ($):</span>
                <span>${finalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Discount Control Panel */}
            <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-xl space-y-2 text-right" dir="rtl">
              <span className="block text-[10px] font-extrabold text-emerald-900 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                اعمال تخفیف دستی (درصدی یا پولی):
              </span>
              <div className="flex gap-1.5 items-center">
                <div className="flex rounded-md bg-emerald-100/60 p-0.5 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => { setDiscountType('Percentage'); setDiscountValue('0'); }}
                    className={`px-2 py-1 text-[9px] font-black rounded ${discountType === 'Percentage' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-200/50'}`}
                  >
                    فیصدی (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDiscountType('Amount'); setDiscountValue('0'); }}
                    className={`px-2 py-1 text-[9px] font-black rounded ${discountType === 'Amount' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-200/50'}`}
                  >
                    مبلغ (افغانی)
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-emerald-200 p-1 rounded-md text-xs font-mono text-left focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Dual Paid Tender math splits */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="block text-[10px] font-extrabold text-slate-500">تصفیه موازی پول دریافتی (پرداخت ترکیبی دالر و افغانی):</span>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9.5px] text-slate-400 mb-0.5">دریافتی به دالر ($):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={paidUSD}
                    onChange={(e) => setPaidUSD(e.target.value)}
                    className="w-full bg-white border p-1 text-xs font-mono text-left focus:outline-hidden rounded"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-slate-400 mb-0.5">دریافتی به افغانی (؋):</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAFN}
                    onChange={(e) => setPaidAFN(e.target.value)}
                    className="w-full bg-white border p-1 text-xs font-mono text-left focus:outline-hidden rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[10.5px]">
                <span className="text-slate-400">الباقی مابه‌التفاوت مشتری (بقای پول):</span>
                <span className={`font-mono font-extrabold text-xs ${changeDueInAFN >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {changeDueInAFN >= 0 
                    ? `${formatCurrency(changeDueInAFN, 'AFN')} (${formatCurrency(changeDueInUSD, 'USD')})` 
                    : `کسر پول: ${formatCurrency(Math.abs(changeDueInAFN), 'AFN')} (${formatCurrency(Math.abs(changeDueInUSD), 'USD')})`
                  }
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex gap-2 w-full mt-4">
          <button
            onClick={() => handlePOSCheckout('Cash')}
            disabled={posItems.length === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            تصفیه نقدی صندوق (فروش نقده)
          </button>

          {customerId !== 'walk-in' && (
            <button
              onClick={() => handlePOSCheckout('Credit')}
              disabled={posItems.length === 0}
              className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs py-3 px-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              فاکتور قرضه (ثبت در لجر مشتری)
            </button>
          )}
        </div>
      </div>
    </div>
  ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-805 shadow-sm space-y-6 text-right">
          
          {/* Header & Quick Lookup controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-base">بایگانی کل فاکتورها و تسویه‌ها</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">جستجو، ویرایش مجدد قلم‌های فاکتور، حذف فاکتور و صدور مجدد بل چاپی رسیددهی.</p>
            </div>

            <div className="relative w-full sm:w-72 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="جستجوی شماره فاکتور یا نام مشتری..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 text-right text-slate-705 dark:text-slate-200"
                />
              </div>
              {selectedSaleIds.length > 0 && (
                <button
                  onClick={() => setIsBulkDeleting(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف انتخاب شده‌ها ({selectedSaleIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Invoices Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  <th className="p-3 text-right w-10">
                    <input 
                      type="checkbox"
                      checked={
                        state.sales.filter(sale => {
                          const query = invoiceSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            sale.invoiceNo.toLowerCase().includes(query) ||
                            sale.customerName.toLowerCase().includes(query)
                          );
                        }).length > 0 &&
                        selectedSaleIds.length === state.sales.filter(sale => {
                          const query = invoiceSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            sale.invoiceNo.toLowerCase().includes(query) ||
                            sale.customerName.toLowerCase().includes(query)
                          );
                        }).length
                      }
                      onChange={(e) => {
                        const filteredSales = state.sales.filter(sale => {
                          const query = invoiceSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            sale.invoiceNo.toLowerCase().includes(query) ||
                            sale.customerName.toLowerCase().includes(query)
                          );
                        });
                        if (e.target.checked) {
                          setSelectedSaleIds(filteredSales.map(s => s.id));
                        } else {
                          setSelectedSaleIds([]);
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="p-3">شماره فاکتور</th>
                  <th className="p-3">مشتری</th>
                  <th className="p-3">تاریخ ثبت</th>
                  <th className="p-3">تعداد اقلام</th>
                  <th className="p-3">مبلغ کل فاکتور</th>
                  <th className="p-3">مبلغ پرداخت شده</th>
                  <th className="p-3">حالت تسویه</th>
                  <th className="p-3 text-center">خدمات و چاپ رسید</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {state.sales.filter(sale => {
                  const query = invoiceSearchQuery.toLowerCase().trim();
                  if (!query) return true;
                  return (
                    sale.invoiceNo.toLowerCase().includes(query) ||
                    sale.customerName.toLowerCase().includes(query)
                  );
                }).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">⚠️ هیچ فاکتوری در این آرشیو یافت نشد.</td>
                  </tr>
                ) : (
                  state.sales
                    .filter(sale => {
                      const query = invoiceSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return (
                        sale.invoiceNo.toLowerCase().includes(query) ||
                        sale.customerName.toLowerCase().includes(query)
                      );
                    })
                    .map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-3">
                          <input 
                            type="checkbox"
                            checked={selectedSaleIds.includes(sale.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSaleIds([...selectedSaleIds, sale.id]);
                              } else {
                                setSelectedSaleIds(selectedSaleIds.filter(id => id !== sale.id));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{sale.invoiceNo}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sale.customerName}</td>
                        <td className="p-3 text-slate-505 font-mono">
                          {new Date(sale.date).toLocaleDateString('fa-AF', { hour: '2-digit', minute: '2-digit' } as any)}
                        </td>
                        <td className="p-3 font-bold text-slate-600 dark:text-slate-350">{sale.items.length} قلم</td>
                        <td className="p-3 font-black text-slate-800 dark:text-slate-100">
                          <span className="block text-emerald-805 dark:text-emerald-400">{formatCurrency(sale.finalAFN, 'AFN')}</span>
                          <span className="block text-[10px] text-slate-400 font-sans">${sale.finalUSD.toFixed(1)}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                          <span className="block text-slate-800 dark:text-slate-200">{formatCurrency(sale.paidAFN, 'AFN')}</span>
                          <span className="block text-[10px] text-slate-400 font-sans">${sale.paidUSD.toFixed(1)}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            sale.paymentMethod === 'Credit' ? 'bg-rose-50 text-rose-700 dark:bg-rose-955/30 dark:text-rose-400' :
                            'bg-amber-50 text-amber-900 dark:bg-amber-955/30 dark:text-amber-400'
                          }`}>
                            {sale.paymentMethod === 'Cash' ? 'نقدی (صندوق)' :
                             sale.paymentMethod === 'Credit' ? 'قرضه دفتری' :
                             'قسمتی نقدی و قستی قرضه'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setCompletedSaleForInvoice(sale)}
                              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-955/35 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-lg py-1.5 px-3 text-[11px] font-extrabold cursor-pointer flex items-center gap-1.5 transition-colors"
                              title="چاپ بل و صادر کردن رسید نهایی"
                            >
                              🖨️ چاپ بل رسید
                            </button>

                            <button
                              onClick={() => {
                                setEditingInvoice(JSON.parse(JSON.stringify(sale)));
                              }}
                              className="bg-indigo-50 hover:bg-indigo-150 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-805 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-lg p-1.5 cursor-pointer transition-colors"
                              title="ویرایش قلم‌ها و مقادیر فاکتور"
                            >
                              ✏️ ویرایش
                            </button>

                            <button
                              onClick={() => {
                                setDeletingSale(sale);
                              }}
                              className="bg-rose-50 hover:bg-rose-150 dark:bg-rose-955/20 dark:hover:bg-rose-900/30 text-rose-805 dark:text-rose-400 border border-rose-100 dark:border-rose-900 rounded-lg p-1.5 cursor-pointer transition-colors"
                              title="حذف و برگشت فاکتور"
                            >
                              🗑️ لغو و حذف
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
      )}

      {/* Bulk Delete Sale Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in space-y-4">
            <h3 className="font-extrabold text-rose-600 dark:text-rose-455 text-sm border-b pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
              حذف دسته‌جمعی {selectedSaleIds.length} فاکتور
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا مطمئن هستید که می‌خواهید {selectedSaleIds.length} فاکتور فروش را حذف کنید؟ این عملیات تمام موازنه انبار، بدهکاری‌های مشتریان مرتبط و وجوه صندوق را معکوس و اصلاح می‌کند.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg cursor-pointer font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSales(selectedSaleIds);
                  setSelectedSaleIds([]);
                  setIsBulkDeleting(false);
                  alert(`${selectedSaleIds.length} فاکتور با موفقیت حذف شدند و موازنه سیستم بروزرسانی گردید.`);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg cursor-pointer font-black"
              >
                بله، فاکتورها حذف شوند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Return Confirmation Modal */}
      {changeConfirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in space-y-4">
            <h3 className="font-extrabold text-emerald-600 dark:text-emerald-455 text-sm border-b pb-2 flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-emerald-600 animate-pulse" />
              هشدار بازگشت باقی‌مانده پول
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center py-4 font-bold">
              مبلغ پرداختی مشتری بیشتر از مبلغ فاکتور است. لطفاً مبلغ <span className="text-rose-600 text-lg mx-1">{formatCurrency(changeConfirmData.changeAFN, 'AFN')}</span> را به مشتری بازگردانید.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setChangeConfirmData(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg cursor-pointer font-bold"
              >
                اصلاح مبالغ (بازگشت)
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePOSCheckout(changeConfirmData.method, true);
                  setChangeConfirmData(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-1"
              >
                تایید بازگشت وجه و صدور فاکتور
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Edit Modal Overlay */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-950 border-2 border-indigo-500 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">🔧 ویرایش و اصلاح فاکتور شماره {editingInvoice.invoiceNo}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">شما می‌توانید اقلام، خریدار، نحوه تصفیه و مبالغ پرداختی صندوق را با بازخوانی خودکار گدام اصلاح بفرمایید.</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">بنگاه ستاره شهر</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              {/* Customer selection */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold">مشتری مربوطه:</label>
                <select
                  value={editingInvoice.customerId}
                  onChange={(e) => {
                    const custId = e.target.value;
                    const custName = custId === 'walk-in' ? 'مشتری متفرقه (عابر)' : (state.customers.find(c => c.id === custId)?.name || '');
                    setEditingInvoice({
                      ...editingInvoice,
                      customerId: custId,
                      customerName: custName
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-lg font-bold"
                >
                  <option value="walk-in">مشتری متفرقه (عابر)</option>
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Customer Type purchase level */}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold">کتگوری قیمت گذاری:</label>
                <select
                  value={editingInvoice.customerType}
                  onChange={(e) => {
                    const newType = e.target.value as 'Retail' | 'Wholesale';
                    const updatedItems = editingInvoice.items.map(item => {
                      const prod = state.products.find(p => p.id === item.productId);
                      if (!prod) return item;
                      const activeUnitPriceUSD = newType === 'Wholesale' ? prod.wholesalePriceUSD : prod.retailPriceUSD;
                      const activeUnitPriceAFN = newType === 'Wholesale' ? prod.wholesalePriceAFN : prod.retailPriceAFN;
                      return {
                        ...item,
                        unitPriceUSD: activeUnitPriceUSD,
                        unitPriceAFN: activeUnitPriceAFN,
                        totalUSD: activeUnitPriceUSD * item.quantity,
                        totalAFN: activeUnitPriceAFN * item.quantity
                      };
                    });

                    // Recalculate totals
                    const rawTotalUSD = updatedItems.reduce((acc, i) => acc + i.totalUSD, 0);
                    const rawTotalAFN = updatedItems.reduce((acc, i) => acc + i.totalAFN, 0);
                    
                    setEditingInvoice({
                      ...editingInvoice,
                      customerType: newType,
                      items: updatedItems,
                      totalUSD: rawTotalUSD,
                      totalAFN: rawTotalAFN,
                      finalUSD: Math.max(0, rawTotalUSD - editingInvoice.discountUSD),
                      finalAFN: Math.max(0, rawTotalAFN - editingInvoice.discountAFN)
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-lg"
                >
                  <option value="Retail">پرچون‌فروشی (عادی)</option>
                  <option value="Wholesale">عمده‌فروشی (تخفیفی همکاران)</option>
                </select>
              </div>
            </div>

            {/* Editable Items List inside invoice */}
            <div className="space-y-2 border p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-right">
              <span className="block text-xs font-bold text-slate-850 dark:text-slate-200">کالاهای موجود در فاکتور:</span>
              
              <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1 text-xs">
                {editingInvoice.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{item.productName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">واحد انتخابی: {item.selectedUnit} (هر {item.selectedUnit} = {item.multiplier} دانه)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-bold">تعداد:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          onChange={(e) => {
                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                            const updatedItems = [...editingInvoice.items];
                            updatedItems[idx] = {
                              ...item,
                              quantity: newQty,
                              totalUSD: item.unitPriceUSD * newQty,
                              totalAFN: item.unitPriceAFN * newQty
                            };

                            const rawTotalUSD = updatedItems.reduce((acc, i) => acc + i.totalUSD, 0);
                            const rawTotalAFN = updatedItems.reduce((acc, i) => acc + i.totalAFN, 0);

                            setEditingInvoice({
                              ...editingInvoice,
                              items: updatedItems,
                              totalUSD: rawTotalUSD,
                              totalAFN: rawTotalAFN,
                              finalUSD: Math.max(0, rawTotalUSD - editingInvoice.discountUSD),
                              finalAFN: Math.max(0, rawTotalAFN - editingInvoice.discountAFN)
                            });
                          }}
                          className="w-16 p-1 text-center bg-white dark:bg-slate-800 border rounded-lg font-bold"
                        />
                      </div>

                      <div className="text-left min-w-24">
                        <span className="block font-black text-slate-800 dark:text-slate-100">{formatCurrency(item.unitPriceAFN * item.quantity, 'AFN')}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">${(item.unitPriceUSD * item.quantity).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations & Discounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold">تخفیف دستی افغانی:</label>
                <input
                  type="number"
                  value={editingInvoice.discountAFN}
                  onChange={(e) => {
                    const discountAFNVal = Math.max(0, parseFloat(e.target.value) || 0);
                    const discountUSDVal = discountAFNVal / editingInvoice.exchangeRate;
                    setEditingInvoice({
                      ...editingInvoice,
                      discountAFN: discountAFNVal,
                      discountUSD: discountUSDVal,
                      finalAFN: Math.max(0, editingInvoice.totalAFN - discountAFNVal),
                      finalUSD: Math.max(0, editingInvoice.totalUSD - discountUSDVal)
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-bold">مبلغ نقدی پرداخت شده (به افغانی ؋):</label>
                <input
                  type="number"
                  value={editingInvoice.paidAFN}
                  onChange={(e) => {
                    const paidAFNVal = Math.max(0, parseFloat(e.target.value) || 0);
                    const paidUSDVal = paidAFNVal / editingInvoice.exchangeRate;
                    const finalAFN = editingInvoice.finalAFN;
                    
                    setEditingInvoice({
                      ...editingInvoice,
                      paidAFN: paidAFNVal,
                      paidUSD: paidUSDVal,
                      paymentMethod: paidAFNVal === 0 ? 'Credit' : (paidAFNVal < finalAFN ? 'Partial' : 'Cash')
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border p-2 rounded-lg font-bold text-emerald-800"
                />
              </div>
            </div>

            {/* Calculations summaries display */}
            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 flex justify-between items-center text-xs">
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-500 font-bold block">مجموع پس از کسر تخفیف:</span>
                <span className="text-base font-black text-emerald-800">{formatCurrency(editingInvoice.finalAFN, 'AFN')}</span>
                <span className="block text-[10px] text-slate-400 font-mono">معادل تقریبی دالری: ${editingInvoice.finalUSD.toFixed(1)}</span>
              </div>

              <div className="text-left space-y-1 font-medium">
                <span className="text-[10px] text-slate-400 block">روش تسویه فاکتور:</span>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                  editingInvoice.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800' :
                  editingInvoice.paymentMethod === 'Credit' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {editingInvoice.paymentMethod === 'Cash' ? '✓ نقد کامل (صندوق)' :
                   editingInvoice.paymentMethod === 'Credit' ? '⚠️ قرضه (لیجر مشتری)' :
                   '⏱️ پرداخت قسطی (ترکیبی)'}
                </span>
                <span className="block text-[10px] text-slate-400 font-bold">باقیمانده طلب به افغانی: {formatCurrency(Math.max(0, editingInvoice.finalAFN - editingInvoice.paidAFN), 'AFN')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setEditingInvoice(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  editSale(editingInvoice);
                  setEditingInvoice(null);
                  alert("تغییرات فاکتور با موفقیت ذخیره شد و موازنه مالی صندوق و حسابات بدهی مشتریان مجددا اصلاح گردید.");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 shadow"
              >
                ✓ ثبت تغییرات فاکتور
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Register Modal for Unregistered Barcode scanning */}
      {showQuickRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-emerald-500 shadow-xl p-5 text-right space-y-4">
            
            <div className="flex items-start gap-3.5 pb-2 border-b border-rose-100">
              <AlertTriangle className="w-10 h-10 text-rose-500 shrink-0" />
              <div>
                <h3 className="font-extrabold text-rose-600 text-sm">بارکد یا شناسه کالا پیدا نشد!</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  کالا با بارکد اسکن شده <span className="font-mono bg-slate-100 px-1 rounded text-slate-800 font-bold">{quickSku}</span> هنوز در بانک اطلاعاتی فروشگاه ثبت نشده است. آیا می‌خواهید هم‌اکنون این جنس تجاری را ثبت در سیستم و فاکتور کنید؟
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickRegisterSubmit} className="space-y-4 text-xs text-slate-650">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">نام کامل کالا تجاری:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: آدامس اوربیت نعنایی"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">بارکد یا SKU (ثابت):</label>
                  <input
                    type="text"
                    disabled
                    value={quickSku}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded p-1.5 font-mono text-left cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-400">صنف کالا:</label>
                    <button 
                      type="button" 
                      onClick={() => setQuickCustomCatOpen(!quickCustomCatOpen)} 
                      className="text-[9px] text-emerald-600 font-bold"
                    >
                      {quickCustomCatOpen ? 'بستن' : '➕ صنف نو'}
                    </button>
                  </div>

                  {quickCustomCatOpen ? (
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="صنف نو..."
                        value={quickCustomCatText}
                        onChange={(e) => setQuickCustomCatText(e.target.value)}
                        className="flex-1 bg-white border p-1 rounded text-[10px]"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddQuickCustomCat}
                        className="bg-emerald-600 text-white rounded p-1 text-[11.5px] font-bold"
                      >
                        ذخیره
                      </button>
                    </div>
                  ) : (
                    <select
                      value={quickCat}
                      onChange={(e) => setQuickCat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-right focus:outline-hidden"
                    >
                      {localCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">واحد اندازه‌گیری پایه‌ای:</label>
                  <input
                    type="text"
                    required
                    value={quickBaseUnit}
                    onChange={(e) => setQuickBaseUnit(e.target.value)}
                    placeholder="مثل دانه"
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5"
                  />
                </div>
              </div>

              {/* Price setup row */}
              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-dashed border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">قیمت خرید ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickCost}
                    onChange={(e) => setQuickCost(e.target.value)}
                    className="w-full bg-slate-50 border p-1 rounded font-mono text-left focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">قیمت عمده ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickWholesale}
                    onChange={(e) => setQuickWholesale(e.target.value)}
                    className="w-full bg-slate-50 border p-1 rounded font-mono text-left focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">قیمت پرچون ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quickRetail}
                    onChange={(e) => setQuickRetail(e.target.value)}
                    className="w-full bg-slate-50 border p-1 rounded font-mono text-left focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Picture choices thumbnail */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  تصویر کالا (گزینه‌های پیشنهادی برای سرعت):
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_PRESETS.map((pSet, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuickImageUrl(pSet.url)}
                      className={`p-1 border text-[9.5px] truncate rounded bg-white ${
                        quickImageUrl === pSet.url ? 'border-emerald-600 font-bold bg-emerald-50 text-emerald-900 ring-1 ring-emerald-505' : 'border-slate-200'
                      }`}
                    >
                      {pSet.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuickRegister(false)}
                  className="bg-slate-200 hover:bg-slate-300 font-semibold text-slate-705 px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow"
                >
                  <FolderPlus className="w-4 h-4" />
                  راجستر و اضافه در فاکتور
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quick Customer Register Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Users className="w-5 h-5" /> ثبت سریع مشتری
              </h2>
              <button onClick={() => setIsNewCustomerModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateQuickCustomer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نام و نام خانوادگی</label>
                <input 
                  type="text" 
                  required
                  value={newCustomerForm.name} 
                  onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">شماره تماس (اختیاری)</label>
                <input 
                  type="text" 
                  dir="ltr"
                  value={newCustomerForm.phone} 
                  onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono text-right" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">نام شرکت/فروشگاه (اختیاری)</label>
                <input 
                  type="text" 
                  value={newCustomerForm.company} 
                  onChange={e => setNewCustomerForm({...newCustomerForm, company: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-bold" 
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-xl font-black transition-colors shadow-lg shadow-emerald-200">
                ثبت مشتری و انتخاب در فاکتور
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Receipt Thermal Modal */}
      {completedSaleForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print" dir="rtl">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-receipt, .print-receipt * {
                visibility: visible;
              }
              .print-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                padding: 12px;
                direction: rtl !important;
                font-family: inherit;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          
          <div className="bg-white p-6 rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-right animate-fade-in print-receipt">
            {/* Header branding */}
            <div className="text-center space-y-1.5 border-b pb-4">
              <span className="text-xl font-black text-slate-800 tracking-tight">فروشگاه ستاره شهر</span>
              <p className="text-[10px] text-slate-400 font-bold">مرکز بزرگ موبایل، صرافی و گدام عمومی واردات کالا</p>
              <div className="flex justify-center gap-1.5 text-[9px] text-slate-500 font-mono mt-1">
                <span>تلفن: ۰۷۹۹۵۵۴۴۳۳</span>
                <span>∙</span>
                <span>آدرس: هرات، جاده ابریشم</span>
              </div>
            </div>

            {/* Metadata information block */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10.5px] space-y-1 text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>شماره فاکتور سیستم:</span>
                <span className="font-mono font-black text-slate-900">{completedSaleForInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>تاریخ و ساعت ثبت:</span>
                <span className="font-mono">{new Date(completedSaleForInvoice.date).toLocaleString('fa-IR')}</span>
              </div>
              <div className="flex justify-between">
                <span>حساب مشتری:</span>
                <span className="font-bold text-slate-800">{completedSaleForInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>وضعیت و شرط تسویه:</span>
                <span className="font-bold text-emerald-700">
                  {completedSaleForInvoice.paymentMethod === 'Credit' ? 'خرید اعتباری (لیجر دفتری)' : 'تسویه نقدی (صندوق)'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1 text-[10px] text-slate-400">
                <span>صندوقدار مسئول:</span>
                <span>{localStorage.getItem('AFG_STORE_CASHIER') || 'مدیر سیستم (ادمین)'}</span>
              </div>
            </div>

            {/* List of checkout items */}
            <div className="space-y-2 max-h-48 overflow-y-auto border-b pb-3">
              <span className="block text-[10px] font-black text-slate-400 tracking-wider">اقلام ترخیص‌شده:</span>
              <div className="space-y-2 divide-y divide-slate-100 text-xs text-right">
                {completedSaleForInvoice.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-1.5">
                    <div className="space-y-0.5 text-right">
                      <span className="font-extrabold text-slate-800">{item.productName}</span>
                      <p className="text-[9.5px] text-slate-400 font-sans text-right">
                        {item.quantity} x {item.selectedUnit} (فی: {formatCurrency(item.unitPriceAFN, 'AFN')})
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 shrink-0">
                      {formatCurrency(item.totalAFN, 'AFN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals and Discounts summary details */}
            <div className="space-y-1.5 text-xs text-slate-650 border-b pb-3 font-medium">
              <div className="flex justify-between">
                <span>جمع ناخالص کل:</span>
                <span className="font-mono">{formatCurrency(completedSaleForInvoice.totalAFN, 'AFN')}</span>
              </div>
              
              {completedSaleForInvoice.discountAFN > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>تخفیف دستی کسر شده:</span>
                  <span className="font-mono">-{formatCurrency(completedSaleForInvoice.discountAFN, 'AFN')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>مبلغ نهایی فاکتور:</span>
                <span className="font-mono text-emerald-800">{formatCurrency(completedSaleForInvoice.finalAFN, 'AFN')}</span>
              </div>

              {completedSaleForInvoice.tenderedAFN !== undefined && completedSaleForInvoice.tenderedAFN > completedSaleForInvoice.finalAFN && (
                <>
                  <div className="flex justify-between text-[11px] text-slate-700 font-bold border-t border-slate-100 pt-1.5 mt-1.5">
                    <span>مبلغ پرداختی مشتری:</span>
                    <span className="font-mono">{formatCurrency(completedSaleForInvoice.tenderedAFN, 'AFN')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-rose-600 font-black">
                    <span>باقی‌مانده (برگشتی به مشتری):</span>
                    <span className="font-mono">{formatCurrency(completedSaleForInvoice.changeAFN || 0, 'AFN')}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-100">
                <span>معادل ارز دالر ($):</span>
                <span>${completedSaleForInvoice.finalUSD.toFixed(2)}</span>
              </div>
            </div>

            {/* Print Footer message */}
            <div className="text-center text-[10px] text-slate-400 font-bold py-1.5 bg-slate-50 rounded-lg">
              <span>از خرید و اعتماد شما صمیمانه سپاسگزاریم!</span>
            </div>

            {/* Actions button */}
            <div className="flex gap-2 justify-end pt-2 no-print">
              <button
                type="button"
                onClick={() => setCompletedSaleForInvoice(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-755 px-4 py-2 rounded-lg font-bold text-xs cursor-pointer"
              >
                بستن فاکتور
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Hash className="w-4 h-4" />
                پرینت فاکتور
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Delete Confirmation Modal */}
      {deletingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-950 border-2 border-rose-500 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in space-y-4">
            <h3 className="font-extrabold text-rose-600 dark:text-rose-400 text-sm border-b pb-2 flex items-center gap-1.5">
              <span className="text-xl">⚠️</span>
              لغو کامل و حذف فاکتور رسمی
            </h3>
            
            <div className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed space-y-2">
              <p>هشدار مهم! آیا واقعاً می‌خواهید فاکتور شماره <strong className="font-mono text-slate-900 dark:text-white">({deletingSale.invoiceNo})</strong> مربوط به <strong className="text-rose-600 font-bold">"{deletingSale.customerName}"</strong> را حذف کامل کنید؟</p>
              <p className="font-extrabold text-slate-801 dark:text-slate-205">با تائید این درخواست:</p>
              <ul className="list-disc list-inside mr-2 text-slate-500 dark:text-slate-400 space-y-1">
                <li>موجودی کالاها مجدداً در گرامافون انبار شارژ و برگشت داده خواهد شد.</li>
                <li>بدهی‌های حساب مشتری صفر شده یا تعدیل می‌گردد.</li>
                <li>موجودی صندوق نقدی تصفیه شده و مانده کل کسر خواهد شد.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingSale(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg cursor-pointer font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSale(deletingSale.id);
                  setDeletingSale(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg cursor-pointer font-black"
              >
                ✓ بله، فاکتور حذف و برگشت شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Admin PIN Modal */}
      {securityAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
              <Lock className="w-6 h-6 text-rose-600" />
              تایید امنیتی مدیریت
            </h3>
            <p className="text-sm text-slate-500 mb-6">برای {securityAction.type === 'remove' ? 'حذف این کالا' : 'تغییر قیمت کالا'} نیاز به رمز عبور مدیر دارید.</p>
            
            <input 
              type="password" 
              value={adminPin}
              onChange={(e) => {
                setAdminPin(e.target.value);
                setAdminPinError(false);
              }}
              placeholder="رمز عبور مدیر..."
              className={`w-full text-center text-xl tracking-[0.3em] p-3 border rounded-xl mb-2 focus:outline-hidden transition-all ${adminPinError ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'}`}
              autoFocus
            />
            {adminPinError && <p className="text-xs text-rose-500 mb-4 text-center font-bold">رمز عبور اشتباه است!</p>}

            {securityAction.type === 'editPrice' && (
               <div className="mt-4 mb-4">
                 <label className="text-xs text-slate-600 font-bold block mb-2">قیمت جدید فی دانه (افغانی):</label>
                 <input 
                   type="number"
                   min="0"
                   value={securityAction.targetPriceAFN || ''}
                   onChange={(e) => setSecurityAction({...securityAction, targetPriceAFN: parseFloat(e.target.value) || 0})}
                   className="w-full p-3 border border-slate-300 rounded-xl text-center font-bold text-lg focus:outline-hidden focus:border-emerald-500"
                 />
               </div>
            )}
            
            <div className="flex gap-3 mt-6 text-sm">
              <button 
                onClick={() => {
                  setSecurityAction(null);
                  setAdminPin('');
                  setAdminPinError(false);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors cursor-pointer"
              >
                انصراف
              </button>
              <button 
                onClick={() => {
                  if (adminPin === DEFAULT_PIN) {
                    if (securityAction.type === 'remove') {
                      setPosItems(prev => prev.filter(item => !(item.productId === securityAction.productId && item.unitKey === securityAction.unitKey)));
                    } else if (securityAction.type === 'editPrice') {
                      setPosItems(prev => prev.map(item => 
                        (item.productId === securityAction.productId && item.unitKey === securityAction.unitKey)
                          ? { ...item, customPriceAFN: securityAction.targetPriceAFN }
                          : item
                      ));
                    }
                    setSecurityAction(null);
                    setAdminPin('');
                    setAdminPinError(false);
                  } else {
                    setAdminPinError(true);
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-black transition-colors cursor-pointer"
              >
                تایید عملیات
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-mono">Default PIN: 1234</p>
          </div>
        </div>
      )}

    </div>
  );
};
