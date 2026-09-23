import { useEffect, useState } from 'react';
import { Save, Info } from 'lucide-react';
import { api } from '../../lib/api';

const GROUPS: { title: string; keys: { k: string; label: string; type?: string; dir?: string; hint?: string }[] }[] = [
  {
    title: 'بيانات المتجر الأساسية',
    keys: [
      { k: 'store_name_ar', label: 'اسم المتجر بالعربي' },
      { k: 'store_name_en', label: 'اسم المتجر بالإنجليزية', dir: 'ltr' },
      { k: 'store_tagline', label: 'الوصف المختصر (يظهر بالفوتر)' },
      { k: 'announcement', label: 'شريط الإعلان العلوي' },
      { k: 'currency', label: 'العملة' },
    ],
  },
  {
    title: 'الواجهة الرئيسية',
    keys: [
      { k: 'hero_title', label: 'العنوان الرئيسي' },
      { k: 'hero_subtitle', label: 'العنوان الفرعي' },
    ],
  },
  {
    title: 'بيانات التواصل والسوشيال ميديا',
    keys: [
      { k: 'store_phone', label: 'رقم الهاتف / واتساب', dir: 'ltr' },
      { k: 'store_whatsapp', label: 'رقم الواتساب (بالصيغة الدولية بدون +)', dir: 'ltr', hint: 'مثال: 201090209654' },
      { k: 'store_email', label: 'البريد الإلكتروني الرسمي', dir: 'ltr' },
      { k: 'instagram_url', label: 'رابط انستجرام', dir: 'ltr' },
      { k: 'facebook_url', label: 'رابط فيسبوك', dir: 'ltr' },
      { k: 'tiktok_url', label: 'رابط تيك توك (اختياري)', dir: 'ltr' },
    ],
  },
  {
    title: 'السياسات (تظهر للعميل عند إتمام الدفع فقط)',
    keys: [
      { k: 'cod_policy', label: 'سياسة الدفع عند الاستلام', type: 'textarea' },
      { k: 'return_policy', label: 'سياسة الاستبدال والاسترجاع', type: 'textarea' },
    ],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/api/store_settings')
      .then((d) => setSettings(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/api/store_settings', { settings }, true);
      setMsg('تم حفظ جميع الإعدادات بنجاح — التغييرات ظهرت على المتجر فوراً');
      setTimeout(() => setMsg(''), 4000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">إعدادات المتجر</h1>
      <p className="text-sm text-stone-500 mb-6">عدّلي بيانات المتجر والسوشيال ميديا والسياسات — كل التغييرات تظهر فوراً على الموقع</p>

      <div className="space-y-6">
        {GROUPS.map((g) => (
          <div key={g.title} className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <h2 className="font-black text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#C9A227] rounded-full" /> {g.title}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {g.keys.map((f) => (
                <div key={f.k} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-bold text-stone-400">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      value={settings[f.k] || ''}
                      onChange={(e) => setSettings({ ...settings, [f.k]: e.target.value })}
                      rows={7}
                      className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-2.5 px-3 text-white text-sm outline-none resize-y leading-relaxed"
                    />
                  ) : (
                    <input
                      value={settings[f.k] || ''}
                      onChange={(e) => setSettings({ ...settings, [f.k]: e.target.value })}
                      dir={f.dir === 'ltr' ? 'ltr' : 'rtl'}
                      className={`mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-2.5 px-3 text-white text-sm outline-none ${f.dir === 'ltr' ? 'text-left' : ''}`}
                    />
                  )}
                  {f.hint && <p className="text-[11px] text-stone-600 mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* email guide */}
        <div className="bg-blue-500/5 border border-blue-500/30 rounded-2xl p-5">
          <h2 className="font-black text-blue-300 mb-2 flex items-center gap-2"><Info size={17} /> كيف تحصلي على بريد إلكتروني رسمي باسم متجرك؟</h2>
          <div className="text-xs text-stone-300 leading-relaxed space-y-2">
            <p>البريد الحالي <span className="text-white font-bold" dir="ltr">{settings.store_email}</span> يعمل كعنوان تواصل يعرض على الموقع. لجعله بريداً حقيقياً يستقبل ويرسل:</p>
            <ol className="list-decimal list-inside space-y-1.5 mr-1">
              <li><span className="font-bold text-white">احجزي دومين (نطاق) باسم متجرك</span> مثل khirostore.com من أي شركة استضافة (Hostinger / Namecheap / GoDaddy) — التكلفة حوالي 300-600 جنيه سنوياً.</li>
              <li><span className="font-bold text-white">أنشئ البريد من لوحة الاستضافة:</span> من cPanel اختر Email Accounts ثم أنشئ contact@khirostore.com بكلمة مرور قوية.</li>
              <li><span className="font-bold text-white">أو استخدمي Google Workspace:</span> بريد احترافي بمساحة كبيرة وتكامل مع Gmail (حوالي 6 دولار شهرياً للحساب).</li>
              <li><span className="font-bold text-white">حدّثي حقل البريد هنا</span> ليظهر العنوان الجديد تلقائياً في الفوتر وصفحة التواصل.</li>
            </ol>
          </div>
        </div>

        <div className="sticky bottom-4">
          <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-4 rounded-2xl shadow-2xl transition">
            <Save size={18} /> {saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
          </button>
          {msg && <p className="text-center text-xs text-emerald-400 font-bold mt-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
