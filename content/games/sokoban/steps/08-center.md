---
title: Center the level
title_tr: Bölümü ortala
skills: [game.canvas]
---

# --goal--

The level sits in the top-left corner. We measure it (rows and the longest row), and shift everything by `ox` and `oy`
so it is centered, leaving room at the top and bottom for text.

# --goal-tr--

Bölüm sol üst köşeye sıkışmış. Onu tuvalin **ortasına** alacağız. Yöntem: bölümün enini ve boyunu ölç, tuvalden artan
boşluğu **ikiye böl**; yarısı sola, yarısı sağa.

Üstte (bölüm numarası ve hamle sayacı için) ve altta (ipucu yazısı için) biraz yer de ayıracağız: `TOP` ve `BOTTOM`.

# --code--

```js
const TOP = 48 // room for the level number and the move counter
const BOTTOM = 40 // room for the hint line

  // Center the level on the canvas.
  const rows = LEVELS[level].length
  const cols = Math.max(...LEVELS[level].map((line) => line.length))
  const ox = (canvas.width - cols * TILE) / 2
  const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }
```

# --meaning--

- `rows` is the number of rows; `cols` the length of the longest row. `Math.max(...list)` gives the biggest number.
- `ox` is the left edge: half of the width left over. `oy` is the same for the height, below the `TOP` strip and above
  the `BOTTOM` strip.
- `tile` now starts from `ox` and `oy`.

# --meaning-tr--

- `TOP = 48`, `BOTTOM = 40` → üstte ve altta yazılar için ayrılan şeritler.
- `const rows = LEVELS[level].length` → bölümün **satır sayısı**.
- `LEVELS[level].map((line) => line.length)` → her satırın uzunluğundan yeni bir liste: `[5, 5, 5]`.
- `Math.max(...liste)` → `...` listeyi açıp sayıları tek tek verir; `Math.max` **en büyüğünü** seçer. Satırlar farklı
  uzunlukta olabileceği için en uzunu alırız: `cols`.
- `const ox = (canvas.width - cols * TILE) / 2` → tuvalin eninden bölümün enini çıkar, **ikiye böl**: sol kenar.
  (`/` bölme.) İlk bölüm için (480 − 240) / 2 = 120.
- `const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2` → aynı hesap dikey: iki şerit arasında kalan
  alanın ortası.
- `tile` içinde `ox +` ve `oy +` → her kare bu kadar kayar.

# --task--

1. Under `const TILE = 48` write the `TOP` and `BOTTOM` lines.
2. In `draw`, above `const tile`, write the comment and the four lines.
3. In `tile`, add `ox + ` and `oy + ` at the start of the first two numbers. Press **Run**.

# --task-tr--

1. `const TILE = 48` satırının altına `TOP` ve `BOTTOM` satırlarını yaz.
2. `draw` içinde `const tile = ...` satırının **üstüne** yorum satırını ve dört satırı yaz.
3. `tile` içindeki `ctx.fillRect(...)`'in ilk iki sayısının başına `ox + ` ve `oy + ` ekle.
4. **Çalıştır**: duvar çerçevesi tuvalin ortasına gelmeli.

# --hint--

`ox` and `oy` must be defined before `tile`, because `tile` uses them.

# --hint-tr--

`ox` ve `oy`, `tile`'dan **önce** tanımlanmalı; çünkü `tile` onları kullanıyor.

# --tests--

`TOP` should be 48 and `BOTTOM` 40.
tr: `TOP` 48, `BOTTOM` 40 olmalı.

```js
assert.strictEqual(TOP, 48)
assert.strictEqual(BOTTOM, 40)
```

The level should be drawn centered.
tr: Bölüm ortalanarak çizilmeli.

```js
draw()
const grey = $.rects('#78716c')
assert.deepInclude(grey, { x: 121, y: 193, w: 46, h: 46, color: '#78716c' }, 'the top-left wall')
assert.deepInclude(grey, { x: 120 + 4 * 48 + 1, y: 192 + 2 * 48 + 1, w: 46, h: 46, color: '#78716c' }, 'the bottom-right wall')
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 48
const TOP = 48 // room for the level number and the move counter
const BOTTOM = 40 // room for the hint line
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

let level = 0
let walls

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
    })
  })
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Center the level on the canvas.
  const rows = LEVELS[level].length
  const cols = Math.max(...LEVELS[level].map((line) => line.length))
  const ox = (canvas.width - cols * TILE) / 2
  const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
}

loadLevel(0)
draw()
```
