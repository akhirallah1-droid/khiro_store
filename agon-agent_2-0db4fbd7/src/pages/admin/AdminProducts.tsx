import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { egp } from '../../lib/format';

const EMPTY = { name_ar: '', name_en: '', description_ar: '', category_id: '', price: '', old_price: '', wholesale_price: '', min_wholesale_qty: 12, stock: 0, image_url: '', is_featured: false, is_new: false, is_active: true, badge_ar: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/api/products?all=1', true), api.get('/api/categories')]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ ...EMPTY }); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name_ar: p.name_ar || '', name_en: p.name_en || '', description_ar: p.description_ar || '',
      category_id: p.category_id || '', price: p.price, old_price: p.old_price || '',
      wholesale_price: p.wholesale_price || '', min_wholesale_qty: p.min_wholesale_qty || 12,
      stock: p.stock ?? 0, image_url: p.image_url || '',
      is_featured: !!p.is_featured, is_new: !!p.is_new, is_active: p.is_active !== false, badge_ar: p.badge_ar || '',
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim() || form.price === '') { alert('الاسم والسعر مطلوبان'); return; }
    setSaving(true);
    try {
      const payload: any = {
        name_ar: form.name_ar.trim(), name_en: form.name_en || null, description_ar: form.description_ar || null,
        category_id: form.category_id ? Number(form.category_id) : null, price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        wholesale_price: form.wholesale_price ? Number(form.wholesale_price) : null,
        min_wholesale_qty: Number(form.min_wholesale_qty) || 12, stock: Number(form.stock) || 0,
        image_url: form.image_url || null, is_featured: !!form.is_featured, is_new: !!form.is_new,
        is_active: !!form.is_active, badge_ar: form.badge_ar || null,
      };
      if (editing?.isNew) await api.post('/api/products', payload, true);
      else await api.put('/api/products', { id: editing.id, ...payload }, true);
      setEditing(null);
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا المنتج نهائياً؟')) return;
    try {
      await api.del('/api/products', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const setF = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#C9A227]';

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة المنتجات</h1>
          <p className="text-sm text-stone-500">{products.length} منتج</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-5 py-2.5 rounded-xl">
          <Plus size={16} /> منتج جديد
        </button>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-stone-500 text-xs border-b border-white/10">
                <th className="text-right p-4">المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">قطاعي</th>
                <th className="p-4">جملة</th>
                <th className="p-4">المخزون</th>
                <th className="p-4">مميز</th>
                <th className="p-4">نشط</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url || '/images/p1.jpg'} alt="" className="w-11 h-11 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-white text-xs">{p.name_ar}</div>
                        <div className="text-[11px] text-stone-500">بيع {p.sold_count || 0} • ⭐ {Number(p.rating_avg || 0).toFixed(1)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-xs text-stone-300">{p.k_categories?.name_ar || '—'}</td>
                  <td className="p-4 text-center font-black text-[#C9A227]">{egp(p.price)}</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">{p.wholesale_price ? egp(p.wholesale_price) : '—'}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${Number(p.stock) <= 5 ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white'}`}>{p.stock}</span>
                  </td>
                  <td className="p-4 text-center text-xs">{p.is_featured ? '✓' : '—'}</td>
                  <td className="p-4 text-center text-xs">{p.is_active ? <span className="text-emerald-400">✓</span> : <span className="text-stone-600">✕</span>}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(p)} className="p-2 text-stone-400 hover:text-[#C9A227]"><Pencil size={16} /></button>
                      <button onClick={() => remove(p.id)} className="p-2 text-stone-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(null)} />
          <form onSubmit={save} className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <button type="button" onClick={() => setEditing(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-5">{editing.isNew ? 'منتج جديد' : 'تعديل المنتج'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-400">اسم المنتج بالعربي *</label>
                <input value={form.name_ar} onChange={(e) => setF('name_ar', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">الاسم بالإنجليزية</label>
                <input value={form.name_en} onChange={(e) => setF('name_en', e.target.value)} dir="ltr" className={`${inputCls} mt-1.5 text-left`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">القسم</label>
                <select value={form.category_id} onChange={(e) => setF('category_id', e.target.value)} className={`${inputCls} mt-1.5`}>
                  <option value="">بدون قسم</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-400">الوصف</label>
                <textarea value={form.description_ar} onChange={(e) => setF('description_ar', e.target.value)} rows={2} className={`${inputCls} mt-1.5 resize-none`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">سعر القطاعي *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setF('price', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">السعر قبل الخصم</label>
                <input type="number" step="0.01" value={form.old_price} onChange={(e) => setF('old_price', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-400">سعر الجملة للقطعة</label>
                <input type="number" step="0.01" value={form.wholesale_price} onChange={(e) => setF('wholesale_price', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">أقل كمية للجملة</label>
                <input type="number" value={form.min_wholesale_qty} onChange={(e) => setF('min_wholesale_qty', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">المخزون</label>
                <input type="number" value={form.stock} onChange={(e) => setF('stock', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">شارة (مثال: جديد، خصم)</label>
                <input value={form.badge_ar} onChange={(e) => setF('badge_ar', e.target.value)} className={`${inputCls} mt-1.5`} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-stone-400">رابط الصورة</label>
                <input value={form.image_url} onChange={(e) => setF('image_url', e.target.value)} dir="ltr" placeholder="/images/p1.jpg" className={`${inputCls} mt-1.5 text-left`} />
                {form.image_url && <img src={form.image_url} alt="" className="mt-2 w-20 h-20 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-4">
                {[
                  { k: 'is_featured', t: 'منتج مميز (يظهر بالرئيسية)' },
                  { k: 'is_new', t: 'وصل حديثاً' },
                  { k: 'is_active', t: 'نشط ومتاح للبيع' },
                ].map((c) => (
                  <label key={c.k} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input type="checkbox" checked={!!form[c.k]} onChange={(e) => setF(c.k, e.target.checked)} className="w-4 h-4 accent-[#C9A227]" />
                    {c.t}
                  </label>
                ))}
              </div>
            </div>
            <button disabled={saving} className="mt-6 w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3 rounded-xl">
              {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
