import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';

export interface Product {
  id: number;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  category_id?: number | null;
  k_categories?: { id: number; name_ar: string } | null;
  price: number;
  old_price?: number | null;
  wholesale_price?: number | null;
  min_wholesale_qty?: number;
  stock: number;
  image_url?: string | null;
  images?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  badge_ar?: string | null;
  rating_avg?: number;
  rating_count?: number;
  sold_count?: number;
}

export interface Category {
  id: number;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
  wholesale: boolean;
}

interface StoreState {
  settings: Record<string, string>;
  settingsLoading: boolean;
  products: Product[];
  productsLoading: boolean;
  categories: Category[];
  cart: CartItem[];
  cartOpen: boolean;
  wholesaleMode: boolean;
  setWholesaleMode: (v: boolean) => void;
  addToCart: (p: Product, qty?: number, wholesale?: boolean) => void;
  updateQty: (id: number, wholesale: boolean, qty: number) => void;
  removeFromCart: (id: number, wholesale: boolean) => void;
  clearCart: () => void;
  setCartOpen: (v: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  refreshProducts: () => void;
}

const Ctx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('khiro_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [wholesaleMode, setWholesaleMode] = useState(false);

  const refreshProducts = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const s = await api.get('/api/store_settings');
        setSettings(s || {});
      } catch (e) {
        console.error(e);
      } finally {
        setSettingsLoading(false);
      }
      try {
        const c = await api.get('/api/categories');
        setCategories(Array.isArray(c) ? c.filter((x: Category) => x.is_active !== false) : []);
      } catch (e) {
        console.error(e);
      }
      refreshProducts();
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('khiro_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (p: Product, qty = 1, wholesale = false) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.product.id === p.id && c.wholesale === wholesale);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(500, next[i].qty + qty) };
        return next;
      }
      return [...prev, { product: p, qty, wholesale }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: number, wholesale: boolean, qty: number) => {
    if (qty < 1) {
      removeFromCart(id, wholesale);
      return;
    }
    setCart((prev) => prev.map((c) => (c.product.id === id && c.wholesale === wholesale ? { ...c, qty: Math.min(500, qty) } : c)));
  };

  const removeFromCart = (id: number, wholesale: boolean) => {
    setCart((prev) => prev.filter((c) => !(c.product.id === id && c.wholesale === wholesale)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartSubtotal = cart.reduce((s, c) => {
    const unit = c.wholesale && c.product.wholesale_price ? Number(c.product.wholesale_price) : Number(c.product.price);
    return s + unit * c.qty;
  }, 0);

  return (
    <Ctx.Provider
      value={{
        settings, settingsLoading, products, productsLoading, categories,
        cart, cartOpen, wholesaleMode, setWholesaleMode,
        addToCart, updateQty, removeFromCart, clearCart, setCartOpen,
        cartCount, cartSubtotal, refreshProducts,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
