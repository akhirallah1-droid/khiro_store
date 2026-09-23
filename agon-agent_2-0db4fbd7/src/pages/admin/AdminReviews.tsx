import { useEffect, useState } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';

export default function AdminReviews() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/reviews?all=1', true);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id: number, v: boolean) => {
    try {
      await api.put('/api/reviews', { id, is_approved: v }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا التقييم؟')) return;
    try {
      await api.del('/api/reviews', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">تقييمات العملاء</h1>
      <p className="text-sm text-stone-500 mb-6">{rows.filter((r) => !r.is_approved).length} تقييم بانتظار المراجعة</p>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className={`bg-[#141414] border rounded-2xl p-5 ${r.is_approved ? 'border-white/10' : 'border-amber-500/40'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <img src={r.k_products?.image_url || '/images/p1.jpg'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <div className="font-black text-white text-sm">{r.k_products?.name_ar}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{r.customer_name} • {fmtDate(r.created_at)}</div>
                  <div className="flex gap-0.5 text-[#C9A227] mt-1">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} fill={s <= r.rating ? 'currentColor' : 'none'} className={s <= r.rating ? '' : 'text-stone-700'} />)}
                  </div>
                </div>
              </div>
              <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${r.is_approved ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {r.is_approved ? 'معتمد' : 'بانتظار المراجعة'}
              </span>
            </div>
            {r.comment && <p className="text-sm text-stone-300 mt-3 bg-white/5 rounded-xl p-3">{r.comment}</p>}
            <div className="flex gap-2 mt-3">
              {!r.is_approved ? (
                <button onClick={() => approve(r.id, true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl"><Check size={14} /> اعتماد ونشر</button>
              ) : (
                <button onClick={() => approve(r.id, false)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-black px-4 py-2 rounded-xl"><X size={14} /> إخفاء</button>
              )}
              <button onClick={() => remove(r.id)} className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black px-4 py-2 rounded-xl"><Trash2 size={14} /> حذف</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-stone-500 text-sm text-center py-8">لا توجد تقييمات</p>}
      </div>
    </div>
  );
}
