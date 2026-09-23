import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('k_categories').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'POST') {
      const b = getBody(req);
      if (!b.name_ar) return res.status(400).json({ error: 'name_ar is required' });
      const { data, error } = await supabase.from('k_categories').insert({
        name_ar: b.name_ar, name_en: b.name_en || null, description_ar: b.description_ar || null,
        image_url: b.image_url || null, sort_order: b.sort_order || 0, is_active: b.is_active !== false,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['name_ar','name_en','description_ar','image_url','sort_order','is_active'].forEach((k) => { if (b[k] !== undefined) patch[k] = b[k]; });
      const { data, error } = await supabase.from('k_categories').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_categories').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('categories API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
