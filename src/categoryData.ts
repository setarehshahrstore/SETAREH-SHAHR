export interface CategoryVisual {
  name: string;
  dariName: string;
  description: string;
  image: string;
  gradient: string;
  badge: string;
  keywords: string[];
}

export const CATEGORY_VISUALS: CategoryVisual[] = [
  {
    name: 'مواد خوارکی',
    dariName: 'مواد خوراکی و خوارباره',
    description: 'روغن، برنج، چای، رب، شکر، مکرونی و حبوبات درجه یک',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    gradient: 'from-amber-600/80 to-slate-900/90',
    badge: 'طبیعی و تازه',
    keywords: ['خوراکی', 'خواربار', 'غذا', 'روغن', 'برنج', 'شکر', 'چای', 'مواد خوارکی']
  },
  {
    name: 'نوشیدنی‌ها',
    dariName: 'نوشیدنی‌ها و جوس‌های طبیعی',
    description: 'آب انار قندهار، آب‌میوه‌ها، نوشابه، انرژی‌زا و چای اعلا',
    image: '/drinks.jpg',
    gradient: 'from-rose-600/80 to-slate-900/90',
    badge: 'خنک و دلچسپ',
    keywords: ['نوشیدنی', 'جوس', 'آبمیوه', 'انار', 'نوشابه', 'انرژی', 'نوشیدنی‌ها']
  },
  {
    name: 'لوازم بهداشتی',
    dariName: 'لوازم بهداشتی و آرایشی',
    description: 'شامپو، صابون‌های لوکس، کرم‌ها، دستمال و مراقبت جلد',
    image: '/hygiene.jpg',
    gradient: 'from-teal-600/80 to-slate-900/90',
    badge: 'صحی و معطر',
    keywords: ['بهداشتی', 'آرایشی', 'شامپو', 'صابون', 'کرم', 'لوازم بهداشتی']
  },
  {
    name: 'مواد پاککاری',
    dariName: 'مواد شوینده و پاک‌کننده',
    description: 'پودر لباسشویی، مایع ظرفشویی، جرم‌گیر و مایع دستشویی',
    image: '/cleaning.jpg',
    gradient: 'from-cyan-600/80 to-slate-900/90',
    badge: 'درخشان و پاک',
    keywords: ['پاککاری', 'شوینده', 'پودر', 'مایع', 'تاید', 'وایتکس', 'مواد پاککاری']
  },
  {
    name: 'لوازم خانه',
    dariName: 'لوازم و ضروریات خانه',
    description: 'ظروف آشپزخانه، پلاستیک‌جات، ترموز و وسایل کاربردی منزل',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600',
    gradient: 'from-emerald-700/80 to-slate-900/90',
    badge: 'با دوام و زیبا',
    keywords: ['خانه', 'آشپزخانه', 'ظروف', 'ترموز', 'لوازم خانه']
  },
  {
    name: 'اجناس اطفال',
    dariName: 'ضروریات و مراقبت اطفال',
    description: 'پمپر، شیر خشک، شامپو کودک، بیسکویت اطفال و اسباب‌بازی',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600',
    gradient: 'from-pink-600/80 to-slate-900/90',
    badge: 'مراقبت طفل',
    keywords: ['اطفال', 'کودک', 'نوزاد', 'پمپر', 'شیر خشک', 'اجناس اطفال']
  },
  {
    name: 'میوه خشک و خسته‌باب',
    dariName: 'میوه خشک و خسته‌باب وطنی',
    description: 'بادام ستاربایی، کشمش سرخ پامیر، پسته هرات، چهارمغز و جلغوزه',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
    gradient: 'from-amber-700/80 to-slate-900/90',
    badge: 'خالص و صادراتی',
    keywords: ['میوه خشک', 'خشکبار', 'بادام', 'کشمش', 'پسته', 'خسته‌باب', 'خسته']
  },
  {
    name: 'ادویه‌جات و گیاهان',
    dariName: 'زعفران و ادویه‌جات اصیل',
    description: 'زعفران سوپر نگین هرات، هل، دارچین، زیره و مصالح دیگ',
    image: '/spices.jpg',
    gradient: 'from-red-700/80 to-slate-900/90',
    badge: 'عطر و طعم اعلا',
    keywords: ['زعفران', 'ادویه', 'گیاهان', 'مصالحه', 'دارچین', 'هل', 'ادویه‌جات']
  },
  {
    name: 'تخفیف‌های ویژه',
    dariName: 'تخفیف‌های ویژه و حراجی',
    description: 'اجناس با قیمت استثنایی و تخفیف‌های فوق‌العاده روزانه',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
    gradient: 'from-purple-700/80 to-slate-900/90',
    badge: 'فرصت طلایی',
    keywords: ['تخفیف', 'لیلام', 'حراج', 'ارزان', 'آفر']
  },
  {
    name: 'اجناس عمومی',
    dariName: 'اجناس عمومی و متفرقه',
    description: 'انواع اقلام ضروری و متنوع مصرفی با قیمت‌های عمده و پرچون',
    image: '/supermarket.jpg',
    gradient: 'from-blue-700/80 to-slate-900/90',
    badge: 'تنوع بی‌نظیر',
    keywords: ['عمومی', 'متفرقه', 'سایر', 'اجناس عمومی']
  }
];

export const getCategoryImage = (categoryName: string, fallback?: string): string => {
  if (!categoryName) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
  
  const clean = categoryName.trim().toLowerCase();
  
  const exact = CATEGORY_VISUALS.find(c => c.name.toLowerCase() === clean || c.dariName.toLowerCase() === clean);
  if (exact) return exact.image;

  const matched = CATEGORY_VISUALS.find(c => 
    c.keywords.some(k => clean.includes(k.toLowerCase())) ||
    clean.includes(c.name.toLowerCase())
  );

  if (matched) return matched.image;
  
  return fallback || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600';
};

export const getCategoryVisual = (categoryName: string): CategoryVisual => {
  const clean = (categoryName || '').trim().toLowerCase();
  const found = CATEGORY_VISUALS.find(c => 
    c.name.toLowerCase() === clean ||
    c.keywords.some(k => clean.includes(k.toLowerCase()))
  );

  if (found) return found;

  return {
    name: categoryName || 'اجناس فروشگاه',
    dariName: categoryName || 'اجناس فروشگاه',
    description: 'محصولات متنوع و با کیفیت فروشگاه ستاره شهر',
    image: getCategoryImage(categoryName),
    gradient: 'from-slate-700/80 to-slate-950/90',
    badge: 'کالای اصلی',
    keywords: []
  };
};
