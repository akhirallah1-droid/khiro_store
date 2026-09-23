import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { egp } from '../../lib/format';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order: '0', max_discount: '', usage_limit: '', is_active: true, expires_at: '' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/coupons', true);
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ code: '', type: 'percent', value: '', min_order: '0', max_discount: '', usage_limit: '', is_active: true, expires_at: '' }); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ code: c.code, type: c.type, value: String(c.value), min_order: String(c.min_order || 0), max_discount: c.max_discount ? String(c.max_discount) : '', usage_limit: c.usage_limit ? String(c.usage_limit) : '', is_active: c.is_active !== false, expires_at: c.expires_at ? String(c.expires_at).slice(0, 10) : '' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) { alert('الكود والقيمة مطلوبان'); return; }
    setSaving(true);
    try {
      const payload = { code: form.code.trim().toUpperCase(), type: form.type, value: Number(form.value), min_order: Number(form.min_order) || 0, max_discount: form.max_discount ? Number(form.max_discount) : null, usage_limit: form.usage_limit ? Number(form.usage_limit) : null, is_active: form.is_active, expires_at: form.expires_at || null };
      if (editing?.isNew) await api.post('/api/coupons', payload, true);
      else await api.put('/api/coupons', { id: editing.id, ...payload }, true);
      setEditing(null);
      fetchAll();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا الكوبون؟')) return;
    try {
      await api.del('/api/coupons', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#C9A227]';

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">كوبونات الخصم</h1>
          <p className="text-sm text-stone-500">{coupons.length} كوبون</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-5 py-2.5 rounded-xl">
          <Plus size={16} /> كوبون جديد
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className={`bg-[#141414] border rounded-2xl p-5 ${c.is_active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-[#C9A227] text-lg" dir="ltr">{c.code}</span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-stone-500'}`}>
                {c.is_active ? 'نشط' : 'معطل'}
              </span>
            </div>
            <div className="text-2xl font-black text-white">{c.type === 'percent' ? `${c.value}%` : egp(c.value)}</div>
            <div className="text-xs text-stone-500 mt-1 space-y-0.5">
              <div>حد أدنى: {egp(c.min_order)}</div>
              <div>الاستخدام: {c.used_count || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ' (غير محدود)'}</div>
              {c.expires_at && <div>ينتهي: {String(c.expires_at).slice(0, 10)}</div>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-black py-2 rounded-xl"><Pencil size={13} /> تعديل</button>
              <button onClick={() => remove(c.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black py-2 rounded-xl"><Trash2 size={13} /> حذف</button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-stone-500 text-sm">لا توجد كوبونات بعد</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setEditing(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-5">{editing.isNew ? 'كوبون جديد' : 'تعديل الكوبون'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">الكود *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} dir="ltr" placeholder="KHIRO10" className={`${inputCls} mt-1.5 text-left font-bold`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">النوع</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`${inputCls} mt-1.5`}>
                    <option value="percent">نسبة %</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">القيمة *</label>
                  <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">الحد الأدنى للطلب</label>
                  <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} className={`${inputCls} mt-1.5`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">أقصى خصم (للنسبة)</label>
                  <input type="number" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">حد الاستخدام</label>
                  <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="غير محدود" className={`${inputCls} mt-1.5`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">تاريخ الانتهاء</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className={`${inputCls} mt-1.5`} />
              </div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#C9A227]" />
                نشط
              </label>
            </div>
            <button disabled={saving} className="mt-6 w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3 rounded-xl">
              {saving ? 'جاري الحفظ...' : 'حفظ الكوبون'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
