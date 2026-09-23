import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { api, sha256Hex } from '../../lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) { setError('أدخل اسم المستخدم وكلمة المرور'); return; }
    setLoading(true);
    try {
      const password_hash = await sha256Hex(password);
      const data = await api.post('/api/admin_users', { action: 'login', username: username.trim(), password_hash });
      localStorage.setItem('khiro_admin_token', data.token);
      localStorage.setItem('khiro_admin_user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message === 'Invalid username or password' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : (err.message || 'فشل تسجيل الدخول'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="خيرو" className="w-20 h-20 mx-auto rounded-full object-cover ring-2 ring-[#C9A227] mb-4" />
          <h1 className="text-2xl font-black text-white">لوحة إدارة متجر خيرو</h1>
          <p className="text-stone-500 text-sm mt-1">هذه الصفحة مخصصة لإدارة المتجر فقط</p>
        </div>
        <form onSubmit={submit} className="bg-[#141414] border border-[#C9A227]/30 rounded-2xl p-7 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-400">اسم المستخدم</label>
            <div className="relative mt-1.5">
              <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" placeholder="username" className="w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 pr-11 pl-4 text-white text-sm outline-none text-left" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-400">كلمة المرور</label>
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? 'text' : 'password'} dir="ltr" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 focus:border-[#C9A227] rounded-xl py-3 pr-11 pl-11 text-white text-sm outline-none text-left" />
              <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {error && (
            <p className="flex items-center gap-2 text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <ShieldAlert size={15} /> {error}
            </p>
          )}
          <button disabled={loading} className="w-full bg-[#C9A227] hover:bg-[#d8b53a] disabled:opacity-50 text-black font-black py-3.5 rounded-xl transition">
            {loading ? 'جاري تسجيل الدخول...' : 'دخول لوحة الإدارة'}
          </button>
        </form>
        <p className="text-center text-xs text-stone-600 mt-5">
          <Link to="/" className="hover:text-[#C9A227]">← العودة للمتجر</Link>
        </p>
      </div>
    </div>
  );
}
