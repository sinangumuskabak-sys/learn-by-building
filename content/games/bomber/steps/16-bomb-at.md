---
title: Bombs are in the way
title_tr: Bombalar yol keser
skills: [game.collision]
---

# --goal--

`bombAt` finds the bomb on a tile. Nobody can walk into a tile with a bomb, and two bombs never share a tile. You can
still walk **off** the bomb you just dropped, because `walkable` only checks the tile you are going to.

# --goal-tr--

Bombalar **engeldir**: kimse bombalı bir kareye yürüyemez. Bir karede de iki bomba olamaz. Bunun için o karedeki
bombayı bulan `bombAt` yardımcısını yazıyoruz.

Yine de az önce bıraktığın bombanın **üstünden çıkabilirsin**, çünkü `walkable` yalnız **gideceğin** kareye bakar.
Bombayı koyup kaçmak oyunun özü.

# --code--

```js
const bombAt = (r, c) => bombs.find((b) => b.r === r && b.c === c)
const walkable = (r, c) => grid[r][c] === ' ' && !bombAt(r, c)

  const t = tileOf(player)
  if (bombAt(t.r, t.c)) return
```

# --meaning--

- `find` returns the first item for which the function is true, or `undefined` if none is.
- `!bombAt(r, c)` is true when there is no bomb there.
- `dropBomb` leaves if the tile already has a bomb.

# --meaning-tr--

- `bombs.find((b) => b.r === r && b.c === c)` → koşulu sağlayan **ilk** bombayı verir; yoksa `undefined` ("yok").
- `grid[r][c] === ' ' && !bombAt(r, c)` → zemin **ve** bomba **yok**. `!` bulunan bombayı "var"dan "yok"a çevirir:
  bomba varsa `!bombAt(...)` yanlış olur.
- `if (bombAt(t.r, t.c)) return` → durduğun karede zaten bomba varsa ikincisini koyma.

# --task--

1. Above `walkable` write `bombAt`, and add `&& !bombAt(r, c)` to `walkable`.
2. In `dropBomb`, under `const t = ...`, write the `if`.

# --task-tr--

1. `const walkable = ...` satırının **üstüne** `bombAt` satırını yaz.
2. `walkable` satırının sonuna ` && !bombAt(r, c)` ekle.
3. `dropBomb` içinde `const t = tileOf(player)` satırının altına `if (bombAt(t.r, t.c)) return` yaz.
4. **Çalıştır**: bomba bırak, yanına geç ve geri dönmeyi dene: bomba yolu kesmeli.

# --tests--

Bombs should block the way, but you can walk off your own.
tr: Bombalar yolu kesmeli; ama kendi bombanın üstünden çıkabilirsin.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  bombs.push({ r: 1, c: 3, fuse: 500 })
  $.press('ArrowRight')
  $.tick(30)
  assert.strictEqual(player.x, 2, 'bombs block the way')
  bombs = [{ r: 1, c: 2, fuse: 500 }]
  $.tick(10)
  assert.closeTo(player.x, 3, 1e-9, 'walking off a bomb is fine')
```

Two bombs should never share a tile.
tr: İki bomba aynı karede olmamalı.

```js
maxBombs = 3
$.press(' ')
$.press(' ')
assert.lengthOf(bombs, 1)
assert.deepEqual(bombAt(1, 1), bombs[0])
assert.isUndefined(bombAt(1, 2))
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
let maxBombs

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

const bombAt = (r, c) => bombs.find((b) => b.r === r && b.c === c)
const walkable = (r, c) => grid[r][c] === ' ' && !bombAt(r, c)
const tileOf = (m) => ({ r: Math.round(m.y), c: Math.round(m.x) })

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
  bombs = []
  held = []
  maxBombs = 1
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
  if (bombs.length >= maxBombs) return
  const t = tileOf(player)
  if (bombAt(t.r, t.c)) return
  bombs.push({ r: t.r, c: t.c, fuse: FUSE })
}

function update() {
  updatePlayer()
}

document.addEventListener('keydown', (event) => {
  if (DIRS[event.key]) {
    event.preventDefault()
    if (!held.includes(event.key)) held.push(event.key)
  } else if (event.key === ' ') {
    event.preventDefault()
    dropBomb()
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
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, '#020617', 12)
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
