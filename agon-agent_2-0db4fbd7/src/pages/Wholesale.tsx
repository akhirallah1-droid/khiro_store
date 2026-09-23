import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Package, Minus, Plus, CheckCircle2, Truck, BadgePercent, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api, isValidEgyptPhone } from '../lib/api';
import { egp } from '../lib/format';

export default function Wholesale() {
  const { products, settings, addToCart } = useStore();
  const currency = settings.currency || 'ج.م';
  const navigate = useNavigate();
  const wholesaleProducts = useMemo(() => products.filter((p) => p.wholesale_price), [products]);

  const [pid, setPid] = useState<number | ''>('');
  const [dozens, setDozens] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wholesaleProducts.length && pid === '') setPid(wholesaleProducts[0].id);
  }, [wholesaleProducts, pid]);

  const selected = wholesaleProducts.find((p) => p.id === pid);
  const pieces = dozens * 12;
  const unit = selected ? Number(selected.wholesale_price) : 0;
  const total = unit * pieces;
  const retailTotal = selected ? Number(selected.price) * pieces : 0;
  const savings = retailTotal - total;
  const savingsPct = retailTotal ? Math.round((savings / retailTotal) * 100) : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selected) { setError('اختر المنتج أولاً'); return; }
    if (name.trim().length < 3) { setError('من فضلك أدخل الاسم بالكامل'); return; }
    if (!isValidEgyptPhone(phone)) { setError('رقم الموبايل غير صحيح — يجب أن يبدأ بـ 01 ويتكون من 11 رقم'); return; }
    setLoading(true);
    try {
      await api.post('/api/wholesale_requests', {
        name: name.trim(), phone: phone.trim(), city: city.trim(),
        product_id: selected.id, product_name: selected.name_ar,
        dozens, estimated_total: total, notes: notes.trim(),
      });
      setSuccess(`تم استلام طلب الجملة بنجاح! (${dozens} دستة = ${pieces} قطعة — ${egp(total, currency)}). سنتواصل معك قريباً على ${phone}.`);
      setName(''); setPhone(''); setCity(''); setNotes(''); setDozens(1);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  const addDozensToCart = () => {
    if (!selected) return;
    addToCart(selected, pieces, true);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full mb-4">
          <Store size={14} /> قسم التجار وأصحاب المحلات
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white">الشراء جملة بالدستة</h1>
        <p className="text-stone-400 mt-3 leading-relaxed">
          الدستة = <span className="text-[#C9A227] font-black">12 قطعة</span> من نفس الموديل بسعر الجملة المخفض.
          اختر الموديل وعدد الدست، واحسب إجمالي طلبك فوراً بالحاسبة التفاعلية.
        </p>
      </div>

      {/* steps */}
      <div className="grid sm:grid-cols-4 gap-3 mb-10">
        {[
          { n: '1', t: 'اختر الموديل', d: 'من قائمة منتجات الجملة' },
          { n: '2', t: 'حدد عدد الدست', d: 'كل دستة = 12 قطعة' },
          { n: '3', t: 'احسب الإجمالي', d: 'الحاسبة تحسب فوراً' },
          { n: '4', t: 'أرسل الطلب', d: 'ونتواصل معك للتأكيد' },
        ].map((s) => (
          <div key={s.n} className="bg-[#141414] border border-white/10 rounded-2xl p-4 text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-[#C9A227] text-black font-black flex items-center justify-center mb-2">{s.n}</div>
            <div className="font-black text-white text-sm">{s.t}</div>
            <div className="text-xs text-stone-500 mt-1">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* calculator */}
        <div className="bg-[#141414] border border-[#C9A227]/30 rounded-2xl p-6">
          <h2 className="font-black text-white flex items-center gap-2 mb-5">
            <Calculator size={20} className="text-[#C9A227]" /> حاسبة الدستة التفاعلية
          </h2>

          <label className="text-xs font-bold text-stone-400">اختر الموديل</label>
          <select
            value={pid}
            onChange={(e) => setPid(Number(e.target.value))}
            className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none"
          >
            {wholesaleProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name_ar} — جملة {egp(p.wholesale_price, currency)}</option>
            ))}
          </select>

          {selected && (
            <div className="flex gap-4 mt-4 bg-black/30 rounded-xl p-3">
              <img src={selected.image_url || '/images/p1.jpg'} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="text-sm">
                <div className="font-black text-white">{selected.name_ar}</div>
                <div className="text-stone-400 text-xs mt-1">قطاعي: {egp(selected.price, currency)} • جملة: <span className="text-emerald-400 font-black">{egp(selected.wholesale_price, currency)}</span></div>
                <div className="text-stone-500 text-xs mt-1">متوفر: {selected.stock} قطعة</div>
              </div>
            </div>
          )}

          <label className="text-xs font-bold text-stone-400 mt-5 block">عدد الدست المطلوبة (الدستة = 12 قطعة)</label>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setDozens(Math.min(100, dozens + 1))} className="w-12 h-12 rounded-xl bg-[#C9A227] text-black font-black flex items-center justify-center hover:bg-[#d8b53a]"><Plus size={18} /></button>
            <input
              type="number" min={1} max={100} value={dozens}
              onChange={(e) => setDozens(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="flex-1 text-center bg-black/40 border border-white/10 rounded-xl py-3 text-white font-black text-xl outline-none"
            />
            <button onClick={() => setDozens(Math.max(1, dozens - 1))} className="w-12 h-12 rounded-xl bg-white/10 text-white font-black flex items-center justify-center hover:bg-white/20"><Minus size={18} /></button>
          </div>
          <div className="flex gap-2 mt-2">
            {[1, 2, 5, 10].map((d) => (
              <button key={d} onClick={() => setDozens(d)} className={`flex-1 text-xs font-black py-2 rounded-lg border transition ${dozens === d ? 'bg-[#C9A227] text-black border-[#C9A227]' : 'border-white/10 text-stone-400 hover:border-[#C9A227]/50'}`}>
                {d} دستة
              </button>
            ))}
          </div>

          {/* live result */}
          <div className="mt-5 bg-gradient-to-l from-[#C9A227]/15 to-transparent border border-[#C9A227]/30 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-stone-400">إجمالي القطع</span><span className="font-black text-white">{pieces} قطعة ({dozens} دستة)</span></div>
            <div className="flex justify-between"><span className="text-stone-400">سعر قطعة الجملة</span><span className="font-black text-emerald-400">{egp(unit, currency)}</span></div>
            <div className="flex justify-between"><span className="text-stone-400">لو اشتريت قطاعي</span><span className="text-stone-500 line-through">{egp(retailTotal, currency)}</span></div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="font-black text-white">إجمالي الجملة</span>
              <span className="font-black text-[#C9A227] text-2xl">{egp(total, currency)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
              <BadgePercent size={14} /> وفّر {egp(savings, currency)} ({savingsPct}%)
            </div>
          </div>

          <button onClick={addDozensToCart} disabled={!selected} className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black py-3.5 rounded-xl transition">
            <Package size={18} /> أضف {pieces} قطعة للسلة بسعر الجملة
          </button>
        </div>

        {/* request form */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
          <h2 className="font-black text-white flex items-center gap-2 mb-1">
            <Truck size={20} className="text-[#C9A227]" /> إرسال طلب جملة
          </h2>
          <p className="text-xs text-stone-500 mb-5">املأ بياناتك وسيتواصل معك فريق خيرو لتأكيد الطلب وترتيب الشحن</p>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-5 text-center">
              <CheckCircle2 size={44} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-emerald-300 text-sm font-bold leading-relaxed">{success}</p>
              <button onClick={() => setSuccess('')} className="mt-4 text-xs font-bold text-stone-400 hover:text-white">إرسال طلب آخر</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400">الاسم بالكامل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد محمد" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">رقم الموبايل (واتساب) *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none text-left" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">المحافظة / المدينة</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: القاهرة" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none" />
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-sm flex items-center justify-between">
                <span className="text-stone-400">ملخص الطلب</span>
                <span className="text-white font-bold text-xs">{selected?.name_ar} • {dozens} دستة ({pieces} قطعة) • <span className="text-[#C9A227] font-black">{egp(total, currency)}</span></span>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">ملاحظات إضافية (اختياري)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="أي تفاصيل عن الألوان أو موعد الاستلام..." className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none resize-none" />
              </div>
              {error && <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>}
              <button disabled={loading} className="w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition">
                {loading ? 'جاري الإرسال...' : 'إرسال طلب الجملة'}
              </button>
            </form>
          )}

          <div className="mt-6 text-xs text-stone-500 leading-relaxed bg-white/5 rounded-xl p-4">
            <span className="font-black text-stone-300">ملاحظات لتجار الجملة:</span>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>الحد الأدنى لطلب الجملة دستة واحدة (12 قطعة) من نفس الموديل</li>
              <li>يمكن المزج بين موديلين بشرط ألا يقل إجمالي الطلب عن 24 قطعة</li>
              <li>منتجات الجملة لا تقبل الاسترجاع إلا في حال العيب المصنعي</li>
              <li>الشحن يُحسب حسب المحافظة ويُخصم الشحن للطلبات الكبيرة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* wholesale price table */}
      <div className="mt-10 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-black text-white">جدول أسعار الجملة الكامل</h2>
          <p className="text-xs text-stone-500 mt-1">قارن بين سعر القطاعي وسعر الجملة لكل موديل</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-stone-400 text-xs border-b border-white/10">
                <th className="text-right p-4 font-bold">الموديل</th>
                <th className="p-4 font-bold">سعر القطاعي</th>
                <th className="p-4 font-bold">سعر الجملة/قطعة</th>
                <th className="p-4 font-bold">سعر الدستة (12)</th>
                <th className="p-4 font-bold">التوفير</th>
              </tr>
            </thead>
            <tbody>
              {wholesaleProducts.map((p) => {
                const dozen = Number(p.wholesale_price) * 12;
                const save = (Number(p.price) - Number(p.wholesale_price)) * 12;
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url || '/images/p1.jpg'} alt="" className="w-11 h-11 rounded-lg object-cover" />
                        <span className="font-bold text-white">{p.name_ar}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-stone-400">{egp(p.price, currency)}</td>
                    <td className="p-4 text-center text-emerald-400 font-black">{egp(p.wholesale_price, currency)}</td>
                    <td className="p-4 text-center text-[#C9A227] font-black">{egp(dozen, currency)}</td>
                    <td className="p-4 text-center"><span className="bg-emerald-500/15 text-emerald-400 text-xs font-black px-2.5 py-1 rounded-full">وفّر {egp(save, currency)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
