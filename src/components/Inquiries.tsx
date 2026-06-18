import React, { useState, useMemo } from 'react';
import { useAppState } from '../AppContext';
import { PhoneCall, Check, X, Search, Trash2, Clock, CheckCircle } from 'lucide-react';
import { AdminPasswordPrompt } from './AdminPasswordPrompt';

export const Inquiries: React.FC = () => {
  const { state, editInquiry, deleteInquiry } = useAppState();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [adminPrompt, setAdminPrompt] = useState<{isOpen: boolean; action: () => void; title: string}>({
    isOpen: false, action: () => {}, title: ''
  });

  const inquiries = state.inquiries || [];

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => 
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inq.phone.includes(searchQuery)
    ).sort((a, b) => {
      // Pending first, then by date
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [inquiries, searchQuery]);

  const requireAdminPin = (title: string, action: () => void) => {
    setAdminPrompt({ isOpen: true, title, action });
  };

  const handleUpdateStatus = (id: string, newStatus: 'Pending' | 'Contacted' | 'Closed') => {
    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      editInquiry({ ...inq, status: newStatus });
    }
  };

  const handleDelete = (id: string) => {
    requireAdminPin('حذف درخواست تماس', () => {
      deleteInquiry(id);
    });
  };

  return (
    <div className="space-y-6 font-sans print:m-0 print:p-0" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black text-[#0B1F3A] tracking-tight">درخواست‌های تماس</h1>
          <p className="text-xs text-slate-500 mt-1">مدیریت و پیگیری فرم‌های تماس مشتریان</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm border border-amber-100">
          <PhoneCall className="w-5 h-5" /> 
          {inquiries.filter(i => i.status === 'Pending').length} درخواست در انتظار
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 print:hidden">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نام یا شماره تلفن مشتری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#0B1F3A] text-white text-xs uppercase print:bg-slate-100 print:text-black">
              <tr>
                <th className="px-4 py-4 rounded-tr-2xl print:rounded-none">تاریخ</th>
                <th className="px-4 py-4">نام مشتری</th>
                <th className="px-4 py-4">شماره تماس</th>
                <th className="px-4 py-4">پیام / درخواست</th>
                <th className="px-4 py-4">وضعیت</th>
                <th className="px-4 py-4 text-center rounded-tl-2xl print:hidden">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {new Date(inq.date).toLocaleDateString('fa-IR')} <br/>
                    <span className="text-[10px] text-slate-400">{new Date(inq.date).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">{inq.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 font-bold" dir="ltr">{inq.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
                      inq.status === 'Pending' ? 'bg-amber-100 text-amber-700 print:border print:border-amber-300' :
                      inq.status === 'Contacted' ? 'bg-blue-100 text-blue-700 print:border print:border-blue-300' :
                      'bg-slate-100 text-slate-600 print:border print:border-slate-300'
                    }`}>
                      {inq.status === 'Pending' && <Clock className="w-3 h-3" />}
                      {inq.status === 'Contacted' && <CheckCircle className="w-3 h-3" />}
                      {inq.status === 'Closed' && <X className="w-3 h-3" />}
                      
                      {inq.status === 'Pending' ? 'در انتظار تماس' : 
                       inq.status === 'Contacted' ? 'تماس گرفته شد' : 'بسته شده'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center print:hidden flex items-center justify-center gap-2">
                    {inq.status === 'Pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(inq.id, 'Contacted')}
                        className="bg-blue-50 text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-100 text-xs font-bold"
                        title="تغییر وضعیت به تماس گرفته شد"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {inq.status !== 'Closed' && (
                      <button 
                        onClick={() => handleUpdateStatus(inq.id, 'Closed')}
                        className="bg-slate-50 text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-bold"
                        title="بستن درخواست"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(inq.id)}
                      className="bg-rose-50 text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-100 text-xs font-bold"
                      title="حذف پیام"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                    هیچ درخواست تماسی یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPasswordPrompt 
        isOpen={adminPrompt.isOpen} 
        onClose={() => setAdminPrompt({ ...adminPrompt, isOpen: false })} 
        onSuccess={() => {
          adminPrompt.action();
          setAdminPrompt({ ...adminPrompt, isOpen: false });
        }}
        title={adminPrompt.title}
      />
    </div>
  );
};
