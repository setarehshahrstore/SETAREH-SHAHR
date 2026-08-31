import React, { useState, useEffect } from 'react';
import { useAppState } from '../AppContext';
import { 
  fetchLiveGoogleRate, 
  getCachedExchangeRateInfo, 
  ExchangeRateInfo,
  calculateRates 
} from '../services/exchangeRateService';
import { 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  Globe, 
  Clock, 
  Check, 
  Edit3, 
  X,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
  showDate?: boolean;
}

export const ExchangeRateDisplay: React.FC<Props> = ({ 
  variant = 'compact', 
  className = '',
  showDate = true
}) => {
  const { state, updateExchangeRate } = useAppState();
  const [rateInfo, setRateInfo] = useState<ExchangeRateInfo>(() => getCachedExchangeRateInfo(state.exchangeRate));
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState(state.exchangeRate.toString());
  const [justUpdated, setJustUpdated] = useState(false);

  // Sync when state.exchangeRate updates
  useEffect(() => {
    const updated = calculateRates(state.exchangeRate);
    setRateInfo(prev => ({
      ...prev,
      ...updated
    }));
    setCustomInput(state.exchangeRate.toString());
  }, [state.exchangeRate]);

  // Fetch initial live rate on mount and poll every 30 seconds for real-time live rates
  useEffect(() => {
    handleFetchLive();
    const interval = setInterval(() => {
      handleFetchLive(true); // background silent poll
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFetchLive = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const live = await fetchLiveGoogleRate(state.exchangeRate);
      setRateInfo(live);
      if (Math.abs(live.baseRate - state.exchangeRate) > 0.01) {
        updateExchangeRate(live.baseRate);
      }
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    } catch (e) {
      console.warn(e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateExchangeRate(parsed);
      const updated = calculateRates(parsed);
      setRateInfo({
        ...updated,
        lastUpdated: new Date().toISOString(),
        source: 'Manual/Cached'
      });
      setIsEditing(false);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 2500);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-CA');

  // Compact Variant (as requested in top dashboard / banner)
  if (variant === 'compact') {
    return (
      <div className={`relative flex flex-col items-end gap-2 bg-[#0B1F3A]/70 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/15 text-white shadow-lg ${className}`} dir="rtl">
        {showDate && (
          <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>تاریخ امروز:</span>
            <span className="font-bold text-white font-mono tracking-wider" dir="ltr">{todayDate}</span>
          </div>
        )}

        <div className="w-full flex flex-col gap-1.5 bg-black/40 p-3 rounded-xl border border-white/10">
          
          {/* Header Row: Google / Market Live Indicator & Refresh button */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-300">
                نرخ زنده صرافی (گوگل / بازار):
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={handleFetchLive}
                disabled={isLoading}
                title="به‌روزرسانی نرخ آنلاین از گوگل / مارکت"
                className="p-1 hover:bg-white/10 rounded-lg text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                title="تنظیم دستی نرخ"
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Edit Form or Display */}
          {isEditing ? (
            <form onSubmit={handleManualSubmit} className="flex items-center gap-2 pt-1">
              <input 
                type="number"
                step="0.01"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-24 bg-white text-slate-900 font-black text-xs px-2 py-1 rounded-lg outline-none font-mono"
                dir="ltr"
                placeholder="71.5"
                autoFocus
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ثبت
              </button>
            </form>
          ) : (
            <div className="space-y-1.5 pt-1">
              
              {/* Original Center Base Price */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">نرخ مبنا (دالر):</span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {rateInfo.baseRate} ؋ <span className="text-[10px] text-slate-400 font-normal">/ $1</span>
                </span>
              </div>

              {/* Buy & Sell Split Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                {/* Buy: 0.50 down */}
                <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-1.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-400" />
                      خرید (-۰.۵۰):
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm mt-0.5" dir="ltr">
                    {rateInfo.buyRate.toFixed(2)} ؋
                  </span>
                </div>

                {/* Sell: 0.50 up */}
                <div className="bg-rose-950/50 border border-rose-500/30 rounded-lg p-1.5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-rose-300 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-rose-400" />
                      فروش (+۰.۵۰):
                    </span>
                  </div>
                  <span className="font-mono font-black text-rose-400 text-xs sm:text-sm mt-0.5" dir="ltr">
                    {rateInfo.sellRate.toFixed(2)} ؋
                  </span>
                </div>
              </div>

            </div>
          )}

          {justUpdated && (
            <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 justify-center pt-0.5">
              <Check className="w-3 h-3 text-emerald-400" /> نرخ به‌روز شد
            </span>
          )}

        </div>
      </div>
    );
  }

  // Full / Settings Card Variant
  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 ${className}`} dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">نرخ روزانه اسعار (گوگل و سرای شهزاده)</h2>
            <p className="text-xs text-slate-500">قیمت خرید (-۰.۵۰) و فروش (+۰.۵۰) بر مبنای نرخ لحظه‌ای</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFetchLive}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          <span>دریافت نرخ زنده</span>
        </button>
      </div>

      {/* 3-Column Rate Board: Buy / Original / Sell */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Buy Box */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-black flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              نرخ خرید دالر
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-emerald-900">- 0.50</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-emerald-700 block" dir="ltr">
              {rateInfo.buyRate.toFixed(2)} ؋
            </span>
            <span className="text-[10px] text-emerald-600/90 font-medium">مبنای دریافت دالر از مشتری</span>
          </div>
        </div>

        {/* Original Base Box */}
        <div className="bg-slate-50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col justify-between relative shadow-xs">
          <div className="flex items-center justify-between text-slate-800">
            <span className="text-xs font-black flex items-center gap-1">
              <Globe className="w-4 h-4 text-amber-600" />
              نرخ مبنا (Google / بازار)
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">پایه</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-[#0B1F3A] block" dir="ltr">
              {rateInfo.baseRate.toFixed(2)} ؋
            </span>
            <span className="text-[10px] text-slate-500 font-medium">محاسبه مانده صندوق و فاکتورها</span>
          </div>
        </div>

        {/* Sell Box */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-black flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              نرخ فروش دالر
            </span>
            <span className="text-[10px] font-bold bg-rose-100 px-2 py-0.5 rounded-md text-rose-900">+ 0.50</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black font-mono text-rose-700 block" dir="ltr">
              {rateInfo.sellRate.toFixed(2)} ؋
            </span>
            <span className="text-[10px] text-rose-600/90 font-medium">مبنای تسویه با نرخ دالری</span>
          </div>
        </div>

      </div>

      {/* Manual Change input */}
      <form onSubmit={handleManualSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            تنظیم دستی نرخ مبنا (دالر به افغانی):
          </label>
          <div className="relative">
            <input 
              type="number"
              step="0.01"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm font-mono font-bold text-slate-900 outline-hidden focus:border-amber-500"
              placeholder="71.50"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">AFN / USD</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto mt-2 sm:mt-5 bg-[#0B1F3A] hover:bg-[#15345d] text-amber-300 px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs"
        >
          اعمال و محاسبه خرید/فروش
        </button>
      </form>
    </div>
  );
};
