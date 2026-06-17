import React, { useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useAppState } from '../AppContext';
import { LogOut, Package, MapPin, Clock, CheckCircle, XCircle, LayoutDashboard, CreditCard, UserCircle, Edit3, Save, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils';

export const CustomerAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const { state, editCustomer } = useAppState();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Orders' | 'Finances' | 'Profile'>('Overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '', address: '', city: '', password: '' });

  const customer = useMemo(() => {
    return state.customers.find(c => c.name === user?.fullName);
  }, [state.customers, user]);

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return state.sales.filter(s => s.customerId === customer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.sales, customer]);

  const customerPayments = useMemo(() => {
    if (!customer) return [];
    return state.payments.filter(p => p.partnerId === customer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.payments, customer]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    if (customer) {
      setProfileForm({ phone: customer.phone || '', address: customer.address || '', city: customer.city || '', password: '' });
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      editCustomer({
        ...customer,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        passwordHash: profileForm.password ? profileForm.password : customer.passwordHash
      });
      setIsEditingProfile(false);
      alert('اطلاعات با موفقیت بروزرسانی شد.');
    }
  };

  if (!customer) {
    return <div className="p-8 text-center" dir="rtl">در حال بارگذاری اطلاعات مشتری...</div>;
  }

  const tabs = [
    { id: 'Overview', label: 'داشبورد', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'Orders', label: 'سفارشات من', icon: <Package className="w-5 h-5" /> },
    { id: 'Finances', label: 'وضعیت مالی', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'Profile', label: 'پروفایل و تنظیمات', icon: <UserCircle className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0B1F3A] text-white shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between md:justify-center">
          <Link to="/" className="text-2xl font-black text-[#D4AF37] hover:text-white transition-colors">
            ستاره شهر
          </Link>
        </div>
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mb-3 text-[#D4AF37]">
            {customer.name.charAt(0)}
          </div>
          <h2 className="font-bold text-center">{customer.name}</h2>
          <span className="text-xs bg-[#D4AF37] text-[#0B1F3A] px-2 py-0.5 rounded-full mt-2 font-bold">پنل مشتری</span>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-[#D4AF37] text-[#0B1F3A]' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-4 py-3 rounded-xl transition-colors font-bold">
            <LogOut className="w-5 h-5" /> خروج از حساب
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0B1F3A]">{tabs.find(t => t.id === activeTab)?.label}</h1>
        </div>

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-500 mb-2">مجموع سفارشات</p>
              <p className="text-4xl font-black font-mono text-[#0B1F3A]">{customerOrders.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-500 mb-2">بدهی فعلی (قرض)</p>
              <p className="text-3xl font-black font-mono text-rose-600">{formatCurrency(customer.debtAFN, 'AFN')}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0B1F3A] to-[#123B66] p-6 rounded-3xl shadow-md text-white flex flex-col justify-center items-start">
              <h3 className="font-bold text-lg mb-2">نیاز به کمک دارید؟</h3>
              <p className="text-sm text-slate-300 mb-4">برای راهنمایی یا پیگیری، با پشتیبانی در ارتباط باشید.</p>
              <Link to="/tracking" className="bg-[#D4AF37] text-[#0B1F3A] px-4 py-2 rounded-lg font-bold text-sm w-full text-center hover:bg-yellow-500">
                پیگیری سفارشات
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'Orders' && (
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
        )}

        {activeTab === 'Finances' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">بدهی فعلی (قرض)</p>
                <p className="text-3xl font-black font-mono text-rose-600">{formatCurrency(customer.debtAFN, 'AFN')}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">تاریخچه پرداخت‌ها</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-100 text-slate-600 text-xs">
                    <tr>
                      <th className="px-4 py-3 font-bold">تاریخ</th>
                      <th className="px-4 py-3 font-bold">مبلغ پرداختی</th>
                      <th className="px-4 py-3 font-bold">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerPayments.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-bold">هیچ پرداختی ثبت نشده است.</td></tr>
                    ) : (
                      customerPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono">{new Date(payment.date).toLocaleDateString('fa-IR')}</td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600">{formatCurrency(payment.amountAFN, 'AFN')}</td>
                          <td className="px-4 py-3 text-slate-600">{payment.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-slate-800">مشخصات حساب</h3>
              {!isEditingProfile && (
                <button onClick={handleEditProfile} className="text-sm font-bold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-100">
                  <Edit3 className="w-4 h-4" /> ویرایش
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">شماره تماس</label>
                  <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">شهر</label>
                  <input type="text" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">آدرس کامل</label>
                  <textarea value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" rows={3}></textarea>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2"><Lock className="w-4 h-4" /> تغییر رمز عبور (اختیاری)</label>
                  <input type="password" placeholder="اگر می‌خواهید رمز عوض شود، اینجا بنویسید" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" dir="ltr" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="bg-[#0B1F3A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#123B66]">
                    <Save className="w-4 h-4" /> ذخیره تغییرات
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200">
                    انصراف
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                  <div className="text-sm font-bold text-slate-500">نام کامل</div>
                  <div className="col-span-2 font-bold text-slate-800">{customer.name} {customer.lastName}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                  <div className="text-sm font-bold text-slate-500">نام کاربری</div>
                  <div className="col-span-2 font-bold text-slate-800" dir="ltr">{customer.username || '---'}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4">
                  <div className="text-sm font-bold text-slate-500">شماره تماس</div>
                  <div className="col-span-2 font-mono text-slate-800" dir="ltr">{customer.phone}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 pb-4">
                  <div className="text-sm font-bold text-slate-500">موقعیت مکانی</div>
                  <div className="col-span-2 text-slate-800">
                    <MapPin className="w-4 h-4 inline-block ml-1 text-slate-400" />
                    {customer.city}، {customer.address || 'آدرس ثبت نشده'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
