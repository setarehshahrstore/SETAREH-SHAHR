import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle, AlertCircle, 
  HelpCircle, X, ArrowRight, RefreshCw, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Product } from '../types';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Download a clean, ready-to-use Afghan Persian Excel template
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
        "لینک عکس (اختیاری)": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250",
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
        "لینک عکس (اختیاری)": "",
        "تعداد در کارتن (اختیاری)": 24
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "لیست محصولات");
    
    // Set RTL and column widths
    worksheet['!cols'] = [
      { wch: 30 }, // نام کالا
      { wch: 18 }, // بارکد
      { wch: 16 }, // دسته‌بندی
      { wch: 12 }, // واحد
      { wch: 18 }, // خرید
      { wch: 20 }, // عمده
      { wch: 20 }, // پرچون
      { wch: 18 }, // موجودی
      { wch: 16 }, // هشدار
      { wch: 16 }, // موقعیت
      { wch: 25 }, // عکس
      { wch: 20 }, // کارتن
    ];

    XLSX.writeFile(workbook, "Setareh_Shahr_Products_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
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
          setIsProcessing(false);
          return;
        }

        const validProducts: Product[] = [];
        const validationErrors: string[] = [];

        rows.forEach((row, index) => {
          const rowNum = index + 2; // Accounting for Excel 1-based index and header

          // Flexible key mapping for Persian and English column headers
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
          const imageUrl = String(row['لینک عکس (اختیاری)'] || row['لینک عکس'] || row['عکس'] || row['Image'] || '').trim();
          const cartonMultiplier = parseInt(row['تعداد در کارتن (اختیاری)'] || row['تعداد در کارتن'] || row['Carton Qty'] || 0) || 0;

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
            image: imageUrl || '/supermarket.jpg',
            units: {
              piece: baseUnit || 'عدد',
              ...(cartonMultiplier > 0 ? { carton: { name: 'کارتن', multiplier: cartonMultiplier } } : {})
            }
          };

          validProducts.push(product);
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        }

        setParsedProducts(validProducts);
        if (validProducts.length > 0) {
          setStep('preview');
        }
      } catch (err: any) {
        setErrors([`خطا در خواندن فایل اکسل: ${err.message || 'فایل نامعتبر است'}`]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (parsedProducts.length === 0) return;
    onImport(parsedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">ورود دسته‌جمعی کالاها با فایل اکسل (Excel Bulk Import)</h3>
              <p className="text-xs text-slate-300">افزودن صدها قلم جنس و قیمت به گدام در چند ثانیه</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {step === 'upload' ? (
            <div className="space-y-6">
              
              {/* Template Download Box */}
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 p-5 rounded-2xl border border-amber-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-right">
                  <h4 className="font-black text-sm text-[#0B1F3A] flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-600" />
                    دانلود قالب استاندارد اکسل ستاره شهر
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    جهت جلوگیری از هرگونه ناهماهنگی، فایل اکسل نمونه را دریافت کرده، اطلاعات اقلام خود را در آن وارد کنید و سپس در همین صفحه آپلود نمایید.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="shrink-0 px-4 py-2.5 bg-[#0B1F3A] hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-black flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  دانلود فایل نمونه اکسل
                </button>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-3xl p-10 text-center cursor-pointer transition-all space-y-3"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-base">انتخاب یا رها کردن فایل اکسل در اینجا</h4>
                  <p className="text-xs text-slate-500 mt-1">فرمت‌های مجاز: XLSX, XLS, CSV (حداکثر تا ۵۰۰۰ ردیف)</p>
                </div>
                {isProcessing && (
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    در حال پردازش و استخراج محصولات...
                  </div>
                )}
              </div>

              {/* Guide Points */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-black text-slate-800 block text-xs mb-1">نکات کلیدی ثبت اکسل:</span>
                <p>• نام ستون‌ها می‌تواند فارسی یا انگلیسی باشد (مانند "نام کالا"، "قیمت خرید"، "قیمت فروش عمده").</p>
                <p>• سیستم نرخ دالری و افغانی را به طور خودکار بر اساس نرخ لحظه‌ای صرافی ($1 = {exchangeRate} افغانی) محاسبه و ثبت می‌کند.</p>
                <p>• در صورت تکراری بودن بارکد، مشخصات کالای موجود در دیتابیس بروزرسانی خواهد شد.</p>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-sm text-slate-900">
                    تعداد <span className="font-mono text-emerald-700 text-base">{parsedProducts.length}</span> محصول با موفقیت آماده ورود شد
                  </span>
                </div>
                <button
                  onClick={() => { setStep('upload'); setParsedProducts([]); }}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  انتخاب فایل دیگر
                </button>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">نام محصول</th>
                      <th className="p-2.5">بارکد</th>
                      <th className="p-2.5">صنف</th>
                      <th className="p-2.5">موجودی</th>
                      <th className="p-2.5">خرید (AFN)</th>
                      <th className="p-2.5">عمده (AFN)</th>
                      <th className="p-2.5">پرچون (AFN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedProducts.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2.5 font-mono text-slate-500 text-[11px]">{p.sku}</td>
                        <td className="p-2.5 text-slate-600">{p.category}</td>
                        <td className="p-2.5 font-bold text-emerald-700 font-mono">{p.stockInBaseUnits} {p.baseUnit}</td>
                        <td className="p-2.5 font-mono text-slate-700">{p.costPriceAFN.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-indigo-700 font-bold">{p.wholesalePriceAFN.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-emerald-800 font-bold">{p.retailPriceAFN.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Errors list if any */}
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            انصراف
          </button>

          {step === 'preview' && (
            <button
              onClick={handleConfirmImport}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              تأیید و ذخیره {parsedProducts.length} کالا در پایگاه‌داده
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
