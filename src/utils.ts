import { UnitStructure, Currency } from './types';

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
