import { UnitStructure, Currency, StoreOperatingHours, StoreDailyHours } from './types';

/**
 * Format currency with appropriate symbols
 */
export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    // Afghan currency Afghani symbol in Dari can be "افغانی" or "؋"
    return `${new Intl.NumberFormat('ps-AF', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount))} افغانی`;
  }
}

/**
 * Convert full stock in base units (e.g. Pieces) into detailed parts (Cartons, Boxes, Packs, Pieces)
 */
export interface DecomposedStock {
  cartons: number;
  boxes: number;
  packs: number;
  pieces: number;
}

export function decomposeStock(baseQty: number, units: UnitStructure): DecomposedStock {
  let remaining = baseQty;
  let cartons = 0;
  let boxes = 0;
  let packs = 0;
  let pieces = 0;

  // Process cartons
  if (units.carton && units.carton.multiplier > 0) {
    cartons = Math.floor(remaining / units.carton.multiplier);
    remaining %= units.carton.multiplier;
  }

  // Process boxes
  if (units.box && units.box.multiplier > 0) {
    boxes = Math.floor(remaining / units.box.multiplier);
    remaining %= units.box.multiplier;
  }

  // Process packs
  if (units.pack && units.pack.multiplier > 0) {
    packs = Math.floor(remaining / units.pack.multiplier);
    remaining %= units.pack.multiplier;
  }

  pieces = remaining;

  return { cartons, boxes, packs, pieces };
}

/**
 * Format decomposed stock as a friendly human-readable string
 */
export function formatStock(baseQty: number, units: UnitStructure): string {
  const dec = decomposeStock(baseQty, units);
  const parts: string[] = [];

  if (dec.cartons > 0 && units.carton) {
    parts.push(`${dec.cartons} ${units.carton.name}`);
  }
  if (dec.boxes > 0 && units.box) {
    parts.push(`${dec.boxes} ${units.box.name}`);
  }
  if (dec.packs > 0 && units.pack) {
    parts.push(`${dec.packs} ${units.pack.name}`);
  }
  if (dec.pieces > 0 || parts.length === 0) {
    parts.push(`${dec.pieces} ${units.piece}`);
  }

  return parts.join('، ');
}

/**
 * Get list of available unit selectable options from a unit structure
 */
export interface UnitOption {
  key: string;
  name: string;
  multiplier: number;
}

export function getUnitOptions(units: UnitStructure): UnitOption[] {
  const options: UnitOption[] = [
    { key: 'piece', name: units.piece, multiplier: 1 }
  ];

  if (units.pack) {
    options.push({ key: 'pack', name: units.pack.name, multiplier: units.pack.multiplier });
  }
  if (units.box) {
    options.push({ key: 'box', name: units.box.name, multiplier: units.box.multiplier });
  }
  if (units.carton) {
    options.push({ key: 'carton', name: units.carton.name, multiplier: units.carton.multiplier });
  }

  // Sort by multiplier descending so they display Carton, Box, Pack, Piece
  return options.sort((a, b) => b.multiplier - a.multiplier);
}

/**
 * Calculate multi-currency conversion
 */
export function convertCurrency(amount: number, from: Currency, to: Currency, rate: number): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'AFN') {
    return amount * rate;
  }
  if (from === 'AFN' && to === 'USD') {
    return amount / rate;
  }
  return amount;
}

/**
 * Convert 24-hour time string ("HH:mm" or ISO string) into 12-hour format ("hh:mm AM/PM" or "hh:mm ق.ظ/ب.ظ")
 * Strictly enforces 12-hour display format across the entire application.
 */
export function formatTime12h(
  timeInput?: string | null, 
  options: { 
    showSeconds?: boolean; 
    usePersianMeridiem?: boolean; 
    fallback?: string 
  } = {}
): string {
  const { showSeconds = false, usePersianMeridiem = true, fallback = '---' } = options;
  if (!timeInput || timeInput.trim() === '') return fallback;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Check if it's an ISO or date-like string containing "T" or spaces
  if (timeInput.includes('T') || timeInput.includes('-') || timeInput.includes(':') && timeInput.length > 8) {
    const d = new Date(timeInput);
    if (isNaN(d.getTime())) return fallback;
    hours = d.getHours();
    minutes = d.getMinutes();
    seconds = d.getSeconds();
  } else if (timeInput.includes(':')) {
    const parts = timeInput.split(':');
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    seconds = parts[2] ? parseInt(parts[2], 10) || 0 : 0;
  } else {
    return fallback;
  }

  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const meridiemText = usePersianMeridiem ? (meridiem === 'PM' ? 'ب.ظ' : 'ق.ظ') : meridiem;
  
  let hours12 = hours % 12;
  if (hours12 === 0) hours12 = 12; // 00:00 is 12:00 AM, 12:00 is 12:00 PM

  const hh = hours12.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (showSeconds) {
    return `${hh}:${mm}:${ss} ${meridiemText}`;
  }
  return `${hh}:${mm} ${meridiemText}`;
}

/**
 * Format ISO datetime with 12-hour time format
 */
