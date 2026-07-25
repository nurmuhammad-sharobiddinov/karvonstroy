'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useApp } from '@/store/AppContext';
import { PROJECTS, PROJECT_IMG } from '@/lib/data';
import { projStatusColor, projTotalFree } from '@/lib/chess';

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
  }) as const;

export default function Catalog() {
  const { state, actions } = useApp();

  const projects = useMemo(
    () =>
      PROJECTS.filter(
        (p) => (state.catCls === 'all' || p.cls === state.catCls) && (state.catStatus === 'all' || p.status === state.catStatus)
      ).map((p) => {
        const c = projStatusColor(p);
        return { ...p, statusBg: c.bg, statusColor: c.c, free: projTotalFree(p), img: PROJECT_IMG[p.id] };
      }),
    [state.catCls, state.catStatus]
  );

  const classOpts: [string, string][] = [['all', 'Barcha klass'], ['Komfort', 'Komfort'], ['Komfort+', 'Komfort+'], ['Biznes', 'Biznes']];
  const statusOpts: [string, string][] = [['all', 'Barchasi'], ['sotuvda', 'Sotuvda'], ['start', 'Start'], ['topshirilgan', 'Topshirilgan']];

  return (
    <section className="mk-screen" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(22px,3vw,40px) clamp(14px,3vw,32px)' }}>
      <div style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 10 }}>
        <button onClick={() => actions.goHome()} style={{ border: 'none', background: 'none', color: 'var(--mute)', cursor: 'pointer', padding: 0, fontSize: 13 }}>Bosh sahifa</button> / Loyihalar katalogi
      </div>
      <h1 style={{ fontWeight: 800, fontSize: 'clamp(26px,3.4vw,42px)', letterSpacing: '-.02em', margin: '0 0 22px', color: 'var(--ink)' }}>Loyihalar katalogi</h1>

      <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 16, padding: 14, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', whiteSpace: 'nowrap', minWidth: 46 }}>Klass:</span>
          <div className="mk-chiprow" style={{ flex: 1, minWidth: 0 }}>
            {classOpts.map(([v, l]) => (
              <button key={v} onClick={() => actions.set({ catCls: v })} style={chip(state.catCls === v)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)', whiteSpace: 'nowrap', minWidth: 46 }}>Holat:</span>
          <div className="mk-chiprow" style={{ flex: 1, minWidth: 0 }}>
            {statusOpts.map(([v, l]) => (
              <button key={v} onClick={() => actions.set({ catStatus: v })} style={chip(state.catStatus === v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))', gap: 20 }}>
        {projects.map((p) => (
          <div key={p.id} onClick={() => actions.goProject(p.id)} className="mk-catcard" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all .2s ease' }}>
            <div style={{ position: 'relative', aspectRatio: '16/11', overflow: 'hidden' }}>
              <Image src={p.img} alt={p.name} fill sizes="(max-width:900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: 12, left: 12, background: p.statusBg, color: p.statusColor, fontSize: 12, fontWeight: 600, padding: '6px 11px', borderRadius: 20 }}>{p.statusLabel}</span>
              <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.92)', color: 'var(--ink)', fontSize: 12, fontWeight: 600, padding: '6px 11px', borderRadius: 20 }}>{p.cls}</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 21, color: 'var(--ink)' }}>{p.name}</div>
              <div style={{ fontSize: 14, color: 'var(--slate)', marginTop: 5 }}>◉ {p.district} · {p.deadline}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                <span style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5, color: 'var(--slate)', padding: '5px 9px' }}>Studiya–4 xona</span>
                <span style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12.5, color: 'var(--slate)', padding: '5px 9px' }}>{p.free} ta bo‘sh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontFamily: 'var(--font-manrope)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>{p.priceFrom} mln so‘mdan</div>
                <span style={{ color: 'var(--blue)', fontWeight: 600, fontSize: 14 }}>Batafsil</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .mk-catcard:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: var(--blue-100); }
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
