---
title: A board made of rows
title_tr: Satırlardan bir tahta
skills: [game.canvas]
---

# --explanation--

The whole game is a stack of horizontal **rows**, each one tile high. The frog starts on the grass at the bottom and
has to reach the far bank at the top:

```
row 0        far bank (the homes come later)
rows 1-5     river
row 6        safe strip
rows 7-11    road
row 12       start
```

So instead of drawing a picture, the board is drawn by **looping over the rows** and asking a small function which
color each row is. Keeping "what kind of row is this?" in one function means the rest of the game can ask the same
question later.

The frog lives in **tile coordinates**: `{ x: 5, y: 12 }` means column 5, row 12. Only `draw()` turns tiles into
pixels (`x * TILE`), and a band of `TOP` pixels at the top is kept free for the score. Working in tiles keeps the game
logic simple: one hop is always exactly 1.

# --explanation-tr--

Bütün oyun, her biri bir döşeme yüksekliğinde yatay **satırların** yığınıdır. Kurbağa alttaki çimenlerde başlar ve
tepedeki karşı kıyıya ulaşmak zorundadır:

```
satır 0        karşı kıyı (evler sonra geliyor)
satır 1-5      nehir
satır 6        güvenli şerit
satır 7-11     yol
satır 12       başlangıç
```

Bu yüzden tahta bir resim çizmek yerine **satırlar üzerinde dönerek** ve küçük bir fonksiyona her satırın rengini
sorarak çizilir. "Bu ne tür bir satır?" sorusunu tek bir fonksiyonda tutmak, oyunun geri kalanının da aynı soruyu sonra
sorabilmesini sağlar.

Kurbağa **döşeme koordinatlarında** yaşar: `{ x: 5, y: 12 }` sütun 5, satır 12 demektir. Döşemeleri piksele yalnızca
`draw()` çevirir (`x * TILE`) ve tepede skor için `TOP` piksellik bir şerit boş bırakılır. Döşemelerle çalışmak oyun
mantığını basit tutar: bir zıplama her zaman tam olarak 1'dir.

# --task--

1. Add `TILE = 40`, `COLS = 12`, `TOP = 40` and `START_ROW = 12`, and `let frog = { x: 5, y: START_ROW }`.
2. Write `rowColor(row)`: `'#166534'` for row 0, `'#1e3a8a'` for the river (1-5), `'#4d7c0f'` for row 6 and the start
   row, and `'#1f2937'` for the road.
3. Write `draw()`: fill the canvas with `'#0f172a'`, then fill every row from 0 to `START_ROW` with its color
   (`TOP + row * TILE` from the top). Draw the frog as a `'#22c55e'` square, 6 pixels smaller than its tile on each side.
4. Draw every frame with a `requestAnimationFrame` loop.

# --task-tr--

1. `TILE = 40`, `COLS = 12`, `TOP = 40` ve `START_ROW = 12` ile `let frog = { x: 5, y: START_ROW }` ekle.
2. `rowColor(row)` yaz: satır 0 için `'#166534'`, nehir (1-5) için `'#1e3a8a'`, satır 6 ve başlangıç satırı için
   `'#4d7c0f'`, yol için `'#1f2937'`.
3. `draw()` yaz: canvas'ı `'#0f172a'` ile doldur, sonra 0'dan `START_ROW`'a kadar her satırı kendi rengiyle doldur
   (tepeden `TOP + row * TILE`). Kurbağayı her yandan döşemesinden 6 piksel küçük bir `'#22c55e'` kare olarak çiz.
4. Her kareyi bir `requestAnimationFrame` döngüsüyle çiz.

# --tests--

Each row should have the color of its kind.
tr: Her satır kendi türünün renginde olmalı.

```js
assert.strictEqual(rowColor(0), '#166534')
assert.strictEqual(rowColor(3), '#1e3a8a')
assert.strictEqual(rowColor(6), '#4d7c0f')
assert.strictEqual(rowColor(9), '#1f2937')
assert.strictEqual(rowColor(12), '#4d7c0f')
```

The board should be drawn as 13 full-width rows under the top band.
tr: Tahta, tepe şeridinin altında tam genişlikte 13 satır olarak çizilmeli.

```js
$.tick(1)
const rows = $.rects().filter((r) => r.w === 480 && r.h === 40)
assert.lengthOf(rows, 13)
assert.deepEqual(rows.map((r) => r.y), [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520])
assert.lengthOf($.rects('#1e3a8a'), 5, 'five river rows')
assert.lengthOf($.rects('#1f2937'), 5, 'five road rows')
```

The frog should be drawn on the start row.
tr: Kurbağa başlangıç satırında çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#22c55e'), [{ x: 206, y: 526, w: 28, h: 28, color: '#22c55e' }])
```

The board should be redrawn every frame.
tr: Tahta her karede yeniden çizilmeli.

```js
$.tick(1)
frog = { x: 0, y: 6 }
$.tick(1)
assert.deepEqual($.rects('#22c55e'), [{ x: 6, y: 286, w: 28, h: 28, color: '#22c55e' }])
```

# --seed--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Road and river crossing, step by step.
// The page already has <canvas id="game" width="480" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const TOP = 40 // room for the score and the lives
const START_ROW = 12
// Rows from the top: 0 the far bank with the homes, 1-5 the river, 6 a safe strip, 7-11 the road, 12 the start.

let frog = { x: 5, y: START_ROW }

function rowColor(row) {
  if (row === 0) return '#166534'
  if (row <= 5) return '#1e3a8a'
  if (row === 6 || row === START_ROW) return '#4d7c0f'
  return '#1f2937'
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row <= START_ROW; row++) {
    ctx.fillStyle = rowColor(row)
    ctx.fillRect(0, TOP + row * TILE, canvas.width, TILE)
  }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
