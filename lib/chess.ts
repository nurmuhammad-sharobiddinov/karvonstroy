// ============================================================================
// KARVON STROY — apartment ("shaxmatka") generation & finance logic.
// Ported verbatim from the design bundle's Component class so the deterministic
// availability grid, pricing and mortgage figures match the original exactly.
// ============================================================================

import { PROJECTS, type Project } from './data';

export type StatusKey = 'bosh' | 'band' | 'sotilgan';

export type Cell = {
  id: string;
  f: number; // floor
  c: number; // column 0..4
  block: string;
  rooms: number;
  roomsShort: string;
  roomsLabel: string;
  area: number;
  price: number;
  ppm2: string;
  status: StatusKey;
  orient: string;
  priceLabel: string;
  floorLabel: string;
};

export type FloorRow = { floor: number; cells: Cell[] };

export type Filters = { rooms: number[]; area: number; price: number; floor: number };
export type Mort = { price: number; down: number; term: number; rate?: number };

// --- Rich range filter (BI-style shaxmatka) --------------------------------
export type RangeFilters = {
  rooms: number[];
  areaMin: number;
  areaMax: number;
  priceMin: number;
  priceMax: number;
  floorMin: number;
  floorMax: number;
  statuses: StatusKey[];
};

export type Bounds = {
  areaMin: number;
  areaMax: number;
  priceMin: number;
  priceMax: number;
  floorMin: number;
  floorMax: number;
};

/** Min/max area, price and floor across a set of floor rows (for slider bounds). */
export function computeBounds(rows: FloorRow[]): Bounds {
  let aMin = Infinity, aMax = -Infinity, pMin = Infinity, pMax = -Infinity, fMin = Infinity, fMax = -Infinity;
  for (const row of rows) {
    for (const c of row.cells) {
      if (c.area < aMin) aMin = c.area;
      if (c.area > aMax) aMax = c.area;
      if (c.price < pMin) pMin = c.price;
      if (c.price > pMax) pMax = c.price;
      if (c.f < fMin) fMin = c.f;
      if (c.f > fMax) fMax = c.f;
    }
  }
  if (aMin === Infinity) return { areaMin: 0, areaMax: 0, priceMin: 0, priceMax: 0, floorMin: 1, floorMax: 1 };
  return { areaMin: aMin, areaMax: aMax, priceMin: pMin, priceMax: pMax, floorMin: fMin, floorMax: fMax };
}

/** Rich range-filter test. Rooms empty = any; statuses controls visibility. */
export function cellMatches(c: Cell, f: RangeFilters): boolean {
  if (f.rooms.length && !f.rooms.includes(c.rooms)) return false;
  if (c.area < f.areaMin || c.area > f.areaMax) return false;
  if (c.price < f.priceMin || c.price > f.priceMax) return false;
  if (c.f < f.floorMin || c.f > f.floorMax) return false;
  if (!f.statuses.includes(c.status)) return false;
  return true;
}

const ROOMS_BY_COL = [0, 1, 2, 3, 2];
const AREA_BY_ROOMS: Record<number, number> = { 0: 34, 1: 47, 2: 60, 3: 85 };
const ORIENT = ['Janub', 'Sharq', 'G‘arb', 'Shimol', 'Janubi-sharq'];

