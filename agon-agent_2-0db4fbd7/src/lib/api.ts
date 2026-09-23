const BASE = '';

export function adminHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const t = localStorage.getItem('khiro_admin_token');
    if (t) h['x-admin-token'] = t;
  } catch {}
  return h;
}

async function handle(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data && typeof data === 'object' && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  get: (path: string, admin = false) =>
    fetch(BASE + path, { headers: admin ? adminHeaders() : { 'Content-Type': 'application/json' } }).then(handle),
  post: (path: string, body: any, admin = false) =>
    fetch(BASE + path, { method: 'POST', headers: admin ? adminHeaders() : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
  put: (path: string, body: any, admin = false) =>
    fetch(BASE + path, { method: 'PUT', headers: admin ? adminHeaders() : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
  del: (path: string, body: any = {}, admin = false) =>
    fetch(BASE + path, { method: 'DELETE', headers: admin ? adminHeaders() : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
};

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const isValidEgyptPhone = (p: string) => /^01[0-9]{9}$/.test((p || '').replace(/\s/g, ''));
