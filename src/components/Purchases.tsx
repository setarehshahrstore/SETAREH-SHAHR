import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { DateFilter, DateRange } from './DateFilter';
import { formatCurrency } from '../utils';
import { Plus, Search, FileText, X, Trash2 } from 'lucide-react';
import { Purchase, PurchaseItem } from '../types';

export const Purchases: React.FC = () => {
  const { state, addPurchase } = useAppState();
  
  const todayDate = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: todayDate
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [paidAFN, setPaidAFN] = useState('0');
  
  // Item Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('');
  const [costPrice, setCostPrice] = useState('');

  const filteredPurchases = useMemo(() => {
    return state.purchases.filter(p => {
      const pDate = p.date.split('T')[0];
      const matchesDate = pDate >= dateRange.from && pDate <= dateRange.to;
      const matchesSearch = p.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [state.purchases, dateRange, searchQuery]);

  const handleAddItem = () => {
    if (!selectedProductId || !qty || !costPrice) return;
    const prod = state.products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const quantity = parseFloat(qty);
    const cost = parseFloat(costPrice);
    
    setItems([...items, {
      productId: prod.id,
      productName: prod.name,
      selectedUnit: 'Piece',
      multiplier: 1,
      quantity,
      costPriceAFN: cost,
      costPriceUSD: 0,
      totalAFN: quantity * cost,
      totalUSD: 0
    }]);

    setSelectedProductId('');
    setQty('');
    setCostPrice('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) {
      alert('لطفاً تامین‌کننده و حداقل یک قلم کالا را وارد کنید.');
      return;
    }

    const supplier = state.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    const totalAFN = items.reduce((sum, item) => sum + item.totalAFN, 0);
    const paid = parseFloat(paidAFN) || 0;

    const newPurchase: Purchase = {
      id: Date.now().toString(),
      invoiceNo: `PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: items,
      totalAFN: totalAFN,
      totalUSD: 0,
      paidAFN: paid,
      paidUSD: 0,
      exchangeRate: state.exchangeRate,
      paymentMethod: paid >= totalAFN ? 'Cash' : paid > 0 ? 'Partial' : 'Credit'
    };

    addPurchase(newPurchase);
    setIsModalOpen(false);
    setSupplierId('');
    setItems([]);
    setPaidAFN('0');
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">مدیریت خریدها</h1>
          <p className="text-xs text-slate-500 mt-1">لیست فاکتورهای خرید از تامین‌کنندگان</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#D4AF37] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#B8942E] transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          ثبت خرید جدید
        </button>
      </div>

      <DateFilter 
        dateRange={dateRange} 
        onDateChange={setDateRange} 
        onSearch={() => {}} 
        onClear={() => setDateRange({ from: todayDate, to: todayDate })}
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی شماره فاکتور یا نام فروشنده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl">تاریخ خرید</th>
                <th className="px-4 py-4">شماره فاکتور</th>
                <th className="px-4 py-4">نام فروشنده</th>
                <th className="px-4 py-4">مبلغ کل</th>
                <th className="px-4 py-4">پرداخت شده</th>
                <th className="px-4 py-4">باقی حساب</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map(purchase => {
                const balanceAFN = purchase.totalAFN - purchase.paidAFN;
                return (
                  <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{new Date(purchase.date).toLocaleDateString('fa-IR')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{purchase.invoiceNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{purchase.supplierName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{formatCurrency(purchase.totalAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono text-emerald-600">{formatCurrency(purchase.paidAFN, 'AFN')}</td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">{formatCurrency(balanceAFN, 'AFN')}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors" title="مشاهده فاکتور">
                        <FileText className="w-5 h-5 mx-auto" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    هیچ معلوماتی در این تاریخ پیدا نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
              <h2 className="text-xl font-black">ثبت فاکتور خرید جدید</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">انتخاب تامین‌کننده (شرکت) <span className="text-rose-500">*</span></label>
                <select 
                  value={supplierId} 
                  onChange={e => setSupplierId(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- انتخاب کنید --</option>
                  {state.suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.companyName || 'بدون شرکت'})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4">افزودن اقلام به فاکتور</h3>
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-xs font-bold text-slate-600 mb-1">جنس</label>
                    <select 
                      value={selectedProductId} 
                      onChange={e => setSelectedProductId(e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none"
                    >
                      <option value="">-- محصول --</option>
                      {state.products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">تعداد/مقدار</label>
                    <input type="number" min="0" step="0.01" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none" />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">قیمت خرید (؋)</label>
                    <input type="number" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none" />
                  </div>
                  <div className="col-span-1">
                    <button onClick={handleAddItem} className="w-full h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <table className="w-full text-right text-xs">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-2">نام محصول</th>
                          <th className="pb-2">تعداد</th>
                          <th className="pb-2">فی (؋)</th>
                          <th className="pb-2">مجموع (؋)</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-slate-700">
                        {items.map((it, idx) => (
                          <tr key={idx} className="border-t border-slate-100">
                            <td className="py-2">{it.productName}</td>
                            <td className="py-2">{it.quantity}</td>
                            <td className="py-2">{formatCurrency(it.costPriceAFN, 'AFN')}</td>
                            <td className="py-2 text-indigo-600">{formatCurrency(it.totalAFN, 'AFN')}</td>
                            <td className="py-2">
                              <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-1">مجموع فاکتور (افغانی)</p>
                  <p className="text-2xl font-black text-[#0B1F3A] font-mono">
                    {formatCurrency(items.reduce((sum, item) => sum + item.totalAFN, 0), 'AFN')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">مبلغ پرداختی نقد (افغانی) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    min="0" 
                    value={paidAFN} 
                    onChange={e => setPaidAFN(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-lg font-black font-mono focus:outline-none focus:border-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">الباقی به عنوان قرض ثبت می‌شود</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <button 
                onClick={handleSubmitPurchase} 
                className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] transition-all shadow-xl"
              >
                ثبت نهایی فاکتور خرید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
