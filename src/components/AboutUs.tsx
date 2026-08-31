import React from 'react';
import { 
  Building2, ShieldCheck, Award, Users, Truck, HeartHandshake, 
  MapPin, Phone, Mail, CheckCircle2, Sparkles, Target, Eye, 
  Clock, Store, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-[#0B1F3A] via-[#0E284D] to-[#0B1F3A] text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-amber-400/30 rounded-full text-xs sm:text-sm font-bold text-amber-300 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>پیشرو در توزیع و واردات مواد غذایی و مصرفی</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              درباره <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#F5D76E] via-[#D4AF37] to-amber-200">فروشگاه ستاره شهر</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              تأمین‌کننده معتبر و دست‌اول انواع مواد غذایی، لبنیات، نوشیدنی‌ها، شوینده‌ها و ضروریات خانواده و دکان‌ها در افغانستان با تعهد به اصالت کالا، نازل‌ترین نرخ عمده و تسهیل روند خرید برای همگان.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Intro Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-20">
          
          <div className="lg:col-span-6 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <Store className="w-4 h-4 text-amber-600" />
              <span>داستان شکل‌گیری و هدف ما</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] leading-snug">
              پل ارتباطی مستقیم میان واردکنندگان دست‌اول و مشتریان
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              فروشگاه و انبار مرکزی **ستاره شهر** با هدف حذف واسطه‌های غیرضروری و کاهش هزینه‌های سبد مصرفی خانواده‌ها و دکانداران محترم در شهر مزار شریف و سایر ولایات تأسیس گردید.
            </p>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              ما باور داریم دسترسی به اقلام باکیفیت و دارای تاریخ مصرف معتبر، حق مسلم هر خانواده است. از همین رو، با تجهیز انبار استاندارد و سامانه هوشمند تصویری، این امکان را فراهم ساخته‌ایم تا تمام اقشار جامعه، حتی بدون نیاز به خواندن متن و تنها با دیدن عکس‌های واقعی اجناس، بتوانند خریدی شفاف و آسان را تجربه نمایند.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono block mb-1">۱۰۰٪</span>
                <span className="text-xs font-bold text-slate-700">تضمین اصالت و تاریخ کالا</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block mb-1">۲۴/۷</span>
                <span className="text-xs font-bold text-slate-700">پشتیبانی و ثبت سفارش آنلاین</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-emerald-400/20 rounded-3xl blur-2xl transform rotate-2"></div>
              <div className="relative bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B1F3A] p-2 flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="ستاره شهر" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">مرکز توزیع ستاره شهر</h3>
                    <p className="text-xs text-slate-500">عمده‌فروشی و پرچون‌فروشی مواد مصرفی</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">نرخ‌گذاری منصفانه و رقابتی</h4>
                      <p className="text-xs text-slate-500 mt-0.5">توزیع به نرخ عمده وارداتی برای فروشگاه‌ها و پایین‌ترین نرخ بازار برای پرچون‌فروشی</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">ارسال امن و سریع</h4>
                      <p className="text-xs text-slate-500 mt-0.5">تحویل باربری برای ولایات و پیک سریع برای سراسر شهر</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">تسهیلات ویژه برای مشتریان دایمی</h4>
                      <p className="text-xs text-slate-500 mt-0.5">امکان خرید اعتباری، فاکتور رسمی و پیگیری لحظه‌ای سفارش‌ها</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all text-right space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">ماموریت ما</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              تأمین پایدار و باکیفیت ضروریات روزمره مردم با مناسب‌ترین قیمت، ارتقای شفافیت در سیستم خرید و توزیع کالاهای بهداشتی و خوراکی در بالاترین استانداردهای سلامت.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all text-right space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">چشم‌انداز ما</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              تبدیل شدن به بزرگترین و قابل‌اعتمادترین بستر مدرن توزیع مواد غذایی و کالاهای مصرفی در شمال و سراسر افغانستان با بهره‌گیری از فناوری‌های نوین و آسان.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all text-right space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">ارزش‌های محوری</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              صداقت در معامله، احترام به وقت و سرمایه مشتری، شفافیت قیمت‌ها، نظارت دقیق بر تاریخ انقضا و سلامت اجناس، و مشتری‌مداری در تمام مراحل.
            </p>
          </div>

        </div>

        {/* Why Choose Us */}
        <div className="bg-[#0B1F3A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">چرا ستاره شهر انتخاب اول خریداران است؟</h2>
            <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-3"></div>
            <p className="text-slate-300 text-sm">ویژگی‌هایی که ما را در خدمت‌رسانی به شما متمایز می‌سازد</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <Truck className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">سیستم باربری مطمئن</h4>
              <p className="text-xs text-slate-300">ارسال به تمام نقاط با بسته‌بندی محکم و بدون خسارت</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <Building2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">انبارداری استاندارد</h4>
              <p className="text-xs text-slate-300">محیط پاکیزه، خنک و بهداشتی برای حفظ طراوت اجناس</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">مشاوره تخصصی عمده</h4>
              <p className="text-xs text-slate-300">راهنمایی دکانداران تازه‌کار برای انتخاب اقلام پرفروش</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base mb-1">پاسخگویی سریع</h4>
              <p className="text-xs text-slate-300">پیگیری تلفنی و واتساپی در کوتاه‌ترین زمان ممکن</p>
            </div>
          </div>

          <div className="mt-12 text-center relative z-10">
            <Link
              to="/#products-section"
              className="inline-flex items-center gap-2 bg-gradient-to-l from-[#D4AF37] to-[#F5D76E] text-[#0B1F3A] px-8 py-4 rounded-2xl font-black text-sm hover:shadow-lg transition-all active:scale-95"
            >
              <span>مشاهده محصولات و شروع خرید</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </section>

    </div>
  );
};
