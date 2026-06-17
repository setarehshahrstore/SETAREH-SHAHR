import { Product, Customer, Supplier, Sale, Purchase, DebtPayment, AppState } from './types';

export const INITIAL_EXCHANGE_RATE = 72.5; // 1 USD = 72.5 AFN standard today

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'زعفران سرخ هرات (سوپر نگین)',
    sku: '8930129302192',
    category: 'ادویه‌جات و گیاهان',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'گرام',
    units: {
      piece: 'گرام',
      pack: { name: 'بسته (۵۰ گرام)', multiplier: 50 },
      box: { name: 'قوطی فلزی (۲۵۰ گرام)', multiplier: 250 },
      carton: { name: 'کارتن عمده (۵ کیلوگرام)', multiplier: 5000 }
    },
    wholesalePriceUSD: 2.20,
    wholesalePriceAFN: 160.00,
    retailPriceUSD: 3.20,
    retailPriceAFN: 230.00,
    costPriceUSD: 1.40,
    costPriceAFN: 100.00,
    stockInBaseUnits: 12450, // 2 Cartons, 9 Tins, 4 Boxes, 200g
    minStockInBaseUnits: 2000,
    location: 'بخش الف - صنف ۱'
  },
  {
    id: 'prod-2',
    name: 'آب انار سرخ قندهار',
    sku: '6291012345672',
    category: 'نوشیدنی‌ها',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'بوتل',
    units: {
      piece: 'بوتل',
      pack: { name: 'شیرینک (۶ بوتل)', multiplier: 6 },
      box: { name: 'کارتن کوچک (۲۴ بوتل)', multiplier: 24 },
      carton: { name: 'پالت چوبی (۲۴۰ بوتل)', multiplier: 240 }
    },
    wholesalePriceUSD: 0.85,
    wholesalePriceAFN: 62.00,
    retailPriceUSD: 1.25,
    retailPriceAFN: 90.00,
    costPriceUSD: 0.50,
    costPriceAFN: 36.00,
    stockInBaseUnits: 720, // 3 Wooden Pallets
    minStockInBaseUnits: 480,
    location: 'بخش ب - یخچال گدام'
  },
  {
    id: 'prod-3',
    name: 'چای سبز اعلای کابل (سبز)',
    sku: '8930129302111',
    category: 'نوشیدنی‌ها',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'پاکت (۵۰۰ گرام)',
    units: {
      piece: 'پاکت',
      pack: { name: 'بسته (۱۰ پاکت)', multiplier: 10 },
      box: { name: 'جعبه متوسط (۵۰ پاکت)', multiplier: 50 },
      carton: { name: 'کارتن بزرگ (۱۰۰ پاکت)', multiplier: 100 }
    },
    wholesalePriceUSD: 2.10,
    wholesalePriceAFN: 152.00,
    retailPriceUSD: 2.90,
    retailPriceAFN: 210.00,
    costPriceUSD: 1.30,
    costPriceAFN: 94.00,
    stockInBaseUnits: 145, // 1 master carton, 4 bundles, 5 pouches
    minStockInBaseUnits: 250, // Low Stock Alert Triggered!
    location: 'قفسه ج - صنف چای برتر'
  },
  {
    id: 'prod-4',
    name: 'کشمش سرخ ارگانیک پامیر',
    sku: '6291012345894',
    category: 'میوه خشک و خسته‌باب',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'کیلوگرام',
    units: {
      piece: 'کیلوگرام',
      pack: { name: 'خریطه (۵ کیلوگرام)', multiplier: 5 },
      box: { name: 'صندوق (۲۰ کیلوگرام)', multiplier: 20 },
      carton: { name: 'کارتن کلان (۱۰۰ کیلوگرام)', multiplier: 100 }
    },
    wholesalePriceUSD: 3.50,
    wholesalePriceAFN: 254.00,
    retailPriceUSD: 4.80,
    retailPriceAFN: 348.00,
    costPriceUSD: 2.20,
    costPriceAFN: 160.00,
    stockInBaseUnits: 48, // 2 boxes, 1 bag, 3 KG
    minStockInBaseUnits: 100, // Low Stock Alert Triggered!
    location: 'بخش خشکبار - صنف ۴'
  },
  {
    id: 'prod-5',
    name: 'بادام شیرین مزار (صنف ستاربایی)',
    sku: '6291012355551',
    category: 'میوه خشک و خسته‌باب',
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61ede4?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'کیلوگرام',
    units: {
      piece: 'کیلوگرام',
      pack: { name: 'خریطه کوچک (۲ کیلوگرام)', multiplier: 2 },
      box: { name: 'صندوق (۱۰ کیلوگرام)', multiplier: 10 },
      carton: { name: 'پالت تجارتی (۵۰ کیلوگرام)', multiplier: 50 }
    },
    wholesalePriceUSD: 6.80,
    wholesalePriceAFN: 493.00,
    retailPriceUSD: 9.00,
    retailPriceAFN: 650.00,
    costPriceUSD: 4.50,
    costPriceAFN: 326.00,
    stockInBaseUnits: 340, // 6 pallets, 4 sacks
    minStockInBaseUnits: 100,
    location: 'بخش خشکبار - صنف ۲'
  },
  {
    id: 'prod-6',
    name: 'شامپو فامیلی صحت (بابونه اعلا)',
    sku: '6292012930222',
    category: 'لوازم بهداشتی',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'دانه',
    units: {
      piece: 'دانه',
      pack: { name: 'پاکت (۶ دانه)', multiplier: 6 },
      carton: { name: 'کارتن (۳۶ دانه)', multiplier: 36 }
    },
    wholesalePriceUSD: 1.10,
    wholesalePriceAFN: 80.00,
    retailPriceUSD: 1.50,
    retailPriceAFN: 110.00,
    costPriceUSD: 0.70,
    costPriceAFN: 50.00,
    stockInBaseUnits: 468, // 13 Master Cartons
    minStockInBaseUnits: 72,
    location: 'قفسه بهداشتی - زون الف'
  },
  {
    id: 'prod-7',
    name: 'صابون لوکس معطر ضد باکتری',
    sku: '6292012930233',
    category: 'لوازم بهداشتی',
    image: 'https://images.unsplash.com/photo-1607006342446-2c93fa80d0d8?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'دانه',
    units: {
      piece: 'دانه',
      pack: { name: 'بسته متوسط (۴ دانه)', multiplier: 4 },
      carton: { name: 'کارتن کلان (۴۸ دانه)', multiplier: 48 }
    },
    wholesalePriceUSD: 0.50,
    wholesalePriceAFN: 36.00,
    retailPriceUSD: 0.75,
    retailPriceAFN: 54.00,
    costPriceUSD: 0.30,
    costPriceAFN: 22.00,
    stockInBaseUnits: 1140, // 23 Cartons, 3 Packages, 11 Pieces
    minStockInBaseUnits: 100,
    location: 'قفسه بهداشتی - زون ب'
  },
  {
    id: 'prod-8',
    name: 'دستمال کاغذی سافت‌مکس (بسته تکی)',
    sku: '6292012930244',
    category: 'لوازم بهداشتی',
    image: 'https://images.unsplash.com/photo-1610557892470-76d747e29237?auto=format&fit=crop&q=80&w=250',
    baseUnit: 'دانه',
    units: {
      piece: 'دانه',
      pack: { name: 'شیرینک کوچک (۱۰ دانه)', multiplier: 10 },
      carton: { name: 'کارتن بزرگ (۱۰۰ دانه)', multiplier: 100 }
    },
    wholesalePriceUSD: 0.90,
    wholesalePriceAFN: 65.00,
    retailPriceUSD: 1.30,
    retailPriceAFN: 94.00,
    costPriceUSD: 0.60,
    costPriceAFN: 44.00,
    stockInBaseUnits: 852, // 8 Cartons, 5 Packs, 2 Pieces
    minStockInBaseUnits: 150,
    location: 'انبار عقب - طبقه ۱'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'مرکز عمده فروشی کابل',
    companyName: 'شرکت تجارتی مرکزی کابل لمتد',
    phone: '0799112233',
    city: 'کابل',
    email: 'kabul.markazi@gmail.com',
    debtUSD: 340.00,
    debtAFN: 24650.00,
    creditLimitUSD: 5000.00
  },
  {
    id: 'cust-2',
    name: 'سوپرمارکیت خراسان هرات',
    companyName: 'گروپ پرچون تجارتی خراسان',
    phone: '0700445566',
    city: 'هرات',
    email: 'khurasan_herat@yahoo.com',
    debtUSD: 0.00,
    debtAFN: 12800.00,
    creditLimitUSD: 2000.00
  },
  {
    id: 'cust-3',
    name: 'تجارت‌خانه مزار شریف',
    companyName: 'اتحادیه میوه خشک و ادویه بلخ',
    phone: '0788334455',
    city: 'مزار شریف',
    email: 'balkh.goods@gmail.com',
    debtUSD: 1200.00,
    debtAFN: 0.00,
    creditLimitUSD: 8000.00
  },
  {
    id: 'cust-4',
    name: 'مارکیت تازه ننگرهار (شینواری)',
    companyName: 'شرکت توزیع باغستان شینواری',
    phone: '0777556677',
    city: 'جلال‌آباد',
    email: 'shinwari@gmail.com',
    debtUSD: 0.00,
    debtAFN: 0.00,
    creditLimitUSD: 1500.00
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'تولیدکنندگان زعفران آریانا هرات',
    companyName: 'اتحادیه زعفران آریانا لمتد',
    phone: '0702123456',
    city: 'هرات',
    debtUSD: 850.00,
    debtAFN: 0.00
  },
  {
    id: 'supp-2',
    name: 'پرورش‌دهندگان طلای سرخ قندهار',
    companyName: 'اتحادیه تجارتی انار قندهار',
    phone: '0799876543',
    city: 'قندهار',
    debtUSD: 0.00,
    debtAFN: 45000.00
  },
  {
    id: 'supp-3',
    name: 'کوپراتیف زراعتی دره پامیر',
    companyName: 'شرکت کشمش تجارتی پامیر',
    phone: '0780246810',
    city: 'کابل',
    debtUSD: 200.00,
    debtAFN: 14000.00
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNo: 'INV-2026-0001',
    date: '2026-06-12T14:30:00-07:00',
    customerType: 'Wholesale',
    customerId: 'cust-1',
    customerName: 'مرکز عمده فروشی کابل',
    items: [
      {
        productId: 'prod-1',
        productName: 'زعفران سرخ هرات (سوپر نگین)',
        sku: '8930129302192',
        selectedUnit: 'قوطی فلزی (۲۵۰ گرام)',
        multiplier: 250,
        quantity: 10, // 2500g
        unitPriceUSD: 550.00,
        unitPriceAFN: 40000.00,
        totalUSD: 5500.00,
        totalAFN: 400000.00
      },
      {
        productId: 'prod-2',
        productName: 'آب انار سرخ قندهار',
        sku: '6291012345672',
        selectedUnit: 'کارتن کوچک (۲۴ بوتل)',
        multiplier: 24,
        quantity: 5, // 120 bottles
        unitPriceUSD: 20.40,
        unitPriceAFN: 1488.00,
        totalUSD: 102.00,
        totalAFN: 7440.00
      }
    ],
    totalUSD: 5602.00,
    totalAFN: 407440.00,
    discountUSD: 0,
    discountAFN: 0,
    finalUSD: 5602.00,
    finalAFN: 407440.00,
    paidUSD: 5262.00,
    paidAFN: 382790.00,
    paymentMethod: 'Partial',
    exchangeRate: 72.5,
    status: 'Delivered',
    deliveryAddress: 'چهارراهی پشتونستان، مارکیت عمده فروشی، زون ۳',
    deliveryCity: 'کابل',
    deliveryStatus: 'Delivered',
    deliveryDriver: 'جمیل‌خان'
  },
  {
    id: 'sale-2',
    invoiceNo: 'INV-2026-0002',
    date: '2026-06-14T09:15:00-07:00',
    customerType: 'Retail',
    customerId: 'walk-in',
    customerName: 'مشتری مستقیم (نقدی)',
    items: [
      {
        productId: 'prod-3',
        productName: 'چای سبز اعلای کابل (سبز)',
        sku: '8930129302111',
        selectedUnit: 'پاکت',
        multiplier: 1,
        quantity: 4,
        unitPriceUSD: 2.90,
        unitPriceAFN: 210.00,
        totalUSD: 11.60,
        totalAFN: 840.00
      },
      {
        productId: 'prod-4',
        productName: 'کشمش سرخ ارگانیک پامیر',
        sku: '6291012345894',
        selectedUnit: 'کیلوگرام',
        multiplier: 1,
        quantity: 3,
        unitPriceUSD: 4.80,
        unitPriceAFN: 348.00,
        totalUSD: 14.40,
        totalAFN: 1044.00
      }
    ],
    totalUSD: 26.00,
    totalAFN: 1884.00,
    discountUSD: 1.00,
    discountAFN: 72.00,
    finalUSD: 25.00,
    finalAFN: 1812.00,
    paidUSD: 25.00,
    paidAFN: 1812.00,
    paymentMethod: 'Cash',
    exchangeRate: 72.5,
    status: 'Completed'
  },
  {
    id: 'sale-3',
    invoiceNo: 'INV-2026-0003',
    date: '2026-06-15T08:30:00-07:00',
    customerType: 'Wholesale',
    customerId: 'cust-2',
    customerName: 'سوپرمارکیت خراسان هرات',
    items: [
      {
        productId: 'prod-5',
        productName: 'بادام شیرین مزار (صنف ستاربایی)',
        sku: '6291012355551',
        selectedUnit: 'صندوق (۱۰ کیلوگرام)',
        multiplier: 10,
        quantity: 2,
        unitPriceUSD: 68.00,
        unitPriceAFN: 4930.00,
        totalUSD: 136.00,
        totalAFN: 9860.00
      }
    ],
    totalUSD: 136.00,
    totalAFN: 9860.00,
    discountUSD: 0,
    discountAFN: 0,
    finalUSD: 136.00,
    finalAFN: 9860.00,
    paidUSD: 136.00,
    paidAFN: 9860.00,
    paymentMethod: 'Cash',
    exchangeRate: 72.5,
    status: 'Pending Delivery',
    deliveryAddress: 'سرک دروازه هرات، جنب خراسان بانک',
    deliveryCity: 'هرات',
    deliveryStatus: 'Pending'
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'purch-1',
    invoiceNo: 'PURCH-2026-0001',
    date: '2026-06-10T11:00:00-07:00',
    supplierId: 'supp-1',
    supplierName: 'تولیدکنندگان زعفران آریانا هرات',
    items: [
      {
        productId: 'prod-1',
        productName: 'زعفران سرخ هرات (سوپر نگین)',
        selectedUnit: 'کارتن عمده (۵ کیلوگرام)',
        multiplier: 5000,
        quantity: 2,
        costPriceUSD: 7000.00,
        costPriceAFN: 500000.00,
        totalUSD: 14000.00,
        totalAFN: 1000000.00
      }
    ],
    totalUSD: 14000.00,
    totalAFN: 1000000.00,
    paidUSD: 13150.00,
    paidAFN: 1000000.00,
    exchangeRate: 72.5,
    paymentMethod: 'Partial'
  },
  {
    id: 'purch-2',
    invoiceNo: 'PURCH-2026-0002',
    date: '2026-06-11T16:00:00-07:00',
    supplierId: 'supp-2',
    supplierName: 'پرورش‌دهندگان طلای سرخ قندهار',
    items: [
      {
        productId: 'prod-2',
        productName: 'آب انار سرخ قندهار',
        selectedUnit: 'پالت چوبی (۲۴۰ بوتل)',
        multiplier: 240,
        quantity: 3,
        costPriceUSD: 120.00,
        costPriceAFN: 8640.00,
        totalUSD: 360.00,
        totalAFN: 25920.00
      }
    ],
    totalUSD: 360.00,
    totalAFN: 25920.00,
    paidUSD: 360.00,
    paidAFN: 25920.00,
    exchangeRate: 72.5,
    paymentMethod: 'Cash'
  }
];

