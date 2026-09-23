import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { category_id, featured, search, all } = req.query;
      let q = supabase.from('k_products').select('*, k_categories(id, name_ar)').order('id', { ascending: true });
      if (all !== '1') q = q.eq('is_active', true);
      if (category_id) q = q.eq('category_id', Number(category_id));
      if (featured === '1') q = q.eq('is_featured', true);
      if (search) q = q.ilike('name_ar', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });

    if (req.method === 'POST') {
      const b = getBody(req);
      if (!b.name_ar || b.price === undefined) return res.status(400).json({ error: 'name_ar and price are required' });
      const row = {
        name_ar: b.name_ar, name_en: b.name_en || null, description_ar: b.description_ar || null,
        category_id: b.category_id || null, price: Number(b.price), old_price: b.old_price ? Number(b.old_price) : null,
        wholesale_price: b.wholesale_price ? Number(b.wholesale_price) : null,
        min_wholesale_qty: b.min_wholesale_qty ? Number(b.min_wholesale_qty) : 12,
        stock: b.stock !== undefined ? Number(b.stock) : 0,
        image_url: b.image_url || null, images: Array.isArray(b.images) ? b.images : (b.image_url ? [b.image_url] : []),
        is_featured: !!b.is_featured, is_new: !!b.is_new, is_active: b.is_active !== false,
        badge_ar: b.badge_ar || null, weight_kg: b.weight_kg ? Number(b.weight_kg) : 0.5,
      };
      const { data, error } = await supabase.from('k_products').insert(row).select('*, k_categories(id, name_ar)').single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['name_ar','name_en','description_ar','category_id','price','old_price','wholesale_price','min_wholesale_qty','stock','image_url','images','is_featured','is_new','is_active','badge_ar','weight_kg','rating_avg','rating_count','sold_count'].forEach((k) => {
        if (b[k] !== undefined) patch[k] = b[k];
      });
      if (patch.price !== undefined) patch.price = Number(patch.price);
      const { data, error } = await supabase.from('k_products').update(patch).eq('id', b.id).select('*, k_categories(id, name_ar)').single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_products').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('products API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
