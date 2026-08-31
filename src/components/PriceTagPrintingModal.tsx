import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { 
  Printer, 
  Tag, 
  X, 
  CheckSquare, 
  Square, 
  Sparkles, 
  AlertCircle, 
  Search, 
  SlidersHorizontal,
  Check,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  exchangeRate: number;
}

const PREV_PRICES_KEY = 'AFG_PREV_PRODUCT_PRICES';

export const PriceTagPrintingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  exchangeRate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'changed' | 'selected'>('all');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [labelCounts, setLabelCounts] = useState<Record<string, number>>({});
  const [tagLayout, setTagLayout] = useState<'standard' | 'mini' | 'detailed'>('standard');
  const [showBarcode, setShowBarcode] = useState(true);
  const [showUSDPrice, setShowUSDPrice] = useState(true);

  // Price Change Tracking logic
  const [priceChangedProductIds, setPriceChangedProductIds] = useState<string[]>([]);
  const [previousPricesMap, setPreviousPricesMap] = useState<Record<string, { retailAFN: number; retailUSD: number }>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREV_PRICES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreviousPricesMap(parsed);

        // Find products where current price != cached price
        const changed: string[] = [];
        products.forEach(p => {
          const old = parsed[p.id];
          if (old) {
            const currentAFN = Math.round(p.retailPriceAFN);
            const oldAFN = Math.round(old.retailAFN);
            if (Math.abs(currentAFN - oldAFN) >= 1) {
              changed.push(p.id);
            }
          }
        });
        setPriceChangedProductIds(changed);
      } else {
        // First time initialization: store snapshot
        const snapshot: Record<string, { retailAFN: number; retailUSD: number }> = {};
        products.forEach(p => {
          snapshot[p.id] = {
            retailAFN: p.retailPriceAFN,
            retailUSD: p.retailPriceUSD
          };
        });
        localStorage.setItem(PREV_PRICES_KEY, JSON.stringify(snapshot));
        setPreviousPricesMap(snapshot);
      }
    } catch (e) {
      console.warn('Error reading stored product prices:', e);
    }
  }, [products, exchangeRate]);

  if (!isOpen) return null;

  // Filter products based on search and selected tab
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (filterMode === 'changed') {
      return priceChangedProductIds.includes(p.id);
    }
    if (filterMode === 'selected') {
      return !!selectedIds[p.id];
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedIds).length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds({});
    } else {
      const newSel: Record<string, boolean> = {};
      filteredProducts.forEach(p => {
        newSel[p.id] = true;
      });
      setSelectedIds(newSel);
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const setItemCount = (id: string, count: number) => {
    setLabelCounts(prev => ({
      ...prev,
      [id]: Math.max(1, count)
    }));
  };

  // Select all price changed items with 1-click
  const handleSelectAllChangedItems = () => {
    const newSel: Record<string, boolean> = {};
    priceChangedProductIds.forEach(id => {
      newSel[id] = true;
    });
    setSelectedIds(newSel);
    setFilterMode('changed');
  };

  // Acknowledge / reset price snapshot after printing
  const handleAcknowledgePriceChanges = () => {
    const snapshot: Record<string, { retailAFN: number; retailUSD: number }> = {};
    products.forEach(p => {
      snapshot[p.id] = {
        retailAFN: p.retailPriceAFN,
        retailUSD: p.retailPriceUSD
      };
    });
    localStorage.setItem(PREV_PRICES_KEY, JSON.stringify(snapshot));
    setPreviousPricesMap(snapshot);
    setPriceChangedProductIds([]);
  };

  // Calculate items to print
  const itemsToPrint: { product: Product; count: number; oldPrice?: number }[] = [];
  const activeList = Object.keys(selectedIds).some(k => selectedIds[k])
    ? products.filter(p => selectedIds[p.id])
    : (filterMode === 'changed' ? products.filter(p => priceChangedProductIds.includes(p.id)) : filteredProducts);

  activeList.forEach(p => {
    const count = labelCounts[p.id] || 1;
    const old = previousPricesMap[p.id]?.retailAFN;
    itemsToPrint.push({ product: p, count, oldPrice: old });
  });

  const totalTagsCount = itemsToPrint.reduce((acc, item) => acc + item.count, 0);

  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر';
  const currentDate = new Intl.DateTimeFormat('fa-AF', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date());

  const handleExecutePrint = () => {
    if (itemsToPrint.length === 0) {
      alert('لطفاً حداقل یک محصول را برای چاپ اتیکت انتخاب کنید.');
      return;
    }

    const originalTitle = document.title;
    document.title = `اتیکت_قیمت_فروشگاه_${new Date().toISOString().split('T')[0]}`;

    // Flatten array based on requested copies
    const flattenedTags: { product: Product; oldPrice?: number }[] = [];
    itemsToPrint.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        flattenedTags.push({ product: item.product, oldPrice: item.oldPrice });
      }
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <title>چاپ اتیکت و بارکد قفسه محصولات</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            body {
              font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif;
              direction: rtl;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #0f172a;
            }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              page-break-inside: auto;
            }
            .tag-card {
              border: 1.5px dashed #334155;
              border-radius: 8px;
              padding: 8px 10px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
              min-height: 120px;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            .tag-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            .store-name {
              font-size: 10px;
              font-weight: bold;
              color: #0b1f3a;
            }
            .tag-date {
              font-size: 9px;
              color: #64748b;
              font-family: monospace;
            }
            .prod-name {
              font-size: 12px;
              font-weight: 900;
              color: #0f172a;
              line-height: 1.3;
              margin-bottom: 6px;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .price-section {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 4px 6px;
              text-align: center;
              margin-bottom: 4px;
            }
            .price-label {
              font-size: 9px;
              color: #475569;
              font-weight: bold;
            }
            .price-main {
              font-size: 16px;
              font-weight: 900;
              color: #0b1f3a;
            }
            .price-usd {
              font-size: 10px;
              color: #0284c7;
              font-weight: bold;
              font-family: monospace;
            }
            .tag-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 4px;
              border-top: 1px dotted #cbd5e1;
              font-size: 9px;
              color: #64748b;
            }
            .barcode-sim {
              letter-spacing: 2px;
              font-family: 'Courier New', monospace;
              font-weight: bold;
              font-size: 10px;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${flattenedTags.map(item => {
              const p = item.product;
              return `
                <div class="tag-card">
                  <div class="tag-header">
                    <span class="store-name">${storeName}</span>
                    <span class="tag-date">${currentDate}</span>
                  </div>

                  <div class="prod-name">${p.name}</div>

                  <div class="price-section">
                    <div class="price-label">قیمت فروش (${p.baseUnit}):</div>
                    <div class="price-main">${Math.round(p.retailPriceAFN).toLocaleString()} <span style="font-size: 11px;">افغانی</span></div>
                    ${showUSDPrice ? `<div class="price-usd">$${p.retailPriceUSD.toFixed(2)} USD</div>` : ''}
                  </div>

                  <div class="tag-footer">
                    <span class="barcode-sim">|||| ||| | ||| ${p.sku || p.id.slice(0, 6)}</span>
                    <span>${p.category || 'کالای عمومی'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        document.title = originalTitle;
        // Prompt acknowledge
        handleAcknowledgePriceChanges();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-l from-[#0B1F3A] to-[#15345d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">سیستم هوشمند چاپ اتیکت قیمت و بارکد قفسه‌ها</h2>
              <p className="text-xs text-slate-300">چاپ کلی، دانه‌ای، و تشخیص خودکار کالاهایی که تغییر قیمت داشته‌اند</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart Price Change Alert Strip (if any detected) */}
        {priceChangedProductIds.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
              <div>
                <span className="text-xs font-black block">
                  سیستم هوشمند: تعداد {priceChangedProductIds.length} قلم کالا تغییر قیمت داشته‌اند!
                </span>
                <span className="text-[11px] text-amber-800">
                  جهت تطابق قیمت قفسه با نرم‌افزار، می‌توانید اتیکت این محصولات را با یک کلیک چاپ فرمایید.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllChangedItems}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                انتخاب {priceChangedProductIds.length} قلم تغییر قیمت خورده
              </button>

              <button
                onClick={handleAcknowledgePriceChanges}
                title="علامت‌گذاری به عنوان چاپ‌شده"
                className="px-3 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                صرف‌نظر / ثبت شد
              </button>
            </div>
          </div>
        )}

        {/* Filter & Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#0B1F3A] text-amber-300 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              همه کالاها ({products.length})
            </button>

            <button
              onClick={() => setFilterMode('changed')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                filterMode === 'changed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              تغییر قیمت خورده ({priceChangedProductIds.length})
            </button>

            <button
              onClick={() => setFilterMode('selected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterMode === 'selected'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              انتخاب‌شده‌ها ({Object.values(selectedIds).filter(Boolean).length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input 
              type="text" 
              placeholder="جستجوی نام کالا یا بارکد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Options Toggles */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={showUSDPrice} 
                onChange={(e) => setShowUSDPrice(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span>درج نرخ دالری</span>
            </label>

            <button
              onClick={toggleSelectAll}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {Object.keys(selectedIds).length === filteredProducts.length && filteredProducts.length > 0
                ? 'لغو انتخاب همه'
                : 'انتخاب همه این لیست'}
            </button>
          </div>
        </div>

        {/* Product Selection List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map(p => {
              const isSelected = !!selectedIds[p.id];
              const isPriceChanged = priceChangedProductIds.includes(p.id);
              const count = labelCounts[p.id] || 1;
              const oldPrice = previousPricesMap[p.id]?.retailAFN;

              return (
                <div 
                  key={p.id}
                  onClick={() => toggleSelectProduct(p.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected 
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs' 
                      : isPriceChanged 
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-amber-600 mt-0.5">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-[#0B1F3A]" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{p.sku || 'فاقد بارکد'}</span>
                      </div>
                    </div>

                    {isPriceChanged && (
                      <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md shrink-0">
                        تغییر قیمت
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">قیمت پرچون:</span>
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {Math.round(p.retailPriceAFN).toLocaleString()} ؋
                      </span>
                      {oldPrice && Math.abs(oldPrice - p.retailPriceAFN) >= 1 && (
                        <span className="text-[9px] text-slate-400 line-through mr-1">
                          {Math.round(oldPrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quantity Picker for this tag */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1"
                    >
                      <span className="text-[10px] text-slate-400 font-bold px-1">تعداد:</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={count} 
                        onChange={(e) => setItemCount(p.id, parseInt(e.target.value) || 1)}
                        className="w-10 text-center text-xs font-black font-mono border-0 outline-hidden bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-xs font-bold">
              هیچ محصولی با معیارهای انتخابی یافت نشد.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-bold">مجموع اتیکت‌های آماده چاپ:</span>
            <span className="bg-[#0B1F3A] text-amber-300 px-2.5 py-0.5 rounded-lg font-black font-mono">
              {totalTagsCount} برگ اتیکت
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              بستن
            </button>

            <button
              onClick={handleExecutePrint}
              disabled={totalTagsCount === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-l from-[#0B1F3A] to-[#15345d] text-amber-300 hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              چاپ برگه اتیکت‌ها ({totalTagsCount} عدد)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
