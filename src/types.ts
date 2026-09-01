export type Currency = 'USD' | 'AFN';

export type PaymentMethod = 'Cash' | 'Card' | 'Check' | 'Credit' | 'Partial';

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
  dozen?: { name: string; multiplier: number }; // e.g. Dozen = 12 Pieces
  packet?: { name: string; multiplier: number }; // e.g. Packet
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

  // Advanced features
  minWholesaleQty?: number; // Minimum quantity to allow wholesale pricing
  isDiscounted?: boolean;   // Clearance flag
  isBestSeller?: boolean;   // Best-seller flag
  discountPercentage?: number; // Percentage discount (e.g. 10 for 10%)
  discountExpiry?: string;     // ISO date string for when the discount expires
  status?: 'published' | 'draft' | 'archived'; // Product publication status
  isDraft?: boolean;
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
  savedCart?: CartItem[];
  debtUSD: number;
  debtAFN: number;
  creditLimitUSD: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
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
  cashierName?: string; // Track who served the customer
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

export interface StoreDailyHours {
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayNameFa: string; // شنبه، یکشنبه، ...
  isOpen: boolean;
  openTime: string; // HH:mm e.g. "08:00"
  closeTime: string; // HH:mm e.g. "21:00"
  specialNote?: string; // e.g. "بعد از نماز جمعه باز است"
}

export type StoreOperatingHours = {
  Saturday: StoreDailyHours;
  Sunday: StoreDailyHours;
  Monday: StoreDailyHours;
  Tuesday: StoreDailyHours;
  Wednesday: StoreDailyHours;
  Thursday: StoreDailyHours;
  Friday: StoreDailyHours;
  generalNote?: string;
};

export interface DailyShift {
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayNameFa: string; // شنبه، یکشنبه، ...
  shiftType: 'Morning' | 'Evening' | 'FullDay' | 'Night' | 'Custom' | 'Off';
  startTime: string; // HH:mm e.g. "08:00"
  endTime: string;   // HH:mm e.g. "16:00"
  isOff: boolean;
  note?: string;
}

export type WeeklySchedule = {
  Saturday: DailyShift;
  Sunday: DailyShift;
  Monday: DailyShift;
  Tuesday: DailyShift;
  Wednesday: DailyShift;
  Thursday: DailyShift;
  Friday: DailyShift;
};

export type LeaveType = 'Vacation' | 'Sick' | 'Emergency' | 'ShiftOff' | 'Hourly';

export interface LeaveRequest {
  id: string;
  employeeUsername: string;
  employeeName: string;
  employeeCode: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  hours?: number;    // for hourly leave
  reason: string;
  requestDate: string; // ISO
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewNote?: string;
  reviewDate?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: 'AFN' | 'USD';
  note: string;
}

export interface TimeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO string
  clockOutTime?: string; // ISO string
  clockInPhoto?: string; // Base64 snapshot image
  clockOutPhoto?: string; // Base64 snapshot image
  clockInMethod?: 'QR_CODE' | 'FACE_SCAN' | 'EMPLOYEE_ID' | 'BULK_ADMIN' | 'MANUAL';
  clockOutMethod?: 'QR_CODE' | 'FACE_SCAN' | 'EMPLOYEE_ID' | 'BULK_ADMIN' | 'MANUAL';
  deviceInfo?: string;
  note?: string;
}

export interface AppUser {
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'Owner' | 'Manager' | 'Cashier' | 'Warehouse Staff' | 'Customer';
  employeeCode: string; // STS + 4 digits e.g. "STS1001"
  phone?: string;
  avatar: string; // Required Photo URL / Base64 data
  status?: 'Active' | 'Inactive';
  baseSalaryAFN?: number;
  department?: string;
  nationalId?: string;
  bloodGroup?: string;
  hireDate?: string;
  schedule?: WeeklySchedule;
  payments?: PaymentRecord[];
  timeRecords?: TimeRecord[];
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
  capitalLogs?: any[];
  chatSessions?: ChatSession[];
  cashRegister: CashRegister;
  exchangeRate: number; // 1 USD = X AFN (defaults to 71.5)
  inquiries?: CustomerInquiry[];
  leaveRequests?: LeaveRequest[];
}

