# SPEC.md — KARVON STROY: tuzatish va shaxmatkani BI darajasiga chiqarish

**Loyiha:** `D:\KARVON-STROY` (Next.js 14 App Router + TypeScript)
**Maqsad:** (1) tasdiqlangan mantiqiy xatolarni tuzatish, (2) shaxmatkani BI Group / NRG-BI darajasidagi UX ga chiqarish, (3) URL routing + SEO qo'shish.

---

## 0. QOIDALAR — buzma

- **Avval o'qi, keyin yoz.** Har faylni o'zgartirishdan oldin joriy kodini o'qi. Ko'r-ko'rona qayta yozma.
- **Yangi og'ir kutubxona QO'SHMA.** Tailwind, framer-motion, Zustand, styled-components — YO'Q. Faqat: React + inline style + `app/globals.css` tokenlari + styled-jsx (allaqachon ishlatilyapti).
- **Dizayn tokenlarini o'zgartirma:** `--blue #0060FE`, `--free #17B26A`, `--busy #E8901A`, `--sold #9AA1AD`. Yangi rang kerak bo'lsa — `globals.css` ga CSS var sifatida qo'sh, inline hex yozma.
- **Shriftlar:** Manrope (sarlavha), Golos Text (matn) — o'zgartirma.
- **Til:** butun UI o'zbek (lotin). Yangi matnlar ham o'zbekcha.
- **`genFloors()` formulasini o'zgartirma** — narx/maydon/status formulasi bir xil qolsin, aks holda barcha mavjud narxlar o'zgarib ketadi. Faqat *hisoblash* funksiyalarini tuzat.
- **Har bosqichdan keyin `npm run build` yashil bo'lishi shart.** `npm run dev` ishlab turganda `build` ishga tushirma.
- **Bosqichma-bosqich ishla.** FAZA 1 tugagach to'xta va natijani ko'rsat. Tasdiqsiz FAZA 2 ga o'tma.

---

## FAZA 1 — KRITIK MANTIQIY XATOLAR (birinchi navbatda)

### 1.1 `blockFree()` entrance'ni e'tiborsiz qoldiryapti — YOLG'ON SON

**Fayl:** `lib/chess.ts`

**Muammo:** `blockFree(p, block)` faqat `genFloors(p, block, 1)` ni chaqiradi. Lekin `genFloors` da status formulasi `entrance` ga bog'liq:
```
key = (f*5 + c*3 + seed + bIdx*2 + entrance) % 12
```
Ya'ni har pod'yezdning shaxmatkasi **boshqacha**. Blokda `p.entrances` ta pod'yezd bor, lekin `blockFree` faqat bittasini sanaydi.

**Tasdiqlangan zarar:**
| Loyiha | Step A da ko'rsatiladi | Haqiqiy | Xato |
|---|---|---|---|
| Oq Daryo | 61 | 122 | 50% kam |
| Yangi Hayot | 57 | 173 | 67% kam |
| Chorbog' Park | 44 | 87 | 49% kam |

**Tuzatish:**
```ts
// blockFree — endi BARCHA pod'yezdlarni sanaydi
export function blockFree(p: Project, block: string): number {
  let total = 0;
  for (let e = 1; e <= (p.entrances || 1); e++) {
    total += genFloors(p, block, e)
      .reduce((s, r) => s + r.cells.filter((c) => c.status === 'bosh').length, 0);
  }
  return total;
}

// YANGI: bitta pod'yezddagi bo'sh kvartiralar
export function entranceFree(p: Project, block: string, entrance: number): number {
  return genFloors(p, block, entrance)
    .reduce((s, r) => s + r.cells.filter((c) => c.status === 'bosh').length, 0);
}
```
`projTotalFree` o'zgarishsiz qoladi — u yangi `blockFree` ni chaqiradi va avtomatik to'g'rilanadi.

