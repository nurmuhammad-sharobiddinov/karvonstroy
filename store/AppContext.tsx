'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Cell, Mort } from '@/lib/chess';
import { HERO_SLIDES } from '@/lib/data';
import { routes } from '@/lib/routes';

const HERO_COUNT = HERO_SLIDES.length;

// UI-only state. Navigation identity (project, apartment, block, entrance…)
// now lives in the URL (App Router), not here.
export type State = {
  lang: 'uz' | 'ru';
  heroIndex: number;
  chessView: 'grid' | 'list';
  mort: Mort;
  mg: Mort;
  catCls: string;
  catStatus: string;
  hsearch: string;
  hcls: string;
  hrooms: number | 'all';
  hprice: number;
  toast: string | null;
  favorites: string[];
};

const INITIAL: State = {
  lang: 'uz',
  heroIndex: 0,
  chessView: 'grid',
  mort: { price: 600, down: 30, term: 20, rate: 16 },
  mg: { price: 600, down: 30, term: 20, rate: 16 },
  catCls: 'all',
  catStatus: 'all',
  hsearch: '',
  hcls: 'all',
  hrooms: 'all',
  hprice: 1500,
  toast: null,
  favorites: [],
};

type Actions = {
  set: (p: Partial<State>) => void;
  // navigation (pushes a real URL)
  goHome: () => void;
  goCatalog: () => void;
  goProject: (id: string) => void;
  goChess: (id: string) => void;
  goMortgage: () => void;
  goOnline: () => void;
  goNews: (id: string) => void;
  openApt: (cell: Cell) => void;
  // ui setters
  setMort: (k: keyof Mort, v: number) => void;
  setMg: (k: keyof Mort, v: number) => void;
  resetHomeFilters: () => void;
  setChessView: (v: 'grid' | 'list') => void;
  setLang: (l: 'uz' | 'ru') => void;
  heroGo: (d: number) => void;
  heroSet: (i: number) => void;
  showToast: (msg: string) => void;
  toggleFav: (id: string) => void;
};

const Ctx = createContext<{ state: State; actions: Actions } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const set = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  const actions = useMemo<Actions>(
    () => ({
      set,
      goHome: () => router.push(routes.home()),
      goCatalog: () => router.push(routes.catalog()),
      goProject: (id) => router.push(routes.project(id)),
      goChess: (id) => router.push(routes.chess(id)),
      goMortgage: () => router.push(routes.mortgage()),
      goOnline: () => router.push(routes.online()),
      goNews: (id) => router.push(routes.news(id)),
      openApt: (cell) => {
        const projId = cell.id.split('-')[0];
        setState((s) => ({ ...s, mort: { price: cell.price, down: 30, term: 20, rate: 16 } }));
        router.push(routes.apartment(projId, cell.id));
      },
      setMort: (k, v) => setState((s) => ({ ...s, mort: { ...s.mort, [k]: v } })),
      setMg: (k, v) => setState((s) => ({ ...s, mg: { ...s.mg, [k]: v } })),
      resetHomeFilters: () => set({ hsearch: '', hcls: 'all', hrooms: 'all', hprice: 1500 }),
      setChessView: (v) => set({ chessView: v }),
      setLang: (l) => set({ lang: l }),
      heroGo: (d) => setState((s) => ({ ...s, heroIndex: (s.heroIndex + d + HERO_COUNT) % HERO_COUNT })),
      heroSet: (i) => set({ heroIndex: i }),
      showToast: (msg) => {
        set({ toast: msg });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => set({ toast: null }), 2600);
      },
      toggleFav: (id) =>
        setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),
    }),
    [set, router]
  );

  return <Ctx.Provider value={{ state, actions }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
