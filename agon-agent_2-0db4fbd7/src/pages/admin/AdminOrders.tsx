import { useEffect, useState } from 'react';
import { Eye, X, Trash2, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { egp, fmtDate, ORDER_STATUS_AR, PAYMENT_STATUS_AR, PAYMENT_METHOD_AR } from '../../lib/format';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/orders', true);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrder = async (id: number, patch: any) => {
    try {
      await api.put('/api/orders', { id, ...patch }, true);
      fetchOrders();
      if (selected && selected.id === id) setSelected({ ...selected, ...patch });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('حذف هذا الطلب نهائياً؟')) return;
    try {
      await api.del('/api/orders', { id }, true);
      setSelected(null);
      fetchOrders();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter && o.status !== filter) return false;
    if (q && !(o.order_code || '').toLowerCase().includes(q.toLowerCase()) && !(o.customer_name || '').includes(q) && !(o.phone || '').includes(q)) return false;
    return true;
  });

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">إدارة الطلبات</h1>
      <p className="text-sm text-stone-500 mb-6">{orders.length} طلب إجمالاً</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث برقم الطلب أو الاسم أو الهاتف..." className="w-full bg-[#141414] border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setFilter('')} className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl ${!filter ? 'bg-[#C9A227] text-black' : 'bg-[#141414] text-stone-300'}`}>الكل</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl ${filter === s ? 'bg-[#C9A227] text-black' : 'bg-[#141414] text-stone-300'}`}>
              {ORDER_STATUS_AR[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-stone-500 text-xs border-b border-white/10">
                <th className="text-right p-4">رقم الطلب</th>
                <th className="text-right p-4">العميل</th>
                <th className="text-right p-4">المحافظة</th>
                <th className="p-4">الإجمالي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الدفع</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4"><span className="font-black text-[#C9A227]" dir="ltr">{o.order_code}</span>{o.is_wholesale && <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full mr-1">جملة</span>}</td>
                  <td className="p-4"><div className="font-bold text-white text-xs">{o.customer_name}</div><div className="text-[11px] text-stone-500" dir="ltr">{o.phone}</div></td>
                  <td className="p-4 text-stone-300 text-xs">{o.governorate}</td>
                  <td className="p-4 text-center font-black text-white">{egp(o.total)}</td>
                  <td className="p-4 text-center">
                    <select value={o.status} onChange={(e) => updateOrder(o.id, { status: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-white px-2 py-1.5 outline-none">
                      {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_AR[s]}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <select value={o.payment_status} onChange={(e) => updateOrder(o.id, { payment_status: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-white px-2 py-1.5 outline-none">
                      {Object.entries(PAYMENT_STATUS_AR).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-[11px] text-stone-500 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setSelected(o)} className="p-2 text-stone-400 hover:text-[#C9A227]" title="عرض"><Eye size={16} /></button>
                      <button onClick={() => deleteOrder(o.id)} className="p-2 text-stone-400 hover:text-red-400" title="حذف"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-stone-500 py-8 text-sm">لا توجد طلبات</p>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6">
            <button onClick={() => setSelected(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-1" dir="ltr">{selected.order_code}</h2>
            <p className="text-xs text-stone-500 mb-4">{fmtDate(selected.created_at)}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">العميل</span><span className="text-white font-bold">{selected.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">الهاتف</span><span className="text-white font-bold" dir="ltr">{selected.phone}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">المحافظة</span><span className="text-white font-bold">{selected.governorate}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">العنوان</span><span className="text-white text-xs max-w-[60%] text-left">{selected.address}</span></div>
              {selected.notes && <div className="flex justify-between"><span className="text-stone-400">ملاحظات</span><span className="text-white text-xs max-w-[60%] text-left">{selected.notes}</span></div>}
              <div className="flex justify-between"><span className="text-stone-400">الدفع</span><span className="text-white text-xs">{PAYMENT_METHOD_AR[selected.payment_method]} — {PAYMENT_STATUS_AR[selected.payment_status]}</span></div>
            </div>
            <div className="mt-4 space-y-2">
              {(selected.items || []).map((it: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 text-xs">
                  <img src={it.image_url || '/images/p1.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="flex-1 font-bold text-white">{it.name_ar}</span>
                  <span className="text-stone-400">×{it.qty}</span>
                  <span className="font-black text-[#C9A227]">{egp(it.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">فرعي</span><span className="text-white">{egp(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">شحن</span><span className="text-white">{egp(selected.shipping_fee)}</span></div>
              {Number(selected.discount) > 0 && <div className="flex justify-between"><span className="text-emerald-400">خصم {selected.coupon_code}</span><span className="text-emerald-400">-{egp(selected.discount)}</span></div>}
              <div className="flex justify-between font-black"><span className="text-white">الإجمالي</span><span className="text-[#C9A227] text-lg">{egp(selected.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
