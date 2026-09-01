import { UserRole } from '../AuthContext';

export interface RoleConfig {
  role: UserRole;
  titleFa: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  homeRoute: string;
  allowedRoutes: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  'Owner': {
    role: 'Owner',
    titleFa: 'مالک / مدیر ارشد',
    badgeBg: 'bg-gradient-to-r from-amber-500/15 to-emerald-500/15',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-800',
    description: 'دسترسی کامل و نامحدود به کلیه بخش‌های مالی، پرسنلی، تنظیمات و گزارشات سیستم',
    homeRoute: '/admin/dashboard',
    allowedRoutes: [
      '/admin/dashboard',
      '/admin/products',
      '/admin/categories',
      '/admin/sales',
      '/admin/purchases',
      '/admin/orders',
      '/admin/partners',
      '/admin/inventory',
      '/admin/debts',
      '/admin/finances',
      '/admin/expenses',
      '/admin/employees',
      '/admin/reports',
      '/admin/settings',
      '/admin/live-chat',
      '/admin/inquiries'
    ]
  },
  'Manager': {
    role: 'Manager',
    titleFa: 'مدیر داخلی',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-300',
    badgeText: 'text-blue-800',
    description: 'مدیریت عملیاتی فروشگاه، اجناس، خریدها و فاکتورها (بدون دسترسی به حقوق پرسنل و کاربران سیستم)',
    homeRoute: '/admin/dashboard',
    allowedRoutes: [
      '/admin/dashboard',
      '/admin/products',
      '/admin/categories',
      '/admin/sales',
      '/admin/purchases',
      '/admin/orders',
      '/admin/partners',
      '/admin/inventory',
      '/admin/debts',
      '/admin/finances',
      '/admin/expenses',
      '/admin/reports',
      '/admin/settings',
      '/admin/live-chat',
      '/admin/inquiries'
    ]
  },
  'Cashier': {
    role: 'Cashier',
    titleFa: 'صندوق‌دار',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    badgeText: 'text-emerald-800',
    description: 'دسترسی اختصاصی به میز فروش سریع (POS)، سفارشات مشتریان، چت آنلاین و تردد پرسنلی',
    homeRoute: '/admin/sales',
    allowedRoutes: [
      '/admin/sales',
      '/admin/orders',
      '/admin/live-chat'
    ]
  },
  'Warehouse Staff': {
    role: 'Warehouse Staff',
    titleFa: 'مسئول گدام / انباردار',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-900',
    description: 'دسترسی اختصاصی به مدیریت موجودی گدام، چاپ بارکد، ثبت کسری کالا و چت زنده',
    homeRoute: '/admin/inventory',
    allowedRoutes: [
      '/admin/inventory',
      '/admin/live-chat'
    ]
  },
  'Customer': {
    role: 'Customer',
    titleFa: 'مشتری فروشگاه',
    badgeBg: 'bg-slate-50',
    badgeBorder: 'border-slate-200',
    badgeText: 'text-slate-700',
    description: 'خرید از فروشگاه آنلاین، پیگیری سفارشات و حساب کاربری مشتری',
    homeRoute: '/account',
    allowedRoutes: [
      '/account'
    ]
  }
};

/**
 * Check if a role can access a specific route
 */
export function hasRouteAccess(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  
  // Clean trailing slashes or search queries
  const cleanPath = path.split('?')[0].replace(/\/$/, '');
  
  if (role === 'Owner') return true; // Owner can access everything
  
  return config.allowedRoutes.some(allowed => {
    const cleanAllowed = allowed.replace(/\/$/, '');
    return cleanPath === cleanAllowed || cleanPath.startsWith(cleanAllowed + '/');
  });
}

/**
 * Granular Feature & Data Field Permissions
 */
export const Permissions = {
  // Financial & Profit Visibility
  canViewProfitMargins: (role?: UserRole): boolean => role === 'Owner',
  canViewCostPrices: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canManageCapital: (role?: UserRole): boolean => role === 'Owner',
  canResetFinancials: (role?: UserRole): boolean => role === 'Owner',
  
  // HR & Staff
  canManageHR: (role?: UserRole): boolean => role === 'Owner',
  canViewStaffSalaries: (role?: UserRole): boolean => role === 'Owner',
  canEditAttendanceLogs: (role?: UserRole): boolean => role === 'Owner',
  
  // Settings & System Security
  canManageSystemUsers: (role?: UserRole): boolean => role === 'Owner',
  canResetDatabase: (role?: UserRole): boolean => role === 'Owner',
  canManageStoreBranding: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canUpdateExchangeRate: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  
  // Catalog & Inventory
  canAddProducts: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager' || role === 'Warehouse Staff',
  canEditProducts: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager' || role === 'Warehouse Staff',
  canEditProductPrices: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canDeleteProducts: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canAdjustStock: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager' || role === 'Warehouse Staff',
  
  // Sales & POS
  canAccessPOS: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager' || role === 'Cashier',
  canDeleteSales: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canDeleteSalesInvoice: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canEditSalePrices: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canGiveCustomDiscounts: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  
  // Financial & Profit Visibility
  canViewFinances: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canEditCashRegister: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  
  // Purchases & Suppliers
  canManagePurchases: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
  canDeletePurchases: (role?: UserRole): boolean => role === 'Owner',
  
  // Reports
  canViewFinancialReports: (role?: UserRole): boolean => role === 'Owner',
  canViewOperationalReports: (role?: UserRole): boolean => role === 'Owner' || role === 'Manager',
};
