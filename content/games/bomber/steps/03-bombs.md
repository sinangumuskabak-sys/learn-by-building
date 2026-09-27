---
title: Bombs and flames
title_tr: Bombalar ve alevler
skills: [game.state, prog.loops]
---

# --explanation--

Space drops a bomb on the tile you stand on. Its **fuse** counts down every frame; at zero it explodes.

The explosion is a **cross**: the bomb's own tile, then `power` tiles in each of the four directions. Each arm walks outwards
tile by tile, and what it meets decides whether it continues:

- a **wall** stops it before that tile;
- a **crate** catches fire (it becomes floor) and stops the arm there;
- another **bomb** is set off (its fuse becomes 1, so it explodes next frame, a **chain reaction**) and stops the arm;
- floor burns and the arm goes on.

`break` leaves the inner loop, which ends that one arm and moves on to the next direction. The flames are kept as short-lived
objects that disappear after `FLAME_TIME` frames, and anything standing in one will soon get hurt.

Bombs are also obstacles: nobody can walk into a tile with a bomb. You can still walk **off** the one you just dropped,
because `walkable` only checks the tile you are going to.

# --explanation-tr--

Boşluk durduğun kareye bir bomba bırakır. **Fitili** her karede geri sayar; sıfırda patlar.

Patlama bir **artı** şeklidir: bombanın kendi karesi, sonra dört yönün her birinde `power` kare. Her kol kare kare dışarı ilerler
ve karşılaştığı şey devam edip etmeyeceğine karar verir:

- bir **duvar** onu o kareden önce durdurur;
- bir **sandık** alev alır (zemin olur) ve kolu orada durdurur;
- başka bir **bomba** ateşlenir (fitili 1 olur, yani bir sonraki karede patlar: bir **zincirleme tepkime**) ve kolu durdurur;
- zemin yanar ve kol devam eder.

`break` iç döngüden çıkar; bu o tek kolu bitirir ve sonraki yöne geçer. Alevler `FLAME_TIME` kare sonra kaybolan kısa ömürlü
nesneler olarak tutulur ve birinin içinde duran her şey yakında zarar görecek.

Bombalar aynı zamanda engeldir: kimse bombalı bir kareye yürüyemez. Yine de az önce bıraktığın bombanın **üstünden** çıkabilirsin,
çünkü `walkable` yalnızca gideceğin kareye bakar.

# --task--

1. Add `FUSE = 150`, `FLAME_TIME = 30`, `bombs` and `flames` (`[]`), `maxBombs = 1` and `power = 2` (in `reset()`).
2. Write `bombAt(r, c)` and `tileOf(m)` (the nearest tile, `Math.round`). `walkable` is now false where there is a bomb.
3. Write `dropBomb()`: if fewer than `maxBombs` bombs are down and there is none on the player's tile, add
   `{ r, c, fuse: FUSE }`. Space calls it.
4. Write `explode(bomb)`: remove the bomb, add a flame on its tile, and for each direction walk `1..power` tiles as described
   above, adding `{ r, c, time: FLAME_TIME }` for every burning tile.
5. In `update()`: count every fuse down and explode the bombs at `0` or below; count every flame down and remove the ones at
   `0`.
6. Draw each flame as a `'#f97316'` square 2 pixels in, with a `'#fde047'` square 9 pixels in, and each bomb as a circle of
   radius 12, `'#020617'`, blinking `'#dc2626'` when `fuse < 45` and `fuse % 10 < 5`.

# --task-tr--

