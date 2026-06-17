import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, Grid, ShoppingCart, Truck, ClipboardList, 
  Users, Building2, Warehouse, CreditCard, DollarSign, Receipt, 
  BarChart3, UserCog, Settings, Bell, Search, Plus, Menu, X, LogOut,
  Store, MessageCircle
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin/dashboard', name: 'صفحه اصلی', icon: LayoutDashboard, roles: ['Owner', 'Manager'] },
  { path: '/admin/products', name: 'محصولات', icon: Package, roles: ['Owner', 'Manager'] },
  { path: '/admin/categories', name: 'کتگوری‌ها', icon: Grid, roles: ['Owner', 'Manager'] },
  { path: '/admin/sales', name: 'فروش', icon: ShoppingCart, roles: ['Owner', 'Manager', 'Cashier'] },
  { path: '/admin/purchases', name: 'خرید', icon: Truck, roles: ['Owner', 'Manager'] },
  { path: '/admin/orders', name: 'سفارشات', icon: ClipboardList, roles: ['Owner', 'Manager', 'Cashier'] },
  { path: '/admin/partners', name: 'اشخاص (مشتریان و فروشندگان)', icon: Users, roles: ['Owner', 'Manager'] },
  { path: '/admin/inventory', name: 'گدام / موجودی', icon: Warehouse, roles: ['Owner', 'Manager', 'Warehouse Staff'] },
  { path: '/admin/debts', name: 'قرضه و پرداخت', icon: CreditCard, roles: ['Owner', 'Manager'] },
  { path: '/admin/expenses', name: 'مصارف', icon: Receipt, roles: ['Owner', 'Manager'] },
  { path: '/admin/reports', name: 'گزارشات', icon: BarChart3, roles: ['Owner', 'Manager'] },
  { path: '/admin/settings', name: 'تنظیمات', icon: Settings, roles: ['Owner', 'Manager'] },
  { path: '/admin/live-chat', name: 'پشتیبانی زنده', icon: MessageCircle, roles: ['Owner', 'Manager', 'Cashier', 'Warehouse Staff'] },
];

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { state } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();

  const totalUnreadChats = (state.chatSessions || []).reduce((sum, s) => sum + s.unreadByAdmin, 0);
  const [prevUnread, setPrevUnread] = useState(totalUnreadChats);

  React.useEffect(() => {
    if (totalUnreadChats > prevUnread) {
      // Play sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }
    setPrevUnread(totalUnreadChats);
  }, [totalUnreadChats, prevUnread]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentDate = new Intl.DateTimeFormat('fa-AF', { 
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' 
  }).format(new Date());

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B1F3A] text-white">
      <div className="p-4 flex items-center gap-3 border-b border-white/10 mb-4">
        <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h2 className="font-bold text-[#D4AF37] text-lg">ستاره شهر</h2>
          <span className="text-[10px] text-slate-400 block">سیستم مدیریت (ERP)</span>
        </div>
        {/* Close Button for Mobile */}
        <button className="lg:hidden mr-auto p-1 text-slate-400 hover:text-white" onClick={() => setIsMobileSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {MENU_ITEMS.filter(item => user?.role && item.roles.includes(user.role)).map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-white/10 text-[#D4AF37] border-r-4 border-[#D4AF37]' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                {item.name}
              </div>
              {item.path === '/admin/live-chat' && totalUnreadChats > 0 && (
                <span className="bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                  {totalUnreadChats}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#123B66] flex items-center justify-center">
              <UserCog className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-xs font-bold block">{user?.fullName || 'کارمند'}</span>
              <span className="text-[10px] text-slate-400 block">{user?.role || 'Admin'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans flex" dir="rtl">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed right-0 top-0 bottom-0 z-40 shadow-xl print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
          <aside className="w-64 h-full fixed right-0 top-0 shadow-xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:mr-64 flex flex-col min-h-screen print:m-0 print:p-0">
        
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 px-4 flex items-center justify-between print:hidden">
          
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-500 hover:text-[#0B1F3A]" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="hidden sm:block text-xs font-medium text-slate-500">{currentDate}</span>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input 
              type="text" 
              placeholder="جستجو در سیستم..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/sales" className="hidden sm:flex items-center gap-1.5 bg-[#0B1F3A] hover:bg-[#123B66] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
              <ShoppingCart className="w-4 h-4" />
              فروش جدید
            </Link>
            <Link to="/admin/inventory?add=true" className="hidden sm:flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8942E] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" />
              افزودن محصول
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-[#0B1F3A] transition-colors rounded-full hover:bg-slate-50"
              >
                <Bell className="w-5 h-5" />
                {totalUnreadChats > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">اعلان‌ها</h3>
                      {totalUnreadChats > 0 && (
                        <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-1 rounded-lg font-bold">
                          {totalUnreadChats} پیام جدید
                        </span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {totalUnreadChats > 0 ? (
                        <Link 
                          to="/admin/live-chat" 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="flex flex-col gap-1 p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                        >
                          <span className="text-sm font-bold text-slate-800">پیام جدید در پشتیبانی زنده</span>
                          <span className="text-xs text-slate-500">مشتری منتظر پاسخ شماست. برای مشاهده کلیک کنید.</span>
                        </Link>
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          هیچ اعلان جدیدی وجود ندارد
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link to="/" title="بازگشت به سایت عمومی" className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-50">
              <Store className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="p-4 sm:p-6 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
