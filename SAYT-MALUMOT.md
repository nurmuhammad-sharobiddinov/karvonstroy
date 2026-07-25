# KARVON STROY — Sayt haqida to'liq ma'lumot (handoff)

> Bu hujjat KARVON STROY veb-saytini boshqa bir Claude (yoki dasturchi) uchun
> to'liq tushuntiradi. O'zicha yetarli — kod bazasini ko'rmasdan ham loyihani
> tushunish, davom ettirish yoki o'zgartirish mumkin.

---

## 1. Loyiha nima?

**KARVON STROY** — O'zbekiston (Qarshi/Toshkent) uchun **turar-joy majmualari
sotuvchi kompaniya sayti**. Bu oddiy vizitka emas — to'laqonli **bir sahifali
ilova (SPA)**: mijoz loyihalar katalogini ko'radi, interaktiv **shaxmatka**
(apartment availability grid) orqali blok → pod'yezd → aniq kvartirani tanlaydi,
ipotekani hisoblaydi, onlayn ariza qoldiradi va yangiliklarni o'qiydi.

Shior: **"Biz uy emas — hayot uchun makon quramiz."**
Asosiy brend rangi: **ko'k `#0060FE`**.

### Kelib chiqishi
Asli Claude tomonidan yaratilgan **dizayn "bundle"** (`D:\LUMERA\KARVON-STROY.html`
— base64 assetlar + HTML template + DC "Design Component" runtime bir faylga
paketlangan) edi. Shu bundle **ochib**, uning ma'lumot modeli va butun mantig'i
(`component.js`) hamda markupi (`template.html`) `INFO/` ga chiqarilib, **Next.js
loyihasiga qayta qurildi** (aynan bir xil xatti-harakat bilan).

---

## 2. Joylashuv va ishga tushirish

