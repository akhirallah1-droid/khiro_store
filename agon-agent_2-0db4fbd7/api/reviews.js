import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

async function recomputeRating(productId) {
  const { data } = await supabase.from('k_reviews').select('rating').eq('product_id', productId).eq('is_approved', true);
  const count = (data || []).length;
  const avg = count ? (data.reduce((s, r) => s + Number(r.rating), 0) / count) : 0;
  await supabase.from('k_products').update({ rating_avg: Math.round(avg * 10) / 10, rating_count: count }).eq('id', productId);
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { product_id, all } = req.query;
      let q = supabase.from('k_reviews').select('*, k_products(id, name_ar, image_url)').order('created_at', { ascending: false });
      if (product_id) q = q.eq('product_id', Number(product_id));
      if (all === '1') {
        const admin = await verifyAdmin(req);
        if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
      } else {
        q = q.eq('is_approved', true);
      }
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const b = getBody(req);
      if (!b.product_id) return res.status(400).json({ error: 'product_id is required' });
      if (!b.customer_name || String(b.customer_name).trim().length < 2) return res.status(400).json({ error: 'Name is required' });
      const rating = Math.max(1, Math.min(5, Number(b.rating) || 5));
      const { data, error } = await supabase.from('k_reviews').insert({
        product_id: Number(b.product_id), customer_name: String(b.customer_name).trim(),
        rating, comment: (b.comment || '').trim() || null, is_approved: false,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      if (b.is_approved !== undefined) patch.is_approved = !!b.is_approved;
      if (b.comment !== undefined) patch.comment = b.comment;
      const { data, error } = await supabase.from('k_reviews').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      if (b.is_approved !== undefined) await recomputeRating(data.product_id);
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { data: row } = await supabase.from('k_reviews').select('product_id').eq('id', Number(id)).single();
      const { error } = await supabase.from('k_reviews').delete().eq('id', Number(id));
      if (error) throw error;
      if (row) await recomputeRating(row.product_id);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('reviews API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