export const INITIAL_PAYMENTS: DebtPayment[] = [
  {
    id: 'pay-1',
    date: '2026-06-13T10:00:00-07:00',
    partnerId: 'cust-1',
    partnerType: 'Customer',
    partnerName: 'مرکز عمده فروشی کابل',
    amountUSD: 500.00,
    amountAFN: 36250.00,
    exchangeRate: 72.5,
    notes: 'وصول بخشی از بدهی معوقه بابت فروش شماره ۱'
  },
  {
    id: 'pay-2',
    date: '2026-06-14T15:30:00-07:00',
    partnerId: 'supp-1',
    partnerType: 'Supplier',
    partnerName: 'تولیدکنندگان زعفران آریانا هرات',
    amountUSD: 1000.00,
    amountAFN: 72500.00,
    exchangeRate: 72.5,
    notes: 'پرداخت بخشی از بیلانس اولیه حساب'
  }
];

export const INITIAL_APP_STATE: AppState = {
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  suppliers: INITIAL_SUPPLIERS,
  sales: INITIAL_SALES,
  purchases: INITIAL_PURCHASES,
  payments: INITIAL_PAYMENTS,
  cashRegister: { balanceUSD: 1500, balanceAFN: 105000 },
  exchangeRate: 71.5,
  inquiries: [],
  categories: [],
  expenses: []
};
