import type { CSSProperties } from 'react';

// Interactive Yandex map (keyless map-widget embed — pan/zoom/drag, embeddable
// with no X-Frame-Options block) pinned at the sales office. A floating chip
// shows the address on top of the map, and a link opens the full map.
//
// Sales office: VQ6M+FVH Qarshi (plus code 8JC7VQ6M+FVH → 38.861187, 65.784688).
const LAT = 38.861187;
const LON = 65.784688;
const ADDRESS = 'VQ6M+FVH, O‘zbekiston ko‘chasi, Qarshi, Qashqadaryo';

export default function MapEmbed({
  lat = LAT,
  lon = LON,
  address = ADDRESS,
  style,
  dark = false,
}: {
  lat?: number;
  lon?: number;
  address?: string;
  style?: CSSProperties;
  dark?: boolean;
}) {
  const src = `https://yandex.uz/map-widget/v1/?ll=${lon}%2C${lat}&z=16&l=map&pt=${lon},${lat},pm2rdm`;
  const bigMap = `https://yandex.uz/maps/?ll=${lon},${lat}&z=16&pt=${lon},${lat},pm2rdm`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <iframe
        title="Karvon Stroy — sotuv ofisi xaritasi (Yandex)"
        src={src}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
      />

      {/* address chip with pin icon */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          bottom: 14,
          right: 14,
          maxWidth: 'max-content',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: dark ? 'rgba(15,24,38,.92)' : 'rgba(255,255,255,.96)',
          color: dark ? '#fff' : 'var(--ink)',
          border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : 'var(--line)'}`,
          borderRadius: 12,
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(15,24,38,.18)',
          backdropFilter: 'blur(6px)',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--blue)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,96,254,.4)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{address}</span>
      </div>

      {/* larger-map link */}
      <a
        href={bigMap}
        target="_blank"
        rel="noreferrer noopener"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: dark ? 'rgba(15,24,38,.85)' : 'rgba(255,255,255,.95)',
          color: dark ? '#fff' : 'var(--ink)',
          border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : 'var(--line)'}`,
          fontSize: 12,
          fontWeight: 600,
          padding: '7px 12px',
          borderRadius: 9,
          boxShadow: '0 4px 14px rgba(15,24,38,.14)',
          backdropFilter: 'blur(6px)',
        }}
      >
        Kattaroq xarita
      </a>
    </div>
  );
}
