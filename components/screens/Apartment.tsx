'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/AppContext';
import { PROJECTS, BANKS } from '@/lib/data';
import { STATUS, genFloors, mortMonthly, fmt, entranceOfId, type Cell } from '@/lib/chess';
import { routes } from '@/lib/routes';

const lowestBank = () => BANKS.reduce((a, b) => (b.rateNum < a.rateNum ? b : a));

export default function Apartment({ cell: apt }: { cell: Cell }) {
  const { state, actions } = useApp();
  const router = useRouter();
  const p = PROJECTS.find((x) => x.id === apt.id.split('-')[0]) || PROJECTS[0];
  const block = apt.block;
  const entrance = entranceOfId(apt.id);

  const { miniFloors, similar } = useMemo(() => {
    const raw = genFloors(p, block, entrance);
    const mini = raw.map((row) => ({
      floor: row.floor,
      cells: row.cells.map((c) => ({ c, sel: c.id === apt.id })),
    }));
    const sim = raw.flatMap((r) => r.cells).filter((c) => c.rooms === apt.rooms && c.id !== apt.id).slice(0, 4);
    return { miniFloors: mini, similar: sim };
  }, [apt, p, block, entrance]);

  // mortgage bank (default = lowest rate); apply its rate/limits to the calc
  const [bankAbbr, setBankAbbr] = useState(() => lowestBank().abbr);
  const bank = BANKS.find((b) => b.abbr === bankAbbr) || BANKS[0];
  useEffect(() => {
    actions.set({ mort: { ...state.mort, rate: bank.rateNum, down: Math.max(bank.downNum, state.mort.down), term: Math.min(bank.termNum, state.mort.term) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apt.id, bankAbbr]);

  const backToChess = () => router.push(routes.chess(p.id, `blok=${block}&podyezd=${entrance}`));
  const st = STATUS[apt.status];
  const monthly = (mortMonthly(state.mort) / 1e6).toFixed(1) + ' mln';
  const loan = fmt(state.mort.price * (1 - state.mort.down / 100)) + ' mln';

  return (
    <section className="mk-screen" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(18px,2.4vw,28px) clamp(14px,3vw,32px) clamp(40px,5vw,70px)' }}>
      <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 16 }}>
        <button onClick={backToChess} style={crumb}>Shaxmatka</button> / {apt.roomsLabel} · {apt.area} m²
      </div>

      <div className="mk-aptgrid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(min(100%,300px),1fr)', gap: 'clamp(24px,3vw,44px)', alignItems: 'start' }}>
        {/* plan + mini chess */}
        <div>
          <div style={{ position: 'relative', background: '#fff', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3' }}>
            <Image src="/img/plan-1.png" alt={`${apt.roomsLabel} planirovka`} fill sizes="(max-width:820px) 100vw, 55vw" style={{ objectFit: 'contain', padding: 10 }} />
            <span style={{ position: 'absolute', left: 12, top: 12, background: 'var(--soft)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 20 }}>Planirovka · {apt.area} m²</span>
          </div>
          <div style={{ marginTop: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 12 }}>Qavatdagi o‘rni</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {miniFloors.map((row) => (
                <div key={row.floor} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 20, fontSize: 10, color: 'var(--mute)', textAlign: 'center' }}>{row.floor}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {row.cells.map(({ c, sel }) => {
                      const cst = STATUS[c.status];
                      return <span key={c.id} style={{ width: 16, height: 12, borderRadius: 3, background: sel ? 'var(--blue)' : cst.bg, border: `1px solid ${sel ? 'var(--blue)' : cst.ln}`, boxShadow: sel ? '0 0 0 2px rgba(0,96,254,.25)' : 'none' }} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* info + mortgage */}
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px,3vw,36px)', letterSpacing: '-.02em', margin: '0 0 4px', color: 'var(--ink)' }}>{apt.roomsLabel} kvartira</h1>
          <div style={{ fontSize: 15, color: 'var(--slate)', marginBottom: 18 }}>{p.name} · Blok {block} · {apt.f}-qavat</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(28px,3.4vw,40px)', color: 'var(--blue)' }}>{apt.priceLabel}</div>
            <div style={{ fontSize: 14, color: 'var(--slate)' }}>{apt.ppm2} mln/m²</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: st.bg, color: st.color, fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 20, marginBottom: 22 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color }} />{st.label}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
            <InfoCell k="Umumiy maydon" v={`${apt.area} m²`} />
            <InfoCell k="Xonalar" v={apt.roomsLabel} />
            <InfoCell k="Qavat" v={`${apt.f} / ${p.floors}`} />
            <InfoCell k="Yo‘nalish" v={apt.orient} />
            <InfoCell k="Balkon" v="Bor · lodjiya" />
            <InfoCell k="Klass" v={p.cls} />
          </div>

          {/* mortgage calc */}
          <div style={{ background: 'var(--blue-050)', border: '1px solid var(--blue-100)', borderRadius: 16, padding: 20, marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Ipoteka kalkulyatori</div>
              <select value={bankAbbr} onChange={(e) => setBankAbbr(e.target.value)} aria-label="Bankni tanlash" style={{ border: '1px solid var(--blue-100)', borderRadius: 9, padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                {BANKS.map((b) => <option key={b.abbr} value={b.abbr}>{b.name} · {b.rate}</option>)}
              </select>
            </div>
            <Range label="Boshlang‘ich to‘lov" value={`${state.mort.down}%`} min={bank.downNum} max={70} step={5} v={Math.max(bank.downNum, state.mort.down)} onChange={(x) => actions.setMort('down', x)} />
            <Range label="Muddat" value={`${state.mort.term} yil`} min={3} max={bank.termNum} step={1} v={Math.min(bank.termNum, state.mort.term)} onChange={(x) => actions.setMort('term', x)} last />
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontSize: 12.5, color: 'var(--mute)' }}>Oylik to‘lov</div><div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 24, color: 'var(--ink)' }}>{monthly}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12.5, color: 'var(--mute)' }}>Kredit summasi</div><div style={{ fontWeight: 700, color: 'var(--slate)' }}>{loan}</div></div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 8 }}>* {bank.name} — yillik {bank.rate} stavka bo‘yicha taxminiy hisob.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => actions.showToast('Online xarid arizasi qabul qilindi ✓')} style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 16, fontWeight: 700, padding: 16, borderRadius: 12, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>Online sotib olish</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => actions.showToast('Kvartira 24 soatga bron qilindi')} style={smallBtn}>Bron qilish</button>
              <button onClick={() => actions.showToast('Qo‘ng‘iroqqa buyurtma berildi')} style={smallBtn}>Qo‘ng‘iroq</button>
            </div>
          </div>
        </div>
      </div>

      {/* similar */}
      <h3 style={{ fontWeight: 700, fontSize: 22, margin: '44px 0 16px', color: 'var(--ink)' }}>O‘xshash kvartiralar</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
        {similar.map((c) => {
          const cst = STATUS[c.status];
          return (
            <button key={c.id} className="mk-simcard" onClick={() => c.status !== 'sotilgan' && actions.openApt(c)} style={{ textAlign: 'left', background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: cst.color }} />
                <span style={{ fontSize: 12, color: cst.color, fontWeight: 600 }}>{cst.label}</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.roomsLabel} · {c.area} m²</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', margin: '4px 0 10px' }}>{c.floorLabel}</div>
              <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, color: 'var(--blue)' }}>{c.priceLabel}</div>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .mk-simcard:hover { border-color: var(--blue); box-shadow: var(--shadow-sm); }
        @media (max-width: 820px) { .mk-aptgrid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

const crumb = { border: 'none', background: 'none', color: 'var(--mute)', cursor: 'pointer', padding: 0, fontSize: 13 } as const;
const smallBtn = { flex: 1, border: '1px solid var(--line)', background: '#fff', color: 'var(--ink)', fontSize: 14, fontWeight: 600, padding: 13, borderRadius: 11, cursor: 'pointer' } as const;

function InfoCell({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: '#fff', padding: '14px 16px' }}>
      <div style={{ fontSize: 12.5, color: 'var(--mute)' }}>{k}</div>
      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{v}</div>
    </div>
  );
}
function Range({ label, value, min, max, step, v, onChange, last }: { label: string; value: string; min: number; max: number; step: number; v: number; onChange: (x: number) => void; last?: boolean }) {
  return (
    <>
      <div style={{ fontSize: 13, color: 'var(--slate)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>{label} <span style={{ fontWeight: 700, color: 'var(--blue)' }}>{value}</span></div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%', marginBottom: last ? 18 : 16 }} />
    </>
  );
}