- **Loyiha papkasi:** `D:\KARVON-STROY`
- **Asl bundle reference:** `D:\KARVON-STROY\INFO\` (template.html, component.js, assets, uuid-map.json)
- **Yangi renderlar manbasi:** `D:\KARVON-STROY\INFO-BAZA\` (Gemini rasmlari)

Ishga tushirish:
```bash
cd D:\KARVON-STROY
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # production server
```

> MUHIM: `npm run dev` ishlab turганда `npm run build` ni ishga tushirmang —
> ikkovi bir `.next` papkasini ishlatib, uni buzadi (CSS/JS 404 bo'ladi).

---

## 3. Texnologiyalar (stack)

| Qatlam | Texnologiya |
|---|---|
| Framework | **Next.js 14** (App Router) |
| Til | **TypeScript** |
| Shriftlar | **next/font** — Golos Text (matn), Manrope (sarlavhalar) |
| Holat (state) | **React Context + useState** (`store/AppContext.tsx`) |
| Xarita | **Yandex Maps** (kalitsiz map-widget iframe) |
| Rasmlar | `next/image` (WebP/AVIF optimizatsiya) |

Qo'shimcha og'ir kutubxona **yo'q** (Tailwind, Zustand, framer-motion ishlatilmagan)
— barcha uslub inline style + `globals.css` tokenlari orqali. Bundle ~118 kB
first load.

---

## 4. Fayl tuzilishi

```
D:\KARVON-STROY\
  app/
    layout.tsx        shriftlar (Golos+Manrope), SEO metadata, <html lang="uz">
    page.tsx          <AppProvider><App/></AppProvider>
    globals.css       dizayn tokenlari (CSS vars), base, mk-fade animatsiya
    icon.svg          favicon (ko'k "K")
  store/
    AppContext.tsx    BUTUN holat + action'lar (go, openApt, filtrlar, hero…)
  lib/
    data.ts           PROJECTS, BANKS, REVIEWS, NEWS, ICONS, feature ro'yxatlari, HERO_SLIDES, PROJECT_IMG
    chess.ts          genFloors (shaxmatka), blockFree, projTotalFree, mortMonthly, cellPassesFilter, STATUS
  components/
    App.tsx           ekran-router (state.screen bo'yicha 8 ekran)
    Header.tsx        sticky header + til (UZ/RU) + mobil hamburger
    Footer.tsx        4 ustunli footer
    Toast.tsx         pastki markazdagi bildirishnoma
    Icon.tsx          feature SVG ikonalari (ICONS path'laridan)
    MapEmbed.tsx      Yandex interaktiv xarita + manzil chipi
    screens/
      Home.tsx        hero karusel, qidiruv/filtr bilan loyihalar, kompaniya, yangiliklar, kontakt+xarita
      Catalog.tsx     filtrli loyihalar katalogi
      Project.tsx     loyiha detali (hero, spec, 3 feature bo'lim, joylashuv, qurilish, sticky CTA, sharhlar, kontakt)
      Chess.tsx       BLOK → POD'YEZD → SHAXMATKA (grid/list + filtr panel)
      Apartment.tsx   kvartira detali (plan, qavatdagi o'rni, ipoteka kalkulyatori, o'xshash kvartiralar)
      Mortgage.tsx    hamkor banklar + kalkulyator + ariza formasi
      Online.tsx      "4 bosqichda onlayn xarid" + afzalliklar + sharhlar
      NewsDetail.tsx  yangilik detali + boshqa yangiliklar
  public/img/
    logo.svg          KARVON STROY logotipi
    slide-1..4.png    hero karusel slaydlari (HELLO QARSHI, RIVENDELL, BAXT SARI renderlar)
    proj-oqdaryo.png / proj-yangihayot.png / proj-chorbog.png   har loyiha uchun render
  INFO/               asl bundle'dan chiqarilgan reference (template.html, component.js, assets/)
```

---

## 5. Ma'lumot modeli (`lib/data.ts`)

### Loyihalar (PROJECTS) — 3 ta
| id | Nomi | Klass | Tuman | Qavat | Bloklar | Pod'yezd | Narx (mln/dan) | Holat | ppm2 | seed |
|---|---|---|---|---|---|---|---|---|---|---|
| oqdaryo | Oq Daryo | Komfort+ | Yunusobod | 9 | A,B,C | 2 | 420 | sotuvda | 11 | 3 |
| yangihayot | Yangi Hayot | Biznes | Mirzo Ulug'bek | 12 | A,B | 3 | 610 | start | 14 | 7 |
| chorbog | Chorbog' Park | Komfort | Chilonzor | 7 | A,B,C | 2 | 360 | topshirilgan | 9 | 5 |

`ppm2` = m² narxi (mln so'm), `seed` = shaxmatka generatori uchun determinatsion urug'.

### Kvartira holatlari (STATUS)
- `bosh` — **Bo'sh** (yashil `--free #17B26A`)
- `band` — **Band** (sariq `--busy #E8901A`)
- `sotilgan` — **Sotilgan** (kulrang `--sold #9AA1AD`, bosib bo'lmaydi)

### Boshqa ma'lumotlar
- **BANKS** (4): Ipoteka Bank, Aloqa Bank, Kapital Bank, Hamkor Bank (stavka/muddat/boshlang'ich bilan)
- **REVIEWS** (3): mijoz sharhlari
- **NEWS** (3): yangiliklar (kategoriya, sana, rasm, matn paragraflari)
- **ONLINE_STEPS** (4): onlayn xarid bosqichlari
- **FEAT_HOVLI / FEAT_HALL / FEAT_COWORK**: loyiha detalidagi imkoniyatlar (SVG ikona + matn)
- **ICONS**: 18 ta SVG path (tree, shield, palette, elevator, sofa, laptop, film…)

---

## 6. Asosiy mantiq (`lib/chess.ts`) — bundle'dan AYNAN

### `genFloors(project, block, entrance)` — shaxmatka generatori
Har qavat uchun **5 ustun** kvartira hosil qiladi (ustma-ust: Studiya, 1x, 2x, 3x, 2x):
- **Maydon:** `area = (ustun===4 ? 56 : {0:34,1:47,2:60,3:85}[rooms]) + (qavat%3) + (ustun===2?2:0)`
- **Narx:** `price = round(area*ppm2 + qavat*4 + blockIndex*3)` (mln so'm)
- **Holat (determinatsion):** `key = (qavat*5 + ustun*3 + seed + blockIndex*2 + entrance) % 12`; agar qavat≤2 bo'lsa `key%4`. `key<3 → sotilgan`, `key<5 → band`, aks holda `bosh`.
- **Yo'nalish:** Janub / Sharq / G'arb / Shimol / Janubi-sharq.

Ya'ni har bir kvartiraning narxi, maydoni va holati **formula bilan** hosil bo'ladi
(baza kerak emas). `blockFree`, `projTotalFree` bo'sh kvartiralarni sanaydi.

### `mortMonthly(mort)` — ipoteka oylik to'lovi
Annuitet formulasi, **yillik 16% stavka**:
`P = narx*(1−boshlang'ich/100)*1e6; r = 0.16/12; n = muddat*12; oylik = P*r/(1−(1+r)^−n)`.

### `cellPassesFilter(cell, filters)`
Xona soni / maydon (≤) / narx (≤) / qavat (≥) bo'yicha filtrlaydi.

---

## 7. Ekranlar (8 ta) — `state.screen` orqali router

Holat mashinasi bitta client komponent (`App.tsx`) `state.screen` qiymatiga qarab
mos ekranni ko'rsatadi. Navigatsiya `store/AppContext.tsx` dagi action'lar orqali.

1. **home** — Hero karusel (4 render, 5s avtoijro, o'q/nuqta) → qidiruv+filtr bilan loyihalar → kompaniya statistikasi (6 yil, 47 loyiha, 560 ming m², 6248 oila) → yangiliklar → kontakt + **Yandex xarita**.
2. **catalog** — klass/holat filtri bilan loyihalar gridi.
3. **project** — loyiha detali: hero galereya (3 rasm), spec-strip, tavsif, **3 feature bo'lim** (Hovli/Holl/Kovorking, har biri rasm + 6 imkoniyat), joylashuv, qurilish, **sticky sidebar CTA** (narx, "Kvartira tanlash", ipoteka), egalar fikri, kontakt+xarita.
4. **chess** — 3 bosqichli: **A** blok tanlash (genplan, bo'sh soni), **B** pod'yezd tanlash (fasad + yorug' oynalar), **C** shaxmatka (grid yoki list ko'rinish + filtr panel: xona/maydon/narx/qavat). Rangli yacheykalar bosilganda kvartira ochiladi.
5. **apartment** — kvartira detali: planirovka sxemasi (SVG), qavatdagi o'rni (mini-shaxmatka, tanlangan ko'k), narx/maydon/yo'nalish, **ipoteka kalkulyatori** (boshlang'ich/muddat slayder), Online sotib olish / Bron / Qo'ng'iroq tugmalari, o'xshash kvartiralar.
6. **mortgage** — hamkor banklar ro'yxati, ariza formasi, sticky **kalkulyator** (narx/boshlang'ich/muddat → oylik to'lov).
7. **online** — "4 bosqichda kvartirani onlayn sotib oling", afzalliklar, mijoz sharhlari.
8. **news** — yangilik detali (cover rasm, matn) + boshqa yangiliklar.

Barcha forma/tugma yuborilganda pastki **Toast** bildirishnoma chiqadi (stub —
real backend ulanmagan).

---

## 8. Dizayn tizimi (`app/globals.css`)

CSS o'zgaruvchilari (tokenlar):
```
--blue:#0060FE  --blue-600:#0050D6  --blue-050:#EAF1FF  --blue-100:#D6E4FF
--ink:#0F1826   --slate:#5A6577     --mute:#8B93A3      --line:#E6EAF1
--bg:#FFFFFF    --soft:#F4F6FA
--free:#17B26A / --free-bg:#E7F8F0   (bo'sh)
--busy:#E8901A / --busy-bg:#FDF3E3   (band)
--sold:#9AA1AD / --sold-bg:#F0F2F6   (sotilgan)
--shadow, --shadow-sm
```
Shriftlar: **Golos Text** (body, 400–700), **Manrope** (h1–h4, 400–800) — ikkalasi
Google Fonts, next/font orqali. Til: o'zbek (lotin). Header'da UZ/RU tugmasi bor.

---

## 9. Rasmlar va media

- **Hero karusel** (`HERO_SLIDES`): `slide-1..4.png` — HELLO QARSHI (2 render),
  RIVENDELL GARDENS, BAXT SARI promo renderlari (INFO-BAZA'dan).
- **Loyiha rasmlari** (`PROJECT_IMG`): har loyiha o'z toza binosi renderi bilan —
  `proj-oqdaryo.png` (beige majmua), `proj-yangihayot.png` (g'ishtli plaza),
  `proj-chorbog.png` (The Kitchen pavilyoni). Kartalar + katalog + loyiha hero'sida.
- **Yangiliklar** (`NEWS`): slide renderlaridan.
- **Kvartira plani**: rasm emas, `Apartment.tsx` ichida chizilgan **SVG sxema**.
- Barcha rasm `next/image` orqali WebP/AVIF ga optimallashadi.

O'z rasmingizni qo'yish: `public/img/` ga fayl tashlab, `lib/data.ts` dagi
`PROJECT_IMG` / `NEWS` / `HERO_SLIDES` yo'llarini almashtiring — komponentlarni
o'zgartirish shart emas.

---

## 10. Xarita (`components/MapEmbed.tsx`)

- **Yandex Maps** map-widget iframe (kalitsiz, embeddable — X-Frame-Options yo'q).
- **Sotuv ofisi manzili:** *VQ6M+FVH, O'zbekiston ko'chasi, Qarshi, Qashqadaryo*.
  Plus code `8JC7VQ6M+FVH` → koordinata **38.861187, 65.784688**.
- Xaritada Yandex markeri + ustida pin ikonali manzil chipi + "Kattaroq xarita ↗" havolasi.
- Bosh sahifa va Loyiha kontakt bo'limlarida ishlatiladi. Footer manzili ham shu.

> Eslatma: Google Maps embed sinab ko'rildi, lekin u `X-Frame-Options: SAMEORIGIN`
> qo'yib localhost/boshqa domenда iframe'да bloklanadi — shuning uchun Yandex tanlandi.

---

## 11. Holat boshqaruvi (`store/AppContext.tsx`)

`State` obyekti (asl DC `this.state` ni aynan aks ettiradi):
`screen, lang, heroIndex, projectId, chessStep(A/B/C), blockId, entrance, apt,
aptBlock, chessView(grid/list), flt(rooms/area/price/floor), mort, mg, catCls,
catStatus, hsearch, hcls, hrooms, hprice, toast, newsId`.

Asosiy action'lar: `go(screen)`, `openProject(id)`, `startChess()`,
`openChessFor(id)`, `selBlock(b)`, `selEntrance(e)`, `openApt(cell)`,
`toggleRoom(r)`, `setFilter`, `setMort`, `setMg`, `heroGo/heroSet`,
`openNews(id)`, `showToast(msg)`. Ekran o'zgarganда sahifa yuqoriga scroll bo'ladi.

---

## 12. Hozirgi holat va kelajak (production TODO)

**Ishlaydi:** butun UI, shaxmatka, kalkulyatorlar, filtrlar, karusel, Yandex xarita,
til tugmasi, responsive (mobil hamburger). Build green.

**Stub (real backend kerak):**
- Barcha forma/tugma faqat Toast ko'rsatadi — API ulanmagan (ariza, bron, bank ariza, newsletter).
- Ma'lumotlar `lib/data.ts` da statik — CMS/API ga ulash mumkin.
- Til (RU) faqat header nav yorliqlarida — to'liq i18n emas.
- Kvartira narx/holati formula bilan (real inventar bazasi emas).

**Takomillashtirish g'oyalari:** real kvartira bazasi/API, to'lov integratsiyasi,
haqiqiy planirovka rasmlari, ko'p tilli to'liq i18n, admin panel.

---

_Oxirgi yangilanish: 2026-07-12. Loyiha: `D:\KARVON-STROY`._
