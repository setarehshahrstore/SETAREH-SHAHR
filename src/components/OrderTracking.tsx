import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { Search, CheckCircle, Clock, XCircle, Package, ArrowLeft, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils';

export const OrderTracking: React.FC = () => {
  const { state, editSale } = useAppState();
  
  const [trackingId, setTrackingId] = useState('');
  const [searched, setSearched] = useState(false);
  
  const order = state.sales.find(s => s.invoiceNo.toLowerCase() === trackingId.toLowerCase() || s.id === trackingId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setSearched(true);
  };

  const handleApproveAlternative = (itemIndex: number) => {
    if (!order) return;
    
    // We update the specific item's customerApprovalStatus to 'Approved'
    const updatedItems = [...order.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      customerApprovalStatus: 'Approved',
      // We assume the admin already updated the productId and productName to the alternative one
      // But we just mark it approved here.
    };
    
    // Check if any items still require approval
    const stillRequiresApproval = updatedItems.some(i => i.customerApprovalStatus === 'Pending' && i.proposedAlternative);
    
    const updatedOrder = {
      ...order,
      items: updatedItems,
      status: stillRequiresApproval ? order.status : 'Pending Delivery' as const, // Automatically switch back to pending delivery if all handled
    };
    
    editSale(updatedOrder);
  };

  const handleRejectAlternative = (itemIndex: number) => {
    if (!order) return;
    
    const updatedItems = [...order.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      customerApprovalStatus: 'Rejected'
    };
    
    const stillRequiresApproval = updatedItems.some(i => i.customerApprovalStatus === 'Pending' && i.proposedAlternative);
    
    const updatedOrder = {
      ...order,
      items: updatedItems,
      status: stillRequiresApproval ? order.status : 'Pending Delivery' as const,
      totalAFN: order.totalAFN - updatedItems[itemIndex].totalAFN, // reduce total
      finalAFN: order.finalAFN - updatedItems[itemIndex].totalAFN,
      totalUSD: order.totalUSD - updatedItems[itemIndex].totalUSD,
      finalUSD: order.finalUSD - updatedItems[itemIndex].totalUSD,
    };
    
    editSale(updatedOrder);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white" dir="rtl">
      <header className="bg-[#0B1F3A] text-white sticky top-0 z-40 shadow-md print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors">
            <Store className="w-5 h-5" />
            <h1 className="text-xl font-black">ستاره شهر</h1>
          </Link>
          <Link to="/" className="text-sm font-bold flex items-center gap-1 hover:text-[#D4AF37]">
            بازگشت به فروشگاه <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10 print:hidden">
          <h2 className="text-3xl font-black text-[#0B1F3A] mb-4">پیگیری سفارشات</h2>
          <p className="text-slate-500">کد سفارش خود را برای پیگیری وضعیت ارسال وارد کنید.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 print:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              placeholder="مثال: ORD-1234" 
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-center font-mono font-bold text-lg focus:outline-none focus:border-indigo-500"
              dir="ltr"
            />
            <button type="submit" className="bg-[#D4AF37] text-white px-8 rounded-2xl font-black text-lg hover:bg-[#B8942E] transition-colors shadow-md">
              <Search className="w-6 h-6" />
            </button>
          </form>
        </div>

        {searched && !order && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-3xl text-center">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">سفارشی با این کد یافت نشد!</h3>
            <p className="text-sm">لطفاً کد سفارش را با دقت بررسی کرده و دوباره تلاش کنید.</p>
          </div>
        )}

        {searched && order && (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400 mb-1">کد سفارش</p>
                <h3 className="text-2xl font-black font-mono tracking-wider">{order.invoiceNo}</h3>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-400 mb-1">تاریخ ثبت</p>
                <p className="font-mono">{new Date(order.date).toLocaleDateString('fa-IR')}</p>
              </div>
            </div>

            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-white">
                {order.status === 'Completed' || order.status === 'Delivered' ? <CheckCircle className="w-8 h-8 text-emerald-500" /> :
                 order.status === 'Cancelled' ? <XCircle className="w-8 h-8 text-rose-500" /> :
                 <Clock className="w-8 h-8 text-amber-500" />}
              </div>
              <div>
                <h4 className="font-black text-lg text-slate-800">وضعیت فعلی: 
                  <span className={`mr-2 ${
                    order.status === 'Completed' || order.status === 'Delivered' ? 'text-emerald-600' :
                    order.status === 'Cancelled' ? 'text-rose-600' :
                    order.status === 'Requires Customer Approval' ? 'text-rose-600' :
                    'text-amber-600'
                  }`}>
                    {order.status === 'Completed' || order.status === 'Delivered' ? 'تکمیل و ارسال شده' :
                     order.status === 'Cancelled' ? 'لغو شده' :
                     order.status === 'Requires Customer Approval' ? 'نیازمند تایید شما' :
                     'در حال پردازش / در انتظار'}
                  </span>
                </h4>
                {order.status === 'Requires Customer Approval' && (
                  <p className="text-xs font-bold text-rose-500 mt-1">بعضی از اجناس ناموجود بودند و فروشگاه اجناس جایگزین پیشنهاد داده است. لطفاً در پایین تایید یا رد کنید.</p>
                )}
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" /> اقلام سفارش
              </h4>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="border border-slate-100 p-4 rounded-2xl relative">
                    {item.customerApprovalStatus === 'Pending' && item.proposedAlternative ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
                        <div className="flex items-start gap-3">
                          <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-amber-900 mb-1">کالای انتخابی شما تمام شده است!</p>
                            <p className="text-xs text-amber-800 mb-3">فروشگاه پیشنهاد داده است که به جای <span className="font-bold line-through">{item.productName}</span>، کالای زیر را برای شما ارسال کند:</p>
                            
                            <div className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center mb-4">
                              <span className="font-black text-indigo-700">{item.proposedAlternative.productName}</span>
                              <span className="font-mono text-sm font-bold text-slate-600">{item.quantity} عدد</span>
                            </div>

                            <div className="flex gap-2 print:hidden">
                              <button onClick={() => handleApproveAlternative(idx)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex-1">بله، این کالا را می‌خواهم</button>
                              <button onClick={() => handleRejectAlternative(idx)} className="bg-rose-100 hover:bg-rose-200 text-rose-800 px-4 py-2 rounded-lg text-xs font-bold flex-1">خیر، این قلم حذف شود</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : item.customerApprovalStatus === 'Rejected' ? (
                      <div className="opacity-50 line-through">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{item.productName}</span>
                          <span className="text-xs text-rose-600 font-bold border border-rose-200 px-2 py-0.5 rounded bg-rose-50">توسط شما رد و حذف شد</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">
                            {item.proposedAlternative ? item.proposedAlternative.productName : item.productName}
                          </span>
                          <span className="font-black text-[#0B1F3A] font-mono">{formatCurrency(item.totalAFN, 'AFN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>{item.quantity} {item.selectedUnit}</span>
                          {item.proposedAlternative && <span className="text-emerald-600 font-bold border border-emerald-200 px-2 py-0.5 rounded bg-emerald-50">توسط شما تایید شد</span>}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-600 text-lg">مجموع نهایی قابل پرداخت:</span>
                <span className="text-3xl font-black text-[#0B1F3A] font-mono">{formatCurrency(order.finalAFN, 'AFN')}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
