// Exchange rate fetcher utility with Buy (خرید) and Sell (فروش) spread logic
// Original live market rate fetched from currency exchange API / Google finance proxy

export interface ExchangeRateInfo {
  baseRate: number;     // Original base rate (e.g. from Google / Market: ~71.50)
  buyRate: number;      // 0.50 down from original (e.g. 71.00 AFN)
  sellRate: number;     // 0.50 up from original (e.g. 72.00 AFN)
  lastUpdated: string;
  source: 'Live Google/Market' | 'Manual/Cached';
}

const CACHE_KEY = 'AFG_LIVE_EXCHANGE_INFO';

export const calculateRates = (base: number): { baseRate: number; buyRate: number; sellRate: number } => {
  const roundedBase = Math.round(base * 100) / 100;
  const buyRate = Math.round((roundedBase - 0.50) * 100) / 100;
  const sellRate = Math.round((roundedBase + 0.50) * 100) / 100;
  return {
    baseRate: roundedBase,
    buyRate: buyRate > 0 ? buyRate : roundedBase,
    sellRate: sellRate
  };
};

export const getCachedExchangeRateInfo = (fallbackRate: number = 71.5): ExchangeRateInfo => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.baseRate === 'number') {
        const rates = calculateRates(parsed.baseRate);
        return {
          ...rates,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          source: parsed.source || 'Manual/Cached'
        };
      }
    }
  } catch (e) {
    console.warn('Error reading cached exchange rate:', e);
  }

  const calculated = calculateRates(fallbackRate);
  return {
    ...calculated,
    lastUpdated: new Date().toISOString(),
    source: 'Manual/Cached'
  };
};

export const fetchLiveGoogleRate = async (fallbackRate: number = 71.5): Promise<ExchangeRateInfo> => {
  try {
    // Attempt to fetch live USD to AFN rate from public open exchange APIs
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.ok) {
      const data = await response.json();
      if (data && data.rates && typeof data.rates.AFN === 'number' && data.rates.AFN > 30) {
        const liveRate = data.rates.AFN;
        const calculated = calculateRates(liveRate);
        const info: ExchangeRateInfo = {
          ...calculated,
          lastUpdated: new Date().toISOString(),
          source: 'Live Google/Market'
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(info));
        return info;
      }
    }
  } catch (err) {
    console.warn('Could not fetch live online currency rate, using current base rate:', err);
  }

  // Fallback to currently defined system base rate
  const calculated = calculateRates(fallbackRate);
  const info: ExchangeRateInfo = {
    ...calculated,
    lastUpdated: new Date().toISOString(),
    source: 'Manual/Cached'
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(info));
  return info;
};
