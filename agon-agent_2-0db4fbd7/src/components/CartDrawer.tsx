import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { egp } from '../lib/format';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart, cartSubtotal, settings } = useStore();
  const currency = settings.currency || 'ج.م';

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 bottom-0 left-0 w-full max-w-sm bg-[#111] border-r border-[#C9A227]/30 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-black text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#C9A227]" /> سلة المشتريات ({cart.reduce((s, c) => s + c.qty, 0)})
              </h3>
              <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-stone-300">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 && (
                <div className="text-center py-16 text-stone-500">
                  <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-bold">سلتك فارغة</p>
                  <p className="text-sm mt-1">تصفح منتجاتنا وأضف ما يعجبك</p>
                </div>
              )}
              {cart.map((c) => {
                const unit = c.wholesale && c.product.wholesale_price ? Number(c.product.wholesale_price) : Number(c.product.price);
                return (
                  <div key={`${c.product.id}-${c.wholesale}`} className="flex gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <img src={c.product.image_url || '/images/p1.jpg'} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{c.product.name_ar}</div>
                      {c.wholesale && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full mt-1">
                          <Package size={10} /> بسعر الجملة
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                          <button onClick={() => updateQty(c.product.id, c.wholesale, c.qty + 1)} className="p-1 text-stone-300 hover:text-[#C9A227]"><Plus size={14} /></button>
                          <span className="text-sm font-black text-white w-7 text-center">{c.qty}</span>
                          <button onClick={() => updateQty(c.product.id, c.wholesale, c.qty - 1)} className="p-1 text-stone-300 hover:text-[#C9A227]"><Minus size={14} /></button>
                        </div>
                        <div className="text-sm font-black text-[#C9A227]">{egp(unit * c.qty, currency)}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(c.product.id, c.wholesale)} className="self-start p-1.5 text-stone-500 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400">المجموع الفرعي</span>
                  <span className="font-black text-white text-lg">{egp(cartSubtotal, currency)}</span>
                </div>
                <p className="text-[11px] text-stone-500">الشحن والخصومات تُحسب عند إتمام الطلب</p>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="block text-center bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black py-3 rounded-xl transition"
                >
                  إتمام الطلب
                </Link>
                <button onClick={() => setCartOpen(false)} className="w-full text-center text-sm text-stone-400 hover:text-white py-1">
                  مواصلة التسوق
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
