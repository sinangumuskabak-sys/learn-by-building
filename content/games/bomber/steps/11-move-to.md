---
title: Slide towards a target
title_tr: Hedefe doğru kay
skills: [game.state]
---

# --goal--

A player on a grid should not jump from tile to tile but slide. `moveTo` takes one small step towards the target tile;
when it is closer than a step, it snaps onto the tile and drops the target.

# --goal-tr--

Izgara oyununda oyuncu hep bir kareye basar, ama kareden kareye **zıplamamalı**; **kaymalı**. Bunun için hareketi
karardan ayıracağız: bir **hedef** kare seçilir (bir sonraki adım), sonra oyuncu her karede ona doğru küçük bir adım
atar.

`moveTo` o küçük adımı atar: hedefe doğru `speed` kadar. Hedefe bir adımdan yakınsa tam üstüne oturur ve hedefi
bırakır. Düşmanlar da ileride aynı fonksiyonla yürüyecek.

# --code--

```js
const SPEED = 0.1 // tiles per frame

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
```

# --meaning--

- `dx`, `dy` is how far the target is, in tiles.
- If both are within one step, the mover is put exactly on the target, the target is dropped and `return` leaves.
- Otherwise `Math.sign` (1, -1 or 0) moves it one `speed` towards the target on each axis. At 0.1 a tile takes 10
  frames.

# --meaning-tr--

- `const SPEED = 0.1` → oyuncunun karede aldığı yol: 0.1 kare. Bir kare 10 karede (frame) geçilir.
- `const dx = m.target.c - m.x` → hedef ne kadar sağda (eksiyse solda). `dy` aynısı dikeyde.
- `if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {` → iki uzaklık da bir adımdan küçükse (`Math.abs` eksiyi
  atar):
  - `m.x = m.target.c` ve `m.y = m.target.r` → tam hedefin üstüne **otur** (0.1'lik adımlar 1.9999 gibi küsuratlar
    bırakabilir; bu onları temizler).
  - `m.target = null` → hedef yok. `return` → fonksiyondan çık.
- `m.x += Math.sign(dx) * speed` → `Math.sign` sayının yalnız **işaretini** verir: artıysa 1, eksiyse −1, sıfırsa 0.
  Yani hedefe doğru tam `speed` kadar adım.

# --task--

1. Under `TOP` write `SPEED`.
2. Above the `keydown` listener write the comment and `moveTo`.

# --task-tr--

1. `const TOP = ...` satırının altına `SPEED` satırını yaz.
2. `document.addEventListener('keydown', ...)` satırının **üstüne** yorumu ve `moveTo` fonksiyonunu yaz.
3. **Çalıştır**: ekranda fark yok; `moveTo`'yu bir sonraki adımda kullanacağız.

# --tests--

`moveTo` should step towards the target by `speed`.
tr: `moveTo` hedefe doğru `speed` kadar adım atmalı.

```js
assert.strictEqual(SPEED, 0.1)
const m = { x: 1, y: 1, target: { r: 1, c: 2 } }
moveTo(m, 0.25)
assert.closeTo(m.x, 1.25, 1e-9)
assert.strictEqual(m.y, 1)
assert.deepEqual(m.target, { r: 1, c: 2 })
```

Close enough, it should snap onto the target and drop it.
tr: Yeterince yakınken hedefe oturmalı ve hedefi bırakmalı.

```js
const m = { x: 1.95, y: 3, target: { r: 2, c: 2 } }
moveTo(m, 0.1)
assert.strictEqual(m.y, 2.9)
moveTo(m, 0.1)
for (let i = 0; i < 20 && m.target; i++) moveTo(m, 0.1)
assert.deepEqual(m, { x: 2, y: 2, target: null })
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
