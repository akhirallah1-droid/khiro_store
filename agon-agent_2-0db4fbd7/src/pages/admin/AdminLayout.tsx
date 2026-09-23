import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Ticket, Truck,
  Settings, Users, MessageSquare, Star, LogOut, Menu, X, Store, Boxes,
} from 'lucide-react';
import { api } from '../../lib/api';

interface AdminUser {
  id: number;
  username: string;
  full_name?: string;
  role: 'owner' | 'manager';
}

export default function AdminLayout() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('khiro_admin_token');
    if (!token) {
      setLoading(false);
      navigate('/admin', { replace: true });
      return;
    }
    api.get('/api/admin_users?me=1', true)
      .then((d) => {
        setUser(d.user);
        localStorage.setItem('khiro_admin_user', JSON.stringify(d.user));
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('khiro_admin_token');
        localStorage.removeItem('khiro_admin_user');
        navigate('/admin', { replace: true });
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('khiro_admin_token');
    localStorage.removeItem('khiro_admin_user');
    navigate('/admin');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-stone-400">جاري التحقق...</div>;
  }
  if (!user) return null;

  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'الرئيسية', owner: false },
    { to: '/admin/orders', icon: ShoppingBag, label: 'الطلبات', owner: false },
    { to: '/admin/wholesale', icon: Boxes, label: 'طلبات الجملة', owner: false },
    { to: '/admin/products', icon: Package, label: 'المنتجات', owner: false },
    { to: '/admin/categories', icon: FolderOpen, label: 'الأقسام', owner: false },
    { to: '/admin/coupons', icon: Ticket, label: 'كوبونات الخصم', owner: false },
    { to: '/admin/shipping', icon: Truck, label: 'أسعار الشحن', owner: false },
    { to: '/admin/reviews', icon: Star, label: 'التقييمات', owner: false },
    { to: '/admin/messages', icon: MessageSquare, label: 'رسائل العملاء', owner: false },
    { to: '/admin/settings', icon: Settings, label: 'إعدادات المتجر', owner: false },
    { to: '/admin/admins', icon: Users, label: 'مدراء الموقع', owner: true },
  ];

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${isActive ? 'bg-[#C9A227] text-black' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`;

  const sidebar = (
    <div className="flex flex-col h-full">
      <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <img src="/logo.png" alt="خيرو" className="w-10 h-10 rounded-full object-cover ring-2 ring-[#C9A227]" />
        <div>
          <div className="font-black text-white text-sm">إدارة خيرو</div>
          <div className="text-[11px] text-stone-500">{user.full_name || user.username} • {user.role === 'owner' ? 'مالك' : 'مدير'}</div>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {links.filter((l) => !l.owner || user.role === 'owner').map((l) => (
          <NavLink key={l.to} to={l.to} className={linkCls} onClick={() => setMenuOpen(false)}>
            <l.icon size={18} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-300 hover:bg-white/5">
          <Store size={18} /> عرض المتجر
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10">
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-[#111] border-l border-white/10 h-screen sticky top-0">
        {sidebar}
      </aside>
      {/* mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#111] border-l border-white/10">
            <button onClick={() => setMenuOpen(false)} className="absolute left-3 top-4 p-2 text-stone-400"><X size={20} /></button>
            {sidebar}
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-[#111]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <span className="font-black text-white text-sm">إدارة خيرو</span>
          <button onClick={() => setMenuOpen(true)} className="p-2 text-stone-300"><Menu size={20} /></button>
        </div>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
