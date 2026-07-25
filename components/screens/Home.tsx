'use client';

import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { useApp } from '@/store/AppContext';
import { PROJECTS, PROJECT_IMG, HERO_SLIDES, NEWS } from '@/lib/data';
import { projStatusColor, projTotalFree, genFloors } from '@/lib/chess';
import MapEmbed from '../MapEmbed';
import PhoneIcon from '../PhoneIcon';

const chip = (active: boolean) =>
  ({
    border: `1px solid ${active ? 'var(--blue)' : 'var(--line)'}`,
    background: active ? 'var(--blue)' : '#fff',
    color: active ? '#fff' : 'var(--ink)',
    fontSize: 13,
    fontWeight: 600,
    padding: '9px 15px',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all .2s ease',
  }) as const;

export default function Home() {
  const { state, actions } = useApp();

  // hero autoplay (home only)
  useEffect(() => {
    const id = setInterval(() => actions.heroGo(1), 5000);
    return () => clearInterval(id);
  }, [actions]);

  const projHasRoom = (pid: string, r: number) => {
    const pp = PROJECTS.find((x) => x.id === pid)!;
    return (pp.blocks || ['A']).some((b) =>
      genFloors(pp, b, 1).some((row) => row.cells.some((cc) => cc.rooms === r && cc.status !== 'sotilgan'))
    );
  };

  const homeProjects = useMemo(() => {
    const q = (state.hsearch || '').trim().toLowerCase();
    return PROJECTS.filter((pp) => {
      if (q && !(pp.name + ' ' + pp.district).toLowerCase().includes(q)) return false;
      if (state.hcls !== 'all' && pp.cls !== state.hcls) return false;
      if (pp.priceFrom > state.hprice) return false;
      if (state.hrooms !== 'all' && !projHasRoom(pp.id, state.hrooms as number)) return false;
      return true;
    }).map((pp) => {
      const c = projStatusColor(pp);
      return { ...pp, statusBg: c.bg, statusColor: c.c, free: projTotalFree(pp), img: PROJECT_IMG[pp.id], address: 'Toshkent, ' + pp.district + ' tumani', floorsLabel: pp.floors + ' qavatgacha' };
    });
  }, [state.hsearch, state.hcls, state.hprice, state.hrooms]);

  const clsOpts: [string, string][] = [['all', 'Barchasi'], ['Komfort', 'Komfort'], ['Komfort+', 'Komfort+'], ['Biznes', 'Biznes']];
  const roomOpts: [number | 'all', string][] = [['all', 'Barchasi'], [0, 'Studiya'], [1, '1'], [2, '2'], [3, '3'], [4, '4+']];
  const priceLabel = state.hprice >= 1500 ? '∞' : String(state.hprice);
  const featured = NEWS[0];
  const sideNews = NEWS.slice(1);

  return (
    <section className="mk-screen">
      {/* HERO carousel — to'liq kenglik, rasm nisbati (2:1) saqlanadi → butun rasm kesilmasdan ko'rinadi */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1456 / 720', overflow: 'hidden', background: '#0A1220' }}>
        {HERO_SLIDES.map((src, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === state.heroIndex ? 1 : 0, transition: 'opacity 1s ease' }}>
            <Image src={src} alt="" fill sizes="100vw" priority={i === 0} style={{ objectFit: 'cover' }} />
          </div>
        ))}
        <button onClick={() => actions.heroGo(-1)} style={arrow('left')}>‹</button>
        <button onClick={() => actions.heroGo(1)} style={arrow('right')}>›</button>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'clamp(16px,3vh,28px)', display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} aria-label={`slide ${i + 1}`} onClick={() => actions.heroSet(i)} style={{ height: 9, width: i === state.heroIndex ? 26 : 9, borderRadius: 20, border: 'none', background: i === state.heroIndex ? '#fff' : 'rgba(255,255,255,.5)', cursor: 'pointer', transition: 'all .3s ease', padding: 0, boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          ))}
        </div>
      </div>

      {/* PROJECTS */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(50px,7vw,100px) clamp(14px,3vw,32px) clamp(30px,4vw,50px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 'clamp(28px,4vw,44px)', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px,3.6vw,46px)', letterSpacing: '-.025em', margin: 0, color: 'var(--ink)' }}>Bizning loyihalar</h2>
          </div>
          <button onClick={() => actions.goCatalog()} style={outlineBtn}>Barcha loyihalar</button>
        </div>

        {/* search + filter */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', padding: 'clamp(16px,2vw,22px)', marginBottom: 'clamp(22px,3vw,32px)' }}>
          {/* search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, padding: '0 14px' }}>
            <span style={{ color: 'var(--mute)', fontSize: 16 }}>⌕</span>
            <input value={state.hsearch} onChange={(e) => actions.set({ hsearch: e.target.value })} placeholder="Loyiha yoki tuman bo‘yicha qidirish…" style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', padding: '13px 0', fontSize: 15, outline: 'none', color: 'var(--ink)' }} />
          </div>
          {/* klass chiplari — bitta surib ko'riladigan qator */}
          <div className="mk-chiprow" style={{ marginTop: 14 }}>
            {clsOpts.map(([v, l]) => (
              <button key={v} onClick={() => actions.set({ hcls: v })} style={chip(state.hcls === v)}>{l}</button>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* xonalar — surib ko'riladigan qator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', whiteSpace: 'nowrap' }}>Xonalar:</span>
              <div className="mk-chiprow" style={{ flex: 1, minWidth: 0 }}>
                {roomOpts.map(([v, l]) => (
                  <button key={String(v)} onClick={() => actions.set({ hrooms: v })} style={chip(state.hrooms === v)}>{l}</button>
                ))}
              </div>
            </div>
            {/* narx */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', whiteSpace: 'nowrap' }}>Narx, mln so‘mgacha:</span>
              <input type="range" min={300} max={1500} step={20} value={state.hprice} onChange={(e) => actions.set({ hprice: +e.target.value })} style={{ flex: 1, minWidth: 60 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', minWidth: 40, textAlign: 'right' }}>{priceLabel}</span>
            </div>
            <button onClick={actions.resetHomeFilters} style={{ alignSelf: 'flex-start', border: '1px solid var(--line)', background: '#fff', color: 'var(--slate)', fontSize: 13, fontWeight: 600, padding: '10px 16px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>Tozalash</button>
          </div>
        </div>

        <div style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 16 }}><b style={{ color: 'var(--ink)' }}>{homeProjects.length}</b> ta loyiha topildi</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 'clamp(16px,1.6vw,24px)' }}>
          {homeProjects.map((p) => (
            <div key={p.id} className="mk-projcard" style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid var(--line)', borderRadius: 22, overflow: 'hidden', transition: 'all .3s cubic-bezier(.16,1,.3,1)' }}>
              <div role="button" onClick={() => actions.goProject(p.id)} style={{ position: 'relative', aspectRatio: '16/12', overflow: 'hidden', background: 'var(--soft)', cursor: 'pointer' }}>
                <div className="mk-projimg" style={{ position: 'absolute', inset: 0, transition: 'transform .8s cubic-bezier(.16,1,.3,1)' }}>
                  <Image src={p.img} alt={p.name} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,18,32,.32),transparent 34%,transparent 68%,rgba(10,18,32,.5))', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', background: p.statusBg, color: p.statusColor, fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor }} />{p.statusLabel}
                  </span>
                  <span style={{ background: 'rgba(15,24,38,.55)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 8 }}>{p.cls}</span>
                </div>
                <div style={{ position: 'absolute', left: 16, bottom: 14, right: 16 }}>
                  <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 23, letterSpacing: '-.01em', color: '#fff', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}><span>◉</span>{p.address}</div>
                </div>
              </div>
              <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'stretch', textAlign: 'center', background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                  <Spec label="Narxi" value={`${p.priceFrom} mln`} blue />
                  <Divider />
                  <Spec label="Qavatlar" value={p.floorsLabel} />
                  <Divider />
                  <Spec label="Topshirish" value={p.deadline} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  <span style={{ background: 'var(--blue-050)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7 }}>Studiya–4 xona</span>
                  <span style={{ background: '#E7F8F0', color: 'var(--free)', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7 }}>{p.free} ta bo‘sh</span>
                </div>
                <div style={{ display: 'flex', marginTop: 'auto' }}>
                  <button onClick={() => actions.goProject(p.id)} style={{ flex: 1, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 11, cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,96,254,.25)' }}>Batafsil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT + STATS */}
      <div style={{ background: 'var(--ink)', color: '#fff', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(50px,7vw,100px) clamp(14px,3vw,32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}><span style={{ width: 28, height: 2, background: 'var(--blue)' }} /><span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7FA9FF' }}>Kompaniya haqida</span></div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px,3.6vw,48px)', lineHeight: 1.08, letterSpacing: '-.025em', margin: '0 0 22px', color: '#fff' }}>Biz uy emas — hayot uchun <span style={{ color: '#7FA9FF' }}>makon</span> quramiz</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.75, color: 'rgba(255,255,255,.66)', margin: '0 0 32px', maxWidth: '52ch' }}>KARVON STROY — O‘zbekistonda zamonaviy turar-joy majmualarini quruvchi kompaniya. Loyihalashdan kalit topshirishgacha bo‘lgan har bir bosqichda sifat, muddat va mijoz ishonchini birinchi o‘ringa qo‘yamiz.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button onClick={() => actions.goCatalog()} style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '15px 28px', borderRadius: 12, cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,96,254,.35)' }}>Loyihalarni ko‘rish</button>
              <button onClick={() => actions.goOnline()} style={{ border: '1px solid rgba(255,255,255,.24)', background: 'rgba(255,255,255,.05)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '15px 26px', borderRadius: 12, cursor: 'pointer' }}>Biz haqimizda</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, overflow: 'hidden' }}>
            <StatCell n="6" label="yil bozorda" />
            <StatCell n="47" label="loyiha" />
            <StatCell n={<>560<span style={{ fontSize: 22, color: '#7FA9FF' }}> ming</span></>} label="m² qurilgan" />
            <StatCell n="6248" label="baxtli oila" />
          </div>
        </div>
      </div>

      {/* NEWS */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(50px,7vw,100px) clamp(14px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 'clamp(28px,4vw,44px)', flexWrap: 'wrap' }}>
          <div>
            <Eyebrow>Media markaz</Eyebrow>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(28px,3.6vw,46px)', letterSpacing: '-.025em', margin: 0, color: 'var(--ink)' }}>Yangiliklar</h2>
          </div>
          <button onClick={() => actions.goNews('n1')} style={outlineBtn}>Barcha yangiliklar</button>
        </div>
        <div className="mk-newsgrid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'clamp(16px,2vw,26px)', alignItems: 'stretch' }}>
          <div onClick={() => actions.goNews(featured.id)} className="mk-card" style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', cursor: 'pointer', minHeight: 340, background: '#0A1220' }}>
            <Image src={featured.img} alt={featured.title} fill sizes="(max-width:900px) 100vw, 60vw" style={{ objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(6,13,26,.88),rgba(6,13,26,.15) 55%,transparent)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(24px,3vw,38px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}><span style={{ background: 'var(--blue)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '5px 11px', borderRadius: 6 }}>{featured.cat}</span><span style={{ color: 'rgba(255,255,255,.75)', fontSize: 13 }}>{featured.date}</span></div>
              <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(22px,2.6vw,32px)', lineHeight: 1.12, letterSpacing: '-.02em', margin: '0 0 10px', color: '#fff', maxWidth: '20ch' }}>{featured.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,.72)', margin: 0, maxWidth: '48ch' }}>{featured.excerpt}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2vw,26px)' }}>
            {sideNews.map((n) => (
              <div key={n.id} onClick={() => actions.goNews(n.id)} style={{ display: 'flex', gap: 16, background: '#fff', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', flex: 1 }}>
                <div style={{ position: 'relative', width: '42%', minWidth: 120, overflow: 'hidden', background: 'var(--soft)' }}>
                  <Image src={n.img} alt={n.title} fill sizes="180px" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px 16px 16px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><span style={{ color: 'var(--blue)', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>{n.cat}</span><span style={{ color: 'var(--mute)', fontSize: 12 }}>{n.date}</span></div>
                  <h3 style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 16.5, lineHeight: 1.25, letterSpacing: '-.01em', margin: 0, color: 'var(--ink)' }}>{n.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACTS */}
      <div style={{ background: 'var(--ink)', color: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(14px,3vw,32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(28px,4vw,56px)', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(24px,3vw,38px)', margin: '0 0 18px' }}>Sotuv bo‘limiga tashrif buyuring</h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,.7)', margin: '0 0 26px', maxWidth: '44ch' }}>Mutaxassislarimiz sizga eng mos kvartirani tanlashda yordam beradi. Har kuni 9:00–19:00.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ContactRow icon="◉" title="Bosh ofis" text="Qarshi, Qashqadaryo, O‘zbekiston ko‘chasi (VQ6M+FVH)" />
              <ContactRow icon={<PhoneIcon size={16} />} title="Call-markaz" text="1360 · +998 71 200 13 60" />
            </div>
            <button onClick={() => actions.showToast('Qo‘ng‘iroq uchun ariza qabul qilindi')} style={{ marginTop: 26, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 11, cursor: 'pointer' }}>Qo‘ng‘iroqqa buyurtma</button>
          </div>
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '16/11', border: '1px solid rgba(255,255,255,.12)', background: '#0f1826' }}>
            <MapEmbed dark />
          </div>
        </div>
      </div>

      <style jsx>{`
        .mk-projcard:hover { box-shadow: 0 28px 64px rgba(15,24,38,.16); transform: translateY(-6px); border-color: transparent; }
        .mk-projcard:hover .mk-projimg { transform: scale(1.05); }
        .mk-card:hover { box-shadow: 0 24px 60px rgba(15,24,38,.16); transform: translateY(-4px); }
        @media (max-width: 780px) { .mk-newsgrid { grid-template-columns: 1fr !important; } }
        .mk-chiprow {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          flex-wrap: nowrap;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 2px;
        }
        .mk-chiprow::-webkit-scrollbar { display: none; }
        .mk-chiprow > button { flex: 0 0 auto; white-space: nowrap; }
      `}</style>
    </section>
  );
}

function arrow(side: 'left' | 'right') {
  return {
    position: 'absolute' as const,
    [side]: 'clamp(12px,2vw,28px)',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 46,
    height: 46,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,.82)',
    backdropFilter: 'blur(6px)',
    color: 'var(--ink)',
    fontSize: 18,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
}

const outlineBtn = { display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 14, fontWeight: 600, padding: '13px 20px', borderRadius: 11, cursor: 'pointer' } as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ width: 28, height: 2, background: 'var(--blue)' }} />
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--blue)' }}>{children}</span>
    </div>
  );
}
function Spec({ label, value, blue }: { label: string; value: string; blue?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '11px 6px' }}>
      <div style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 14.5, color: blue ? 'var(--blue)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}
const Divider = () => <div style={{ width: 1, background: 'var(--line)' }} />;
function StatCell({ n, label }: { n: React.ReactNode; label: string }) {
  return (
    <div style={{ background: '#131E30', padding: 'clamp(22px,3vw,34px)' }}>
      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(34px,4vw,52px)', color: '#fff', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', marginTop: 10 }}>{label}</div>
    </div>
  );
}
function ContactRow({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ color: 'var(--blue)' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>{text}</div>
      </div>
    </div>
  );
}
