---
title: Where is the pointer?
title_tr: İşaretçi nerede?
skills: [game.input]
---

# --goal--

To paint with the mouse or a finger we need the pointer's place in canvas pixels. The browser gives it relative to
the page, and the canvas may be shown larger or smaller than 480 pixels, so we convert.

# --goal-tr--

Kendi desenlerini fareyle ya da parmakla çizebilmek istiyoruz. Önce şunu bilmeliyiz: işaretçi **canvas'ın hangi
pikselinde?**

Tarayıcı yeri **sayfaya göre** verir: `event.clientX`, `event.clientY`. Ama canvas sayfanın başka bir yerinde durur
ve ekrana sığsın diye büyütülmüş ya da küçültülmüş olabilir (telefonda 480 piksel yerine 240 gibi). `toCanvas`
bu farkı düzeltir; bir haritadaki ölçeği gerçek mesafeye çevirmek gibi.

# --code--

```js
function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}
```

# --meaning--

- `getBoundingClientRect()` gives the canvas's box on the screen: `left`, `top`, `width`, `height`.
- `event.clientX - rect.left` is how far the pointer is from the canvas's left edge, in screen pixels.
- `* canvas.width / rect.width` turns screen pixels into canvas pixels (halves them if the canvas is shown twice as
  big).
- It returns an object `{ x, y }`.

# --meaning-tr--

- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki **kutusu**: `left` (sol kenarı), `top` (üst kenarı),
  `width`, `height` (ekranda göründüğü boy).
- `event.clientX - rect.left` → işaretçi, canvas'ın sol kenarından kaç ekran pikseli içeride.
- `* canvas.width / rect.width` → ekran pikselini canvas'ın kendi pikseline çevirir. Canvas 480 piksel ama ekranda
  240 görünüyorsa 480 / 240 = 2 ile çarpar.
- `y` için aynısı `top` ve `height` ile.
- `return { x: ..., y: ... }` → iki sayıyı bir **nesne** içinde geri verir.

# --task--

Write `toCanvas` above `function update() {`, with an empty line between them.

# --task-tr--

`function update() {` satırının **üstüne** `toCanvas` fonksiyonunu yaz; aralarında bir boş satır kalsın.
**Çalıştır**: ekran değişmez; fonksiyonu bir sonraki adımlarda kullanacağız.

# --hint--

Subtract `rect.left` (or `rect.top`) first, then scale: the parentheses matter.

# --hint-tr--

Önce `rect.left` (ya da `rect.top`) çıkar, sonra ölçekle: parantezler önemli.

# --tests--

`toCanvas` should give the pointer's place in canvas pixels.
tr: `toCanvas` işaretçinin yerini canvas pikseli olarak vermeli.

```js
assert.deepEqual(toCanvas({ clientX: 100, clientY: 50 }), { x: 100, y: 50 })
```

It should work when the canvas is moved and shown at half size.
tr: Canvas kaydırılmış ve yarı boyda gösteriliyorken de doğru çalışmalı.

```js
canvas.getBoundingClientRect = () => ({ left: 10, top: 20, width: 240, height: 240 })
assert.deepEqual(toCanvas({ clientX: 70, clientY: 80 }), { x: 120, y: 120 })
assert.deepEqual(toCanvas({ clientX: 250, clientY: 260 }), { x: 480, y: 480 })
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36
const SPEED = 6 // frames per generation while playing

let grid // grid[row][col]: 1 alive, 0 dead
let generation
let playing
let frames

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
  generation = 0
}

function clear() {
  grid = emptyGrid()
  generation = 0
  playing = false
}

function reset() {
  grid = emptyGrid()
  randomize()
  playing = false
  frames = 0
}

// Live neighbours among the 8 around (r, c). The edges wrap around, so the world has no border.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      count += grid[(r + dr + ROWS) % ROWS][(c + dc + COLS) % COLS]
    }
  }
  return count
}

// Every cell changes at the same moment, so the next generation is built in a new grid.
function step() {
  const next = emptyGrid()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(r, c)
      // A live cell survives with 2 or 3 neighbours; a dead cell comes alive with exactly 3.
      next[r][c] = n === 3 || (n === 2 && grid[r][c] === 1) ? 1 : 0
    }
  }
  grid = next
  generation += 1
}

const population = () => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)

function press(button) {
  if (button === 'Play') playing = !playing
  else if (button === 'Step') {
    playing = false
    step()
  } else if (button === 'Random') randomize()
  else if (button === 'Clear') clear()
}

document.addEventListener('keydown', (event) => {
  const keys = { ' ': 'Play', n: 'Step', r: 'Random', c: 'Clear' }
  const button = keys[event.key.toLowerCase()]
  if (!button) return
  event.preventDefault()
  press(button)
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

function update() {
  frames += 1
  if (playing && frames % SPEED === 0) step()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Generation ' + generation, 8, 24)
  ctx.textAlign = 'right'
  ctx.fillText('Alive ' + population(), canvas.width - 8, 24)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
