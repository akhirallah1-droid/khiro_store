import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { code, active } = req.query;
      let q = supabase.from('k_coupons').select('*').order('created_at', { ascending: false });
      if (code) q = q.eq('code', String(code).toUpperCase());
      if (active === '1') q = q.eq('is_active', true);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'POST') {
      const b = getBody(req);
      if (!b.code) return res.status(400).json({ error: 'code is required' });
      const { data, error } = await supabase.from('k_coupons').insert({
        code: String(b.code).toUpperCase(), type: b.type || 'percent', value: Number(b.value || 0),
        min_order: Number(b.min_order || 0), max_discount: b.max_discount ? Number(b.max_discount) : null,
        usage_limit: b.usage_limit ? Number(b.usage_limit) : null, is_active: b.is_active !== false,
        expires_at: b.expires_at || null,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['code','type','value','min_order','max_discount','usage_limit','used_count','is_active','expires_at'].forEach((k) => { if (b[k] !== undefined) patch[k] = b[k]; });
      if (patch.code) patch.code = String(patch.code).toUpperCase();
      const { data, error } = await supabase.from('k_coupons').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_coupons').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('coupons API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
