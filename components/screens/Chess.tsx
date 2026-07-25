'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/store/AppContext';
import { PROJECTS } from '@/lib/data';
import { routes } from '@/lib/routes';
import {
  STATUS,
  blockFree,
  entranceFree,
  projTotalFree,
  genFloors,
  computeBounds,
  cellMatches,
  fmt,
  type Cell,
  type RangeFilters,
  type StatusKey,
} from '@/lib/chess';
import DualRange from '../DualRange';

const COLS = ['Studiya', '1x', '2x', '3x', '2x'];
const ROOM_OPTS: [number, string][] = [[0, 'Studiya'], [1, '1x'], [2, '2x'], [3, '3x'], [4, '4x+']];
const BLOCK_HEIGHTS = [230, 300, 200, 265, 320];

export default function Chess({ projectId }: { projectId: string }) {
  const { state, actions } = useApp();
  const router = useRouter();
  const sp = useSearchParams();
  const p = PROJECTS.find((x) => x.id === projectId) || PROJECTS[0];
  const totalFree = projTotalFree(p);

  // ---- identity from the URL query ---------------------------------------
  const blokParam = sp.get('blok');
  const block = blokParam && (p.blocks || []).includes(blokParam) ? blokParam : null;
  const entParam = parseInt(sp.get('podyezd') || '', 10);
  const entrance = block && entParam >= 1 && entParam <= p.entrances ? entParam : null;
  const step: 'A' | 'B' | 'C' = !block ? 'A' : !entrance ? 'B' : 'C';

  const effBlock = block || p.blocks?.[0] || 'A';
  const effEnt = entrance || 1;
  const rows = useMemo(() => genFloors(p, effBlock, effEnt), [p, effBlock, effEnt]);
  const bounds = useMemo(() => computeBounds(rows), [rows]);

  // ---- URL navigation (replace, no scroll) --------------------------------
  const nav = (q?: string) => router.replace(routes.chess(p.id, q), { scroll: false });
  const selBlock = (b: string) => nav(`blok=${b}`);
  const selEntrance = (e: number) => nav(`blok=${effBlock}&podyezd=${e}`);
  const backToA = () => nav();
  const backToB = () => nav(`blok=${effBlock}`);

  // ---- rich filter (local, synced to ?xona) -------------------------------
  const fullFilter = (): RangeFilters => ({
    rooms: [],
    areaMin: bounds.areaMin,
    areaMax: bounds.areaMax,
    priceMin: bounds.priceMin,
    priceMax: bounds.priceMax,
    floorMin: bounds.floorMin,
    floorMax: bounds.floorMax,
    statuses: ['bosh', 'band'],
  });
  const [cf, setCf] = useState<RangeFilters>(fullFilter);
  const initKey = useRef('');

  // reset filter (and read ?xona) whenever block/entrance changes
  useEffect(() => {
    const key = `${effBlock}-${effEnt}`;
    if (initKey.current === key) return;
    initKey.current = key;
    const base = fullFilter();
    const xona = (sp.get('xona') || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
    if (xona.length) base.rooms = xona;
    setCf(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effBlock, effEnt, bounds.areaMin, bounds.areaMax, bounds.priceMin, bounds.priceMax, bounds.floorMin, bounds.floorMax]);

  // write ?xona when room chips change (step C only)
  useEffect(() => {
    if (step !== 'C') return;
    const cur = sp.get('xona') || '';
    const next = cf.rooms.join(',');
    if (cur === next) return;
    const q = `blok=${effBlock}&podyezd=${effEnt}` + (next ? `&xona=${next}` : '');
    router.replace(routes.chess(p.id, q), { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cf.rooms, step]);

  // ---- compare (local) ----------------------------------------------------
  const [compare, setCompare] = useState<Cell[]>([]);
  const toggleCompare = (c: Cell) =>
    setCompare((list) => (list.some((x) => x.id === c.id) ? list.filter((x) => x.id !== c.id) : list.length >= 3 ? list : [...list, c]));

  const [sheet, setSheet] = useState(false);
  const [tip, setTip] = useState<{ cell: Cell; x: number; y: number } | null>(null);
  const [hover, setHover] = useState<{ f: number; c: number } | null>(null);
  const [sort, setSort] = useState<{ key: 'floor' | 'area' | 'price'; dir: 1 | -1 }>({ key: 'price', dir: 1 });

  // ---- derived ------------------------------------------------------------
  const allCells = useMemo(() => rows.flatMap((r) => r.cells), [rows]);
  const matched = useMemo(() => allCells.filter((c) => cellMatches(c, cf)), [allCells, cf]);
  const foundCount = matched.length;
  const freeCount = matched.filter((c) => c.status === 'bosh').length;
  // counts ignoring the status filter, so all three totals always show
  const byStatus = useMemo(() => {
    const ns = allCells.filter(
      (c) =>
        (!cf.rooms.length || cf.rooms.includes(c.rooms)) &&
        c.area >= cf.areaMin && c.area <= cf.areaMax &&
        c.price >= cf.priceMin && c.price <= cf.priceMax &&
        c.f >= cf.floorMin && c.f <= cf.floorMax
    );
    return {
      bosh: ns.filter((c) => c.status === 'bosh').length,
      band: ns.filter((c) => c.status === 'band').length,
      sotilgan: ns.filter((c) => c.status === 'sotilgan').length,
    };
  }, [allCells, cf.rooms, cf.areaMin, cf.areaMax, cf.priceMin, cf.priceMax, cf.floorMin, cf.floorMax]);
  const activeFilterCount =
    cf.rooms.length +
    (cf.areaMin > bounds.areaMin || cf.areaMax < bounds.areaMax ? 1 : 0) +
    (cf.priceMin > bounds.priceMin || cf.priceMax < bounds.priceMax ? 1 : 0) +
    (cf.floorMin > bounds.floorMin || cf.floorMax < bounds.floorMax ? 1 : 0) +
    (cf.statuses.length !== 2 || !cf.statuses.includes('bosh') || !cf.statuses.includes('band') ? 1 : 0);

  const resetFilter = () => setCf(fullFilter());
  const toggleRoom = (r: number) => setCf((f) => ({ ...f, rooms: f.rooms.includes(r) ? f.rooms.filter((x) => x !== r) : [...f.rooms, r] }));
  const toggleStatus = (s: StatusKey) => setCf((f) => ({ ...f, statuses: f.statuses.includes(s) ? f.statuses.filter((x) => x !== s) : [...f.statuses, s] }));

  const sortVal = (c: Cell, k: 'floor' | 'area' | 'price') => (k === 'floor' ? c.f : k === 'area' ? c.area : c.price);
  const listSorted = useMemo(() => [...matched].sort((a, b) => (sortVal(a, sort.key) - sortVal(b, sort.key)) * sort.dir), [matched, sort]);

  return (
    <section className="mk-screen" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(18px,2.4vw,28px) clamp(14px,3vw,32px) clamp(40px,5vw,70px)' }}>
      {/* breadcrumb / stepper */}
      <Breadcrumb p={p} step={step} block={block} entrance={entrance} onProject={() => actions.goProject(p.id)} onBackA={backToA} onBackB={backToB} />

      {step === 'A' && <StepA p={p} totalFree={totalFree} onPick={selBlock} />}
      {step === 'B' && <StepB p={p} block={effBlock} onPick={selEntrance} onBack={backToA} />}

      {step === 'C' && (
        <div>
          {/* quick switch + top bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(21px,2.6vw,30px)', margin: '0 0 6px', color: 'var(--ink)' }}>Kvartira tanlang</h2>
              <div style={{ fontSize: 14.5, color: 'var(--slate)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>Topildi: <b style={{ color: 'var(--ink)' }}>{foundCount}</b></span>
                <span style={{ color: 'var(--mute)' }}>·</span>
                <span>Bo‘sh: <b style={{ color: 'var(--free)' }}>{byStatus.bosh}</b></span>
                <span>Band: <b style={{ color: 'var(--busy)' }}>{byStatus.band}</b></span>
                <span>Sotilgan: <b style={{ color: 'var(--sold)' }}>{byStatus.sotilgan}</b></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <QuickSelect label="Blok" value={effBlock} options={(p.blocks || []).map((b) => [b, `Blok ${b}`])} onChange={(v) => nav(`blok=${v}&podyezd=1`)} />
              <QuickSelect label="Pod‘yezd" value={String(effEnt)} options={Array.from({ length: p.entrances }, (_, i) => [String(i + 1), `${i + 1}-pod‘yezd`])} onChange={(v) => selEntrance(+v)} />
              <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => actions.setChessView('grid')} style={viewBtn(state.chessView === 'grid')}>▦ Shaxmatka</button>
                <button onClick={() => actions.setChessView('list')} style={viewBtn(state.chessView === 'list')}>☰ Ro‘yxat</button>
              </div>
            </div>
          </div>

          {/* clickable legend — toggles the status filter */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            {(['bosh', 'band', 'sotilgan'] as StatusKey[]).map((s) => {
              const on = cf.statuses.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  aria-pressed={on}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${on ? STATUS[s].color : 'var(--line)'}`,
                    background: on ? STATUS[s].bg : '#fff', color: on ? 'var(--ink)' : 'var(--mute)', fontSize: 12.5, fontWeight: 600,
                    padding: '7px 12px', borderRadius: 20, cursor: 'pointer', opacity: on ? 1 : 0.7, transition: 'all .15s ease',
                  }}
                >
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: STATUS[s].color }} />
                  {STATUS[s].label}
                  <b style={{ color: on ? STATUS[s].color : 'var(--mute)' }}>{byStatus[s]}</b>
                </button>
              );
            })}
          </div>

          <div className="mk-chessgrid" style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
            {/* desktop filter */}
            <aside className="mk-filter-desktop" style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
              <FilterPanel p={p} cf={cf} bounds={bounds} foundCount={foundCount} toggleRoom={toggleRoom} toggleStatus={toggleStatus} setCf={setCf} reset={resetFilter} />
            </aside>

            {/* board */}
            <div>
              {foundCount === 0 ? (
                <EmptyState onReset={resetFilter} />
              ) : state.chessView === 'grid' ? (
                <Grid rows={rows} cf={cf} bounds={bounds} favorites={state.favorites} compare={compare} hover={hover} setHover={setHover} setTip={setTip} onOpen={actions.openApt} onFav={actions.toggleFav} onCompare={toggleCompare} />
              ) : (
                <ListView cells={listSorted} sort={sort} setSort={setSort} favorites={state.favorites} onOpen={actions.openApt} onFav={actions.toggleFav} />
              )}
            </div>
          </div>

          {/* mobile filter trigger */}
          <button className="mk-filter-fab" onClick={() => setSheet(true)}>
            ⚙ Filtr{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>

          {/* mobile bottom sheet */}
          <div className="mk-sheet-wrap" style={{ pointerEvents: sheet ? 'auto' : 'none' }}>
            <div className="mk-sheet-scrim" style={{ opacity: sheet ? 1 : 0 }} onClick={() => setSheet(false)} />
            <div className="mk-sheet" style={{ transform: sheet ? 'translateY(0)' : 'translateY(105%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Filtr</div>
                <button onClick={() => setSheet(false)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--mute)' }}>×</button>
              </div>
              <FilterPanel p={p} cf={cf} bounds={bounds} foundCount={foundCount} toggleRoom={toggleRoom} toggleStatus={toggleStatus} setCf={setCf} reset={resetFilter} embedded />
              <button onClick={() => setSheet(false)} style={{ width: '100%', marginTop: 14, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 12, cursor: 'pointer' }}>Ko‘rsatish ({foundCount} ta)</button>
            </div>
          </div>

          {/* compare bar */}
          {compare.length > 0 && <CompareBar items={compare} p={p} onRemove={(id: string) => setCompare((l) => l.filter((x) => x.id !== id))} onClear={() => setCompare([])} onOpen={actions.openApt} />}
        </div>
      )}

      {/* floating tooltip */}
      {tip && <CellTooltip cell={tip.cell} x={tip.x} y={tip.y} />}

      <style jsx>{`
        .mk-filter-fab {
          display: none;
        }
        @media (max-width: 900px) {
          .mk-chessgrid {
            grid-template-columns: 1fr !important;
          }
          .mk-filter-desktop {
            display: none !important;
          }
          .mk-filter-fab {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            position: fixed;
            bottom: 18px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 70;
            border: none;
            background: var(--ink);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            padding: 13px 24px;
            border-radius: 30px;
            box-shadow: 0 10px 30px rgba(15, 24, 38, 0.28);
            cursor: pointer;
          }
        }
        .mk-sheet-wrap {
          position: fixed;
          inset: 0;
          z-index: 80;
        }
        .mk-sheet-scrim {
          position: absolute;
          inset: 0;
          background: rgba(15, 24, 38, 0.4);
          transition: opacity 0.3s ease;
        }
        .mk-sheet {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          max-height: 86vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 20px 20px 0 0;
          padding: 18px 18px 24px;
          box-shadow: 0 -10px 40px rgba(15, 24, 38, 0.2);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (min-width: 901px) {
          .mk-sheet-wrap {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

/* ============================ BREADCRUMB ============================ */
function Breadcrumb({ p, step, block, entrance, onProject, onBackA, onBackB }: any) {
  const crumb = { border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', padding: 0, fontSize: 13, fontWeight: 600 } as const;
  const sep = <span style={{ color: 'var(--mute)', margin: '0 4px' }}>/</span>;
  return (
    <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <button onClick={onProject} style={crumb}>{p.name}</button>
      {sep}
      {step === 'A' ? (
        <span>Blok tanlash</span>
      ) : (
        <>
          <button onClick={onBackA} style={crumb}>Blok {block}</button>
          {step === 'B' ? (
            <>{sep}<span>Pod‘yezd tanlash</span></>
          ) : (
            <>{sep}<button onClick={onBackB} style={crumb}>{entrance}-pod‘yezd</button>{sep}<span>Shaxmatka</span></>
          )}
        </>
      )}
    </div>
  );
}

/* ============================ STEP A — GENPLAN ============================ */
function StepA({ p, totalFree, onPick }: { p: any; totalFree: number; onPick: (b: string) => void }) {
  const blocks = (p.blocks || []).map((b: string, i: number) => ({ name: b, free: blockFree(p, b), h: BLOCK_HEIGHTS[i % BLOCK_HEIGHTS.length] }));
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px,2.8vw,34px)', margin: 0, color: 'var(--ink)' }}>Blokni tanlang</h2>
        <div style={{ fontSize: 14, color: 'var(--slate)' }}>Jami bo‘sh: <b style={{ color: 'var(--free)' }}>{totalFree} ta</b></div>
      </div>
      <p style={{ fontSize: 15, color: 'var(--slate)', margin: '0 0 22px' }}>Yuqoridan ko‘rinishdagi bosh rejada blokka bosing.</p>
      <div style={{ position: 'relative', background: 'linear-gradient(160deg,#EAF0E6,#DCE7EF)', border: '1px solid var(--line)', borderRadius: 20, padding: 'clamp(24px,4vw,54px)', minHeight: 400, overflow: 'hidden' }}>
        {/* grid + landscape contours */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'repeating-linear-gradient(90deg,transparent,transparent 38px,rgba(15,24,38,.04) 39px),repeating-linear-gradient(0deg,transparent,transparent 38px,rgba(15,24,38,.04) 39px)' }} />
        <div style={{ position: 'absolute', left: '6%', bottom: '9%', width: '40%', height: 16, background: '#C9D2CB', borderRadius: 8 }} />
        <div style={{ position: 'absolute', right: '8%', top: '14%', width: 90, height: 90, borderRadius: '50%', background: 'rgba(23,178,106,.14)', border: '1px dashed rgba(23,178,106,.4)' }} />
        <div style={{ position: 'absolute', left: '46%', top: '10%', width: 60, height: 60, borderRadius: '50%', background: 'rgba(23,178,106,.12)' }} />
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 'clamp(18px,3vw,44px)', alignItems: 'flex-end', justifyContent: 'center', minHeight: 340 }}>
          {blocks.map((b: any) => {
            const dead = b.free === 0;
            return (
              <button
                key={b.name}
                className={dead ? 'mk-block-dead' : 'mk-block'}
                disabled={dead}
                onClick={() => !dead && onPick(b.name)}
                aria-label={`Blok ${b.name}, ${b.free} ta bo‘sh`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
                  width: 'clamp(104px,14vw,144px)', height: b.h, paddingBottom: 18, border: 'none', borderRadius: '14px 14px 6px 6px',
                  background: dead ? 'linear-gradient(180deg,#B9C0CC,#9AA1AD)' : 'linear-gradient(180deg,#4E86FF,#0060FE)',
                  cursor: dead ? 'not-allowed' : 'pointer', opacity: dead ? 0.7 : 1, transition: 'all .25s ease',
                  boxShadow: dead ? 'none' : '0 10px 30px rgba(0,96,254,.2)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', color: '#fff' }}>{b.name}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.85)' }}>Blok · {p.floors} qavat</span>
                <span style={{ marginTop: 10, background: '#fff', color: dead ? 'var(--sold)' : 'var(--free)', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 20 }}>{dead ? 'Sotilgan' : `${b.free} ta bo‘sh`}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position: 'absolute', right: 18, top: 16, background: 'rgba(255,255,255,.85)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--slate)' }}>🧭 Yuqoridan ko‘rinish</div>
      </div>
      <style jsx>{`
        .mk-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(0, 96, 254, 0.3) !important;
          filter: brightness(1.06);
        }
      `}</style>
    </div>
  );
}

/* ============================ STEP B — FACADE ============================ */
function StepB({ p, block, onPick, onBack }: { p: any; block: string; onPick: (e: number) => void; onBack: () => void }) {
  return (
    <div>
      <h2 style={{ fontWeight: 800, fontSize: 'clamp(22px,2.8vw,34px)', margin: '0 0 6px', color: 'var(--ink)' }}>Pod‘yezdni tanlang · Blok {block}</h2>
      <p style={{ fontSize: 15, color: 'var(--slate)', margin: '0 0 22px' }}>Fasaddagi yorug‘ oynalar — bo‘sh kvartiralar. Kirishni tanlang.</p>
      <div className="mk-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(220px,1fr)', gap: 24, alignItems: 'center' }}>
        <div style={{ background: 'linear-gradient(180deg,#0E1B33,#132546)', border: '1px solid var(--line)', borderRadius: 20, padding: 'clamp(20px,3vw,38px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(10px,2vw,22px)' }}>
            {Array.from({ length: p.entrances }, (_, e) => {
              const erows = genFloors(p, block, e + 1); // real per-entrance availability
              return (
                <div key={e} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
                    {erows.map((row, fi) => (
                      <div key={fi} style={{ display: 'flex', gap: 4 }}>
                        {[0, 1, 2].map((w) => {
                          const cell = row.cells[(w * 2 + 1) % 5];
                          const col = cell.status === 'bosh' ? 'rgba(23,178,106,.9)' : cell.status === 'band' ? 'rgba(232,144,26,.85)' : 'rgba(255,255,255,.08)';
                          return <span key={w} style={{ width: 13, height: 11, borderRadius: 2, background: col, boxShadow: cell.status === 'bosh' ? '0 0 6px rgba(23,178,106,.6)' : 'none' }} />;
                        })}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => onPick(e + 1)} className="mk-ent-btn" style={{ marginTop: 8, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, padding: '8px 4px', cursor: 'pointer', transition: 'all .2s ease' }}>{e + 1}</button>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, color: 'var(--slate)' }}>Kirishlar soni: <b style={{ color: 'var(--ink)' }}>{p.entrances} ta</b></div>
          {Array.from({ length: p.entrances }, (_, e) => (
            <button key={e} className="mk-entrow" onClick={() => onPick(e + 1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--line)', background: '#fff', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .2s ease' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{e + 1}-pod‘yezd</span>
              <span style={{ background: 'var(--free-bg)', color: 'var(--free)', fontSize: 13, fontWeight: 700, padding: '5px 11px', borderRadius: 20 }}>{entranceFree(p, block, e + 1)} ta bo‘sh</span>
            </button>
          ))}
          <button onClick={onBack} style={{ marginTop: 6, border: '1px solid var(--line)', background: 'var(--soft)', color: 'var(--slate)', borderRadius: 12, fontSize: 14, fontWeight: 600, padding: 12, cursor: 'pointer' }}>← Blokni o‘zgartirish</button>
        </div>
      </div>
      <style jsx>{`
        .mk-ent-btn:hover { background: var(--blue) !important; border-color: var(--blue) !important; }
        .mk-entrow:hover { border-color: var(--blue); box-shadow: var(--shadow-sm); }
        @media (max-width: 780px) { .mk-stack { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ============================ FILTER PANEL ============================ */
function FilterPanel({ p, cf, bounds, foundCount, toggleRoom, toggleStatus, setCf, reset, embedded }: any) {
  return (
    <div style={{ background: embedded ? 'transparent' : 'var(--soft)', border: embedded ? 'none' : '1px solid var(--line)', borderRadius: 16, padding: embedded ? 0 : 20 }}>
      {!embedded && <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>Filtrlar</div>}

      <div style={label}>Xonalar soni</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {ROOM_OPTS.map(([v, l]) => {
          const on = cf.rooms.includes(v);
          return <button key={v} onClick={() => toggleRoom(v)} style={{ border: `1px solid ${on ? 'var(--blue)' : 'var(--line)'}`, background: on ? 'var(--blue)' : '#fff', color: on ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 600, padding: '8px 13px', borderRadius: 9, cursor: 'pointer', transition: 'all .15s ease' }}>{l}</button>;
        })}
      </div>

      <div style={label}>Maydon, m²</div>
      <DualRange min={bounds.areaMin} max={bounds.areaMax} step={1} valueMin={cf.areaMin} valueMax={cf.areaMax} onChange={(lo, hi) => setCf((f: any) => ({ ...f, areaMin: lo, areaMax: hi }))} format={(n) => `${n} m²`} />

      <div style={{ ...label, marginTop: 10 }}>Narx, mln so‘m</div>
      <DualRange min={bounds.priceMin} max={bounds.priceMax} step={10} valueMin={cf.priceMin} valueMax={cf.priceMax} onChange={(lo, hi) => setCf((f: any) => ({ ...f, priceMin: lo, priceMax: hi }))} format={(n) => `${fmt(n)}`} />

      <div style={{ ...label, marginTop: 10 }}>Qavat</div>
      <DualRange min={bounds.floorMin} max={bounds.floorMax} step={1} valueMin={cf.floorMin} valueMax={cf.floorMax} onChange={(lo, hi) => setCf((f: any) => ({ ...f, floorMin: lo, floorMax: hi }))} />

      <div style={{ ...label, marginTop: 12 }}>Holat</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {(['bosh', 'band', 'sotilgan'] as StatusKey[]).map((s) => {
          const on = cf.statuses.includes(s);
          return (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--ink)' }}>
              <span onClick={() => toggleStatus(s)} style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? 'var(--blue)' : 'var(--line)'}`, background: on ? 'var(--blue)' : '#fff', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{on ? '✓' : ''}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS[s].bg, border: `1.5px solid ${STATUS[s].color}` }} />
                {STATUS[s].label}
              </span>
            </label>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <button onClick={reset} style={{ border: 'none', background: 'none', color: 'var(--blue)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Tozalash</button>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}><b style={{ color: 'var(--ink)' }}>{foundCount}</b> ta topildi</div>
      </div>
    </div>
  );
}

/* ============================ GRID ============================ */
function Grid({ rows, cf, bounds, favorites, compare, hover, setHover, setTip, onOpen, onFav, onCompare }: any) {
  let idx = 0;
  return (
    <div className="mk-scroll" style={{ position: 'relative' }}>
      <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
        <div style={{ minWidth: 5 * 118 + 44 }}>
          {/* column headers */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, paddingLeft: 44 }}>
            {COLS.map((c, i) => (
              <div key={i} className="mk-cellw" style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: hover?.c === i ? 'var(--blue)' : 'var(--mute)', transition: 'color .15s' }}>{c}</div>
            ))}
          </div>
          {rows.map((row: any) => (
            <div key={row.floor} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div className="mk-floorcol" style={{ background: hover?.f === row.floor ? 'var(--blue-050)' : 'var(--soft)', color: hover?.f === row.floor ? 'var(--blue)' : 'var(--mute)' }}>{row.floor}</div>
              {row.cells.map((cell: Cell) => {
                const match = cellMatches(cell, cf);
                const sold = cell.status === 'sotilgan';
                const st = STATUS[cell.status];
                const cross = hover && (hover.f === cell.f || hover.c === cell.c);
                const opacity = match ? (sold ? 0.55 : 1) : 0.25;
                const clickable = match && !sold;
                const isFav = favorites.includes(cell.id);
                const inCmp = compare.some((x: Cell) => x.id === cell.id);
                const delay = Math.min(idx * 15, 420);
                idx++;
                return (
                  <button
                    key={cell.id}
                    className="mk-cellw mk-cell"
                    disabled={!clickable}
                    onMouseEnter={(e) => { setHover({ f: cell.f, c: cell.c }); if (match) setTip({ cell, x: e.clientX, y: e.clientY }); }}
                    onMouseMove={(e) => { if (match) setTip({ cell, x: e.clientX, y: e.clientY }); }}
                    onMouseLeave={() => { setHover(null); setTip(null); }}
                    onFocus={(e) => { setHover({ f: cell.f, c: cell.c }); if (match) { const r = e.currentTarget.getBoundingClientRect(); setTip({ cell, x: r.left + r.width / 2, y: r.top }); } }}
                    onBlur={() => { setHover(null); setTip(null); }}
                    onClick={() => clickable && onOpen(cell)}
                    title={`${cell.roomsLabel} · ${cell.area} m² · ${st.label}`}
                    style={{
                      position: 'relative', height: 72, border: `1px solid ${st.color}`, background: cross && match ? mixTint(cell.status) : st.bg,
                      color: st.color, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                      cursor: clickable ? 'pointer' : 'not-allowed', opacity, transition: 'transform .15s ease, box-shadow .15s ease, background .15s ease',
                      pointerEvents: match ? 'auto' : 'none', padding: '4px 6px',
                      animation: 'mk-fade .3s ease both', animationDelay: `${delay}ms`,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>{cell.roomsShort}</span>
                    <span style={{ fontSize: 10.5, opacity: 0.85 }}>{cell.area} m²</span>
                    {!sold && <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 9.5, fontWeight: 700, opacity: 0.9 }}>{fmt(cell.price)}</span>}
                    {clickable && (
                      <>
                        <span
                          role="button"
                          aria-label="Sevimlilarga qo‘shish"
                          onClick={(e) => { e.stopPropagation(); onFav(cell.id); }}
                          className="mk-cell-act"
                          style={{ position: 'absolute', top: 3, right: 4, fontSize: 12, lineHeight: 1, color: isFav ? '#EF476F' : 'var(--mute)', opacity: isFav ? 1 : 0 }}
                        >
                          {isFav ? '♥' : '♡'}
                        </span>
                        <span
                          role="button"
                          aria-label="Taqqoslashga qo‘shish"
                          onClick={(e) => { e.stopPropagation(); onCompare(cell); }}
                          className="mk-cell-act"
                          style={{ position: 'absolute', top: 3, left: 4, width: 15, height: 15, borderRadius: 4, background: inCmp ? 'var(--blue)' : 'rgba(15,24,38,.08)', color: inCmp ? '#fff' : 'var(--slate)', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: inCmp ? 1 : 0 }}
                        >
                          {inCmp ? '✓' : '+'}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mk-scroll-edge" />
      <style jsx>{`
        .mk-cellw { width: 110px; flex-shrink: 0; }
        .mk-floorcol {
          position: sticky; left: 0; z-index: 2; width: 30px; height: 72px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; border-radius: 8px;
          font-size: 12px; font-weight: 700; transition: all .15s ease;
        }
        .mk-cell:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(15, 24, 38, 0.16); border-width: 1.5px; z-index: 1; }
        .mk-cell:hover .mk-cell-act { opacity: 1 !important; }
        .mk-cell-act { transition: opacity .15s ease, transform .15s ease; cursor: pointer; }
        .mk-cell-act:hover { transform: scale(1.2); }
        .mk-scroll-edge {
          position: absolute; top: 0; right: 0; bottom: 12px; width: 26px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9));
        }
        @media (max-width: 560px) {
          .mk-cellw { width: 88px; }
          .mk-cell { height: 64px !important; }
        }
      `}</style>
    </div>
  );
}

/* ============================ LIST VIEW ============================ */
function ListView({ cells, sort, setSort, favorites, onOpen, onFav }: any) {
  const th = (key: 'floor' | 'area' | 'price', label: string) => (
    <button onClick={() => setSort((s: any) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))} style={{ border: 'none', background: 'none', cursor: 'pointer', font: 'inherit', fontWeight: 700, color: sort.key === key ? 'var(--blue)' : 'var(--slate)', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}>
      {label}{sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : ''}
    </button>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 720 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1.2fr 1.2fr 1fr 1.1fr 96px', gap: 8, padding: '10px 14px', fontSize: 12.5, borderBottom: '1px solid var(--line)' }}>
          <span>{th('floor', 'Qavat')}</span><span style={hc}>Xona</span><span>{th('area', 'Maydon')}</span><span style={hc}>Yo‘nalish</span><span>{th('price', 'Narx')}</span><span style={hc}>m² narxi</span><span style={hc}>Holat</span><span />
        </div>
        {cells.map((c: Cell) => {
          const st = STATUS[c.status];
          const sold = c.status === 'sotilgan';
          const isFav = favorites.includes(c.id);
          return (
            <div key={c.id} className="mk-listrow" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1.2fr 1.2fr 1fr 1.1fr 96px', gap: 8, padding: '13px 14px', alignItems: 'center', fontSize: 13.5, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.f}-qavat</span>
              <span>{c.roomsLabel}</span>
              <span>{c.area} m²</span>
              <span style={{ color: 'var(--slate)' }}>{c.orient}</span>
              <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, color: 'var(--ink)' }}>{c.priceLabel}</span>
              <span style={{ color: 'var(--slate)' }}>{c.ppm2} mln</span>
              <span><span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>{st.label}</span></span>
              <span style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                <button onClick={() => onFav(c.id)} aria-label="Sevimli" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: isFav ? '#EF476F' : 'var(--mute)', padding: 0 }}>{isFav ? '♥' : '♡'}</button>
                <button disabled={sold} onClick={() => !sold && onOpen(c)} style={{ border: '1px solid var(--line)', background: sold ? 'var(--soft)' : '#fff', color: sold ? 'var(--mute)' : 'var(--blue)', fontSize: 12.5, fontWeight: 600, padding: '7px 12px', borderRadius: 9, cursor: sold ? 'not-allowed' : 'pointer' }}>Ko‘rish</button>
              </span>
            </div>
          );
        })}
      </div>
      <style jsx>{`.mk-listrow:hover { background: var(--soft); }`}</style>
    </div>
  );
}

/* ============================ COMPARE BAR ============================ */
function CompareBar({ items, p, onRemove, onClear, onOpen }: any) {
  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 50, marginTop: 24, background: '#fff', border: '1px solid var(--line)', borderRadius: 16, boxShadow: '0 -8px 30px rgba(15,24,38,.12)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Taqqoslash ({items.length})</div>
        <button onClick={onClear} style={{ border: 'none', background: 'none', color: 'var(--mute)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Tozalash</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`, gap: 12 }}>
        {items.map((c: Cell) => (
          <div key={c.id} style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: 'var(--soft)' }}>
            <button onClick={() => onRemove(c.id)} aria-label="Olib tashlash" style={{ position: 'absolute', top: 8, right: 8, border: 'none', background: 'none', fontSize: 16, color: 'var(--mute)', cursor: 'pointer' }}>×</button>
            <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{c.roomsLabel}</div>
            <Cmp k="Maydon" v={`${c.area} m²`} />
            <Cmp k="Narx" v={c.priceLabel} />
            <Cmp k="Qavat" v={`${c.f}/${p.floors}`} />
            <Cmp k="Yo‘nalish" v={c.orient} />
            <button onClick={() => onOpen(c)} style={{ width: '100%', marginTop: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 600, padding: 10, borderRadius: 9, cursor: 'pointer' }}>Ko‘rish</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Cmp({ k, v }: { k: string; v: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}><span style={{ color: 'var(--slate)' }}>{k}</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{v}</span></div>;
}

/* ============================ TOOLTIP ============================ */
function CellTooltip({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  const st = STATUS[cell.status];
  return (
    <div style={{ position: 'fixed', left: Math.min(x + 14, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 210), top: Math.max(12, y - 120), zIndex: 120, width: 196, background: 'var(--ink)', color: '#fff', borderRadius: 12, padding: '12px 14px', boxShadow: '0 12px 40px rgba(15,24,38,.35)', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 16 }}>{cell.roomsLabel}</span>
        <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{st.label}</span>
      </div>
      <TipRow k="Maydon" v={`${cell.area} m²`} />
      <TipRow k="Qavat" v={cell.floorLabel} />
      <TipRow k="Yo‘nalish" v={cell.orient} />
      <TipRow k="m² narxi" v={`${cell.ppm2} mln`} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,.14)', margin: '8px 0 6px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Narx</span>
        <span style={{ fontFamily: 'var(--font-manrope)', fontWeight: 800, fontSize: 18 }}>{cell.priceLabel}</span>
      </div>
    </div>
  );
}
function TipRow({ k, v }: { k: string; v: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '2px 0', color: 'rgba(255,255,255,.85)' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>;
}

/* ============================ EMPTY STATE ============================ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: 'var(--soft)', border: '1px dashed var(--line)', borderRadius: 16, minHeight: 320 }}>
      <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.5 }}>🔍</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>Bunday parametrlarga mos kvartira topilmadi</div>
      <p style={{ fontSize: 14.5, color: 'var(--slate)', margin: '0 0 20px', maxWidth: '38ch' }}>Filtrni bo‘shatib ko‘ring yoki boshqa blok/pod‘yezdni tanlang.</p>
      <button onClick={onReset} style={{ border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 14.5, fontWeight: 600, padding: '12px 24px', borderRadius: 11, cursor: 'pointer' }}>Filtrni tozalash</button>
    </div>
  );
}

/* ============================ small bits ============================ */
const label: CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--slate)', marginBottom: 10 };
const hc: CSSProperties = { fontWeight: 700, color: 'var(--slate)', fontSize: 12.5 };
function viewBtn(on: boolean): CSSProperties {
  return { border: 'none', background: on ? 'var(--blue)' : '#fff', color: on ? '#fff' : 'var(--slate)', fontSize: 13, fontWeight: 600, padding: '9px 14px', cursor: 'pointer' };
}
function Legend({ color, bg, label }: { color: string; bg: string; label: string }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: color }} /><span style={{ color: 'var(--slate)' }}>{label}</span></span>;
}
function QuickSelect({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--slate)' }}>
      {label}:
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 9, padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--ink)', background: '#fff', cursor: 'pointer', outline: 'none' }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function mixTint(status: StatusKey): string {
  // slightly stronger tint on cross-highlight
  return status === 'bosh' ? '#d7f3e5' : status === 'band' ? '#fbe8cd' : 'var(--sold-bg)';
}
