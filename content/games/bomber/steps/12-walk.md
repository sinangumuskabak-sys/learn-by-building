---
title: Walk
title_tr: Yürü
skills: [game.input, game.state]
---

# --goal--

When the player is exactly on a tile and an arrow is held, the next tile that way becomes the target, if it is floor.
Then the player slides towards it. Choosing and the first bit of sliding happen in the same frame, so there is no
stutter at each tile.

# --goal-tr--

Şimdi karar kısmı. Oyuncu tam bir karenin üstündeyken (hedefi yokken) basılı son ok tuşuna bakarız: o yöndeki kare
**zeminse** onu hedef yaparız. Sonra hedef varsa ona doğru kayarız.

Kararı ve kaymanın ilk parçasını **aynı karede** (frame) yapmak önemli: sonraki kareyi seçmek kendi başına bir kare
sürseydi oyuncu her karede takılırdı.

# --code--

```js
const walkable = (r, c) => grid[r][c] === ' '

// On a tile, the last arrow key held picks the next tile; then the player keeps sliding towards it.
function updatePlayer() {
  const dir = DIRS[held[held.length - 1]]
  if (!player.target && dir && walkable(player.y + dir[0], player.x + dir[1])) {
    player.target = { r: player.y + dir[0], c: player.x + dir[1] }
  }
  if (player.target) moveTo(player, SPEED)
}

function update() {
  updatePlayer()
}

function loop() {
  update()
  draw()
```

# --meaning--

- `walkable(r, c)` is true for floor.
- `held[held.length - 1]` is the last key held; `DIRS[...]` its step, or `undefined` when no key is held.
- A new target is chosen only with no target yet, a key held, and floor that way.
- `update` holds the game's rules; the loop updates first, then draws.

# --meaning-tr--

- `const walkable = (r, c) => grid[r][c] === ' '` → o kareye yürünebilir mi? Şimdilik: zeminse.
- `held[held.length - 1]` → listenin **son** elemanı. `.length` eleman sayısı; sayma 0'dan başladığı için son eleman
  `length - 1`'dedir. Liste boşsa `undefined` gelir.
- `const dir = DIRS[...]` → o tuşun adımı, örneğin `[0, 1]`; tuş yoksa `undefined`.
- `if (!player.target && dir && walkable(...))` → hedef **yok** ve bir yön **var** ve o yöndeki kare **yürünebilir**
  ise:
  - `player.target = { r: player.y + dir[0], c: player.x + dir[1] }` → yandaki kare hedef olur. `dir[0]` satır farkı,
    `dir[1]` sütun farkı.
- `if (player.target) moveTo(player, SPEED)` → hedef varsa bir adım kay. Hedefe varınca `moveTo` onu `null` yapar;
  tuş hâlâ basılıysa sonraki karede yeni hedef seçilir.
- `function update() { updatePlayer() }` → oyunun kuralları burada toplanacak. `loop` önce günceller, sonra çizer.

# --task--

1. Above `function reset() {` write `walkable`.
2. Above the `keydown` listener write `updatePlayer` and `update`.
3. In `loop`, write `update()` above `draw()`.

# --task-tr--

1. `function reset() {` satırının **üstüne** `walkable` satırını yaz (sonra bir boş satır).
2. `document.addEventListener('keydown', ...)` satırının **üstüne** yorumu, `updatePlayer` ve `update`
   fonksiyonlarını yaz.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır**, oyuna tıkla ve ok tuşlarını basılı tut: oyuncu kareden kareye kaymalı, duvar ve kasalardan
   geçmemeli.

# --hint--

If the player never moves, check that `loop` calls `update()`.

# --hint-tr--

Oyuncu hiç kıpırdamıyorsa `loop`'un `update()`'i çağırdığından emin ol. Oyun alanına bir kez tıklamayı da unutma.

# --tests--

Holding a key should slide the player to the next tile and stop on a tile when let go.
tr: Tuşu basılı tutmak oyuncuyu sonraki kareye kaydırmalı; bırakınca bir karede durmalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  $.press('ArrowRight')
  $.tick(5)
  assert.closeTo(player.x, 1.5, 1e-9, 'moving smoothly')
  assert.strictEqual(player.y, 1)
  $.tick(5)
  assert.closeTo(player.x, 2, 1e-9)
  $.release('ArrowRight')
  $.tick(20)
  assert.strictEqual(player.x, 2, 'it stops on a tile when the key is let go')
  assert.isNull(player.target)
```

Walls should block, and the last key still held should take over.
tr: Duvarlar engellemeli; hâlâ basılı son tuş kontrolü almalı.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  $.press('ArrowUp')
  $.tick(20)
  assert.deepEqual([player.x, player.y], [1, 1], 'walls block')
  $.release('ArrowUp')
  $.press('ArrowRight')
  $.tick(10)
  $.press('ArrowDown')
  $.tick(10)
  assert.deepEqual([player.x, player.y], [2, 1], 'the pillar below blocks')
  $.release('ArrowDown')
  $.tick(10)
  assert.closeTo(player.x, 3, 1e-9, 'the right key is still held')
```

Crates should block too.
tr: Kasalar da engellemeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()

  grid[1][2] = '+'
  $.press('ArrowRight')
  $.tick(20)
  assert.strictEqual(player.x, 1, 'crates block')
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
const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
const ENEMY_STARTS = [[ROWS - 2, COLS - 2], [1, COLS - 2], [ROWS - 2, 1]]

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor
let player // { x, y, target: null or { r, c } }
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

function reset() {
  makeGrid()
  player = { x: 1, y: 1, target: null }
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
