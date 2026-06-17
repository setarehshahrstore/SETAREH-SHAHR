import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency, getUnitOptions } from '../utils';
import { 
  Plus, Search, FileText, X, Trash2, 
  ShoppingBag, Layers, Filter, Sparkles, Truck, DollarSign,
  PackagePlus, UserPlus
} from 'lucide-react';
import { Purchase, PurchaseItem, Product } from '../types';

const QUICK_PRESETS = [
  { name: '🥫 مواد غذایی', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250' },
  { name: '🥤 نوشابه و مایعات', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250' },
  { name: '🧼 مواد بهداشتی', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=250' },
  { name: '🥜 میوه خشک', url: 'https://images.unsplash.com/photo-1514986872470-76d747e29237?auto=format&fit=crop&q=80&w=250' },
  { name: '🌶️ ادویه‌جات', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' },
  { name: '📦 مال پکیج عمومی', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=250' }
];

export const Purchases: React.FC = () => {
  const { state, addPurchase, addProduct, addSupplier } = useAppState();
  
  const [purchaseSubTab, setPurchaseSubTab] = useState<'Purchase' | 'Manage'>('Purchase');
  
  // Date filter for Manage tab
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });
  const [manageSearchQuery, setManageSearchQuery] = useState('');

  // Invoice Builder State
  const [supplierId, setSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<Array<{
    productId: string;
    unitKey: string;
    quantity: number;
    costUSD: number;
    costAFN: number;
  }>>([]);
  const [paidUSD, setPaidUSD] = useState<string>('0');
  const [paidAFN, setPaidAFN] = useState<string>('0');

  // Search and touch grid
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  // Quick Register Modal (Product)
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [quickSku, setQuickSku] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickCat, setQuickCat] = useState('خوارباره و مواد غذایی');
  const [quickBaseUnit, setQuickBaseUnit] = useState('دانه');
  const [quickCost, setQuickCost] = useState('0.80');
  const [quickWholesale, setQuickWholesale] = useState('1.00');
  const [quickRetail, setQuickRetail] = useState('1.50');
  const [quickImageUrl, setQuickImageUrl] = useState(QUICK_PRESETS[0].url);

  // Quick Supplier Modal
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', phone: '', company: '' });

  // Custom Categories
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

  const touchSearchProducts = state.products.filter(p => {
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCat;

    return matchesCat && (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  const filteredPurchases = useMemo(() => {
    return state.purchases.filter(p => {
      const pDate = p.date.split('T')[0];
      const matchesDate = pDate >= dateRange.from && pDate <= dateRange.to;
      const matchesSearch = p.invoiceNo.toLowerCase().includes(manageSearchQuery.toLowerCase()) || 
                            p.supplierName.toLowerCase().includes(manageSearchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [state.purchases, dateRange, manageSearchQuery]);

  const handleBarcodeScan = (scannedSku: string) => {
    const product = state.products.find(p => p.sku === scannedSku || p.id === scannedSku);
    if (product) {
      setPurchaseItems(prev => {
        const existing = prev.find(item => item.productId === product.id && item.unitKey === 'piece');
        if (existing) {
          return prev.map(item => 
            (item.productId === product.id && item.unitKey === 'piece')
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { 
          productId: product.id, 
          unitKey: 'piece', 
          quantity: 1,
          costUSD: product.costPriceUSD,
          costAFN: product.costPriceAFN
        }];
      });
      setSearchQuery('');
    } else {
      setQuickSku(scannedSku);
      setShowQuickRegister(true);
    }
  };

  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSku || !quickName) return;

    const rate = state.exchangeRate;
    const costPriceUSD = parseFloat(quickCost) || 0;
    const costPriceAFN = costPriceUSD * rate;
    const wholesalePriceUSD = parseFloat(quickWholesale) || 0;
    const wholesalePriceAFN = wholesalePriceUSD * rate;
    const retailPriceUSD = parseFloat(quickRetail) || 0;
    const retailPriceAFN = retailPriceUSD * rate;

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
      stockInBaseUnits: 0,
      minStockInBaseUnits: 50,
      location: ''
    };

    addProduct(newProd);
    setShowQuickRegister(false);

    setPurchaseItems(prev => [
      ...prev,
      { 
        productId: newProd.id, 
        unitKey: 'piece', 
        quantity: 1,
        costUSD: costPriceUSD,
        costAFN: costPriceAFN
      }
    ]);

    setQuickName('');
    setQuickSku('');
  };

  const handleCreateQuickSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.name.trim()) return;
    
    const newId = `s${Date.now()}`;
    addSupplier({
      id: newId,
      name: newSupplierForm.name,
      companyName: newSupplierForm.company || '',
      phone: newSupplierForm.phone || '',
      city: 'نامشخص',
      debtAFN: 0,
      debtUSD: 0
    });
    setSupplierId(newId);
    setIsNewSupplierModalOpen(false);
    setNewSupplierForm({ name: '', phone: '', company: '' });
  };

  const updateItem = (index: number, field: string, value: any) => {
    setPurchaseItems(prev => {
      const next = [...prev];
      if (field === 'costUSD') {
        next[index].costUSD = value;
        next[index].costAFN = value * state.exchangeRate;
      } else if (field === 'costAFN') {
        next[index].costAFN = value;
        next[index].costUSD = value / state.exchangeRate;
      } else {
        (next[index] as any)[field] = value;
      }
      return next;
    });
  };

  const removeItem = (index: number) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculatedItems = purchaseItems.map(pItem => {
    const prod = state.products.find(p => p.id === pItem.productId)!;
    const unitOpts = getUnitOptions(prod.units);
    const selUnitOpt = unitOpts.find(o => o.key === pItem.unitKey) || unitOpts[0];
    
    const baseQty = pItem.quantity * selUnitOpt.multiplier;
    const unitCostUSD = pItem.costUSD;
    const unitCostAFN = pItem.costAFN;
    
    const totalUSD = unitCostUSD * pItem.quantity;
    const totalAFN = unitCostAFN * pItem.quantity;

    return {
      ...pItem,
      product: prod,
      unitOpts,
      selUnitOpt,
      totalUSD,
      totalAFN,
      baseQty
    };
  });

  const subtotalUSD = calculatedItems.reduce((sum, item) => sum + item.totalUSD, 0);
  const subtotalAFN = calculatedItems.reduce((sum, item) => sum + item.totalAFN, 0);

  const handleSubmitPurchase = () => {
    if (purchaseItems.length === 0) return;
    if (!supplierId) {
      alert('لطفاً تامین‌کننده را انتخاب کنید.');
      return;
    }

    const supplier = state.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const invoiceNo = `PUR-INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const finalItems: PurchaseItem[] = calculatedItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      selectedUnit: item.selUnitOpt.name,
      multiplier: item.selUnitOpt.multiplier,
      quantity: item.quantity,
      costPriceUSD: item.costUSD,
      costPriceAFN: item.costAFN,
      totalUSD: item.totalUSD,
      totalAFN: item.totalAFN
    }));

    const paidUSDVal = parseFloat(paidUSD) || 0;
    const paidAFNVal = parseFloat(paidAFN) || 0;

    const totalPaidAFNEquivalent = paidAFNVal + (paidUSDVal * state.exchangeRate);
    const totalSubtotalAFN = subtotalAFN;
    
    let paymentMethod: 'Cash' | 'Credit' | 'Partial' = 'Credit';
    if (totalPaidAFNEquivalent >= totalSubtotalAFN - 1) {
      paymentMethod = 'Cash';
    } else if (totalPaidAFNEquivalent > 0) {
      paymentMethod = 'Partial';
    }

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: finalItems,
      totalUSD: subtotalUSD,
      totalAFN: subtotalAFN,
      paidUSD: paidUSDVal,
      paidAFN: paidAFNVal,
      exchangeRate: state.exchangeRate,
      paymentMethod
    };

    addPurchase(newPurchase);
    setPurchaseItems([]);
    setPaidAFN('0');
    setPaidUSD('0');
    setSupplierId('');
    alert('فاکتور خرید با موفقیت ثبت شد!');
    setPurchaseSubTab('Manage');
  };

  return (
    <div className="space-y-6 w-full text-right" dir="rtl">
      
      {/* Sub tabs switcher */}
      <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 shadow-sm justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 dark:bg-indigo-950 p-2 rounded-xl text-indigo-600">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">بخش مدیریت خریدهای شرکت</h2>
            <p className="text-[10px] text-slate-400">ثبت فاکتورهای جدید خرید از تامین‌کنندگان و مدیریت اسناد مالی</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setPurchaseSubTab('Purchase')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              purchaseSubTab === 'Purchase'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            ثبت فاکتور خرید
          </button>
          <button
            onClick={() => setPurchaseSubTab('Manage')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              purchaseSubTab === 'Manage'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            مدیریت خریدها
          </button>
        </div>
      </div>

      {purchaseSubTab === 'Purchase' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Products Search & Selection (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                جستجوی کالا
              </h3>
              <button 
                onClick={() => setShowQuickRegister(true)}
                className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> ثبت کالای جدید
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="جستجوی کالا با نام یا بارکد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      handleBarcodeScan(searchQuery);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-9 pl-3 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-xs focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'همه دسته‌بندی‌ها' : c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
              {touchSearchProducts.map(prod => (
                <button
                  key={prod.id}
                  onClick={() => handleBarcodeScan(prod.sku)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all rounded-xl p-2 text-right flex items-center gap-2.5 shadow-sm cursor-pointer group"
                >
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-10 h-10 rounded-lg object-cover border shrink-0" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="truncate flex-1">
                    <span className="font-extrabold text-slate-800 block truncate text-xs group-hover:text-indigo-700">{prod.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">{formatCurrency(prod.costPriceAFN, 'AFN')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Builder (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-5">
            
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  صدور فاکتور خرید
                </h3>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-600">انتخاب تامین‌کننده / فروشنده:</label>
                  <button 
                    onClick={() => setIsNewSupplierModalOpen(true)}
                    className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" /> ثبت تامین‌کننده جدید
                  </button>
                </div>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none text-xs font-bold"
                >
                  <option value="">-- انتخاب تامین‌کننده --</option>
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.companyName ? `(${s.companyName})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[300px] flex flex-col">
                <table className="min-w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">کالا</th>
                      <th className="p-2">واحد</th>
                      <th className="p-2">تعداد</th>
                      <th className="p-2">فی (USD)</th>
                      <th className="p-2">فی (AFN)</th>
                      <th className="p-2">مجموع (AFN)</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 flex-1">
                    {purchaseItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-20 text-slate-400">
                          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <span>کالاها را از پنل جستجو انتخاب کنید.</span>
                        </td>
                      </tr>
                    ) : (
                      calculatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 font-bold text-slate-800 max-w-[120px] truncate" title={item.product.name}>
                            {item.product.name}
                          </td>
                          <td className="p-2">
                            <select
                              value={item.unitKey}
                              onChange={(e) => updateItem(idx, 'unitKey', e.target.value)}
                              className="bg-white border border-slate-200 rounded p-1 text-[11px]"
                            >
                              {item.unitOpts.map(opt => (
                                <option key={opt.key} value={opt.key}>{opt.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-16 p-1 border border-slate-200 rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.costUSD}
                              onChange={(e) => updateItem(idx, 'costUSD', parseFloat(e.target.value) || 0)}
                              className="w-16 p-1 border border-slate-200 rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.costAFN}
                              onChange={(e) => updateItem(idx, 'costAFN', parseFloat(e.target.value) || 0)}
                              className="w-20 p-1 border border-slate-200 rounded text-center"
                            />
                          </td>
                          <td className="p-2 font-bold text-indigo-700">
                            {formatCurrency(item.totalAFN, 'AFN')}
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600">
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600">مجموع فاکتور:</span>
                  <div className="text-left font-black">
                    <div className="text-lg text-indigo-800">{formatCurrency(subtotalAFN, 'AFN')}</div>
                    <div className="text-xs text-slate-500 font-mono">${subtotalUSD.toFixed(2)} USD</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">پرداخت (AFN)</label>
                    <input
                      type="number"
                      value={paidAFN}
                      onChange={(e) => setPaidAFN(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-indigo-800 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">پرداخت (USD)</label>
                    <input
                      type="number"
                      value={paidUSD}
                      onChange={(e) => setPaidUSD(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-indigo-800 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitPurchase}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black transition-all shadow-md mt-2 flex justify-center items-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-5 h-5" /> ثبت نهایی فاکتور خرید
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        // Manage Purchases Tab
        <div className="space-y-6">
          <DateFilter 
            dateRange={dateRange} 
            onDateChange={setDateRange} 
            onSearch={() => {}} 
            onClear={() => setDateRange({ from: todayDate, to: todayDate })}
          />

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی شماره فاکتور یا نام تامین‌کننده..."
                value={manageSearchQuery}
                onChange={(e) => setManageSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-indigo-900 text-white uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tr-2xl">تاریخ</th>
                    <th className="px-4 py-3">فاکتور</th>
                    <th className="px-4 py-3">تامین‌کننده</th>
                    <th className="px-4 py-3">مبلغ (AFN)</th>
                    <th className="px-4 py-3">پرداخت (AFN)</th>
                    <th className="px-4 py-3">وضعیت حساب</th>
                    <th className="px-4 py-3 text-center rounded-tl-2xl">جزئیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map(purchase => {
                    const balanceAFN = purchase.totalAFN - purchase.paidAFN - (purchase.paidUSD * purchase.exchangeRate);
                    return (
                      <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 font-mono">{new Date(purchase.date).toLocaleDateString('fa-IR')}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{purchase.invoiceNo}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{purchase.supplierName}</td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{formatCurrency(purchase.totalAFN, 'AFN')}</td>
                        <td className="px-4 py-3 font-mono text-emerald-600">{formatCurrency(purchase.paidAFN + (purchase.paidUSD * purchase.exchangeRate), 'AFN')}</td>
                        <td className="px-4 py-3 font-mono font-bold text-rose-600">{balanceAFN > 0 ? formatCurrency(balanceAFN, 'AFN') + ' قرض' : 'تصفیه'}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="مشاهده فاکتور">
                            <FileText className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                        فاکتور خریدی یافت نشد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Product Modal */}
      {showQuickRegister && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                ثبت سریع کالا در سیستم
              </h3>
              <button onClick={() => setShowQuickRegister(false)} className="hover:bg-white/20 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <form onSubmit={handleQuickRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">بارکد (SKU) <span className="text-rose-500">*</span></label>
                    <input type="text" required value={quickSku} onChange={e => setQuickSku(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نام کالا <span className="text-rose-500">*</span></label>
                    <input type="text" required value={quickName} onChange={e => setQuickName(e.target.value)} placeholder="مثال: روغن ۵ لیتر" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">صنف کالا</label>
                    <select value={quickCat} onChange={e => setQuickCat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                      {localCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">واحد پایه</label>
                    <input type="text" value={quickBaseUnit} onChange={e => setQuickBaseUnit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="دانه، کیلو..." />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">قیمت خرید ($)</label>
                    <input type="number" step="0.01" value={quickCost} onChange={e => setQuickCost(e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">عمده‌فروشی ($)</label>
                    <input type="number" step="0.01" value={quickWholesale} onChange={e => setQuickWholesale(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">تک‌فروشی ($)</label>
                    <input type="number" step="0.01" value={quickRetail} onChange={e => setQuickRetail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-lg py-3 hover:bg-indigo-700">ثبت کالا و افزودن به فاکتور</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Supplier Modal */}
      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-black text-sm">ثبت تامین‌کننده جدید</h3>
              <button onClick={() => setIsNewSupplierModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateQuickSupplier} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام شخص <span className="text-rose-500">*</span></label>
                <input required type="text" value={newSupplierForm.name} onChange={e => setNewSupplierForm({...newSupplierForm, name: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام شرکت</label>
                <input type="text" value={newSupplierForm.company} onChange={e => setNewSupplierForm({...newSupplierForm, company: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس</label>
                <input type="text" value={newSupplierForm.phone} onChange={e => setNewSupplierForm({...newSupplierForm, phone: e.target.value})} className="w-full border rounded-lg p-2 text-xs dir-ltr text-right" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold rounded-lg py-2 hover:bg-indigo-700">ثبت تامین‌کننده</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
