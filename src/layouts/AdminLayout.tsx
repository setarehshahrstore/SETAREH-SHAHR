import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../AppContext';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, Grid, ShoppingCart, Truck, ClipboardList, 
  Users, Building2, Warehouse, CreditCard, DollarSign, Receipt, 
  BarChart3, UserCog, Settings, Bell, Search, Plus, Menu, X, LogOut,
  Store, MessageCircle, PhoneCall, Clock, Camera, QrCode, ShieldCheck
} from 'lucide-react';
import { AttendanceKioskModal } from '../components/AttendanceKioskModal';
import { ROLE_CONFIGS } from '../utils/permissions';

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
  { path: '/admin/finances', name: 'مالی و سرمایه (شیفت)', icon: DollarSign, roles: ['Owner', 'Manager'] },
  { path: '/admin/expenses', name: 'مصارف', icon: Receipt, roles: ['Owner', 'Manager'] },
  { path: '/admin/employees', name: 'منابع انسانی (HR)', icon: UserCog, roles: ['Owner'] },
  { path: '/admin/reports', name: 'گزارشات', icon: BarChart3, roles: ['Owner', 'Manager'] },
  { path: '/admin/settings', name: 'تنظیمات', icon: Settings, roles: ['Owner', 'Manager'] },
  { path: '/admin/live-chat', name: 'پشتیبانی زنده', icon: MessageCircle, roles: ['Owner', 'Manager', 'Cashier', 'Warehouse Staff'] },
  { path: '/admin/inquiries', name: 'درخواست‌های تماس', icon: PhoneCall, roles: ['Owner', 'Manager'] },
];

