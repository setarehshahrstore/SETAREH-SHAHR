import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { formatCurrency } from '../utils';
import { getAfgGeography, saveCustomProvince, saveCustomDistrict } from '../geography';
import { SecurityGateModal } from './SecurityGate';
import { 
  Users, 
  Truck, 
  Plus, 
  CheckSquare, 
  DollarSign, 
  ArrowDownLeft, 
  ShieldAlert, 
  FileText, 
  Search, 
  MapPin, 
  Edit, 
  Trash2, 
  Globe 
} from 'lucide-react';
import { Customer, Supplier, DebtPayment, CustomerInquiry } from '../types';

export const Partners: React.FC = () => {
  const { 
    state, 
    addCustomer, 
    editCustomer, 
    deleteCustomer, 
    deleteCustomers,
    addSupplier, 
    editSupplier, 
    deleteSupplier, 
    deleteSuppliers,
    addPayment,
    editInquiry,
    deleteInquiry,
    deleteInquiries
  } = useAppState();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<'Customers' | 'Suppliers' | 'Inquiries'>('Customers');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  // Search input for quick lookup
  const [partnerSearch, setPartnerSearch] = useState('');

  // Partner creation states
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('5000');

  // Interactive Afghanistan Geography select states
  const [afgGeo, setAfgGeo] = useState(() => getAfgGeography());
  const [selectedProvince, setSelectedProvince] = useState('کابل');
  const [selectedDistrict, setSelectedDistrict] = useState('کابل (مرکز)');
  
  // Custom geography adders state
  const [customProvinceInput, setCustomProvinceInput] = useState('');
  const [showCustomProvForm, setShowCustomProvForm] = useState(false);
  
  const [customDistrictInput, setCustomDistrictInput] = useState('');
  const [showCustomDistForm, setShowCustomDistForm] = useState(false);

  // Editing partner states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingInquiry, setEditingInquiry] = useState<CustomerInquiry | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState<CustomerInquiry | null>(null);

  // Debt payment state
  const [isPayingDebt, setIsPayingDebt] = useState(false);
  const [payAmountUSD, setPayAmountUSD] = useState('');
  const [payAmountAFN, setPayAmountAFN] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Manual debt increase state (customer/supplier taking custom credit)
  const [isAddingManualDebt, setIsAddingManualDebt] = useState(false);
  const [debtAmountUSD, setDebtAmountUSD] = useState('');
  const [debtAmountAFN, setDebtAmountAFN] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Security gate states
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<{ id: string, name: string } | null>(null);

  // Handle province click
  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const districts = afgGeo[prov] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    } else {
      setSelectedDistrict('مرکز');
    }
  };

  // Add custom Province
  const handleAddProvinceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProvinceInput.trim()) return;

    const prName = customProvinceInput.trim();
    saveCustomProvince(prName);
    
    // Reload geography state
    const updatedGeo = getAfgGeography();
    setAfgGeo(updatedGeo);

    setSelectedProvince(prName);
    setSelectedDistrict('مرکز اصلی ولایت');

    setCustomProvinceInput('');
    setShowCustomProvForm(false);
    alert(`ولایت جدید تجاری [ ${prName} ] با موفقیت در لایه‌ها راجستر شد.`);
  };

  // Add custom District
  const handleAddDistrictSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDistrictInput.trim()) return;

    const distName = customDistrictInput.trim();
    saveCustomDistrict(selectedProvince, distName);

    // Reload geography state
    const updatedGeo = getAfgGeography();
    setAfgGeo(updatedGeo);
    setSelectedDistrict(distName);

    setCustomDistrictInput('');
    setShowCustomDistForm(false);
    alert(`ولسوالی یا گذر جدید [ ${distName} ] به ولایت ${selectedProvince} ضمیمه گردید.`);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    // Concat province and district
    const destinationAddress = `${selectedProvince} - ${selectedDistrict}`;

    if (activeTab === 'Customers') {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: newName,
        companyName: newCompany || undefined,
        phone: newPhone,
        city: destinationAddress,
        email: newEmail || undefined,
        debtUSD: 0,
        debtAFN: 0,
        creditLimitUSD: parseFloat(newCreditLimit) || 3000
      };
      addCustomer(newCust);
    } else {
      const newSupp: Supplier = {
        id: `supp-${Date.now()}`,
        name: newName,
        companyName: newCompany,
        phone: newPhone,
        city: destinationAddress,
        debtUSD: 0,
        debtAFN: 0
      };
      addSupplier(newSupp);
    }

    setIsAddingPartner(false);
    setNewName('');
    setNewCompany('');
    setNewPhone('');
    setNewEmail('');
    alert('اطلاعات همکار مکتوب موازنه با موفقیت درج و در بیلان توازن شد.');
  };

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    const parsedUSD = parseFloat(payAmountUSD) || 0;
    const parsedAFN = parseFloat(payAmountAFN) || 0;

    let partnerName = '';
    if (activeTab === 'Customers') {
      const customer = state.customers.find(c => c.id === selectedPartnerId);
      partnerName = customer ? customer.name : 'Customer';
    } else {
      const supplier = state.suppliers.find(s => s.id === selectedPartnerId);
      partnerName = supplier ? supplier.name : 'Supplier';
    }

    const newPay: DebtPayment = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      partnerId: selectedPartnerId,
      partnerType: activeTab === 'Customers' ? 'Customer' : 'Supplier',
      partnerName,
      amountUSD: parsedUSD,
      amountAFN: parsedAFN,
      exchangeRate: state.exchangeRate,
      notes: payNotes || 'موازنه حساب و تصفیه با سند رسمی دفتر'
    };

    addPayment(newPay);
    setIsPayingDebt(false);
    setPayAmountUSD('');
    setPayAmountAFN('');
    setPayNotes('');
    alert("تراکنش تصفیه بدهکاری با موفقیت در سیستم ثبت گردید و بیلان صندوقداران توازن شد.");
  };

  const handleEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      editCustomer(editingCustomer);
      setEditingCustomer(null);
      alert('اصلاحات دوسیه مشتری با موفقیت ذخیره گردید.');
    }
  };

  const handleEditSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      editSupplier(editingSupplier);
      setEditingSupplier(null);
      alert('اصلاحات دوسیه تامین‌کننده سوداگر با موفقیت ثبت گردید.');
    }
  };

  const handleDeletePartnerClick = (id: string, name: string) => {
    setPartnerToDelete({ id, name });
    setSecurityModalOpen(true);
  };

  const confirmDeletePartner = () => {
    if (isBulkDeleting && selectedIds.length > 0) {
      if (activeTab === 'Customers') {
        deleteCustomers(selectedIds);
      } else if (activeTab === 'Suppliers') {
        deleteSuppliers(selectedIds);
      } else if (activeTab === 'Inquiries') {
        deleteInquiries(selectedIds);
      }
      setSecurityModalOpen(false);
      setSelectedIds([]);
      setIsBulkDeleting(false);
      alert(`${selectedIds.length} مورد با موفقیت حذف گردیدند.`);
    } else if (partnerToDelete) {
      if (activeTab === 'Customers') {
        deleteCustomer(partnerToDelete.id);
      } else {
        deleteSupplier(partnerToDelete.id);
      }
      setSecurityModalOpen(false);
      setPartnerToDelete(null);
      setSelectedPartnerId(null);
      alert('حساب همکار با موفقیت و پس از تایید رمز عبور ادمین حذف گردید.');
    }
  };

  const handleRecordManualDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;

    const parsedUSD = parseFloat(debtAmountUSD) || 0;
    const parsedAFN = parseFloat(debtAmountAFN) || 0;

    if (parsedUSD <= 0 && parsedAFN <= 0) {
      alert('لطفاً مبلغ معتبری راجستر کنید.');
      return;
    }

    if (activeTab === 'Customers') {
      const customer = state.customers.find(c => c.id === selectedPartnerId);
      if (customer) {
        // Direct addition to debt
        const updatedCustomer = {
          ...customer,
          debtUSD: customer.debtUSD + parsedUSD,
          debtAFN: customer.debtAFN + parsedAFN
        };
        editCustomer(updatedCustomer);

        // Record repayment with negative value to signify debt increase
        const newPay: DebtPayment = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString(),
          partnerId: selectedPartnerId,
          partnerType: 'Customer',
          partnerName: customer.name,
          amountUSD: -parsedUSD,
          amountAFN: -parsedAFN,
          exchangeRate: state.exchangeRate,
          notes: debtNotes || 'ثبت دستی افزایش بدهی و قرضه مشتری'
        };
        addPayment(newPay);
      }
    } else {
      const supplier = state.suppliers.find(s => s.id === selectedPartnerId);
      if (supplier) {
        const updatedSupplier = {
          ...supplier,
          debtUSD: supplier.debtUSD + parsedUSD,
          debtAFN: supplier.debtAFN + parsedAFN
        };
        editSupplier(updatedSupplier);

        const newPay: DebtPayment = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString(),
          partnerId: selectedPartnerId,
          partnerType: 'Supplier',
          partnerName: supplier.name,
          amountUSD: -parsedUSD,
          amountAFN: -parsedAFN,
          exchangeRate: state.exchangeRate,
          notes: debtNotes || 'ثبت دستی افزایش طلبکاری همکار'
        };
        addPayment(newPay);
      }
    }

    setIsAddingManualDebt(false);
    setDebtAmountUSD('');
    setDebtAmountAFN('');
    setDebtNotes('');
    alert('اقلام بدهکاری جدید در حساب با موفقیت ثبت و مانده موازنه تغییر یافت.');
  };

  const q = partnerSearch.toLowerCase().trim();

  // Multi-criteria filter search lists
  const filteredCustomers = state.customers.filter(c => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const filteredSuppliers = state.suppliers.filter(s => {
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.companyName && s.companyName.toLowerCase().includes(q)) ||
      s.phone.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const activePartnerDetails = activeTab === 'Customers'
    ? state.customers.find(c => c.id === selectedPartnerId)
    : state.suppliers.find(s => s.id === selectedPartnerId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
      
      {/* Directory Tab Listings (Left Side - 2 Cols) */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-105 shadow-sm space-y-4">
        
        {/* Toggle Partners Tabs & Advanced Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-slate-100">
          <div className="bg-slate-100 p-1 rounded-lg flex shrink-0">
            <button
              onClick={() => {
                setActiveTab('Customers');
                setSelectedPartnerId(null);
                setSelectedIds([]);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'Customers'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              حساب مشتریان (مطالبات)
            </button>
            <button
              onClick={() => {
                setActiveTab('Suppliers');
                setSelectedPartnerId(null);
                setSelectedIds([]);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'Suppliers'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              تامین‌کنندگان (دیون)
            </button>
            <button
              onClick={() => {
                setActiveTab('Inquiries');
                setSelectedPartnerId(null);
                setSelectedIds([]);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'Inquiries'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              درخواست‌های تماس ({state.inquiries?.length || 0})
            </button>
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-450 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجو همکار (نام، تیلفون، ولایت)..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full text-xs pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  setIsBulkDeleting(true);
                  setSecurityModalOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                حذف انتخاب شده‌ها ({selectedIds.length})
              </button>
            )}

            {activeTab !== 'Inquiries' && (
              <button
                onClick={() => setIsAddingPartner(!isAddingPartner)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                همکار نو
              </button>
            )}
          </div>
        </div>

        {/* Add Partner Form Overlay */}
        {isAddingPartner && (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs space-y-4 text-right">
            <h4 className="font-extrabold text-slate-800 uppercase flex items-center gap-1.5 text-xs pb-2 border-b border-slate-200">
              <Plus className="text-emerald-600 w-5 h-5" />
              ثبت مشخصات {activeTab === 'Customers' ? 'مشتری بدهکار جدید' : 'تامین‌کننده/سوداگر جدید'}
            </h4>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">نام کامل همکار:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: حاجی حبیب‌الله قندهار"
                    className="w-full bg-white border border-slate-350 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">صنف تجارتی / کمپنی همکار:</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="مثال: شرکت برنج لعل مزار"
                    className="w-full bg-white border border-slate-355 p-2 rounded-lg"
                  />
                </div>
              </div>

              {/* Afghanistan Geography dynamic cascading module dropdowns */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="block text-[10px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  زون‌بندی و موقعیت منطقه‌ای تجارتی مشتری (ولایات ۳۴ گانه افغانستان):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-semibold text-slate-400">انتخاب ولایت:</label>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomProvForm(!showCustomProvForm)} 
                        className="text-[9.5px] text-emerald-600 font-extrabold hover:underline"
                      >
                        ➕ درج ولایت جدید
                      </button>
                    </div>

                    {showCustomProvForm ? (
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          placeholder="نام ولایت جدید..."
                          value={customProvinceInput}
                          onChange={(e) => setCustomProvinceInput(e.target.value)}
                          className="flex-1 border p-1 rounded text-xs text-right"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddProvinceSubmit}
                          className="bg-emerald-600 text-white rounded p-1 text-[11px] font-bold"
                        >
                          ایجاد
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedProvince}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 rounded-md focus:outline-hidden"
                      >
                        {Object.keys(afgGeo).map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-semibold text-slate-400">ولسوالی / گذر:</label>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomDistForm(!showCustomDistForm)} 
                        className="text-[9.5px] text-emerald-600 font-extrabold hover:underline"
                      >
                        ➕ درج ولسوالی جدید
                      </button>
                    </div>

                    {showCustomDistForm ? (
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          placeholder="نام ولسوالی جدید..."
                          value={customDistrictInput}
                          onChange={(e) => setCustomDistrictInput(e.target.value)}
                          className="flex-1 border p-1 rounded text-xs text-right"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddDistrictSubmit}
                          className="bg-emerald-600 text-white rounded p-1 text-[11px] font-bold"
                        >
                          ثبت
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 p-1.5 rounded-md focus:outline-hidden"
                      >
                        {(afgGeo[selectedProvince] || []).map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">نمبر موبایل فعال:</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="مثال: 0799123456"
                    className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-hidden text-mono text-left"
                  />
                </div>

                {activeTab === 'Customers' ? (
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">سقف مجاز قرضه به دالر ($):</label>
                    <input
                      type="number"
                      value={newCreditLimit}
                      onChange={(e) => setNewCreditLimit(e.target.value)}
                      className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-hidden font-mono text-left"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-1">ایمیل آدرس (اختیاری):</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. supplier@domain.af"
                      className="w-full bg-white border border-slate-300 p-1.5 rounded focus:outline-hidden text-left"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingPartner(false)}
                  className="bg-slate-200 hover:bg-slate-300 px-4 py-1.5 rounded-lg cursor-pointer"
                >
                  انصراف
                </button>
                <button type="submit" className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-1.5 rounded-lg cursor-pointer">
                  ثبت نهایی حساب دفتری
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Dynamic Partner Directory Spreadsheets Grid */}
        <div className="border border-slate-100 rounded-xl overflow-x-auto">
          <table className="min-w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 text-right w-10">
                  <input 
                    type="checkbox"
                    checked={
                      (activeTab === 'Customers' && filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length) ||
                      (activeTab === 'Suppliers' && filteredSuppliers.length > 0 && selectedIds.length === filteredSuppliers.length) ||
                      (activeTab === 'Inquiries' && (state.inquiries || []).length > 0 && selectedIds.length === (state.inquiries || []).length)
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (activeTab === 'Customers') setSelectedIds(filteredCustomers.map(c => c.id));
                        else if (activeTab === 'Suppliers') setSelectedIds(filteredSuppliers.map(s => s.id));
                        else if (activeTab === 'Inquiries') setSelectedIds((state.inquiries || []).map(i => i.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="p-3 text-right">جزییات همکار دفتری</th>
                <th className="p-3 text-right">شرکت/مارک</th>
                <th className="p-3 text-right">ولایت موطن</th>
                <th className="p-3 text-right">تیلفون تماس</th>
                <th className="p-3 text-left">طلب/بدهی (افغانی)</th>
                <th className="p-3 text-left">طلب/بدهی (دالر)</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {activeTab === 'Customers' ? (
                filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-extrabold">مشتری با این مشخصات یافت نشد.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedPartnerId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedPartnerId === c.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, c.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== c.id));
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="p-3 text-right animate-fade-in">
                        <span className="font-extrabold text-slate-800 text-sm block">{c.name}</span>
                        <span className="text-[10px] text-slate-404">آی‌دی مشتری: {c.id.slice(0, 8)}</span>
                      </td>
                      <td className="p-3 text-right text-slate-600">{c.companyName || 'سوداگر تجارتی स्वतंत्र'}</td>
                      <td className="p-3 text-right text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.city}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">{c.phone}</td>
                      <td className="p-3 text-left text-rose-600 font-bold font-mono">{formatCurrency(c.debtAFN, 'AFN')}</td>
                      <td className="p-3 text-left text-rose-600 font-bold font-mono">{formatCurrency(c.debtUSD, 'USD')}</td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingCustomer(c)}
                            className="p-1 text-slate-500 hover:text-emerald-600 bg-slate-50 rounded"
                            title="اصلاح دوسیه"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePartnerClick(c.id, c.name)}
                            className="p-1 text-slate-500 hover:text-rose-600 bg-slate-50 rounded"
                            title="حذف همکار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : activeTab === 'Suppliers' ? (
                filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-extrabold">تامین‌کننده‌ای با این مشخصات یافت نشد.</td>
                  </tr>
                ) : (
                  filteredSuppliers.map(s => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedPartnerId(s.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedPartnerId === s.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, s.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== s.id));
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="p-3 text-right animate-fade-in">
                        <span className="font-extrabold text-slate-800 text-sm block">{s.name}</span>
                        <span className="text-[10px] text-slate-404">سوداگر گدام</span>
                      </td>
                      <td className="p-3 text-right text-slate-600">{s.companyName}</td>
                      <td className="p-3 text-right text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {s.city}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">{s.phone}</td>
                      <td className="p-3 text-left text-amber-600 font-bold font-mono">{formatCurrency(s.debtAFN, 'AFN')}</td>
                      <td className="p-3 text-left text-amber-600 font-bold font-mono">{formatCurrency(s.debtUSD, 'USD')}</td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingSupplier(s)}
                            className="p-1 text-slate-500 hover:text-emerald-600 bg-slate-50 rounded"
                            title="اصلاح دوسیه"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePartnerClick(s.id, s.name)}
                            className="p-1 text-slate-500 hover:text-rose-600 bg-slate-50 rounded"
                            title="حذف همکار"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                !(state.inquiries && state.inquiries.length > 0) ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-extrabold">⚠️ هیچ درخواست تماسی در حال حاضر در سیستم ثبت نشده است.</td>
                  </tr>
                ) : (
                  (state.inquiries || []).map(inq => (
                    <tr
                      key={inq.id}
                      className="hover:bg-amber-50/20 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3">
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(inq.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, inq.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== inq.id));
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">{inq.name}</span>
                        <span className="text-[10px] text-slate-400">شناسه درخواست: {inq.id.slice(-6)}</span>
                      </td>
                      <td className="p-3 text-right text-slate-600 dark:text-slate-300 max-w-xs truncate" title={inq.message}>{inq.message}</td>
                      <td className="p-3 text-right text-slate-500">سایت دیجیتال</td>
                      <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-200 font-bold">{inq.phone}</td>
                      <td className="p-3 text-left text-[10px]">
                        {inq.status === 'Answered' ? (
                          <span className="text-emerald-600 font-extrabold">✓ بررسی شده</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold">در انتظار بررسی</span>
                        )}
                      </td>
                      <td className="p-3 text-left text-slate-500 font-mono text-[10px]">
                        {new Date(inq.date).toLocaleDateString('fa-AF', { hour: '2-digit', minute: '2-digit' } as any)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-md py-1 px-2 text-[10px] font-bold"
                          >
                            💬 واتساپ
                          </a>
                          
                          {inq.status !== 'Answered' && (
                            <button
                              onClick={() => {
                                editInquiry({ ...inq, status: 'Answered' });
                              }}
                              className="bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-md py-1 px-2 text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              تایید تماس✓
                            </button>
                          )}

                          <button
                            onClick={() => setEditingInquiry(inq)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-750 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-lg cursor-pointer transition-colors"
                            title="ویرایش درخواست"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeletingInquiry(inq);
                            }}
                            className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900 rounded-lg cursor-pointer transition-colors"
                            title="حذف تماس"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Selected Partner Details & Audit Panel (Right Column - 1 Col) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between text-right">
        {activePartnerDetails ? (
          <div className="space-y-4 text-right w-full">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {activeTab === 'Customers' ? 'دوسیه دفتری مشتری' : 'لجر حسابی سوداگر'}
              </span>
              <h3 className="font-extrabold text-slate-805 text-base">{activePartnerDetails.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">{activePartnerDetails.companyName || 'حساب مستقل پرچون'}</p>
            </div>

            <div className="space-y-3.5">
              
              {/* Total Debt status Card */}
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 font-mono">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase block text-right">خلاصه موازنه طلبکاری/دیوان جاری</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">مجموعه افغانی:</span>
                  <span className="text-md font-extrabold text-rose-450">{formatCurrency(activePartnerDetails.debtAFN, 'AFN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">مجموعه دالر:</span>
                  <span className="text-md font-extrabold text-rose-450">${activePartnerDetails.debtUSD.toFixed(2)}</span>
                </div>
              </div>

              {/* Debt paydown forms input */}
              {isPayingDebt ? (
                <form onSubmit={handleRecordRepayment} className="bg-slate-50 p-4 rounded-xl border border-slate-205 text-xs space-y-3 text-right animate-fade-in">
                  <span className="font-bold text-[10.5px] uppercase text-emerald-800 block">ثبت حواله رسید پولی و تصفیه لجر (آمیختن پول به حساب)</span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-505 font-bold mb-1">وصولی دالر (USD):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payAmountUSD}
                        onChange={(e) => setPayAmountUSD(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-505 font-bold mb-1">وصولی افغانی (؋):</label>
                      <input
                        type="number"
                        min="0"
                        value={payAmountAFN}
                        onChange={(e) => setPayAmountAFN(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-505 font-bold mb-1">شرح بابت حواله مکتوب:</label>
                    <input
                      type="text"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      placeholder="مثال: تسویه قسمتی از بدهکاری کابل"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPayingDebt(false)}
                      className="bg-slate-200 px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-1 rounded text-[11px] font-bold cursor-pointer hover:bg-emerald-700">
                      ثبت تصفیه لجر
                    </button>
                  </div>
                </form>
              ) : isAddingManualDebt ? (
                <form onSubmit={handleRecordManualDebt} className="bg-slate-50 p-4 rounded-xl border border-slate-205 text-xs space-y-3 text-right animate-fade-in">
                  <span className="font-bold text-[10.5px] uppercase text-rose-700 block">ثبت سند بدهکاری جدید (بردن جنس به قرض)</span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-505 font-bold mb-1">بدهی جدید دالر (USD):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01;0.1"
                        value={debtAmountUSD}
                        onChange={(e) => setDebtAmountUSD(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-505 font-bold mb-1">بدهی جدید افغانی (؋):</label>
                      <input
                        type="number"
                        min="0"
                        value={debtAmountAFN}
                        onChange={(e) => setDebtAmountAFN(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono text-left focus:outline-hidden text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-505 font-bold mb-1">توضیحات و اقلام (شرح بابت):</label>
                    <input
                      type="text"
                      value={debtNotes}
                      onChange={(e) => setDebtNotes(e.target.value)}
                      placeholder="مثال: خرید ۳ کارتن صابون حمام به صورت نسیه"
                      className="w-full bg-white border border-slate-300 rounded p-1.5 focus:outline-hidden text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingManualDebt(false)}
                      className="bg-slate-200 px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
                    >
                      انصراف
                    </button>
                    <button type="submit" className="bg-rose-600 text-white px-4 py-1 rounded text-[11px] font-bold cursor-pointer hover:bg-rose-700">
                      ثبت بدهکاری سند
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-2 text-slate-600 font-semibold">
                    <div className="flex items-center justify-between">
                      <span>تیلفون تماس همکار:</span>
                      <span className="font-mono text-slate-800 font-extrabold">{activePartnerDetails.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ولایت و جزئیات زون:</span>
                      <span className="text-slate-800 font-extrabold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {activePartnerDetails.city}
                      </span>
                    </div>
                    {activeTab === 'Customers' && (
                      <>
                        <div className="flex items-center justify-between border-t border-dashed pt-2 mt-2">
                          <span>سقف مجاز لجر قرضه مشتری:</span>
                          <span className="text-emerald-700 font-black font-mono">${(activePartnerDetails as Customer).creditLimitUSD || '0.00'}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-dashed pt-2 mt-2">
                          <span>وضعیت رمز عبور:</span>
                          {(activePartnerDetails as Customer).passwordResetRequested ? (
                            <button 
                              onClick={() => {
                                const newPassword = window.prompt('رمز عبور جدید را وارد کنید:');
                                if (newPassword) {
                                  editCustomer({ ...activePartnerDetails as Customer, passwordHash: newPassword, passwordResetRequested: false });
                                  alert('رمز عبور با موفقیت تغییر کرد.');
                                }
                              }}
                              className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-lg font-bold hover:bg-rose-200"
                            >
                              درخواست بازیابی رمز! (کلیک کنید)
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const newPassword = window.prompt('رمز عبور جدید را وارد کنید:');
                                if (newPassword) {
                                  editCustomer({ ...activePartnerDetails as Customer, passwordHash: newPassword });
                                  alert('رمز عبور با موفقیت تغییر کرد.');
                                }
                              }}
                              className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold hover:bg-slate-300"
                            >
                              تغییر رمز عبور
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        setIsPayingDebt(true);
                        setPayAmountUSD('0');
                        setPayAmountAFN('0');
                        setPayNotes('');
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] py-2 px-3 rounded-lg font-extrabold shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      وصول پولی و تصفیه لجر (آوردن پول)
                    </button>

                    <button
                      onClick={() => {
                        setIsAddingManualDebt(true);
                        setDebtAmountUSD('0');
                        setDebtAmountAFN('0');
                        setDebtNotes('');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-2 px-3 rounded-lg font-extrabold shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      ثبت سند بدهکاری جدید (بردن جنس به قرض)
                    </button>
                  </div>
                </div>
              )}

              {/* Payments log audit trail list */}
              <div className="space-y-2 pt-2 border-t text-right">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block tracking-wider">تاریخچه دریافت‌های موازی پولی</span>
                
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                  {state.payments.filter(p => p.partnerId === selectedPartnerId).length === 0 ? (
                    <p className="text-[11px] text-slate-405 text-center py-6 font-bold">تاکنون سند دریافتی نقدی ثبت گدام نشده است.</p>
                  ) : (
                    state.payments.filter(p => p.partnerId === selectedPartnerId).map(pEntry => (
                      <div key={pEntry.id} className="py-2.5 flex items-center justify-between text-[11px] font-semibold text-right">
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 block">رسید تسویه نقدی لجر مکتوب</span>
                          <span className="text-slate-400 block text-[9.5px] font-mono">{new Date(pEntry.date).toLocaleDateString('fa-IR')} ∙ معادل نرخ: {pEntry.exchangeRate}</span>
                          <span className="text-slate-500 block italic text-[10px] mt-0.5">"{pEntry.notes}"</span>
                        </div>
                        <div className="text-left font-mono font-bold shrink-0">
                          <span className="block text-emerald-700">{pEntry.amountAFN > 0 ? formatCurrency(pEntry.amountAFN, 'AFN') : ''}</span>
                          <span className="block text-[10px] text-slate-400">${pEntry.amountUSD.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-slate-400 font-medium">
            <Users className="w-12 h-12 text-slate-205 mx-auto mb-3" />
            <span>جهت موازنه طلبکاری/قرضه‌ها، لجر حوالجات بانکی، یا مسدود سازی حساب کاربری، یک همکار را لمس کنید.</span>
          </div>
        )}
      </div>

      {/* Editing Customer Modal Form */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-emerald-500 shadow-xl p-5 text-right space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
              <Edit className="w-5 h-5 text-emerald-600" />
              اصلاح و ویرایش اطلاعات دوسیه مشتری بدهکار
            </h3>
            
            <form onSubmit={handleEditCustomerSubmit} className="space-y-3.5 text-xs text-slate-650">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">نام کامل مشتری:</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">نام شرکت تجارتی / مارک:</label>
                <input
                  type="text"
                  value={editingCustomer.companyName || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">نمبر تیلفون:</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full bg-slate-50 border p-2 rounded-lg font-mono text-left text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">سقف مجاز قرضه ($):</label>
                  <input
                    type="number"
                    value={editingCustomer.creditLimitUSD}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimitUSD: parseFloat(e.target.value) || 3000 })}
                    className="w-full bg-slate-50 border p-2 rounded-lg font-mono text-left text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">آدرس کامل / ولایت:</label>
                <input
                  type="text"
                  value={editingCustomer.city}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="bg-slate-200 px-4 py-1.5 rounded-lg cursor-pointer font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-5 py-1.5 rounded-lg cursor-pointer font-black"
                >
                  ذخیره اصلاحات دفتری
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Supplier Modal Form */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-emerald-500 shadow-xl p-5 text-right space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm border-b pb-2 flex items-center gap-1.5">
              <Edit className="w-5 h-5 text-emerald-600" />
              اصلاح و ویرایش اطلاعات دوسیه سوداگر تامین‌کننده
            </h3>
            
            <form onSubmit={handleEditSupplierSubmit} className="space-y-3.5 text-xs text-slate-650">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">نام کامل سوداگر:</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">نام مارک تجارتی / کمپنی:</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.companyName}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, companyName: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">номер تیلفون فعال تماس:</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.phone}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg font-mono text-left text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">ولایت / آدرس مرکزی سوداگر:</label>
                <input
                  type="text"
                  value={editingSupplier.city}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, city: e.target.value })}
                  className="w-full bg-slate-50 border p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="bg-slate-200 px-4 py-1.5 rounded-lg cursor-pointer font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-5 py-1.5 rounded-lg cursor-pointer font-black"
                >
                  ثبت نهایی اصلاحات سوداگر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Gate Modal Popup */}
      <SecurityGateModal 
        isOpen={securityModalOpen}
        onClose={() => {
          setSecurityModalOpen(false);
          setPartnerToDelete(null);
          setIsBulkDeleting(false);
        }}
        onConfirm={confirmDeletePartner}
        title={isBulkDeleting ? `حذف دائمی ${selectedIds.length} مورد` : `خلع صلاحیت و حذف کامل پرونده: ${partnerToDelete?.name}`}
        description="توجه! این عملیات کل دوسیه و اطلاعات را برای همیشه از حافظه سیستم پاک می‌کند و نیاز به رمز عبور سوپر ادمین دارد."
      />

      {/* Inquiry Edit Modal Popup */}
      {editingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 flex items-center gap-1.5">
              <Edit className="w-5 h-5 text-indigo-600 animate-pulse" />
              ویرایش اطلاعات درخواست تماس مشتری
            </h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                editInquiry(editingInquiry);
                setEditingInquiry(null);
              }} 
              className="space-y-3.5 text-xs text-slate-700 dark:text-slate-200"
            >
              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">نام متقاضی تماس:</label>
                <input
                  type="text"
                  required
                  value={editingInquiry.name}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 rounded-lg focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">شماره تماس / تلگرام / واتساپ:</label>
                <input
                  type="text"
                  required
                  value={editingInquiry.phone}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 rounded-lg font-mono text-left focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">متن پیام یا تفاصیل تماس کالا:</label>
                <textarea
                  required
                  rows={4}
                  value={editingInquiry.message}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 rounded-lg text-slate-700 dark:text-slate-200 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-1">وضعیت پیگیری:</label>
                <select
                  value={editingInquiry.status}
                  onChange={(e) => setEditingInquiry({ ...editingInquiry, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 rounded-lg focus:border-indigo-500"
                >
                  <option value="Pending">در انتظار بررسی</option>
                  <option value="Answered">بررسی و تاایید شده</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setEditingInquiry(null)}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-lg cursor-pointer font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-1.5 rounded-lg cursor-pointer font-black"
                >
                  ذخیره تغییرات تماس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Delete Confirmation Modal */}
      {deletingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 text-right" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in space-y-4">
            <h3 className="font-extrabold text-rose-600 dark:text-rose-455 text-sm border-b pb-2 flex items-center gap-1.5">
              <Trash2 className="w-5 h-5 text-rose-600 animate-pulse" />
              حذف درخواست تماس مشتری
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              آیا مطمئن هستید که می‌خواهید درخواست تماس مربوط به <strong className="text-slate-900 dark:text-white">«{deletingInquiry.name}»</strong> را برای همیشه از حافظه سیستم پاک کنید؟ این عملیات غیرقابل بازگشت است.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingInquiry(null)}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg cursor-pointer font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteInquiry(deletingInquiry.id);
                  setDeletingInquiry(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg cursor-pointer font-black"
              >
                بله، کاملاً حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
