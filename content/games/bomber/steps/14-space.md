---
title: Space drops, bombs show
title_tr: Boşluk bırakır, bomba görünür
skills: [game.input, game.canvas]
---

# --goal--

Space calls `dropBomb`, and every bomb is drawn as a black circle, under the player.

# --goal-tr--

Boşluk tuşu bombayı bıraksın ve her bomba ekranda **siyah bir daire** olarak görünsün. Bombaları oyuncudan **önce**
çiziyoruz ki oyuncu bombanın üstünde durunca görünsün.

# --code--

```js
} else if (event.key === ' ') {
  event.preventDefault()
  dropBomb()
}

for (const b of bombs) drawCircle({ x: b.c, y: b.r }, '#020617', 12)
```

# --meaning--

- `else if` adds a second case to the `keydown` listener: `' '` is the Space key.
- `drawCircle` expects something with `x` and `y`; a bomb has `r` and `c`, so we hand it `{ x: b.c, y: b.r }`.

# --meaning-tr--

- `} else if (event.key === ' ') {` → tuş ok değilse **ve** Boşluk'sa (`' '`, tırnak içinde bir boşluk): sayfanın
  kaymasını engelle ve `dropBomb()`'u çağır.
- `for (const b of bombs) drawCircle({ x: b.c, y: b.r }, '#020617', 12)` → her bomba için bir daire. `drawCircle`
  `x` ve `y`'si olan bir şey bekliyor; bombanın ise `r` ve `c`'si var. O yüzden anında küçük bir nesne yapıp
  veriyoruz: `x` sütun, `y` satır.

# --task--

1. In the `keydown` listener, after the arrow block's `}`, add the `else if` for Space.
2. In `draw`, above the player's `drawCircle`, write the bombs line.

# --task-tr--

1. `keydown` dinleyicisinde ok bloğunun kapanan `}` satırını `} else if (event.key === ' ') {` yap; altına iki satırı
   ve kapanan `}`'yi yaz.
2. `draw` içinde oyuncuyu çizen satırın **üstüne** bomba satırını yaz.
3. **Çalıştır**, oyuna tıkla ve Boşluk'a bas.

# --predict--

You press Space three times without moving. How many bombs are on the ground?
- [ ] One
- [x] Three, all on the same tile
  Nothing limits bombs yet. That is the next step.
- [ ] None: they explode at once

# --predict-tr--

Hiç kıpırdamadan Boşluk'a üç kez basıyorsun. Yerde kaç bomba var?
- [ ] Bir
- [x] Üç, hepsi aynı karede
  Henüz bombaları sınırlayan bir şey yok. Sıradaki adım bu.
- [ ] Hiç: hemen patlarlar

# --tests--

Space should drop a bomb on the player's tile.
tr: Boşluk, oyuncunun karesine bomba bırakmalı.

```js
$.press(' ')
assert.deepEqual(bombs.map((b) => [b.r, b.c, b.fuse]), [[1, 1, FUSE]])
```

Bombs should be drawn as black circles, under the player.
tr: Bombalar oyuncunun altında siyah daireler olarak çizilmeli.

```js
bombs.push({ r: 3, c: 5, fuse: 100 })
$.press(' ')
$.tick()
assert.deepInclude($.arcs(), { x: 176, y: 144, r: 12, color: '#020617' })
const colors = $.arcs().map((a) => a.color)
assert.isBelow(colors.indexOf('#020617'), colors.indexOf('#f8fafc'), 'the player is drawn last')
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
