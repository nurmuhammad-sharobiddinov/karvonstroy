'use client';

import Image from 'next/image';
import { useApp } from '@/store/AppContext';
import { NEWS, type News } from '@/lib/data';

export default function NewsDetail({ news: cur }: { news: News }) {
  const { actions } = useApp();
  const others = NEWS.filter((n) => n.id !== cur.id);

  return (
    <section className="mk-screen">
      {/* cover */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(320px,50vh,520px)', overflow: 'hidden', background: '#0A1220' }}>
        <Image src={cur.img} alt={cur.title} fill sizes="100vw" priority style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(6,13,26,.9),rgba(6,13,26,.2) 55%,rgba(6,13,26,.35))' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(14px,3vw,32px) clamp(28px,4vh,48px)' }}>
            <button onClick={() => actions.goHome()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 9, cursor: 'pointer', marginBottom: 22 }}>← Yangiliklar</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ background: 'var(--blue)', color: '#fff', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 6 }}>{cur.cat}</span>
              <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 13.5 }}>{cur.date}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(26px,4vw,48px)', lineHeight: 1.08, letterSpacing: '-.02em', margin: 0, color: '#fff', maxWidth: '22ch' }}>{cur.title}</h1>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(32px,5vw,60px) clamp(14px,3vw,32px)' }}>
        <p style={{ fontSize: 'clamp(17px,1.5vw,20px)', lineHeight: 1.7, color: 'var(--ink)', fontWeight: 500, margin: '0 0 28px' }}>{cur.excerpt}</p>
        {cur.body.map((para, i) => (
          <p key={i} style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--slate)', margin: '0 0 22px' }}>{para}</p>
        ))}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
          <button onClick={() => actions.goCatalog()} style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 12, cursor: 'pointer' }}>Loyihalarni ko‘rish</button>
          <button onClick={() => actions.showToast('Ulashish havolasi nusxalandi')} style={{ border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 15, fontWeight: 600, padding: '14px 22px', borderRadius: 12, cursor: 'pointer' }}>Ulashish</button>
        </div>
      </div>

      {/* other news */}
      <div style={{ background: 'var(--soft)', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(14px,3vw,32px)' }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px,2.8vw,32px)', letterSpacing: '-.02em', margin: '0 0 26px', color: 'var(--ink)' }}>Boshqa yangiliklar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 'clamp(16px,2vw,24px)' }}>
            {others.map((n) => (
              <div key={n.id} onClick={() => actions.goNews(n.id)} className="mk-othernews" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .24s ease' }}>
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: 'var(--soft)' }}>
                  <Image src={n.img} alt={n.title} fill sizes="300px" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ color: 'var(--blue)', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{n.cat}</span>
                    <span style={{ color: 'var(--mute)', fontSize: 12 }}>{n.date}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 18, lineHeight: 1.25, letterSpacing: '-.01em', margin: 0, color: 'var(--ink)' }}>{n.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .mk-othernews:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: var(--blue-100); }
      `}</style>
    </section>
  );
}
