---
title: The first pad
title_tr: İlk tuş
skills: [game.canvas]
---

# --goal--

The four pads share the board below a 40 pixel strip for the text. Each pad is a square filling a quarter,
6 pixels in from every side. We draw the first one, the green pad, in its dim color.

# --goal-tr--

Dört tuş tahtayı paylaşacak: sol üst, sağ üst, sol alt, sağ alt. En üstte yazılar (tur, mesaj) için **40 piksellik bir
şerit** boş kalacak.

Her tuş bir **çeyreğin** içine oturan bir kare. Kenarlardan 6 piksel içeride başlar ki tuşların arasında ince bir boşluk
kalsın. Bu adımda ilk tuşu, **yeşili**, sönük (koyu) rengiyle çiziyoruz.

# --code--

```js
const TOP = 40 // room for the score
const HALF = canvas.width / 2

ctx.fillStyle = '#14532d'
ctx.fillRect(6, TOP + 6, HALF - 12, HALF - 12)
```

# --meaning--

- `TOP` is the height of the text strip; `HALF` is half the board's width, 200: the size of a quarter.
- The square starts 6 pixels in from the quarter's corner (`6`, `TOP + 6`) and is `HALF - 12` wide and tall, leaving
  6 pixels on every side.

# --meaning-tr--

- `const TOP = 40` → üstteki yazı şeridinin boyu. Sonundaki `//` bir yorum.
- `const HALF = canvas.width / 2` → `/` bölme: 400 / 2 = **200**. Tahtanın yarısı, yani bir çeyreğin eni.
- `ctx.fillStyle = '#14532d'` → koyu yeşil: yeşil tuşun **sönük** hâli.
- `ctx.fillRect(6, TOP + 6, HALF - 12, HALF - 12)` →
  - `6` → soldan 6 piksel içeride,
  - `TOP + 6` → şeridin 6 piksel altında (46),
  - `HALF - 12` → en ve boy: 200 − 12 = 188. Her iki yandan 6 piksel pay kalır.

# --task--

1. Under `const ctx = ...`, leave an empty line and write `TOP` and `HALF`.
2. At the very end, leave an empty line and write the two green lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp `TOP` ve `HALF` satırlarını yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra iki yeşil satırı yaz.
3. **Çalıştır**: sol üstte koyu yeşil bir kare görmelisin.

# --hint--

The pad lines must come after the background, otherwise the background covers them.

# --hint-tr--

Tuş satırları arka plan satırlarının **altında** olmalı; yoksa arka plan tuşu örter.

# --tests--

`TOP` should be 40 and `HALF` 200.
tr: `TOP` 40, `HALF` 200 olmalı.

```js
assert.deepEqual([TOP, HALF], [40, 200])
```

The green pad should fill the top-left quarter, 6 pixels in.
tr: Yeşil tuş sol üst çeyreği 6 piksel içeriden doldurmalı.

```js
assert.deepEqual($.rects('#14532d'), [{ x: 6, y: 46, w: 188, h: 188, color: '#14532d' }])
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

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#14532d'
ctx.fillRect(6, TOP + 6, HALF - 12, HALF - 12)
```
