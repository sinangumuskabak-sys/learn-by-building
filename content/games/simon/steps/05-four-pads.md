---
title: All four pads
title_tr: Dört tuşun hepsi
skills: [prog.arrays, prog.loops]
---

# --goal--

A `forEach` loop draws every pad from the list. Pad `i` is in column `i % 2` and row `Math.floor(i / 2)` of a 2×2 grid,
which gives the corner of its quarter.

# --goal-tr--

Dört tuşu tek tek yazmak yerine listeden çizeceğiz: "listedeki **her tuş** için şunu yap".

Her tuşun yeri numarasından hesaplanır. 2×2'lik bir ızgarada:

```
tuş:  0 1      sütun = i % 2
      2 3      satır = Math.floor(i / 2)
```

# --code--

```js
PADS.forEach((pad, i) => {
  const x = (i % 2) * HALF
  const y = TOP + Math.floor(i / 2) * HALF
  ctx.fillStyle = pad.dim
  ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
})
```

# --meaning--

- `PADS.forEach((pad, i) => { ... })` runs the small function once per pad: `pad` is the object, `i` its number.
- `i % 2` is the remainder after dividing by 2: 0 for the left column, 1 for the right.
- `Math.floor(i / 2)` rounds down: 0 for the top row, 1 for the bottom.
- `x`, `y` are the quarter's corner; the square is drawn 6 pixels in, as before.

# --meaning-tr--

- `PADS.forEach(...)` → "dizinin **her elemanı için** şunu yap". 4 tuş = 4 tur.
- `(pad, i) => { ... }` → her turda çalışan küçük bir **fonksiyon**. `=>` (ok) fonksiyon yazmanın kısa yolu.
  Parantezdeki adlara **parametre** denir: `pad` o tuşun nesnesi, `i` numarası (0, 1, 2, 3).
- `i % 2` → `%` **bölümden kalan**: 3 % 2 = 1. Tuş 1 ve 3 sağ sütunda (1), 0 ve 2 sol sütunda (0).
- `Math.floor(i / 2)` → `Math.floor` **aşağı yuvarlar**: 3 / 2 = 1.5 → 1. Tuş 2 ve 3 alt satırda.
- `const x = (i % 2) * HALF` → sütunu piksele çevirir: 0 ya da 200.
- `const y = TOP + Math.floor(i / 2) * HALF` → şeridin altından başlayarak: 40 ya da 240.
- `ctx.fillStyle = pad.dim` → o tuşun sönük rengi.
- `ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)` → önceki adımdaki kare, ama artık her tuşun kendi çeyreğinde.

# --task--

Replace the two green lines at the end with the `forEach` block. Press **Run**.

# --task-tr--

1. En alttaki iki yeşil satırı (`ctx.fillStyle = '#14532d'` ve `ctx.fillRect(6, ...)`) sil.
2. Yerine `forEach` bloğunu yaz. İçindeki satırlar iki boşluk içeride; sondaki `})`'ye dikkat.
3. **Çalıştır**: dört koyu renkli kare görmelisin: yeşil, kırmızı, sarı, mavi.

# --predict--

Where will pad 2 (yellow) be drawn?
- [ ] Top right
- [x] Bottom left
  2 % 2 is 0 (left column), Math.floor(2 / 2) is 1 (bottom row).
- [ ] Bottom right

# --predict-tr--

2 numaralı tuş (sarı) nereye çizilecek?
- [ ] Sağ üste
- [x] Sol alta
  2 % 2 = 0 (sol sütun), Math.floor(2 / 2) = 1 (alt satır).
- [ ] Sağ alta

# --hint--

Watch the ending `})`: `}` closes the small function, `)` closes `forEach(`.

# --hint-tr--

Sondaki `})`'ye dikkat: `}` küçük fonksiyonu, `)` ise `forEach(` parantezini kapatır.

# --tests--

The four pads should fill the four quarters in their dim colors.
tr: Dört tuş dört çeyreği sönük renkleriyle doldurmalı.

```js
const pads = $.rects().filter((r) => r.w === 188)
assert.deepEqual(pads.map((r) => [r.x, r.y, r.color]), [
  [6, 46, '#14532d'],
  [206, 46, '#7f1d1d'],
  [6, 246, '#713f12'],
  [206, 246, '#1e3a8a'],
])
```

# --solution--

```js
// Simon memory game, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TOP = 40 // room for the score
const HALF = canvas.width / 2
// Each pad: its dim color and its lit color. Pads 0 1 on top, 2 3 below.
const PADS = [
  { dim: '#14532d', lit: '#4ade80' },
  { dim: '#7f1d1d', lit: '#f87171' },
  { dim: '#713f12', lit: '#facc15' },
  { dim: '#1e3a8a', lit: '#60a5fa' },
]

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

PADS.forEach((pad, i) => {
  const x = (i % 2) * HALF
  const y = TOP + Math.floor(i / 2) * HALF
  ctx.fillStyle = pad.dim
  ctx.fillRect(x + 6, y + 6, HALF - 12, HALF - 12)
})
```
