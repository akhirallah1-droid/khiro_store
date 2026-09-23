import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore, type Product } from '../context/StoreContext';
import { egp } from '../lib/format';

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, settings, wholesaleMode } = useStore();
  const currency = settings.currency || 'ج.م';
  const showWholesale = wholesaleMode && product.wholesale_price;
  const price = showWholesale ? Number(product.wholesale_price) : Number(product.price);
  const discount = product.old_price ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100) : 0;
  const out = Number(product.stock) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.06 }}
      className="group bg-[#141414] rounded-2xl overflow-hidden border border-white/10 hover:border-[#C9A227]/60 transition-all hover:shadow-[0_10px_40px_-10px_rgba(201,162,39,0.35)]"
    >
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square">
        <img
          src={product.image_url || '/images/p1.jpg'}
          alt={product.name_ar}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
          {product.badge_ar && (
            <span className="bg-[#C9A227] text-black text-[11px] font-black px-2.5 py-1 rounded-full">{product.badge_ar}</span>
          )}
          {discount > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full">خصم {discount}%</span>
          )}
          {showWholesale && (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <Package size={11} /> سعر الجملة
            </span>
          )}
        </div>
        {out && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-black bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm">نفد المخزون</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="text-[11px] text-stone-500 font-semibold mb-1">{product.k_categories?.name_ar || ''}</div>
        <Link to={`/product/${product.id}`} className="font-black text-white leading-snug line-clamp-2 hover:text-[#C9A227] transition min-h-[44px] block">
          {product.name_ar}
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center gap-0.5 text-[#C9A227]">
            <Star size={13} fill="currentColor" />
            <span className="text-xs font-bold">{Number(product.rating_avg || 0).toFixed(1)}</span>
          </div>
          <span className="text-[11px] text-stone-500">({product.rating_count || 0} تقييم)</span>
          {Number(product.sold_count || 0) > 0 && <span className="text-[11px] text-stone-500">• بيع {product.sold_count}</span>}
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <div className="text-lg font-black text-[#C9A227]">{egp(price, currency)}</div>
            {product.old_price && !showWholesale && (
              <div className="text-xs text-stone-500 line-through">{egp(product.old_price, currency)}</div>
            )}
            {showWholesale && (
              <div className="text-[11px] text-stone-500">للقطعة عند شراء {product.min_wholesale_qty || 12}+</div>
            )}
          </div>
        </div>
        <button
          disabled={out}
          onClick={() => addToCart(product, 1, !!showWholesale)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm py-2.5 rounded-xl transition"
        >
          <ShoppingBag size={16} />
          {out ? 'غير متوفر' : 'أضف للسلة'}
        </button>
      </div>
    </motion.div>
  );
}