1. `FUSE = 150`, `FLAME_TIME = 30`, `bombs` ve `flames` (`[]`), `maxBombs = 1` ve `power = 2` (`reset()`'te) ekle.
2. `bombAt(r, c)` ve `tileOf(m)` (en yakın kare, `Math.round`) yaz. `walkable` artık bomba olan yerde false'tur.
3. `dropBomb()` yaz: yerde `maxBombs`'tan az bomba varsa ve oyuncunun karesinde yoksa `{ r, c, fuse: FUSE }` ekle. Boşluk onu
   çağırır.
4. `explode(bomb)` yaz: bombayı kaldır, karesine bir alev ekle ve her yön için yukarıda anlatıldığı gibi `1..power` kare
   ilerleyerek yanan her kare için `{ r, c, time: FLAME_TIME }` ekle.
5. `update()`'te: her fitili azalt ve `0` ya da altındaki bombaları patlat; her alevi azalt ve `0`'dakileri kaldır.
6. Her alevi 2 piksel içeride `'#f97316'` bir kare, 9 piksel içeride `'#fde047'` bir kareyle; her bombayı 12 yarıçaplı
   `'#020617'` bir daire olarak, `fuse < 45` ve `fuse % 10 < 5` iken `'#dc2626'` yanıp sönerek çiz.

# --tests--

A bomb should go off after its fuse, in a cross of `power` tiles stopped by walls.
tr: Bir bomba fitilinden sonra, duvarların durdurduğu `power` karelik bir artı şeklinde patlamalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
$.press(' ')
assert.deepEqual(bombs.map((b) => [b.r, b.c, b.fuse]), [[1, 1, FUSE]])
$.press(' ')
assert.lengthOf(bombs, 1, 'one bomb at a time')
$.tick(FUSE - 1)
assert.lengthOf(bombs, 1)
assert.lengthOf(flames, 0)
$.tick(1)
assert.lengthOf(bombs, 0, 'boom')
const tiles = flames.map((f) => f.r + ',' + f.c).sort()
assert.sameMembers(tiles, ['1,1', '1,2', '1,3', '2,1', '3,1'], 'a cross of power 2, stopped by the walls')
```

A crate should burn and stop the flame, and the flames should die down.
tr: Bir sandık yanmalı ve alevi durdurmalı; alevler sönmeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
grid[1][2] = '+'
grid[1][3] = '+'
$.press(' ')
$.tick(FUSE)
assert.strictEqual(grid[1][2], ' ', 'the crate burns')
assert.strictEqual(grid[1][3], '+', 'and stops the flame')
assert.notInclude(flames.map((f) => f.r + ',' + f.c), '1,3')
$.tick(FLAME_TIME)
assert.lengthOf(flames, 0, 'flames die down')
```

Bombs should block the way, and a flame reaching another bomb should set it off.
tr: Bombalar yolu kesmeli ve başka bir bombaya ulaşan alev onu ateşlemeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
bombs.push({ r: 1, c: 3, fuse: 500 })
$.press('ArrowRight')
$.tick(30)
assert.strictEqual(player.x, 2, 'bombs block the way')
$.release('ArrowRight')
bombs.push({ r: 1, c: 5, fuse: 1 })
$.tick(1)
assert.lengthOf(bombs, 1, 'the flame reached the other bomb')
$.tick(1)
assert.lengthOf(bombs, 0, 'chain reaction')
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
const FLAME_TIME = 30
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
let bombs // { r, c, fuse }
let flames // { r, c, time }
let held // arrow keys being held, the last one pressed at the end
let maxBombs
let power

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
  flames = []
  held = []
  maxBombs = 1
  power = 2
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

// A cross of flames, `power` tiles each way. Walls stop it; a crate burns and stops it; another bomb goes off too.
function explode(bomb) {
  bombs = bombs.filter((b) => b !== bomb)
  flames.push({ r: bomb.r, c: bomb.c, time: FLAME_TIME })
  for (const [dr, dc] of Object.values(DIRS)) {
    for (let i = 1; i <= power; i++) {
      const r = bomb.r + dr * i
      const c = bomb.c + dc * i
      if (grid[r][c] === '#') break
      flames.push({ r, c, time: FLAME_TIME })
      if (grid[r][c] === '+') {
        grid[r][c] = ' '
        break
      }
      const other = bombAt(r, c)
      if (other) {
        other.fuse = 1 // a chain reaction: it goes off next frame
        break
      }
    }
  }
}

function update() {
  updatePlayer()
  for (const b of bombs) b.fuse -= 1
  for (const bomb of bombs.filter((b) => b.fuse <= 0)) explode(bomb)
  for (const f of flames) f.time -= 1
  flames = flames.filter((f) => f.time > 0)
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
  for (const f of flames) {
    ctx.fillStyle = '#f97316'
    ctx.fillRect(f.c * TILE + 2, TOP + f.r * TILE + 2, TILE - 4, TILE - 4)
    ctx.fillStyle = '#fde047'
    ctx.fillRect(f.c * TILE + 9, TOP + f.r * TILE + 9, TILE - 18, TILE - 18)
  }
  // Bombs blink faster as the fuse runs out.
  for (const b of bombs) drawCircle({ x: b.c, y: b.r }, b.fuse < 45 && b.fuse % 10 < 5 ? '#dc2626' : '#020617', 12)
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
