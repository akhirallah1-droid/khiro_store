import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Boxes, MessageSquare, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { egp, ORDER_STATUS_AR } from '../../lib/format';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [wholesale, setWholesale] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, p, w, m] = await Promise.all([
          api.get('/api/orders', true),
          api.get('/api/products?all=1', true),
          api.get('/api/wholesale_requests', true),
          api.get('/api/contact_messages', true),
        ]);
        setOrders(Array.isArray(o) ? o : []);
        setProducts(Array.isArray(p) ? p : []);
        setWholesale(Array.isArray(w) ? w : []);
        setMessages(Array.isArray(m) ? m : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === 'pending').length;
  const lowStock = products.filter((p) => Number(p.stock) <= 5);
  const newWholesale = wholesale.filter((w) => w.status === 'new').length;
  const unread = messages.filter((m) => !m.is_read).length;

  const cards = [
    { icon: TrendingUp, label: 'إجمالي الإيرادات', value: egp(revenue), color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { icon: ShoppingBag, label: 'إجمالي الطلبات', value: String(orders.length), color: 'text-[#C9A227]', bg: 'bg-[#C9A227]/10 border-[#C9A227]/30' },
    { icon: Boxes, label: 'طلبات الجملة الجديدة', value: String(newWholesale), color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    { icon: MessageSquare, label: 'رسائل غير مقروءة', value: String(unread), color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
    { icon: Package, label: 'عدد المنتجات', value: String(products.length), color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    { icon: AlertTriangle, label: 'منتجات منخفضة المخزون', value: String(lowStock.length), color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  ];

  if (loading) return <div className="text-stone-400">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-1">لوحة التحكم</h1>
      <p className="text-sm text-stone-500 mb-6">نظرة شاملة على أداء متجر خيرو</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className={`border rounded-2xl p-5 ${c.bg}`}>
            <c.icon size={22} className={c.color} />
            <div className={`text-2xl font-black mt-2 ${c.color}`}>{c.value}</div>
            <div className="text-xs text-stone-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-white">أحدث الطلبات {pending > 0 && <span className="text-xs bg-[#C9A227] text-black px-2 py-0.5 rounded-full mr-1">{pending} بانتظار التأكيد</span>}</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-[#C9A227]">عرض الكل</Link>
          </div>
          <div className="space-y-2.5">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 text-sm">
                <div>
                  <span className="font-black text-[#C9A227]" dir="ltr">{o.order_code}</span>
                  <span className="text-stone-400 text-xs mr-2">{o.customer_name}</span>
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-xs">{egp(o.total)}</div>
                  <div className="text-[11px] text-stone-500">{ORDER_STATUS_AR[o.status]}</div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-stone-500 text-sm text-center py-4">لا توجد طلبات بعد</p>}
          </div>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-white flex items-center gap-2"><AlertTriangle size={17} className="text-red-400" /> تنبيهات المخزون</h2>
            <Link to="/admin/products" className="text-xs font-bold text-[#C9A227]">إدارة المنتجات</Link>
          </div>
          <div className="space-y-2.5">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5">
                <img src={p.image_url || '/images/p1.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 text-sm font-bold text-white">{p.name_ar}</div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${Number(p.stock) === 0 ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {Number(p.stock) === 0 ? 'نفد' : `متبقي ${p.stock}`}
                </span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-emerald-400 text-sm text-center py-4 flex items-center justify-center gap-2"><Star size={15} /> المخزون بحالة جيدة</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
