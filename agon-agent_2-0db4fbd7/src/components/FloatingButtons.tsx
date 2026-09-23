import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './Footer';

export default function FloatingButtons() {
  const { settings } = useStore();
  const wa = `https://wa.me/${settings.store_whatsapp || '201090209654'}?text=${encodeURIComponent('مرحباً متجر خيرو، عندي استفسار')}`;

  return (
    <a
      href={wa}
      target="_blank"
      rel="noreferrer"
      title="تواصل واتساب"
      className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_-5px_rgba(37,211,102,0.6)] hover:scale-110 transition-transform"
    >
      <WhatsAppIcon size={26} />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
    </a>
  );
}
