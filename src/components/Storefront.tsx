import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { Product, SaleItem, Sale, Customer } from '../types';
import { ShoppingCart, Phone, Package, Tag, Star, Store, Truck, Search, X, CheckCircle, Clock, Plus } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export const Storefront: React.FC = () => {
  const { state, addSale, addCustomer } = useAppState();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shopping Cart State
  const [cart, setCart] = useState<Array<{ product: Product, quantity: number, type: 'Retail' | 'Wholesale' }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(state.products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [state.products, activeCategory, searchQuery]);

  const addToCart = (product: Product, type: 'Retail' | 'Wholesale') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.type === type);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, type }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, updated[index].quantity + delta);
      return updated;
    });
  };

  const cartTotalAFN = cart.reduce((sum, item) => {
    const price = item.type === 'Retail' ? item.product.retailPriceAFN : (item.product.wholesalePriceAFN || item.product.retailPriceAFN);
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !checkoutForm.name || !checkoutForm.phone) return;

    // 1. Find or create customer
    let customer = state.customers.find(c => c.phone === checkoutForm.phone);
    const customerId = customer ? customer.id : Date.now().toString();
    if (!customer) {
      customer = {
        id: customerId,
        name: checkoutForm.name,
        phone: checkoutForm.phone,
        city: 'کابل',
        debtUSD: 0,
        debtAFN: 0,
        creditLimitUSD: 0
      };
      addCustomer(customer);
    }

    // 2. Map cart to SaleItems
    const saleItems: SaleItem[] = cart.map(item => {
      const isWholesale = item.type === 'Wholesale';
      const unitPriceAFN = isWholesale ? (item.product.wholesalePriceAFN || item.product.retailPriceAFN) : item.product.retailPriceAFN;
      const unitPriceUSD = isWholesale ? (item.product.wholesalePriceUSD || item.product.retailPriceUSD) : item.product.retailPriceUSD;
      
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        selectedUnit: item.product.baseUnit,
        multiplier: 1,
        quantity: item.quantity,
        unitPriceAFN,
        unitPriceUSD,
        totalAFN: unitPriceAFN * item.quantity,
        totalUSD: unitPriceUSD * item.quantity,
        customerApprovalStatus: 'Pending'
      };
    });

    // 3. Create Sale Object
    const invoiceNo = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = {
      id: Date.now().toString(),
      invoiceNo,
      date: new Date().toISOString(),
      customerType: cart.some(c => c.type === 'Wholesale') ? 'Wholesale' : 'Retail',
      customerId: customerId,
      customerName: checkoutForm.name,
      items: saleItems,
      totalUSD: saleItems.reduce((sum, i) => sum + i.totalUSD, 0),
      totalAFN: saleItems.reduce((sum, i) => sum + i.totalAFN, 0),
      discountUSD: 0,
      discountAFN: 0,
      finalUSD: saleItems.reduce((sum, i) => sum + i.totalUSD, 0),
      finalAFN: saleItems.reduce((sum, i) => sum + i.totalAFN, 0),
      paidUSD: 0,
      paidAFN: 0,
      paymentMethod: 'Cash',
      exchangeRate: state.exchangeRate,
      status: 'Pending Delivery',
      deliveryAddress: checkoutForm.address,
      deliveryCity: 'کابل'
    };

    addSale(newSale);
    setCart([]);
    setIsCheckoutOpen(false);
    setOrderSuccessId(invoiceNo);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-[#0B1F3A] text-white sticky top-0 z-40 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-[#D4AF37]">ستاره شهر</h1>
            <nav className="hidden md:flex gap-6 text-sm font-bold ml-6">
              <a href="#" className="hover:text-[#D4AF37] transition-colors">صفحه اصلی</a>
              <Link to="/tracking" className="hover:text-[#D4AF37] transition-colors text-emerald-400">پیگیری سفارش</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-[#0B1F3A]">
                  {cart.length}
                </span>
              )}
            </button>
            <Link to="/login" className="text-sm font-bold hover:text-[#D4AF37]">ورود کارمندان</Link>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {orderSuccessId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center text-center shadow-sm print:shadow-none print:border-black">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">سفارش شما با موفقیت ثبت شد!</h2>
            <p className="text-slate-600 mb-4">همکاران ما به زودی با شما تماس خواهند گرفت.</p>
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm font-mono text-xl font-black text-indigo-600 tracking-widest" dir="ltr">
              {orderSuccessId}
            </div>
            <p className="text-xs text-slate-500 mt-4">لطفاً کد سفارش خود را برای پیگیری یادداشت کنید.</p>
            <div className="mt-6 flex gap-4 print:hidden">
              <Link to="/tracking" className="bg-[#0B1F3A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#123B66]">پیگیری وضعیت سفارش</Link>
              <button onClick={() => setOrderSuccessId(null)} className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300">ادامه خرید</button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 print:hidden">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
              <h3 className="font-black text-slate-800 mb-4">دسته‌بندی‌ها</h3>
              <div className="space-y-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      activeCategory === cat ? 'bg-[#0B1F3A] text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'All' ? 'همه محصولات' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-6 flex items-center">
              <Search className="w-5 h-5 text-slate-400 mx-3 shrink-0" />
              <input 
                type="text" 
                placeholder="جستجوی نام محصول..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-2 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                  <div className="aspect-square bg-slate-50 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    {product.stockInBaseUnits <= 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">تمام شد</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">{product.category}</p>
                    <h3 className="font-bold text-slate-800 text-sm mb-4 leading-tight flex-1">{product.name}</h3>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500">قیمت پرچون</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-indigo-600 font-mono">{formatCurrency(product.retailPriceAFN, 'AFN')}</span>
                          <button 
                            disabled={product.stockInBaseUnits <= 0}
                            onClick={() => addToCart(product, 'Retail')}
                            className="bg-[#0B1F3A] text-white p-1.5 rounded-lg hover:bg-[#123B66] disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {(product.wholesalePriceAFN ?? 0) > 0 && (
                        <div className="flex justify-between items-center bg-amber-50 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] font-bold text-amber-700">قیمت عمده</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600 font-mono">{formatCurrency(product.wholesalePriceAFN || 0, 'AFN')}</span>
                            <button 
                              disabled={product.stockInBaseUnits <= 0}
                              onClick={() => addToCart(product, 'Wholesale')}
                              className="bg-amber-600 text-white p-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 font-bold">
                  محصولی یافت نشد!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 print:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col print:hidden"
              dir="rtl"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-black text-[#0B1F3A] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> سبد خرید شما
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-bold">سبد خرید شما خالی است</p>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const price = item.type === 'Retail' ? item.product.retailPriceAFN : (item.product.wholesalePriceAFN || item.product.retailPriceAFN);
                    return (
                      <div key={idx} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm relative">
                        <button onClick={() => removeFromCart(idx)} className="absolute top-2 left-2 p-1 text-slate-300 hover:text-rose-500 bg-white rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1 pr-4">{item.product.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.type === 'Retail' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.type === 'Retail' ? 'پرچون' : 'عمده'}
                          </span>
                          <div className="flex justify-between items-end mt-2">
                            <span className="font-black text-[#0B1F3A] font-mono text-sm">{formatCurrency(price, 'AFN')}</span>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                              <button onClick={() => updateCartQty(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 font-bold">-</button>
                              <span className="w-4 text-center text-xs font-bold font-mono">{item.quantity}</span>
                              <button onClick={() => updateCartQty(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 font-bold">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-600">مجموع قابل پرداخت:</span>
                    <span className="text-2xl font-black text-[#0B1F3A] font-mono">{formatCurrency(cartTotalAFN, 'AFN')}</span>
                  </div>
                  <button 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full bg-[#0B1F3A] text-[#D4AF37] py-4 rounded-xl font-black text-lg hover:bg-[#123B66] shadow-xl hover:shadow-2xl transition-all"
                  >
                    ثبت نهایی و پرداخت
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                dir="rtl"
              >
                <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
                  <h2 className="text-xl font-black flex items-center gap-2"><Truck className="w-5 h-5" /> اطلاعات ارسال</h2>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                
                <form onSubmit={handleCheckout} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">نام کامل <span className="text-rose-500">*</span></label>
                    <input 
                      required type="text" 
                      value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">شماره تماس <span className="text-rose-500">*</span></label>
                    <input 
                      required type="tel" dir="ltr"
                      value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">آدرس دقیق تحویل</label>
                    <textarea 
                      rows={3}
                      value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    ></textarea>
                  </div>

                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs font-bold">پرداخت در زمان تحویل درب منزل / مغازه انجام می‌شود.</p>
                  </div>

                  <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 shadow-lg mt-6">
                    تایید و ثبت سفارش
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
