---
title: Crates
title_tr: Kasalar
skills: [prog.arrays, game.canvas]
---

# --goal--

About 45% of the free tiles get a crate, at random. Crates are drawn brown, with a darker stripe.

# --goal-tr--

Boş karelerin yaklaşık yarısına **kasa** koyacağız, rastgele. Her çalıştırmada kasalar başka yerde olacak. Kasalar
kahverengi, ortalarında koyu bir şerit var.

# --code--

```js
else if (Math.random() > 0.55) grid[r].push(' ')
else grid[r].push('+')

ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
ctx.fillRect(x, y, TILE, TILE)
if (tile === '+') {
  ctx.fillStyle = '#92400e'
  ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
}
```

# --meaning--

- `Math.random()` gives a random number between 0 and 1; `> 0.55` is true 45% of the time: floor. Otherwise a crate.
- Two `? :` in a row pick one of three colors.
- A crate gets a dark 4-pixel stripe across its middle.

# --meaning-tr--

- `Math.random()` → 0 ile 1 arasında rastgele bir sayı.
- `else if (Math.random() > 0.55) grid[r].push(' ')` → duvar değilse ve sayı 0.55'ten büyükse (%45 ihtimal) zemin...
- `else grid[r].push('+')` → ...değilse kasa. Duvar olmayan karelerin yarısından biraz fazlası kasa olur.
- `tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'` → iki `? :` art arda: duvarsa gri, değilse
  kasaysa kahverengi, o da değilse yeşil.
- `if (tile === '+') { ... }` → kasanın ortasına koyu bir şerit: 4 piksel içeriden, 14 piksel aşağıdan, 24 × 4.

# --task--

1. In `makeGrid`, replace `else grid[r].push(' ')` with the two new lines.
2. In `draw`, extend the color and, under the tile's `fillRect`, write the stripe.

# --task-tr--

1. `makeGrid` içinde `else grid[r].push(' ')` satırını sil; yerine iki yeni satırı yaz.
2. `draw` içinde renk satırını üç renkli hâliyle değiştir.
3. `ctx.fillRect(x, y, TILE, TILE)` satırının **altına** şeridi çizen `if` bloğunu yaz.
4. **Çalıştır**: arena kasalarla dolmalı; her çalıştırmada başka bir düzen.

# --try--

Change `0.55` to `0.9` and run a few times: the arena is packed with crates. Put 0.55 back.

# --try-tr--

`0.55`'i `0.9` yap ve birkaç kez çalıştır: arena kasayla dolup taşar. Sonra 0.55'e geri al.

# --tests--

About half of the free tiles should be crates.
tr: Boş karelerin yaklaşık yarısı kasa olmalı.

```js
let crates = 0
let free = 0
for (let i = 0; i < 20; i++) {
  makeGrid()
  for (const row of grid) for (const t of row) {
    if (t === '+') crates++
    if (t !== '#') free++
  }
}
assert.isAbove(crates / free, 0.35, 'plenty of crates')
assert.isBelow(crates / free, 0.65)
```

Crates should be drawn brown with a dark stripe.
tr: Kasalar koyu şeritli kahverengi çizilmeli.

```js
grid[1][3] = '+'
$.tick()
assert.deepInclude($.rects('#b45309'), { x: 96, y: 64, w: 32, h: 32, color: '#b45309' }, 'a crate')
assert.deepInclude($.rects('#92400e'), { x: 100, y: 78, w: 24, h: 4, color: '#92400e' }, 'its stripe')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

function reset() {
  makeGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      const tile = grid[r][c]
      ctx.fillStyle = tile === '#' ? '#475569' : tile === '+' ? '#b45309' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
      if (tile === '+') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 4, y + 14, TILE - 8, 4)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
