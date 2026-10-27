export const available = medicine => Number(medicine.stock_qty || 0) - Number(medicine.reserved_qty || 0);
export const dateOnly = value => String(value || '').slice(0, 10);
export function dateAfter(today, days) {
  const value = new Date(today + 'T12:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function normalise(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/([a-z])(\d)/g,'$1 $2').replace(/[^a-z0-9]+/g, ' ').replace(/\b0+(\d+)/g,'$1').trim();
}
export function matches(query, values) {
  const text = normalise(values.join(' '));
  return normalise(query).split(' ').filter(Boolean).every(word => text.includes(word) || word.length > 3 && text.split(' ').some(token => {
    if (Math.abs(token.length - word.length) > 1) return false;
    let a = 0, b = 0, edits = 0;
    while (a < token.length && b < word.length) {
      if (token[a] === word[b]) { a++; b++; continue; }
      if (++edits > 1) return false;
      if (token.length >= word.length) a++;
      if (word.length >= token.length) b++;
    }
    return edits + token.length - a + word.length - b <= 1;
  }));
}
export function monitorAlerts(data, today) {
  const alerts = [];
  const add = (id, category, level, title, detail, route, kind, row) => alerts.push({ id, category, level, title, detail, route, kind, row });
  for (const m of data.medicines || []) if (available(m) <= Number(m.reorder_level))
    add('stock-' + m.id, 'Stock', available(m) <= 0 ? 'urgent' : 'attention', m.brand_name, `${available(m)} available · minimum ${m.reorder_level}`, 'inventory', 'batch', m);
  for (const b of data.batches || []) if (Number(b.stock_qty) > 0 && dateOnly(b.expiry_date) <= dateAfter(today, 30)) {
    const expired = dateOnly(b.expiry_date) < today;
    add('expiry-' + b.id, 'Expiry', expired ? 'urgent' : 'attention', b.medicine_name, `${expired ? 'Expired' : 'Expires'} ${dateOnly(b.expiry_date)} · batch ${b.batch_number}`, 'batches');
  }
  for (const p of data.prescriptions || []) if (p.status === 'Pending Review')
    add('review-' + p.id, 'Review', 'attention', p.patient_name, `RX-${p.id} · needs prescription review`, 'prescriptions', 'rx-detail', p);
  for (const v of data.verifications || []) if (v.verification_status === 'Pending')
    add('upload-' + v.id, 'Review', 'attention', v.patient_name, `Uploaded prescription UP-${v.id} · needs review`, 'verification', 'verify', v);
  for (const c of data.checkups || []) if (c.status === 'Scheduled' && dateOnly(c.checkup_due_date) <= today)
    add('checkup-' + c.id, 'Follow-ups', 'attention', c.patient_name, `Follow-up due ${dateOnly(c.checkup_due_date)} · RX-${c.prescription_id}`, 'followups', 'checkup', c);
  for (const r of data.refills || []) if (dateOnly(r.next_refill_date) <= today)
    add('refill-' + r.id, 'Follow-ups', 'info', r.patient_name, `${r.medicine_name} · refill reminder due ${dateOnly(r.next_refill_date)}`, 'followups');
  // An ordinary missing address is not a safety alert. Only explicit profile requests are monitored.
  for (const p of data.patients || []) if (p.requires_full_profile && (!p.address?.trim() || !p.phone?.trim() || !p.date_of_birth))
    add('profile-' + p.id, 'Patient details', 'attention', p.name, 'Full profile requested · add the missing contact, address or date of birth', 'patients', 'patients', p);
  return alerts.sort((a, b) => ({urgent: 0, attention: 1, info: 2}[a.level] - {urgent: 0, attention: 1, info: 2}[b.level]));
}
