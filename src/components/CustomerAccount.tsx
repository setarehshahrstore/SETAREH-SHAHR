import React, { useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useAppState } from '../AppContext';
import { LogOut, Package, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils';

export const CustomerAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useAppState();
  const navigate = useNavigate();

  const customer = useMemo(() => {
    return state.customers.find(c => c.name === user?.fullName); // A bit fragile, better to match by ID but Login just passes fullName
  }, [state.customers, user]);

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return state.sales.filter(s => s.customerId === customer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.sales, customer]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!customer) {
    return <div className="p-8 text-center" dir="rtl">در حال بارگذاری اطلاعات مشتری...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-[#0B1F3A] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-[#D4AF37] hover:text-white transition-colors">
            ستاره شهر
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-bold text-sm hidden sm:inline-block">سلام، {customer.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors text-sm font-bold">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">
                {customer.name.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-slate-800">{customer.name} {customer.lastName}</h2>
              <p className="text-sm text-slate-500 mb-6 font-mono mt-1" dir="ltr">{customer.phone}</p>
              
              <div className="text-right space-y-3 border-t border-slate-100 pt-6">
                <div className="flex gap-3 text-sm text-slate-600">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>{customer.city}، {customer.address || 'آدرس ثبت نشده'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4">وضعیت حساب شما</h3>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-rose-800 mb-1">بدهی فعلی (قرض)</p>
                <p className="text-2xl font-black font-mono text-rose-600">{formatCurrency(customer.debtAFN, 'AFN')}</p>
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-[#0B1F3A] flex items-center gap-2">
              <Package className="w-6 h-6 text-[#D4AF37]" /> تاریخچه سفارشات شما
            </h2>

            <div className="space-y-4">
              {customerOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center text-slate-500 font-bold">
                  شما هنوز سفارشی ثبت نکرده‌اید.
                </div>
              ) : (
                customerOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-slate-100 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 font-bold mb-1">شماره سفارش</p>
                        <h3 className="text-lg font-black font-mono tracking-wider text-slate-800">{order.invoiceNo}</h3>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-500 font-bold mb-1">تاریخ</p>
                        <p className="font-mono text-slate-800">{new Date(order.date).toLocaleDateString('fa-IR')}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        {order.status === 'Completed' || order.status === 'Delivered' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                         order.status === 'Cancelled' ? <XCircle className="w-5 h-5 text-rose-500" /> :
                         <Clock className="w-5 h-5 text-amber-500" />}
                        <span className={`font-bold ${
                          order.status === 'Completed' || order.status === 'Delivered' ? 'text-emerald-600' :
                          order.status === 'Cancelled' ? 'text-rose-600' :
                          order.status === 'Requires Customer Approval' ? 'text-rose-600' :
                          'text-amber-600'
                        }`}>
                          {order.status === 'Completed' || order.status === 'Delivered' ? 'تکمیل و ارسال شده' :
                           order.status === 'Cancelled' ? 'لغو شده' :
                           order.status === 'Requires Customer Approval' ? 'نیازمند بررسی شما (به بخش پیگیری مراجعه کنید)' :
                           'در انتظار پردازش'}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-2xl font-black font-mono text-[#0B1F3A]">{formatCurrency(order.finalAFN, 'AFN')}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">اقلام سفارش</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="font-bold text-slate-700">{item.productName} <span className="text-slate-400 font-normal">x{item.quantity}</span></span>
                            <span className="font-mono font-bold text-slate-600">{formatCurrency(item.totalAFN, 'AFN')}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.status === 'Requires Customer Approval' && (
                      <div className="mt-4 pt-4">
                         <Link to="/tracking" className="bg-amber-100 text-amber-800 px-6 py-2 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors inline-block">
                           بررسی و تایید اجناس جایگزین
                         </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
