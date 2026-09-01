import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { Product, SaleItem, Sale, Customer } from '../types';
import { useAuth } from '../AuthContext';
import { 
  ShoppingCart, Phone, Package, Tag, Star, Store, Truck, Search, X, 
  CheckCircle, Clock, Plus, User, Users, ArrowLeft, Mail, MapPin, 
  ShieldCheck, MessageCircle, ChevronLeft, Droplets, Coffee, Home, 
  Baby, Box, Printer, Trash2, Check, Sparkles, ZoomIn, Eye, Heart,
  Flame, Award, Layers, ShoppingBag, Shield
} from 'lucide-react';
import { formatCurrency } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORY_VISUALS, getCategoryImage, getCategoryVisual } from '../categoryData';

// --- Product Card Component with Visual Enhancements ---
const ProductCard: React.FC<{ 
  product: Product & { originalRetailPriceAFN?: number, originalWholesalePriceAFN?: number }, 
  addToCart: (p: Product, t: 'Retail' | 'Wholesale') => void, 
  onPreviewImage: (p: Product) => void,
  className?: string 
}> = ({ product, addToCart, onPreviewImage, className = '' }) => {
  const [addedType, setAddedType] = useState<'Retail' | 'Wholesale' | null>(null);

  const handleAdd = (type: 'Retail' | 'Wholesale') => {
    addToCart(product, type);
    setAddedType(type);
    setTimeout(() => setAddedType(null), 1200);
  };

  const isLowStock = product.stockInBaseUnits > 0 && product.stockInBaseUnits <= 10;
  const isOutOfStock = product.stockInBaseUnits <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-3xl shadow-sm border border-slate-100/80 overflow-hidden hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 group flex flex-col relative ${className}`}
    >
      {/* Product Image Section */}
      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden cursor-pointer" onClick={() => onPreviewImage(product)}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
            <Package className="w-12 h-12 mb-1" />
            <span className="text-[10px] text-slate-400">بدون عکس</span>
          </div>
        )}

        {/* Quick View Button on Image */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreviewImage(product);
          }}
          className="absolute bottom-2.5 left-2.5 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
          title="دیدن عکس بزرگ کالا"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-rose-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg">تمام شد</span>
          </div>
        )}

        {/* Badges & Tags */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercentage && product.discountExpiry && new Date(product.discountExpiry) > new Date() && (
            <span className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> {product.discountPercentage}٪ تخفیف
            </span>
          )}
          {product.isDiscounted && (
            <span className="bg-rose-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" /> لیلام ویژه
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-slate-950" /> پرفروش
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Chip */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            {isLowStock ? (
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                فقط {product.stockInBaseUnits} {product.baseUnit} باقی‌مانده
              </span>
            ) : !isOutOfStock ? (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" /> موجود
              </span>
            ) : null}
          </div>

          <h3 className="font-bold text-slate-900 text-sm md:text-base mb-2 leading-snug line-clamp-2" title={product.name}>
            {product.name}
          </h3>
        </div>

        {/* Pricing & Add to Cart Controls */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          {/* Retail Buy Section */}
          <div className="flex justify-between items-center bg-slate-50/80 hover:bg-slate-100 p-2.5 rounded-2xl border border-slate-200/70 transition-colors">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block">نرخ پرچون (تکی)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-[#0B1F3A] font-mono text-base">{formatCurrency(product.retailPriceAFN, 'AFN')}</span>
                {product.originalRetailPriceAFN && product.originalRetailPriceAFN !== product.retailPriceAFN && (
                  <span className="text-[10px] text-slate-400 line-through font-mono">{formatCurrency(product.originalRetailPriceAFN, 'AFN')}</span>
                )}
              </div>
            </div>

            <button 
              disabled={isOutOfStock}
              onClick={() => handleAdd('Retail')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                addedType === 'Retail'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0B1F3A] text-amber-300 hover:bg-[#15345d] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {addedType === 'Retail' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> افزوده شد
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> خرید پرچون
                </>
              )}
            </button>
          </div>
          
          {/* Wholesale Buy Section */}
          {(product.wholesalePriceAFN ?? 0) > 0 && (
            <div className="flex justify-between items-center bg-amber-50/70 hover:bg-amber-50 p-2.5 rounded-2xl border border-amber-200/80 transition-colors">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-amber-900 block">نرخ عمده (کارتن/بسته)</span>
                  {product.minWholesaleQty && product.minWholesaleQty > 1 && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded">
                      حداقل: {product.minWholesaleQty}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-amber-700 font-mono text-base">{formatCurrency(product.wholesalePriceAFN || 0, 'AFN')}</span>
                  {product.originalWholesalePriceAFN && product.originalWholesalePriceAFN !== product.wholesalePriceAFN && (
                    <span className="text-[10px] text-amber-600/60 line-through font-mono">{formatCurrency(product.originalWholesalePriceAFN, 'AFN')}</span>
                  )}
                </div>
              </div>

              <button 
                disabled={isOutOfStock}
                onClick={() => handleAdd('Wholesale')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                  addedType === 'Wholesale'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {addedType === 'Wholesale' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> افزوده شد
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" /> خرید عمده
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Storefront: React.FC = () => {
  const { state, addSale, addCustomer, cart, setCart, isCartOpen, setIsCartOpen, addInquiry } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [successfulOrder, setSuccessfulOrder] = useState<any | null>(null);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('خرید عمده (دکانداران)');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) return;

    setIsInquirySubmitting(true);
    
    // Simulate slight network delay
    setTimeout(() => {
      addInquiry({
        id: `inquiry-${Date.now()}`,
        name: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        message: `[${inquiryType}]\n${inquiryMessage.trim()}`,
        date: new Date().toISOString(),
        status: 'Pending'
      });
      
      setIsInquirySubmitting(false);
      setInquirySuccess(true);
      
      // Auto reset form after 5 seconds
      setTimeout(() => {
        setInquirySuccess(false);
        setInquiryName('');
        setInquiryPhone('');
        setInquiryMessage('');
      }, 5000);
    }, 800);
  };

  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  useEffect(() => {
    const hasDiscounted = state.products.some(p => p.isDiscounted || (p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date()));
    const seenAnnouncement = sessionStorage.getItem('AFG_ANNOUNCEMENT_SEEN');
    if (hasDiscounted && !seenAnnouncement) {
      setIsAnnouncementOpen(true);
      sessionStorage.setItem('AFG_ANNOUNCEMENT_SEEN', 'true');
    }
  }, [state.products]);

  const activeProducts = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const productSalesCount: Record<string, number> = {};
    
    state.sales.forEach(sale => {
      if (new Date(sale.date) >= thirtyDaysAgo) {
        sale.items.forEach(item => {
          productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + item.quantity;
        });
      }
    });

    const topProductIds = new Set(Object.entries(productSalesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]));

    return state.products.map(p => {
      const isTopSeller = topProductIds.has(p.id) || p.isBestSeller;
      let pModified: any = { ...p, isBestSeller: isTopSeller };

      if (p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date()) {
        const factor = 1 - p.discountPercentage / 100;
        pModified = {
          ...pModified,
          originalRetailPriceAFN: p.retailPriceAFN,
          originalWholesalePriceAFN: p.wholesalePriceAFN,
          retailPriceAFN: p.retailPriceAFN * factor,
          retailPriceUSD: p.retailPriceUSD * factor,
          wholesalePriceAFN: p.wholesalePriceAFN * factor,
          wholesalePriceUSD: p.wholesalePriceUSD * factor,
        };
      }
      return pModified;
    });
  }, [state.products, state.sales]);

  // Derived list of distinct categories from products and registered categories
  const categoriesList = useMemo(() => {
    const fromProducts = Array.from(new Set(activeProducts.map(p => p.category))).filter(Boolean);
    const fromRegistered = (state.categories || []).map(c => c.name).filter(Boolean);
    const set = new Set([...fromRegistered, ...fromProducts]);
    return Array.from(set);
  }, [activeProducts, state.categories]);

  const categories = useMemo(() => {
    return ['All', 'تخفیف‌های ویژه', 'پرفروش‌ترین‌ها', ...categoriesList];
  }, [categoriesList]);

  // Quick live search matching items
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return activeProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [activeProducts, searchQuery]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter(p => {
      let matchesCat = false;
      if (activeCategory === 'All') matchesCat = true;
      else if (activeCategory === 'تخفیف‌های ویژه') matchesCat = !!p.isDiscounted || !!(p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date());
      else if (activeCategory === 'پرفروش‌ترین‌ها') matchesCat = !!p.isBestSeller;
      else matchesCat = p.category === activeCategory;

      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeProducts, activeCategory, searchQuery]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (product: Product, type: 'Retail' | 'Wholesale') => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.type === type);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const initialQty = type === 'Wholesale' && product.minWholesaleQty ? product.minWholesaleQty : 1;
      return [...prev, { product, quantity: initialQty, type }];
    });
    // setIsCartOpen(true); // Removed so cart does not open automatically on add
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;
      const minQty = item.type === 'Wholesale' && item.product.minWholesaleQty ? item.product.minWholesaleQty : 1;
      
      if (item.type === 'Wholesale' && newQty < minQty && delta < 0) {
        alert(`حداقل خرید عمده برای این کالا ${minQty} ${item.product.baseUnit || 'دانه'} است.`);
        return prev;
      }
      
      item.quantity = Math.max(1, newQty);
      return updated;
    });
  };

  const cartTotalAFN = cart.reduce((sum, item) => {
    const price = item.type === 'Retail' ? item.product.retailPriceAFN : (item.product.wholesalePriceAFN || item.product.retailPriceAFN);
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // 1. Determine customer
    let customerId = '';
    let customerName = '';
    let customerPhone = '';
    let customerAddress = '';

    const loggedInCustomer = user?.role === 'Customer' ? state.customers.find(c => c.name === user.fullName) : null;

    if (loggedInCustomer) {
      customerId = loggedInCustomer.id;
      customerName = loggedInCustomer.name;
      customerPhone = loggedInCustomer.phone;
      customerAddress = loggedInCustomer.address || '';
    } else {
      if (!checkoutForm.name || !checkoutForm.phone) return;
      
      let existingCustomer = state.customers.find(c => c.phone === checkoutForm.phone);
      customerId = existingCustomer ? existingCustomer.id : Date.now().toString();
      customerName = checkoutForm.name;
      customerPhone = checkoutForm.phone;
      customerAddress = checkoutForm.address;

      if (!existingCustomer) {
        addCustomer({
          id: customerId,
          name: customerName,
          phone: customerPhone,
          city: 'مزار شریف / کابل',
          debtUSD: 0,
          debtAFN: 0,
          creditLimitUSD: 0
        });
      }
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
      customerName: customerName,
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
      deliveryAddress: customerAddress,
      deliveryCity: 'مرکز',
      cashierName: user?.fullName || 'ثبت آنلاین'
    };

    addSale(newSale);
    setCart([]);
    setIsCheckoutOpen(false);
    setSuccessfulOrder(newSale);
  };

  // Helper to count products for a given category name
  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return activeProducts.length;
    if (catName === 'تخفیف‌های ویژه') return activeProducts.filter(p => p.isDiscounted || (p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date())).length;
    if (catName === 'پرفروش‌ترین‌ها') return activeProducts.filter(p => p.isBestSeller).length;
    return activeProducts.filter(p => p.category === catName).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans print:bg-white" dir="rtl">
      
      {/* --- 1. Hero Section with Engaging Visuals & Floating Feature Chips --- */}
      <section className="relative bg-gradient-to-b from-[#0B1F3A] via-[#0E284D] to-[#0B1F3A] text-white overflow-hidden py-16 md:py-24 lg:py-28">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#D4AF37]/15 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-right"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-amber-400/30 rounded-full text-xs md:text-sm font-bold text-amber-300 mb-6 shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>بزرگترین مرکز توزیع مواد غذایی و مصرفی در افغانستان</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-[1.2] tracking-tight">
              فروشگاه <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#F5D76E] via-[#D4AF37] to-amber-200 drop-shadow-sm">ستاره شهر</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium text-amber-100/90 mb-4">
              خرید آسان و مطمین با <span className="underline decoration-amber-400 underline-offset-8">عکس‌های شفاف</span> اجناس، بدون نیاز به سواد یا زحمت!
            </p>

            <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed max-w-2xl">
              تأمین‌کننده دست‌اول انواع مواد خوراکی تازه، نوشیدنی‌ها، لوازم بهداشتی، پاک‌کاری، خشکبار اعلا و ضروریات خانه با نرخ‌های رقابتی عمده برای دکانداران و پرچون برای خانواده‌های گرامی.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button 
                onClick={() => scrollTo('categories-section')} 
                className="bg-gradient-to-l from-[#D4AF37] to-[#F5D76E] text-[#0B1F3A] px-7 py-4 rounded-2xl font-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2.5 text-base shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                دیدن دسته‌بندی‌ها و عکس‌ها
              </button>
              <button 
                onClick={() => scrollTo('wholesale-section')} 
                className="bg-white/10 hover:bg-white/20 text-white border border-amber-400/40 px-6 py-4 rounded-2xl font-bold backdrop-blur-md transition-all flex items-center gap-2 text-base active:scale-95"
              >
                <Truck className="w-5 h-5 text-amber-400" />
                سفارش و استعلام عمده
              </button>
            </div>

            {/* Feature Badges Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-xl">
              <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">ضمانت کیفیت</p>
                  <p className="text-[10px] text-slate-400">کالای اصل و تاریخ‌دار</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <Truck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">ارسال سریع</p>
                  <p className="text-[10px] text-slate-400">درب مغازه و منزل</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <Tag className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">نرخ عمده‌فروشی</p>
                  <p className="text-[10px] text-slate-400">مستقیم از واردکننده</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Hero Visual Card / Logo Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            <div className="relative w-full max-w-md">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-emerald-500/20 rounded-[2.5rem] blur-2xl transform rotate-3 scale-95"></div>
              
              <div className="relative bg-gradient-to-b from-[#132c52] to-[#0c1e38] p-8 rounded-[2.5rem] border border-amber-500/30 shadow-2xl text-center backdrop-blur-xl">
                <div className="w-32 h-32 mx-auto bg-white rounded-3xl p-4 shadow-xl border-2 border-amber-400 mb-6 flex items-center justify-center">
                  <img src="/logo.png" alt="ستاره شهر" className="w-full h-full object-contain" />
                </div>
                
                <div className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-black mb-3">
                  تضمین کمترین نرخ و بالاترین کیفیت
                </div>
                <h3 className="text-2xl font-black text-white mb-2">سوپرمارکت و عمده‌فروشی ستاره شهر</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  ارائه‌دهنده بیش از هزاران قلم کالای معتبر با قابلیت مشاهده عکس واقعی و ثبت سفارش ۲۴ ساعته
                </p>

                {/* Floating mini stats */}
                <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="text-center">
                    <span className="text-xl font-black text-amber-400 font-mono">100%</span>
                    <p className="text-[10px] text-slate-300">اصالت و سلامت کالا</p>
                  </div>
                  <div className="text-center border-r border-white/10">
                    <span className="text-xl font-black text-emerald-400 font-mono">24/7</span>
                    <p className="text-[10px] text-slate-300">پشتیبانی و سفارش</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 2. PHOTOGRAPHIC CATEGORIES SECTION (دسته‌بندی‌ها با تصاویر جذاب و واضح برای همه مشتریان) --- */}
      <section id="categories-section" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-3">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>انتخاب آسان و تصویری اجناس</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight mb-4">
              دسته‌بندی‌های تصویری کالاها
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full mb-4"></div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              با کلیک روی عکس هر گروه، تمام اجناس مربوط به همان گروه نمایش داده می‌شوند. حتی بدون خواندن متن، تصویر کالاها راهنمای شماست!
            </p>
          </div>
          
          {/* Photographic Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORY_VISUALS.map((cat, idx) => {
              const count = getCategoryCount(cat.name);
              const isActive = activeCategory === cat.name;

              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    scrollTo('products-section');
                  }}
                  className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border-2 aspect-[4/3] sm:aspect-square flex flex-col justify-end p-4 sm:p-5 ${
                    isActive ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-slate-100 hover:border-amber-400'
                  }`}
                >
                  {/* Category Vivid Photo */}
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 ease-out" 
                  />

                  {/* Dark Vignette / Gradient Overlay for optimal legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent group-hover:from-slate-950/90 transition-all duration-300"></div>

                  {/* Floating Tag at Top */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {cat.badge}
                    </span>
                  </div>

                  {/* Item count badge at top left */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {count > 0 ? `${count} جنس` : 'موجود'}
                    </span>
                  </div>

                  {/* Category Title & Dari Subtitle */}
                  <div className="relative z-10 text-right">
                    <h3 className="font-black text-white text-base sm:text-xl drop-shadow-md leading-tight mb-1 group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-200/90 font-medium line-clamp-1 mb-2">
                      {cat.dariName}
                    </p>
                    
                    {/* View items button hint */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>دیدن همه اجناس</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 3. DUAL STORE SYSTEM BANNER (فروش عمده و پرچون) --- */}
      <section className="py-20 bg-[#0B1F3A] text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600 opacity-10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">سیستم خدمات و قیمت‌گذاری دوگانه</h2>
            <div className="w-20 h-1.5 bg-[#D4AF37] mx-auto rounded-full mb-4"></div>
            <p className="text-slate-300 text-sm sm:text-base">خدمات اختصاصی با بالاترین تخفیف برای دکانداران و تازه‌ترین کالاها برای خانواده‌ها</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Retail Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md hover:border-amber-400/40 transition-all group">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-900 transition-all text-amber-300">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-full">برای منازل و فامیل‌ها</span>
              </div>
              <h3 className="text-2xl font-black mb-3 text-white">فروش پرچون (تکی و بسته‌ای)</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                هر مقدار که نیاز دارید، از ۱ دانه روغن، ۱ قطی چای یا ۱ عدد شامپو با قیمت مناسب‌تر از بازار محلی خریداری فرمایید و درب منزل تحویل بگیرید.
              </p>
            </div>
            
            {/* Wholesale Card */}
            <div className="bg-gradient-to-br from-amber-500/15 to-white/5 border border-amber-400/30 p-8 rounded-3xl backdrop-blur-md hover:border-amber-400 transition-all group relative overflow-hidden">
              <div className="w-16 h-16 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-all">
                <Truck className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-amber-950 bg-amber-300 px-2.5 py-1 rounded-full">مخصوص سوپرمارکت‌ها و دکانداران</span>
              </div>
              <h3 className="text-2xl font-black mb-3 text-white">فروش عمده (کارتن و تناژ)</h3>
              <p className="text-slate-200 leading-relaxed text-sm">
                دکانداران ولایات و کابل می‌توانند سفارش‌های عمده خود را به نرخ وارداتی بدون واسطه با فاکتور رسمی و ارسال مطمئن ثبت نمایند.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. MAIN PRODUCTS & VISUAL CATALOG SECTION --- */}
      <main id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Receipt display if order just succeeded */}
        {successfulOrder && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 mb-12 flex flex-col items-center justify-center text-center shadow-md print:shadow-none print:border-black print:bg-white print:p-0">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 print:hidden">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 print:hidden">سفارش شما با موفقیت در سیستم ثبت گردید!</h2>
            <p className="text-slate-600 mb-6 print:hidden text-sm">همکاران بخش توزیع ستاره شهر به زودی جهت ارسال با شما تماس خواهند گرفت.</p>
            
            {/* The Printable Receipt */}
            <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-right print:border-none print:shadow-none print:p-0">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-xl font-black text-[#0B1F3A]">رسید رسمی سفارش - {state.storeConfig?.storeName || "فروشگاه ستاره شهر"}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">شماره فاکتور: {successfulOrder.invoiceNo}</p>
                </div>
                <div className="text-left text-xs text-slate-500">
                  <p>تاریخ: {new Date().toLocaleDateString('fa-IR')}</p>
                  <p className="font-bold text-slate-800 mt-1">مشتری: {successfulOrder.customerName}</p>
                  <p dir="ltr">{successfulOrder.customerPhone || '---'}</p>
                </div>
              </div>
              
              <table className="w-full text-xs sm:text-sm mb-6">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="py-2.5 px-3 text-right">نام کالا</th>
                    <th className="py-2.5 px-3 text-center">تعداد</th>
                    <th className="py-2.5 px-3 text-left">مجموع (افغانی)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {successfulOrder.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">{item.productName}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{item.quantity} {item.selectedUnit || 'دانه'}</td>
                      <td className="py-3 px-3 text-left font-mono font-black text-indigo-700">{formatCurrency(item.totalAFN, 'AFN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-bold text-slate-700">مجموع قابل پرداخت:</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(successfulOrder.totalAFN, 'AFN')}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
              <button onClick={() => window.print()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-sm text-sm">
                <Printer className="w-4 h-4" /> چاپ یا ذخیره PDF
              </button>
              <Link to="/tracking" className="bg-[#0B1F3A] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#15345d] text-sm">
                پیگیری آنلاین سفارش
              </Link>
              <button onClick={() => setSuccessfulOrder(null)} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-300 text-sm">
                خرید بیشتر
              </button>
            </div>
          </div>
        )}

        {/* Section Heading & Live Search Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">لیست کالاها و خرید آنلاین</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">با کلیک روی دسته‌های تصویری زیر، اجناس مورد نظر خود را فیلتر کنید</p>
          </div>

          {/* Interactive Search with Thumbnail Dropdown */}
          <div className="relative w-full md:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2.5 flex items-center gap-2 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-1" />
              <input 
                type="text" 
                placeholder="جستجوی نام یا عکس کالا..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-sm font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant search preview dropdown */}
            {searchResults.length > 0 && searchQuery && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-30 p-2 space-y-1">
                {searchResults.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setPreviewProduct(p);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <img src={p.image || getCategoryImage(p.category)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-amber-600 font-mono">{formatCurrency(p.retailPriceAFN, 'AFN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- HORIZONTAL VISUAL CATEGORY SELECTOR CAROUSEL --- */}
        <div className="mb-10 overflow-x-auto pb-3 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-3 min-w-max">
            {categories.map(cat => {
              const isActive = activeCategory === cat;
              const visual = getCategoryVisual(cat);
              const count = getCategoryCount(cat);

              let iconImg = visual.image;
              if (cat === 'All') iconImg = 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200';
              if (cat === 'تخفیف‌های ویژه') iconImg = 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80&w=200';
              if (cat === 'پرفروش‌ترین‌ها') iconImg = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=200';

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 shadow-sm border ${
                    isActive 
                      ? 'bg-[#0B1F3A] text-amber-300 border-amber-400 shadow-md ring-2 ring-amber-400/30' 
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <img src={iconImg} alt={cat} className="w-8 h-8 rounded-full object-cover border border-white/40 shadow-xs" />
                  <span>{cat === 'All' ? 'همه کالاها' : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Featured Row 1: Special Discounts Carousel --- */}
        {activeCategory === 'All' && state.products.some(p => p.isDiscounted || (p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date())) && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Flame className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-600">اجناس لیلام و تخفیف‌دار روزانه</h3>
                  <p className="text-xs text-slate-500">قیمت‌های استثنایی با مدت محدود</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveCategory('تخفیف‌های ویژه')}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                دیدن همه تخفیف‌ها <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {state.products.filter(p => p.isDiscounted || (p.discountPercentage && p.discountExpiry && new Date(p.discountExpiry) > new Date())).slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  onPreviewImage={setPreviewProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- Featured Row 2: Best Sellers Row --- */}
        {activeCategory === 'All' && state.products.some(p => p.isBestSeller) && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-700">پرفروش‌ترین‌های منتخب ستاره شهر</h3>
                  <p className="text-xs text-slate-500">محبوب‌ترین اقلام از نگاه خریداران</p>
                </div>
              </div>

              <button 
                onClick={() => setActiveCategory('پرفروش‌ترین‌ها')}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                دیدن همه پرفروش‌ها <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {state.products.filter(p => p.isBestSeller).slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={addToCart} 
                  onPreviewImage={setPreviewProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- Main Filtered Products Grid --- */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-800">
            {activeCategory === 'All' ? 'تمامی کالاهای موجود' : `کالاهای دسته‌بندی: ${activeCategory}`}
          </h3>
          <span className="text-xs font-bold text-slate-500 font-mono">
            تعداد: {filteredProducts.length} قلم کالا
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              addToCart={addToCart} 
              onPreviewImage={setPreviewProduct}
            />
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-100">
              <Package className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <h4 className="font-black text-lg text-slate-700 mb-1">هیچ جنسی در این گروه یافت نشد!</h4>
              <p className="text-xs text-slate-400 mb-4">می‌توانید سایر دسته‌بندی‌های تصویری را بررسی کنید.</p>
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="px-5 py-2.5 bg-[#0B1F3A] text-amber-300 rounded-xl font-bold text-xs"
              >
                نمایش تمام کالاها
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- 5. WHOLESALE & BULK INQUIRY SECTION (فرم سفارش عمده) --- */}
      <section id="wholesale-section" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-3">
                  <Phone className="w-3.5 h-3.5" />
                  <span>تماس و سفارش فوری</span>
                </div>
                <h2 className="text-3xl font-black text-[#0B1F3A] mb-3">مرکز ارتباط و هماهنگی</h2>
                <div className="w-16 h-1.5 bg-amber-500 rounded-full mb-4"></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  جهت خرید تناژ، استعلام نرخ روز، عقد قرارداد تأمین سوپرمارکت‌ها یا ارسال به سایر ولایات، از طریق شماره‌ها یا فرم کنار با ما در ارتباط شوید.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">شماره تماس مستقیم و واتساپ</p>
                    <a href={`tel:${state.storeConfig?.phone || "+93 796 626 004"}`} className="font-mono font-black text-slate-900 hover:text-amber-600 text-base" dir="ltr">{state.storeConfig?.phone || "+93 796 626 004"}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">آدرس گدام و فروشگاه مرکزی</p>
                    <p className="font-bold text-slate-800 text-sm">{state.storeConfig?.address || "مزار شریف، مرکز شهر، انبار مرکزی ستاره شهر"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold">ساعات فعالیت و پاسخگویی</p>
                    <p className="font-bold text-slate-800 text-sm">همه‌روزه از ساعت ۸:۰۰ صبح الی ۸:۰۰ شب</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wholesale Form Column */}
            <div className="lg:col-span-7 bg-[#0B1F3A] text-white p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-400 text-slate-950 p-2.5 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">فرم آنلاین سفارش عمده و استعلام</h3>
                    <p className="text-xs text-amber-200/80">پاسخگویی سریع توسط مدیریت فروش</p>
                  </div>
                </div>
                
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  {inquirySuccess ? (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-8 rounded-2xl text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                      <h4 className="text-lg font-black text-white mb-1">درخواست شما با موفقیت ثبت شد!</h4>
                      <p className="text-xs leading-relaxed text-slate-300">مسوول فروش عمده به زودی با شماره تماس شما هماهنگ خواهد شد.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">نام یا عنوان دکان / سوپرمارکت <span className="text-rose-400">*</span></label>
                          <input 
                            required
                            type="text" 
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            className="w-full p-3.5 rounded-xl bg-white/10 border border-white/10 focus:border-amber-400 text-white outline-none text-sm transition-all" 
                            placeholder="مثلاً: سوپرمارکت آریا..." 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">شماره تماس فعال (واتساپ) <span className="text-rose-400">*</span></label>
                          <input 
                            required
                            type="tel" 
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            className="w-full p-3.5 rounded-xl bg-white/10 border border-white/10 focus:border-amber-400 text-white outline-none text-sm font-mono text-right transition-all" 
                            placeholder="07XXXXXXXX" 
                            dir="ltr" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">نوع تقاضا</label>
                        <select 
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-[#0E284D] border border-white/10 focus:border-amber-400 text-white outline-none text-sm cursor-pointer"
                        >
                          <option>خرید عمده (کارتن و باربری برای دکانداران)</option>
                          <option>استعلام قیمت روز مواد غذایی و روغن</option>
                          <option>قرارداد تأمین برای هوتل‌ها و رستورانت‌ها</option>
                          <option>سایر موارد</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">لیست اقلام مورد نیاز یا پیام شما <span className="text-rose-400">*</span></label>
                        <textarea 
                          required
                          rows={4} 
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white/10 border border-white/10 focus:border-amber-400 text-white outline-none text-sm transition-all resize-none" 
                          placeholder="تعداد کارتن، نام اجناس یا ولایت مقصد خود را بنویسید..."
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isInquirySubmitting}
                        className="w-full bg-gradient-to-l from-[#D4AF37] to-[#F5D76E] text-[#0B1F3A] text-base font-black py-4 rounded-2xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isInquirySubmitting ? (
                          <div className="w-5 h-5 border-2 border-[#0B1F3A] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Package className="w-5 h-5" />
                            ارسال سفارش عمده
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. PRODUCT IMAGE PREVIEW / QUICK-VIEW MODAL --- */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-4 bg-[#0B1F3A] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-sm">مشاهده دقیق عکس و اطلاعات کالا</h3>
                </div>
                <button onClick={() => setPreviewProduct(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Big Photographic Showcase */}
              <div className="relative aspect-video sm:aspect-[16/10] bg-slate-900 overflow-hidden">
                <img 
                  src={previewProduct.image || getCategoryImage(previewProduct.category)} 
                  alt={previewProduct.name} 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-bold">
                  {previewProduct.category}
                </div>
              </div>

              {/* Product Info & Action */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">{previewProduct.name}</h2>
                  <p className="text-xs text-slate-500 font-mono">کد کالا (SKU): {previewProduct.sku}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block">نرخ پرچون:</span>
                    <span className="text-lg font-black text-indigo-700 font-mono">{formatCurrency(previewProduct.retailPriceAFN, 'AFN')}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-800 font-bold block">نرخ عمده‌فروشی:</span>
                    <span className="text-lg font-black text-amber-700 font-mono">{formatCurrency(previewProduct.wholesalePriceAFN || 0, 'AFN')}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => {
                      addToCart(previewProduct, 'Retail');
                      setPreviewProduct(null);
                    }}
                    className="flex-1 bg-[#0B1F3A] text-amber-300 py-3.5 rounded-2xl font-black text-sm hover:bg-[#15345d] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> افزودن پرچون به سبد
                  </button>

                  {(previewProduct.wholesalePriceAFN ?? 0) > 0 && (
                    <button 
                      onClick={() => {
                        addToCart(previewProduct, 'Wholesale');
                        setPreviewProduct(null);
                      }}
                      className="flex-1 bg-amber-600 text-white py-3.5 rounded-2xl font-black text-sm hover:bg-amber-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> افزودن عمده به سبد
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 7. SHOPPING CART DRAWER --- */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 print:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col print:hidden"
              dir="rtl"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#0B1F3A] text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-[#0B1F3A] flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-black text-base">سبد خرید شما</h2>
                    <p className="text-[10px] text-amber-200">{cart.length} قلم کالا انتخاب شده</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <ShoppingCart className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-slate-700 text-base mb-1">سبد خرید شما خالی است</p>
                    <p className="text-xs text-slate-400">می‌توانید از روی عکس‌های اجناس کالا به سبد اضافه کنید.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => {
                    const price = item.type === 'Retail' ? item.product.retailPriceAFN : (item.product.wholesalePriceAFN || item.product.retailPriceAFN);
                    return (
                      <div key={idx} className="flex gap-3 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm relative group hover:border-slate-200">
                        <button onClick={() => removeFromCart(idx)} className="absolute top-2.5 left-2.5 p-1 text-rose-500 hover:bg-rose-100 bg-rose-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-4 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate mb-1 pl-6">{item.product.name}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.type === 'Retail' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                            {item.type === 'Retail' ? 'پرچون (تکی)' : 'عمده‌فروشی'}
                          </span>
                          
                          <div className="flex justify-between items-end mt-2">
                            <span className="font-black text-[#0B1F3A] font-mono text-sm">{formatCurrency(price, 'AFN')}</span>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
                              <button onClick={() => updateCartQty(idx, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 font-bold hover:bg-slate-50">-</button>
                              <span className="w-6 text-center text-xs font-bold font-mono">{item.quantity}</span>
                              <button onClick={() => updateCartQty(idx, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 font-bold hover:bg-slate-50">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 bg-slate-50 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-600 text-sm">مجموع قابل پرداخت:</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(cartTotalAFN, 'AFN')}</span>
                  </div>
                  <button 
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full bg-gradient-to-l from-[#D4AF37] to-[#F5D76E] text-[#0B1F3A] py-4 rounded-2xl font-black text-base hover:shadow-xl transition-all shadow-md active:scale-95"
                  >
                    تکمیل اطلاعات و ثبت نهایی سفارش
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- 8. CHECKOUT MODAL --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 print:hidden">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              dir="rtl"
            >
              <div className="p-6 bg-[#0B1F3A] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black">اطلاعات تحویل و ثبت سفارش</h2>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCheckout} className="p-6 space-y-4">
                {user?.role === 'Customer' ? (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <p className="text-xs font-bold text-amber-900 mb-0.5">سفارش با حساب کاربری مشتری:</p>
                    <p className="text-slate-800 font-black text-sm">{user.fullName}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نام و تخلص خریدار <span className="text-rose-500">*</span></label>
                      <input 
                        required 
                        type="text" 
                        placeholder="نام شما یا نام دکان..."
                        value={checkoutForm.name} 
                        onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس (جهت هماهنگی تحویل) <span className="text-rose-500">*</span></label>
                      <input 
                        required 
                        type="tel" 
                        dir="ltr"
                        placeholder="07XXXXXXXX"
                        value={checkoutForm.phone} 
                        onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-right focus:border-amber-500 outline-none"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">آدرس دقیق جهت ارسال</label>
                  <textarea 
                    rows={2}
                    placeholder="شهر، ناحیه، گذر، آدرس دقیق..."
                    value={checkoutForm.address} 
                    onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl flex items-center gap-3 border border-emerald-100">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold">پرداخت وجه هنگام تحویل کالا (نقدی یا حواله) صورت می‌گیرد.</p>
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-base shadow-lg transition-all active:scale-95 mt-2">
                  تایید نهایی و دریافت فاکتور
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 9. ANNOUNCEMENT POPUP MODAL --- */}
      <AnimatePresence>
        {isAnnouncementOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 print:hidden">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative text-center p-8 border border-amber-200"
              dir="rtl"
            >
              <button 
                onClick={() => setIsAnnouncementOpen(false)} 
                className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Flame className="w-10 h-10 fill-rose-600" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">تخفیف‌های ویژه و اجناس لیلام!</h2>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                مشتری گرامی، اجناس دارای تخفیف فوق‌العاده با قیمت‌های ارزان‌تر از عمده‌فروشی در فروشگاه موجود است.
              </p>
              
              <button 
                onClick={() => {
                  setIsAnnouncementOpen(false);
                  setActiveCategory('تخفیف‌های ویژه');
                  scrollTo('products-section');
                }}
                className="w-full bg-rose-600 text-white py-3.5 rounded-2xl font-black text-base hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                مشاهده اجناس تخفیف‌دار
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