**Performance:** `genFloors` har chaqiruvda qaytadan hisoblaydi. `blockFree`/`entranceFree` natijalarini oddiy `Map` cache ga sol (key: `${p.id}-${block}-${entrance}`), chunki determinatsion — natija hech qachon o'zgarmaydi.

---

### 1.2 Step B pod'yezd hisoblagichi — SOXTA MA'LUMOT

**Fayl:** `components/screens/Chess.tsx`, `entrances` massivi

**Muammo:**
```ts
free: Math.round(blockFree(p, state.blockId || 'A') / p.entrances)
```
Bu shunchaki bo'lish. Natijada Yangi Hayot A blokda uchala pod'yezd ham "**10 bo'sh**" deydi. Haqiqiy sonlar: **29, 30, 28**.

**Tuzatish:** yangi `entranceFree(p, block, e)` funksiyasini chaqir:
```ts
const entrances = Array.from({ length: p.entrances }, (_, i) => {
  const e = i + 1;
  return {
    e,
    label: String(e),
    big: `${e}-pod'yezd`,
    free: entranceFree(p, state.blockId || 'A', e),   // ← haqiqiy son
  };
});
```

---

### 1.3 Filtr slider oraliqlari real ma'lumotga mos emas

**Fayl:** `components/screens/Chess.tsx` (FilterRange chaqiruvlari), `store/AppContext.tsx` (`DEFAULT_FILTERS`)

**Muammo:** oraliqlar qattiq kodlangan va real generatsiya qilingan qiymatlarga mos emas:

| Filtr | Hozirgi slider | Real ma'lumot | Natija |
|---|---|---|---|
| Maydon | 30 – 130 m² | max **87 m²** | sliderning **33%** o'lik zona |
| Narx | 200 – 2000 mln | **321 – 1268** mln | sliderning **36%** o'lik zona |
| Qavat | 1 – p.floors | to'g'ri | OK |

**Tuzatish:** oraliqlarni joriy shaxmatkadan **dinamik** hisobla:
```ts
const bounds = useMemo(() => {
  const all = genFloors(p, state.blockId || 'A', state.entrance).flatMap(r => r.cells);
  return {
    areaMin: Math.min(...all.map(c => c.area)),
    areaMax: Math.max(...all.map(c => c.area)),
    priceMin: Math.min(...all.map(c => c.price)),
    priceMax: Math.max(...all.map(c => c.price)),
    floorMax: p.floors,
  };
}, [p, state.blockId, state.entrance]);
```
Sliderlarni shu `bounds` bilan chegarala. `selEntrance` da filtr reset qilinganda ham `DEFAULT_FILTERS` emas, **shu blok/pod'yezdning bounds'i** bo'yicha reset qil (ya'ni "hamma narsa ko'rinsin" holati).

---

### 1.4 Filtrlar bir tomonlama — diapazon (range) qil

**Fayl:** `lib/chess.ts` (`Filters`, `cellPassesFilter`), `store/AppContext.tsx`, `Chess.tsx`

**Muammo:** hozir faqat `≤ area`, `≤ price`, `≥ floor`. Foydalanuvchi "60–80 m² oralig'ida" deb tanlay olmaydi.

**Tuzatish:**
```ts
export type Filters = {
  rooms: number[];
  areaMin: number; areaMax: number;
  priceMin: number; priceMax: number;
  floorMin: number; floorMax: number;
  statuses: StatusKey[];        // YANGI: ['bosh','band'] default (sotilgan o'chiq)
};

