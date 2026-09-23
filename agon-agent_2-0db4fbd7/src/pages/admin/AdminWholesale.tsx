import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate, WHOLESALE_STATUS_AR } from '../../lib/format';

const STATUSES = ['new', 'contacted', 'confirmed', 'done', 'cancelled'];

export default function AdminWholesale() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/wholesale_requests', true);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateRow = async (id: number, patch: any) => {
    try {
      await api.put('/api/wholesale_requests', { id, ...patch }, true);
      fetchAll();
      if (selected?.id === id) setSelected({ ...selected, ...patch });
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا الطلب؟')) return;
    try {
      await api.del('/api/wholesale_requests', { id }, true);
      setSelected(null);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const filtered = filter ? rows.filter((r) => r.status === filter) : rows;

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">طلبات الجملة بالدستة</h1>
      <p className="text-sm text-stone-500 mb-6">{rows.length} طلب • {rows.filter((r) => r.status === 'new').length} جديد بانتظار التواصل</p>

      <div className="flex gap-2 overflow-x-auto mb-4">
        <button onClick={() => setFilter('')} className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl ${!filter ? 'bg-[#C9A227] text-black' : 'bg-[#141414] text-stone-300'}`}>الكل</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`shrink-0 text-xs font-black px-4 py-2.5 rounded-xl ${filter === s ? 'bg-[#C9A227] text-black' : 'bg-[#141414] text-stone-300'}`}>
            {WHOLESALE_STATUS_AR[s]}
          </button>
        ))}
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-stone-500 text-xs border-b border-white/10">
                <th className="text-right p-4">التاجر</th>
                <th className="text-right p-4">المنتج</th>
                <th className="p-4">الدست</th>
                <th className="p-4">القطع</th>
                <th className="p-4">الإجمالي التقديري</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4"><div className="font-bold text-white text-xs">{r.name}</div><div className="text-[11px] text-stone-500" dir="ltr">{r.phone}</div><div className="text-[11px] text-stone-500">{r.city}</div></td>
                  <td className="p-4 text-xs text-stone-300">{r.product_name || r.k_products?.name_ar || '—'}</td>
                  <td className="p-4 text-center font-black text-[#C9A227]">{r.dozens}</td>
                  <td className="p-4 text-center text-white font-bold">{r.total_pieces}</td>
                  <td className="p-4 text-center font-bold text-white">{Number(r.estimated_total || 0).toLocaleString()} ج.م</td>
                  <td className="p-4 text-center">
                    <select value={r.status} onChange={(e) => updateRow(r.id, { status: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold text-white px-2 py-1.5 outline-none">
                      {STATUSES.map((s) => <option key={s} value={s}>{WHOLESALE_STATUS_AR[s]}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-[11px] text-stone-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => { setSelected(r); setAdminNotes(r.admin_notes || ''); }} className="p-2 text-stone-400 hover:text-[#C9A227]"><Pencil size={16} /></button>
                      <a href={`https://wa.me/2${String(r.phone).replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="p-2 text-stone-400 hover:text-green-400" title="واتساب"><Plus size={16} className="rotate-45" /></a>
                      <button onClick={() => remove(r.id)} className="p-2 text-stone-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-stone-500 py-8 text-sm">لا توجد طلبات جملة</p>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setSelected(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-4">تفاصيل طلب الجملة</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-stone-400">التاجر</span><span className="text-white font-bold">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">الهاتف</span><span className="text-white font-bold" dir="ltr">{selected.phone}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">المدينة</span><span className="text-white">{selected.city || '—'}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">المنتج</span><span className="text-white text-xs">{selected.product_name}</span></div>
              <div className="flex justify-between"><span className="text-stone-400">الكمية</span><span className="text-[#C9A227] font-black">{selected.dozens} دستة = {selected.total_pieces} قطعة</span></div>
              {selected.notes && <div className="bg-white/5 rounded-xl p-3 text-xs text-stone-300">{selected.notes}</div>}
            </div>
            <label className="text-xs font-bold text-stone-400 mt-4 block">ملاحظات الإدارة (داخلية)</label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none resize-none" />
            <button onClick={() => { updateRow(selected.id, { admin_notes: adminNotes }); }} className="mt-3 w-full bg-[#C9A227] text-black font-black py-2.5 rounded-xl text-sm">حفظ الملاحظات</button>
          </div>
        </div>
      )}
    </div>
  );
}
