import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(60px,12vh,140px) clamp(14px,3vw,32px)', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(60px,14vw,120px)', color: 'var(--blue-100)', lineHeight: 1 }}>404</div>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(22px,3vw,32px)', margin: '10px 0 12px', color: 'var(--ink)' }}>Sahifa topilmadi</h1>
      <p style={{ fontSize: 16, color: 'var(--slate)', margin: '0 0 28px' }}>Siz qidirgan sahifa mavjud emas yoki ko‘chirilgan.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={routes.home()} style={{ background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 12 }}>Bosh sahifa</Link>
        <Link href={routes.catalog()} style={{ border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 15, fontWeight: 600, padding: '14px 24px', borderRadius: 12 }}>Loyihalar</Link>
      </div>
    </div>
  );
}
