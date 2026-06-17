import React, { useState } from 'react';
import { Calendar, Search, X, Printer, Download, FileSpreadsheet, ChevronDown } from 'lucide-react';

export interface DateRange {
  from: string;
  to: string;
}

interface DateFilterProps {
  dateRange: DateRange;
  onDateChange: (range: DateRange) => void;
  onSearch: () => void;
  onClear: () => void;
  onPrint?: () => void;
  onDownloadPDF?: () => void;
  onDownloadExcel?: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  dateRange,
  onDateChange,
  onSearch,
  onClear,
  onPrint,
  onDownloadPDF,
  onDownloadExcel
}) => {
  const [showPresets, setShowPresets] = useState(false);

  const setRange = (daysOffsetStart: number, daysOffsetEnd: number = 0) => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + daysOffsetEnd);
    
    const start = new Date(today);
    start.setDate(today.getDate() + daysOffsetStart);

    onDateChange({
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    });
    setShowPresets(false);
  };

  const setThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    onDateChange({
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    });
    setShowPresets(false);
  };

  const setLastMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    onDateChange({
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    });
    setShowPresets(false);
  };

  const setThisYear = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    onDateChange({
      from: start.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    });
    setShowPresets(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4 font-sans print:hidden" dir="rtl">
      <div className="flex flex-col md:flex-row items-end gap-4">
        
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              از تاریخ:
            </label>
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-left"
              dir="ltr"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              تا تاریخ:
            </label>
            <input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={onSearch}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> جستجو
          </button>
          
          <button 
            onClick={onClear}
            className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> پاک کردن فلتر
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowPresets(!showPresets)}
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> تاریخ سریع <ChevronDown className="w-3 h-3" />
            </button>
            {showPresets && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                <button onClick={() => setRange(0)} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">امروز</button>
                <button onClick={() => setRange(-1, -1)} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">دیروز</button>
                <button onClick={() => setRange(-7)} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">این هفته (۷ روز اخیر)</button>
                <button onClick={setThisMonth} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">این ماه</button>
                <button onClick={setLastMonth} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">ماه گذشته</button>
                <button onClick={setThisYear} className="text-right text-sm px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700">امسال</button>
                <button onClick={() => setShowPresets(false)} className="text-right text-sm px-3 py-2 hover:bg-indigo-50 text-indigo-600 rounded-lg font-bold border-t border-slate-100 mt-1">انتخاب تاریخ دلخواه</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(onPrint || onDownloadPDF || onDownloadExcel) && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {onPrint && (
            <button onClick={onPrint} className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
              <Printer className="w-4 h-4" /> چاپ
            </button>
          )}
          {onDownloadPDF && (
            <button onClick={onDownloadPDF} className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> دانلود PDF
            </button>
          )}
          {onDownloadExcel && (
            <button onClick={onDownloadExcel} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> دانلود Excel
            </button>
          )}
        </div>
      )}
    </div>
  );
};