export function formatDateTime12h(
  isoDate?: string | null,
  options: { usePersianMeridiem?: boolean; fallback?: string } = {}
): string {
  const { usePersianMeridiem = true, fallback = '---' } = options;
  if (!isoDate) return fallback;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return fallback;

  const datePart = d.toLocaleDateString('fa-IR');
  const timePart = formatTime12h(isoDate, { showSeconds: true, usePersianMeridiem });

  return `${datePart} - ساعت ${timePart}`;
}

/**
 * Parse a 24-hour "HH:mm" time string into 12-hour components
 */
export function parse24hTo12hParts(time24: string): { hour: number; minute: number; meridiem: 'AM' | 'PM' } {
  if (!time24 || !time24.includes(':')) {
    return { hour: 8, minute: 0, meridiem: 'AM' };
  }
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const meridiem: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  let hour = h % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: m, meridiem };
}

/**
 * Convert 12-hour components (hour: 1-12, minute: 0-59, meridiem: 'AM'|'PM') to "HH:mm"
 */
export function convert12hPartsTo24h(hour12: number, minute: number, meridiem: 'AM' | 'PM'): string {
  let h = hour12 % 12;
  if (meridiem === 'PM') h += 12;
  const hh = h.toString().padStart(2, '0');
  const mm = Math.min(59, Math.max(0, minute)).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Store Operating Hours Default 7-day Schedule
 */
export const DEFAULT_STORE_OPERATING_HOURS: StoreOperatingHours = {
  Saturday: { day: 'Saturday', dayNameFa: 'شنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'روز کاری معمول' },
  Sunday: { day: 'Sunday', dayNameFa: 'یکشنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'روز کاری معمول' },
  Monday: { day: 'Monday', dayNameFa: 'دوشنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'روز کاری معمول' },
  Tuesday: { day: 'Tuesday', dayNameFa: 'سه‌شنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'روز کاری معمول' },
  Wednesday: { day: 'Wednesday', dayNameFa: 'چهارشنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'روز کاری معمول' },
  Thursday: { day: 'Thursday', dayNameFa: 'پنج‌شنبه', isOpen: true, openTime: '08:00', closeTime: '21:00', specialNote: 'تحویل بار و سفارشات' },
  Friday: { day: 'Friday', dayNameFa: 'جمعه', isOpen: true, openTime: '13:30', closeTime: '21:30', specialNote: 'بازگشایی بعد از ادای نماز جمعه' },
  generalNote: 'برنامه کاری و ساعات فعالیت فروشگاه ممکن است بر اساس ایام، اعیاد و شرایط تغییر یابد. لطفاً ساعات کاری روز را بررسی فرمایید.'
};

export const STORE_HOURS_STORAGE_KEY = 'AFG_STORE_HOURS';

export function getStoreHours(): StoreOperatingHours {
  const saved = localStorage.getItem(STORE_HOURS_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.Saturday && parsed.Friday) {
        return {
          ...DEFAULT_STORE_OPERATING_HOURS,
          ...parsed
        };
      }
    } catch (e) {
      console.error("Error reading store hours", e);
    }
  }
  return DEFAULT_STORE_OPERATING_HOURS;
}

export function saveStoreHours(hours: StoreOperatingHours): void {
  try {
    localStorage.setItem(STORE_HOURS_STORAGE_KEY, JSON.stringify(hours));
    // Trigger custom event so all listeners immediately update
    window.dispatchEvent(new Event('store_hours_updated'));
  } catch (e) {
    console.error("Error saving store hours", e);
  }
}

/**
 * Check if the store is currently open right now based on day of week and current time
 */
export function checkStoreOpenStatus(hours: StoreOperatingHours = getStoreHours()): {
  isOpenNow: boolean;
  todaySchedule: StoreDailyHours;
  todayNameFa: string;
  statusText: string;
  formattedHours: string;
} {
  const now = new Date();
  const dayNum = now.getDay(); // 0 = Sunday, 6 = Saturday
  const map: Record<number, keyof StoreOperatingHours> = {
    6: 'Saturday',
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday'
  };

  const dayKey = map[dayNum] as keyof StoreOperatingHours;
  const todaySchedule = hours[dayKey] as StoreDailyHours || hours.Saturday;
  
  if (!todaySchedule.isOpen) {
    return {
      isOpenNow: false,
      todaySchedule,
      todayNameFa: todaySchedule.dayNameFa,
      statusText: 'هم‌اکنون فروشگاه تعطیل است',
      formattedHours: 'امروز تعطیل'
    };
  }

  const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
  const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);

  const openMinutes = (openH || 8) * 60 + (openM || 0);
  const closeMinutes = (closeH || 21) * 60 + (closeM || 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isOpenNow = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  const formattedHours = `${formatTime12h(todaySchedule.openTime)} الی ${formatTime12h(todaySchedule.closeTime)}`;

  return {
    isOpenNow,
    todaySchedule,
    todayNameFa: todaySchedule.dayNameFa,
    statusText: isOpenNow ? 'هم‌اکنون فروشگاه باز است' : 'هم‌اکنون فروشگاه بسته است',
    formattedHours
  };
}
