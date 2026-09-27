---
title: The stairs out
title_tr: Dışarı çıkan merdiven
skills: [game.state]
---

# --explanation--

Behind the locked door, the last room hides the stairs out. Stepping on them wins, and the time is the score: as in the 3D
maze, the best time is the **lowest**, saved in `localStorage`.

With that the adventure is complete: rooms written as text, walking with wall sliding, moving between rooms through gaps that
line up, a sword that is just a box, enemies with a small state machine, hearts with invulnerability and knockback, keys and a
door, and a world that remembers what you took. Most top-down adventure games are these same pieces, with more rooms.

# --explanation-tr--

Kilitli kapının arkasında son oda dışarı çıkan merdiveni saklar. Üstüne basmak kazandırır ve süre skordur: 3B labirentteki gibi en iyi
süre **en düşük** olandır, `localStorage`'a kaydedilir.

Bununla macera tamamlandı: metin olarak yazılan odalar, duvar boyunca kayarak yürümek, hizalı boşluklardan odalar arasında geçmek,
yalnızca bir kutu olan bir kılıç, küçük bir durum makinesiyle düşmanlar, dokunulmazlık ve geri itmeyle kalpler, anahtarlar ve bir kapı,
ve aldıklarını hatırlayan bir dünya. Yukarıdan bakışlı macera oyunlarının çoğu, daha fazla odayla, aynı parçalardır.

# --task--

1. Add `frames` (`0` in `reset()`, 1 more every playing frame) and `best` from `localStorage` `'dungeon-best'`.
2. An `E` under the middle of the player sets the state to `'won'`, and saves the time as `best` if it is the first or a faster
   one.
3. Draw an `E` as a `'#1c1917'` square 4 pixels inside its tile. At the top right, `Time 12.3` and, once there is one,
   `  Best 9.8`. When won, the message is `You escaped in 12.3 s!`.

# --task-tr--

1. `frames` (`reset()`'te `0`, oynanan her karede 1 fazla) ve `localStorage` `'dungeon-best'`'ten `best` ekle.
2. Oyuncunun ortasının altındaki bir `E` durumu `'won'` yapar ve süre ilkse ya da daha hızlıysa onu `best` olarak kaydeder.
3. Bir `E`'yi karosunun 4 piksel içinde `'#1c1917'` bir kare olarak çiz. Sağ üste `Time 12.3` ve bir tane olunca `  Best 9.8`. Kazanınca
   mesaj `You escaped in 12.3 s!` olur.

# --tests--

Reaching the stairs should win and record the time.
tr: Merdivene ulaşmak kazandırmalı ve süreyi kaydetmeli.

```js
enter(1, 1)
enemies = []
frames = 599
player.x = 7 * T + 5
player.y = 5 * T + 5
$.tick(1)
assert.strictEqual(state, 'won')
assert.strictEqual(best, 600)
assert.strictEqual(localStorage.getItem('dungeon-best'), '600')
assert.include($.texts(), 'You escaped in 10.0 s!')
$.press(' ')
assert.deepEqual([state, frames], ['playing', 0])
$.tick(1)
assert.include($.texts(), 'Time 0.0  Best 10.0')
```

A slower escape should not replace the best time.
tr: Daha yavaş bir kaçış en iyi süreyi değiştirmemeli.

```js
best = 300
enter(1, 1)
enemies = []
player.x = 7 * T + 5
player.y = 5 * T + 5
frames = 500
$.tick(1)
assert.strictEqual(state, 'won')
assert.strictEqual(best, 300)
```

# --solution--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
const SIZE = 22 // the player's and the enemies' bodies
const SPEED = 2.5
// Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
// A gap in the wall at the edge of a room leads to the room next to it.
const ROOMS = [
  [
    [
      '###############',
      '#.............#',
      '#..P..........#',
      '#....###......#',
      '#....#.....e..#',
      '#....#.........',
      '#.............#',
      '#..........h..#',
      '#.............#',
      '#.............#',
      '#######.#######',
    ],
    [
      '###############',
      '#.............#',
      '#..e......e...#',
      '#....#####....#',
      '#.............#',
      '..............#',
      '#.............#',
      '#...##...##...#',
      '#.......e.....#',
      '#.............#',
      '#######D#######',
    ],
  ],
  [
    [
      '#######.#######',
      '#.............#',
      '#..e..........#',
      '#...#######...#',
      '#.............#',
      '#.....k.......#',
      '#.............#',
      '#...#######...#',
      '#..........e..#',
      '#.............#',
      '###############',
    ],
    [
      '#######.#######',
      '#.............#',
      '#.e.........e.#',
      '#.............#',
      '#....#####....#',
      '#....#.E.#....#',
      '#....#...#....#',
      '#.............#',
      '#......e......#',
      '#.............#',
      '###############',
    ],
  ],
]
const COLS = 15
const ROWS = 11
const DIRS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let taken // what has been picked up or opened in each room, so it stays that way
let room // { rx, ry }: which room we are in
let player
let enemies
let swing // frames left of the sword swing
let hearts
let keysHeld
let hurt // frames the player cannot be hurt again
let state // 'playing', 'won' or 'over'
let frames
let best = Number(localStorage.getItem('dungeon-best')) || 0
const held = {}

function reset() {
  taken = new Set()
  hearts = 3
  keysHeld = 0
  hurt = 0
  swing = 0
  frames = 0
  state = 'playing'
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

// Load a room: its tiles (minus what was already taken), and fresh enemies on its e tiles.
function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line, row) =>
    [...line].map((ch, col) => (taken.has(rx + ',' + ry + ',' + col + ',' + row) ? '.' : ch === 'P' || ch === 'e' ? '.' : ch)),
  )
  enemies = []
  ROOMS[ry][rx].forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch !== 'e') return
      const x = col * T + (T - SIZE) / 2
      enemies.push({ x, y: row * T + (T - SIZE) / 2, dir: [1, 0], turnIn: 0, hp: 1, knock: 0, kx: 0, ky: 0 })
    })
  })
}

