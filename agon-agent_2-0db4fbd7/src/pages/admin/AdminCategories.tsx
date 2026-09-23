import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name_ar: '', name_en: '', description_ar: '', image_url: '', sort_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/categories');
      setCats(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ name_ar: '', name_en: '', description_ar: '', image_url: '', sort_order: cats.length + 1, is_active: true }); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name_ar: c.name_ar, name_en: c.name_en || '', description_ar: c.description_ar || '', image_url: c.image_url || '', sort_order: c.sort_order || 0, is_active: c.is_active !== false });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) { alert('اسم القسم مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { name_ar: form.name_ar.trim(), name_en: form.name_en || null, description_ar: form.description_ar || null, image_url: form.image_url || null, sort_order: Number(form.sort_order) || 0, is_active: form.is_active };
      if (editing?.isNew) await api.post('/api/categories', payload, true);
      else await api.put('/api/categories', { id: editing.id, ...payload }, true);
      setEditing(null);
      fetchAll();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا القسم؟ (لن تُحذف المنتجات المرتبطة)')) return;
    try {
      await api.del('/api/categories', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#C9A227]';

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">أقسام المتجر</h1>
          <p className="text-sm text-stone-500">{cats.length} قسم</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-5 py-2.5 rounded-xl">
          <Plus size={16} /> قسم جديد
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((c) => (
          <div key={c.id} className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
            <img src={c.image_url || '/images/p1.jpg'} alt="" className="w-full h-36 object-cover" />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-white">{c.name_ar}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-stone-500'}`}>{c.is_active ? 'نشط' : 'معطل'}</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">ترتيب العرض: {c.sort_order}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-black py-2 rounded-xl"><Pencil size={13} /> تعديل</button>
                <button onClick={() => remove(c.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-black py-2 rounded-xl"><Trash2 size={13} /> حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6">
            <button type="button" onClick={() => setEditing(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-5">{editing.isNew ? 'قسم جديد' : 'تعديل القسم'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400">اسم القسم *</label>
                <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className={`${inputCls} mt-1.5`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">الاسم بالإنجليزية</label>
                  <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} dir="ltr" className={`${inputCls} mt-1.5 text-left`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">ترتيب العرض</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={`${inputCls} mt-1.5`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">رابط الصورة</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} dir="ltr" className={`${inputCls} mt-1.5 text-left`} />
              </div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#C9A227]" />
                نشط
              </label>
            </div>
            <button disabled={saving} className="mt-6 w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3 rounded-xl">
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