export function cellPassesFilter(c: Cell, f: Filters): boolean {
  if (f.rooms.length && !f.rooms.includes(c.rooms)) return false;
  if (c.area < f.areaMin || c.area > f.areaMax) return false;
  if (c.price < f.priceMin || c.price > f.priceMax) return false;
  if (c.f < f.floorMin || c.f > f.floorMax) return false;
  if (f.statuses.length && !f.statuses.includes(c.status)) return false;
  return true;
}
```
UI'da ikki tomonlama slider (ikkita `<input type="range">` ustma-ust, yoki ikkita alohida min/max slider — kutubxona qo'shmasdan). Tagida: "60 — 87 m²".

---

### 1.5 Ipoteka: 16% qattiq kodlangan, banklar e'tiborsiz

**Fayl:** `lib/chess.ts` (`mortMonthly`), `lib/data.ts` (`BANKS`), `Mortgage.tsx`, `Apartment.tsx`

**Muammo:** `mortMonthly` ichida `const r = 0.16 / 12` — qattiq kodlangan. Lekin `BANKS` da stavkalar **15%, 16%, 17%, 18%**. Foydalanuvchi bank tanlaydi, lekin oylik to'lov **o'zgarmaydi**. Bu ishonchni yo'qotadi.

**Tuzatish:**
```ts
export type Mort = { price: number; down: number; term: number; rate: number }; // rate qo'shildi

export function mortMonthly(m: Mort): number {
  const P = m.price * (1 - m.down / 100) * 1e6;
  const r = (m.rate ?? 16) / 100 / 12;
  const n = m.term * 12;
  return r ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
}
```
- `BANKS` da `rate: '16%'` (string) → `rateNum: 16` (number) maydonini qo'sh (string'ni ko'rsatish uchun qoldir).
- `Mortgage.tsx`: bank kartochkalari **tanlanadigan** bo'lsin (radio kabi) — tanlanganda `mg.rate`, `mg.down` (min boshlang'ich), `mg.term` (max muddat) avtomatik yangilansin. Tanlangan bank ko'k chegara + ✓ belgisi bilan.
- `Apartment.tsx` kalkulyatoriga ham bank tanlash dropdown'i qo'sh (default: eng past stavka).
- Kalkulyator ostidagi "* Yillik 16% stavka bo'yicha" matni **dinamik** bo'lsin: `* {bank.name} — yillik {rate}% stavka bo'yicha taxminiy hisob.`

---

## FAZA 2 — SHAXMATKA UX (BI Group darajasi)

### 2.1 Qavat ustuni sticky bo'lsin (mobil kritik)

**Fayl:** `Chess.tsx`, Step C grid

**Muammo:** `overflowX: auto` + `minWidth: 520` → mobilda gorizontal scroll qilganda **qavat raqami ekrandan chiqib ketadi**. Foydalanuvchi qaysi qavatga qarayotganini bilmaydi.