const solidTile = (ch) => ch === '#' || ch === 'D'

// Does a box at (x, y) overlap a wall? Outside the room counts as open, so the player can walk out of a gap.
function blocked(x, y) {
  for (const [cx, cy] of [[x, y], [x + SIZE - 1, y], [x, y + SIZE - 1], [x + SIZE - 1, y + SIZE - 1]]) {
    const row = Math.floor(cy / T)
    const col = Math.floor(cx / T)
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && solidTile(tiles[row][col])) return true
  }
  return false
}

// Move a body, one axis at a time, stopping at walls. Returns true if it was stopped.
function move(body, dx, dy) {
  let stopped = false
  if (blocked(body.x + dx, body.y)) stopped = true
  else body.x += dx
  if (blocked(body.x, body.y + dy)) stopped = true
  else body.y += dy
  return stopped
}

document.addEventListener('keydown', (event) => {
  held[event.key] = true
  if (DIRS[event.key] || event.key === ' ') event.preventDefault()
  if (event.key === ' ' && !event.repeat) {
    if (state !== 'playing') reset()
    else if (swing === 0) swing = 12
  }
})
document.addEventListener('keyup', (event) => {
  held[event.key] = false
})

// Touch: the pad in the corner moves, a tap anywhere else swings the sword.
const PAD = { x: 70, y: 330, r: 60 }
let padDir = null
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (state !== 'playing') {
    reset()
    return
  }
  const dx = x - PAD.x
  const dy = y - PAD.y
  if (Math.hypot(dx, dy) < PAD.r) padDir = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
  else if (swing === 0) swing = 12
})
canvas.addEventListener('pointerup', () => {
  padDir = null
})

