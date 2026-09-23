import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin, makeToken, safeAdmin } from './_helpers.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'POST') {
      const b = getBody(req);
      if (b.action === 'login') {
        const { username, password_hash } = b;
        if (!username || !password_hash) return res.status(400).json({ error: 'username and password are required' });
        const { data } = await supabase.from('k_admin_users').select('*').eq('username', String(username).trim()).single();
        if (!data || data.password_hash !== password_hash) return res.status(401).json({ error: 'Invalid username or password' });
        if (!data.is_active) return res.status(403).json({ error: 'Account is disabled' });
        await supabase.from('k_admin_users').update({ last_login: new Date().toISOString() }).eq('id', data.id);
        return res.status(200).json({ token: makeToken(data), user: safeAdmin(data) });
      }
      const admin = await verifyAdmin(req);
      if (!admin || admin.role !== 'owner') return res.status(403).json({ error: 'Only the owner can manage admins' });
      if (b.action === 'create') {
        if (!b.username || !b.password_hash) return res.status(400).json({ error: 'username and password are required' });
        const { data, error } = await supabase.from('k_admin_users').insert({
          username: String(b.username).trim(), password_hash: b.password_hash,
          full_name: b.full_name || null, role: b.role === 'owner' ? 'owner' : 'manager', is_active: true,
        }).select().single();
        if (error) {
          if (String(error.message).includes('duplicate')) return res.status(400).json({ error: 'Username already exists' });
          throw error;
        }
        return res.status(201).json(safeAdmin(data));
      }
      return res.status(400).json({ error: 'Unknown action' });
    }
    if (req.method === 'GET') {
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Unauthorized' });
      if (req.query.me === '1') return res.status(200).json({ user: safeAdmin(admin) });
      if (admin.role !== 'owner') return res.status(403).json({ error: 'Only the owner can view admins' });
      const { data, error } = await supabase.from('k_admin_users').select('*').order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json((data || []).map(safeAdmin));
    }
    if (req.method === 'PUT') {
      const admin = await verifyAdmin(req);
      if (!admin || admin.role !== 'owner') return res.status(403).json({ error: 'Only the owner can manage admins' });
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      if (b.full_name !== undefined) patch.full_name = b.full_name;
      if (b.role !== undefined) patch.role = b.role === 'owner' ? 'owner' : 'manager';
      if (b.is_active !== undefined) patch.is_active = !!b.is_active;
      if (b.password_hash) patch.password_hash = b.password_hash;
      if (Number(b.id) === Number(admin.id) && patch.is_active === false) return res.status(400).json({ error: 'You cannot disable your own account' });
      const { data, error } = await supabase.from('k_admin_users').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(safeAdmin(data));
    }
    if (req.method === 'DELETE') {
      const admin = await verifyAdmin(req);
      if (!admin || admin.role !== 'owner') return res.status(403).json({ error: 'Only the owner can manage admins' });
      const b = getBody(req);
      const id = Number(b.id || req.query.id);
      if (!id) return res.status(400).json({ error: 'id is required' });
      if (id === Number(admin.id)) return res.status(400).json({ error: 'You cannot delete your own account' });
      const { error } = await supabase.from('k_admin_users').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin_users API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
