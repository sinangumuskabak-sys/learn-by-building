---
title: Drop a bomb
title_tr: Bomba bırak
skills: [game.state]
---

# --goal--

A bomb is a tile and a **fuse**: how many frames until it goes off. `dropBomb` puts one on the tile the player stands
on. The player may be between two tiles, so `tileOf` rounds to the nearest one.

# --goal-tr--

Bomba bir kare ve bir **fitildir**: `fuse`, kaç kare (frame) sonra patlayacağı. 150 kare, yaklaşık 2.5 saniye.

`dropBomb` (bomba bırak) oyuncunun durduğu kareye bir bomba koyar. Ama oyuncu kayarken iki karenin arasında olabilir
(`x = 2.4`). `tileOf` en yakın kareyi bulur. Bu adımda bombayı yalnız listeye koyuyoruz; tuşa ve çizime sonra
bağlayacağız.

# --code--

```js
const FUSE = 150 // frames until a bomb goes off

let bombs // { r, c, fuse }

  bombs = []

const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })

function dropBomb() {
  const t = tileOf(player)
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}
```

# --meaning--

- `Math.round` rounds to the nearest whole number: 2.4 → 2, 2.6 → 3. So `tileOf` gives the tile a mover stands on.
- `({ ... })` returns an object from a short function; without the brackets `{` would start a function body.
- `dropBomb` adds `{ r, c, fuse }` to `bombs`.

# --meaning-tr--

- `const FUSE = 150` → fitil: 150 kare. `let bombs` → yerdeki bombalar; `reset` onu boşaltır.
- `const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })` → `Math.round` en yakın tam sayıya yuvarlar:
  2.4 → 2, 2.6 → 3. Yani bir şeyin **bastığı kare**. Nesneyi `({ ... })` diye parantez içinde döndürürüz; parantez
  olmasa `{` fonksiyon gövdesi sanılırdı.
- `function dropBomb() {`:
  - `const t = tileOf(player)` → oyuncunun karesi.
  - `bombs.push({ r: t.r, c: t.c, fuse: FUSE })` → o kareye tam fitilli bir bomba.

# --task--

1. Above `DIRS` write `FUSE`.
2. Above `let held` write `let bombs`; in `reset`, above `held = []`, write `bombs = []`.
3. Under `walkable` write `tileOf`.
4. Above `function update() {` write `dropBomb`.

# --task-tr--

1. `const DIRS = ...` satırının **üstüne** `FUSE` satırını yaz.
2. `let held` satırının **üstüne** `let bombs` yaz.
3. `reset` içinde `held = []` satırının **üstüne** `bombs = []` yaz.
4. `const walkable = ...` satırının altına `tileOf` satırını yaz.
5. `function update() {` satırının **üstüne** `dropBomb` fonksiyonunu yaz.
6. **Çalıştır**: ekranda fark yok, kontroller yeşil olmalı.

# --tests--

`tileOf` should give the nearest tile.
tr: `tileOf` en yakın kareyi vermeli.

```js
assert.deepEqual(tileOf({ x: 2.4, y: 0.6 }), { r: 1, c: 2 })
assert.deepEqual(tileOf({ x: 3, y: 5 }), { r: 5, c: 3 })
```

`dropBomb` should put a bomb with a full fuse on the player's tile.
tr: `dropBomb`, oyuncunun karesine tam fitilli bir bomba koymalı.

```js
assert.deepEqual(bombs, [])
player.x = 2.6
dropBomb()
assert.deepEqual(bombs, [{ r: 1, c: 3, fuse: 150 }])
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
const SPEED = 0.1 // tiles per frame
const FUSE = 150 // frames until a bomb goes off
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let bombs // { r, c, fuse }
let held // arrow keys being held, the last one pressed at the end

const near = (r, c, spots) => spots.some(([sr, sc]) => Math.abs(sr - r) + Math.abs(sc - c) <= 1)

// Walls all round, a pillar on every even row and column, and crates on about half of the rest,
// but never next to where the player and the enemies start.
function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1 || (r % 2 === 0 && c % 2 === 0)) grid[r].push('#')
      else if (near(r, c, [[1, 1], ...ENEMY_STARTS]) || Math.random() > 0.55) grid[r].push(' ')
      else grid[r].push('+')
    }
  }
}

const walkable = (r, c) => grid[r][c] === ' '
const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  bombs = []
  held = []
}

// Step a mover towards its target tile, and drop the target once it is there.
function moveTo(m, speed) {
  const dx = m.target.c - m.x
  const dy = m.target.r - m.y
  if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
    m.x = m.target.c
    m.y = m.target.r
    m.target = null
    return
  }
  m.x += Math.sign(dx) * speed
  m.y += Math.sign(dy) * speed
}

// On a tile, the last arrow key held picks the next tile; then the player keeps sliding towards it.
function updatePlayer() {
  const dir = DIRS[held[held.length - 1]]
  if (!player.target && dir && walkable(player.y + dir[0], player.x + dir[1])) {
    player.target = { r: player.y + dir[0], c: player.x + dir[1] }
  }
  if (player.target) moveTo(player, SPEED)
}

function dropBomb() {
  const t = tileOf(player)
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}

function update() {
  updatePlayer()
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  }
})

document.addEventListener('keyup', (event) => {
  held = held.filter((k) => k !== event.key)
})

function drawCircle(m, color, radius) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(m.x * TILE + TILE / 2, TOP + m.y * TILE + TILE / 2, radius, 0, Math.PI * 2)
  ctx.fill()
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
  drawCircle(player, '#f8fafc', 12)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
