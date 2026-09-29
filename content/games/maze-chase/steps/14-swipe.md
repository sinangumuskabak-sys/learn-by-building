---
title: Swipes on a phone
title_tr: Telefonda kaydırma
skills: [game.input]
---

# --goal--

On a phone there are no arrow keys. Remember where a touch went down; when it comes up, the longer side of the movement
gives the direction. Tiny movements are ignored, so a tap does not steer by accident.

# --goal-tr--

Telefonda ok tuşu yok; parmağı ekranda **kaydırarak** yön vereceğiz. Yöntem:

- Parmak ekrana **değince** nereye değdiğini hatırla.
- Parmak **kalkınca** ne kadar ve hangi yöne kaydığına bak. Yatay kayma dikeyden büyükse sağ ya da sol, değilse
  yukarı ya da aşağı.
- 20 pikselden kısa hareketler **dokunuş** sayılır, yön vermez.

Yönü yine `steer` ile veriyoruz; tuşlarla aynı yol, aynı kurallar.

# --code--

```js
// Touch: swipe in the direction to go.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) steer([Math.sign(dx), 0])
  else steer([0, Math.sign(dy)])
})
```

# --meaning--

- `pointerdown` / `pointerup` fire when a finger (or mouse button) goes down and up.
- `dx`, `dy` are how far it moved; `Math.abs` drops the sign, `Math.max` takes the bigger.
- `Math.sign(dx)` is `1`, `-1` or `0`: exactly a direction number.

# --meaning-tr--

- `let swipeStart = null` → kaydırmanın başladığı nokta; parmak yokken `null`.
- `pointerdown` → parmak (ya da fare tuşu) değince: `clientX`, `clientY` ekrandaki yeri.
- `pointerup` → parmak kalkınca:
  - `if (!swipeStart) return` → başlangıç yoksa (canvas dışında başlamış) bir şey yapma.
  - `dx`, `dy` → yatayda ve dikeyde ne kadar kaydı.
  - `Math.abs(dx)` → **mutlak değer**: işaretsiz uzunluk. `Math.max(...)` → iki sayıdan büyüğü. 20'den kısaysa
    dokunuştur: `return`.
  - `Math.abs(dx) > Math.abs(dy)` → yatay kayma daha uzunsa yatay yön.
  - `Math.sign(dx)` → sayının **işareti**: artıysa `1`, eksiyse `-1`. Tam bir yön sayısı: sağa kaydırma `[1, 0]`.

# --task--

Under the key listener, leave an empty line and write the touch code.

# --task-tr--

1. Tuş dinleyicisinin kapanan `})`'sinin altına bir boş satır bırak ve yorumla birlikte dokunma kodunu yaz.
2. **Çalıştır**. Fareyle de deneyebilirsin: oyun alanında basılı tutup sürükle ve bırak.

# --tests--

A swipe should steer, and a tap should not.
tr: Kaydırma yönlendirmeli, dokunuş yönlendirmemeli.

```js
$.pointerDown(200, 300)
$.pointerUp(205, 304)
assert.deepEqual(player.want, [0, 0], 'a tap is ignored')
$.pointerDown(200, 300)
$.pointerUp(140, 310)
assert.deepEqual(player.want, [-1, 0])
$.tick(8)
assert.strictEqual(player.col, 8)
```

A mostly vertical swipe should steer up or down.
tr: Çoğunlukla dikey bir kaydırma yukarı ya da aşağı yönlendirmeli.

```js
$.pointerDown(200, 300)
$.pointerUp(190, 250)
assert.deepEqual(player.want, [0, -1])
```

# --solution--

```js
// Maze chase, step by step.
// The page already has <canvas id="game" width="456" height="544"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 24
const TOP = 40 // room for the score and the lives
// # wall, - the ghost house, . pellet, o power pellet, P player start. Row 9 is a tunnel: its ends are open.
const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '   #.#       #.#   ',
  '####.# #---# #.####',
  '    .  #---#  .    ',
  '####.# ##### #.####',
  '   #.#       #.#   ',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const ROWS = MAZE.length
const COLS = MAZE[0].length
// Checked in this order, so ties go to up, then left, then down.
const DIRECTIONS = { ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] }
const STOP = [0, 0]
const PLAYER_FRAMES = 8 // frames the player needs to cross one tile

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player

const key = (col, row) => col + ',' + row
const wrap = (col) => (col + COLS) % COLS

function isWall(col, row) {
  const ch = MAZE[row][wrap(col)]
  return ch === '#' || ch === '-'
}

function canGo(e, dir) {
  return !isWall(e.col + dir[0], e.row + dir[1])
}

const same = (a, b) => a[0] === b[0] && a[1] === b[1]
const reverse = (dir) => [-dir[0], -dir[1]]

function fillPellets() {
  pellets = new Set()
  powers = new Set()
  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '.') pellets.add(key(col, row))
      if (ch === 'o') powers.add(key(col, row))
    })
  })
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
}

function reset() {
  fillPellets()
  placeActors()
}

// Where an actor is drawn: its tile plus how far it has come towards the next one.
function position(e) {
  return { x: e.col + (e.dir[0] * e.progress) / e.frames, y: e.row + (e.dir[1] * e.progress) / e.frames }
}

// One frame of movement. Directions are only chosen at the center of a tile, by `choose`.
function advance(e, choose) {
  if (e.progress === 0) choose(e)
  if (same(e.dir, STOP)) return
  e.progress += 1
  if (e.progress < e.frames) return
  e.progress = 0
  e.col = wrap(e.col + e.dir[0])
  e.row += e.dir[1]
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
}

// Turning around in the middle of a tile: step into the next tile and walk back the rest of the way.
function turnAround(e) {
  if (e.progress === 0 || same(e.dir, STOP)) {
    e.dir = reverse(e.dir)
    return
  }
  e.col = wrap(e.col + e.dir[0])
  e.row += e.dir[1]
  e.dir = reverse(e.dir)
  e.progress = e.frames - e.progress
}

function steer(dir) {
  player.want = dir
  if (same(dir, reverse(player.dir)) && !same(dir, STOP)) turnAround(player)
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
})

// Touch: swipe in the direction to go.
let swipeStart = null
canvas.addEventListener('pointerdown', (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
canvas.addEventListener('pointerup', (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) steer([Math.sign(dx), 0])
  else steer([0, Math.sign(dy)])
})

function update() {
  advance(player, choosePlayer)
}

function draw() {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  MAZE.forEach((line, row) => {
    ;[...line].forEach((ch, col) => {
      if (ch === '#') {
        ctx.fillStyle = '#1d4ed8'
        ctx.fillRect(col * TILE + 2, TOP + row * TILE + 2, TILE - 4, TILE - 4)
      }
      if (ch === '-') {
        ctx.fillStyle = '#312e81'
        ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
      }
    })
  })

  ctx.fillStyle = '#fde68a'
  for (const k of pellets) {
    const [col, row] = k.split(',').map(Number)
    ctx.fillRect(col * TILE + 10, TOP + row * TILE + 10, 4, 4)
  }
  for (const k of powers) {
    const [col, row] = k.split(',').map(Number)
    ctx.beginPath()
    ctx.arc(col * TILE + TILE / 2, TOP + row * TILE + TILE / 2, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
