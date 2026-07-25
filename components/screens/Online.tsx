'use client';

import { useApp } from '@/store/AppContext';
import { ONLINE_STEPS, REVIEWS } from '@/lib/data';

export default function Online() {
  const { actions } = useApp();
  const benefits = [
    { t: 'Vaqtni tejash', d: 'Shartnoma 30 daqiqada.' },
    { t: 'Xavfsiz to‘lov', d: 'Bank himoyasi ostida.' },
    { t: 'Onlayn chegirma', d: 'Maxsus narxlar.' },
  ];
  return (
    <section className="mk-screen" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(22px,3vw,44px) clamp(14px,3vw,32px) clamp(40px,5vw,70px)', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 14 }}>Online xarid</div>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(26px,3.6vw,46px)', letterSpacing: '-.02em', margin: '0 auto 14px', color: 'var(--ink)', maxWidth: '20ch' }}>4 bosqichda kvartirani onlayn sotib oling</h1>
      <p style={{ fontSize: 16, color: 'var(--slate)', margin: '0 auto 44px', maxWidth: '56ch' }}>Ofisga bormasdan, uydan turib. Har bir bosqichda shaxsiy menejer siz bilan.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, textAlign: 'left', marginBottom: 48 }}>
        {ONLINE_STEPS.map((s) => (
          <div key={s.num} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 40, color: 'var(--blue-100)', lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 26, margin: '10px 0' }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 20, padding: 'clamp(28px,4vw,48px)' }}>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px,2.8vw,32px)', margin: '0 0 8px', color: 'var(--ink)' }}>Nega onlayn?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 18, margin: '26px 0 34px', textAlign: 'left' }}>
          {benefits.map((b) => (
            <div key={b.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--free)', fontSize: 20 }}>✓</span>
              <div><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{b.t}</div><div style={{ fontSize: 13.5, color: 'var(--slate)' }}>{b.d}</div></div>
            </div>
          ))}
        </div>
        <button onClick={() => actions.showToast('Ariza qabul qilindi — menejer bog‘lanadi ✓')} style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 16, fontWeight: 700, padding: '16px 34px', borderRadius: 12, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>Hoziroq boshlash</button>
      </div>

      <h3 style={{ fontWeight: 700, fontSize: 22, margin: '48px 0 18px', color: 'var(--ink)' }}>Mijozlar sharhlari</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, textAlign: 'left' }}>
        {REVIEWS.map((r) => (
          <div key={r.abbr} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 22 }}>
            <div style={{ color: '#F5A623', marginBottom: 10 }}>★★★★★</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--slate)', margin: '0 0 16px' }}>{r.text}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-050)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{r.abbr}</span>
              <div><div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>{r.name}</div><div style={{ fontSize: 12.5, color: 'var(--mute)' }}>{r.role}</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
