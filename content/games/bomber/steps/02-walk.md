---
title: Walking from tile to tile
title_tr: Kareden kareye yürümek
skills: [game.input, game.state]
---

# --explanation--

In a grid game the player always stands **on a tile**, but should not jump from tile to tile. The trick is to separate the
decision from the movement:

1. When the player is exactly on a tile, look at the arrow key held and pick the **target**: the next tile that way, if it
   is floor.
2. Then slide towards the target by `SPEED` each frame. When it is closer than one step, snap exactly onto it and drop the
   target.

Positions are in **tiles**, not pixels (`x = 2.5` is halfway between columns 2 and 3), so the rules can talk about rows and
columns, and only drawing multiplies by `TILE`.

Which key wins when two are held? The one pressed **last**, as players expect. We keep the held keys in a list: `keydown`
adds a key at the end, `keyup` removes it, and the last item is the one in charge. Letting go of it gives control back to the
key still held.

Doing the decision and the first bit of movement **in the same frame** matters: if choosing the next tile took a frame of its
own, the player would stutter at every tile.

# --explanation-tr--

Izgara oyununda oyuncu her zaman **bir karenin üstünde** durur ama kareden kareye zıplamamalıdır. Numara, kararı hareketten
ayırmaktır:

1. Oyuncu tam bir karenin üstündeyken basılı tutulan ok tuşuna bak ve **hedefi** seç: o yöndeki sonraki kare, zeminse.
2. Sonra her karede hedefe doğru `SPEED` kadar kay. Bir adımdan yakınsa tam üstüne otur ve hedefi bırak.

Konumlar piksel değil **kare** cinsindendir (`x = 2.5`, 2. ve 3. sütunların tam ortasıdır); böylece kurallar satır ve
sütunlarla konuşabilir, yalnızca çizim `TILE` ile çarpar.

İki tuş basılıyken hangisi kazanır? Oyuncuların beklediği gibi **en son** basılan. Basılı tuşları bir listede tutarız:
`keydown` sona bir tuş ekler, `keyup` onu çıkarır ve son öğe sözü söyleyendir. Onu bırakmak kontrolü hâlâ basılı olan tuşa geri
verir.

Kararın ve hareketin ilk parçasının **aynı karede** yapılması önemlidir: sonraki kareyi seçmek kendi başına bir kare sürseydi,
oyuncu her karede takılırdı.

# --task--

1. Add `SPEED = 0.1`, `DIRS` (each arrow key to `[dr, dc]`), `player` (`{ x: 1, y: 1, target: null }` in `reset()`) and
   `held` (`[]`).
2. Write `walkable(r, c)` (the tile is floor) and `moveTo(m, speed)`: move `m` towards `m.target` by `speed` on each axis
   (`Math.sign`), or, when both distances are within `speed`, put it exactly on the target and set `target = null`.
3. Write `updatePlayer()`: with no target, if the last held key leads to a walkable tile, make it the target; then, with a
   target, `moveTo(player, SPEED)`. Call it from `update()`, before `draw()`.
4. `keydown` of an arrow adds it to `held` if it is not there (`preventDefault()`); `keyup` removes it.
5. Draw the player as a `'#f8fafc'` circle of radius 12 in the middle of its position.

# --task-tr--

1. `SPEED = 0.1`, `DIRS` (her ok tuşundan `[dr, dc]`'ye), `player` (`reset()`'te `{ x: 1, y: 1, target: null }`) ve `held`
   (`[]`) ekle.
2. `walkable(r, c)` (kare zemin) ve `moveTo(m, speed)` yaz: `m`'yi her eksende `speed` kadar `m.target`'a doğru ilerlet
   (`Math.sign`), ya da iki uzaklık da `speed` içindeyse onu tam hedefe koy ve `target = null` yap.
3. `updatePlayer()` yaz: hedef yokken, son basılı tuş yürünebilir bir kareye çıkıyorsa onu hedef yap; sonra hedef varsa
   `moveTo(player, SPEED)`. Onu `draw()`'dan önce `update()`'ten çağır.
4. Bir okun `keydown`'ı, yoksa onu `held`'e ekler (`preventDefault()`); `keyup` onu çıkarır.
5. Oyuncuyu konumunun ortasında 12 yarıçaplı `'#f8fafc'` bir daire olarak çiz.

# --tests--

Holding a key should slide the player to the next tile, and it should stop on a tile when let go.
tr: Bir tuşu basılı tutmak oyuncuyu sonraki kareye kaydırmalı ve bırakılınca bir karede durmalı.

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
tr: Duvarlar engellemeli ve hâlâ basılı olan son tuş kontrolü almalı.

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

Crates should block too, and the player should be drawn where it is.
tr: Sandıklar da engellemeli ve oyuncu bulunduğu yerde çizilmeli.

```js
const open = () => {
  grid = grid.map((row) => row.map((t) => (t === '+' ? ' ' : t)))
}
open()
grid[1][2] = '+'
$.press('ArrowRight')
$.tick(20)
assert.strictEqual(player.x, 1, 'crates block')
$.release('ArrowRight')
player.x = 3
$.tick(1)
assert.deepInclude($.arcs(), { x: 3 * 32 + 16, y: 32 + 32 + 16, r: 12, color: '#f8fafc' })
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
