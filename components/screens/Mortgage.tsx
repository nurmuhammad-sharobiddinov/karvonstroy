'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/store/AppContext';
import { BANKS } from '@/lib/data';
import { mortMonthly, fmt } from '@/lib/chess';

const lowestBank = () => BANKS.reduce((a, b) => (b.rateNum < a.rateNum ? b : a));

export default function Mortgage() {
  const { state, actions } = useApp();
  const [bankAbbr, setBankAbbr] = useState(() => lowestBank().abbr);
  const bank = BANKS.find((b) => b.abbr === bankAbbr) || BANKS[0];

  // apply the default (lowest-rate) bank once on mount
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    const b = lowestBank();
    actions.set({ mg: { ...state.mg, rate: b.rateNum, down: b.downNum, term: b.termNum } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectBank = (abbr: string) => {
    const b = BANKS.find((x) => x.abbr === abbr)!;
    setBankAbbr(abbr);
    actions.set({ mg: { ...state.mg, rate: b.rateNum, down: Math.max(b.downNum, state.mg.down), term: Math.min(b.termNum, state.mg.term) } });
  };

  // normalised, bank-constrained inputs
  const price = state.mg.price;
  const down = Math.min(70, Math.max(bank.downNum, state.mg.down));
  const term = Math.min(bank.termNum, Math.max(3, state.mg.term));

  const monthlyMln = mortMonthly({ ...state.mg, down, term, rate: bank.rateNum }) / 1e6;
  const loanMln = price * (1 - down / 100);
  const downSumMln = price * (down / 100);
  const totalMln = monthlyMln * term * 12;
  const overMln = totalMln - loanMln;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actions.showToast('Arizangiz qabul qilindi — tez orada bog‘lanamiz');
    (e.target as HTMLFormElement).reset();
  };

  const input = { border: '1px solid var(--line)', borderRadius: 11, padding: '13px 14px', fontSize: 15, outline: 'none', width: '100%', background: '#fff' } as const;

  return (
    <section className="mk-screen" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(22px,3vw,44px) clamp(14px,3vw,32px) clamp(40px,5vw,70px)' }}>
      <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 10 }}>
        <button onClick={() => actions.goHome()} style={crumb}>Bosh sahifa</button> / Ipoteka
      </div>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(26px,3.4vw,42px)', letterSpacing: '-.02em', margin: '0 0 8px', color: 'var(--ink)' }}>Ipoteka kalkulyatori</h1>
      <p style={{ fontSize: 16, color: 'var(--slate)', margin: '0 0 clamp(24px,3vw,34px)', maxWidth: '64ch' }}>Bankni tanlang, qiymatlarni sozlang — oylik to‘lov bir zumda hisoblanadi.</p>

      <div className="mk-mortgrid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 24, alignItems: 'start' }}>
        {/* ============ CALCULATOR ============ */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: 'clamp(18px,2.4vw,30px)', boxShadow: '0 8px 30px rgba(15,24,38,.05)' }}>
          {/* bank selector */}
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', marginBottom: 12 }}>Bankni tanlang</div>
          <div className="mk-bankrow" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 'clamp(22px,3vw,32px)' }}>
            {BANKS.map((b) => {
              const on = b.abbr === bankAbbr;
              return (
                <button
                  key={b.abbr}
                  onClick={() => selectBank(b.abbr)}
                  aria-pressed={on}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
                    background: on ? 'var(--blue-050)' : '#fff', border: `1.5px solid ${on ? 'var(--blue)' : 'var(--line)'}`,
                    borderRadius: 14, padding: '14px 8px', cursor: 'pointer', transition: 'all .16s ease',
                  }}
                >
                  <span style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, background: b.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 14 }}>
                    {b.abbr}
                    {on && <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--blue)', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>✓</span>}
                  </span>
                  <span className="mk-bankname" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15 }}>{b.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: on ? 'var(--blue)' : 'var(--slate)' }}>{b.rate} · {b.term}</span>
                </button>
              );
            })}
          </div>

          {/* sliders */}
          <Slider
            label="Kvartira narxi" unit="mln" min={300} max={2000} step={20} value={price}
            onChange={(x) => actions.setMg('price', x)}
            presets={[400, 600, 900, 1400]}
          />
          <Slider
            label="Boshlang‘ich to‘lov" unit="%" min={bank.downNum} max={70} step={5} value={down}
            onChange={(x) => actions.setMg('down', x)}
            presets={[bank.downNum, 30, 50, 70]}
            sub={`= ${fmt(downSumMln)} mln so‘m`}
          />
          <Slider
            label="Muddat" unit="yil" min={3} max={bank.termNum} step={1} value={term}
            onChange={(x) => actions.setMg('term', x)}
            presets={[5, 10, 15, bank.termNum]}
          />

          {/* result */}
          <div style={{ background: 'linear-gradient(135deg, var(--blue), #0038a8)', borderRadius: 18, padding: 'clamp(20px,2.6vw,28px)', color: '#fff', marginTop: 'clamp(20px,2.6vw,28px)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 13.5, opacity: 0.85, marginBottom: 2 }}>Oylik to‘lov</div>
                <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(34px,4.4vw,46px)', lineHeight: 1 }}>
                  {monthlyMln.toFixed(1)} <span style={{ fontSize: '0.5em', fontWeight: 700, opacity: 0.9 }}>mln so‘m</span>
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.16)', borderRadius: 20, padding: '7px 13px', fontSize: 13, fontWeight: 700 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: bank.color, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{bank.abbr}</span>
                yillik {bank.rate}
              </span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.18)', margin: '20px 0 18px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }} className="mk-breakdown">
              <Stat k="Kredit summasi" v={`${fmt(loanMln)} mln`} />
              <Stat k="Boshlang‘ich to‘lov" v={`${fmt(downSumMln)} mln`} />
              <Stat k="Umumiy to‘lov" v={`${fmt(totalMln)} mln`} />
              <Stat k="Ortiqcha to‘lov" v={`${fmt(overMln)} mln`} />
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--mute)', margin: '12px 2px 0', lineHeight: 1.55 }}>* {bank.name} — yillik {bank.rate} stavka bo‘yicha taxminiy annuitet hisob-kitobi. Aniq shartlar bank tomonidan belgilanadi.</p>
        </div>

        {/* ============ APPLICATION ============ */}
        <aside className="mk-mortaside" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <form onSubmit={onSubmit} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, padding: 22, boxShadow: '0 8px 30px rgba(15,24,38,.05)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 19, margin: '0 0 4px', color: 'var(--ink)' }}>Ariza qoldiring</h3>
            <p style={{ fontSize: 13.5, color: 'var(--slate)', margin: '0 0 16px', lineHeight: 1.5 }}>Menejer 24 soat ichida bog‘lanib, shartlarni tushuntiradi.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <input type="text" required placeholder="Ismingiz" style={input} />
              <input type="tel" required placeholder="Telefon raqamingiz" style={input} />
              <select style={input} defaultValue="">
                <option value="" disabled>Loyihani tanlang</option>
                <option>Oq Daryo</option>
                <option>Yangi Hayot</option>
                <option>Chorbog‘ Park</option>
              </select>
              <button type="submit" style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 11, cursor: 'pointer', marginTop: 2 }}>Arizani yuborish</button>
            </div>
          </form>

          <div style={{ background: 'var(--blue-050)', border: '1px solid var(--blue-100)', borderRadius: 18, padding: 22 }}>
            <div style={{ fontSize: 13.5, color: 'var(--slate)', marginBottom: 4 }}>Savollaringiz bormi?</div>
            <a href="tel:1360" style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 26, color: 'var(--blue)', textDecoration: 'none', letterSpacing: '-.01em' }}>☎ 1360</a>
            <div style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 6 }}>Har kuni 9:00 – 20:00 · qo‘ng‘iroq bepul</div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        input[type='range'].mk-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 99px;
          outline: none;
          cursor: pointer;
          margin: 0;
        }
        input[type='range'].mk-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #fff;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 96, 254, 0.45), 0 0 0 6px rgba(0, 96, 254, 0.14);
          cursor: grab;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        input[type='range'].mk-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.14);
        }
        input[type='range'].mk-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--blue);
          box-shadow: 0 2px 6px rgba(0, 96, 254, 0.4);
          cursor: grab;
        }
        input[type='range'].mk-slider::-moz-range-track {
          height: 8px;
          border-radius: 99px;
          background: transparent;
        }
        input[type='range'].mk-slider:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 2px 6px rgba(0, 96, 254, 0.45), 0 0 0 7px rgba(0, 96, 254, 0.22);
        }
      `}</style>
      <style jsx>{`
        @media (max-width: 920px) {
          .mk-mortgrid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 921px) {
          .mk-mortaside {
            position: sticky;
            top: calc(var(--header-h) + 16px);
          }
        }
        @media (max-width: 560px) {
          .mk-bankrow {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .mk-breakdown {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}

const crumb = { border: 'none', background: 'none', color: 'var(--mute)', cursor: 'pointer', padding: 0, fontSize: 13 } as const;

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 3, lineHeight: 1.3 }}>{k}</div>
      <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(15px,1.5vw,18px)' }}>{v}</div>
    </div>
  );
}

