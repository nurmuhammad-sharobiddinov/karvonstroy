'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/store/AppContext';
import { routes } from '@/lib/routes';

// Sticky header: utility bar (city, phone, favourites, login) + main nav +
// mobile hamburger. All links are real routes.
export default function Header() {
  const { state } = useApp();
  const [mobOpen, setMobOpen] = useState(false);

  const LINKS: { href: string; label: string }[] = [
    { href: routes.catalog(), label: 'Loyihalar' },
    { href: routes.mortgage(), label: 'Ipoteka' },
    { href: routes.online(), label: 'Online xarid' },
    { href: routes.news('n1'), label: 'Yangiliklar' },
  ];

  const linkBtn = { fontSize: '14.5px', fontWeight: 500, color: 'var(--ink)' } as const;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 60, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
      {/* utility bar */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '8px clamp(14px,3vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--slate)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--blue)' }}>◉</span> Qarshi shahri
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,2vw,22px)' }}>
          {state.favorites.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EF476F', fontSize: 13, fontWeight: 700 }}>
              ♥ <span style={{ color: 'var(--slate)' }}>Sevimlilar ({state.favorites.length})</span>
            </span>
          )}
          <a href="tel:1360" style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, color: 'var(--ink)', fontSize: 15 }}>☎ 1360</a>
          <Link href={routes.online()} style={{ border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8 }}>
            Kirish
          </Link>
        </div>
      </div>

      {/* main bar */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px clamp(14px,3vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <Link href={routes.home()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/img/logo.svg" alt="Karvon Stroy" width={40} height={40} style={{ display: 'block' }} />
          <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>
            KARVON<span style={{ color: 'var(--blue)' }}> STROY</span>
          </span>
        </Link>

        <nav className="mk-navlinks" style={{ alignItems: 'center', gap: 'clamp(10px,1.6vw,26px)' }}>
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} style={linkBtn}>{l.label}</Link>
          ))}
        </nav>

        <button className="mk-burger" onClick={() => setMobOpen((v) => !v)} aria-label="Menyu" aria-expanded={mobOpen} style={{ border: '1px solid var(--line)', background: '#fff', borderRadius: 9, width: 42, height: 42, fontSize: 18, cursor: 'pointer' }}>☰</button>
      </div>

      {/* mobile menu — same links as desktop */}
      {mobOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px clamp(14px,3vw,32px) 16px', borderTop: '1px solid var(--line)', gap: 2 }}>
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMobOpen(false)} style={{ borderBottom: '1px solid var(--line)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', padding: '13px 0' }}>{l.label}</Link>
          ))}
          <Link href={routes.catalog()} onClick={() => setMobOpen(false)} style={{ marginTop: 8, textAlign: 'center', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '13px 0', borderRadius: 10 }}>Kvartira tanlash</Link>
        </div>
      )}

      <style jsx>{`
        .mk-navlinks { display: flex; }
        .mk-burger { display: none; }
        @media (max-width: 860px) {
          .mk-navlinks { display: none !important; }
          .mk-burger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
