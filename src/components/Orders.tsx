import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Search, Eye, Check, X, Trash2, ShieldAlert, Package, RefreshCw, Printer } from 'lucide-react';
import { Sale, SaleItem } from '../types';

export const Orders: React.FC = () => {
  const { state, updateDeliveryStatus, editSale, deleteSale } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);
  const [adminPinModal, setAdminPinModal] = useState<{ isOpen: boolean, action: () => void }>({ isOpen: false, action: () => {} });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Alternative suggestion
  const [suggestingAlternativeFor, setSuggestingAlternativeFor] = useState<{ itemIdx: number, productId: string } | null>(null);

  const filteredOrders = useMemo(() => {
    return state.sales.filter(s => {
      const sDate = s.date.split('T')[0];
      const matchesDate = sDate >= dateRange.from && sDate <= dateRange.to;
      const matchesSearch = s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      // We assume mostly online or delivery orders here, or just all sales.
      // If we strictly want 'orders', we can filter out 'Completed' walk-ins, but we'll show all for now.
      return matchesDate && matchesSearch;
    });
  }, [state.sales, dateRange, searchQuery]);

  const requireAdminPin = (action: () => void) => {
    setPinInput('');
    setPinError(false);
    setAdminPinModal({ isOpen: true, action });
  };

  const verifyPinAndExecute = () => {
    // Verify against Admin$
    if (pinInput === 'Admin$') {
      adminPinModal.action();
      setAdminPinModal({ isOpen: false, action: () => {} });
    } else {
      setPinError(true);
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    requireAdminPin(() => {
      updateDeliveryStatus(orderId, newStatus as any);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    });
  };

  const handleCancelOrder = (orderId: string) => {
    requireAdminPin(() => {
      updateDeliveryStatus(orderId, 'Cancelled');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      }
    });
  };

  const handleTrueDeleteOrder = (orderId: string) => {
    requireAdminPin(() => {
      deleteSale(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    });
  };

  const handleSuggestAlternative = (itemIndex: number, newProductId: string) => {
    if (!selectedOrder) return;
    
    const newProduct = state.products.find(p => p.id === newProductId);
    if (!newProduct) return;

    requireAdminPin(() => {
      const updatedItems = [...selectedOrder.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        customerApprovalStatus: 'Pending',
        proposedAlternative: {
          productId: newProduct.id,
          productName: newProduct.name
        }
      };

      const updatedOrder = {
        ...selectedOrder,
        items: updatedItems,
        status: 'Requires Customer Approval' as const
      };

      editSale(updatedOrder);
      setSelectedOrder(updatedOrder);
      setSuggestingAlternativeFor(null);
    });
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (!selectedOrder) return;
    requireAdminPin(() => {
      const updatedItems = selectedOrder.items.filter((_, idx) => idx !== itemIndex);
      
      const updatedOrder = {
        ...selectedOrder,
        items: updatedItems,
        totalAFN: updatedItems.reduce((sum, i) => sum + i.totalAFN, 0),
        totalUSD: updatedItems.reduce((sum, i) => sum + i.totalUSD, 0),
        finalAFN: updatedItems.reduce((sum, i) => sum + i.totalAFN, 0),
        finalUSD: updatedItems.reduce((sum, i) => sum + i.totalUSD, 0),
      };

      editSale(updatedOrder);
      setSelectedOrder(updatedOrder);
    });
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">سفارشات مشتریان</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت سفارشات آنلاین، تایید و پیشنهاد جایگزین</p>
        </div>
      </div>

      <div className="print:hidden">
        <DateFilter 
          dateRange={dateRange} 
          onDateChange={setDateRange} 
          onSearch={() => {}} 
          onClear={() => setDateRange({ from: todayDate, to: todayDate })}
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 print:hidden">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی شماره سفارش یا نام مشتری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase print:text-black print:bg-slate-100">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl print:rounded-none">تاریخ سفارش</th>
                <th className="px-4 py-4">شماره سفارش</th>
                <th className="px-4 py-4">نام مشتری</th>
                <th className="px-4 py-4">تلفن تماس</th>
                <th className="px-4 py-4">مبلغ کل</th>
                <th className="px-4 py-4">وضعیت</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl print:hidden">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const customer = state.customers.find(c => c.id === order.customerId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(order.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{order.invoiceNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{order.customerName}</td>
                    <td className="px-4 py-3 font-mono text-slate-500" dir="ltr">{customer?.phone || '-'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#0B1F3A]">{formatCurrency(order.finalAFN, 'AFN')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        order.status === 'Completed' || order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 print:border print:border-emerald-300' :
                        order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 print:border print:border-rose-300' :
                        order.status === 'Requires Customer Approval' ? 'bg-amber-100 text-amber-700 print:border print:border-amber-300' :
                        'bg-indigo-100 text-indigo-700 print:border print:border-indigo-300'
                      }`}>
                        {order.status === 'Completed' || order.status === 'Delivered' ? 'تکمیل شده' : 
                         order.status === 'Cancelled' ? 'لغو شده' :
                         order.status === 'Requires Customer Approval' ? 'منتظر تایید مشتری' :
                         'در انتظار بررسی'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center print:hidden">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-xs font-bold flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> بررسی جزئیات
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    هیچ سفارشی در این تاریخ پیدا نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:bg-transparent print:z-auto print:block">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col print:shadow-none print:max-h-none print:border print:border-slate-200">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center print:bg-slate-100 print:text-black">
              <h2 className="text-xl font-black flex items-center gap-2">
                سفارش {selectedOrder.invoiceNo}
              </h2>
              <div className="flex items-center gap-4 print:hidden">
                <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold mb-1">مشتری</p>
                  <p className="font-black text-slate-800">{selectedOrder.customerName}</p>
                  <p className="text-sm font-mono text-slate-600 mt-1" dir="ltr">{state.customers.find(c => c.id === selectedOrder.customerId)?.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold mb-1">آدرس تحویل</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedOrder.deliveryAddress || 'نامشخص'}</p>
                </div>
              </div>

              <h3 className="font-black text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">اقلام سفارش</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => {
                  const productInStore = state.products.find(p => p.id === item.productId);
                  const isOutOfStock = productInStore ? productInStore.stockInBaseUnits < item.quantity : true;

                  return (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{item.productName}</h4>
                          <div className="flex gap-4 text-sm text-slate-500 mt-1 font-mono">
                            <span>تعداد: {item.quantity}</span>
                            <span>قیمت: {formatCurrency(item.unitPriceAFN, 'AFN')}</span>
                            <span className="font-black text-[#0B1F3A]">مجموع: {formatCurrency(item.totalAFN, 'AFN')}</span>
                          </div>
                        </div>
                        
                        <div className="print:hidden">
                          {item.customerApprovalStatus === 'Pending' ? (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold">منتظر تایید جایگزین توسط مشتری</span>
                          ) : item.customerApprovalStatus === 'Rejected' ? (
                            <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold line-through">توسط مشتری رد شد</span>
                          ) : item.customerApprovalStatus === 'Approved' ? (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">جایگزین تایید شد</span>
                          ) : (
                            isOutOfStock && selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' ? (
                              <span className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
                                ناموجود در انبار ({productInStore?.stockInBaseUnits || 0} عدد موجود)
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold">موجود</span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Admin Controls for this item */}
                      {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && !item.customerApprovalStatus && isOutOfStock && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 print:hidden">
                          <button 
                            onClick={() => setSuggestingAlternativeFor({ itemIdx: idx, productId: '' })}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> پیشنهاد جنس جایگزین
                          </button>
                          <button 
                            onClick={() => handleRemoveItem(idx)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> حذف این قلم از فاکتور
                          </button>
                        </div>
                      )}

                      {/* Alternative Suggestion UI */}
                      {suggestingAlternativeFor?.itemIdx === idx && (
                        <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 print:hidden">
                          <p className="text-xs font-bold text-indigo-800 mb-2">انتخاب جنس جایگزین از انبار:</p>
                          <div className="flex gap-2">
                            <select 
                              className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                              value={suggestingAlternativeFor.productId}
                              onChange={e => setSuggestingAlternativeFor({ ...suggestingAlternativeFor, productId: e.target.value })}
                            >
                              <option value="">-- یک محصول را انتخاب کنید --</option>
                              {state.products.filter(p => p.stockInBaseUnits > 0).map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.retailPriceAFN, 'AFN')} - موجودی: {p.stockInBaseUnits})</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleSuggestAlternative(idx, suggestingAlternativeFor.productId)}
                              disabled={!suggestingAlternativeFor.productId}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                            >
                              ثبت پیشنهاد
                            </button>
                            <button 
                              onClick={() => setSuggestingAlternativeFor(null)}
                              className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="font-black text-slate-500 text-lg">مجموع نهایی فاکتور:</span>
                <span className="text-3xl font-black text-[#0B1F3A] font-mono">{formatCurrency(selectedOrder.finalAFN, 'AFN')}</span>
              </div>
            </div>

            {/* Admin Order Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4 print:hidden">
              {selectedOrder.status !== 'Completed' && selectedOrder.status !== 'Cancelled' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> تایید و ثبت نهایی سفارش
                </button>
              )}
              {selectedOrder.status !== 'Cancelled' && (
                <button 
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="bg-amber-100 text-amber-700 px-6 rounded-xl font-bold hover:bg-amber-200 flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> لغو سفارش
                </button>
              )}
              <button 
                onClick={() => handleTrueDeleteOrder(selectedOrder.id)}
                className="bg-rose-100 text-rose-700 px-6 rounded-xl font-bold hover:bg-rose-200 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" /> حذف کامل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin PIN Modal */}
      {adminPinModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl transform transition-all">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تایید هویت مدیریت</h3>
            <p className="text-slate-500 text-sm mb-8">برای اعمال این تغییرات، لطفاً رمز عبور ادمین را وارد کنید.</p>
            
            <input 
              type="password" 
              placeholder="رمز عبور..." 
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className={`w-full bg-slate-50 border-2 rounded-2xl px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] focus:outline-none transition-colors mb-2 ${
                pinError ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-slate-200 focus:border-[#0B1F3A]'
              }`}
              dir="ltr"
              autoFocus
            />
            {pinError && <p className="text-xs text-rose-500 font-bold mb-6">رمز عبور اشتباه است!</p>}
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={verifyPinAndExecute}
                className="flex-1 bg-[#0B1F3A] text-[#D4AF37] py-3.5 rounded-xl font-black hover:bg-[#123B66] transition-colors"
              >
                تایید
              </button>
              <button 
                onClick={() => setAdminPinModal({ isOpen: false, action: () => {} })}
                className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
