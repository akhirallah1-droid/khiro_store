import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const b = getBody(req);
      const name = (b.name || '').trim();
      const phone = (b.phone || '').replace(/\s/g, '');
      if (!name || name.length < 3) return res.status(400).json({ error: 'Name is required' });
      if (!/^01[0-9]{9}$/.test(phone)) return res.status(400).json({ error: 'Invalid Egyptian phone number' });
      const dozens = Math.max(1, Math.min(500, Number(b.dozens) || 1));
      const { data, error } = await supabase.from('k_wholesale_requests').insert({
        name, phone, city: b.city || null, product_id: b.product_id || null,
        product_name: b.product_name || null, dozens, total_pieces: dozens * 12,
        estimated_total: b.estimated_total ? Number(b.estimated_total) : 0,
        notes: b.notes || null, status: 'new',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'GET') {
      const { status } = req.query;
      let q = supabase.from('k_wholesale_requests').select('*, k_products(id, name_ar, image_url)').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['status','admin_notes','dozens','total_pieces','estimated_total','name','phone','city','notes'].forEach((k) => { if (b[k] !== undefined) patch[k] = b[k]; });
      const { data, error } = await supabase.from('k_wholesale_requests').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_wholesale_requests').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('wholesale API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
