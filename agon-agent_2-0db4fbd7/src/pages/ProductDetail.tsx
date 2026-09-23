import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Minus, Plus, Package, Truck, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';
import { useStore, type Product } from '../context/StoreContext';
import { api } from '../lib/api';
import { egp, fmtDate } from '../lib/format';
import ProductCard from '../components/ProductCard';

interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { products, addToCart, settings, wholesaleMode } = useStore();
  const currency = settings.currency || 'ج.م';
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [asWholesale, setAsWholesale] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revMsg, setRevMsg] = useState('');

  useEffect(() => {
    const p = products.find((x) => String(x.id) === String(id)) || null;
    setProduct(p);
    setQty(1);
    setAsWholesale(wholesaleMode && !!(p && p.wholesale_price));
    if (p) setRelated(products.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4));
    if (id) {
      api.get(`/api/reviews?product_id=${id}`).then((d) => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
    }
    window.scrollTo(0, 0);
  }, [id, products, wholesaleMode]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400">
        <div className="animate-pulse">جاري تحميل المنتج...</div>
        <Link to="/shop" className="text-[#C9A227] font-bold text-sm mt-4 inline-block">العودة للمتجر</Link>
      </div>
    );
  }

  const unit = asWholesale && product.wholesale_price ? Number(product.wholesale_price) : Number(product.price);
  const out = Number(product.stock) <= 0;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevMsg('');
    if (revName.trim().length < 2) { setRevMsg('من فضلك أدخل الاسم'); return; }
    try {
      await api.post('/api/reviews', { product_id: product.id, customer_name: revName.trim(), rating: revRating, comment: revComment.trim() });
      setRevMsg('شكراً! تم إرسال تقييمك وسيظهر بعد مراجعة الإدارة.');
      setRevName(''); setRevComment(''); setRevRating(5);
    } catch (err: any) {
      setRevMsg(err.message || 'حدث خطأ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-[#C9A227]">الرئيسية</Link> / <Link to="/shop" className="hover:text-[#C9A227]">المتجر</Link> / <span className="text-stone-300">{product.name_ar}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#141414]">
            <img src={product.image_url || '/images/p1.jpg'} alt={product.name_ar} className="w-full aspect-square object-cover" />
          </div>
        </div>

        <div>
          {product.badge_ar && <span className="bg-[#C9A227] text-black text-xs font-black px-3 py-1 rounded-full">{product.badge_ar}</span>}
          <h1 className="text-2xl md:text-3xl font-black text-white mt-3">{product.name_ar}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <div className="flex items-center gap-1 text-[#C9A227]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill={s <= Math.round(Number(product.rating_avg || 0)) ? 'currentColor' : 'none'} className={s <= Math.round(Number(product.rating_avg || 0)) ? '' : 'text-stone-600'} />
              ))}
            </div>
            <span className="text-stone-400">{Number(product.rating_avg || 0).toFixed(1)} ({product.rating_count || 0} تقييم)</span>
            {Number(product.sold_count || 0) > 0 && <span className="text-stone-500">• بيع {product.sold_count}</span>}
          </div>

          <div className="flex items-end gap-3 mt-4">
            <div className="text-3xl font-black text-[#C9A227]">{egp(unit, currency)}</div>
            {!asWholesale && product.old_price && <div className="text-stone-500 line-through mb-1">{egp(product.old_price, currency)}</div>}
          </div>
          {product.wholesale_price && (
            <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-emerald-400 font-black">سعر الجملة: {egp(product.wholesale_price, currency)}</span>
                <span className="text-stone-400 text-xs"> / للقطعة عند شراء {product.min_wholesale_qty || 12} قطعة فأكثر</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer shrink-0">
                <input type="checkbox" checked={asWholesale} onChange={(e) => setAsWholesale(e.target.checked)} className="w-4 h-4 accent-[#C9A227]" />
                شراء جملة
              </label>
            </div>
          )}

          <p className="text-stone-300 text-sm leading-relaxed mt-4">{product.description_ar}</p>

          <div className="flex items-center gap-2 mt-4 text-sm">
            {Number(product.stock) > 0 ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><CheckCircle2 size={16} /> متوفر — {product.stock} قطعة بالمخزون</span>
            ) : (
              <span className="text-red-400 font-bold">نفد المخزون حالياً</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-xl p-1.5">
              <button onClick={() => setQty(Math.min(500, qty + 1))} className="p-2 text-stone-300 hover:text-[#C9A227]"><Plus size={16} /></button>
              <span className="font-black text-white w-10 text-center">{qty}</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 text-stone-300 hover:text-[#C9A227]"><Minus size={16} /></button>
            </div>
            <button
              disabled={out}
              onClick={() => addToCart(product, qty, asWholesale)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-40 text-black font-black py-3.5 rounded-xl transition"
            >
              <ShoppingBag size={18} /> أضف للسلة — {egp(unit * qty, currency)}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 text-center">
            <div className="bg-white/5 rounded-xl p-3"><Truck size={18} className="mx-auto text-[#C9A227] mb-1" /><div className="text-[11px] text-stone-300 font-bold">شحن لكل المحافظات</div></div>
            <div className="bg-white/5 rounded-xl p-3"><ShieldCheck size={18} className="mx-auto text-[#C9A227] mb-1" /><div className="text-[11px] text-stone-300 font-bold">تسوق بثقة وأمان</div></div>
            <div className="bg-white/5 rounded-xl p-3"><Package size={18} className="mx-auto text-[#C9A227] mb-1" /><div className="text-[11px] text-stone-300 font-bold">استبدال خلال 14 يوم</div></div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-14 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2"><MessageCircle size={20} className="text-[#C9A227]" /> آراء العملاء ({reviews.length})</h2>
          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-stone-500 text-sm">لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج</p>}
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#141414] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{r.customer_name}</span>
                  <span className="text-[11px] text-stone-500">{fmtDate(r.created_at)}</span>
                </div>
                <div className="flex gap-0.5 text-[#C9A227] mt-1">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} fill={s <= r.rating ? 'currentColor' : 'none'} className={s <= r.rating ? '' : 'text-stone-700'} />)}
                </div>
                {r.comment && <p className="text-sm text-stone-300 mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-white mb-4">أضف تقييمك</h2>
          <form onSubmit={submitReview} className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-3">
            <input value={revName} onChange={(e) => setRevName(e.target.value)} placeholder="اسمك" className="w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-2.5 px-4 text-white text-sm outline-none" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400">تقييمك:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setRevRating(s)} className={s <= revRating ? 'text-[#C9A227]' : 'text-stone-600'}>
                    <Star size={22} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>
            <textarea value={revComment} onChange={(e) => setRevComment(e.target.value)} placeholder="شاركنا رأيك في المنتج (اختياري)" rows={3} className="w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-2.5 px-4 text-white text-sm outline-none resize-none" />
            {revMsg && <p className="text-xs text-emerald-400 font-bold">{revMsg}</p>}
            <button className="bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-6 py-2.5 rounded-xl transition">إرسال التقييم</button>
          </form>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-black text-white mb-5">قد يعجبك أيضاً</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
