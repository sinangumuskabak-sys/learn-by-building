---
title: The frog
title_tr: Kurbağa
skills: [game.state]
---

# --goal--

The frog stands on the start row. Its place is in tiles, not pixels: column 5, row 12. Drawing turns tiles into pixels.

# --goal-tr--

Kurbağa başlangıç satırında duruyor. Yerini **piksel değil kare** cinsinden tutuyoruz: 5. sütun, 12. satır. Oyunun
mantığı karelerle daha kolay; pikselleri yalnız çizerken hesaplıyoruz.

# --code--

```js
let frog = { x: 5, y: START_ROW }

  ctx.fillStyle = '#22c55e'
  ctx.fillRect(frog.x * TILE + 6, TOP + frog.y * TILE + 6, TILE - 12, TILE - 12)
```

# --meaning--

- `frog.x` is the column and `frog.y` the row.
- On screen the square starts at `x * TILE`, `TOP + y * TILE`; `+ 6` and `- 12` leave a 6-pixel margin on each side.

# --meaning-tr--

- `frog.x` → sütun, `frog.y` → satır.
- `frog.x * TILE` → karenin sol kenarı (piksel); `TOP + frog.y * TILE` → üst kenarı.
- `+ 6` ve `TILE - 12` → kurbağa karesinin her yanından 6 piksel boşluk: 28×28'lik yeşil bir kare.

# --task--

1. Under the rows comment, write `frog`.
2. At the end of `draw`, draw the frog.

# --task-tr--

1. `// Rows from the top ...` yorumunun altına bir boş satır bırakıp `frog` satırını yaz.
2. `draw`'ın sonuna, satır döngüsünün altına kurbağayı çizen iki satırı yaz.
3. **Çalıştır**.

# --tests--

The frog should be a green square on the start row.
tr: Kurbağa başlangıç satırında yeşil bir kare olmalı.

```js
assert.deepEqual(frog, { x: 5, y: 12 })
assert.deepEqual($.rects('#22c55e'), [{ x: 206, y: 40 + 12 * 40 + 6, w: 28, h: 28, color: '#22c55e' }])
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

draw()
```
