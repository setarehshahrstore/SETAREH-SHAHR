import React, { useRef } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { 
  AlertTriangle, 
  Printer, 
  Download, 
  X, 
  ShoppingBag, 
  FileText, 
  CheckCircle,
  Building2,
  Calendar,
  Layers,
  Phone
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  exchangeRate: number;
}

export const LowStockReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  exchangeRate
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const lowStockItems = products.filter(p => p.stockInBaseUnits <= p.minStockInBaseUnits);

  // Total shortage estimation
  const totalItemsDeficit = lowStockItems.reduce((acc, p) => {
    const deficit = Math.max(0, p.minStockInBaseUnits - p.stockInBaseUnits + 10);
    return acc + deficit;
  }, 0);

  const totalEstimatedCostUSD = lowStockItems.reduce((acc, p) => {
    const deficit = Math.max(1, p.minStockInBaseUnits - p.stockInBaseUnits + 5);
    return acc + (deficit * p.costPriceUSD);
  }, 0);

  const totalEstimatedCostAFN = totalEstimatedCostUSD * exchangeRate;

  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'فروشگاه ستاره شهر';
  const storePhone = localStorage.getItem('AFG_STORE_PHONE') || '0799445566';
  const storeAddress = localStorage.getItem('AFG_STORE_ADDRESS') || 'کابل، افغانستان';
  const currentDate = new Intl.DateTimeFormat('fa-AF', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date());

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalTitle = document.title;
    document.title = `گزارش_کسری_و_خرید_کالا_${new Date().toISOString().split('T')[0]}`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <title>گزارش کسر موجودی و لیست خرید گدام</title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }
            body {
              font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif;
              direction: rtl;
              text-align: right;
              color: #0f172a;
              margin: 0;
              padding: 10px;
              font-size: 12px;
            }
            .header-box {
              border-bottom: 2px solid #0b1f3a;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .shop-title {
              font-size: 18px;
              font-weight: 900;
              color: #0b1f3a;
              margin-bottom: 4px;
            }
            .report-title {
              font-size: 14px;
              font-weight: bold;
              color: #b91c1c;
            }
            .meta-text {
              font-size: 11px;
              color: #475569;
            }
            .summary-cards {
              display: flex;
              gap: 12px;
              margin-bottom: 16px;
            }
            .card {
              flex: 1;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 8px 12px;
            }
            .card-label {
              font-size: 10px;
              color: #64748b;
              font-weight: bold;
            }
            .card-value {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 11px;
            }
            th {
              background-color: #0b1f3a;
              color: #ffffff;
              padding: 8px 6px;
              text-align: right;
              font-weight: bold;
              border: 1px solid #0b1f3a;
            }
            td {
              padding: 6px 8px;
              border: 1px solid #cbd5e1;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .danger-badge {
              background-color: #fee2e2;
              color: #991b1b;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              display: inline-block;
            }
            .footer-sign {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              padding-top: 20px;
              border-top: 1px dashed #cbd5e1;
            }
            .sign-box {
              width: 180px;
              text-align: center;
              font-size: 11px;
              color: #475569;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <div class="shop-title">${storeName}</div>
              <div class="meta-text">${storeAddress} | شماره تماس: ${storePhone}</div>
            </div>
            <div style="text-align: left;">
              <div class="report-title">📋 لیست کسری و سفارش خرید کالا</div>
              <div class="meta-text">تاریخ گزارش: ${currentDate}</div>
              <div class="meta-text">نرخ مبنای تسعیر: ۱ دالر = ${exchangeRate} افغانی</div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-label">تعداد اقلام رو به اتمام</div>
              <div class="card-value" style="color: #b91c1c;">${lowStockItems.length} قلم کالا</div>
            </div>
            <div class="card">
              <div class="card-label">تخمین بودجه خرید (دالر)</div>
              <div class="card-value">$${totalEstimatedCostUSD.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-label">تخمین بودجه خرید (افغانی)</div>
              <div class="card-value">${totalEstimatedCostAFN.toLocaleString()} افغانی</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>نام و مشخصات کالا</th>
                <th>بارکد / کد</th>
                <th>دسته‌بندی</th>
                <th style="text-align: center;">موجودی فعلی</th>
                <th style="text-align: center;">حداقل مجاز</th>
                <th style="text-align: center;">کسری پیشنهادی</th>
                <th>قیمت تخمینی خرید (USD)</th>
                <th>مبلغ کل تخمینی (AFN)</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems.map((p, idx) => {
                const suggestedRestock = Math.max(5, (p.minStockInBaseUnits * 2) - p.stockInBaseUnits);
                const totalItemCostAFN = suggestedRestock * p.costPriceUSD * exchangeRate;
                return `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                    <td style="font-weight: bold;">${p.name}</td>
                    <td style="font-family: monospace;">${p.sku || '-'}</td>
                    <td>${p.category || 'عمومی'}</td>
                    <td style="text-align: center;"><span class="danger-badge">${p.stockInBaseUnits} ${p.baseUnit}</span></td>
                    <td style="text-align: center;">${p.minStockInBaseUnits} ${p.baseUnit}</td>
                    <td style="text-align: center; font-weight: bold; color: #1e3a8a;">+ ${suggestedRestock} ${p.baseUnit}</td>
                    <td style="font-family: monospace;">$${p.costPriceUSD.toFixed(2)}</td>
                    <td style="font-weight: bold; font-family: monospace;">${Math.round(totalItemCostAFN).toLocaleString()} افغانی</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-box">امضای مسئول گدام و انبار<br><br>.........................</div>
            <div class="sign-box">امضای مدیر تدارکات و خرید<br><br>.........................</div>
            <div class="sign-box">تایید مدیریت کل فروشگاه<br><br>.........................</div>
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
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-l from-[#0B1F3A] to-[#15345d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">لیست و گزارش کالاهای با موجودی کم (کسری انبار)</h2>
              <p className="text-xs text-slate-300">آماده‌سازی سفارش خرید، فاکتورهای کسری و چاپ فرم خرید برای مسئول تدارکات</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-rose-700 block mb-1">تعداد اقلام زیر حد هشدار</span>
              <span className="text-2xl font-black text-rose-900 font-mono">{lowStockItems.length} قلم</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">تخمین بودجه خرید (دالر)</span>
              <span className="text-2xl font-black text-slate-800 font-mono">${totalEstimatedCostUSD.toFixed(2)}</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-amber-800 block mb-1">تخمین بودجه خرید (افغانی)</span>
              <span className="text-2xl font-black text-amber-900 font-mono">{Math.round(totalEstimatedCostAFN).toLocaleString()} AFN</span>
            </div>
          </div>

          {/* Low Stock Table */}
          {lowStockItems.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">نام محصول</th>
                    <th className="p-3">دسته‌بندی</th>
                    <th className="p-3 text-center">موجودی فعلی</th>
                    <th className="p-3 text-center">حد هشدار</th>
                    <th className="p-3 text-center">پیشنهاد خرید</th>
                    <th className="p-3">قیمت خرید (دالر)</th>
                    <th className="p-3">مبلغ تخمینی (افغانی)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((p, idx) => {
                    const suggested = Math.max(5, (p.minStockInBaseUnits * 2) - p.stockInBaseUnits);
                    const costAFN = suggested * p.costPriceUSD * exchangeRate;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-black text-slate-800">{p.name}</td>
                        <td className="p-3 text-slate-500">{p.category}</td>
                        <td className="p-3 text-center">
                          <span className="bg-rose-100 text-rose-800 font-black px-2.5 py-0.5 rounded-md border border-rose-200 font-mono">
                            {p.stockInBaseUnits} {p.baseUnit}
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-600 font-mono">
                          {p.minStockInBaseUnits} {p.baseUnit}
                        </td>
                        <td className="p-3 text-center font-black text-indigo-700 font-mono">
                          +{suggested} {p.baseUnit}
                        </td>
                        <td className="p-3 text-slate-700 font-mono font-bold">${p.costPriceUSD.toFixed(2)}</td>
                        <td className="p-3 font-black text-slate-900 font-mono">{Math.round(costAFN).toLocaleString()} ؋</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 font-bold">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
              تمامی اجناس انبار دارای موجودی کافی و بالاتر از حد هشدار می‌باشند.
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            گزارش قابل ذخیره به فرمت PDF یا ارسال مستقیم به پرینترهای متصل می‌باشد.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              بستن
            </button>

            {lowStockItems.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 bg-[#0B1F3A] hover:bg-[#15345d] text-amber-300 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                چاپ مستقیم و ذخیره PDF گزارش کسری
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
