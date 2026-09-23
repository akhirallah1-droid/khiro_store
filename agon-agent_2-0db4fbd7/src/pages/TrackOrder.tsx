import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, CheckCircle2, Truck, Clock, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { egp, fmtDate, ORDER_STATUS_AR, PAYMENT_METHOD_AR } from '../lib/format';
import { useStore } from '../context/StoreContext';

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { settings } = useStore();
  const currency = settings.currency || 'ج.م';
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('code')) setCode(params.get('code') || '');
  }, [params]);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(''); setOrder(null);
    if (!code.trim() || !phone.trim()) { setError('أدخل رقم الطلب ورقم الموبايل'); return; }
    setLoading(true);
    try {
      const data = await api.get(`/api/orders?code=${encodeURIComponent(code.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      setOrder(data);
    } catch (err: any) {
      setError(err.message === 'Order not found' ? 'لم يتم العثور على الطلب — تأكدي من رقم الطلب' : err.message === 'Phone number does not match' ? 'رقم الموبايل غير مطابق لبيانات الطلب' : 'حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/40 flex items-center justify-center mb-4">
          <PackageSearch size={30} className="text-[#C9A227]" />
        </div>
        <h1 className="text-3xl font-black text-white">تتبع الطلب</h1>
        <p className="text-stone-400 text-sm mt-2">أدخل رقم الطلب ورقم الموبايل المسجل لعرض حالة طلبك</p>
      </div>

      <form onSubmit={search} className="bg-[#141414] border border-white/10 rounded-2xl p-6 grid sm:grid-cols-3 gap-3">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="رقم الطلب (KH-XXXXXX)" dir="ltr" className="bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm font-bold outline-none text-center" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الموبايل" dir="ltr" className="bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none text-center" />
        <button disabled={loading} className="bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black rounded-xl text-sm transition">
          {loading ? 'جاري البحث...' : 'بحث'}
        </button>
      </form>
      {error && <p className="mt-4 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">{error}</p>}

      {order && (
        <div className="mt-6 bg-[#141414] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs text-stone-500">رقم الطلب</div>
              <div className="font-black text-[#C9A227] text-xl" dir="ltr">{order.order_code}</div>
              <div className="text-xs text-stone-500 mt-1">{fmtDate(order.created_at)}</div>
            </div>
            <span className={`text-xs font-black px-4 py-2 rounded-full ${
              order.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
              : order.status === 'cancelled' ? 'bg-red-500/15 text-red-400 border border-red-500/40'
              : 'bg-[#C9A227]/15 text-[#C9A227] border border-[#C9A227]/40'
            }`}>
              {ORDER_STATUS_AR[order.status] || order.status}
            </span>
          </div>

          {order.status !== 'cancelled' ? (
            <div className="flex items-center mb-8 px-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 flex items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${i <= stepIndex ? 'bg-[#C9A227] border-[#C9A227] text-black' : 'border-white/15 text-stone-600 bg-white/5'}`}>
                      {i === 0 ? <Clock size={18} /> : i === 1 ? <CheckCircle2 size={18} /> : i === 2 ? <Truck size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <span className={`text-[10px] font-black mt-1.5 whitespace-nowrap ${i <= stepIndex ? 'text-[#C9A227]' : 'text-stone-600'}`}>{ORDER_STATUS_AR[s]}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-6 rounded ${i < stepIndex ? 'bg-[#C9A227]' : 'bg-white/10'}`} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center text-red-400 font-bold mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <XCircle size={20} /> تم إلغاء هذا الطلب — تواصل معنا لمزيد من التفاصيل
            </div>
          )}

          <div className="space-y-2.5 text-sm border-t border-white/10 pt-5">
            {(order.items || []).map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5">
                <img src={it.image_url || '/images/p1.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-bold text-white text-xs">{it.name_ar}</div>
                  <div className="text-[11px] text-stone-500">الكمية: {it.qty} × {egp(it.unit_price, currency)}</div>
                </div>
                <div className="font-black text-[#C9A227] text-xs">{egp(it.line_total, currency)}</div>
              </div>
            ))}
            <div className="flex justify-between pt-2"><span className="text-stone-400">المجموع الفرعي</span><span className="text-white font-bold">{egp(order.subtotal, currency)}</span></div>
            {Number(order.discount) > 0 && <div className="flex justify-between"><span className="text-emerald-400">الخصم</span><span className="text-emerald-400 font-bold">-{egp(order.discount, currency)}</span></div>}
            <div className="flex justify-between"><span className="text-stone-400">الشحن ({order.governorate})</span><span className="text-white font-bold">{egp(order.shipping_fee, currency)}</span></div>
            {Number(order.cod_fee) > 0 && <div className="flex justify-between"><span className="text-stone-400">رسوم الدفع عند الاستلام</span><span className="text-white font-bold">{egp(order.cod_fee, currency)}</span></div>}
            <div className="flex justify-between pt-2 border-t border-white/10"><span className="font-black text-white">الإجمالي</span><span className="font-black text-[#C9A227] text-lg">{egp(order.total, currency)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-stone-500">طريقة الدفع</span><span className="text-stone-300">{PAYMENT_METHOD_AR[order.payment_method] || order.payment_method}</span></div>
            <div className="flex justify-between text-xs"><span className="text-stone-500">عنوان التوصيل</span><span className="text-stone-300">{order.address}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
