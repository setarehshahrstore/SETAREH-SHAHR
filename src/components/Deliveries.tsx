import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { 
  Truck, 
  MapPin, 
  CheckCircle, 
  Navigation, 
  Clock, 
  UserCheck, 
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Sale } from '../types';

export const Deliveries: React.FC = () => {
  const { state, updateDeliveryStatus } = useAppState();
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [driverNameInput, setDriverNameInput] = useState('');
  const [deliverySearchQuery, setDeliverySearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Transit' | 'Delivered'>('All');

  // Filter sales that have shipping details & search queries
  const deliverySales = state.sales.filter(s => {
    const hasShipping = s.deliveryCity || s.deliveryAddress;
    if (!hasShipping) return false;

    // Apply Status Filter
    const status = s.deliveryStatus || 'Pending';
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending' && status !== 'Pending') return false;
      if (statusFilter === 'In Transit' && status !== 'In Transit') return false;
      if (statusFilter === 'Delivered' && !status.startsWith('Delivered')) return false;
    }

    // Apply Search Query (ID, invoice, driver, city, address, client)
    const q = deliverySearchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      s.invoiceNo.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      (s.deliveryCity && s.deliveryCity.toLowerCase().includes(q)) ||
      (s.deliveryDriver && s.deliveryDriver.toLowerCase().includes(q)) ||
      (s.deliveryAddress && s.deliveryAddress.toLowerCase().includes(q))
    );
  });

  const handleDispatch = (saleId: string) => {
    if (!driverNameInput) return;
    updateDeliveryStatus(saleId, 'In Transit', driverNameInput);
    setDriverNameInput('');
  };

  const handleDeliveryComplete = (saleId: string) => {
    updateDeliveryStatus(saleId, 'Delivered');
    alert("محموله تجارتی دفتری با موفقیت تحویل راننده و نماینده مشتری گردید و قفل ترانزیت تصفیه شد.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      
      {/* Shipment logs (Left Column) */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-105 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-5 h-5 text-emerald-600 animate-pulse" />
            سامانه ترانسپورت ملی و لژستیک بین‌الولایتی افغانستان
          </h3>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 text-[10px] font-black rounded-full">
            {deliverySales.length} بار مکتوب
          </span>
        </div>

        {/* Advanced Search & Filtering Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجو فاکتور، راننده، مشتری، ولایت مقصد..."
              value={deliverySearchQuery}
              onChange={(e) => setDeliverySearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg py-1.5 pr-8 pl-3 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-2 text-xs focus:outline-hidden"
            >
              <option value="All">فیلتر وضعیت: همه بارها</option>
              <option value="Pending">در انتظار صدور خروجی</option>
              <option value="In Transit">در حال ترانزیت جاده‌ای</option>
              <option value="Delivered">تخلیه بار و تحویل شده</option>
            </select>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-3">
          {deliverySales.length === 0 ? (
            <div className="text-center py-20 text-slate-405 font-medium bg-slate-50/50 rounded-xl border border-slate-100">
              <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <span>هیچ محموله فعالی با شروط و فیلترهای فوق یافت نگردید.</span>
              <p className="text-[10px] text-slate-405 mt-1">از زبانه فونداسیون صندوق POS فاکتوری با آدرس ولایتی به روش اقساط یا نقدی ثبت کنید.</p>
            </div>
          ) : (
            deliverySales.map((sale) => {
              const status = sale.deliveryStatus || 'Pending';

              return (
                <div
                  key={sale.id}
                  onClick={() => setSelectedSaleId(sale.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedSaleId === sale.id
                      ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/10'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="space-y-2 text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">فاکتور: {sale.invoiceNo}</span>
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-extrabold ${
                        status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        status === 'In Transit' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {status === 'Pending' ? 'در انتظار حرکت' : status === 'In Transit' ? 'در حال حمل' : 'تخلیه و تحویل شده'}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600 text-xs font-semibold">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        زون ولایتی مقصد: <span className="font-extrabold text-slate-800">ولایت {sale.deliveryCity}</span>
                      </p>
                      <p className="text-[10.5px] text-slate-400 font-normal pr-4 truncate max-w-sm">
                        آدرس دریافت‌کننده: {sale.deliveryAddress}
                      </p>
                    </div>
                  </div>

                  <div className="text-left shrink-0 flex flex-col justify-between">
                    <span className="text-xs font-black block text-slate-800">{formatCurrency(sale.finalAFN, 'AFN')}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">راننده موتر: {sale.deliveryDriver || 'تعیین ناشده'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Shipment Control Panel (Right Column) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        {selectedSaleId ? (
          (() => {
            const sale = state.sales.find(s => s.id === selectedSaleId)!;
            const status = sale.deliveryStatus || 'Pending';

            return (
              <div className="space-y-5 text-right w-full">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">مدیریت صدور بارنامه‌های رسمی دولتی</span>
                  <h3 className="font-extrabold text-slate-800 text-base">کارتابل اعزام موتری #{sale.invoiceNo}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">مشتری گیرنده: {sale.customerName}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">تاریخ کانتینر</span>
                        <span className="font-extrabold text-slate-700">{new Date(sale.date).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-t border-slate-200 pt-2">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">موقعیت ولایتی</span>
                        <span className="font-extrabold text-slate-705">ولایت {sale.deliveryCity} (افغانستان)</span>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch configuration forms */}
                  {status === 'Pending' && (
                    <div className="space-y-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="font-extrabold text-amber-800 uppercase text-[10px] block">ثبت بارنامه و موظف کردن راننده ترانسپورتی</span>
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">نام کامل لالی موتر ران و شماره تماس:</label>
                        <input
                          type="text"
                          required
                          value={driverNameInput}
                          onChange={(e) => setDriverNameInput(e.target.value)}
                          placeholder="مثال: لالی حاجی قدوس - موتر باربری مزار"
                          className="w-full text-xs bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden"
                        />
                      </div>

                      <button
                        onClick={() => handleDispatch(sale.id)}
                        disabled={!driverNameInput}
                        className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        تایید خروج موتر از گرام و اعزام بار
                      </button>
                    </div>
                  )}

                  {status === 'In Transit' && (
                    <div className="space-y-3 p-4 bg-sky-50/50 rounded-xl border border-sky-150">
                      <span className="font-extrabold text-sky-800 uppercase text-[10.5px] block text-center">محموله در شاهراه عمومی</span>
                      <p className="text-[11.5px] text-slate-500 text-center leading-relaxed font-semibold">
                        فاکتور مذکور هم‌اکنون با کامیون آقای <span className="text-slate-800">"{sale.deliveryDriver}"</span> به سمت مقصد هدایت می‌گردد.
                      </p>

                      <button
                        onClick={() => handleDeliveryComplete(sale.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        تایید نهایی کالا پس از امضای تخلیه باربری
                      </button>
                    </div>
                  )}

                  {status.startsWith('Delivered') && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center space-y-1">
                      <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                      <span className="font-bold block text-emerald-800 text-sm">محموله کالا با موفقیت واگذار شد</span>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                        موتور حمل بارنامه تخلیه کامل شد و در تاریخ {new Date().toLocaleDateString('fa-IR')} تصفیه نهایی گردید.
                      </p>
                    </div>
                  )}

                  {/* Summary of goods inside shipment */}
                  <div className="pt-2 border-t mt-3">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">ریز اقلام فاکتور حمل شده</span>
                    <div className="bg-slate-50 divide-y rounded-lg border overflow-hidden">
                      {sale.items.map((it, idx) => (
                        <div key={idx} className="p-2 flex justify-between items-center text-[10.5px]">
                          <span>{it.productName} ∙ {it.selectedUnit}</span>
                          <span className="font-bold text-slate-800">تعداد: {it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center py-24 text-slate-400 font-medium">
            <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <span>جهت مدیریت یا تایید خروج بار کانتینرها، روی یکی از محموله‌های ستون سمت راست کلیک نمایید.</span>
          </div>
        )}
      </div>
      
    </div>
  );
};
