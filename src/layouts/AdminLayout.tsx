import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, Package, Grid, ShoppingCart, Truck, ClipboardList, 
  Users, Building2, Warehouse, CreditCard, DollarSign, Receipt, 
  BarChart3, UserCog, Settings, Bell, Search, Plus, Menu, X, LogOut,
  Store
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin/dashboard', name: 'داشبورد', icon: LayoutDashboard },
  { path: '/admin/products', name: 'محصولات', icon: Package },
  { path: '/admin/categories', name: 'کتگوری‌ها', icon: Grid },
  { path: '/admin/sales', name: 'فروش', icon: ShoppingCart },
  { path: '/admin/purchases', name: 'خرید', icon: Truck },
  { path: '/admin/orders', name: 'سفارشات', icon: ClipboardList },
  { path: '/admin/customers', name: 'مشتریان', icon: Users },
  { path: '/admin/suppliers', name: 'فروشندگان', icon: Building2 },
  { path: '/admin/inventory', name: 'گدام / موجودی', icon: Warehouse },
  { path: '/admin/debts', name: 'قرض‌ها', icon: CreditCard },
  { path: '/admin/payments', name: 'پرداخت‌ها', icon: DollarSign },
  { path: '/admin/expenses', name: 'مصارف', icon: Receipt },
  { path: '/admin/reports', name: 'گزارشات', icon: BarChart3 },
  { path: '/admin/employees', name: 'کارمندان', icon: UserCog },
  { path: '/admin/settings', name: 'تنظیمات', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-white/10 text-[#D4AF37] border-r-4 border-[#D4AF37]' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
              {item.name}
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
      <aside className="hidden lg:block w-64 fixed right-0 top-0 bottom-0 z-40 shadow-xl">
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
      <main className="flex-1 lg:mr-64 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 px-4 flex items-center justify-between">
          
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
            <Link to="/admin/products" className="hidden sm:flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8942E] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" />
              افزودن محصول
            </Link>

            <button className="relative p-2 text-slate-400 hover:text-[#0B1F3A] transition-colors rounded-full hover:bg-slate-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
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
