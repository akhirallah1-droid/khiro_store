import supabase from './db-client.js';

export function setCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}

export function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return {}; }
  }
  return req.body;
}

export function makeToken(user) {
  return Buffer.from(`${user.id}:${user.username}`, 'utf8').toString('base64');
}

export async function verifyAdmin(req) {
  try {
    const token = req.headers['x-admin-token'];
    if (!token) return null;
    const decoded = Buffer.from(String(token), 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    if (sep < 0) return null;
    const id = Number(decoded.slice(0, sep));
    const username = decoded.slice(sep + 1);
    if (!id || !username) return null;
    const { data, error } = await supabase.from('k_admin_users').select('*').eq('id', id).single();
    if (error || !data || !data.is_active || data.username !== username) return null;
    return data;
  } catch {
    return null;
  }
}

export function safeAdmin(u) {
  if (!u) return null;
  return { id: u.id, username: u.username, full_name: u.full_name, role: u.role, is_active: u.is_active, last_login: u.last_login, created_at: u.created_at };
}

export async function getSettingsMap() {
  const { data } = await supabase.from('k_store_settings').select('key, value');
  const map = {};
  (data || []).forEach((r) => { map[r.key] = r.value ?? ''; });
  return map;
}

export function num(v, fallback = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}
