import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('k_store_settings').select('key, value');
      if (error) throw error;
      const map = {};
      (data || []).forEach((r) => { map[r.key] = r.value ?? ''; });
      return res.status(200).json(map);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'PUT') {
      const b = getBody(req);
      const entries = b.settings && typeof b.settings === 'object' ? Object.entries(b.settings) : (b.key ? [[b.key, b.value ?? '']] : []);
      if (!entries.length) return res.status(400).json({ error: 'No settings provided' });
      for (const [key, value] of entries) {
        const { error } = await supabase.from('k_store_settings').upsert({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
      }
      return res.status(200).json({ ok: true, updated: entries.length });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('settings API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
