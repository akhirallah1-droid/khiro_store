import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const { products, productsLoading, categories, wholesaleMode, setWholesaleMode } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>(params.get('cat') || '');
  const [sort, setSort] = useState('new');

  useEffect(() => {
    const c = params.get('cat') || '';
    setCat(c);
  }, [params]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat) list = list.filter((p) => String(p.category_id) === cat);
    if (q.trim()) list = list.filter((p) => p.name_ar.includes(q.trim()) || (p.description_ar || '').includes(q.trim()));
    if (sort === 'cheap') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'exp') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'rate') list.sort((a, b) => Number(b.rating_avg || 0) - Number(a.rating_avg || 0));
    else if (sort === 'sold') list.sort((a, b) => Number(b.sold_count || 0) - Number(a.sold_count || 0));
    return list;
  }, [products, cat, q, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">تسوق منتجات خيرو</h1>
          <p className="text-stone-400 text-sm mt-1">{filtered.length} منتج متاح</p>
          <div className="w-16 h-1 bg-[#C9A227] rounded-full mt-3" />
        </div>
        <button
          onClick={() => setWholesaleMode(!wholesaleMode)}
          className={`flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-full border transition ${
            wholesaleMode ? 'bg-[#C9A227] text-black border-[#C9A227]' : 'text-stone-300 border-stone-700 hover:border-[#C9A227]'
          }`}
        >
          <Package size={16} /> {wholesaleMode ? 'عرض أسعار الجملة ✓' : 'عرض أسعار الجملة'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-[#141414] border border-white/10 focus:border-[#C9A227] rounded-xl py-3 pr-11 pl-4 text-white placeholder:text-stone-500 outline-none transition"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-[#141414] border border-white/10 rounded-xl py-3 pr-11 pl-8 text-white text-sm font-bold outline-none cursor-pointer"
          >
            <option value="new">الأحدث</option>
            <option value="sold">الأكثر مبيعاً</option>
            <option value="rate">الأعلى تقييماً</option>
            <option value="cheap">السعر: من الأقل</option>
            <option value="exp">السعر: من الأعلى</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => { setCat(''); setParams({}); }}
          className={`shrink-0 text-sm font-bold px-5 py-2.5 rounded-full border transition ${!cat ? 'bg-[#C9A227] text-black border-[#C9A227]' : 'text-stone-300 border-white/10 hover:border-[#C9A227]/60'}`}
        >
          الكل
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCat(String(c.id)); setParams({ cat: String(c.id) }); }}
            className={`shrink-0 text-sm font-bold px-5 py-2.5 rounded-full border transition ${cat === String(c.id) ? 'bg-[#C9A227] text-black border-[#C9A227]' : 'text-stone-300 border-white/10 hover:border-[#C9A227]/60'}`}
          >
            {c.name_ar}
          </button>
        ))}
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-[#141414] rounded-2xl aspect-[3/4] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <Search size={44} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">لا توجد منتجات مطابقة لبحثك</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
