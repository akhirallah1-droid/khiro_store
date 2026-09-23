import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Package, Truck, Phone, Store, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useInstallPrompt } from './InstallBanner';

export default function Navbar() {
  const { cartCount, setCartOpen, settings, categories, wholesaleMode, setWholesaleMode } = useStore();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive ? 'text-[#C9A227] bg-white/10' : 'text-stone-200 hover:text-[#C9A227] hover:bg-white/5'}`;

  return (
    <header className="sticky top-0 z-40">
      {/* announcement bar */}
      <div className="bg-[#C9A227] text-black text-center text-[13px] font-bold py-1.5 px-3">
        {settings.announcement || 'شحن لجميع المحافظات — توصيل سريع وآمن'}
      </div>
      <nav className="bg-[#0d0d0d]/95 backdrop-blur border-b border-[#C9A227]/25">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="خيرو" className="w-11 h-11 rounded-full object-cover ring-2 ring-[#C9A227]" />
              <div className="leading-tight">
                <div className="text-xl font-black text-[#C9A227]">خيرو</div>
                <div className="text-[11px] tracking-[0.25em] text-stone-400 font-semibold">KHIRO STORE</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" className={linkCls} end>الرئيسية</NavLink>
              <NavLink to="/shop" className={linkCls}>تسوق الآن</NavLink>
              <NavLink to="/wholesale" className={linkCls}>الشراء جملة</NavLink>
              <NavLink to="/track" className={linkCls}>تتبع الطلب</NavLink>
              <NavLink to="/contact" className={linkCls}>تواصل معنا</NavLink>
            </div>

            <div className="flex items-center gap-2">
              {/* retail / wholesale toggle */}
              <button
                onClick={() => setWholesaleMode(!wholesaleMode)}
                title={wholesaleMode ? 'وضع الجملة مفعّل' : 'وضع القطاعي مفعّل'}
                className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full border transition ${
                  wholesaleMode
                    ? 'bg-[#C9A227] text-black border-[#C9A227]'
                    : 'text-stone-300 border-stone-700 hover:border-[#C9A227] hover:text-[#C9A227]'
                }`}
              >
                <Package size={14} />
                {wholesaleMode ? 'جملة' : 'قطاعي'}
              </button>
              <Link to="/shop" className="p-2.5 rounded-full text-stone-300 hover:text-[#C9A227] hover:bg-white/5" title="بحث">
                <Search size={19} />
              </Link>
              {/* Install app button — mobile & desktop */}
              {!isInstalled && (
                <button
                  onClick={() => promptInstall()}
                  className={`${canInstall ? 'text-[#C9A227]' : 'text-stone-500'} p-2.5 rounded-full hover:bg-white/5 transition`}
                  title={canInstall ? 'حمّل تطبيق خيرو على جهازك' : 'لتثبيت التطبيق: من قائمة المتصفح اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"'}
                >
                  {canInstall ? <Download size={20} /> : <Download size={20} className="opacity-60" />}
                </button>
              )}
              {isInstalled && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2" title="تطبيق خيرو مثبّت على جهازك">
                  <Check size={14} /> مثبّت
                </span>
              )}
              <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-full text-stone-200 hover:text-[#C9A227] hover:bg-white/5" title="سلة المشتريات">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 min-w-[20px] h-5 px-1 rounded-full bg-[#C9A227] text-black text-[11px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-full text-stone-200 hover:bg-white/5">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-white/10 bg-[#0d0d0d] px-4 py-3 space-y-1">
            <NavLink to="/" end onClick={() => setOpen(false)} className={linkCls}>الرئيسية</NavLink>
            <NavLink to="/shop" onClick={() => setOpen(false)} className={linkCls}>تسوق الآن</NavLink>
            <NavLink to="/wholesale" onClick={() => setOpen(false)} className={linkCls}>الشراء جملة بالدستة</NavLink>
            <NavLink to="/track" onClick={() => setOpen(false)} className={linkCls}>تتبع الطلب</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={linkCls}>تواصل معنا</NavLink>
            <button
              onClick={() => { setWholesaleMode(!wholesaleMode); setOpen(false); }}
              className="w-full text-right px-3 py-2 rounded-lg text-sm font-semibold text-stone-200 hover:bg-white/5 flex items-center gap-2"
            >
              <Store size={16} className="text-[#C9A227]" />
              التبديل إلى وضع {wholesaleMode ? 'القطاعي' : 'الجملة'}
            </button>
            {categories.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-stone-500 font-bold px-3 py-1 flex items-center gap-1"><Truck size={12} /> الأقسام</div>
                {categories.map((c) => (
                  <Link key={c.id} to={`/shop?cat=${c.id}`} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-stone-300 hover:bg-white/5">
                    {c.name_ar}
                  </Link>
                ))}
              </div>
            )}
            <a href={`tel:${settings.store_phone || '+201090209654'}`} className="flex items-center gap-2 px-3 py-2 text-sm text-[#C9A227] font-bold">
              <Phone size={15} /> {settings.store_phone || '+201090209654'}
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
