import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Truck, ShieldCheck, Star, Sparkles, BadgePercent, PhoneCall } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

function SectionTitle({ title, sub, link, linkText }: { title: string; sub?: string; link?: string; linkText?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
        {sub && <p className="text-stone-400 text-sm mt-1">{sub}</p>}
        <div className="w-16 h-1 bg-[#C9A227] rounded-full mt-3" />
      </div>
      {link && (
        <Link to={link} className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#C9A227] hover:gap-2 transition-all">
          {linkText || 'عرض الكل'} <ArrowLeft size={16} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { products, productsLoading, categories, settings } = useStore();
  const featured = products.filter((p) => p.is_featured).slice(0, 8);
  const newest = products.filter((p) => p.is_new).slice(0, 4);
  const showcase = featured.length ? featured : products.slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero.jpg" alt="خيرو" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl mx-auto text-center">
            <motion.img
              src="/logo.png"
              alt="KHIRO STORE — خيرو"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="w-28 h-28 md:w-40 md:h-40 mx-auto rounded-full object-cover ring-4 ring-[#C9A227]/80 shadow-[0_0_60px_-10px_rgba(201,162,39,0.7)]"
            />
            <div className="mt-4 select-none" dir="ltr">
              <div className="text-4xl md:text-6xl font-black tracking-[0.18em] bg-gradient-to-b from-[#F7ECC8] via-[#C9A227] to-[#8A6D1B] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(201,162,39,0.45)]">
                KHIRO
              </div>
              <div className="text-xl md:text-3xl font-black tracking-[0.55em] bg-gradient-to-b from-[#F7ECC8] via-[#C9A227] to-[#8A6D1B] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(201,162,39,0.45)] mt-1">
                STORE
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#C9A227] text-xs font-black px-4 py-1.5 rounded-full mb-5 mt-6">
              <Sparkles size={14} /> تشكيلة 2026 وصلت حديثاً
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              {settings.hero_title || 'خيرو — أناقة لكل العائلة'}
            </h1>
            <p className="text-stone-300 mt-4 text-base md:text-lg leading-relaxed">
              {settings.hero_subtitle || 'ملابس نسائية ورجالي وأطفال، تحف منزلية وهدايا مختارة بعناية'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black px-7 py-3.5 rounded-xl transition shadow-[0_10px_30px_-8px_rgba(201,162,39,0.6)]">
                تسوق الآن <ArrowLeft size={18} />
              </Link>
              <Link to="/wholesale" className="inline-flex items-center gap-2 border border-[#C9A227]/60 text-[#C9A227] hover:bg-[#C9A227]/10 font-black px-7 py-3.5 rounded-xl transition">
                <Package size={18} /> الشراء جملة بالدستة
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
              <div className="flex items-center gap-2 text-stone-300"><Truck size={18} className="text-[#C9A227]" /> شحن لجميع المحافظات</div>
              <div className="flex items-center gap-2 text-stone-300"><ShieldCheck size={18} className="text-[#C9A227]" /> تسوق آمن 100%</div>
              <div className="flex items-center gap-2 text-stone-300"><Star size={18} className="text-[#C9A227]" /> +1500 عميل سعيد</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <SectionTitle title="تسوق حسب القسم" sub="اختر القسم المناسب لذوقك" link="/shop" linkText="كل المنتجات" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={`/shop?cat=${c.id}`} className="group block relative rounded-2xl overflow-hidden aspect-[4/5] border border-white/10 hover:border-[#C9A227]/60 transition">
                <img src={c.image_url || '/images/p1.jpg'} alt={c.name_ar} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-4">
                  <div className="text-white font-black">{c.name_ar}</div>
                  <div className="text-[#C9A227] text-xs font-bold mt-1 flex items-center gap-1">تسوق الآن <ArrowLeft size={12} /></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-[#111] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <SectionTitle title="منتجات مميزة" sub="الأكثر طلباً من عملاء خيرو" link="/shop" linkText="كل المنتجات" />
          {productsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#181818] rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {showcase.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* WHOLESALE BANNER */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="relative rounded-3xl overflow-hidden border border-[#C9A227]/30">
          <img src="/images/wholesale.jpg" alt="جملة" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black via-black/85 to-black/50" />
          <div className="relative p-8 md:p-14 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full mb-4">
              <BadgePercent size={14} /> أسعار خاصة للتجار وأصحاب المحلات
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">اشترِ جملة بالدستة ووفّر أكتر</h2>
            <p className="text-stone-300 mt-3 leading-relaxed">
              الدستة = 12 قطعة من نفس الموديل بسعر الجملة المخفض. اختر عدد الدست المطلوبة واحسب إجمالي طلبك فوراً — مثالي لأصحاب المحلات والصفحات.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-stone-300">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> خصم يصل إلى 25% عن سعر القطاعي</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> حاسبة دستة تفاعلية لحساب السعر فوراً</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> أولوية في الشحن والتوصيل للتجار</li>
            </ul>
            <Link to="/wholesale" className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black px-7 py-3 rounded-xl transition mt-7">
              <Package size={18} /> اطلب عرض الجملة
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-14">
          <SectionTitle title="وصل حديثاً" sub="أحدث الموديلات في متجر خيرو" link="/shop" linkText="كل المنتجات" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {newest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* TRUST STRIP (no payment policy details — policies show only at checkout) */}
      <section className="bg-[#111] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, t: 'شحن سريع', d: 'لجميع محافظات مصر' },
            { icon: ShieldCheck, t: 'تسوق بثقة', d: 'جودة مضمونة' },
            { icon: Package, t: 'جملة وقطاعي', d: 'أسعار خاصة للتجار' },
            { icon: PhoneCall, t: 'دعم متواصل', d: 'رد سريع على واتساب' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
                <f.icon size={22} className="text-[#C9A227]" />
              </div>
              <div>
                <div className="font-black text-white text-sm">{f.t}</div>
                <div className="text-xs text-stone-400">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
