import { useEffect, useState } from 'react';
import { MailOpen, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { fmtDate } from '../../lib/format';

export default function AdminMessages() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/contact_messages', true);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: number, v: boolean) => {
    try {
      await api.put('/api/contact_messages', { id, is_read: v }, true);
      fetchAll();
      if (selected?.id === id) setSelected({ ...selected, is_read: v });
    } catch (e: any) { alert(e.message); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف هذه الرسالة؟')) return;
    try {
      await api.del('/api/contact_messages', { id }, true);
      setSelected(null);
      fetchAll();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">رسائل العملاء</h1>
      <p className="text-sm text-stone-500 mb-6">{rows.filter((r) => !r.is_read).length} رسالة غير مقروءة</p>

      <div className="space-y-3">
        {rows.map((m) => (
          <div
            key={m.id}
            onClick={() => { setSelected(m); if (!m.is_read) markRead(m.id, true); }}
            className={`bg-[#141414] border rounded-2xl p-4 cursor-pointer hover:border-[#C9A227]/40 transition ${m.is_read ? 'border-white/10' : 'border-[#C9A227]/40'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!m.is_read && <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />}
                <span className="font-black text-white text-sm">{m.name}</span>
                <span className="text-[11px] bg-white/10 text-stone-300 px-2.5 py-0.5 rounded-full">{m.subject}</span>
              </div>
              <span className="text-[11px] text-stone-500 shrink-0">{fmtDate(m.created_at)}</span>
            </div>
            <p className="text-sm text-stone-400 mt-2 line-clamp-1">{m.message}</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-stone-500 text-sm text-center py-8">لا توجد رسائل</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} />
          <div className="relative bg-[#141414] border border-white/15 rounded-2xl max-w-md w-full p-6">
            <button onClick={() => setSelected(null)} className="absolute left-4 top-4 p-2 text-stone-400 hover:text-white"><X size={18} /></button>
            <h2 className="font-black text-white mb-1">{selected.name}</h2>
            <p className="text-xs text-stone-500 mb-4">{selected.subject} • {fmtDate(selected.created_at)}</p>
            <div className="space-y-2 text-sm mb-4">
              {selected.phone && <div className="flex justify-between"><span className="text-stone-400">الهاتف</span><span className="text-white" dir="ltr">{selected.phone}</span></div>}
              {selected.email && <div className="flex justify-between"><span className="text-stone-400">البريد</span><span className="text-white text-xs" dir="ltr">{selected.email}</span></div>}
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-sm text-stone-200 leading-relaxed whitespace-pre-line">{selected.message}</div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => markRead(selected.id, !selected.is_read)} className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 text-white text-xs font-black py-2.5 rounded-xl"><MailOpen size={14} /> {selected.is_read ? 'تعليم كغير مقروءة' : 'تعليم كمقروءة'}</button>
              <button onClick={() => remove(selected.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 text-xs font-black py-2.5 rounded-xl"><Trash2 size={14} /> حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
