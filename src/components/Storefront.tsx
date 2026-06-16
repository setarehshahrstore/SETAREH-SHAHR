import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency, getUnitOptions, convertCurrency } from '../utils';
import { 
  ShoppingCart, 
  Tag, 
  Globe, 
  Truck, 
  Check, 
  HelpCircle,
  Phone,
  User,
  LogOut,
  Loader2,
  Sparkles,
  AlertCircle,
  Send,
  MessageSquare,
  Building,
  MessageCircle,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sale, SaleItem, Customer } from '../types';
import { SupportContact } from './SupportContact';

export const Storefront: React.FC = () => {
  const { state, addSale, addCustomer } = useAppState();
  const [customerType, setCustomerType] = useState<'Retail' | 'Wholesale'>('Retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    const saved = localStorage.getItem('STOREFRONT_LOGGED_CUSTOMER');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.id;
      } catch (e) {}
    }
    return 'walk-in';
  });
  const [cart, setCart] = useState<Array<{
    productId: string;
    unitKey: string; // 'piece', 'pack', etc
    quantity: number;
  }>>([]);
  
  // Checkout detail states
  const [shippingCity, setShippingCity] = useState<string>('کابل');
  const [customProvince, setCustomProvince] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Credit'>('Cash');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [lastPlacedOrderNo, setLastPlacedOrderNo] = useState('');
  const [showWaPanel, setShowWaPanel] = useState(true);

  // --- NEW INTEGRATIONS ---
  // Support Inquiry State
  const [supportName, setSupportName] = useState('');
  const [supportContact, setSupportContact] = useState('');
  const [supportTopic, setSupportTopic] = useState('راهنمایی عمومی خرید');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Customer Account Registration States
  const [loggedCustomer, setLoggedCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('STOREFRONT_LOGGED_CUSTOMER');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMethod, setAuthMethod] = useState<'none' | 'google' | 'facebook' | 'manual'>('none');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Register Form details
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('کابل');

  // simulated details
  const [simulatedProgressText, setSimulatedProgressText] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName.trim() || !supportContact.trim() || !supportMsg.trim()) {
      alert('لطفاً تمامی گزینه‌های فرم تماس را پر نمائید.');
      return;
    }

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: supportName.trim(),
      contact: supportContact.trim(),
      topic: supportTopic,
      message: supportMsg.trim(),
      date: new Date().toISOString(),
      status: 'Pending'
    };

    // Save inquiry to localStorage
    const savedInquiries = localStorage.getItem('AFG_STORE_INQUIRIES');
    let list = [];
    if (savedInquiries) {
      try { list = JSON.parse(savedInquiries); } catch (err) {}
    }
    const updated = [newInquiry, ...list];
    localStorage.setItem('AFG_STORE_INQUIRIES', JSON.stringify(updated));

    setSupportSuccess(true);
    setSupportName('');
    setSupportContact('');
    setSupportMsg('');

    setTimeout(() => {
      setSupportSuccess(false);
    }, 6000);
  };

  const startOAuthSimulated = (method: 'google' | 'facebook') => {
    setIsAuthModalOpen(true);
    setAuthMethod(method);
    setIsAuthLoading(true);
    setRegName('');
    setRegPhone('');
    setRegEmail('');

    if (method === 'google') {
      setSimulatedProgressText('در حال اتصال به سرورهای احراز هویت Google Sign-In API...');
      setTimeout(() => {
        setSimulatedProgressText('اکانت گوگل تایید صلاحیت شد: arianaorientalrug@gmail.com');
        setTimeout(() => {
          setIsAuthLoading(false);
          setRegName('آریانا افغان');
          setRegEmail('arianaorientalrug@gmail.com');
        }, 1500);
      }, 1500);
    } else {
      setSimulatedProgressText('در حال ارسال سیگنال رمزنگاری شده به فیسبوک پلتفرم (Meta Secure Key)...');
      setTimeout(() => {
        setSimulatedProgressText('نشست شما در فیسبوک زنده با موفقیت همگام شد!');
        setTimeout(() => {
          setIsAuthLoading(false);
          setRegName('کاربر فیسبوک');
          setRegEmail('facebook-profile@facebook.com');
        }, 1500);
      }, 1500);
    }
  };

  const handleRegisterConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim() || !regCity.trim()) {
      alert('تمامی گزینه‌های ستاره‌دار برای ثبت حساب مشتری ضروری می‌باشند.');
      return;
    }

    const newCust: Customer = {
      id: `customer-${Date.now()}`,
      name: regName.trim(),
      phone: regPhone.trim(),
      city: regCity.trim(),
      email: regEmail.trim() || `${regPhone.trim()}@store.com`,
      debtUSD: 0,
      debtAFN: 0,
      creditLimitUSD: 1000
    };

    // 1. Add to app central state
    addCustomer(newCust);

    // 2. Clear & save locally for session
    localStorage.setItem('STOREFRONT_LOGGED_CUSTOMER', JSON.stringify(newCust));
    setLoggedCustomer(newCust);

    // 3. Auto fill shipping details
    setSelectedCustomerId(newCust.id);
    setShippingCity(newCust.city);
    setShippingAddress(`ولایت ${newCust.city}، شماره تماس: ${newCust.phone}`);

    alert(`تبارک‌الله! حساب مشتری دیجیتال شما با موفقیت افتتاح گردید. خوش آمدید، ${newCust.name}!`);
    setIsAuthModalOpen(false);
    setAuthMethod('none');
  };

  const handleClientLogout = () => {
    if (confirm('آیا می‌خواهید از حساب مشتری خود خارج شوید؟ سبد خرید شما حفظ می‌گردد.')) {
      localStorage.removeItem('STOREFRONT_LOGGED_CUSTOMER');
      setLoggedCustomer(null);
      setSelectedCustomerId('walk-in');
    }
  };

  // AFG Provinces translated
  const afgProvinces = [
    { name: 'کابل', deliveryUSD: 2, deliveryAFN: 150 },
    { name: 'هرات', deliveryUSD: 6, deliveryAFN: 450 },
    { name: 'کندهار', deliveryUSD: 5, deliveryAFN: 360 },
    { name: 'مزار شریف', deliveryUSD: 5, deliveryAFN: 365 },
    { name: 'جلال‌آباد', deliveryUSD: 3, deliveryAFN: 220 },
    { name: 'غزنی', deliveryUSD: 4, deliveryAFN: 290 }
  ];

  const currentProvinceInfo = shippingCity === 'custom'
    ? { name: customProvince || 'سایر ولایات', deliveryUSD: 4, deliveryAFN: 300 }
    : (afgProvinces.find(p => p.name === shippingCity) || afgProvinces[0]);

  const addToCart = (productId: string, unitKey: string) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(item => item.productId === productId && item.unitKey === unitKey);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { productId, unitKey, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, unitKey: string, newQty: number) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => !(item.productId === productId && item.unitKey === unitKey)));
    } else {
      setCart(prev => prev.map(item => 
        (item.productId === productId && item.unitKey === unitKey)
          ? { ...item, quantity: newQty }
          : item
      ));
    }
  };

  // Cart financial calculations
  const cartDetailedItems = cart.map(cartItem => {
    const prod = state.products.find(p => p.id === cartItem.productId)!;
    const unitOptions = getUnitOptions(prod.units);
    const selectedUnitOpt = unitOptions.find(o => o.key === cartItem.unitKey)!;
    
    // Choose wholesale or retail price
    const isWholesale = customerType === 'Wholesale';
    const unitPriceUSD = isWholesale ? prod.wholesalePriceUSD * selectedUnitOpt.multiplier : prod.retailPriceUSD * selectedUnitOpt.multiplier;
    const unitPriceAFN = isWholesale ? prod.wholesalePriceAFN * selectedUnitOpt.multiplier : prod.retailPriceAFN * selectedUnitOpt.multiplier;

    const totalUSD = unitPriceUSD * cartItem.quantity;
    const totalAFN = unitPriceAFN * cartItem.quantity;

    return {
      ...cartItem,
      product: prod,
      selectedUnitOpt,
      unitPriceUSD,
      unitPriceAFN,
      totalUSD,
      totalAFN
    };
  });

  const cartSubtotalUSD = cartDetailedItems.reduce((sum, item) => sum + item.totalUSD, 0);
  const cartSubtotalAFN = cartDetailedItems.reduce((sum, item) => sum + item.totalAFN, 0);

  const deliveryUSD = cart.length > 0 ? currentProvinceInfo.deliveryUSD : 0;
  const deliveryAFN = cart.length > 0 ? currentProvinceInfo.deliveryAFN : 0;

  const cartTotalUSD = cartSubtotalUSD + deliveryUSD;
  const cartTotalAFN = cartSubtotalAFN + deliveryAFN;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const invoiceNo = `INV-STORE-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerObj = state.customers.find(c => c.id === selectedCustomerId);
    const customerName = selectedCustomerId === 'walk-in' ? 'مشتری گذری وب‌سایت' : (customerObj?.name || 'مشتری');

    const saleItems: SaleItem[] = cartDetailedItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      selectedUnit: item.selectedUnitOpt.name,
      multiplier: item.selectedUnitOpt.multiplier,
      quantity: item.quantity,
      unitPriceUSD: item.unitPriceUSD / item.selectedUnitOpt.multiplier,
      unitPriceAFN: item.unitPriceAFN / item.selectedUnitOpt.multiplier,
      totalUSD: item.totalUSD,
      totalAFN: item.totalAFN
    }));

    // If Credit sales, amount paid is 0 initially, else fully paid cash
    const paidUSD = paymentMethod === 'Credit' ? 0 : cartTotalUSD;
    const paidAFN = paymentMethod === 'Credit' ? 0 : cartTotalAFN;

    const finalCity = shippingCity === 'custom' ? (customProvince.trim() || 'ولایت سفارشی') : shippingCity;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: new Date().toISOString(),
      customerType,
      customerId: selectedCustomerId,
      customerName,
      items: saleItems,
      totalUSD: cartTotalUSD,
      totalAFN: cartTotalAFN,
      discountUSD: 0,
      discountAFN: 0,
      finalUSD: cartTotalUSD,
      finalAFN: cartTotalAFN,
      paidUSD,
      paidAFN,
      paymentMethod: paymentMethod === 'Credit' ? 'Credit' : 'Cash',
      exchangeRate: state.exchangeRate,
      status: 'Pending Delivery',
      deliveryAddress: shippingAddress || 'تحویل در گدام مرکزی هرات/کابل',
      deliveryCity: finalCity,
      deliveryStatus: 'Pending',
      deliveryDriver: 'نامشخص'
    };

    addSale(newSale);
    setCart([]);
    setShippingAddress('');
    setLastPlacedOrderNo(invoiceNo);
    setIsOrderPlaced(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      
      {/* Product Catalog Listings */}
      <div className="lg:col-span-2 space-y-5">
        
        {/* Toggle Pricing Model */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Globe className="w-4.5 h-4.5 text-emerald-600 animate-spin-slow" />
              ویترین دیجیتال و فروشگاه فرمایشی ستاره شهر
            </h2>
            <p className="text-xs text-slate-500">
              کاتالوگ پخش عمده و خرده فروشی کالا را زنده بررسی کرده و فرمایش دهید.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setCustomerType('Retail');
                setCart([]); // Clear cart to avoid pricing mix-ups
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                customerType === 'Retail'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              خرده فروشی (پرچون)
            </button>
            <button
              onClick={() => {
                setCustomerType('Wholesale');
                setCart([]); 
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                customerType === 'Wholesale'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              عمده فروشی (B2B)
            </button>
          </div>
        </div>

        {/* Catalog List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.products.map(product => {
            const unitOpts = getUnitOptions(product.units);
            const isOutOfStock = product.stockInBaseUnits <= 0;

            return (
              <div key={product.id} className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-emerald-200 transition-colors">
                <div className="relative">
                  <img src={product.image} alt={product.name} className="w-full h-44 object-cover" referrerPolicy="no-referrer" />
                  <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm">
                    {product.category}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">شناسه کالا: {product.sku}</p>
                    
                    {/* Unit conversions list */}
                    <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-500 mt-1.5">
                      <p className="font-bold text-slate-700 mb-1">واحدهای بسته‌بندی موجود:</p>
                      <ul className="list-disc pr-4 mt-0.5 space-y-0.5 text-right">
                        {unitOpts.map((opt, i) => (
                          <li key={i}>
                            ۱ {opt.name} = {opt.multiplier} {product.baseUnit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 space-y-2">
                    {/* Packaging purchase options */}
                    <p className="text-xs font-bold text-slate-800">
                      نرخ قیمت ({customerType === 'Wholesale' ? 'عمده فروشی' : 'خرده فروشی'}):
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {unitOpts.map((opt) => {
                        const unitPriceUSD = customerType === 'Wholesale' ? product.wholesalePriceUSD * opt.multiplier : product.retailPriceUSD * opt.multiplier;
                        const unitPriceAFN = customerType === 'Wholesale' ? product.wholesalePriceAFN * opt.multiplier : product.retailPriceAFN * opt.multiplier;

                        return (
                          <button
                            key={opt.key}
                            disabled={isOutOfStock}
                            onClick={() => addToCart(product.id, opt.key)}
                            className="bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-all rounded p-2 text-right text-[10px] space-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            title={`افزودن ۱ ${opt.name} به سبد`}
                          >
                            <span className="block font-bold text-emerald-800 text-xs">{opt.name}</span>
                            <span className="block text-[9px] text-slate-500 font-sans mt-0.5">
                              {formatCurrency(unitPriceAFN, 'AFN')} <span className="text-slate-300">|</span> ${unitPriceUSD.toFixed(1)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {isOutOfStock && (
                      <p className="text-xs text-rose-500 font-bold text-center pt-1">⚠️ اتمام موجودی موقت گدام / در انتقال</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Drawer & Shipping Fields Column */}
      <div className="space-y-6">
        
        {/* Customer Session / Mock Auth Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4 font-sans" id="storefront-customer-auth-status">
          <div className="flex items-center justify-between pb-2 border-b border-slate-150">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              وضعیت اشتراک خریدار
            </h3>
            {loggedCustomer ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                عضو تأیید شده
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-850 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                مهمان (Guest)
              </span>
            )}
          </div>

          {loggedCustomer ? (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">نام تخلص:</span>
                  <span className="font-extrabold text-slate-800">{loggedCustomer.name}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400 font-sans font-bold">شماره تماس:</span>
                  <span className="text-slate-700 font-bold">{loggedCustomer.phone}</span>
                </div>
                {loggedCustomer.email && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400 font-sans font-bold">ایمیل حساب:</span>
                    <span className="text-slate-600 text-[10.5px]">{loggedCustomer.email}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400">ولایت اقامت:</span>
                  <span className="text-slate-800">{loggedCustomer.city}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClientLogout}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                خروج از حساب شبیه‌سازی
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed text-right">
                جهت شبیه‌سازی خرید مشتری و فعال شدن قیمت‌های عمده یا استفاده از تخفیف‌های ویژه، به سیستم متصل شوید:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => startOAuthSimulated('google')}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-[10.5px] py-2 px-2 rounded-lg flex items-center justify-center gap-1 font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-red-500 font-black font-sans">G</span>
                  ورود شبیه‌سازی Google
                </button>
                <button
                  type="button"
                  onClick={() => startOAuthSimulated('facebook')}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 text-blue-800 text-[10.5px] py-2 px-2 rounded-lg flex items-center justify-center gap-1 font-bold transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-blue-600 font-black font-sans">f</span>
                  ورود شبیه‌سازی Facebook
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Shopping Cart Drawer */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-50">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              سبد خرید من ({cart.reduce((sum, item) => sum + item.quantity, 0)} قلم)
            </h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-slate-400 hover:text-rose-500 cursor-pointer font-bold">
                پاک کردن کل سبد
              </button>
            )}
          </div>

          {/* Placed order confirmation screen */}
          {isOrderPlaced ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-center space-y-3"
            >
              <div className="inline-flex p-2 bg-emerald-100 rounded-full text-emerald-600">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-800">سفارش شما با موفقیت ثبت گردید!</h4>
                <p className="text-xs text-emerald-600 mt-1">شماره فاکتور: {lastPlacedOrderNo}</p>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  این سفارش ثبت سیستم گردیده و جهت حمل‌ونقل ولایتی به بخش مربوطه در صف انتظار ارسال فرستاده شد.
                </p>
              </div>
              <button 
                onClick={() => setIsOrderPlaced(false)} 
                className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                ثبت سفارش جدید دیگر
              </button>
            </motion.div>
          ) : cart.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">سبد خرید شما فعلاً خالی است.</p>
              <p className="text-[10px] text-slate-400">واحدهای دلخواه از محصولات فوق را به سبد خریدتان اضافه کنید.</p>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-4">
              
              {/* Product rows inside Cart */}
              <div className="space-y-3 divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {cartDetailedItems.map((item, idx) => (
                  <div key={`${item.productId}-${item.unitKey}`} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-500">
                        {item.selectedUnitOpt.name} (فی: {formatCurrency(item.unitPriceAFN, 'AFN')})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-sm">
                        <button 
                          type="button" 
                          onClick={() => updateCartQty(item.productId, item.unitKey, item.quantity - 1)}
                          className="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-r text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateCartQty(item.productId, item.unitKey, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-l text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-left whitespace-nowrap min-w-16">
                        <p className="text-xs font-bold text-slate-800">{formatCurrency(item.totalAFN, 'AFN')}</p>
                        <p className="text-[9px] text-slate-400 font-mono">${item.totalUSD.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery options */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  حمل‌ونقل کالا و انتقالات ولایتی
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ولایت مقصد:</label>
                    <select
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-hidden"
                    >
                      {afgProvinces.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                      <option value="custom">✍️ سایر ولایات (وارد کردن دستی)...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">کرایه تحویل‌دهی:</label>
                    <div className="bg-slate-105 p-1.5 rounded border border-slate-200 text-[10px] font-black text-slate-700 text-center">
                      {formatCurrency(deliveryAFN, 'AFN')} (${deliveryUSD})
                    </div>
                  </div>
                </div>

                {shippingCity === 'custom' && (
                  <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                    <label className="block text-[10px] font-bold text-emerald-800">نام ولایت دلخواه را دستی وارد کنید:</label>
                    <input
                      type="text"
                      required
                      value={customProvince}
                      onChange={(e) => setCustomProvince(e.target.value)}
                      placeholder="مثال: نیمروز، بدخشان، پنجشیر، فاریاب..."
                      className="w-full text-xs bg-white border border-emerald-200 rounded p-1.5 focus:outline-hidden focus:border-emerald-400 font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">آدرس دقیق تحویل کالا:</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="مثال: چهارراهی مستوفیت، چوک پشتونستان"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-hidden focus:border-emerald-300"
                  />
                </div>
              </div>

              {/* Login simulated wholesale checkout settings */}
              {customerType === 'Wholesale' && (
                <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 space-y-2 text-right">
                  <label className="block text-[10px] font-bold text-emerald-800">
                    انتخاب پروفایل مشتری دفتری (عمده‌فروش):
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full text-xs bg-white border border-emerald-200 rounded p-1.5 focus:outline-hidden text-slate-800 font-medium"
                  >
                    <option value="walk-in">مشتری گذری عمده</option>
                    {state.customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — ({c.city})</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-emerald-600 leading-relaxed">
                    * جهت ثبت به صورت فروش دفتری، لطفاً حساب مشتری بدهکار را مشخص کنید تا فاکتور روی حساب مالی او ثبت شود.
                  </p>
                </div>
              )}

              {/* Payment Method Option */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">شرط و نحوه تسویه فاکتور:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-2 text-xs rounded border text-center font-bold cursor-pointer ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    نقدی / پرداخت کابل و ولایات
                  </button>
                  <button
                    type="button"
                    disabled={selectedCustomerId === 'walk-in' && customerType === 'Wholesale'}
                    onClick={() => setPaymentMethod('Credit')}
                    className={`p-2 text-xs rounded border text-center font-bold disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
                      paymentMethod === 'Credit'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    حساب دفتری (قرضه)
                  </button>
                </div>
                {selectedCustomerId === 'walk-in' && customerType === 'Wholesale' && (
                  <p className="text-[9px] text-rose-500 mt-1 font-semibold leading-relaxed">
                    * برای ثبت فاکتور‌های غیر نقدی قرض، مشخص کردن اکانت مشتری دفتری الزامی است.
                  </p>
                )}
              </div>

              {/* Ledger Summary totals */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">مجموع اقلام کالا:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(cartSubtotalAFN, 'AFN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">مصارف انتقال:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(deliveryAFN, 'AFN')}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                  <span>کل فاکتور نهایی:</span>
                  <div className="text-left">
                    <span className="block text-emerald-800 font-black">{formatCurrency(cartTotalAFN, 'AFN')}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">معادل تقریبی: ${cartTotalUSD.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-black text-white text-xs py-2.5 px-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                تایید و ثبت سفارش — {formatCurrency(cartTotalAFN, 'AFN')}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Support / Contact Us form component */}
      <div className="lg:col-span-3 border-t border-slate-200 pt-8 font-sans" id="storefront-support-section">
        <SupportContact />
      </div>

      {/* Footer Section with prominently displayed contact numbers */}
      <div className="lg:col-span-3 mt-12 border-t border-slate-200 pt-8" id="storefront-footer">
        <footer className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 text-right relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Logo and description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600 text-white rounded-xl">
                  <Building className="w-5 h-5 animate-pulse" />
                </span>
                <span className="font-extrabold text-slate-100 text-sm tracking-wide">ستاره شهر (Star of the City)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                بزرگترین مجموعه توزیع سراسری، پخش عمده و خرده کالاهای تجارتی در افغانستان. سیستم مدیریت مرکزی پیشرفته و ترانسپورت منظم ولایتی در تمام ولایات.
              </p>
            </div>

            {/* Offices & Locations */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-200 text-xs tracking-wider">شعبات و نمایندگی‌های مرکزی:</h4>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc pr-4 font-bold">
                <li>دفتر عمومی کابل: جاده عمومی مستوفیت، د ستاره شهر ماڼۍ</li>
                <li>مرکز لجستیک هرات: جاده عمومی شمالی، چوک گلها</li>
                <li>خدمات زون انتقال: ارسال مستقیم به تمام ولایات ۳۴ گانه</li>
              </ul>
            </div>

            {/* Contact Details (Prominently displayed) */}
            <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
              <h4 className="font-bold text-emerald-400 text-xs tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                ارتباط مستقیم و پشتیبانی فروشگاه
              </h4>
              <p className="text-[11px] text-slate-300">
                جهت نهایی‌سازی سفارشات، ثبت فاکتور صادر شده و هماهنگی ارسال بار:
              </p>
              <div className="space-y-2 font-mono text-center font-bold">
                <a href="tel:+93796626004" className="block bg-slate-905 hover:bg-slate-950 hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg text-xs text-slate-100 border border-slate-700">
                  📞 تماس (کابل): +93 796 626 004
                </a>
                <a href="tel:+93778970860" className="block bg-slate-905 hover:bg-slate-950 hover:text-emerald-400 transition-colors py-2 px-3 rounded-lg text-xs text-slate-100 border border-slate-700">
                  📞 تماس (هرات): +93 778 897 086
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <span>© ٢٠٢٦ ستاره شهر. کلیه حقوق محفوظ و متصل به سیستم ERP کابل می‌باشد.</span>
            <div className="flex gap-4">
              <span className="text-slate-400">هرات - کابل - مزار شریف - کندهار - جلال‌آباد - غزنی</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Action Button (FAB) for WhatsApp */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2" id="whatsapp-floating-fab">
        {/* Expanded panel with choose active agent buttons */}
        {showWaPanel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-150 shadow-2xl p-4 w-60 space-y-3 text-right"
          >
            <div className="pb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-850">پشتیبانی در واتساپ ستاره شهر</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
              برای هماهنگی حواله بانکی، حواله صرافی یا تأیید نهایی، چت زنده واتساپ را باز کنید:
            </p>
            <div className="space-y-1.5 font-mono">
              <a
                href="https://wa.me/93796626004"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 rounded-lg text-xs font-black text-emerald-800 transition-colors"
                id="wa-link-1"
              >
                <span className="text-right font-sans text-[10px] text-slate-500 font-bold">نمایندگی کابل</span>
                <span>+93 796 626 004</span>
              </a>
              <a
                href="https://wa.me/93778970860"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 rounded-lg text-xs font-black text-emerald-800 transition-colors"
                id="wa-link-2"
              >
                <span className="text-right font-sans text-[10px] text-slate-500 font-bold">نمایندگی هرات</span>
                <span>+93 778 970 860</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Circular green FAB activator */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowWaPanel(!showWaPanel)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center cursor-pointer transition-all hover:scale-105" 
            title="اتصال به واتساپ"
            id="wa-fab-toggle"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <span className="bg-slate-900/95 text-white text-[10px] py-1 px-2.5 rounded-lg font-extrabold shadow-md">
            ارتباط زنده واتساپ ستاره شهر
          </span>
        </div>
      </div>

      {/* Authentication Simulation Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl" id="oauth-simulation-modal">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full shadow-2xl p-6 text-right relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              authMethod === 'google' ? 'bg-red-500' : 'bg-blue-600'
            }`} />

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-850 text-sm flex items-center gap-2">
                  <span>{authMethod === 'google' ? 'Google Sign-In Connect' : 'Facebook OAuth Link'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {isAuthLoading ? (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-8 h-8 mx-auto">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin absolute" />
                  </div>
                  <p className="text-xs text-slate-700 font-bold leading-relaxed">{simulatedProgressText}</p>
                  <p className="text-[10px] text-slate-400">سیستم تاییدیه امنیتی OAuth2.0 را احراز میگرداند...</p>
                </div>
              ) : (
                <form onSubmit={handleRegisterConfirm} className="space-y-4 text-xs">
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-150 text-emerald-800 space-y-1">
                    <p className="font-bold">✓ احراز هویت با موفقیت انجام شد!</p>
                    <p className="text-[10.5px] leading-relaxed text-emerald-700">پیکربندی هویت از سرور به درستی بازخوانی شد. لطفاً فرم زیر را متناسب با موقعیت خود تایید کنید:</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">نام ثبت شده شما:</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">ایمیل حساب:</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden text-slate-600 text-[11px] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-rose-600 mb-1">شماره تماس مخابراتی (الزامی)*:</label>
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 0796626004"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-white border border-rose-250 focus:border-rose-400 rounded-lg p-2.5 focus:outline-hidden font-extrabold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">ولایت محل اقامت*:</label>
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-hidden text-slate-800 font-bold"
                      >
                        <option value="کابل">کابل</option>
                        <option value="هرات">هرات</option>
                        <option value="کندهار">کندهار</option>
                        <option value="مزار شریف">مزار شریف</option>
                        <option value="جلال‌آباد">جلال‌آباد</option>
                        <option value="غزنی">غزنی</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                      تکمیل عضویت دیجیتال و ورود
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(false)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
