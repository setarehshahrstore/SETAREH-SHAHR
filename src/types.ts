export type Currency = 'USD' | 'AFN';

export type PaymentMethod = 'Cash' | 'Credit' | 'Partial';

export type DeliveryStatus = 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';

export interface UnitConversion {
  unit: string;        // 'Piece', 'Pack', 'Box', 'Carton' etc
  multiplier: number;  // How many base units ('Piece') this contains
}

export interface UnitStructure {
  piece: string;       // e.g. 'Piece' (usually base)
  pack?: { name: string; multiplier: number }; // e.g. Pack = 50 Pieces
  box?: { name: string; multiplier: number };  // e.g. Box = 300 Pieces
  carton?: { name: string; multiplier: number }; // e.g. Carton = 1800 Pieces
}

export interface Product {
  id: string;
  name: string;
  sku: string;        // Barcode or SKU
  category: string;
  image: string;
  units: UnitStructure; // Defined multiplier terms
  
  // Base unit name, usually 'Piece' or 'Item'
  baseUnit: string;

  // Prices stored in USD and converted to AFN dynamically OR set explicitly of both.
  // We'll store both for maximum enterprise fidelity
  wholesalePriceUSD: number;
  wholesalePriceAFN: number;
  retailPriceUSD: number;
  retailPriceAFN: number;
  
  // Cost price (weighted average cost)
  costPriceUSD: number;
  costPriceAFN: number;

  // Stock tracked in total base units (e.g. 523 Pieces)
  stockInBaseUnits: number;
  minStockInBaseUnits: number; // Low stock threshold
  location?: string; // Warehouse bin/location
  imageUrl?: string; // Image for storefront
}

export interface Customer {
  id: string;
  name: string;
  lastName?: string;
  username?: string;
  passwordHash?: string;
  passwordResetRequested?: boolean;
  requirePasswordChange?: boolean;
  companyName?: string;
  phone: string;
  city: string;
  address?: string;
  email?: string;
  debtUSD: number;
  debtAFN: number;
  creditLimitUSD: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  city: string;
  debtUSD: number; // What we owe them
  debtAFN: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  // Selected purchase unit
  selectedUnit: string; 
  multiplier: number; // Multiplier of this unit to base unit
  quantity: number;   // Quantity in selected unit
  unitPriceUSD: number;
  unitPriceAFN: number;
  totalUSD: number;
  totalAFN: number;
  
  // E-commerce alternative suggestion
  proposedAlternative?: {
    productId: string;
    productName: string;
  };
  customerApprovalStatus?: 'Pending' | 'Approved' | 'Rejected';
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  selectedUnit: string;
  multiplier: number;
  quantity: number; // Quantity in selected unit
  costPriceUSD: number;
  costPriceAFN: number;
  totalUSD: number;
  totalAFN: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerType: 'Retail' | 'Wholesale';
  customerId: string; // 'walk-in' or customer ID
  customerName: string;
  items: SaleItem[];
  totalUSD: number;
  totalAFN: number;
  discountUSD: number;
  discountAFN: number;
  finalUSD: number;
  finalAFN: number;
  paidUSD: number;
  paidAFN: number;
  tenderedAFN?: number; // Added for cash change tracking
  changeAFN?: number; // Added for cash change tracking
  paymentMethod: PaymentMethod;
  exchangeRate: number; // USD to AFN rate during sale
  status: 'Completed' | 'Pending Delivery' | 'Requires Customer Approval' | 'Delivered' | 'Cancelled';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryStatus?: DeliveryStatus;
  deliveryDriver?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  type: 'Retail' | 'Wholesale';
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalUSD: number;
  totalAFN: number;
  paidUSD: number;
  paidAFN: number;
  exchangeRate: number;
  paymentMethod: PaymentMethod;
}

export interface CashRegister {
  balanceUSD: number;
  balanceAFN: number;
}

export interface DebtPayment {
  id: string;
  date: string;
  partnerId: string; // customer or supplier ID
  partnerType: 'Customer' | 'Supplier';
  partnerName: string;
  amountUSD: number;
  amountAFN: number;
  exchangeRate: number;
  notes?: string;
}

export interface CustomerInquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: string;
  status: 'Pending' | 'Answered';
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amountUSD: number;
  amountAFN: number;
  amount?: number;
  currency?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'Customer' | 'Admin' | 'AI';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  customerId?: string; // Optional if guest
  customerName: string;
  customerPhone?: string;
  messages: ChatMessage[];
  status: 'Active' | 'Waiting' | 'Closed';
  unreadByAdmin: number;
  unreadByCustomer: number;
}

export interface AppState {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  payments: DebtPayment[];
  expenses: Expense[];
  transactions?: any[];
  chatSessions?: ChatSession[];
  cashRegister: CashRegister;
  exchangeRate: number; // 1 USD = X AFN (defaults to 71.5)
  inquiries?: CustomerInquiry[];
}