export const AdminLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { state } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [isKioskOpen, setIsKioskOpen] = useState(false);

  const DEFAULT_USERS_FALLBACK = [
    { username: 'admin@stc.com', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
    { username: 'admin', passwordHash: 'Admin$', fullName: 'مالک فروشگاه', role: 'Owner', status: 'Active', baseSalaryAFN: 0, payments: [], timeRecords: [] },
    { username: 'manager', passwordHash: 'manager', fullName: 'مدیر کل', role: 'Manager', status: 'Active', baseSalaryAFN: 25000, payments: [], timeRecords: [] },
    { username: 'cashier', passwordHash: 'cashier', fullName: 'صندوق‌دار', role: 'Cashier', status: 'Active', baseSalaryAFN: 15000, payments: [], timeRecords: [] },
    { username: 'warehouse', passwordHash: 'warehouse', fullName: 'مسئول گدام', role: 'Warehouse Staff', status: 'Active', baseSalaryAFN: 12000, payments: [], timeRecords: [] }
  ];

  const getSystemUsers = (): any[] => {
    const saved = localStorage.getItem('AFG_STORE_USERS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_USERS_FALLBACK;
  };

  useEffect(() => {
    if (user) {
      const usersList = getSystemUsers();
      const currentUser = usersList.find((u: any) => 
        u.username?.toLowerCase() === user.username?.toLowerCase() ||
        u.fullName?.toLowerCase() === user.fullName?.toLowerCase() ||
        u.fullName?.toLowerCase() === user.username?.toLowerCase()
      );
      if (currentUser && currentUser.timeRecords && currentUser.timeRecords.length > 0) {
        const lastRecord = currentUser.timeRecords[currentUser.timeRecords.length - 1];
        if (!lastRecord.clockOutTime) {
          setIsClockedIn(true);
          setClockInTime(lastRecord.clockInTime);
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
        }
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
      }
    }
  }, [user]);

  const handleToggleClock = () => {
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      return;
    }
    const usersList = getSystemUsers();
    let userIndex = usersList.findIndex((u: any) => 
      u.username?.toLowerCase() === user.username?.toLowerCase() ||
      u.fullName?.toLowerCase() === user.fullName?.toLowerCase() ||
      u.fullName?.toLowerCase() === user.username?.toLowerCase()
    );

    // If user object not found in list (e.g. newly created role), create or append entry
    if (userIndex === -1) {
      const newEmpEntry = {
        username: user.username,
        passwordHash: '123456',
        fullName: user.fullName || user.username,
        role: user.role,
        status: 'Active',
        baseSalaryAFN: 0,
        payments: [],
        timeRecords: []
      };
      usersList.push(newEmpEntry);
      userIndex = usersList.length - 1;
    }
    
    const now = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    
    if (isClockedIn) {
      // Clock out
      const timeRecords = usersList[userIndex].timeRecords || [];
      if (timeRecords.length > 0 && !timeRecords[timeRecords.length - 1].clockOutTime) {
        timeRecords[timeRecords.length - 1].clockOutTime = now;
      } else {
        timeRecords.push({
          id: `time-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          clockInTime: now,
          clockOutTime: now
        });
      }
      usersList[userIndex].timeRecords = timeRecords;
      setIsClockedIn(false);
      setClockInTime(null);
      alert(`پایان شیفت کاری و خروج شما در ساعت ${formattedTime} با موفقیت ثبت شد.`);
    } else {
      // Clock in
      const newRecord = {
        id: `time-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        clockInTime: now
      };
      if (!usersList[userIndex].timeRecords) {
        usersList[userIndex].timeRecords = [];
      }
      usersList[userIndex].timeRecords.push(newRecord);
      setIsClockedIn(true);
      setClockInTime(now);
      alert(`شروع شیفت کاری و ورود شما در ساعت ${formattedTime} با موفقیت ثبت شد.`);
    }
    
    localStorage.setItem('AFG_STORE_USERS', JSON.stringify(usersList));
  };

  const totalUnreadChats = (state.chatSessions || []).reduce((sum, s) => sum + s.unreadByAdmin, 0);
  const totalPendingInquiries = (state.inquiries || []).filter(i => i.status === 'Pending').length;
  const newOrdersCount = (state.sales || []).filter(s => s.status !== 'Completed' && s.status !== 'Delivered' && s.status !== 'Cancelled').length;

  const totalNotifications = totalUnreadChats + totalPendingInquiries + newOrdersCount;

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
              <span className="text-[10px] text-amber-400 font-medium block">
                {user?.role ? (ROLE_CONFIGS[user.role]?.titleFa || user.role) : 'ادمین'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors" title="خروج از حساب">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans flex print:block print:bg-white print:text-black" dir="rtl">
      
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
          
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-[#0B1F3A]" onClick={() => setIsMobileSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <span className="hidden sm:block text-xs font-medium text-slate-500">{currentDate}</span>

            {/* Prominent Role Position Badge */}
            {user?.role && ROLE_CONFIGS[user.role] && (
              <div 
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${ROLE_CONFIGS[user.role].badgeBg} ${ROLE_CONFIGS[user.role].badgeBorder} ${ROLE_CONFIGS[user.role].badgeText}`}
                title={ROLE_CONFIGS[user.role].description}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مقام: {ROLE_CONFIGS[user.role].titleFa}</span>
              </div>
            )}
          </div>

          <div className="flex-1 max-w-md mx-4 hidden md:block relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input 
              type="text" 
              placeholder="جستجو در سیستم..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Live Camera & QR Kiosk Punch Button */}
            <button
              onClick={() => setIsKioskOpen(true)}
              title="کیوسک هوشمند حضور و غیاب (دوربین، اسکن QR و چهره)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#0B1F3A] to-[#123B66] hover:from-[#123B66] hover:to-[#0B1F3A] text-white transition-all shadow-sm cursor-pointer border border-[#D4AF37]/30"
            >
              <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">کیوسک تردد</span>
            </button>

            {/* Clock In / Out Quick Action */}
            <button 
              onClick={handleToggleClock}
              title={isClockedIn ? 'پایان شیفت کاری' : 'شروع شیفت کاری'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                isClockedIn 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isClockedIn ? 'text-rose-600 animate-spin' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">
                {isClockedIn ? 'ثبت خروج (پایان کار)' : 'ثبت ورود (شروع کار)'}
              </span>
              <span className="sm:hidden">
                {isClockedIn ? 'خروج' : 'ورود'}
              </span>
              {isClockedIn && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-0.5"></span>
              )}
            </button>

            {/* Role-Based Quick Buttons */}
            {(user?.role === 'Owner' || user?.role === 'Manager' || user?.role === 'Cashier') && (
              <Link to="/admin/sales" className="hidden sm:flex items-center gap-1.5 bg-[#0B1F3A] hover:bg-[#123B66] text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                <ShoppingCart className="w-3.5 h-3.5" />
                فروش جدید
              </Link>
            )}

            {(user?.role === 'Owner' || user?.role === 'Manager' || user?.role === 'Warehouse Staff') && (
              <Link to="/admin/inventory?add=true" className="hidden sm:flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8942E] text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                <Plus className="w-3.5 h-3.5" />
                افزودن کالا
              </Link>
            )}

            {user?.role === 'Cashier' && (
              <Link to="/admin/orders" className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                <ClipboardList className="w-3.5 h-3.5" />
                سفارشات
              </Link>
            )}

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-[#0B1F3A] transition-colors rounded-full hover:bg-slate-50"
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
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
                      {totalNotifications > 0 && (
                        <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-1 rounded-lg font-bold">
                          {totalNotifications} مورد جدید
                        </span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {totalNotifications > 0 ? (
                        <>
                          {totalUnreadChats > 0 && (
                            <Link to="/admin/live-chat" onClick={() => setIsNotificationsOpen(false)} className="flex flex-col gap-1 p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                              <span className="text-sm font-bold text-slate-800">پیام جدید در پشتیبانی زنده ({totalUnreadChats})</span>
                              <span className="text-xs text-slate-500">مشتری منتظر پاسخ شماست.</span>
                            </Link>
                          )}
                          {totalPendingInquiries > 0 && (
                            <Link to="/admin/inquiries" onClick={() => setIsNotificationsOpen(false)} className="flex flex-col gap-1 p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                              <span className="text-sm font-bold text-slate-800">درخواست تماس جدید ({totalPendingInquiries})</span>
                              <span className="text-xs text-slate-500">مشتری منتظر تماس شماست.</span>
                            </Link>
                          )}
                          {newOrdersCount > 0 && (
                            <Link to="/admin/orders" onClick={() => setIsNotificationsOpen(false)} className="flex flex-col gap-1 p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                              <span className="text-sm font-bold text-slate-800">سفارش جدید ({newOrdersCount})</span>
                              <span className="text-xs text-slate-500">سفارشات جدید در انتظار بررسی هستند.</span>
                            </Link>
                          )}
                        </>
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
        <div className="p-4 sm:p-6 flex-1 overflow-x-hidden print:overflow-visible print:p-0">
          <Outlet />
        </div>
      </main>

      {/* Live Attendance Kiosk Modal */}
      <AttendanceKioskModal
        isOpen={isKioskOpen}
        onClose={() => setIsKioskOpen(false)}
        onAttendanceRecorded={() => {
          if (user) {
            const usersList = getSystemUsers();
            const currentUser = usersList.find((u: any) => 
              u.username?.toLowerCase() === user.username?.toLowerCase() ||
              u.fullName?.toLowerCase() === user.fullName?.toLowerCase() ||
              u.fullName?.toLowerCase() === user.username?.toLowerCase()
            );
            if (currentUser && currentUser.timeRecords && currentUser.timeRecords.length > 0) {
              const lastRecord = currentUser.timeRecords[currentUser.timeRecords.length - 1];
              if (!lastRecord.clockOutTime) {
                setIsClockedIn(true);
                setClockInTime(lastRecord.clockInTime);
              } else {
                setIsClockedIn(false);
                setClockInTime(null);
              }
            }
          }
        }}
      />

    </div>
  );
};