/** Thousands-formatted, ru-RU grouping (matches the original `fmt`). */
export function fmt(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

/** Deterministic apartment grid for a project/block/entrance. */
export function genFloors(p: Project, block: string, entrance: number): FloorRow[] {
  const bIdx = (p.blocks || ['A']).indexOf(block) + 1;
  const floors: FloorRow[] = [];
  for (let f = p.floors; f >= 1; f--) {
    const cells: Cell[] = [];
    for (let c = 0; c < 5; c++) {
      const rooms = ROOMS_BY_COL[c];
      const area = (c === 4 ? 56 : AREA_BY_ROOMS[rooms]) + (f % 3) + (c === 2 ? 2 : 0);
      const price = Math.round(area * p.ppm2 + f * 4 + bIdx * 3);
      let key = (f * 5 + c * 3 + p.seed + bIdx * 2 + (entrance || 1)) % 12;
      if (f <= 2) key = key % 4;
      const status: StatusKey = key < 3 ? 'sotilgan' : key < 5 ? 'band' : 'bosh';
      cells.push({
        // entrance qo'shildi — status entrance'ga bog'liq, shuning uchun id
        // ham unga bog'liq bo'lishi shart (aks holda URL'dan qayta tiklab bo'lmaydi).
        id: `${p.id}-${block}-${entrance}-${f}-${c}`,
        f,
        c,
        block,
        rooms,
        roomsShort: rooms === 0 ? 'S' : rooms + 'x',
        roomsLabel: rooms === 0 ? 'Studiya' : rooms + ' xonali',
        area,
        price,
        ppm2: (price / area).toFixed(1),
        status,
        orient: ORIENT[c],
        priceLabel: fmt(price) + ' mln',
        floorLabel: f + '-qavat',
      });
    }
    floors.push({ floor: f, cells });
  }
  return floors;
}

// Free-count cache — genFloors is deterministic, so a block/entrance's free
// count never changes. Keyed by `${projectId}-${block}-${entrance}`.
const freeCache = new Map<string, number>();

/** Bo‘sh kvartiralar soni — bitta pod‘yezdda. */
export function entranceFree(p: Project, block: string, entrance: number): number {
  const key = `${p.id}-${block}-${entrance}`;
  const hit = freeCache.get(key);
  if (hit !== undefined) return hit;
  const v = genFloors(p, block, entrance).reduce(
    (s, r) => s + r.cells.filter((c) => c.status === 'bosh').length,
    0
  );
  freeCache.set(key, v);
  return v;
}

/** Bo‘sh kvartiralar soni — blokdagi BARCHA pod‘yezdlar bo‘yicha. */
/** Kvartirani id orqali qayta tiklash (URL'dan). id = `proj-block-entrance-floor-col`. */
export function cellById(id: string): Cell | null {
  const parts = id.split('-');
  if (parts.length !== 5) return null;
  const [projId, block, entS, fS, cS] = parts;
  const p = PROJECTS.find((x) => x.id === projId);
  if (!p) return null;
  const entrance = Number(entS), f = Number(fS), c = Number(cS);
  if (![entrance, f, c].every(Number.isFinite)) return null;
  const row = genFloors(p, block, entrance).find((r) => r.floor === f);
  return row?.cells.find((x) => x.c === c) ?? null;
}

/** Kvartira id'sidan pod'yezd raqamini olish. */
export function entranceOfId(id: string): number {
  const n = Number(id.split('-')[2]);
  return Number.isFinite(n) ? n : 1;
}

export function blockFree(p: Project, block: string): number {
  let total = 0;
  for (let e = 1; e <= (p.entrances || 1); e++) total += entranceFree(p, block, e);
  return total;
}

export function projTotalFree(p: Project): number {
  return (p.blocks || ['A']).reduce((s, b) => s + blockFree(p, b), 0);
}

export function cellPassesFilter(c: Cell, f: Filters): boolean {
  if (f.rooms.length && !f.rooms.includes(c.rooms)) return false;
  if (c.area > f.area) return false;
  if (c.price > f.price) return false;
  if (c.f < f.floor) return false;
  return true;
}

/** Monthly annuity payment. Rate from the chosen bank (defaults to 16% APR). */
export function mortMonthly(m: Mort): number {
  const P = m.price * (1 - m.down / 100) * 1e6;
  const r = (m.rate ?? 16) / 100 / 12;
  const n = m.term * 12;
  return r ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
}

export function projStatusColor(p: Project): { bg: string; c: string } {
  return p.status === 'sotuvda'
    ? { bg: 'var(--free-bg)', c: 'var(--free)' }
    : p.status === 'start'
    ? { bg: 'var(--blue-050)', c: 'var(--blue)' }
    : { bg: 'var(--sold-bg)', c: 'var(--sold)' };
}

export const STATUS: Record<StatusKey, { label: string; color: string; bg: string; ln: string }> = {
  bosh: { label: 'Bo‘sh', color: 'var(--free)', bg: 'var(--free-bg)', ln: 'var(--free)' },
  band: { label: 'Band', color: 'var(--busy)', bg: 'var(--busy-bg)', ln: 'var(--busy)' },
  sotilgan: { label: 'Sotilgan', color: 'var(--sold)', bg: 'var(--sold-bg)', ln: 'var(--sold-ln)' },
};
