'use client';

import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import PhoneIcon from './PhoneIcon';

export default function Footer() {
  const link = { color: 'rgba(255,255,255,.6)', textAlign: 'left' as const, fontSize: 14 };
  const links: { href: string; label: string }[] = [
    { href: routes.catalog(), label: 'Loyihalar' },
    { href: routes.mortgage(), label: 'Ipoteka' },
    { href: routes.online(), label: 'Online xarid' },
  ];

  return (
    <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,.72)', padding: 'clamp(44px,6vw,72px) clamp(14px,3vw,32px) 32px', marginTop: 'auto' }}>
      <div className="mk-footcols" style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: 36, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ width: 38, height: 38, borderRadius: 9, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/img/logo.svg" alt="Karvon Stroy" width={30} height={30} style={{ display: 'block' }} />
            </span>
            <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 20, color: '#fff' }}>KARVON STROY</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.5)', maxWidth: '34ch', margin: '0 0 18px' }}>Zamonaviy turar-joy majmualari quruvchisi. Ishonch, sifat va muddat.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 22, color: '#fff' }}><PhoneIcon size={20} />1360</div>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 15 }}>Sotuv bo‘limlari</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>Yunusobod ofisi</span>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>Chilonzor ofisi</span>
            <span style={{ color: 'rgba(255,255,255,.6)' }}>Mirzo Ulug‘bek ofisi</span>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 15 }}>Havolalar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>
            {links.map((l) => (
              <Link key={l.label} href={l.href} style={link}>{l.label}</Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 15 }}>Manzil</div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.5)', margin: '0 0 14px' }}>Qarshi, Qashqadaryo viloyati, O‘zbekiston ko‘chasi (VQ6M+FVH)</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {['IG', 'TG', 'YT'].map((s) => (
              <span key={s} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
        <div>© 2026 KARVON STROY. Barcha huquqlar himoyalangan.</div>
        <div style={{ display: 'flex', gap: 20 }}><span>Maxfiylik siyosati</span><span>Ommaviy oferta</span></div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) { .mk-footcols { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 520px) { .mk-footcols { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
