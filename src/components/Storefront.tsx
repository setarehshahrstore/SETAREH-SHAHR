import React, { useState } from 'react';
import { 
  ShoppingCart, Phone, Package, Tag, Star, Users, CheckCircle, 
  Store, Truck, ArrowLeft, Mail, MapPin, Menu, X, Clock, ShieldCheck, 
  MessageCircle, ChevronLeft, Droplets, Coffee, Home, Baby, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Storefront: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll helper
  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-brand-darktext bg-brand-lightbg min-h-screen relative" dir="rtl">
      
      {/* --- Floating Contact Button --- */}
      <a 
        href="#contact"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-green text-white px-5 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(46,125,91,0.4)] hover:bg-emerald-700 transition-all hover:-translate-y-1 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lightgold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
        </span>
        <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        تماس فوری
      </a>

      {/* --- 1. Header --- */}
      <header className="bg-brand-blue text-white sticky top-0 z-40 shadow-lg border-b border-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border-2 border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.2)] overflow-hidden">
              <img src="/logo.png" alt="فروشگاه ستاره شهر" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-gold tracking-wide">ستاره شهر</h1>
              <p className="text-[10px] md:text-xs text-slate-300 font-light">عمده و پرچون</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 font-medium">
            <button onClick={() => scrollTo('categories')} className="hover:text-brand-gold transition-colors">دسته‌بندی‌ها</button>
            <button onClick={() => scrollTo('products')} className="hover:text-brand-gold transition-colors">محصولات</button>
            <button onClick={() => scrollTo('wholesale')} className="hover:text-brand-gold transition-colors">خرید عمده</button>
            <button onClick={() => scrollTo('about')} className="hover:text-brand-gold transition-colors">درباره ما</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-brand-gold transition-colors">تماس با ما</button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 bg-brand-gold text-brand-blue px-6 py-2.5 rounded-xl font-bold hover:bg-brand-lightgold transition-all shadow-md hover:shadow-brand-gold/30 hover:-translate-y-0.5">
              <MessageCircle className="w-4 h-4" />
              ارسال پیام
            </button>
            <button className="relative p-2 text-white hover:text-brand-gold transition-colors bg-brand-navy rounded-xl hidden sm:block">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-brand-navy">۰</span>
            </button>
            <button className="lg:hidden p-2 text-white hover:text-brand-gold" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-0 z-50 bg-brand-blue text-white flex flex-col p-6 lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <img src="/logo.png" className="w-10 h-10 rounded-lg bg-white p-1" />
                <span className="font-bold text-brand-gold text-lg">ستاره شهر</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:text-brand-gold bg-brand-navy rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-xl font-medium">
              <button onClick={() => scrollTo('categories')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">دسته‌بندی‌ها</button>
              <button onClick={() => scrollTo('products')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">محصولات</button>
              <button onClick={() => scrollTo('wholesale')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">خرید عمده</button>
              <button onClick={() => scrollTo('about')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">درباره ما</button>
              <button onClick={() => scrollTo('contact')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">تماس با ما</button>
            </nav>
            
            <div className="mt-auto">
              <button className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-blue py-4 rounded-xl font-bold">
                <Phone className="w-5 h-5" />
                تماس فوری
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* --- 4. Best Selling Products --- */}
      <section id="products" className="py-24 bg-brand-lightbg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-4">پرفروش‌ترین اجناس</h2>
              <div className="w-20 h-1.5 bg-brand-green rounded-full"></div>
            </div>
            <button className="bg-white border border-slate-200 text-brand-blue px-6 py-2.5 rounded-xl font-bold hover:border-brand-gold hover:text-brand-gold flex items-center gap-2 transition-all shadow-sm">
              دیدن همه <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(11,31,58,0.08)] transition-all border border-slate-100 group relative flex flex-col">
                {/* Image Placeholder */}
                <div className="h-56 bg-gradient-to-br from-slate-50 to-slate-100 relative flex items-center justify-center p-6">
                  <div className="absolute top-4 right-4 bg-brand-gold text-brand-blue text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">جدید</div>
                  <Package className="w-20 h-20 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 transition-colors duration-300"></div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-grow border-t border-slate-50">
                  <div className="text-xs text-brand-graytext mb-2 font-medium">مواد خوارکی</div>
                  <h4 className="font-bold text-lg mb-2 text-brand-darktext group-hover:text-brand-blue transition-colors leading-tight">نام محصول با کیفیت عالی شماره {item}</h4>
                  <p className="text-sm text-brand-graytext mb-6 line-clamp-2">این یک توضیحات کوتاه برای نمایش کیفیت و ویژگی‌های این محصول است.</p>
                  
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-brand-graytext mb-0.5">قیمت پرچون</span>
                      <span className="font-black text-brand-green text-xl">۱۵۰ <span className="text-sm font-bold">افغانی</span></span>
                    </div>
                    <button className="w-12 h-12 bg-brand-lightbg rounded-2xl flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-brand-gold transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
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
                  { title: 'شماره‌های تماس', val: '+93 70 123 4567', icon: <Phone className="w-6 h-6" /> },
                  { title: 'آدرس فروشگاه', val: 'کابل، افغانستان', icon: <MapPin className="w-6 h-6" /> },
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

      {/* --- 9. Footer --- */}
      <footer className="bg-brand-navy pt-20 pb-10 border-t-4 border-brand-gold relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue blur-[120px] rounded-[100%] opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-1 rounded-lg">
                  <img src="/logo.png" alt="ستاره شهر" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ستاره شهر</h3>
                  <p className="text-brand-gold text-sm">عمده و پرچون</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
                فروشگاه ستاره شهر، تامین‌کننده مطمئن انواع اجناس ضروری منزل و دکان شما با بهترین کیفیت و نازل‌ترین قیمت در سطح شهر.
              </p>
            </div>
            
            {/* Links Column */}
            <div>
              <h4 className="text-brand-lightgold font-bold text-lg mb-6">دسترسی سریع</h4>
              <ul className="space-y-4">
                <li><button onClick={() => scrollTo('categories')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> دسته‌بندی‌ها</button></li>
                <li><button onClick={() => scrollTo('products')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> محصولات</button></li>
                <li><button onClick={() => scrollTo('wholesale')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> خرید عمده</button></li>
                <li><button onClick={() => scrollTo('about')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> درباره ما</button></li>
              </ul>
            </div>
            
            {/* Contact Column */}
            <div>
              <h4 className="text-brand-lightgold font-bold text-lg mb-6">ارتباط با ما</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <span>کابل، افغانستان</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                  <span dir="ltr">+93 70 123 4567</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                  <span>info@setarehshahr.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} فروشگاه ستاره شهر. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-brand-blue transition-all cursor-pointer">In</div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-brand-blue transition-all cursor-pointer">Fb</div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-brand-blue transition-all cursor-pointer">Ig</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
