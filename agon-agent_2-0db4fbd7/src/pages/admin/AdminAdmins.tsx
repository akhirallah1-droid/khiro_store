import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ShieldCheck, UserCog } from 'lucide-react';
import { api, sha256Hex } from '../../lib/api';
import { fmtDate } from '../../lib/format';

export default function AdminAdmins() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'manager', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const me = (() => {
    try { return JSON.parse(localStorage.getItem('khiro_admin_user') || '{}'); } catch { return {}; }
  })();

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/admin_users', true);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'غير مصرح — هذه الصفحة للمالك فقط');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing({ isNew: true }); setForm({ username: '', password: '', full_name: '', role: 'manager', is_active: true }); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ username: r.username, password: '', full_name: r.full_name || '', role: r.role, is_active: r.is_active !== false });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing?.isNew && (!form.username.trim() || !form.password)) { alert('اسم المستخدم وكلمة المرور مطلوبان'); return; }
    if (form.password && form.password.length < 6) { alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setSaving(true);
    try {
      if (editing?.isNew) {
        const password_hash = await sha256Hex(form.password);
        await api.post('/api/admin_users', { action: 'create', username: form.username.trim(), password_hash, full_name: form.full_name || null, role: form.role }, true);
      } else {
        const patch: any = { id: editing.id, full_name: form.full_name, role: form.role, is_active: form.is_active };
        if (form.password) patch.password_hash = await sha256Hex(form.password);
        await api.put('/api/admin_users', patch, true);
      }
      setEditing(null);
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذا المدير نهائياً؟')) return;
    try {
      await api.del('/api/admin_users', { id }, true);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#C9A227]';

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
        <ShieldCheck size={40} className="mx-auto text-red-400 mb-3" />
        <h1 className="font-black text-white mb-1">صلاحيات غير كافية</h1>
        <p className="text-sm text-stone-400">صفحة إدارة المدراء متاحة لمالك المتجر (Owner) فقط.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-white">مدراء الموقع</h1>
          <p className="text-sm text-stone-500">نعم — يمكنك إضافة أكثر من مدير بصلاحيات مختلفة</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-sm px-5 py-2.5 rounded-xl">
          <Plus size={16} /> إضافة مدير
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 my-6">
        <div className="bg-[#C9A227]/10 border border-[#C9A227]/40 rounded-2xl p-4 flex gap-3">
          <ShieldCheck size={22} className="text-[#C9A227] shrink-0" />
          <div className="text-xs text-stone-300 leading-relaxed">
            <span className="font-black text-white">مالك (Owner):</span> صلاحيات كاملة — إدارة المنتجات والطلبات والشحن والإعدادات + إضافة وحذف المدراء.
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex gap-3">
          <UserCog size={22} className="text-blue-400 shrink-0" />
          <div className="text-xs text-stone-300 leading-relaxed">
            <span className="font-black text-white">مدير (Manager):</span> إدارة يومية — المنتجات والطلبات والشحن والكوبونات والرسائل، بدون إدارة المدراء.
          </div>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="text-stone-500 text-xs border-b border-white/10">
                <th className="text-right p-4">المدير</th>
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">الدور</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">آخر دخول</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{r.full_name || '—'}{r.id === me.id && <span className="text-[10px] bg-[#C9A227]/20 text-[#C9A227] px-2 py-0.5 rounded-full mr-2">أنت</span>}</td>
                  <td className="p-4 text-center font-mono text-xs text-stone-300" dir="ltr">{r.username}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${r.role === 'owner' ? 'bg-[#C9A227]/15 text-[#C9A227]' : 'bg-blue-500/15 text-blue-400'}`}>
                      {r.role === 'owner' ? 'مالك' : 'مدير'}
                    </span>
                  </td>
                  <td className="p-4 text-center">{r.is_active ? <span className="text-emerald-400 text-xs font-black">✓ نشط</span> : <span className="text-stone-600 text-xs">معطل</span>}</td>
                  <td className="p-4 text-center text-[11px] text-stone-500">{fmtDate(r.last_login)}</td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(r)} className="p-2 text-stone-400 hover:text-[#C9A227]"><Pencil size={16} /></button>
                      {r.id !== me.id && <button onClick={() => remove(r.id)} className="p-2 text-stone-400 hover:text-red-400"><Trash2 size={16} /></button>}
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
            <h2 className="font-black text-white text-lg mb-5">{editing.isNew ? 'إضافة مدير جديد' : 'تعديل بيانات المدير'}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-400">اسم المستخدم *</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} disabled={!editing.isNew} dir="ltr" placeholder="manager_name" className={`${inputCls} mt-1.5 text-left disabled:opacity-50`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">{editing.isNew ? 'كلمة المرور *' : 'كلمة مرور جديدة (اتركيها فارغة للإبقاء)'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} dir="ltr" className={`${inputCls} mt-1.5 text-left`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">الاسم الكامل</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={`${inputCls} mt-1.5`} />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">الدور والصلاحيات</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`${inputCls} mt-1.5`}>
                  <option value="manager">مدير — إدارة يومية بدون إدارة المدراء</option>
                  <option value="owner">مالك — صلاحيات كاملة</option>
                </select>
              </div>
              {!editing.isNew && (
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#C9A227]" />
                  الحساب نشط
                </label>
              )}
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
