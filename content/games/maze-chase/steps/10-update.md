---
title: Move every frame
title_tr: Her karede hareket
skills: [game.loop]
---

# --goal--

`update` runs once per frame and advances the player. The player's `choose` function, `choosePlayer`, stops it in
front of a wall. The loop calls `update` before `draw`.

# --goal-tr--

Şimdi `advance`'i her karede çağıralım. Oyun döngüsü artık iki iş yapacak: önce **güncelle** (`update`: herkesi bir
kare ilerlet), sonra **çiz**.

Oyuncunun yön seçen fonksiyonu `choosePlayer` olacak. İlk hâli çok basit: önü duvarsa **dur**.

# --code--

```js
function choosePlayer(p) {
  if (!canGo(p, p.dir)) p.dir = STOP
}

function update() {
  advance(player, choosePlayer)
}

function loop() {
  update()
  draw()
```

# --meaning--

- `choosePlayer` is what `advance` calls at each tile center: if the way ahead is a wall, the player stops.
- `update` moves the player one frame; `loop` now updates, then draws.

# --meaning-tr--

- `function choosePlayer(p) {` → oyuncunun yön seçimi. `advance` her döşeme ortasında onu çağıracak.
- `if (!canGo(p, p.dir)) p.dir = STOP` → gittiği yön kapalıysa **dur**.
- `function update() {` → her karede bir kez: oyuncuyu bir kare ilerlet. `advance`'e `choosePlayer`'ı **parantezsiz**
  veriyoruz: çağırmıyoruz, fonksiyonun kendisini veriyoruz.
- `loop` içindeki `update()` → önce güncelle, sonra çiz.

# --task--

1. Under `advance`, leave an empty line and write `choosePlayer`.
2. Above `function draw() {` write `update`.
3. In `loop`, above `draw()`, write `update()`.

# --task-tr--

1. `advance` fonksiyonunun altına bir boş satır bırakıp `choosePlayer`'ı yaz.
2. `function draw() {` satırının **üstüne** `update` fonksiyonunu yaz; altında bir boş satır kalsın.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır**.

# --predict--

You press Run. Does the player move?
- [ ] Yes, to the left
- [x] No: its `dir` is `STOP`, and nothing changes it yet
  The checks set `dir` by hand; the arrow keys come next.
- [ ] It jumps to a wall

# --predict-tr--

Çalıştır'a basıyorsun. Oyuncu hareket eder mi?
- [ ] Evet, sola
- [x] Hayır: `dir`'i `STOP` ve onu değiştiren bir şey henüz yok
  Kontroller `dir`'i elle ayarlıyor; ok tuşları bir sonraki adımda.
- [ ] Bir duvara zıplar

# --tests--

A moving player should cross a tile in 8 frames.
tr: Hareket eden oyuncu bir döşemeyi 8 karede geçmeli.

```js
player.dir = [-1, 0]
$.tick(8)
assert.deepEqual([player.col, player.progress], [8, 0])
```

The player should stop in front of a wall.
tr: Oyuncu bir duvarın önünde durmalı.

```js
player.dir = [-1, 0]
$.tick(80)
assert.deepEqual([player.col, player.row], [4, 15])
assert.deepEqual(player.dir, [0, 0])
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
  if (!canGo(p, p.dir)) p.dir = STOP
}

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

  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(player.col * TILE + TILE / 2, TOP + player.row * TILE + TILE / 2, 10, 0, Math.PI * 2)
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
