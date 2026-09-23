import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      let q = supabase.from('k_shipping_rates').select('*').order('fee', { ascending: true });
      if (req.query.active === '1') q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'POST') {
      const b = getBody(req);
      if (!b.governorate) return res.status(400).json({ error: 'governorate is required' });
      const { data, error } = await supabase.from('k_shipping_rates').insert({
        governorate: b.governorate, zone_ar: b.zone_ar || null, fee: Number(b.fee || 0),
        delivery_days_ar: b.delivery_days_ar || null, is_active: b.is_active !== false,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['governorate','zone_ar','fee','delivery_days_ar','is_active'].forEach((k) => { if (b[k] !== undefined) patch[k] = b[k]; });
      const { data, error } = await supabase.from('k_shipping_rates').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_shipping_rates').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('shipping API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
