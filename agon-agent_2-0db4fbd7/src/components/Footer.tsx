import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, Send, Download, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useInstallPrompt, isIosDevice } from './InstallBanner';
import { useState } from 'react';

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="واتساب">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-label="تيك توك">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function normalizeSocialUrl(url?: string): string {
  const u = (url || '').trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export default function Footer() {
  const { settings, categories } = useStore();
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [iosHint, setIosHint] = useState(false);
  const wa = `https://wa.me/${settings.store_whatsapp || '201090209654'}`;

  const handleInstallClick = async () => {
    if (isIosDevice() && !canInstall) {
      setIosHint((v) => !v);
      return;
    }
    await promptInstall();
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#C9A227]/25 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="خيرو" className="w-12 h-12 rounded-full object-cover ring-2 ring-[#C9A227]" />
            <div>
              <div className="text-xl font-black text-[#C9A227]">خيرو</div>
              <div className="text-[11px] tracking-[0.25em] text-stone-500 font-semibold">KHIRO STORE</div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-stone-400">{settings.store_tagline || 'أناقة لكل العائلة'}</p>
          <div className="flex items-center gap-2 mt-5">
            <a href={settings.instagram_url || 'https://www.instagram.com/khirostore79'} target="_blank" rel="noreferrer" title="انستجرام"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A227] hover:text-[#C9A227] transition">
              <Instagram size={18} />
            </a>
            <a href={settings.facebook_url || 'https://www.facebook.com/khirostore1'} target="_blank" rel="noreferrer" title="فيسبوك"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A227] hover:text-[#C9A227] transition">
              <Facebook size={18} />
            </a>
            <a href={wa} target="_blank" rel="noreferrer" title="واتساب"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A227] hover:text-[#C9A227] transition">
              <WhatsAppIcon />
            </a>
            {settings.tiktok_url && (
              <a href={normalizeSocialUrl(settings.tiktok_url)} target="_blank" rel="noreferrer" title="تيك توك"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A227] hover:text-[#C9A227] transition">
                <TikTokIcon />
              </a>
            )}
            <a href={`mailto:${settings.store_email || 'contact@khirostore.com'}`} title="البريد الإلكتروني"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#C9A227] hover:text-[#C9A227] transition">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-black mb-4">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#C9A227]">الرئيسية</Link></li>
            <li><Link to="/shop" className="hover:text-[#C9A227]">تسوق الآن</Link></li>
            <li><Link to="/wholesale" className="hover:text-[#C9A227]">الشراء جملة بالدستة</Link></li>
            <li><Link to="/track" className="hover:text-[#C9A227]">تتبع الطلب</Link></li>
            <li><Link to="/contact" className="hover:text-[#C9A227]">تواصل معنا</Link></li>
            <li>
              {isInstalled ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold"><Check size={14} /> التطبيق مثبّت على جهازك</span>
              ) : (
                <button onClick={handleInstallClick} className="inline-flex items-center gap-1.5 text-[#C9A227] font-bold hover:brightness-125">
                  <Download size={15} /> حمّل تطبيق خيرو
                </button>
              )}
              {iosHint && !isInstalled && (
                <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                  على آيفون: زر المشاركة في سفاري ← إضافة إلى الشاشة الرئيسية
                </p>
              )}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black mb-4">الأقسام</h4>
          <ul className="space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to={`/shop?cat=${c.id}`} className="hover:text-[#C9A227]">{c.name_ar}</Link></li>
            ))}
            {categories.length === 0 && <li className="text-stone-500">—</li>}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black mb-4">تواصل معنا</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2" dir="ltr">
              <Phone size={15} className="text-[#C9A227] shrink-0" />
              <a href={`tel:${settings.store_phone || '+201090209654'}`} className="hover:text-[#C9A227]" dir="ltr">{settings.store_phone || '+201090209654'}</a>
            </li>
            <li className="flex items-center gap-2" dir="ltr">
              <Mail size={15} className="text-[#C9A227] shrink-0" />
              <a href={`mailto:${settings.store_email || 'contact@khirostore.com'}`} className="hover:text-[#C9A227] break-all" dir="ltr">{settings.store_email || 'contact@khirostore.com'}</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} className="text-[#C9A227] shrink-0" />
              <span>القاهرة، مصر — نشحن لجميع المحافظات</span>
            </li>
            <li>
              <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold text-sm px-4 py-2 rounded-full hover:brightness-110 transition">
                <Send size={15} /> راسلنا واتساب
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <span>© 2026 متجر خيرو — KHIRO STORE — جميع الحقوق محفوظة</span>
          <Link to="/admin" className="hover:text-[#C9A227]">دخول الإدارة</Link>
        </div>
      </div>
    </footer>
  );
}

export { WhatsAppIcon, TikTokIcon, normalizeSocialUrl };
