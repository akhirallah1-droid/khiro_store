import { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, MonitorDown, CheckCircle2 } from 'lucide-react';

// Shared install-prompt state: captures beforeinstallprompt once for the whole app.
let deferredPrompt: any = null;
let promptListenerAttached = false;
const waiters = new Set<(p: any) => void>();

function notifyPrompt(p: any) {
  deferredPrompt = p;
  waiters.forEach((fn) => fn(p));
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState<boolean>(() => !!deferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true)
  );

  useEffect(() => {
    const onPrompt = (e: any) => {
      e.preventDefault();
      notifyPrompt(e);
    };
    const onInstalled = () => {
      notifyPrompt(null);
      setIsInstalled(true);
    };
    const settle = (p: any) => setCanInstall(!!p);
    waiters.add(settle);
    setCanInstall(!!deferredPrompt);
    if (!promptListenerAttached) {
      promptListenerAttached = true;
      window.addEventListener('beforeinstallprompt', onPrompt);
      window.addEventListener('appinstalled', onInstalled);
    }
    return () => {
      waiters.delete(settle);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        notifyPrompt(null);
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return { canInstall, isInstalled, promptInstall };
}

export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isInStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

// Small banner shown after visiting twice: offers one-tap install.
export default function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    try {
      if (sessionStorage.getItem('khiro_install_dismissed') === '1') return;
      const n = Number(localStorage.getItem('khiro_visits') || '0') + 1;
      localStorage.setItem('khiro_visits', String(n));
      if (n >= 2) {
        const t = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(t);
      }
    } catch {
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, [isInstalled]);

  if (isInstalled || !visible) return null;
  const ios = isIosDevice();

  const handleInstall = async () => {
    if (ios && !canInstall) {
      setShowIosHelp(true);
      return;
    }
    const ok = await promptInstall();
    if (ok) {
      setDone(true);
      setTimeout(() => setVisible(false), 2200);
    }
  };

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem('khiro_install_dismissed', '1');
    } catch {}
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-40 animate-[slideUp_.35s_ease-out]">
        <div className="bg-[#141414]/95 backdrop-blur border border-[#C9A227]/40 rounded-2xl p-4 shadow-[0_15px_50px_-10px_rgba(0,0,0,0.8)]">
          <button onClick={dismiss} className="absolute top-2.5 left-2.5 p-1.5 text-stone-500 hover:text-white" aria-label="إغلاق">
            <X size={16} />
          </button>
          {done ? (
            <div className="flex items-center gap-3 pr-1">
              <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
              <div>
                <div className="font-black text-white text-sm">تم تثبيت تطبيق خيرو بنجاح!</div>
                <div className="text-xs text-stone-400 mt-0.5">افتحه الآن من الشاشة الرئيسية</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src="/icon-192.png" alt="تطبيق خيرو" className="w-12 h-12 rounded-xl shrink-0 ring-1 ring-[#C9A227]/40" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-sm">حمّل تطبيق متجر خيرو</div>
                <div className="text-[11px] text-stone-400 mt-0.5">وصول أسرع وتجربة كاملة على موبايلك</div>
              </div>
              <button
                onClick={handleInstall}
                className="shrink-0 inline-flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#d8b53a] text-black font-black text-xs px-4 py-2.5 rounded-xl transition"
              >
                <Download size={14} /> تثبيت
              </button>
            </div>
          )}
        </div>
      </div>

      {showIosHelp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowIosHelp(false)} />
          <div className="relative bg-[#141414] border border-[#C9A227]/40 rounded-2xl max-w-sm w-full p-6">
            <button onClick={() => setShowIosHelp(false)} className="absolute left-4 top-4 p-1.5 text-stone-500 hover:text-white" aria-label="إغلاق">
              <X size={18} />
            </button>
            <h3 className="font-black text-white mb-1">تثبيت التطبيق على آيفون</h3>
            <p className="text-xs text-stone-400 mb-4">متصفح سفاري يتطلب التثبيت اليدوي بخطوتين:</p>
            <ol className="space-y-3 text-sm text-stone-200">
              <li className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="w-8 h-8 rounded-lg bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center shrink-0"><Share size={16} /></span>
                اضغط زر <b>المشاركة</b> في شريط سفاري بالأسفل
              </li>
              <li className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                <span className="w-8 h-8 rounded-lg bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center shrink-0"><PlusSquare size={16} /></span>
                اختر <b>إضافة إلى الشاشة الرئيسية</b> ثم إضافة
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Desktop hint icon (reused in footer button title) */}
      <span className="hidden"><MonitorDown size={1} /></span>
    </>
  );
}
