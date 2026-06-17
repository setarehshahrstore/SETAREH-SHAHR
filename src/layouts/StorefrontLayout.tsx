import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronLeft, MapPin, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useAppState } from '../AppContext';
import { CustomerChat } from '../components/CustomerChat';

export const StorefrontLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, setIsCartOpen } = useAppState();

  const handleNav = (id: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/#' + id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-sans text-brand-darktext bg-brand-lightbg min-h-screen relative flex flex-col" dir="rtl">
      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isContactMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-2 flex flex-col w-48"
            >
              <a 
                href="tel:+93796626004" 
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-brand-navy font-bold border-b border-slate-100"
              >
                <Phone className="w-5 h-5 text-emerald-500" />
                تماس مستقیم
              </a>
              <a 
                href="https://wa.me/93796626004" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-brand-navy font-bold"
              >
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-[10px] font-bold">W</span>
                </div>
                واتساپ
              </a>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsContactMenuOpen(!isContactMenuOpen)}
          className="flex items-center gap-2 bg-brand-green text-white px-5 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(46,125,91,0.4)] hover:bg-emerald-700 transition-all group"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lightgold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
          </span>
          {isContactMenuOpen ? <X className="w-5 h-5" /> : <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
          تماس فوری
        </button>
      </div>

      {/* Header */}
      <header className="bg-brand-blue text-white sticky top-0 z-40 shadow-lg border-b border-brand-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border-2 border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.2)] overflow-hidden">
              <img src="/logo.png" alt="فروشگاه ستاره شهر" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-gold tracking-wide">ستاره شهر</h1>
              <p className="text-[10px] md:text-xs text-slate-300 font-light">عمده و پرچون</p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 font-medium">
            <button onClick={() => handleNav('categories')} className="hover:text-brand-gold transition-colors">دسته‌بندی‌ها</button>
            <button onClick={() => handleNav('products')} className="hover:text-brand-gold transition-colors">محصولات</button>
            <button onClick={() => handleNav('wholesale')} className="hover:text-brand-gold transition-colors">خرید عمده</button>
            <Link to="/tracking" className="hover:text-brand-gold transition-colors text-brand-lightgold font-bold">پیگیری سفارش</Link>
            <button onClick={() => handleNav('about')} className="hover:text-brand-gold transition-colors">درباره ما</button>
            <button onClick={() => handleNav('contact')} className="hover:text-brand-gold transition-colors">تماس با ما</button>
          </nav>

          <div className="flex items-center gap-4">
            {user && user.role !== 'Customer' ? (
              <Link to="/admin/dashboard" className="hidden sm:flex items-center gap-2 bg-brand-gold text-brand-blue px-6 py-2.5 rounded-xl font-bold hover:bg-brand-lightgold transition-all shadow-md hover:shadow-brand-gold/30 hover:-translate-y-0.5">
                پنل مدیریت
              </Link>
            ) : (
              <Link to="/account" className="hidden sm:flex items-center gap-2 bg-brand-gold text-brand-blue px-6 py-2.5 rounded-xl font-bold hover:bg-brand-lightgold transition-all shadow-md hover:shadow-brand-gold/30 hover:-translate-y-0.5">
                ورود
              </Link>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:text-brand-gold transition-colors bg-brand-navy rounded-xl hidden sm:block"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-brand-navy">
                  {cart.length}
                </span>
              )}
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
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                <img src="/logo.png" className="w-10 h-10 rounded-lg bg-white p-1" />
                <span className="font-bold text-brand-gold text-lg">ستاره شهر</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:text-brand-gold bg-brand-navy rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6 text-xl font-medium">
              <button onClick={() => handleNav('categories')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">دسته‌بندی‌ها</button>
              <button onClick={() => handleNav('products')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">محصولات</button>
              <button onClick={() => handleNav('wholesale')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">خرید عمده</button>
              <Link to="/tracking" onClick={() => setIsMobileMenuOpen(false)} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4 text-brand-lightgold font-bold">پیگیری سفارش</Link>
              <button onClick={() => handleNav('about')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">درباره ما</button>
              <button onClick={() => handleNav('contact')} className="text-right hover:text-brand-gold border-b border-brand-navy pb-4">تماس با ما</button>
              {user && user.role !== 'Customer' ? (
                <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-right text-brand-gold border-b border-brand-navy pb-4">پنل مدیریت</Link>
              ) : (
                <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-right text-brand-gold border-b border-brand-navy pb-4">حساب من / ورود</Link>
              )}
            </nav>
            
            <div className="mt-auto">
              <Link to="/account" className="w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-blue py-4 rounded-xl font-bold">
                سبد خرید و سفارشات
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy pt-20 pb-10 border-t-4 border-brand-gold relative overflow-hidden mt-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-blue blur-[120px] rounded-[100%] opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="lg:col-span-2" id="about">
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
                <li><button onClick={() => handleNav('categories')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> دسته‌بندی‌ها</button></li>
                <li><button onClick={() => handleNav('products')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> محصولات</button></li>
                <li><button onClick={() => handleNav('wholesale')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> خرید عمده</button></li>
                <li><button onClick={() => handleNav('about')} className="text-slate-300 hover:text-white transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4 text-brand-gold" /> درباره ما</button></li>
              </ul>
            </div>
            
            {/* Contact Column */}
            <div id="contact">
              <h4 className="text-brand-lightgold font-bold text-lg mb-6">ارتباط با ما</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                  <span>شهر مزار شریف مرکز</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                  <a href="tel:+93796626004" className="hover:text-white" dir="ltr">+93 796 626 004</a>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                  <a href="mailto:setarehshahrhelp@mail.com" className="hover:text-white">setarehshahrhelp@mail.com</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} فروشگاه ستاره شهر. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </footer>
      <CustomerChat />
    </div>
  );
};
