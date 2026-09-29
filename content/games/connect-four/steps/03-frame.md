---
title: The blue board
title_tr: Mavi tahta
skills: [game.canvas]
---

# --goal--

The board has 7 columns and 6 rows of 64-pixel cells, and starts 96 pixels from the top, leaving room above it. We give
these numbers names and paint the blue board.

# --goal-tr--

Tahtada **7 sütun** ve **6 satır** var; her hücre 64 × 64 piksel. Tahta tuvalin tepesinden 96 piksel aşağıda başlıyor;
üstteki boşlukta ileride yazılar ve bırakılmayı bekleyen disk duracak.

Bu sayılara **ad** veriyoruz ve mavi tahtayı boyuyoruz. Sayıları her yere tek tek yazmak yerine ad kullanmak, kodu hem
okunur hem de kolay değiştirilir yapar.

# --code--

```js
const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
```

# --meaning--

- `COLS` and `ROWS` are the size of the board, `CELL` the size of one cell and `TOP` the room above the board.
- The blue rectangle starts at `(0, TOP)` and is `COLS * CELL` = 448 wide and `ROWS * CELL` = 384 high.

# --meaning-tr--

- `COLS = 7` → sütun sayısı, `ROWS = 6` → satır sayısı, `CELL = 64` → bir hücrenin kenarı (piksel).
- `TOP = 96` → tahtanın üstünde bırakılan boşluk. `//`'den sonrası bir **yorum**: bilgisayar okumaz.
- `ctx.fillStyle = '#1d4ed8'` → mavi.
- `ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)` → soldan 0, üstten 96'dan başlayan bir dikdörtgen. `*` çarpma demek:
  eni 7 × 64 = 448, boyu 6 × 64 = 384.
- Mavi, arka plandan **sonra** boyanıyor; sonra boyanan öncekinin üstüne gelir.

# --task--

1. Under the `ctx` line, after an empty line, write the four constants.
2. In `draw`, under the background, leave an empty line and write the two blue lines.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp dört sabiti yaz.
2. `draw` içinde arka planı boyayan `fillRect` satırının altına bir boş satır bırakıp iki mavi satırı yaz.
3. **Çalıştır**: üstte boşluk bırakılmış mavi bir tahta görmelisin.

# --tests--

The sizes of the board should be named.
tr: Tahtanın ölçüleri adlandırılmış olmalı.

```js
assert.deepEqual([COLS, ROWS, CELL, TOP], [7, 6, 64, 96])
```

The blue board should be drawn under the room at the top.
tr: Mavi tahta üstteki boşluğun altında çizilmeli.

```js
assert.deepEqual($.rects('#1d4ed8').map((r) => [r.x, r.y, r.w, r.h]), [[0, 96, 448, 384]])
```

# --solution--

```js
// Connect four, step by step.
// The page already has <canvas id="game" width="448" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 7
const ROWS = 6
const CELL = 64
const TOP = 96 // room above the board for the messages and the next disc

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#1d4ed8'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)
}

draw()
```
