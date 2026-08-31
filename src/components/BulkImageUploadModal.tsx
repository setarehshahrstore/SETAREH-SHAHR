import React, { useState, useRef } from 'react';
import { 
  Images, Upload, CheckCircle2, AlertTriangle, X, 
  RefreshCw, Check, Sparkles, Image as ImageIcon, Barcode, Trash2
} from 'lucide-react';
import { Product } from '../types';
import { normalizeBarcode, compressImageFile } from '../utils/imageOptimizer';

interface BulkImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveImages: (updates: { id: string; image: string }[]) => void;
}

interface ProcessedImageMatch {
  file: File;
  fileName: string;
  extractedBarcode: string;
  dataUrl: string;
  matchedProduct: Product | null;
  status: 'matched' | 'unmatched';
}

export const BulkImageUploadModal: React.FC<BulkImageUploadModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveImages,
}) => {
  const [matches, setMatches] = useState<ProcessedImageMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const fileList = Array.from(files);
    setProcessingProgress({ current: 0, total: fileList.length });

    const newMatches: ProcessedImageMatch[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const rawName = file.name;
      const extractedBarcode = normalizeBarcode(rawName);

      try {
        // Compress image to save bandwidth and Firestore payload
        const dataUrl = await compressImageFile(file, 600, 600, 0.82);

        // Find product with matching SKU/Barcode or ID or Name
        const matched = products.find(p => {
          const normSku = normalizeBarcode(p.sku);
          const normId = normalizeBarcode(p.id);
          const normName = normalizeBarcode(p.name);
          return (
            normSku === extractedBarcode ||
            normId === extractedBarcode ||
            (extractedBarcode.length > 3 && normName.includes(extractedBarcode)) ||
            (normSku && extractedBarcode.includes(normSku))
          );
        }) || null;

        newMatches.push({
          file,
          fileName: rawName,
          extractedBarcode,
          dataUrl,
          matchedProduct: matched,
          status: matched ? 'matched' : 'unmatched'
        });
      } catch (err) {
        console.error('Error processing image:', file.name, err);
      }

      setProcessingProgress({ current: i + 1, total: fileList.length });
    }

    setMatches(prev => [...prev, ...newMatches]);
    setIsProcessing(false);

    // Reset input so user can pick again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveItem = (index: number) => {
    setMatches(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleApplyMatches = () => {
    const matchedItems = matches.filter(m => m.status === 'matched' && m.matchedProduct);
    if (matchedItems.length === 0) return;

    const updates = matchedItems.map(m => ({
      id: m.matchedProduct!.id,
      image: m.dataUrl
    }));

    onSaveImages(updates);
    onClose();
  };

  const matchedCount = matches.filter(m => m.status === 'matched').length;
  const unmatchedCount = matches.filter(m => m.status === 'unmatched').length;

  return (
    <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#0B1F3A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                آپلود عمومی و دسته‌جمعی عکس‌ها (شناسایی با بارکد)
                <span className="bg-amber-400/20 text-amber-300 text-[11px] px-2 py-0.5 rounded-full border border-amber-400/30">
                  هوشمند
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                نام فایل هر عکس باید بارکد کالا باشد (مثال: <span className="font-mono text-amber-300">6260123456789.jpg</span>). سیستم خودکار آن را به محصول وصل می‌کند.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
          
          {/* Top instruction card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                روش کار ساده: عکس‌ها را به نام بارکد ذخیره و یکجا انتخاب کنید
              </div>
              <p className="text-slate-600 leading-relaxed">
                نیازی به قرار دادن لینک عکس در اکسل نیست. کافیست عکس‌های گرفته شده از اجناس را با نام بارکدشان در کامپیوتر ذخیره کنید (مثلاً <code className="bg-white px-1.5 py-0.5 rounded text-indigo-700 font-mono">1001.jpg</code> یا <code className="bg-white px-1.5 py-0.5 rounded text-indigo-700 font-mono">6260123456789.png</code>).
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              انتخاب عکس‌ها از کامپیوتر
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/20 rounded-3xl p-6 text-center cursor-pointer transition-all space-y-2"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              multiple 
              onChange={handleFileSelection} 
              className="hidden" 
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center shadow-xs">
              <Images className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">برای انتخاب چند عکس باهم، اینجا کلیک کنید یا عکس‌ها را بکشید و رها کنید</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">می‌توانید ده‌ها یا صدها عکس را با کلید Ctrl + A همزمان انتخاب کنید</p>
            </div>
            {isProcessing && (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                در حال پردازش و تطبیق ({processingProgress.current} از {processingProgress.total})...
              </div>
            )}
          </div>

          {/* Summary Status Bar */}
          {matches.length > 0 && (
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl text-xs font-bold">
              <div className="flex items-center gap-4">
                <span className="text-slate-700">کل عکس‌های انتخاب شده: <span className="font-mono text-slate-900">{matches.length}</span></span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  منطبق با کالاها: <span className="font-mono text-emerald-800 text-sm">{matchedCount}</span>
                </span>
                {unmatchedCount > 0 && (
                  <span className="text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    بدون کالا (بارکد ناموجود): <span className="font-mono text-amber-800">{unmatchedCount}</span>
                  </span>
                )}
              </div>
              <button
                onClick={() => setMatches([])}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                پاک کردن لیست
              </button>
            </div>
          )}

          {/* Grid of Matched / Unmatched Photos */}
          {matches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
              {matches.map((item, idx) => (
                <div 
                  key={idx}
                  className={`border rounded-2xl p-3 flex items-center gap-3 relative transition-all ${
                    item.status === 'matched' 
                      ? 'border-emerald-200 bg-emerald-50/40' 
                      : 'border-amber-200 bg-amber-50/40'
                  }`}
                >
                  {/* Image preview */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                    <img src={item.dataUrl} alt={item.fileName} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-right space-y-0.5">
                    <div className="flex items-center gap-1">
                      {item.status === 'matched' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                          <Check className="w-3 h-3" />
                          منطبق شد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          بدون بارکد
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{item.fileName}</span>
                    </div>

                    {item.matchedProduct ? (
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 truncate">{item.matchedProduct.name}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          {item.matchedProduct.sku}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] text-amber-900 font-bold block">کالایی با این بارکد یافت نشد:</span>
                        <span className="text-[10px] font-mono text-amber-700">{item.extractedBarcode || 'ناشناخته'}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove single item button */}
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                    title="حذف از لیست"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            بستن
          </button>

          {matchedCount > 0 && (
            <button
              onClick={handleApplyMatches}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              تأیید و ذخیره {matchedCount} تصویر روی کالاها در دیتابیس
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
