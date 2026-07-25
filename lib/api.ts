// ============================================================================
// KARVON STROY — lead submission. Single choke-point for every form/CTA so a
// real backend can be wired here later. For now it simulates a short network
// round-trip and resolves.
// ============================================================================

export type Lead = {
  name?: string;
  phone?: string;
  project?: string;
  source: string; // qaysi forma/tugma: 'ipoteka' | 'ariza' | 'bron' | 'qongiroq' | ...
  meta?: Record<string, string | number>;
};

/** O‘zbek telefon raqami: +998 XX XXX XX XX (probellar/qavslar ixtiyoriy). */
export function isValidUzPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  return /^998\d{9}$/.test(digits) || /^\d{9}$/.test(digits);
}

/** Telefon maskasi: 90 123 45 67 → +998 90 123 45 67 */
export function formatUzPhone(v: string): string {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const p = ['+998'];
  if (d.length) p.push(' ' + d.slice(0, 2));
  if (d.length > 2) p.push(' ' + d.slice(2, 5));
  if (d.length > 5) p.push(' ' + d.slice(5, 7));
  if (d.length > 7) p.push(' ' + d.slice(7, 9));
  return p.join('');
}

export async function submitLead(lead: Lead): Promise<{ ok: boolean }> {
  // TODO: real endpoint, masalan:
  // await fetch('/api/leads', { method: 'POST', body: JSON.stringify(lead) })
  await new Promise((r) => setTimeout(r, 700));
  if (typeof console !== 'undefined') console.info('[lead]', lead);
  return { ok: true };
}
