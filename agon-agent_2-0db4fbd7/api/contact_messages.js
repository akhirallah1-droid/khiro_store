import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const b = getBody(req);
      const name = (b.name || '').trim();
      if (!name || name.length < 2) return res.status(400).json({ error: 'Name is required' });
      if (!b.message || String(b.message).trim().length < 3) return res.status(400).json({ error: 'Message is required' });
      const { data, error } = await supabase.from('k_contact_messages').insert({
        name, phone: b.phone || null, email: b.email || null,
        subject: b.subject || 'استفسار عام', message: String(b.message).trim(),
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('k_contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const { data, error } = await supabase.from('k_contact_messages').update({ is_read: b.is_read !== false }).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_contact_messages').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('contact API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
