'use client';

import { useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useApp } from '@/store/AppContext';
import { PROJECT_IMG, HERO_SLIDES, FEAT_HOVLI, FEAT_HALL, FEAT_COWORK, REVIEWS, type Feat, type Project as ProjectType } from '@/lib/data';
import { projStatusColor, projTotalFree } from '@/lib/chess';
import Icon from '../Icon';
import MapEmbed from '../MapEmbed';
import Chess from './Chess';
import PhoneIcon from '../PhoneIcon';

// Loyiha galereyasi — faqat toza bino renderlari (promo poster EMAS)
const gallery = (pid: string) => [PROJECT_IMG[pid], HERO_SLIDES[0], HERO_SLIDES[3]];

export default function Project({ project: p }: { project: ProjectType }) {
  const { actions } = useApp();
  const psc = projStatusColor(p);
  const g = gallery(p.id);
  const [pj, setPj] = useState(0);
  const address = 'Toshkent, ' + p.district + ' tumani';

  // inline shaxmatka — "Kvartira tanlash" bosilganda shu sahifada ochiladi
  const [showChess, setShowChess] = useState(false);
  const chessRef = useRef<HTMLDivElement>(null);
  const openChess = () => {
    setShowChess(true);
    requestAnimationFrame(() => chessRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <section className="mk-screen">
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(14px,2vw,22px) clamp(14px,3vw,32px) 0' }}>
        <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 14 }}>
          <button onClick={() => actions.goCatalog()} style={crumb}>Loyihalar</button> / {p.name}
        </div>
      </div>

      {/* hero — bosh sahifadagidek: rasm to'liq ko'rinadi (2:1) */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1456 / 720', overflow: 'hidden', background: '#0A1220' }}>
        {g.map((src, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === pj ? 1 : 0, transition: 'opacity .8s ease' }}>
            <Image src={src} alt={p.name} fill sizes="100vw" priority={i === 0} style={{ objectFit: 'cover' }} />
          </div>
        ))}
        <div style={{ position: 'absolute', right: 'clamp(12px,3vw,24px)', bottom: 'clamp(12px,3vw,20px)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => actions.showToast('Fotogalereya ochilmoqda')} style={{ border: 'none', background: 'rgba(15,24,38,.72)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 11, cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 7 }}>▦ {g.length} ta surat</button>
          <button onClick={() => setPj((v) => (v - 1 + g.length) % g.length)} style={pjBtn}>‹</button>
          <button onClick={() => setPj((v) => (v + 1) % g.length)} style={pjBtn}>›</button>
        </div>
      </div>

      {/* sarlavha bloki — rasm tagida */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(18px,2.5vw,28px) clamp(14px,3vw,32px) 0' }}>
        <span style={{ display: 'inline-block', background: 'var(--blue)', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 8, marginBottom: 12 }}>{p.cls}</span>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px,5vw,56px)', letterSpacing: '-.02em', margin: '0 0 8px', lineHeight: 1.05, color: 'var(--ink)' }}>{p.name}</h1>
        <div style={{ fontSize: 15, color: 'var(--slate)', marginBottom: 6 }}>Eng yaqin topshirilish muddati <b style={{ color: 'var(--ink)' }}>{p.deadline}</b></div>
        <div style={{ fontSize: 14, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 6 }}>◉ {address}</div>
      </div>

      {/* specs strip */}
      <div style={{ maxWidth: 1320, margin: 'clamp(20px,3vw,32px) auto 0', padding: '0 clamp(14px,3vw,32px)' }}>
        <div className="mk-specstrip" style={{ display: 'flex', flexWrap: 'wrap', background: '#fff', border: '1px solid var(--line)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <SpecCell label="Uy-joy klassi" value={p.cls} />
          <SpecCell label="Shift balandligi" value="3 m" />
          <SpecCell label="Minimal maydon" value="30 m²" />
          <SpecCell label="Maksimal maydon" value="131 m²" />
          <SpecCell label="Qavatlar soni" value={`${p.floors} qavat`} last />
        </div>
      </div>

      {/* body + sidebar */}
      <div className="mk-projgrid" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(14px,3vw,32px)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 'clamp(24px,3vw,52px)', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{ background: 'var(--blue-050)', color: 'var(--blue)', fontSize: 13, fontWeight: 600, padding: '7px 13px', borderRadius: 8 }}>{p.tag}</span>
            <span style={pill}>Monolit-karkas</span>
            <span style={pill}>Yopiq hovli</span>
          </div>
          <p style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--slate)', margin: '0 0 22px', maxWidth: '64ch' }}>
            {p.name} — bu shunchaki turar-joy majmuasi emas, balki hayot uchun mukammal muhit. {p.district} tumanida joylashgan majmua zamonaviy arxitektura, yopiq va xavfsiz hovli, mashinasiz hudud konsepsiyasi hamda {p.cls} klassidagi pardozlashni o‘zida jamlagan. Bu yerda har bir tafsilot yashovchilar qulayligi uchun o‘ylab ishlangan.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 'clamp(40px,5vw,64px)' }}>
            <button onClick={() => actions.showToast('Buklet yuklab olindi (PDF)')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 14.5, fontWeight: 600, padding: '14px 24px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 8px 22px rgba(0,96,254,.25)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Buklet yuklab olish
            </button>
            <button onClick={() => actions.showToast('Video prezentatsiya ochilmoqda')} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 14.5, fontWeight: 600, padding: '14px 22px', borderRadius: 12, cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
              Video prezentatsiya
            </button>
          </div>

          <Feature img={g[0]} kicker="Ichki hovli" title="Mashinasiz yashil hovli" desc="Hovli to‘liq piyodalar uchun mo‘ljallangan. Boy landshaft, soyabon daraxtlar, oqar suv va bolalar uchun xavfsiz zonalar — bularning barchasi bir joyda." feats={FEAT_HOVLI} />
          <Feature img={g[1]} kicker="Kirish holli" title="Mualliflik dizaynidagi holl" desc="Har bir pod‘yezd mehmonxona darajasidagi holl bilan boshlanadi: yumshoq kutish zonasi, dizaynerlik yoritilishi va to‘siqsiz muhit." feats={FEAT_HALL} />
          <Feature img={g[2]} kicker="Qo‘shnilar markazi" title="Kovorking va kinoroom" desc="Uydan chiqmasdan ishlash, dam olish va qo‘shnilar bilan muloqot qilish uchun alohida jamoat maydoni — hamma narsa bir necha qadam narida." feats={FEAT_COWORK} />

          {/* location */}
          <div style={{ marginBottom: 'clamp(44px,6vw,72px)' }}>
            <h3 style={h3}>Ulkan hayot hududi</h3>
            <p style={pText}>Maktablar, bog‘chalar, savdo markazlari va bekatlar — barchasi piyoda masofada. Shahar markaziga qulay chiqish.</p>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '16/9' }}>
              <Image src={g[0]} alt="Joylashuv" fill sizes="(max-width:1000px) 100vw, 66vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%)', width: 50, height: 50, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(0,96,254,.4)' }}>◉</div>
            </div>
          </div>

          {/* construction */}
          <div>
            <h3 style={h3}>Qurilish qanday ketmoqda</h3>
            <p style={pText}>Qurilish jarayoni bosqichma-bosqich fotogalereyada aks ettiriladi.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              {[g[2], g[0]].map((src, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
                  <Image src={src} alt="Qurilish" fill sizes="300px" style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sticky sidebar */}
        <aside className="mk-projaside" style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)', background: '#fff', border: '1px solid var(--line)', borderRadius: 20, padding: 26, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 13, color: 'var(--mute)' }}>Narxi</div>
          <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(26px,3vw,32px)', color: 'var(--ink)', margin: '4px 0 2px' }}>{p.priceFrom} mln <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate)' }}>so‘mdan</span></div>
          <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20 }}>Studiyadan 4 xonaligacha · {projTotalFree(p)} ta bo‘sh</div>
          <button onClick={openChess} style={{ width: '100%', border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 16, fontWeight: 700, padding: 16, borderRadius: 12, cursor: 'pointer', boxShadow: '0 8px 22px rgba(0,96,254,.28)', marginBottom: 10 }}>Kvartira tanlash</button>
          <button onClick={() => actions.goMortgage()} style={{ width: '100%', border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 12, cursor: 'pointer', marginBottom: 20 }}>Ipotekani hisoblash</button>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
            <Row k="Topshirish" v={p.deadline} />
            <Row k="Kafolat" v="3 yil" />
            <Row k="Bloklar" v={`${p.blocks.length} ta`} />
          </div>
          <div style={{ marginTop: 20, padding: 14, background: 'var(--blue-050)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 4 }}>Savollaringiz bormi?</div>
            <a href="tel:1360" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 22, color: 'var(--blue)' }}><PhoneIcon size={19} />1360</a>
          </div>
        </aside>
      </div>

      {/* inline shaxmatka — "Kvartira tanlash" bosilganda shu yerda ochiladi */}
      <div ref={chessRef} id="shaxmatka" style={{ scrollMarginTop: 'calc(var(--header-h) + 12px)' }}>
        {showChess && (
          <div style={{ background: 'var(--soft)', borderTop: '1px solid var(--line)' }}>
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(14px,3vw,32px)' }}>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.02em', margin: '0 0 6px', color: 'var(--ink)' }}>Kvartirani tanlang</h2>
              <p style={{ fontSize: 15, color: 'var(--slate)', margin: '0 0 24px' }}>Blok va pod‘yezdni tanlab, bo‘sh kvartiralarni ko‘ring.</p>
              <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--mute)' }}>Yuklanmoqda…</div>}>
                <Chess projectId={p.id} embedded />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* reviews */}
      <div style={{ background: 'var(--soft)', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(40px,5vw,72px) clamp(14px,3vw,32px)' }}>
          <h3 style={{ ...h3, marginBottom: 26 }}>Egalar fikri</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
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
        </div>
      </div>

      {/* contacts */}
      <div style={{ background: 'var(--ink)', color: '#fff' }}>
        <div className="mk-projcontact" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(14px,3vw,32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(28px,4vw,56px)', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 'clamp(24px,3vw,38px)', margin: '0 0 16px' }}>Sotuv ofisiga tashrif buyuring</h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,.7)', margin: '0 0 26px', maxWidth: '44ch' }}>{p.name} bo‘yicha barcha savollaringizga menejerlarimiz javob beradi. Har kuni 9:00–19:00.</p>
            <a href="tel:1360" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 11, cursor: 'pointer' }}><PhoneIcon size={17} />1360 — qo‘ng‘iroq qiling</a>
          </div>
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '16/11', border: '1px solid rgba(255,255,255,.12)', background: '#0f1826' }}>
            <MapEmbed dark />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .mk-projgrid { grid-template-columns: 1fr !important; }
          .mk-projaside { position: static !important; }
        }
      `}</style>
    </section>
  );
}

const crumb = { border: 'none', background: 'none', color: 'var(--mute)', cursor: 'pointer', padding: 0, fontSize: 13 } as const;
const pjBtn = { width: 46, height: 46, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,.9)', color: 'var(--ink)', fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,.18)' } as const;
const pill = { background: 'var(--soft)', border: '1px solid var(--line)', color: 'var(--slate)', fontSize: 13, fontWeight: 500, padding: '7px 13px', borderRadius: 8 } as const;
const h3 = { fontWeight: 800, fontSize: 'clamp(22px,2.6vw,32px)', letterSpacing: '-.02em', margin: '0 0 8px', color: 'var(--ink)' } as const;
const pText = { fontSize: 16, lineHeight: 1.75, color: 'var(--slate)', margin: '0 0 22px', maxWidth: '60ch' } as const;

function SpecCell({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 150, padding: 'clamp(16px,2vw,24px)', borderRight: last ? 'none' : '1px solid var(--line)' }}>
      <div style={{ fontSize: 12.5, color: 'var(--mute)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 'clamp(16px,1.6vw,20px)', color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--slate)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}
function Feature({ img, kicker, title, desc, feats }: { img: string; kicker: string; title: string; desc: string; feats: Feat[] }) {
  return (
    <div style={{ marginBottom: 'clamp(44px,6vw,72px)' }}>
      <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '16/8', marginBottom: 26 }}>
        <Image src={img} alt={title} fill sizes="(max-width:1000px) 100vw, 66vw" style={{ objectFit: 'cover' }} />
        <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(8,15,28,.5),transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 22, bottom: 20, color: '#fff' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)', marginBottom: 6 }}>{kicker}</div>
          <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(22px,2.6vw,34px)', textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>{title}</div>
        </div>
      </div>
      <p style={pText}>{desc}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {feats.map((f) => (
          <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px' }}>
            <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 10, background: 'var(--blue-050)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={f.k} /></span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>{f.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
