import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, Package, Ticket } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { egp } from '../lib/format';

export default function Checkout() {
  const { cart, updateQty, removeFromCart, clearCart, cartSubtotal, settings } = useStore();
  const currency = settings.currency || 'ج.م';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gov, setGov] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [couponInfo, setCouponInfo] = useState<any>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<any>(null);
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  useEffect(() => {
    api.get('/api/shipping_rates?active=1').then((d) => setRates(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const isWholesale = cart.some((c) => c.wholesale);
  const rate = rates.find((r) => r.governorate === gov);
  let shipping = rate ? Number(rate.fee) : Number(settings.default_shipping_fee || 60);
  const freeThreshold = Number(settings.free_shipping_threshold || 0);
  if (freeThreshold > 0 && cartSubtotal >= freeThreshold) shipping = 0;
  const codFee = payment === 'cod' ? Number(settings.cod_fee || 0) : 0;

  let discount = 0;
  if (couponInfo) {
    discount = couponInfo.type === 'percent' ? (cartSubtotal * Number(couponInfo.value)) / 100 : Number(couponInfo.value);
    if (couponInfo.max_discount) discount = Math.min(discount, Number(couponInfo.max_discount));
    discount = Math.min(Math.round(discount * 100) / 100, cartSubtotal);
  }
  const total = Math.round((cartSubtotal - discount + shipping + codFee) * 100) / 100;

  const applyCoupon = async () => {
    setCouponMsg(''); setCouponInfo(null);
    if (!coupon.trim()) return;
    try {
      const list = await api.get(`/api/coupons?code=${coupon.trim().toUpperCase()}`);
      const cp = Array.isArray(list) ? list[0] : null;
      if (!cp || !cp.is_active) { setCouponMsg('كود الخصم غير صالح'); return; }
      if (cp.expires_at && new Date(cp.expires_at) < new Date()) { setCouponMsg('انتهت صلاحية هذا الكود'); return; }
      if (cp.usage_limit && Number(cp.used_count) >= Number(cp.usage_limit)) { setCouponMsg('تم استنفاد استخدامات هذا الكود'); return; }
      if (cartSubtotal < Number(cp.min_order || 0)) { setCouponMsg(`يتطلب حد أدنى للطلب ${egp(cp.min_order, currency)}`); return; }
      setCouponInfo(cp);
      setCouponMsg(`تم تطبيق الخصم: ${cp.type === 'percent' ? `${cp.value}%` : egp(cp.value, currency)}`);
    } catch {
      setCouponMsg('كود الخصم غير صالح');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cart.length) { setError('السلة فارغة'); return; }
    if (name.trim().length < 3) { setError('من فضلك أدخل الاسم بالكامل'); return; }
    if (!/^01[0-9]{9}$/.test(phone.replace(/\s/g, ''))) { setError('رقم الموبايل غير صحيح — يجب أن يبدأ بـ 01 ويتكون من 11 رقم'); return; }
    if (!gov) { setError('من فضلك اختر المحافظة'); return; }
    if (address.trim().length < 5) { setError('من فضلك أدخل العنوان بالتفصيل'); return; }
    if (payment === 'cod' && !acceptPolicy) { setError('يجب الموافقة على سياسة الدفع عند الاستلام أولاً'); return; }
    setLoading(true);
    try {
      const order = await api.post('/api/orders', {
        customer_name: name.trim(), phone: phone.trim(), governorate: gov,
        address: address.trim(), notes: notes.trim(), payment_method: payment,
        coupon_code: couponInfo ? couponInfo.code : null, is_wholesale: isWholesale,
        items: cart.map((c) => ({ product_id: c.product.id, qty: c.qty })),
      });
      setDone(order);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تأكيد الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#141414] border border-emerald-500/40 rounded-3xl p-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white">تم تأكيد طلبك بنجاح!</h1>
          <p className="text-stone-400 text-sm mt-2">شكراً لثقتك في متجر خيرو — سنتواصل معك قريباً لتأكيد الطلب</p>
          <div className="bg-black/40 rounded-2xl p-5 mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone-400">رقم الطلب</span><span className="font-black text-[#C9A227] text-lg" dir="ltr">{done.order_code}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">الإجمالي المستحق</span><span className="font-black text-white">{egp(done.total, currency)}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">طريقة الدفع</span><span className="font-bold text-white">{payment === 'cod' ? 'الدفع عند الاستلام' : payment}</span></div>
          </div>
          <p className="text-xs text-stone-500 mt-4">احتفظ برقم الطلب لتتبع حالته من صفحة تتبع الطلب</p>
          <div className="flex gap-3 mt-6 justify-center">
            <Link to={`/track?code=${done.order_code}`} className="bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black px-6 py-3 rounded-xl text-sm transition">تتبع طلبك</Link>
            <Link to="/shop" className="border border-white/15 text-white font-black px-6 py-3 rounded-xl text-sm hover:border-[#C9A227] transition">مواصلة التسوق</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-1">إتمام الطلب</h1>
      <p className="text-stone-400 text-sm mb-6">أدخل بيانات التوصيل وراجع طلبك قبل التأكيد</p>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/10">
          <ShoppingBag size={48} className="mx-auto text-stone-600 mb-3" />
          <p className="text-stone-400 font-bold">سلتك فارغة</p>
          <Link to="/shop" className="inline-flex items-center gap-2 text-[#C9A227] font-bold text-sm mt-3">تصفح المنتجات <ArrowLeft size={15} /></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* form */}
          <form onSubmit={submit} className="lg:col-span-2 bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-black text-white mb-4">بيانات التوصيل</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">الاسم بالكامل *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: مريم أحمد" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">رقم الموبايل *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none text-left" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">المحافظة *</label>
                  <select value={gov} onChange={(e) => setGov(e.target.value)} className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none">
                    <option value="">اختر المحافظة</option>
                    {rates.map((r) => (
                      <option key={r.id} value={r.governorate}>{r.governorate} — شحن {egp(r.fee, currency)} ({r.delivery_days_ar})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">العنوان بالتفصيل *</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="شارع، علامة مميزة، رقم العمارة..." className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold text-stone-400">ملاحظات للطلب (اختياري)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="أي تفاصيل إضافية عن الطلب أو موعد التوصيل..." className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none resize-none" />
              </div>
            </div>

            <div>
              <h2 className="font-black text-white mb-3">طريقة الدفع</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: 'cod', t: 'الدفع عند الاستلام', d: `ادفع نقداً عند وصول المندوب${codFee ? ` (+${egp(codFee, currency)} رسوم)` : ''}` },
                  { v: 'vodafone_cash', t: 'فودافون كاش', d: 'تحويل على رقم المتجر وسيتم التواصل للتأكيد' },
                  { v: 'instapay', t: 'انستاباي', d: 'تحويل فوري وسيتم التواصل للتأكيد' },
                  { v: 'bank', t: 'تحويل بنكي', d: 'سيتم إرسال بيانات الحساب بعد تأكيد الطلب' },
                ].map((m) => (
                  <label key={m.v} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${payment === m.v ? 'border-[#C9A227] bg-[#C9A227]/10' : 'border-white/10 hover:border-white/25'}`}>
                    <input type="radio" name="pay" checked={payment === m.v} onChange={() => setPayment(m.v)} className="mt-1 accent-[#C9A227]" />
                    <span>
                      <span className="block font-black text-white text-sm">{m.t}</span>
                      <span className="block text-xs text-stone-400 mt-0.5">{m.d}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* COD policy — shown ONLY here at checkout, never on homepage */}
            {payment === 'cod' && (
              <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
                <h3 className="font-black text-amber-300 text-sm mb-2">سياسة الدفع عند الاستلام — يرجى القراءة بعناية</h3>
                <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-line">{settings.cod_policy || ''}</div>
                <label className="flex items-start gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={acceptPolicy} onChange={(e) => setAcceptPolicy(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#C9A227]" />
                  <span className="text-xs font-bold text-white">قرأت سياسة الدفع عند الاستلام وأوافق عليها</span>
                </label>
              </div>
            )}

            {error && <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>}

            <button disabled={loading} className="w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-4 rounded-xl transition text-lg">
              {loading ? 'جاري تأكيد الطلب...' : `تأكيد الطلب — ${egp(total, currency)}`}
            </button>
          </form>

          {/* summary */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 h-fit lg:sticky lg:top-32">
            <h2 className="font-black text-white mb-4">ملخص الطلب ({cart.reduce((s, c) => s + c.qty, 0)} قطعة)</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map((c) => {
                const unit = c.wholesale && c.product.wholesale_price ? Number(c.product.wholesale_price) : Number(c.product.price);
                return (
                  <div key={`${c.product.id}-${c.wholesale}`} className="flex gap-3 items-center">
                    <img src={c.product.image_url || '/images/p1.jpg'} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{c.product.name_ar}</div>
                      {c.wholesale && <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-black"><Package size={10} /> جملة</span>}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(c.product.id, c.wholesale, c.qty - 1)} className="text-stone-400 hover:text-white"><Minus size={13} /></button>
                        <span className="text-xs font-black text-white">{c.qty}</span>
                        <button onClick={() => updateQty(c.product.id, c.wholesale, c.qty + 1)} className="text-stone-400 hover:text-white"><Plus size={13} /></button>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-[#C9A227]">{egp(unit * c.qty, currency)}</div>
                      <button onClick={() => removeFromCart(c.product.id, c.wholesale)} className="text-stone-500 hover:text-red-400 mt-1"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-sm">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ticket size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="كود الخصم" className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-9 pl-3 text-white text-xs font-bold outline-none" />
                </div>
                <button onClick={applyCoupon} className="bg-white/10 hover:bg-white/15 text-white text-xs font-black px-4 rounded-xl">تطبيق</button>
              </div>
              {couponMsg && <p className={`text-[11px] font-bold ${couponInfo ? 'text-emerald-400' : 'text-red-400'}`}>{couponMsg}</p>}
              <div className="flex justify-between"><span className="text-stone-400">المجموع الفرعي</span><span className="text-white font-bold">{egp(cartSubtotal, currency)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-emerald-400">الخصم ({couponInfo?.code})</span><span className="text-emerald-400 font-bold">-{egp(discount, currency)}</span></div>}
              <div className="flex justify-between"><span className="text-stone-400">الشحن {gov ? `(${gov})` : ''}</span><span className="text-white font-bold">{shipping === 0 ? <span className="text-emerald-400">مجاني</span> : egp(shipping, currency)}</span></div>
              {codFee > 0 && <div className="flex justify-between"><span className="text-stone-400">رسوم الدفع عند الاستلام</span><span className="text-white font-bold">{egp(codFee, currency)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-white/10 text-base"><span className="font-black text-white">الإجمالي</span><span className="font-black text-[#C9A227] text-xl">{egp(total, currency)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