function Slider({
  label, unit, min, max, step, value, onChange, presets, sub,
}: {
  label: string; unit: string; min: number; max: number; step: number; value: number;
  onChange: (x: number) => void; presets?: number[]; sub?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  // de-duplicate presets (bank min can coincide with a fixed preset)
  const chips = presets ? Array.from(new Set(presets.map(clamp))).sort((a, b) => a - b) : [];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 13 }}>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
          {sub && <div style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--blue-050)', border: '1px solid var(--blue-100)', borderRadius: 11, padding: '7px 12px' }}>
          <input
            type="number" value={value} min={min} max={max} step={step}
            onChange={(e) => { const n = parseFloat(e.target.value); if (!Number.isNaN(n)) onChange(clamp(n)); }}
            aria-label={label}
            style={{ width: `${String(max).length + 0.5}ch`, border: 'none', background: 'transparent', fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 17, color: 'var(--blue)', textAlign: 'right', outline: 'none', MozAppearance: 'textfield', padding: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{unit}</span>
        </div>
      </div>
      <input
        className="mk-slider" type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ background: `linear-gradient(to right, var(--blue) 0%, var(--blue) ${pct}%, var(--line) ${pct}%, var(--line) 100%)` }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--mute)' }}>
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {chips.map((p) => {
            const on = value === p;
            return (
              <button
                key={p} onClick={() => onChange(p)}
                style={{ border: `1px solid ${on ? 'var(--blue)' : 'var(--line)'}`, background: on ? 'var(--blue)' : '#fff', color: on ? '#fff' : 'var(--slate)', fontSize: 12.5, fontWeight: 600, padding: '7px 13px', borderRadius: 9, cursor: 'pointer', transition: 'all .15s ease' }}
              >
                {p} {unit}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
