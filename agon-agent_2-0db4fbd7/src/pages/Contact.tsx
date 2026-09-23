import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, Facebook } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon, TikTokIcon, normalizeSocialUrl } from '../components/Footer';
import { api } from '../lib/api';

export default function Contact() {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('استفسار عام');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const wa = `https://wa.me/${settings.store_whatsapp || '201090209654'}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('من فضلك أدخل الاسم'); return; }
    if (message.trim().length < 3) { setError('من فضلك اكتب رسالتك'); return; }
    setLoading(true);
    try {
      await api.post('/api/contact_messages', { name: name.trim(), phone: phone.trim(), email: email.trim(), subject, message: message.trim() });
      setSuccess(true);
      setName(''); setPhone(''); setEmail(''); setMessage('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white">تواصل معنا</h1>
        <p className="text-stone-400 text-sm mt-2">فريق خيرو جاهز للرد على استفساراتكم في أسرع وقت</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-[#141414] border border-white/10 hover:border-[#25D366]/60 rounded-2xl p-5 transition group">
            <div className="w-13 h-13 p-3.5 rounded-2xl bg-[#25D366]/15 text-[#25D366]"><WhatsAppIcon size={24} /></div>
            <div className="flex-1">
              <div className="font-black text-white">واتساب — أسرع وسيلة</div>
              <div className="text-sm text-stone-400" dir="ltr">{settings.store_phone || '+201090209654'}</div>
            </div>
            <Send size={18} className="text-stone-600 group-hover:text-[#25D366] group-hover:-translate-x-1 transition" />
          </a>

          <a href={`mailto:${settings.store_email || 'contact@khirostore.com'}`} className="flex items-center gap-4 bg-[#141414] border border-white/10 hover:border-[#C9A227]/60 rounded-2xl p-5 transition group">
            <div className="p-3.5 rounded-2xl bg-[#C9A227]/15 text-[#C9A227]"><Mail size={24} /></div>
            <div className="flex-1">
              <div className="font-black text-white">البريد الإلكتروني الرسمي</div>
              <div className="text-sm text-stone-400 break-all" dir="ltr">{settings.store_email || 'contact@khirostore.com'}</div>
            </div>
          </a>

          <a href={`tel:${settings.store_phone || '+201090209654'}`} className="flex items-center gap-4 bg-[#141414] border border-white/10 hover:border-[#C9A227]/60 rounded-2xl p-5 transition group">
            <div className="p-3.5 rounded-2xl bg-[#C9A227]/15 text-[#C9A227]"><Phone size={24} /></div>
            <div className="flex-1">
              <div className="font-black text-white">اتصال هاتفي</div>
              <div className="text-sm text-stone-400" dir="ltr">{settings.store_phone || '+201090209654'}</div>
            </div>
          </a>

          <div className="flex items-center gap-4 bg-[#141414] border border-white/10 rounded-2xl p-5">
            <div className="p-3.5 rounded-2xl bg-[#C9A227]/15 text-[#C9A227]"><MapPin size={24} /></div>
            <div>
              <div className="font-black text-white">الموقع</div>
              <div className="text-sm text-stone-400">القاهرة، مصر — نشحن لجميع المحافظات</div>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <div className="font-black text-white mb-3">تابعنا على السوشيال ميديا</div>
            <div className="flex gap-3">
              <a href={settings.instagram_url || 'https://www.instagram.com/khirostore79'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-l from-purple-600/20 to-pink-600/20 border border-pink-500/30 text-pink-300 font-bold text-sm py-3 rounded-xl hover:brightness-125 transition">
                <Instagram size={18} /> انستجرام
              </a>
              <a href={settings.facebook_url || 'https://www.facebook.com/khirostore1'} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-blue-600/15 border border-blue-500/30 text-blue-300 font-bold text-sm py-3 rounded-xl hover:brightness-125 transition">
                <Facebook size={18} /> فيسبوك
              </a>
              {settings.tiktok_url && (
                <a href={normalizeSocialUrl(settings.tiktok_url)} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white font-bold text-sm py-3 rounded-xl hover:brightness-125 hover:border-[#C9A227] transition">
                  <TikTokIcon size={18} /> تيك توك
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6">
          <h2 className="font-black text-white mb-1">أرسل لنا رسالة</h2>
          <p className="text-xs text-stone-500 mb-5">سنرد عليك خلال ساعات العمل</p>
          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-6 text-center">
              <CheckCircle2 size={44} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-emerald-300 font-bold text-sm">تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</p>
              <button onClick={() => setSuccess(false)} className="mt-4 text-xs text-stone-400 hover:text-white">إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-400">الاسم *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-400">رقم الموبايل</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none text-left" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">البريد الإلكتروني</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@mail.com" dir="ltr" className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none text-left" />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">الموضوع</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none">
                  <option>استفسار عام</option>
                  <option>استفسار عن طلب</option>
                  <option>استبدال أو استرجاع</option>
                  <option>طلب جملة</option>
                  <option>اقتراح أو شكوى</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-stone-400">رسالتك *</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="اكتب رسالتك هنا..." className="mt-1.5 w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 px-4 text-white text-sm outline-none resize-none" />
              </div>
              {error && <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3">{error}</p>}
              <button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition">
                <Send size={17} /> {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
