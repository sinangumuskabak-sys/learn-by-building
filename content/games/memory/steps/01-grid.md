---
title: Lay out the cards
title_tr: Kartları diz
skills: [game.canvas, prog.loops]
---

# --explanation--

The board is a 4×4 grid of cards with a gap between them and around the edges. One pair of nested loops draws the whole
grid: the outer loop goes down the rows, the inner loop across the columns.

Each card's position comes from a formula, so there are no magic numbers scattered around:

```
x = GAP + col * (CARD + GAP)
y = TOP + GAP + row * (CARD + GAP)
```

The numbers are chosen to fit exactly: four 85 px cards and five 12 px gaps make `4 × 85 + 5 × 12 = 400` pixels, the
canvas width. The canvas is 40 px taller than it is wide (`TOP`), which leaves a strip at the top for the move counter
later.

Face-down cards all look the same: a plain colored square. That is the whole point of the game.

# --explanation-tr--

Tahta, aralarında ve kenarlarında boşluk olan 4×4'lük bir kart ızgarası. Tek bir iç içe döngü çifti tüm ızgarayı
çizer: dış döngü satırlarda aşağı, iç döngü sütunlarda sağa gider.

Her kartın konumu bir formülden gelir; böylece ortalığa saçılmış sihirli sayılar olmaz:

```
x = GAP + col * (CARD + GAP)
y = TOP + GAP + row * (CARD + GAP)
```

Sayılar tam sığacak şekilde seçildi: 85 px'lik dört kart ve 12 px'lik beş boşluk `4 × 85 + 5 × 12 = 400` piksel eder,
yani canvas genişliği. Canvas, genişliğinden 40 px daha uzun (`TOP`); üstte daha sonra hamle sayacı için bir şerit
kalır.

Kapalı kartların hepsi aynı görünür: düz renkli bir kare. Oyunun bütün amacı da bu.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add constants `SIZE = 4`, `CARD = 85`, `GAP = 12` and
   `TOP = 40`.
2. Fill the canvas with `'#1e1b4b'`.
3. With two nested loops (`row` and `col` from `0` to `SIZE - 1`), draw a `'#6366f1'` `CARD` × `CARD` square at
   `x = GAP + col * (CARD + GAP)`, `y = TOP + GAP + row * (CARD + GAP)`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut; `SIZE = 4`, `CARD = 85`, `GAP = 12` ve `TOP = 40` sabitlerini ekle.
2. Canvas'ı `'#1e1b4b'` ile doldur.
3. İki iç içe döngüyle (`row` ve `col`, `0`'dan `SIZE - 1`'e) `x = GAP + col * (CARD + GAP)`,
   `y = TOP + GAP + row * (CARD + GAP)` noktasına `'#6366f1'` renkli `CARD` × `CARD` bir kare çiz.

# --tests--

The background should fill the 400×440 canvas.
tr: Arka plan 400×440 canvas'ı doldurmalı.

```js
assert.deepEqual([SIZE, CARD, GAP, TOP], [4, 85, 12, 40])
assert.isTrue($.rects('#1e1b4b').some((r) => r.x === 0 && r.y === 0 && r.w === 400 && r.h === 440))
```

There should be 16 face-down cards in a 4×4 grid.
tr: 4×4 ızgarada 16 kapalı kart olmalı.

```js
const cards = $.rects('#6366f1')
assert.lengthOf(cards, 16)
assert.isTrue(cards.every((c) => c.w === 85 && c.h === 85))
const xs = [...new Set(cards.map((c) => c.x))].sort((a, b) => a - b)
const ys = [...new Set(cards.map((c) => c.y))].sort((a, b) => a - b)
assert.deepEqual(xs, [12, 109, 206, 303])
assert.deepEqual(ys, [52, 149, 246, 343])
```

# --seed--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
```

# --solution--

```js
// Memory, step by step.
// The page already has <canvas id="game" width="400" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 4 // cards per row and per column
const CARD = 85
const GAP = 12
const TOP = 40 // room for the move counter above the cards

ctx.fillStyle = '#1e1b4b'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#6366f1'
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    ctx.fillRect(GAP + col * (CARD + GAP), TOP + GAP + row * (CARD + GAP), CARD, CARD)
  }
}
```
