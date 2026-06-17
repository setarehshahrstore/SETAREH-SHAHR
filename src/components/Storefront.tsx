import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { Product, SaleItem, Sale, Customer } from '../types';
import { useAuth } from '../AuthContext';
import { ShoppingCart, Phone, Package, Tag, Star, Store, Truck, Search, X, CheckCircle, Clock, Plus, User, Users, ArrowLeft, Mail, MapPin, ShieldCheck, MessageCircle, ChevronLeft, Droplets, Coffee, Home, Baby, Box } from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export const Storefront: React.FC = () => {
  const { state, addSale, addCustomer, cart, setCart, isCartOpen, setIsCartOpen } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

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
      {/* --- 2. Hero Section --- */}
      <section className="relative bg-brand-blue text-white overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-navy rounded-full blur-[100px] opacity-60 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy border border-brand-gold/30 rounded-full text-sm font-medium text-brand-lightgold mb-6 shadow-inner">
              <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
              انتخاب اول خانواده‌ها و دکانداران
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-4 leading-[1.15]">
              فروشگاه <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-gold to-brand-lightgold">ستاره شهر</span>
            </h2>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-slate-300 mb-6">
              عمده و پرچون انواع اجناس مورد نیاز شما
            </h3>
            <p className="text-base md:text-lg text-slate-400 mb-10 leading-relaxed max-w-xl">
              در فروشگاه ستاره شهر، انواع مواد خوارکی، نوشیدنی، لوازم بهداشتی، مواد پاککاری، لوازم خانه و اجناس عمومی را با قیمت مناسب و کیفیت قابل اعتماد تهیه کنید.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollTo('products')} className="bg-gradient-to-l from-brand-gold to-brand-lightgold text-brand-blue px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
                <Store className="w-5 h-5" />
                دیدن محصولات
              </button>
              <button onClick={() => scrollTo('wholesale')} className="bg-transparent text-white border border-brand-gold/50 px-8 py-4 rounded-xl font-bold hover:bg-brand-navy transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
                <Package className="w-5 h-5" />
                سفارش عمده
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center relative"
          >
            <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-[60px] transform scale-75"></div>
            <img src="/logo.png" alt="ستاره شهر" className="w-[450px] h-[450px] object-contain relative z-10 drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* --- 3. Product Categories --- */}
      <section id="categories" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-4">دسته‌بندی‌های اجناس</h2>
            <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'مواد خوارکی', icon: <Coffee className="w-8 h-8" /> },
              { name: 'نوشیدنی‌ها', icon: <Droplets className="w-8 h-8" /> },
              { name: 'لوازم بهداشتی', icon: <ShieldCheck className="w-8 h-8" /> },
              { name: 'مواد پاککاری', icon: <Star className="w-8 h-8" /> },
              { name: 'لوازم خانه', icon: <Home className="w-8 h-8" /> },
              { name: 'اجناس اطفال', icon: <Baby className="w-8 h-8" /> },
              { name: 'اجناس عمومی', icon: <Box className="w-8 h-8" /> },
              { name: 'تخفیف‌های ویژه', icon: <Tag className="w-8 h-8" /> }
            ].map((cat, i) => (
              <div 
                key={i} 
                className="bg-brand-lightbg border border-slate-100 rounded-2xl p-6 text-center hover:bg-white hover:shadow-[0_10px_40px_rgba(11,31,58,0.06)] hover:border-brand-gold/30 transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-full h-1 bg-brand-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right duration-300"></div>
                <div className="w-16 h-16 mx-auto bg-brand-blue/5 rounded-2xl flex items-center justify-center text-brand-blue mb-4 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-brand-gold transition-all duration-300">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-brand-darktext text-sm md:text-base">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. Wholesale & Retail System --- */}
      <section className="py-24 bg-brand-blue text-white relative overflow-hidden">
        {/* Premium Abstract Background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold opacity-5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-green opacity-10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">سیستم فروش دوگانه</h2>
            <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full"></div>
            <p className="text-slate-300 mt-6 max-w-2xl mx-auto text-lg">ما برای هر دو گروه از مشتریان خود خدمات تخصصی و قیمت‌های رقابتی ارائه می‌دهیم.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Retail Card */}
            <div className="bg-brand-navy/50 border border-brand-navy p-8 md:p-10 rounded-[2rem] backdrop-blur-md hover:bg-brand-navy/80 hover:border-brand-gold/30 transition-all group">
              <div className="w-20 h-20 bg-brand-blue rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">فروش پرچون</h3>
              <p className="text-brand-lightgold text-sm font-bold mb-4 uppercase tracking-wider">برای خانواده‌ها</p>
              <p className="text-slate-300 leading-relaxed text-lg">
                مشتریان عزیز می‌توانند تمامی اجناس ضروری و روزمره منزل خود را به صورت دانه یا بسته‌بندی کوچک با مناسب‌ترین قیمت‌های بازار از فروشگاه ستاره شهر تهیه کنند. ما تضمین کیفیت و تازگی را به شما می‌دهیم.
              </p>
            </div>
            
            {/* Wholesale Card */}
            <div className="bg-gradient-to-br from-brand-gold/10 to-transparent border border-brand-gold/20 p-8 md:p-10 rounded-[2rem] backdrop-blur-md hover:bg-brand-gold/10 hover:border-brand-gold/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl"></div>
              <div className="w-20 h-20 bg-brand-gold rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                <Truck className="w-10 h-10 text-brand-blue" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">فروش عمده</h3>
              <p className="text-brand-lightgold text-sm font-bold mb-4 uppercase tracking-wider">برای دکانداران</p>
              <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                دکانداران محترم و مشتریان تجارتی می‌توانند سفارشات کلان خود را در کارتن‌ها و بسته‌بندی‌های کلان با نازل‌ترین قیمت‌های عمده‌فروشی ثبت نمایند. ما آماده همکاری دوامدار با سوپرمارکت‌ها هستیم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. Why Choose Us --- */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-4">چرا ستاره شهر؟</h2>
            <div className="w-20 h-1.5 bg-brand-gold mx-auto rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: 'قیمت مناسب', desc: 'تضمین بهترین قیمت در سطح بازار', icon: <Tag className="w-7 h-7" /> },
              { title: 'فروش عمده و پرچون', desc: 'انعطاف پذیری در مقادیر خرید', icon: <Store className="w-7 h-7" /> },
              { title: 'تنوع اجناس', desc: 'تامین تمامی نیازمندی‌های شما', icon: <Package className="w-7 h-7" /> },
              { title: 'خدمات مطمئن', desc: 'کیفیت تضمین شده برای هر محصول', icon: <CheckCircle className="w-7 h-7" /> },
              { title: 'خانواده‌ها و دکانداران', desc: 'خدمات رسانی به تمام اقشار', icon: <Users className="w-7 h-7" /> },
              { title: 'پاسخگویی سریع', desc: 'رسیدگی فوری به سفارشات', icon: <Clock className="w-7 h-7" /> },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 bg-brand-lightbg rounded-[2rem] border border-slate-100 hover:border-brand-gold/30 hover:shadow-[0_10px_40px_rgba(11,31,58,0.06)] transition-all group hover:-translate-y-2">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-blue mb-6 border border-slate-100 group-hover:bg-brand-blue group-hover:text-brand-gold transition-colors duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-xl text-brand-darktext mb-3">{feature.title}</h4>
                <p className="text-brand-graytext text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 7. About Us --- */}
      <section id="about" className="py-24 bg-brand-lightbg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-gold rounded-full mb-8 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <Star className="w-10 h-10 text-brand-blue fill-brand-blue" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-10">درباره فروشگاه ستاره شهر</h2>
          
          <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-[0_20px_60px_rgba(11,31,58,0.04)] border border-slate-100 relative">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-brand-gold to-transparent"></div>
            
            <p className="text-lg md:text-2xl text-brand-darktext leading-[2] md:leading-[2] mb-8 font-medium">
              فروشگاه <span className="text-brand-gold font-black">ستاره شهر</span> یک فروشگاه عمده و پرچون برای انواع اجناس ضروری و روزمره است. ما با هدف ارائه قیمت مناسب، کیفیت خوب و خدمات مطمئن فعالیت می‌کنیم.
            </p>
            
            <div className="w-12 h-1 bg-brand-navy/10 mx-auto mb-8 rounded-full"></div>
            
            <p className="text-base md:text-lg text-brand-graytext leading-relaxed">
              در فروشگاه ما، مشتریان می‌توانند اجناس مورد نیاز خود را به شکل پرچون تهیه کنند و دکانداران یا مشتریان تجارتی می‌توانند سفارش‌های عمده خود را با نازل‌ترین قیمت ثبت کنند. اعتبار ما، اعتماد شماست.
            </p>
          </div>
        </div>
      </section>

      {/* --- 8. Contact & Wholesale Form --- */}
      <section id="wholesale" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* Contact Info Side */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-4">ارتباط با ما</h2>
              <div className="w-20 h-1.5 bg-brand-gold mb-8 rounded-full"></div>
              
              <p className="text-lg text-brand-graytext mb-10 leading-relaxed">
                برای سفارش، معلومات قیمت، خرید عمده یا همکاری تجارتی مستقیماً با ما در تماس شوید.
              </p>
              
              <div className="space-y-4">
                {[
                  { 
                    title: 'شماره تماس و واتساپ', 
                    val: (
                      <div className="flex flex-col items-start gap-1">
                        <a href="tel:+93796626004" className="hover:text-brand-gold transition-colors block text-left" dir="ltr">+93 796 626 004</a>
                        <a href="https://wa.me/93796626004" target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-600 block text-[13px] font-bold text-left" dir="ltr">WhatsApp (+93 796 626 004)</a>
                      </div>
                    ), 
                    icon: <Phone className="w-6 h-6" /> 
                  },
                  { title: 'آدرس فروشگاه', val: 'شهر مزار شریف مرکز', icon: <MapPin className="w-6 h-6" /> },
                  { title: 'ساعات کاری', val: '۸ صبح الی ۸ شب (همه‌روزه)', icon: <Clock className="w-6 h-6" /> },
                  { title: 'بخش خرید عمده', val: 'ارسال فرم سفارش در کنار', icon: <Package className="w-6 h-6" /> }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 bg-brand-lightbg rounded-2xl border border-slate-100 hover:border-brand-gold/30 hover:bg-white transition-colors group">
                    <div className="bg-brand-blue/5 text-brand-blue p-4 rounded-xl group-hover:bg-brand-blue group-hover:text-brand-gold transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-brand-graytext font-medium mb-1">{item.title}</p>
                      <p className="font-bold text-lg text-brand-darktext" dir="rtl">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Wholesale Form Side */}
            <div className="lg:col-span-7 bg-brand-blue p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden" id="contact">
              {/* Form decor */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-brand-navy rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-brand-gold p-3 rounded-xl"><Package className="w-6 h-6 text-brand-blue" /></div>
                  <h3 className="text-2xl font-bold text-white">فرم سفارش عمده و تماس</h3>
                </div>
                
                <form className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">نام / نام شرکت</label>
                      <input type="text" className="w-full p-4 rounded-xl bg-brand-navy border border-transparent focus:bg-brand-blue focus:border-brand-gold text-white outline-none transition-all placeholder:text-slate-500" placeholder="نام شما..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">شماره تماس</label>
                      <input type="tel" className="w-full p-4 rounded-xl bg-brand-navy border border-transparent focus:bg-brand-blue focus:border-brand-gold text-white outline-none transition-all placeholder:text-slate-500" placeholder="07XXXXXXXX" dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">نوعیت درخواست</label>
                    <select className="w-full p-4 rounded-xl bg-brand-navy border border-transparent focus:bg-brand-blue focus:border-brand-gold text-white outline-none transition-all appearance-none cursor-pointer">
                      <option>خرید عمده (دکانداران)</option>
                      <option>معلومات قیمت‌ها</option>
                      <option>سایر موارد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">لیست سفارش یا پیام شما</label>
                    <textarea rows={5} className="w-full p-4 rounded-xl bg-brand-navy border border-transparent focus:bg-brand-blue focus:border-brand-gold text-white outline-none transition-all placeholder:text-slate-500 resize-none" placeholder="لطفاً لیست اجناس مورد نیاز یا پیام خود را اینجا بنویسید..."></textarea>
                  </div>
                  <button type="button" className="w-full bg-gradient-to-l from-brand-gold to-brand-lightgold text-brand-blue text-lg font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1">
                    ارسال درخواست
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      
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
          <div className="w-full md:w-64 shrink-0" id="categories">
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
          <div className="flex-1" id="products">
            <div id="wholesale"></div>
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
