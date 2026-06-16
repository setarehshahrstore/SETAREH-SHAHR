import React from 'react';
import { ShoppingCart, Phone, Package, Tag, Star, Users, CheckCircle, Store, Truck, ArrowLeft, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const Storefront: React.FC = () => {
  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen" dir="rtl">
      
      {/* 1. Header */}
      <header className="bg-brand-blue text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="فروشگاه ستاره شهر" className="w-12 h-12 rounded-full border-2 border-brand-gold bg-white object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-brand-gold tracking-wide">ستاره شهر</h1>
              <p className="text-xs text-slate-300">عمده و پرچون</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <a href="#categories" className="hover:text-brand-gold transition-colors">دسته‌بندی‌ها</a>
            <a href="#about" className="hover:text-brand-gold transition-colors">درباره ما</a>
            <a href="#services" className="hover:text-brand-gold transition-colors">خدمات</a>
            <a href="#contact" className="hover:text-brand-gold transition-colors">تماس با ما</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 bg-brand-gold text-brand-blue px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-sm">
              <Phone className="w-4 h-4" />
              تماس با ما
            </button>
            <button className="relative p-2 text-white hover:text-brand-gold transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">۰</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-brand-blue text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold via-brand-blue to-brand-blue"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 bg-brand-gold/20 text-brand-gold rounded-full text-sm font-bold mb-6 border border-brand-gold/30">
              خرید آسان، قیمت مناسب، تحویل مطمئن
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              فروشگاه <span className="text-brand-gold">ستاره شهر</span>
            </h2>
            <h3 className="text-xl md:text-2xl font-medium text-slate-300 mb-6">
              عمده و پرچون انواع اجناس مورد نیاز شما
            </h3>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
              در فروشگاه ستاره شهر، انواع مواد خوارکی، نوشیدنی، لوازم بهداشتی، مواد پاککاری، لوازم خانه و اجناس عمومی را با قیمت مناسب و کیفیت قابل اعتماد تهیه کنید.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button className="bg-brand-gold text-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-brand-gold/20 flex items-center gap-2">
                <Store className="w-5 h-5" />
                دیدن محصولات
              </button>
              <button className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-lg font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                <Package className="w-5 h-5" />
                سفارش عمده
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <img src="/logo.png" alt="ستاره شهر" className="w-80 h-80 object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.3)]" />
          </motion.div>
        </div>
      </section>

      {/* 3. Product Categories */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-brand-blue mb-4">دسته‌بندی‌های محصولات</h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[
              { name: 'مواد خوارکی', icon: '🍽️' },
              { name: 'نوشیدنی‌ها', icon: '🥤' },
              { name: 'لوازم بهداشتی', icon: '🧼' },
              { name: 'مواد پاککاری', icon: '🧹' },
              { name: 'لوازم خانه', icon: '🛋️' },
              { name: 'اجناس اطفال', icon: '🧸' },
              { name: 'اجناس عمومی', icon: '📦' },
              { name: 'اجناس عمده برای دکانداران', icon: '🏪', cols: 2 },
              { name: 'تخفیف‌ها و پیشنهادات ویژه', icon: '🏷️', cols: 2 }
            ].map((cat, i) => (
              <div 
                key={i} 
                className={`bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center hover:shadow-xl hover:border-brand-gold/50 transition-all cursor-pointer group ${cat.cols ? `col-span-2 md:col-span-${cat.cols}` : ''}`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="font-bold text-slate-800 group-hover:text-brand-blue">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Selling Products (Placeholder for live data) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-brand-blue mb-4">پرفروش‌ترین اجناس</h2>
              <div className="w-24 h-1 bg-brand-green rounded-full"></div>
            </div>
            <button className="text-brand-blue font-bold hover:text-brand-gold flex items-center gap-1 transition-colors">
              دیدن همه <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 group">
                <div className="h-48 bg-slate-200 relative overflow-hidden flex items-center justify-center text-slate-400">
                  <Package className="w-12 h-12 opacity-50" />
                  <div className="absolute top-3 right-3 bg-brand-gold text-brand-blue text-xs font-bold px-2 py-1 rounded">ویژه</div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-brand-blue transition-colors">محصول نمونه {item}</h4>
                  <p className="text-sm text-slate-500 mb-4">دسته‌بندی نمونه</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-brand-green text-lg">۱۵۰ افغانی</span>
                    <button className="bg-brand-blue text-white p-2 rounded-lg hover:bg-brand-gold hover:text-brand-blue transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Wholesale and Retail Explanation */}
      <section id="services" className="py-24 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green opacity-10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">سیستم فروش دوگانه ما</h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-brand-gold/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-gold/30">
                <Users className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4">فروش پرچون (برای خانواده‌ها)</h3>
              <p className="text-slate-300 leading-relaxed">
                مشتریان عزیز می‌توانند تمامی اجناس ضروری و روزمره منزل خود را به صورت دانه یا بسته‌بندی کوچک با مناسب‌ترین قیمت‌های بازار از فروشگاه ستاره شهر تهیه کنند. ما تضمین کیفیت و تازگی را به شما می‌دهیم.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 bg-brand-green/20 rounded-2xl flex items-center justify-center mb-6 border border-brand-green/30">
                <Truck className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-2xl font-bold mb-4">فروش عمده (برای دکانداران)</h3>
              <p className="text-slate-300 leading-relaxed">
                دکانداران محترم و مشتریان تجارتی می‌توانند سفارشات کلان خود را در کارتن‌ها و بسته‌بندی‌های کلان با نازل‌ترین قیمت‌های عمده‌فروشی ثبت نمایند. ما آماده همکاری دوامدار با سوپرمارکت‌ها و دکاکین هستیم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-brand-blue mb-4">چرا ستاره شهر را انتخاب کنید؟</h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'قیمت مناسب', icon: <Tag className="w-6 h-6" /> },
              { title: 'فروش عمده و پرچون', icon: <Store className="w-6 h-6" /> },
              { title: 'تنوع اجناس', icon: <Package className="w-6 h-6" /> },
              { title: 'خدمات مطمئن', icon: <CheckCircle className="w-6 h-6" /> },
              { title: 'مناسب برای خانواده‌ها و دکانداران', icon: <Users className="w-6 h-6" /> },
              { title: 'پاسخگویی سریع برای سفارشات', icon: <Phone className="w-6 h-6" /> },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-green/40 hover:shadow-lg transition-all group">
                <div className="bg-brand-blue text-brand-gold p-3 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{feature.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. About Us */}
      <section id="about" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-12 h-12 text-brand-gold mx-auto mb-6" />
          <h2 className="text-3xl font-black text-brand-blue mb-8">درباره فروشگاه ستاره شهر</h2>
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-brand-gold rounded-full"></div>
            <p className="text-lg md:text-xl text-slate-600 leading-loose mb-6 font-medium">
              فروشگاه ستاره شهر یک فروشگاه عمده و پرچون برای انواع اجناس ضروری و روزمره است. ما با هدف ارائه قیمت مناسب، کیفیت خوب و خدمات مطمئن فعالیت می‌کنیم.
            </p>
            <p className="text-lg md:text-xl text-slate-600 leading-loose font-medium">
              در فروشگاه ستاره شهر، مشتریان می‌توانند اجناس مورد نیاز خود را به شکل پرچون تهیه کنند و دکانداران یا مشتریان تجارتی می‌توانند سفارش‌های عمده خود را با قیمت مناسب ثبت کنند.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Contact Us */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-black text-brand-blue mb-4">تماس با ما</h2>
              <div className="w-24 h-1 bg-brand-gold mb-8 rounded-full"></div>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                برای سفارش، معلومات قیمت، خرید عمده یا همکاری تجارتی با ما تماس بگیرید.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-xl"><Phone className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">شماره تماس</p>
                    <p className="font-bold text-lg text-brand-blue" dir="ltr">+93 XX XXX XXXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-xl"><Mail className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">ایمیل آدرس</p>
                    <p className="font-bold text-lg text-brand-blue">info@setarehshahr.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-xl"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">آدرس فروشگاه</p>
                    <p className="font-bold text-lg text-brand-blue">کابل، افغانستان</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-blue mb-6">ارسال پیام</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نام شما</label>
                  <input type="text" className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all" placeholder="نام کامل..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">شماره تماس</label>
                  <input type="tel" className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all" placeholder="07XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">پیام شما</label>
                  <textarea rows={4} className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all" placeholder="متن پیام خود را بنویسید..."></textarea>
                </div>
                <button type="button" className="w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-brand-blue/30">
                  ارسال پیام
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 items-center text-center md:text-right">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="ستاره شهر" className="w-10 h-10 object-contain brightness-0 invert" />
              <span className="text-xl font-bold text-white">ستاره شهر</span>
            </div>
            <p className="text-sm max-w-xs">عمده و پرچون انواع اجناس مورد نیاز شما با بهترین کیفیت و قیمت مناسب.</p>
          </div>
          
          <div className="flex flex-col gap-2 font-medium">
            <a href="#categories" className="hover:text-brand-gold transition-colors">دسته‌بندی‌ها</a>
            <a href="#about" className="hover:text-brand-gold transition-colors">درباره ما</a>
            <a href="#services" className="hover:text-brand-gold transition-colors">خدمات</a>
          </div>
          
          <div className="text-sm md:text-left text-center">
            <p>&copy; {new Date().getFullYear()} فروشگاه ستاره شهر.</p>
            <p className="mt-1">تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
