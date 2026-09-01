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
  X,
  Tag
} from 'lucide-react';
import { Product, Purchase, PurchaseItem } from '../types';
import { LowStockReportModal } from './LowStockReportModal';
import { PriceTagPrintingModal } from './PriceTagPrintingModal';
import { ExcelImportModal } from './ExcelImportModal';
import { BulkImageUploadModal } from './BulkImageUploadModal';
import { FileSpreadsheet, Images, Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Permissions } from '../utils/permissions';

// High-quality image presets for diverse Afghan markets (sanitary, groceries, dry fruits, spices, carpets)
const IMAGE_PRESETS = [
  { name: '🥫 مواد غذایی و کنسرواجات', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250' },
  { name: '🥤 نوشابه‌ها و مایعات معطر', url: '/drinks.jpg' },
  { name: '🧼 شامپو و لوازم روانی بهداشتی', url: '/hygiene.jpg' },
  { name: '🥜 میوه جات خشک و خسته‌باب', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=250' },
  { name: '🌶️ زعفران و ادویه‌جات تند', url: '/spices.jpg' },
  { name: '🌾 برنج باریک، حبوبات و غله', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=250' },
  { name: '🧴 مواد شوینده و پاک‌کننده', url: '/cleaning.jpg' },
  { name: '📦 کارتن و اجناس پکیج عمومی', url: '/supermarket.jpg' }
];

export const Inventory: React.FC = () => {
  const { state, addProduct, addProducts, editProduct, bulkUpdateProducts, deleteProduct, deleteProducts, addPurchase } = useAppState();
  const { user } = useAuth();
  
  const canViewCost = Permissions.canViewCostPrices(user?.role);
  const canDelete = Permissions.canDeleteProducts(user?.role);
  const canEditPrices = Permissions.canEditProductPrices(user?.role);
  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestocking, setIsRestocking] = useState(false);

  // Bulk Discount States
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountExpiryDays, setDiscountExpiryDays] = useState('7');

  // Report & Tag Modals
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isPriceTagModalOpen, setIsPriceTagModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isBulkImageModalOpen, setIsBulkImageModalOpen] = useState(false);

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
    wholesalePriceAFN: '68.00', retailPriceAFN: '102.00', costPriceAFN: '54.40',
    costPriceCarton: '800.00', stockPieces: '0', stockCartons: '0', minStock: '100',
    hasPack: true, packName: 'بسته', packQty: '10',
    hasBox: true, boxName: 'قوطی', boxQty: '100',
    hasCarton: true, cartonName: 'کارتن', cartonQty: '0',
    hasDozen: false, dozenName: 'درجن', dozenQty: '12',
    hasPacket: false, packetName: 'پاکت', packetQty: '0',
    minWholesaleQty: '', isDiscounted: false, isBestSeller: false
  });

  const handleUSDChange = (field: 'costPrice' | 'wholesalePrice' | 'retailPrice', val: string) => {
    const usdVal = parseFloat(val) || 0;
    setFormData(prev => ({
      ...prev,
      [`${field}USD`]: val,
      [`${field}AFN`]: (usdVal * state.exchangeRate).toFixed(2),
      ...(field === 'costPrice' ? { costPriceCarton: (usdVal * (parseInt(prev.cartonQty) || 1)).toFixed(2) } : {})
    }));
  };

  const handleAFNChange = (field: 'costPrice' | 'wholesalePrice' | 'retailPrice', val: string) => {
    const afnVal = parseFloat(val) || 0;
    const usdVal = state.exchangeRate > 0 ? afnVal / state.exchangeRate : 0;
    setFormData(prev => ({
      ...prev,
      [`${field}AFN`]: val,
      [`${field}USD`]: usdVal.toFixed(2),
      ...(field === 'costPrice' ? { costPriceCarton: (usdVal * (parseInt(prev.cartonQty) || 1)).toFixed(2) } : {})
    }));
  };

  const handlePieceCostChange = (val: string) => handleUSDChange('costPrice', val);

  const handleCartonCostChange = (val: string) => {
    const cartonCost = parseFloat(val) || 0;
    const multiplier = parseInt(formData.cartonQty) || 1;
    const pieceUsd = cartonCost / multiplier;
    setFormData(prev => ({
      ...prev,
      costPriceCarton: val,
      costPriceUSD: pieceUsd.toFixed(2),
      costPriceAFN: (pieceUsd * state.exchangeRate).toFixed(2)
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
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setFormData(prev => ({ ...prev, image: compressedDataUrl }));
          }
        };
        img.src = event.target?.result as string;
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
      wholesalePriceAFN: parseFloat(formData.wholesalePriceAFN) || 0,
      retailPriceUSD: parseFloat(formData.retailPriceUSD) || 0,
      retailPriceAFN: parseFloat(formData.retailPriceAFN) || 0,
      costPriceUSD: parseFloat(formData.costPriceUSD) || 0,
      costPriceAFN: parseFloat(formData.costPriceAFN) || 0,
      stockInBaseUnits: editingProduct ? editingProduct.stockInBaseUnits : (parseInt(formData.stockPieces) || 0),
      minStockInBaseUnits: parseInt(formData.minStock) || 0,
      location: formData.location,
      units: {
        piece: formData.baseUnit,
        ...(formData.hasPack && { pack: { name: formData.packName, multiplier: parseInt(formData.packQty) || 1 } }),
        ...(formData.hasBox && { box: { name: formData.boxName, multiplier: parseInt(formData.boxQty) || 1 } }),
        ...(formData.hasCarton && { carton: { name: formData.cartonName, multiplier: parseInt(formData.cartonQty) || 1 } }),
        ...(formData.hasDozen && { dozen: { name: formData.dozenName, multiplier: parseInt(formData.dozenQty) || 1 } }),
        ...(formData.hasPacket && { packet: { name: formData.packetName, multiplier: parseInt(formData.packetQty) || 1 } })
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
      wholesalePriceAFN: p.wholesalePriceAFN.toString(),
      retailPriceUSD: p.retailPriceUSD.toString(),
      retailPriceAFN: p.retailPriceAFN.toString(),
      costPriceUSD: p.costPriceUSD.toString(),
      costPriceAFN: p.costPriceAFN.toString(),
      costPriceCarton: (p.costPriceUSD * (p.units.carton?.multiplier || 1)).toFixed(2),
      stockPieces: p.stockInBaseUnits.toString(),
      stockCartons: (p.stockInBaseUnits / (p.units.carton?.multiplier || 1)).toFixed(1),
      minStock: p.minStockInBaseUnits.toString(),
      hasPack: !!p.units.pack, packName: p.units.pack?.name || 'بسته', packQty: (p.units.pack?.multiplier || 10).toString(),
      hasBox: !!p.units.box, boxName: p.units.box?.name || 'قوطی', boxQty: (p.units.box?.multiplier || 100).toString(),
      hasCarton: !!p.units.carton, cartonName: p.units.carton?.name || 'کارتن', cartonQty: (p.units.carton?.multiplier || 0).toString(),
      hasDozen: !!p.units.dozen, dozenName: p.units.dozen?.name || 'درجن', dozenQty: (p.units.dozen?.multiplier || 12).toString(),
      hasPacket: !!p.units.packet, packetName: p.units.packet?.name || 'پاکت', packetQty: (p.units.packet?.multiplier || 0).toString(),
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

  const handleApplyBulkDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const percent = parseFloat(discountPercentage);
    if (!percent || percent <= 0 || percent > 100) {
      alert('درصد تخفیف باید بین ۱ تا ۱۰۰ باشد.');
      return;
    }
    const days = parseInt(discountExpiryDays) || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const updates = selectedProductIds.map(id => ({
      id,
      discountPercentage: percent,
      discountExpiry: expiryDate.toISOString()
    }));
    bulkUpdateProducts(updates);
    setIsDiscountModalOpen(false);
    setSelectedProductIds([]);
    setDiscountPercentage('');
    setDiscountExpiryDays('7');
    alert(`تخفیف ${percent}٪ با موفقیت روی ${selectedProductIds.length} محصول اعمال شد.`);
  };

  // Advanced multi-criteria search
  const filteredProducts = state.products.filter(p => {
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    return matchesCategory && (
      (p.name || '').toLowerCase().includes(query) ||
      (p.sku || '').toLowerCase().includes(query) ||
      (p.id || '').toLowerCase().includes(query) ||
      (p.category || '').toLowerCase().includes(query) ||
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
              <>
                {canEditPrices && (
                  <button
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-4 h-4" />
                    اعمال تخفیف گروهی ({selectedProductIds.length})
                  </button>
                )}
                {canDelete && (
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
              </>
            )}
            <button
              onClick={() => setIsExcelImportModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="ورود کالاها با فایل اکسل و آپلود عکس‌ها"
            >
              <FileSpreadsheet className="w-4 h-4" />
              ورود با اکسل (Excel)
            </button>
            <button
              onClick={() => setIsPriceTagModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg px-3 py-1.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Tag className="w-4 h-4" />
              چاپ اتیکت‌های قیمت
            </button>
            <button
              onClick={() => setIsLowStockModalOpen(true)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              کسری انبار (PDF)
            </button>
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
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center overflow-hidden bg-slate-50 relative group cursor-pointer shadow-xs transition-all">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                        <ImageIcon className="text-white w-6 h-6 mb-1" />
                        <span className="text-[10px] text-white font-bold leading-tight">تغییر عکس از کامپیوتر</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="آپلود عکس از کامپیوتر" />
                    </div>
                    <label className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      انتخاب از کامپیوتر
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
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
                  <span>قیمت‌گذاری</span>
                  <span className="text-[10px] text-slate-400 font-normal">تغییر در قیمت دالر یا افغانی یکدیگر را بروز می‌کند</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cost Price */}
                  {canViewCost ? (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                      <label className="block text-sm font-bold text-emerald-800">قیمت خرید (تمام شد)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold w-12 text-slate-500">دالر:</span>
                        <input type="number" step="0.01" required value={formData.costPriceUSD} onChange={e => handleUSDChange('costPrice', e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold w-12 text-slate-500">افغانی:</span>
                        <input type="number" step="0.01" required value={formData.costPriceAFN} onChange={e => handleAFNChange('costPrice', e.target.value)} className="w-full p-2 border border-emerald-200 rounded-lg text-sm bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-100/50">
                        <span className="text-[10px] font-bold text-slate-500">کارتن (دالر):</span>
                        <input type="number" step="0.01" required value={formData.costPriceCarton} onChange={e => handleCartonCostChange(e.target.value)} className="w-full p-1 border border-emerald-200 rounded text-xs bg-white font-mono text-left focus:border-emerald-500" dir="ltr" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center items-center text-center space-y-2">
                      <Lock className="w-5 h-5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">قیمت خرید محرمانه</span>
                      <span className="text-[10px] text-slate-400">فقط مدیران و مالک دسترسی دارند</span>
                    </div>
                  )}

                  {/* Wholesale Price */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
                    <label className="block text-sm font-bold text-amber-800">قیمت فروش عمده</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-12 text-slate-500">دالر:</span>
                      <input type="number" step="0.01" required value={formData.wholesalePriceUSD} onChange={e => handleUSDChange('wholesalePrice', e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-white font-mono text-left focus:border-amber-500" dir="ltr" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-12 text-slate-500">افغانی:</span>
                      <input type="number" step="0.01" required value={formData.wholesalePriceAFN} onChange={e => handleAFNChange('wholesalePrice', e.target.value)} className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-white font-mono text-left focus:border-amber-500" dir="ltr" />
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-amber-100/50">
                      <span className="text-[10px] font-bold text-slate-500">حداقل خرید عمده:</span>
                      <input type="number" min="1" value={formData.minWholesaleQty} onChange={e => setFormData({...formData, minWholesaleQty: e.target.value})} className="w-full p-1 border border-amber-200 rounded text-xs bg-white font-mono text-left" dir="ltr" placeholder="اختیاری" />
                    </div>
                  </div>

                  {/* Retail Price */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <label className="block text-sm font-bold text-indigo-800">قیمت فروش پرچون</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-12 text-slate-500">دالر:</span>
                      <input type="number" step="0.01" required value={formData.retailPriceUSD} onChange={e => handleUSDChange('retailPrice', e.target.value)} className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white font-mono text-left focus:border-indigo-500" dir="ltr" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-12 text-slate-500">افغانی:</span>
                      <input type="number" step="0.01" required value={formData.retailPriceAFN} onChange={e => handleAFNChange('retailPrice', e.target.value)} className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white font-mono text-left focus:border-indigo-500" dir="ltr" />
                    </div>
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
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">واحد پایه فروش (تک / دانه / عدد)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.baseUnit} 
                      onChange={e => setFormData({...formData, baseUnit: e.target.value})} 
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white font-bold text-[#0B1F3A] focus:border-[#D4AF37]" 
                      placeholder="مثلاً: دانه، کیلو، عدد" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">تعریف واحدهای بسته‌بندی بزرگتر (اختیاری):</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      
                      {/* Pack */}
                      <div className={`p-3 rounded-xl border transition-all ${formData.hasPack ? 'bg-white border-indigo-300 shadow-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] cursor-pointer">
                          <input type="checkbox" checked={formData.hasPack} onChange={e => setFormData({...formData, hasPack: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4 rounded" />
                          <span>بسته کوچک (Pack)</span>
                        </label>
                        {formData.hasPack && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">نام:</span>
                              <input type="text" value={formData.packName} onChange={e => setFormData({...formData, packName: e.target.value})} className="w-full p-1.5 text-xs bg-slate-50 border rounded-lg" placeholder="نام واحد" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">معادل:</span>
                              <input type="number" min="1" value={formData.packQty} onChange={e => setFormData({...formData, packQty: e.target.value})} className="w-20 p-1.5 text-xs bg-slate-50 border rounded-lg text-center font-bold" />
                              <span className="text-[11px] text-slate-500">{formData.baseUnit || 'دانه'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Box */}
                      <div className={`p-3 rounded-xl border transition-all ${formData.hasBox ? 'bg-white border-indigo-300 shadow-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] cursor-pointer">
                          <input type="checkbox" checked={formData.hasBox} onChange={e => setFormData({...formData, hasBox: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4 rounded" />
                          <span>جعبه / قوطی (Box)</span>
                        </label>
                        {formData.hasBox && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">نام:</span>
                              <input type="text" value={formData.boxName} onChange={e => setFormData({...formData, boxName: e.target.value})} className="w-full p-1.5 text-xs bg-slate-50 border rounded-lg" placeholder="نام واحد" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">معادل:</span>
                              <input type="number" min="1" value={formData.boxQty} onChange={e => setFormData({...formData, boxQty: e.target.value})} className="w-20 p-1.5 text-xs bg-slate-50 border rounded-lg text-center font-bold" />
                              <span className="text-[11px] text-slate-500">{formData.baseUnit || 'دانه'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Carton */}
                      <div className={`p-3 rounded-xl border transition-all ${formData.hasCarton ? 'bg-white border-indigo-300 shadow-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] cursor-pointer">
                          <input type="checkbox" checked={formData.hasCarton} onChange={e => setFormData({...formData, hasCarton: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4 rounded" />
                          <span>کارتن بزرگ (Carton)</span>
                        </label>
                        {formData.hasCarton && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">نام:</span>
                              <input type="text" value={formData.cartonName} onChange={e => setFormData({...formData, cartonName: e.target.value})} className="w-full p-1.5 text-xs bg-slate-50 border rounded-lg" placeholder="نام واحد" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">معادل:</span>
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
                              }} className="w-20 p-1.5 text-xs bg-slate-50 border rounded-lg text-center font-bold" />
                              <span className="text-[11px] text-slate-500">{formData.baseUnit || 'دانه'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Dozen */}
                      <div className={`p-3 rounded-xl border transition-all ${formData.hasDozen ? 'bg-white border-indigo-300 shadow-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] cursor-pointer">
                          <input type="checkbox" checked={formData.hasDozen} onChange={e => setFormData({...formData, hasDozen: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4 rounded" />
                          <span>درجن / دوجین (Dozen)</span>
                        </label>
                        {formData.hasDozen && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">نام:</span>
                              <input type="text" value={formData.dozenName} onChange={e => setFormData({...formData, dozenName: e.target.value})} className="w-full p-1.5 text-xs bg-slate-50 border rounded-lg" placeholder="نام واحد" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">معادل:</span>
                              <input type="number" min="1" value={formData.dozenQty} onChange={e => setFormData({...formData, dozenQty: e.target.value})} className="w-20 p-1.5 text-xs bg-slate-50 border rounded-lg text-center font-bold" />
                              <span className="text-[11px] text-slate-500">{formData.baseUnit || 'دانه'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Packet */}
                      <div className={`p-3 rounded-xl border transition-all ${formData.hasPacket ? 'bg-white border-indigo-300 shadow-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                        <label className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] cursor-pointer">
                          <input type="checkbox" checked={formData.hasPacket} onChange={e => setFormData({...formData, hasPacket: e.target.checked})} className="accent-[#0B1F3A] w-4 h-4 rounded" />
                          <span>پاکت / کیسه (Packet)</span>
                        </label>
                        {formData.hasPacket && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">نام:</span>
                              <input type="text" value={formData.packetName} onChange={e => setFormData({...formData, packetName: e.target.value})} className="w-full p-1.5 text-xs bg-slate-50 border rounded-lg" placeholder="نام واحد" />
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] text-slate-500 font-bold w-10 shrink-0">معادل:</span>
                              <input type="number" min="1" value={formData.packetQty} onChange={e => setFormData({...formData, packetQty: e.target.value})} className="w-20 p-1.5 text-xs bg-slate-50 border rounded-lg text-center font-bold" />
                              <span className="text-[11px] text-slate-500">{formData.baseUnit || 'دانه'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert Threshold Limit */}
              <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-sm font-black text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    تعیین حد هشدار کسری انبار (حداقل موجودی مجاز)
                  </label>
                  <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">واحد پایه: {formData.baseUnit || 'دانه'}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  هرگاه تعداد موجودی کالا در انبار کمتر یا مساوی این عدد شود، سیستم به طور خودکار هشدار کمبود موجودی صادر نموده و در گزارش کسری گدام و خرید قرار می‌دهد.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative w-40">
                    <input 
                      type="number" 
                      min="0" 
                      value={formData.minStock} 
                      onChange={e => setFormData({...formData, minStock: e.target.value})} 
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold font-mono text-center focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-xs" 
                      placeholder="مثلاً: 10" 
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{formData.baseUnit || 'دانه'}</span>
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

      {/* Mobile Card List View (Visible on Mobile) */}
      <div className="block md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 font-bold text-sm">
            کالایی با فیلترها و عبارت جستجوی فوق پیدا نگردید.
          </div>
        ) : (
          filteredProducts.map(p => {
            const isLow = p.stockInBaseUnits <= p.minStockInBaseUnits;
            const isSelected = selectedProductIds.includes(p.id);

            return (
              <div 
                key={p.id} 
                className={`bg-white p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds([...selectedProductIds, p.id]);
                        } else {
                          setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4 mt-0.5"
                    />
                    <img 
                      src={p.image || IMAGE_PRESETS[0].url} 
                      alt={p.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                      referrerPolicy="no-referrer" 
                    />
                    <div>
                      <h4 className="font-black text-slate-850 text-sm">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold">{p.category}</span>
                        <span className="font-mono text-[10px] text-slate-400">بارکد: {p.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isLow ? (
                      <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black px-2 py-1 rounded-lg inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        کسری انبار
                      </span>
                    ) : (
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg">
                        موجودی کافی
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock & Unit Breakdown */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">موجودی انبار:</span>
                    <span className="font-black text-emerald-700 text-sm font-mono">{formatStock(p.stockInBaseUnits, p.units)}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block">حد هشدار کسری:</span>
                    <span className="font-bold text-slate-700 font-mono">{p.minStockInBaseUnits} {p.baseUnit}</span>
                  </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                  <div className="bg-slate-50/70 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">خرید:</span>
                    {canViewCost ? (
                      <span className="font-bold text-slate-800 text-xs font-mono">{formatCurrency(p.costPriceAFN, 'AFN')}</span>
                    ) : (
                      <span className="font-bold text-slate-400 text-[10px]">محرمانه</span>
                    )}
                  </div>
                  <div className="bg-slate-50/70 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">عمده:</span>
                    <span className="font-bold text-indigo-700 text-xs font-mono">{formatCurrency(p.wholesalePriceAFN, 'AFN')}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold block">پرچون:</span>
                    <span className="font-black text-emerald-800 text-xs font-mono">{formatCurrency(p.retailPriceAFN, 'AFN')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setBarcodeProduct(p)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    چاپ بارکد
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    ویرایش
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteProductClick(p.id, p.name)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                      title="حذف کالا"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main product levels spreadsheet view (Desktop & Tablets) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-100 shadow-xs overflow-x-auto">
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
              <th className="p-3.5 text-left">
                {canViewCost ? 'قیمت خرید (افغانی)' : 'قیمت خرید (محرمانه)'}
              </th>
              <th className="p-3.5 text-left">نرخ عمده‌فروشی</th>
              <th className="p-3.5 text-left">نرخ تک‌فروشی</th>
              <th className="p-3.5 text-center">وضعیت انبار</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-400 font-bold text-sm">
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
                      {canViewCost ? (
                        <>
                          <span className="block text-slate-705">{formatCurrency(p.costPriceAFN, 'AFN')}</span>
                          <span className="block text-[10px] text-slate-400">${p.costPriceUSD.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Lock className="w-3 h-3" /> محرمانه
                        </span>
                      )}
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
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteProductClick(p.id, p.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="حذف دائمی کالا"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Bulk Discount Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in relative text-right">
            <div className="p-4 bg-purple-600 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Tag className="w-5 h-5" /> 
                اعمال تخفیف گروهی
              </h3>
              <button onClick={() => setIsDiscountModalOpen(false)} className="hover:text-purple-200"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleApplyBulkDiscount} className="p-5 space-y-4">
              <p className="text-sm font-bold text-slate-700">تخفیف روی {selectedProductIds.length} محصول اعمال می‌شود.</p>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">درصد تخفیف (%)</label>
                <input 
                  type="number" 
                  min="1" max="100" 
                  required 
                  value={discountPercentage} 
                  onChange={e => setDiscountPercentage(e.target.value)} 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-purple-500" 
                  placeholder="مثال: 15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">مدت زمان اعتبار (روز)</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  value={discountExpiryDays} 
                  onChange={e => setDiscountExpiryDays(e.target.value)} 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:border-purple-500" 
                  placeholder="مثال: 7"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsDiscountModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">لغو</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md flex items-center gap-2">
                  <Tag className="w-4 h-4" /> تایید و ثبت تخفیف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Low Stock Report & PDF Print Modal */}
      <LowStockReportModal 
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        products={state.products}
        exchangeRate={state.exchangeRate}
      />

      {/* Smart Price Tag Printing Modal */}
      <PriceTagPrintingModal 
        isOpen={isPriceTagModalOpen}
        onClose={() => setIsPriceTagModalOpen(false)}
        products={state.products}
        exchangeRate={state.exchangeRate}
      />

      {/* Excel Bulk Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onImport={(importedProducts) => {
          addProducts(importedProducts);
        }}
        existingCategories={categoriesList}
        exchangeRate={state.exchangeRate}
      />

      {/* Standalone Bulk Image Upload by Barcode Modal */}
      <BulkImageUploadModal
        isOpen={isBulkImageModalOpen}
        onClose={() => setIsBulkImageModalOpen(false)}
        products={state.products}
        onSaveImages={(updates) => {
          bulkUpdateProducts(updates);
        }}
      />

    </div>
  );
};