// The sword: a box from the middle of the player out to 30 pixels in front, so it also hits an enemy right on top of you.
function swordBox() {
  const [dx, dy] = player.dir
  const cx = player.x + SIZE / 2 + dx * 15
  const cy = player.y + SIZE / 2 + dy * 15
  const w = dx ? 30 : 8
  const h = dy ? 30 : 8
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
const box = (body) => ({ x: body.x, y: body.y, w: SIZE, h: SIZE })

function update() {
  if (state !== 'playing') return
  frames += 1
  if (hurt > 0) hurt -= 1

  let dir = padDir
  for (const key in DIRS) if (held[key]) dir = DIRS[key]
  if (dir && swing === 0) {
    player.dir = dir
    move(player, dir[0] * SPEED, dir[1] * SPEED)
  }

  // Walking out through a gap in the wall: into the next room, on the opposite side.
  const cx = player.x + SIZE / 2
  const cy = player.y + SIZE / 2
  if (cx < 0 || cx > COLS * T || cy < 0 || cy > ROWS * T) {
    const rx = room.rx + (cx < 0 ? -1 : cx > COLS * T ? 1 : 0)
    const ry = room.ry + (cy < 0 ? -1 : cy > ROWS * T ? 1 : 0)
    if (cx < 0) player.x += COLS * T - 4
    if (cx > COLS * T) player.x -= COLS * T - 4
    if (cy < 0) player.y += ROWS * T - 4
    if (cy > ROWS * T) player.y -= ROWS * T - 4
    enter(rx, ry)
    return
  }

  // Things on the tile under the middle of the player.
  const col = Math.floor(cx / T)
  const row = Math.floor(cy / T)
  const here = tiles[row][col]
  const id = room.rx + ',' + room.ry + ',' + col + ',' + row
  if (here === 'k' || here === 'h') {
    if (here === 'k') keysHeld += 1
    else hearts = Math.min(3, hearts + 1)
    tiles[row][col] = '.'
    taken.add(id)
  }
  if (here === 'E') {
    state = 'won'
    if (best === 0 || frames < best) {
      best = frames
      localStorage.setItem('dungeon-best', best)
    }
  }
  // A locked door right in front of you opens with a key.
  const [dx, dy] = player.dir
  const fc = Math.floor((cx + dx * T * 0.6) / T)
  const fr = Math.floor((cy + dy * T * 0.6) / T)
  if (tiles[fr] && tiles[fr][fc] === 'D' && keysHeld > 0) {
    keysHeld -= 1
    tiles[fr][fc] = '.'
    taken.add(room.rx + ',' + room.ry + ',' + fc + ',' + fr)
  }

  if (swing > 0) swing -= 1
  const sword = swing > 0 ? swordBox() : null

  for (const e of enemies) {
    if (e.knock > 0) {
      // Knocked back: slide away from the sword for a few frames.
      e.knock -= 1
      move(e, e.kx, e.ky)
    } else {
      const ex = e.x + SIZE / 2 - cx
      const ey = e.y + SIZE / 2 - cy
      if (Math.hypot(ex, ey) < 4 * T) {
        // Close: chase the player along the longer axis.
        e.dir = Math.abs(ex) > Math.abs(ey) ? [-Math.sign(ex), 0] : [0, -Math.sign(ey)]
        move(e, e.dir[0] * 1.1, e.dir[1] * 1.1)
      } else {
        // Far: wander, turning at random now and then or when a wall is in the way.
        e.turnIn -= 1
        const stuck = move(e, e.dir[0], e.dir[1])
        if (stuck || e.turnIn <= 0) {
          e.dir = Object.values(DIRS)[Math.floor(Math.random() * 4)]
          e.turnIn = 40 + Math.floor(Math.random() * 60)
        }
      }
    }
    if (sword && e.knock === 0 && overlap(sword, box(e))) {
      e.hp -= 1
      e.knock = 10
      e.kx = player.dir[0] * 4
      e.ky = player.dir[1] * 4
    }
    if (e.hp > 0 && hurt === 0 && overlap(box(e), box(player))) {
      hearts -= 1
      hurt = 60
      if (hearts === 0) state = 'over'
      // Both bounce apart, so an enemy cannot stay stuck on top of you.
      const ax = Math.sign(player.x - e.x) || 1
      const ay = Math.sign(player.y - e.y)
      const horizontal = Math.abs(player.x - e.x) >= Math.abs(player.y - e.y)
      for (let i = 0; i < 6; i++) move(player, horizontal ? ax * 4 : 0, horizontal ? 0 : ay * 4)
      e.knock = 10
      e.kx = horizontal ? -ax * 3 : 0
      e.ky = horizontal ? 0 : -ay * 3
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(0, TOP)
  tiles.forEach((line, row) => {
    line.forEach((ch, col) => {
      const x = col * T
      const y = row * T
      ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
      ctx.fillRect(x, y, T, T)
      if (ch === 'D') {
        ctx.fillStyle = '#92400e'
        ctx.fillRect(x + 2, y + 2, T - 4, T - 4)
      }
      if (ch === 'k') {
        ctx.fillStyle = '#eab308'
        ctx.fillRect(x + 10, y + 8, 12, 16)
      }
      if (ch === 'h') {
        ctx.fillStyle = '#e11d48'
        ctx.fillRect(x + 9, y + 9, 14, 14)
      }
      if (ch === 'E') {
        ctx.fillStyle = '#1c1917'
        ctx.fillRect(x + 4, y + 4, T - 8, T - 8)
      }
    })
  })

  for (const e of enemies) {
    ctx.fillStyle = e.knock > 0 ? '#fca5a5' : '#7c3aed'
    ctx.fillRect(e.x, e.y, SIZE, SIZE)
  }
  // The player blinks while it cannot be hurt.
  if (hurt === 0 || Math.floor(hurt / 5) % 2 === 0) {
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(player.x, player.y, SIZE, SIZE)
  }
  if (swing > 0) {
    const s = swordBox()
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(s.x, s.y, s.w, s.h)
  }
  ctx.restore()

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < hearts ? '#e11d48' : '#44403c'
    ctx.fillRect(12 + i * 26, 14, 20, 20)
  }
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Keys ' + keysHeld, 100, 30)
  ctx.textAlign = 'right'
  const seconds = (f) => (f / 60).toFixed(1)
  ctx.fillText('Time ' + seconds(frames) + (best ? '  Best ' + seconds(best) : ''), canvas.width - 12, 30)

  // The touch pad, faint, in the corner.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(PAD.x, PAD.y, PAD.r, 0, Math.PI * 2)
  ctx.stroke()

  if (state !== 'playing') {
    ctx.fillStyle = 'rgba(12, 10, 9, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(state === 'won' ? 'You escaped in ' + seconds(frames) + ' s!' : 'Game over', canvas.width / 2, 190)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, 222)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
