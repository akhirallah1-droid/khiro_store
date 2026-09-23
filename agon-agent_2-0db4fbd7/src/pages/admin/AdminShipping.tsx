import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Plus, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { egp } from '../../lib/format';

export default function AdminShipping() {
  const [rates, setRates] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ governorate: '', zone_ar: '', fee: '', delivery_days_ar: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get('/api/shipping_rates', true), api.get('/api/store_settings')]);
      setRates(Array.isArray(r) ? r : []);
      setSettings(s || {});
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ governorate: '', zone_ar: '', fee: '', delivery_days_ar: '', is_active: true }); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ governorate: r.governorate, zone_ar: r.zone_ar || '', fee: String(r.fee), delivery_days_ar: r.delivery_days_ar || '', is_active: r.is_active !== false });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.governorate.trim()) { alert('اسم المحافظة مطلوب'); return; }
    setSaving(true);
    try {
      const payload = { governorate: form.governorate.trim(), zone_ar: form.zone_ar || null, fee: Number(form.fee) || 0, delivery_days_ar: form.delivery_days_ar || null, is_active: form.is_active };
      if (editing?.isNew) await api.post('/api/shipping_rates', payload, true);
      else await api.put('/api/shipping_rates', { id: editing.id, ...payload }, true);
      setEditing(null);
      fetchAll();
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف سعر الشحن لهذه المحافظة؟')) return;
    try {
      await api.del('/api/shipping_rates', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const saveGlobals = async () => {
    setMsg('');
    try {
      await api.put('/api/store_settings', { settings: {
        default_shipping_fee: settings.default_shipping_fee || '60',
        free_shipping_threshold: settings.free_shipping_threshold || '0',
        cod_fee: settings.cod_fee || '0',
      } }, true);
      setMsg('تم حفظ الإعدادات العامة للشحن بنجاح');
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) { alert(e.message); }
  };

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#C9A227]';

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">أسعار الشحن</h1>
      <p className="text-sm text-stone-500 mb-6">نعم — يمكنك تعديل أسعار الشحن لكل محافظة من هنا، وتُطبق فوراً على الطلبات الجديدة</p>

      <div className="bg-[#141414] border border-[#C9A227]/30 rounded-2xl p-5 mb-6">
        <h2 className="font-black text-white mb-4">الإعدادات العامة للشحن</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-400">سعر الشحن الافتراضي (ج.م)</label>
            <input type="number" value={settings.default_shipping_fee || ''} onChange={(e) => setSettings({ ...settings, default_shipping_fee: e.target.value })} className={`${inputCls} mt-1.5`} />
            <p className="text-[11px] text-stone-600 mt-1">يُستخدم عند عدم وجود سعر للمحافظة</p>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400">حد الشحن المجاني (ج.م) — 0 للإلغاء</label>
            <input type="number" value={settings.free_shipping_threshold || ''} onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })} className={`${inputCls} mt-1.5`} />
            <p className="text-[11px] text-stone-600 mt-1">الطلبات فوق هذا المبلغ شحنها مجاني</p>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400">رسوم الدفع عند الاستلام (ج.م)</label>
            <input type="number" value={settings.cod_fee || ''} onChange={(e) => setSettings({ ...settings, cod_fee: e.target.value })} className={`${inputCls} mt-1.5`} />
            <p className="text-[11px] text-stone-600 mt-1">تُضاف عند اختيار الدفع عند الاستلام</p>
          </div>
        </div>
        <button onClick={saveGlobals} className="mt-4 flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-6 py-2.5 rounded-xl">
          <Save size={15} /> حفظ الإعدادات العامة
        </button>
        {msg && <p className="text-xs text-emerald-400 font-bold mt-2">{msg}</p>}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-white">أسعار المحافظات ({rates.length})</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-5 py-2.5 rounded-xl">
          <Plus size={16} /> إضافة محافظة
        </button>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-stone-500 text-xs border-b border-white/10">
                <th className="text-right p-4">المحافظة</th>
                <th className="p-4">المنطقة</th>
                <th className="p-4">سعر الشحن</th>
                <th className="p-4">مدة التوصيل</th>
                <th className="p-4">نشط</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{r.governorate}</td>
                  <td className="p-4 text-center text-xs text-stone-400">{r.zone_ar || '—'}</td>
                  <td className="p-4 text-center font-black text-[#C9A227]">{egp(r.fee)}</td>
                  <td className="p-4 text-center text-xs text-stone-300">{r.delivery_days_ar || '—'}</td>
                  <td className="p-4 text-center">{r.is_active ? <span className="text-emerald-400 text-xs font-black">✓ نشط</span> : <span className="text-stone-600 text-xs">✕</span>}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(r)} className="p-2 text-stone-400 hover:text-[#C9A227]"><Pencil size={16} /></button>
                      <button onClick={() => remove(r.id)} className="p-2 text-stone-400 hover:text-red-400"><Trash2 size={16} /></button>
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
          <form onSubmit={save} className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6">
            <button type="button" onClick={() => setEditing(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white text-lg mb-5">{editing.isNew ? 'إضافة محافظة' : 'تعديل سعر الشحن'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400">المحافظة *</label>
                <input value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">المنطقة (مثال: الصعيد، الوجه البحري)</label>
                <input value={form.zone_ar} onChange={(e) => setForm({ ...form, zone_ar: e.target.value })} className={`${inputCls} mt-1.5`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">سعر الشحن (ج.م)</label>
                  <input type="number" step="0.01" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">مدة التوصيل</label>
                  <input value={form.delivery_days_ar} onChange={(e) => setForm({ ...form, delivery_days_ar: e.target.value })} placeholder="2-3 أيام" className={`${inputCls} mt-1.5`} />
                </div>
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
