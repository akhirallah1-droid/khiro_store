export function egp(n: number | string | null | undefined, currency = 'ج.م'): string {
  const v = Number(n || 0);
  const formatted = v.toLocaleString('en-EG', { maximumFractionDigits: 2 });
  return `${formatted} ${currency}`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

export const ORDER_STATUS_AR: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export const PAYMENT_STATUS_AR: Record<string, string> = {
  pending: 'غير مدفوع',
  paid: 'مدفوع',
  refunded: 'مسترد',
};

export const PAYMENT_METHOD_AR: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  vodafone_cash: 'فودافون كاش',
  instapay: 'انستاباي',
  bank: 'تحويل بنكي',
};

export const WHOLESALE_STATUS_AR: Record<string, string> = {
  new: 'جديد',
  contacted: 'تم التواصل',
  confirmed: 'تم التأكيد',
  done: 'تم التنفيذ',
  cancelled: 'ملغي',
};
