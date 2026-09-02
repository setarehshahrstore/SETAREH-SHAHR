import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, 
  X, RefreshCw, Images, Sparkles, Image as ImageIcon,
  Check, Archive, ShieldAlert, Lock, ArrowRight, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product } from '../types';
import { normalizeBarcode, compressImageFile } from '../utils/imageOptimizer';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
  existingCategories: string[];
  exchangeRate: number;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCategories,
  exchangeRate
}) => {
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [imageMatchStats, setImageMatchStats] = useState({ matched: 0, totalFiles: 0 });
  const [fileName, setFileName] = useState('');
  const [singleImageTargetId, setSingleImageTargetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);
  const singleImageInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Check if a product has a real custom photo
  const hasValidPhoto = (p: Product) => {
    return Boolean(
      p.image && 
      p.image !== '/supermarket.jpg' && 
      !p.image.includes('placeholder') &&
      p.image.trim() !== ''
    );
  };

  const totalCount = parsedProducts.length;
  const withImageCount = parsedProducts.filter(hasValidPhoto).length;
  const missingImageCount = totalCount - withImageCount;
  const allImagesReady = totalCount > 0 && missingImageCount === 0;

  // Download template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        "نام کالا": "روغن نباتی ۵ لیتری لادن",
        "بارکد (SKU)": "6260123456789",
        "دسته‌بندی": "مواد خوراکی",
        "واحد اصلی": "عدد",
        "قیمت خرید (افغانی)": 750,
        "قیمت فروش عمده (افغانی)": 800,
        "قیمت فروش پرچون (افغانی)": 850,
        "موجودی انبار (تعداد)": 100,
        "حداقل هشدار کسری": 15,
        "موقعیت انبار": "قفسه B-01",
        "تعداد در کارتن (اختیاری)": 4
      },
      {
        "نام کالا": "چای سبز درجه یک ۲۵۰ گرمی",
        "بارکد (SKU)": "6260987654321",
        "دسته‌بندی": "نوشیدنی‌ها",
        "واحد اصلی": "بسته",
        "قیمت خرید (افغانی)": 180,
        "قیمت فروش عمده (افغانی)": 200,
        "قیمت فروش پرچون (افغانی)": 230,
        "موجودی انبار (تعداد)": 250,
        "حداقل هشدار کسری": 20,
        "موقعیت انبار": "قفسه A-04",
        "تعداد در کارتن (اختیاری)": 24
      },
      {
        "نام کالا": "پودر لباسشویی ۵۰۰ گرمی پرسیل",
        "بارکد (SKU)": "6260555444333",
        "دسته‌بندی": "مواد شوینده و بهداشتی",
        "واحد اصلی": "عدد",
        "قیمت خرید (افغانی)": 95,
        "قیمت فروش عمده (افغانی)": 105,
        "قیمت فروش پرچون (افغانی)": 120,
        "موجودی انبار (تعداد)": 180,
        "حداقل هشدار کسری": 30,
        "موقعیت انبار": "قفسه C-02",
        "تعداد در کارتن (اختیاری)": 12
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "لیست محصولات");
    
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 }
    ];

    XLSX.writeFile(workbook, "Setareh_Shahr_Products_Template.xlsx");
  };

  // Excel parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessingExcel(true);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rows.length === 0) {
          setErrors(['فایل اکسل انتخاب شده خالی است. لطفاً فایل حاوی لیست محصولات را انتخاب نمایید.']);
          setIsProcessingExcel(false);
          return;
        }

        const validProducts: Product[] = [];
        const validationErrors: string[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2;

          const name = String(row['نام کالا'] || row['نام محصول'] || row['Name'] || row['Product Name'] || '').trim();
          const sku = String(row['بارکد (SKU)'] || row['بارکد'] || row['کد کالا'] || row['SKU'] || row['Barcode'] || `SKU-${Date.now()}-${index}`).trim();
          const category = String(row['دسته‌بندی'] || row['صنف'] || row['Category'] || 'عمومی').trim();
          const baseUnit = String(row['واحد اصلی'] || row['واحد'] || row['Base Unit'] || 'عدد').trim();

          const costAFN = parseFloat(row['قیمت خرید (افغانی)'] || row['خرید افغانی'] || row['Cost AFN'] || row['CostPriceAFN'] || 0) || 0;
          const wholesaleAFN = parseFloat(row['قیمت فروش عمده (افغانی)'] || row['عمده افغانی'] || row['Wholesale AFN'] || row['WholesalePriceAFN'] || 0) || 0;
          const retailAFN = parseFloat(row['قیمت فروش پرچون (افغانی)'] || row['پرچون افغانی'] || row['Retail AFN'] || row['RetailPriceAFN'] || 0) || 0;
          
          const stock = parseInt(row['موجودی انبار (تعداد)'] || row['موجودی'] || row['تعداد'] || row['Stock'] || 0) || 0;
          const minStock = parseInt(row['حداقل هشدار کسری'] || row['هشدار کسری'] || row['Min Stock'] || 5) || 5;
          const location = String(row['موقعیت انبار'] || row['موقعیت'] || row['Location'] || '').trim();
          const cartonMultiplier = parseInt(row['تعداد در کارتن (اختیاری)'] || row['تعداد در کارتن'] || row['Carton Qty'] || 0) || 0;
            const minWholesaleQty = parseInt(row['حداقل فروش عمده (تعداد)'] || row['حداقل عمده'] || row['Min Wholesale Qty'] || 0) || undefined;
            const minWholesaleUnit = String(row['واحد فروش عمده'] || row['واحد عمده'] || row['Wholesale Unit'] || '').trim() || undefined;

          if (!name) {
            validationErrors.push(`سطر ${rowNum}: نام کالا الزامی است.`);
            return;
          }

          const currentRate = exchangeRate || 72.5;
          const costUSD = Number((costAFN / currentRate).toFixed(2));
          const wholesaleUSD = Number((wholesaleAFN / currentRate).toFixed(2));
          const retailUSD = Number((retailAFN / currentRate).toFixed(2));

          const product: Product = {
            id: `prod-xl-${Date.now()}-${index}`,
            name,
            sku,
            category: category || 'عمومی',
            baseUnit: baseUnit || 'عدد',
            costPriceAFN: costAFN,
            costPriceUSD: costUSD,
            wholesalePriceAFN: wholesaleAFN,
            wholesalePriceUSD: wholesaleUSD,
            retailPriceAFN: retailAFN,
            retailPriceUSD: retailUSD,
            stockInBaseUnits: stock,
            minStockInBaseUnits: minStock,
            location: location || undefined,
            image: '/supermarket.jpg', // Default placeholder until custom photo is uploaded
            units: {
              piece: baseUnit || 'عدد',
              ...(cartonMultiplier > 0 ? { carton: { name: 'کارتن', multiplier: cartonMultiplier } } : {})
            },
              minWholesaleQty,
              minWholesaleUnit,
            status: 'draft',
            isDraft: true
          };

          validProducts.push(product);
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        }

        setParsedProducts(validProducts);
      } catch (err: any) {
        setErrors([`خطا در خواندن فایل اکسل: ${err.message || 'فایل نامعتبر است'}`]);
      } finally {
        setIsProcessingExcel(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Bulk matching photos by Barcode / SKU
  const handleBulkImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (parsedProducts.length === 0) {
      setErrors(['لطفاً ابتدا فایل اکسل محصولات را انتخاب کنید، سپس دکمه آپلود عکس با بارکد را بزنید تا عکس‌ها به محصولات اکسل وصل شوند.']);
      if (imagesInputRef.current) imagesInputRef.current.value = '';
      return;
    }

    setIsProcessingImages(true);
    const fileList = Array.from(files);
    let matchedCounter = 0;

    const updated = [...parsedProducts];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const barcodeFromFilename = normalizeBarcode(file.name);

      try {
        const compressedDataUrl = await compressImageFile(file, 600, 600, 0.82);

        // Find match in parsed products
        const matchIndex = updated.findIndex(p => {
          const normSku = normalizeBarcode(p.sku);
          const normId = normalizeBarcode(p.id);
          const normName = normalizeBarcode(p.name);
          return (
            normSku === barcodeFromFilename ||
            normId === barcodeFromFilename ||
            (barcodeFromFilename.length > 3 && normName.includes(barcodeFromFilename)) ||
            (normSku && barcodeFromFilename.includes(normSku))
          );
        });

        if (matchIndex !== -1) {
          updated[matchIndex] = {
            ...updated[matchIndex],
            image: compressedDataUrl
          };
          matchedCounter++;
        }
      } catch (err) {
        console.error('Error optimizing image:', file.name, err);
      }
    }

    setParsedProducts(updated);
    setImageMatchStats({ matched: matchedCounter, totalFiles: fileList.length });
    setIsProcessingImages(false);

    if (imagesInputRef.current) {
      imagesInputRef.current.value = '';
    }
  };

  // Single Product Image Upload
  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !singleImageTargetId) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 600, 600, 0.82);
      setParsedProducts(prev => prev.map(p => p.id === singleImageTargetId ? { ...p, image: compressedDataUrl } : p));
    } catch (err) {
      console.error('Failed to update single product image:', err);
    } finally {
      setSingleImageTargetId(null);
      if (singleImageInputRef.current) {
        singleImageInputRef.current.value = '';
      }
    }
  };

  // Action: Save to Draft / Archive
  const handleSaveToDrafts = () => {
    if (parsedProducts.length === 0) return;
    const draftProducts = parsedProducts.map(p => ({
      ...p,
      status: 'draft' as const,
      isDraft: true
    }));
    onImport(draftProducts);
    onClose();
  };

  // Action: Final Publish (Requires all photos to be present)
  const handleFinalPublish = () => {
    if (!allImagesReady) return;
    const publishedProducts = parsedProducts.map(p => ({
      ...p,
      status: 'published' as const,
      isDraft: false
    }));
    onImport(publishedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[94vh]">
        
        {/* Hidden inputs */}
        <input 
          type="file"
          ref={singleImageInputRef}
          accept="image/*"
          onChange={handleSingleImageUpload}
          className="hidden"
        />
        <input 
          type="file"
          ref={imagesInputRef}
          accept="image/*"
          multiple
          onChange={handleBulkImagesUpload}
          className="hidden"
        />
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* Header */}
        <div className="p-5 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">ورود دسته‌جمعی کالاها با فایل اکسل و آپلود عکس</h3>
              <p className="text-xs text-slate-300">
                استخراج اکسل و تطبیق عکس‌ها در همین پنجره — کنترل انتشار بر اساس وجود عکس
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-right">
          
          {/* Top 2-in-1 Control Cards: 1. Excel File & 2. Photo Upload Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Excel File Selection */}
            <div className="bg-slate-50 border-2 border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">۱</span>
                    <h4 className="text-xs font-black text-slate-900">انتخاب فایل اکسل کالاها</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    فایل اکسل شامل نام کالا، بارکد، صنف و قیمت‌ها
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-black flex items-center gap-1 shrink-0 cursor-pointer"
                  title="دانلود قالب اکسل ستاره شهر"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  قالب نمونه
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingExcel}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {isProcessingExcel ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      در حال پردازش اکسل...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {fileName ? `تغییر فایل: ${fileName.slice(0, 18)}...` : 'انتخاب فایل اکسل (Excel)'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Bulk Photos with Barcode (The Purple Button) */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-blue-50/80 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">۲</span>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>آپلود عکس با بارکد</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded-md font-bold">اتصال خودکار</span>
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  عکس‌های کالاها را با نام بارکد انتخاب کنید تا به کالاهای اکسل متصل شوند.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {/* The EXACT Purple Button requested by user, always visible in this window */}
                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={isProcessingImages}
                  className="w-full py-2.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition-all cursor-pointer active:scale-95"
                >
                  {isProcessingImages ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      در حال اتصال عکس‌ها...
                    </>
                  ) : (
                    <>
                      <Images className="w-4 h-4" />
                      <span>آپلود عکس با بارکد</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* If Excel is NOT loaded yet: friendly guide */}
          {parsedProducts.length === 0 && !isProcessingExcel && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20 rounded-3xl p-8 text-center cursor-pointer transition-all space-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <h4 className="font-black text-slate-800 text-sm">برای شروع، فایل اکسل محصولات را در اینجا رها یا انتخاب کنید</h4>
              <p className="text-xs text-slate-500">
                به محض انتخاب فایل اکسل، سیستم لیست کالاها را استخراج نموده و عکس‌های آنها را درخواست می‌کند.
              </p>
            </div>
          )}

          {/* Once Excel is loaded: Show Live Stats, Missing Images Alert, and Products Table */}
          {parsedProducts.length > 0 && (
            <div className="space-y-4">
              
              {/* Product & Photo Status Live Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold">تعداد کل محصولات اکسل</p>
                    <h4 className="text-lg font-black text-slate-900 font-mono mt-0.5">{totalCount} کالا</h4>
                  </div>
                  <FileSpreadsheet className="w-7 h-7 text-slate-400" />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-emerald-700 font-bold">عکس‌های تکمیل شده</p>
                    <h4 className="text-lg font-black text-emerald-800 font-mono mt-0.5">{withImageCount} کالا</h4>
                  </div>
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>

                <div className={`rounded-2xl p-3.5 flex items-center justify-between border ${
                  missingImageCount > 0 
                    ? 'bg-rose-50 border-rose-300 text-rose-800' 
                    : 'bg-teal-50 border-teal-200 text-teal-800'
                }`}>
                  <div>
                    <p className="text-[11px] font-bold">عکس ناموجود (بدون تصویر)</p>
                    <h4 className="text-lg font-black font-mono mt-0.5">
                      {missingImageCount > 0 ? `${missingImageCount} کالا فاقد عکس` : 'تمام عکس‌ها تکمیل شد ✓'}
                    </h4>
                  </div>
                  {missingImageCount > 0 ? (
                    <AlertCircle className="w-7 h-7 text-rose-600 animate-pulse" />
                  ) : (
                    <Sparkles className="w-7 h-7 text-teal-600" />
                  )}
                </div>
              </div>

              {/* Requirement Alert Banner */}
              {missingImageCount > 0 ? (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-black text-xs text-amber-950">
                        قفل انتشار فعال است: به تعداد <span className="underline font-mono text-sm text-rose-600 font-black">{missingImageCount} محصول</span> عکس ناموجود است!
                      </p>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        تا قبل از بارگذاری عکس تمام کالاها، امکان پابلیش در فروشگاه وجود ندارد. لطفاً دکمه بنفش <strong>«آپلود عکس با بارکد»</strong> را بزنید یا کالاها را در <strong>«بایگانی / درفت»</strong> ذخیره کنید.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => imagesInputRef.current?.click()}
                    className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Images className="w-4 h-4" />
                    انتخاب عکس‌ها هم‌اکنون
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-black text-xs text-emerald-900">
                      عالی است! تمام {totalCount} کالا دارای عکس شدند و قفل انتشار باز شد.
                    </p>
                  </div>
                </div>
              )}

              {/* Products Table with Inline Image View & Upload */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">وضعیت عکس</th>
                      <th className="p-2.5">نام محصول</th>
                      <th className="p-2.5">بارکد (SKU)</th>
                      <th className="p-2.5">صنف</th>
                      <th className="p-2.5">موجودی</th>
                      <th className="p-2.5">خرید (AFN)</th>
                      <th className="p-2.5">پرچون (AFN)</th>
                      <th className="p-2.5 text-center">عملیات عکس</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedProducts.map((p, idx) => {
                      const hasImage = hasValidPhoto(p);
                      return (
                        <tr key={p.id} className={`hover:bg-slate-50 ${!hasImage ? 'bg-rose-50/25' : ''}`}>
                          <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-white relative shrink-0 shadow-2xs">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                {hasImage ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> عکس موجود
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" /> عکس ناموجود
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                          <td className="p-2.5 font-mono text-slate-600 text-[11px]">{p.sku}</td>
                          <td className="p-2.5 text-slate-600">{p.category}</td>
                          <td className="p-2.5 font-bold text-emerald-700 font-mono">{p.stockInBaseUnits} {p.baseUnit}</td>
                          <td className="p-2.5 font-mono text-slate-700">{p.costPriceAFN.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-emerald-800 font-bold">{p.retailPriceAFN.toLocaleString()}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSingleImageTargetId(p.id);
                                singleImageInputRef.current?.click();
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 mx-auto"
                              title="انتخاب عکس برای این کالا"
                            >
                              <ImageIcon className="w-3 h-3 text-indigo-600" />
                              {hasImage ? 'تغییر عکس' : 'آپلود عکس'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-xs text-rose-700">
              <span className="font-black flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> پیام‌های خطا:
              </span>
              {errors.map((err, i) => (
                <p key={i} className="text-rose-600">• {err}</p>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            انصراف
          </button>

          {parsedProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Save to Draft / Archive Button (Always available) */}
              <button
                onClick={handleSaveToDrafts}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                title="ذخیره کالاها در بایگانی یا درفت بدون انتشار در فروشگاه تا زمان تکمیل عکس‌ها"
              >
                <Archive className="w-4 h-4" />
                ذخیره در بایگانی / درفت ({parsedProducts.length} کالا)
              </button>

              {/* Publish & Save to Live Store Button (Only when all photos are ready) */}
              <button
                onClick={handleFinalPublish}
                disabled={!allImagesReady}
                className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 ${
                  allImagesReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'
                }`}
                title={allImagesReady ? 'ثبت و انتشار رسمی در فروشگاه' : `انتشار قفل است: ${missingImageCount} کالا بدون عکس است`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {allImagesReady
                  ? `ثبت و پابلیش در فروشگاه (${parsedProducts.length} کالا)`
                  : `قفل انتشار (${missingImageCount} محصول عکس ناموجود است)`}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
