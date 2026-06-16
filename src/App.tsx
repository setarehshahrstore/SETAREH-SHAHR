import React, { useState, useEffect } from 'react';
import { AppProvider, useAppState } from './AppContext';
import { Dashboard } from './components/Dashboard';
import { Storefront } from './components/Storefront';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Partners } from './components/Partners';
import { Finances } from './components/Finances';
import { Deliveries } from './components/Deliveries';
import { Settings as SettingsView } from './components/Settings';
import { Login } from './components/Login';
import { 
  Building2, 
  ShoppingCart, 
  Gamepad2, 
  BarChart4, 
  Package, 
  Wallet, 
  Truck, 
  Monitor, 
  Smartphone, 
  Grid,
  Info,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  AlertCircle
} from 'lucide-react';

function NavigationApp() {
  const { state } = useAppState();
  const [activeRole, setActiveRole] = useState<'Storefront' | 'Admin'>('Admin');
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'POS' | 'Inventory' | 'Partners' | 'Deliveries' | 'Finances' | 'Settings'>('Dashboard');
  const [deviceView, setDeviceView] = useState<'Desktop' | 'Android'>('Desktop');

  // Light / Dark Theme Mode State & Effect
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Alert Notifications System States
  const [showNotifications, setShowNotifications] = useState(false);
  const lowStockProducts = state.products.filter(p => p.stockInBaseUnits <= p.minStockInBaseUnits);

  const [currentUser, setCurrentUser] = useState<{ username: string; fullName: string; role: string } | null>(() => {
    const saved = localStorage.getItem('AFG_CURRENT_USER');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem('AFG_CURRENT_USER');
    setCurrentUser(null);
    alert('شما با موفقیت از سیستم اصلی حسابداری خارج شدید.');
  };

  // Read the active cashier name & store name dynamically from localStorage
  const storeName = localStorage.getItem('AFG_STORE_NAME') || 'فرشگاه ستاره شهر';
  const activeCashier = localStorage.getItem('AFG_STORE_CASHIER') || 'مدیر سیستم (ادمین)';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      
      {/* Universal Top Header Hub bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand logo details with loaded customizable store emblem */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="bg-slate-800 p-1 w-10 h-10 rounded-xl text-white shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-slate-705">
              {localStorage.getItem('AFG_STORE_LOGO') ? (
                <img 
                  src={localStorage.getItem('AFG_STORE_LOGO')!} 
                  alt="Store Logo" 
                  className="w-full h-full object-cover rounded"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building2 className="w-5.5 h-5.5 text-emerald-400" />
              )}
            </div>
            <div>
              <span className="font-extrabold text-sm uppercase tracking-widest text-emerald-400 block font-mono">{storeName}</span>
              <span className="text-xs text-slate-400 font-semibold block">سیستم جامع مدیریت تجارتی و ERP</span>
            </div>
          </div>

          {/* Center Role switch selector (Consumer portal vs staff panels) */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
               onClick={() => setActiveRole('Storefront')}
               className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                 activeRole === 'Storefront'
                   ? 'bg-emerald-600 text-white shadow-md'
                   : 'text-slate-400 hover:text-slate-200'
               }`}
            >
              <ShoppingCart className="w-4 h-4" />
              ویب‌سایت فروشگاه (مشتری)
            </button>
            <button
               onClick={() => setActiveRole('Admin')}
               className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                 activeRole === 'Admin'
                   ? 'bg-emerald-600 text-white shadow-md'
                   : 'text-slate-400 hover:text-slate-200'
               }`}
            >
              <Building2 className="w-4 h-4" />
              پنل مدیریت و حسابداری ERP
            </button>
          </div>

          {/* Right Session logout and simulated view selectors */}
          <div className="flex items-center gap-3 text-xs">
            
            {/* Low-Stock Alert Notification Dropdown */}
            {currentUser && activeRole === 'Admin' && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all shrink-0"
                  title="هشدارهای حد بحرانی گدام"
                >
                  <Bell className={`w-4 h-4 shrink-0 ${lowStockProducts.length > 0 ? 'text-rose-450 animate-bounce' : ''}`} />
                  {lowStockProducts.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-slate-900 shadow-md">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute left-0 mt-3 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl shadow-2xl z-55 p-3.5 text-right text-slate-800 dark:text-slate-100 animate-fade-in space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        هشدارهای حد آستانه گدام ({lowStockProducts.length})
                      </span>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      >
                        ✕ ببند
                      </button>
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">✅ موجودی تمام کالاها در حد مطلوب قرار دارد.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {lowStockProducts.map(p => (
                          <div key={p.id} className="p-2 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-805/40 rounded-lg text-xs flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-1.5 font-bold">
                              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{p.name}</span>
                              <span className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[9px] px-1.5 py-0.5 rounded">بحرانی</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              <span>موجودی: <strong className="text-red-650 font-extrabold">{p.stockInBaseUnits}</strong> {p.baseUnit}</span>
                              <span>حداقل آستانه: {p.minStockInBaseUnits}</span>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('Inventory');
                                setShowNotifications(false);
                              }}
                              className="mt-1 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded py-1 text-[9px] font-extrabold text-center transition-colors cursor-pointer"
                            >
                              ⚙️ انتقال به گدام و سفارش خرید کالا
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Global Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-all duration-150 relative shrink-0"
              title={theme === 'dark' ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </button>

            {currentUser && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-300 pr-2">همکار: <strong className="text-emerald-400">{currentUser.fullName}</strong></span>
                <button
                  onClick={handleLogout}
                  className="bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-900 rounded-lg px-2 py-1 text-[10.5px] font-black cursor-pointer"
                >
                  خروج 🔓
                </button>
              </div>
            )}

            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg gap-1 border border-slate-700">
              <button
                onClick={() => setDeviceView('Desktop')}
                className={`p-1.5 rounded-md transition-all ${
                  deviceView === 'Desktop' ? 'bg-slate-700 text-emerald-400 font-bold' : 'text-slate-400'
                }`}
                title="نمای کامپیوتر"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('Android')}
                className={`p-1.5 rounded-md transition-all ${
                  deviceView === 'Android' ? 'bg-slate-700 text-emerald-400 font-bold' : 'text-slate-400'
                }`}
                title="نمای موبایل اندروید"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-500 pr-1 select-none">شبیه‌ساز</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 home-transition">
        
        {/* Device simulation frame handler */}
        {deviceView === 'Android' ? (
          <div className="flex justify-center py-6">
            <div className="relative border-[12px] border-slate-900 rounded-[44px] w-(380px) h-(760px) overflow-hidden shadow-2xl bg-slate-50 flex flex-col justify-between">
              
              {/* Phone hardware Notch camera details */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-5 bg-slate-900 rounded-b-xl z-50 flex justify-center items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 block mr-1"></span>
                <span className="w-12 h-1 bg-slate-800 rounded-full block"></span>
              </div>

              {/* simulated phone content area with Auth check */}
              <div className="flex-1 overflow-y-auto pt-6 px-3 bg-slate-50 pb-20 text-right" dir="rtl">
                {activeRole === 'Storefront' ? (
                  <Storefront />
                ) : !currentUser ? (
                  <Login onLoginSuccess={(u) => setCurrentUser(u)} />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 overflow-x-auto select-none no-scrollbar border-b border-slate-200">
                      {[
                        { tab: 'Dashboard', icon: Grid, label: 'داشبورد' },
                        { tab: 'POS', icon: Gamepad2, label: 'صندوق POS' },
                        { tab: 'Inventory', icon: Package, label: 'موجودی گدام' },
                        { tab: 'Partners', icon: Wallet, label: 'حسابات دفتر' }
                      ].map(item => (
                        <button
                          key={item.tab}
                          onClick={() => setActiveTab(item.tab as any)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                            activeTab === item.tab ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {activeTab === 'Dashboard' && <Dashboard />}
                    {activeTab === 'POS' && <POS />}
                    {activeTab === 'Inventory' && <Inventory />}
                    {activeTab === 'Partners' && <Partners />}
                  </div>
                )}
              </div>

              {/* Phone home indicator button */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-900 rounded-full z-50"></div>
            </div>
          </div>
        ) : (
          /* Desktop default rendering with sidebar & local session guard gates */
          <div className="space-y-6">
            {activeRole === 'Admin' ? (
              !currentUser ? (
                <Login onLoginSuccess={(u) => setCurrentUser(u)} />
              ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start animate-fade-in">
                
                {/* Advanced spacious admin sidebar */}
                <aside className="w-full lg:w-76 shrink-0 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-6 font-semibold sticky top-24">
                  
                  {/* Sidebar Brand header and stats */}
                  <div className="space-y-3 pb-4 border-b border-slate-100 text-right">
                    <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">شعبه فعال:</div>
                    <div className="font-extrabold text-slate-805 text-base flex items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-750 p-2 rounded-lg">
                        <Building2 className="w-5 h-5" />
                      </span>
                      <span>{storeName}</span>
                    </div>
                    
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>صندوقدار فعال:</span>
                        <span className="text-slate-800 font-extrabold">👤 {activeCashier}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Navigation paths */}
                  <nav className="space-y-1">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">ماژول‌های تجارتی ERP:</span>
                    {[
                      { id: 'Dashboard', label: 'داشبورد نظارتی', icon: Grid },
                      { id: 'POS', label: 'صندوق فروش POS', icon: Gamepad2 },
                      { id: 'Inventory', label: 'گدام و لایه‌های بسته‌بندی کالا', icon: Package },
                      { id: 'Partners', label: 'حسابات بدهکاری دوار ارزی', icon: Wallet },
                      { id: 'Deliveries', label: 'ترانسپورت و لژیستیک ولایتی', icon: Truck },
                      { id: 'Finances', label: 'بیلان مالی و سود و زیان', icon: BarChart4 },
                      { id: 'Settings', label: 'تنظیمات و مدیریت سیستم', icon: SettingsIcon },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      const pendingOrdersCount = state.sales.filter(s => s.status === 'Pending Delivery' && s.deliveryStatus === 'Pending').length;
                      const showBadge = tab.id === 'Deliveries' && pendingOrdersCount > 0;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-md font-extrabold'
                              : 'text-slate-651 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                          </div>
                          {showBadge && (
                            <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">
                              {pendingOrdersCount} جدید
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10.5px] text-slate-400">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>آخرین همگام‌سازی محلی: زنده</span>
                  </div>

                </aside>

                {/* Sub-view router */}
                <div className="flex-grow w-full pb-16">
                  {activeTab === 'Dashboard' && <Dashboard />}
                  {activeTab === 'POS' && <POS />}
                  {activeTab === 'Inventory' && <Inventory />}
                  {activeTab === 'Partners' && <Partners />}
                  {activeTab === 'Deliveries' && <Deliveries />}
                  {activeTab === 'Finances' && <Finances />}
                  {activeTab === 'Settings' && <SettingsView />}
                </div>

              </div>
              )
            ) : (
              /* If Storefront role option is active, display static web portal */
              <div className="pb-16">
                <Storefront />
              </div>
            )}
          </div>
        )}
        
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationApp />
    </AppProvider>
  );
}
