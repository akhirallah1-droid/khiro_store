import supabase from './db-client.js';
import { setCors, getBody, verifyAdmin, getSettingsMap, num } from './_helpers.js';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return 'KH-' + s;
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    if (req.method === 'GET') {
      const { code, phone, status, limit } = req.query;
      if (code && phone) {
        const { data, error } = await supabase.from('k_orders').select('*').eq('order_code', String(code).toUpperCase()).single();
        if (error || !data) return res.status(404).json({ error: 'Order not found' });
        if (String(data.phone).replace(/\s/g, '') !== String(phone).replace(/\s/g, '')) return res.status(403).json({ error: 'Phone number does not match' });
        return res.status(200).json(data);
      }
      const admin = await verifyAdmin(req);
      if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
      let q = supabase.from('k_orders').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      if (limit) q = q.limit(Number(limit));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = getBody(req);
      const name = (b.customer_name || '').trim();
      const phone = (b.phone || '').replace(/\s/g, '');
      if (!name || name.length < 3) return res.status(400).json({ error: 'Customer name is required' });
      if (!/^01[0-9]{9}$/.test(phone)) return res.status(400).json({ error: 'Invalid Egyptian phone number' });
      if (!b.governorate) return res.status(400).json({ error: 'Governorate is required' });
      if (!b.address || String(b.address).trim().length < 5) return res.status(400).json({ error: 'Address is required' });
      const items = Array.isArray(b.items) ? b.items : [];
      if (!items.length) return res.status(400).json({ error: 'Order items are required' });

      const settings = await getSettingsMap();
      const isWholesale = !!b.is_wholesale;
      const paymentMethod = b.payment_method || 'cod';

      const ids = [...new Set(items.map((i) => Number(i.product_id)).filter(Boolean))];
      const { data: products } = await supabase.from('k_products').select('*').in('id', ids);
      const pmap = {};
      (products || []).forEach((p) => { pmap[p.id] = p; });

      let subtotal = 0;
      const lines = [];
      for (const it of items) {
        const p = pmap[Number(it.product_id)];
        if (!p || !p.is_active) return res.status(400).json({ error: `Product ${it.product_id} unavailable` });
        const qty = Math.max(1, Math.min(500, Number(it.qty) || 1));
        const unit = isWholesale && p.wholesale_price ? Number(p.wholesale_price) : Number(p.price);
        subtotal += unit * qty;
        lines.push({ product_id: p.id, name_ar: p.name_ar, image_url: p.image_url, qty, unit_price: unit, line_total: Math.round(unit * qty * 100) / 100 });
      }
      subtotal = Math.round(subtotal * 100) / 100;

      let shippingFee = num(settings.default_shipping_fee, 60);
      const { data: rate } = await supabase.from('k_shipping_rates').select('*').eq('governorate', b.governorate).eq('is_active', true).maybeSingle();
      if (rate) shippingFee = Number(rate.fee);
      const freeThreshold = num(settings.free_shipping_threshold, 0);
      if (freeThreshold > 0 && subtotal >= freeThreshold) shippingFee = 0;

      const codFee = paymentMethod === 'cod' ? num(settings.cod_fee, 0) : 0;

      let discount = 0;
      let couponCode = null;
      let couponRow = null;
      if (b.coupon_code) {
        const { data: cp } = await supabase.from('k_coupons').select('*').eq('code', String(b.coupon_code).toUpperCase()).eq('is_active', true).maybeSingle();
        if (!cp) return res.status(400).json({ error: 'Invalid coupon code' });
        if (cp.expires_at && new Date(cp.expires_at) < new Date()) return res.status(400).json({ error: 'Coupon expired' });
        if (cp.usage_limit && Number(cp.used_count) >= Number(cp.usage_limit)) return res.status(400).json({ error: 'Coupon usage limit reached' });
        if (subtotal < Number(cp.min_order || 0)) return res.status(400).json({ error: `Coupon requires minimum order of ${cp.min_order}` });
        discount = cp.type === 'percent' ? (subtotal * Number(cp.value)) / 100 : Number(cp.value);
        if (cp.max_discount && Number(cp.max_discount) > 0) discount = Math.min(discount, Number(cp.max_discount));
        discount = Math.min(Math.round(discount * 100) / 100, subtotal);
        couponCode = cp.code;
        couponRow = cp;
      }
      const total = Math.round((subtotal - discount + shippingFee + codFee) * 100) / 100;

      let orderCode = genCode();
      for (let i = 0; i < 3; i++) {
        const { data: exists } = await supabase.from('k_orders').select('id').eq('order_code', orderCode).maybeSingle();
        if (!exists) break;
        orderCode = genCode();
      }
      const { data, error } = await supabase.from('k_orders').insert({
        order_code: orderCode, customer_name: name, phone, governorate: b.governorate,
        address: String(b.address).trim(), notes: b.notes || null, items: lines,
        subtotal, shipping_fee: shippingFee, cod_fee: codFee, discount, total,
        coupon_code: couponCode, payment_method: paymentMethod, payment_status: 'pending',
        status: 'pending', is_wholesale: isWholesale,
      }).select().single();
      if (error) throw error;

      for (const ln of lines) {
        const p = pmap[ln.product_id];
        await supabase.from('k_products').update({ stock: Math.max(0, Number(p.stock || 0) - ln.qty), sold_count: Number(p.sold_count || 0) + ln.qty }).eq('id', p.id);
      }
      if (couponRow) await supabase.from('k_coupons').update({ used_count: Number(couponRow.used_count || 0) + 1 }).eq('id', couponRow.id);
      return res.status(201).json(data);
    }

    const admin = await verifyAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Unauthorized - admin only' });
    if (req.method === 'PUT') {
      const b = getBody(req);
      if (!b.id) return res.status(400).json({ error: 'id is required' });
      const patch = {};
      ['status','payment_status','payment_method','customer_name','phone','governorate','address','notes','shipping_fee','discount','total','is_wholesale'].forEach((k) => { if (b[k] !== undefined) patch[k] = b[k]; });
      const { data, error } = await supabase.from('k_orders').update(patch).eq('id', b.id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const b = getBody(req);
      const id = b.id || req.query.id;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const { error } = await supabase.from('k_orders').delete().eq('id', Number(id));
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('orders API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
