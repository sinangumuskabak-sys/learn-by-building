---
title: Draw the grid
title_tr: Izgarayı çiz
skills: [game.canvas, prog.loops]
---

# --explanation--

The board is 300×300 pixels: three columns and three rows of 100 pixel cells. The grid is only four lines: two
vertical, two horizontal, each sitting on a cell border at `100` and `200`.

A thin rectangle is the easiest line to draw. To center a 4 pixel line on `x = 100`, start it 2 pixels earlier:

```js
ctx.fillRect(100 - 2, 0, 4, canvas.height)   // vertical line at x = 100
```

Both vertical lines follow the same pattern, `i * CELL` for `i = 1` and `i = 2`, and so do the horizontal ones. That
repetition is a hint to use a loop instead of copy-pasting four nearly identical lines.

# --explanation-tr--

Tahta 300×300 piksel: 100 piksellik hücrelerden üç sütun ve üç satır. Izgara yalnızca dört çizgiden oluşur: iki dikey,
iki yatay; her biri `100` ve `200`'deki bir hücre sınırında durur.

İnce bir dikdörtgen çizilmesi en kolay çizgidir. 4 piksellik bir çizgiyi `x = 100`'e ortalamak için onu 2 piksel önce
başlat:

```js
ctx.fillRect(100 - 2, 0, 4, canvas.height)   // x = 100'deki dikey çizgi
```

İki dikey çizgi de aynı kalıbı izler: `i = 1` ve `i = 2` için `i * CELL`; yatay olanlar da öyle. Bu tekrar, birbirine
çok benzeyen dört satırı kopyalamak yerine bir döngü kullanmanın ipucudur.

# --task--

1. Store the canvas in `canvas`, its 2D context in `ctx`, and add `const CELL = 100`.
2. Fill the whole canvas with `'#1e1e2e'`.
3. In `'#585b70'`, draw the four grid lines, 4 pixels thick and centered on `CELL` and `2 * CELL`: for `i` from 1 to
   2, a vertical rectangle `(i * CELL - 2, 0, 4, canvas.height)` and a horizontal one
   `(0, i * CELL - 2, canvas.width, 4)`.

# --task-tr--

1. Canvas'ı `canvas`'ta, 2D bağlamını `ctx`'te tut ve `const CELL = 100` ekle.
2. Canvas'ın tamamını `'#1e1e2e'` ile doldur.
3. `'#585b70'` ile, 4 piksel kalınlığında ve `CELL` ile `2 * CELL`'e ortalanmış dört ızgara çizgisini çiz: `i` 1'den
   2'ye kadar, dikey bir `(i * CELL - 2, 0, 4, canvas.height)` ve yatay bir `(0, i * CELL - 2, canvas.width, 4)`
   dikdörtgeni.

# --tests--

The board background should fill the 300×300 canvas.
tr: Tahta arka planı 300×300 canvas'ı doldurmalı.

```js
assert.strictEqual(CELL, 100)
assert.isTrue($.rects('#1e1e2e').some((r) => r.x === 0 && r.y === 0 && r.w === 300 && r.h === 300))
```

There should be four grid lines on the cell borders.
tr: Hücre sınırlarında dört ızgara çizgisi olmalı.

```js
assert.sameDeepMembers($.rects('#585b70'), [
  { x: 98, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 198, y: 0, w: 4, h: 300, color: '#585b70' },
  { x: 0, y: 98, w: 300, h: 4, color: '#585b70' },
  { x: 0, y: 198, w: 300, h: 4, color: '#585b70' },
])
```

# --seed--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

ctx.fillStyle = '#1e1e2e'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#585b70'
for (let i = 1; i < 3; i++) {
  ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
  ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
}
```
