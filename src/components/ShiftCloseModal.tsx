import React, { useEffect } from 'react';
import { useAppState } from '../AppContext';
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ShiftCloseModalProps {
  onClose: () => void;
}

export const ShiftCloseModal: React.FC<ShiftCloseModalProps> = ({ onClose }) => {
  const { state } = useAppState();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Calculate today's metrics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todaySales = state.sales.filter(s => new Date(s.date) >= todayStart);
  
  // Aggregation
  let cashAFN = 0, cashUSD = 0;
  let cardCheckAFN = 0, cardCheckUSD = 0;
  let debtAFN = 0, debtUSD = 0;

  todaySales.forEach(sale => {
    // Categorize the 'paid' amount based on paymentMethod
    if (sale.paymentMethod === 'Cash' || sale.paymentMethod === 'Partial') {
      cashAFN += sale.paidAFN;
      cashUSD += sale.paidUSD;
    } else if (sale.paymentMethod === 'Card' || sale.paymentMethod === 'Check') {
      cardCheckAFN += sale.paidAFN;
      cardCheckUSD += sale.paidUSD;
    }
    
    // Debt is total minus paid
    const saleDebtAFN = sale.finalAFN - sale.paidAFN;
    const saleDebtUSD = sale.finalUSD - sale.paidUSD;
    
    if (saleDebtAFN > 0) debtAFN += saleDebtAFN;
    if (saleDebtUSD > 0) debtUSD += saleDebtUSD;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto print:max-h-none print:shadow-none print:rounded-none print:w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 bg-slate-800 text-white flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black">گزارش بستن شیفت (امروز)</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Printable Area */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 print:overflow-visible print:p-4" dir="rtl">
          <div className="text-center mb-6 border-b-2 border-slate-200 pb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] mb-1.5">فروشگاه ستاره شهر</h1>
            <h2 className="text-lg font-bold text-slate-600 mb-3">گزارش پایان روز (شیفت)</h2>
            <div className="text-xs sm:text-sm text-slate-500 font-mono">
              تاریخ و ساعت گزارش: {new Date().toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 print:border-black">
              <h3 className="font-black text-emerald-900 mb-3 border-b border-emerald-200 pb-2 text-sm sm:text-base">دریافتی نقد (صندوق)</h3>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm text-emerald-800">افغانی:</span>
                <span className="font-mono font-bold text-base sm:text-lg text-emerald-950">{formatCurrency(cashAFN, 'AFN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-emerald-800">دالر:</span>
                <span className="font-mono font-bold text-base sm:text-lg text-emerald-950" dir="ltr">${cashUSD.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 print:border-black">
              <h3 className="font-black text-blue-900 mb-3 border-b border-blue-200 pb-2 text-sm sm:text-base">کارت و چک</h3>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs sm:text-sm text-blue-800">افغانی:</span>
                <span className="font-mono font-bold text-base sm:text-lg text-blue-950">{formatCurrency(cardCheckAFN, 'AFN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-blue-800">دالر:</span>
                <span className="font-mono font-bold text-base sm:text-lg text-blue-950" dir="ltr">${cardCheckUSD.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 print:border-black sm:col-span-2">
              <h3 className="font-black text-rose-900 mb-3 border-b border-rose-200 pb-2 text-sm sm:text-base">فروشات نسیه (قرضه امروز)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-rose-900">افغانی:</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-rose-700">{formatCurrency(debtAFN, 'AFN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-rose-900">دالر:</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-rose-700" dir="ltr">${debtUSD.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-base sm:text-lg text-[#0B1F3A] mb-3">لیست فروشات امروز ({todaySales.length} فاکتور)</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs sm:text-sm border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2.5">فاکتور</th>
                    <th className="border-b border-slate-200 px-3 py-2.5">مشتری</th>
                    <th className="border-b border-slate-200 px-3 py-2.5">مبلغ (افغانی)</th>
                    <th className="border-b border-slate-200 px-3 py-2.5">نوع پرداخت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaySales.map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{sale.invoiceNo}</td>
                      <td className="px-3 py-2 font-medium">{sale.customerName}</td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-900">{formatCurrency(sale.finalAFN, 'AFN')}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                          {sale.paymentMethod === 'Cash' ? 'نقد' :
                           sale.paymentMethod === 'Card' ? 'کارت' :
                           sale.paymentMethod === 'Check' ? 'چک' :
                           sale.paymentMethod === 'Credit' ? 'نسیه' : 'مختلط'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {todaySales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-400 font-medium">
                        فروشی برای امروز ثبت نشده است.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs sm:text-sm font-bold text-slate-700">
            <div>
              <div className="mb-14">امضاء فروشنده / صندوق‌دار</div>
              <div className="border-t border-slate-400 w-3/4 mx-auto"></div>
            </div>
            <div>
              <div className="mb-14">امضاء مدیر / تحویل‌گیرنده</div>
              <div className="border-t border-slate-400 w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            بستن پنجره
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#0B1F3A] hover:bg-slate-800 text-amber-400 hover:text-amber-300 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            چاپ و پرینت گزارش (Print)
          </button>
        </div>
      </div>
    </div>
  );
};
