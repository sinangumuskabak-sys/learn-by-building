---
title: Hop
title_tr: Zıpla
skills: [game.input]
---

# --goal--

Each arrow press makes the frog hop one square, never off the board. Holding the key does not keep hopping: one press,
one hop, like the arcade game.

# --goal-tr--

Her ok tuşu kurbağayı **bir kare** zıplatsın; tahtanın dışına asla. Tuşu basılı tutmak durmadan zıplatmasın: bir basış,
bir zıplama. Salon oyunundaki gibi, her adım bir karar.

# --code--

```js
function hop(dx, dy) {
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
})
```

# --meaning--

- `Math.max(0, ...)` and `Math.min(COLS - 1, ...)` keep the column between 0 and 11 (and the row between 0 and 12).
- `DIRECTIONS` maps each arrow to a `[dx, dy]` pair; other keys give `undefined`.
- `hop(...direction)` spreads the pair into two arguments.
- `event.repeat` is true for the automatic repeats of a held key.

# --meaning-tr--

- `Math.max(0, frog.x + dx)` → 0'ın altına inmesin; `Math.min(COLS - 1, ...)` → 11'i geçmesin. İkisi birlikte sayıyı
  bir **aralıkta tutar**.
- `DIRECTIONS` → her okun `[dx, dy]` çifti; başka tuşlarda `undefined`.
- `hop(...direction)` → `...` (yayma) çiftin iki sayısını iki ayrı argüman yapar: `hop(0, -1)` gibi.
- `event.preventDefault()` → okların sayfayı kaydırmasını engeller.
- `!event.repeat` → basılı tutulan tuşun otomatik tekrarlarını yok say.

# --task--

Under `frog`, write `hop`, `DIRECTIONS` and the `keydown` listener.

# --task-tr--

`frog` satırının altına `hop` fonksiyonunu, `DIRECTIONS` tablosunu ve `keydown` dinleyicisini yaz. **Çalıştır**, oyuna tıkla ve oklarla zıpla.

# --tests--

Each arrow press should hop one square.
tr: Her ok basışı bir kare zıplatmalı.

```js
$.tap('ArrowUp')
$.tap('ArrowLeft')
assert.deepEqual(frog, { x: 4, y: 11 })
```

The frog should never leave the board, and holding a key should not hop again.
tr: Kurbağa tahtadan asla çıkmamalı; tuşu basılı tutmak yeniden zıplatmamalı.

```js
$.tap('ArrowDown')
assert.strictEqual(frog.y, 12)
frog.x = 11
$.tap('ArrowRight')
assert.strictEqual(frog.x, 11)
$.press('ArrowUp')
$.press('ArrowUp', { repeat: true })
assert.strictEqual(frog.y, 11)
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

function hop(dx, dy) {
  frog.x = Math.min(COLS - 1, Math.max(0, frog.x + dx))
  frog.y = Math.min(START_ROW, Math.max(0, frog.y + dy))
}

const DIRECTIONS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
document.addEventListener('keydown', (event) => {
  const direction = DIRECTIONS[event.key]
  if (direction) {
    event.preventDefault()
    // One hop per press: holding the key down does not hop again.
    if (!event.repeat) hop(...direction)
  }
})

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
