---
title: Draw what the grid says
title_tr: Izgaranın dediğini çiz
skills: [game.canvas]
---

# --goal--

The drawing now reads each tile from `grid`: a wall is grey, floor stays green.

# --goal-tr--

Çizim artık her karenin rengini **ızgaradan** okuyacak: duvar gri, zemin yeşil. Böylece ızgarada ne değişirse ekrana
kendiliğinden yansır. **Veri** (ızgara) ayrı, **çizim** ayrı: oyun yazmanın en önemli fikirlerinden biri.

# --code--

```js
const tile = grid[r][c]
ctx.fillStyle = tile === '#' ? '#475569' : '#3f6212'
```

# --meaning--

- `grid[r][c]` is the tile's character.
- `condition ? A : B` gives `A` when the condition is true, otherwise `B`: grey for a wall, green for anything else.

# --meaning-tr--

- `const tile = grid[r][c]` → o karenin karakteri.
- `tile === '#' ? '#475569' : '#3f6212'` → `koşul ? A : B` "koşul doğruysa A, değilse B" demek: duvarsa gri,
  değilse yeşil.

# --task--

In `draw`, under `const y = ...`, write the `tile` line and change the `fillStyle` line.

# --task-tr--

1. `draw` içinde `const y = ...` satırının altına `const tile = grid[r][c]` yaz.
2. Altındaki `ctx.fillStyle = '#3f6212'` satırını yeni hâliyle değiştir.
3. **Çalıştır**: yeşil alanın çevresinde gri bir duvar görmelisin.

# --tests--

Walls should be grey and floor green.
tr: Duvarlar gri, zemin yeşil olmalı.

```js
$.tick()
assert.deepInclude($.rects('#475569'), { x: 0, y: 32, w: 32, h: 32, color: '#475569' }, 'a wall')
assert.deepInclude($.rects('#3f6212'), { x: 32, y: 64, w: 32, h: 32, color: '#3f6212' }, 'the floor')
```

The picture should follow the grid.
tr: Resim ızgarayı izlemeli.

```js
grid[3][5] = '#'
$.tick()
assert.deepInclude($.rects('#475569'), { x: 160, y: 128, w: 32, h: 32, color: '#475569' })
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
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) grid[r].push('#')
      else grid[r].push(' ')
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
      ctx.fillStyle = tile === '#' ? '#475569' : '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
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