**Tuzatish:**
- Grid'ni `display: grid; grid-template-columns: 44px repeat(5, minmax(72px, 1fr))` ga o'tkaz (hozirgi flex o'rniga).
- Qavat raqami hujayrasi: `position: sticky; left: 0; z-index: 2; background: var(--bg);` — scrollda joyida qoladi.
- Ustun sarlavhalari (Studiya / 1x / 2x / 3x / 2x) **tepada sticky**: `position: sticky; top: <header balandligi>;`
- O'ng chetda scroll borligini bildiruvchi yengil gradient soya (`::after`, `linear-gradient(90deg, transparent, rgba(255,255,255,.9))`), faqat scroll qilish mumkin bo'lganda.

### 2.2 Filtr paneli — `top: 150` sehrli raqamini olib tashla

**Muammo:** `position: sticky; top: 150` — header balandligi o'zgarsa buziladi.

**Tuzatish:** `globals.css` ga `--header-h: 112px` (utility bar + main bar) qo'sh, `top: calc(var(--header-h) + 16px)` ishlat. Header'da ham shu var'ni ishlat.

### 2.3 Bo'sh natija holati (hozir umuman yo'q)

**Muammo:** filtr hech nima topmasa — grid butunlay xira (opacity .22), list esa bo'sh div. Foydalanuvchi sayt buzilgan deb o'ylaydi.

**Tuzatish:** `filteredCount === 0` bo'lsa, grid/list o'rniga markazda:
- Ikona (SVG, `--mute` rang)
- "Bunday parametrlarga mos kvartira topilmadi"
- "Filtrni bo'shatib ko'ring yoki boshqa pod'yezdni tanlang"
- Ikki tugma: **"Filtrni tozalash"** (ko'k) + **"Boshqa pod'yezd"** (chegarali, Step B ga qaytaradi)

### 2.4 Sotilgan yacheykalar — to'g'ri disabled

**Muammo:** `cellStyle` da `cursor: not-allowed` bor, lekin `<button>` da `disabled` atributi **yo'q**. Natija: Tab bilan fokuslanadi, Enter bosiladi, hech nima bo'lmaydi. Ekran o'quvchi uchun ham chalkash.

**Tuzatish:**
```tsx
<button
  disabled={cell.status === 'sotilgan' || !active}
  aria-label={`${cell.roomsLabel}, ${cell.area} m², ${cell.f}-qavat, ${cell.priceLabel}, ${STATUS[cell.status].label}`}
  ...
/>
```
Filtrga tushmagan yacheykalar: `opacity: .25`, `pointer-events: none`, `disabled` — lekin **YO'QOLMASIN** (BI'da ham shunday: kontekst saqlanadi, foydalanuvchi bino strukturasini ko'radi).

### 2.5 To'liq tooltip (hozir faqat `title`)

**Muammo:** `title={...}` — brauzerning sekin native tooltip'i, narx yo'q.

**Tuzatish:** hover'da chiqadigan custom tooltip (absolute, `--ink` fon, oq matn, radius 10, soya). Ichida:
```
2 xonali · 62 m²
5-qavat · Janubi-sharq
740 mln so'm · 11.9 mln/m²
● Bo'sh
```
Hover'da **shu satr (qavat) va shu ustun yengil yoritilsin** — "krest" effekti (`--blue-050` fon).

### 2.6 Yuqori panel — to'liq hisoblagich

Hozir faqat "Bo'sh: N ta". Qo'sh:
```
Topildi: 24 ta  ·  Bo'sh: 11  ·  Band: 5  ·  Sotilgan: 8
```
Legendaning har elementi **bosiladigan** bo'lsin — statusni filtrdan yoqib/o'chiradi (`flt.statuses`).

### 2.7 Ro'yxat ko'rinishida sortlash

**Muammo:** `list.sort((a,b) => a.price - b.price)` — qattiq kodlangan, o'zgartirib bo'lmaydi.

**Tuzatish:** jadval ko'rinishiga o'tkaz:
`Qavat | Xona | Maydon | Yo'nalish | Narx | m² narxi | Holat | [Ko'rish]`
Ustun sarlavhasiga bosib sortlash (↑↓), `state` ga `listSort: { key, dir }` qo'sh.

### 2.8 Tezkor almashtirish (Step C dan chiqmasdan)

Shaxmatka tepasiga ikkita `<select>` qo'sh: **Blok** va **Pod'yezd**. Step A/B ga qaytmasdan almashtirish. Har o'zgarishda grid qayta hisoblanadi va filtr bounds yangilanadi.

### 2.9 Mobil filtr — bottom sheet

`@media (max-width: 780px)` da filtr paneli `position: static` bo'lib qolyapti — sahifaning yarmini egallaydi. O'rniga:
- Pastda fixed tugma: **"Filtr (2)"** — faol filtrlar soni bilan.
- Bosilganda pastdan chiqadigan sheet (fixed, bottom, radius 20 20 0 0, backdrop).
- Sheet pastida: **"Ko'rsatish (11 ta)"** tugmasi.

---

## FAZA 3 — ARXITEKTURA: URL ROUTING + SEO

> Bu eng katta strukturaviy muammo. Hozir butun sayt bitta `state.screen` ustida ishlaydi.

### 3.1 Muammoning og'irligi

- Brauzerning **"Orqaga"** tugmasi saytdan **butunlay chiqarib yuboradi** (bitta history entry).
- **Refresh** → hamma narsa yo'qoladi, bosh sahifaga qaytadi.
- Kvartira/loyiha havolasini **ulashib bo'lmaydi** — menejer mijozga link yubora olmaydi. Sotuv uchun halokatli.
- **SEO nol**: `app/page.tsx` → `<AppProvider><App/></AppProvider>` — hammasi client. Google bo'sh HTML ko'radi. Ko'chmas mulk saytida bu — organik trafikning yo'qligi.

### 3.2 Yechim: haqiqiy App Router yo'llari

State machine'ni saqlagan holda URL segmentlarini qo'sh:

```
app/
  page.tsx                          → Bosh sahifa (SERVER component)
  loyihalar/page.tsx                → Katalog (server, PROJECTS statik)
  loyiha/[id]/page.tsx              → Loyiha detali (server + generateStaticParams)
  loyiha/[id]/shaxmatka/page.tsx    → Shaxmatka (client, ?blok=A&podyezd=2 query)
  loyiha/[id]/kvartira/[aptId]/page.tsx → Kvartira (server metadata + client kalkulyator)
  ipoteka/page.tsx
  online/page.tsx
  yangiliklar/[id]/page.tsx
  sitemap.ts
  robots.ts
  not-found.tsx
```

**Muhim:**
- Loyiha, katalog, yangilik sahifalari — **Server Component**, `generateStaticParams()` + `generateMetadata()` bilan. Bu SEO ni hal qiladi.
- Shaxmatka va kvartira — interaktiv, `'use client'`, lekin **URL query** bilan holat saqlansin:
  `/loyiha/oqdaryo/shaxmatka?blok=A&podyezd=2&xona=2,3&narx=400-800`
  `useSearchParams()` + `router.replace()` (scroll: false) orqali.
- Kvartira `aptId` = `cell.id` (`oqdaryo-A-5-2`) — bu allaqachon `genFloors` da bor va determinatsion. Ya'ni URL'dan kvartirani **qayta tiklash mumkin**:
  ```ts
  export function cellById(id: string): Cell | null {
    const [projId, block, f, c] = id.split('-');
    const p = PROJECTS.find(x => x.id === projId);
    if (!p) return null;
    // entrance ni topish kerak — id ga entrance ni ham qo'sh: `${p.id}-${block}-${entrance}-${f}-${c}`
  }
  ```
  ⚠️ **Diqqat:** hozirgi `cell.id` da **entrance yo'q** (`${p.id}-${block}-${f}-${c}`). Lekin status entrance'ga bog'liq → bir xil id, boshqa status. Bu **latent bug**. `genFloors` da id ni shunday o'zgartir:
  ```ts
  id: `${p.id}-${block}-${entrance}-${f}-${c}`
  ```
- `AppContext` saqlanadi, lekin `screen` maydonini olib tashla — navigatsiya `useRouter()` orqali. Qolgan holat (filtr, mort, hero) Context'da qoladi.

### 3.3 SEO fayllari

- `app/sitemap.ts` — bosh + katalog + 3 loyiha + 3 yangilik + ipoteka + online.
- `app/robots.ts` — `allow: '/'`, sitemap havolasi.
- Har loyiha sahifasida `generateMetadata()`: title = `{loyiha nomi} — {klass} klass turar-joy majmuasi | KARVON STROY`, description, OG image = `PROJECT_IMG[id]`.
- **JSON-LD** structured data: loyiha sahifasida `Residence` / `RealEstateListing` schema, kompaniya uchun `Organization`. Bu Google'da rich snippet beradi.

---

## FAZA 4 — SIFAT VA TOZALASH

### 4.1 O'lik havolalar (Header)
`Header.tsx` da **"Kommersiya", "Aksiyalar", "Yangiliklar"** — uchalasi ham `catalog` ga ketadi. Foydalanuvchi aldangan his qiladi.
**Tanla:** yo shu sahifalarni yasa, yo menyudan olib tashla. Yarim ishlagan havola — yo'q havoladan yomon.

### 4.2 Mobil menyu to'liq emas
Desktop'da 5 ta havola, mobilda 3 ta. Til almashtirgich mobil menyuda yo'q. Tenglashtir.

### 4.3 i18n — yo yasa, yo olib tashla
Hozir `state.lang` faqat **header'dagi 5 ta so'zni** almashtiradi. Qolgan butun sayt o'zbekcha qoladi. RU ni bosgan mijoz saytni buzilgan deb o'ylaydi.
**Tanla:**
- (A) To'liq i18n: `lib/i18n.ts` da `{ uz: {...}, ru: {...} }` lug'at, `t('key')` helper, barcha matnlarni o'tkaz. ~2-3 soatlik ish.
- (B) RU tugmasini **olib tashla** (hozircha). Halol va tez.

### 4.4 Erishimlilik (a11y)
- Status **faqat rang bilan** ko'rsatilgan → rang ko'rmaydiganlar uchun. Har yacheykaga `aria-label` + kichik belgi (● / ◐ / ✕) qo'sh.
- `<input type="range">` larning `<label>` bilan bog'lanishi yo'q → `id` + `htmlFor` yoki `aria-label`.
- Fokus ko'rinishi: `:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }` — `globals.css` ga qo'sh.
- Shaxmatka klaviatura bilan: `Tab` bilan o'tish, `Enter` bilan ochish (disabled bo'lmaganlarda).

### 4.5 `next.config.mjs` bo'sh
```js
const nextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  compress: true,
  poweredByHeader: false,
};
```

### 4.6 Formalar — hech bo'lmaganda validatsiya
Barcha forma `showToast()` bilan tugaydi, backend yo'q. Bu MVP uchun OK, **lekin**:
- Telefon maydoniga mask/validatsiya qo'sh (`+998 (__) ___-__-__`).
- Bo'sh forma yuborilmasin (`required`).
- Yuborilgandan keyin tugma `disabled` + "Yuborilmoqda..." holati (real API ulanganda tayyor bo'lsin).
- `lib/api.ts` yasab, barcha submit'ni bitta `submitLead(payload)` funksiyasi orqali o'tkaz — hozircha `showToast` qaytaradi, keyin API ulash bir joyda bo'ladi.

---

## BAJARISH TARTIBI VA TO'XTASH NUQTALARI

1. **FAZA 1** (mantiqiy xatolar) → `npm run build` → **TO'XTA**, natijani ko'rsat.
   Tekshiruv: Oq Daryo Step A da **122** ta bo'sh ko'rinishi kerak (61 emas). Yangi Hayot A blok pod'yezdlari: **29 / 30 / 28** (10/10/10 emas).
2. **FAZA 2** (shaxmatka UX) → build → **TO'XTA**, skrinshot ko'rsat.
3. **FAZA 3** (routing + SEO) → build → **TO'XTA**. Bu eng xavfli faza — butun navigatsiya o'zgaradi. Alohida branch'da qil.
4. **FAZA 4** (tozalash) → build → yakuniy hisobot.

**Har fazadan keyin qisqa hisobot ber:** qaysi fayllar o'zgardi, nima tuzatildi, nima qolib ketdi.

---

## TEGMA (do not touch)

- `INFO/` papkasi — asl bundle reference, faqat o'qish uchun.
- `INFO-BAZA/` — rasm manbasi.
- `public/img/*` — rasmlarni almashtirma.
- `genFloors()` ichidagi narx/maydon/status **formulalari** — faqat `id` maydoniga `entrance` qo'shish mumkin.
- Dizayn tokenlari (ranglar, shriftlar) — yangi qo'shish mumkin, mavjudini o'zgartirish mumkin emas.
