---
title: A ghost never turns back
title_tr: Hayalet geri dönmez
skills: [game.state, prog.arrays]
---

# --goal--

The ghost will walk with the same `advance` as the player; it only needs its own `choose` function: `chooseGhost`.
At each tile center it lists the open directions **except backwards** and, for now, takes the first. It turns back
only at a dead end. `ghostFrames` makes it a little slower than the player (9 frames a tile).

# --goal-tr--

Hayaleti yürütmek için yeni bir hareket kodu yazmamıza gerek yok: `advance` zaten hazır! Hayalete yalnız **kendi yön
seçme fonksiyonunu** vereceğiz: `chooseGhost`.

Hayalet beyninin ilk kuralı: her döşeme ortasında açık yönleri listele, ama **geri dönmeyi** listeye koyma. Hayalet
ancak başka yolu yoksa (çıkmaz sokakta) geri döner. Bu kural onun iki döşeme arasında titreyip durmasını önler.
Şimdilik listedeki **ilk** yolu seçecek; akıllı seçimi birazdan yapacağız.

Hız: hayalet bir döşemeyi 9 karede geçsin, oyuncudan (8) biraz yavaş. Bunu `ghostFrames` söyleyecek.

# --code--

```js
// Frames a ghost needs to cross one tile (the player always needs PLAYER_FRAMES): smaller is faster.
function ghostFrames(g) {
  return 9
}

function chooseGhost(g) {
  g.frames = ghostFrames(g)
  // Ghosts never turn back on their own: only the open ways that are not backwards.
  const options = Object.values(DIRECTIONS).filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))
  if (options.length === 0) {
    g.dir = reverse(g.dir)
    return
  }
  g.dir = options[0]
}
```

# --meaning--

- `Object.values(DIRECTIONS)` is the list of the four directions, in the order up, left, down, right.
- `filter` keeps the ones that are open and not the reverse of the current direction.
- With no options (a dead end) the ghost turns back.

# --meaning-tr--

- `ghostFrames(g)` → hayaletin bir döşemeyi kaç karede geçeceği. Şimdilik hep 9; ileride korkunca ve bölüm
  ilerleyince değişecek.
- `g.frames = ghostFrames(g)` → her döşeme ortasında hızını yeniden sor.
- `Object.values(DIRECTIONS)` → nesnenin **değerlerinden** bir liste: dört yön, yukarı-sol-aşağı-sağ sırasıyla.
- `.filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))` → açık olan **ve** geri dönüş olmayan yönler.
- `options.length === 0` → hiç seçenek yoksa geri dön.
- `g.dir = options[0]` → şimdilik ilk seçenek.

# --task--

1. Above `placeActors`, write the comment and `ghostFrames`.
2. Under `choosePlayer`, write `chooseGhost`.

# --task-tr--

1. `function placeActors() {` satırının **üstüne** yorumu ve `ghostFrames` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. `choosePlayer` fonksiyonunun altına bir boş satır bırakıp `chooseGhost`'u yaz.
3. **Çalıştır**. Hayalet henüz yürümüyor; kontroller `chooseGhost`'u elle çağıracak.

# --hint--

`reverse(g.dir)` must be compared with `same`, not `===`: two arrays are never `===`.

# --hint-tr--

Geri yönü `same` ile karşılaştır, `===` ile değil: iki dizi hiçbir zaman `===` olmaz. `ghostFrames`'i `placeActors`'ın
üstüne yazdığından emin ol.

# --tests--

At a crossing the ghost should pick an open way, never the way back.
tr: Kavşakta hayalet açık bir yol seçmeli, asla geri dönüşü değil.

```js
const red = ghosts[0]
chooseGhost(red) // on (9, 7), heading left: up and down are walls, right would be backwards
assert.deepEqual(red.dir, [-1, 0])
assert.strictEqual(red.frames, 9)
Object.assign(red, { col: 4, row: 9, dir: [0, -1] }) // came up into the crossing at (4, 9)
chooseGhost(red)
assert.deepEqual(red.dir, [0, -1], 'up is still open and comes first')
red.dir = [0, 1]
chooseGhost(red)
assert.deepEqual(red.dir, [-1, 0], 'coming down, up would be backwards: left comes next')
```

With nowhere else to go, the ghost should turn back.
tr: Başka yolu yoksa hayalet geri dönmeli.

```js
const red = ghosts[0]
Object.assign(red, { col: 1, row: 1, dir: [-1, 0] }) // the top left corner, arriving from the right
chooseGhost(red)
assert.deepEqual(red.dir, [0, 1], 'it turns the corner')
Object.assign(red, { col: 9, row: 9, dir: [0, 1] }) // inside the house: no way out at all
chooseGhost(red)
assert.isTrue(same(red.dir, [0, -1]))
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
const EXIT = { col: 9, row: 7 } // the tile just above the ghost house
const GHOSTS = [{ name: 'red', color: '#ef4444' }]

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player
let ghosts
let score
let level

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

// Frames a ghost needs to cross one tile (the player always needs PLAYER_FRAMES): smaller is faster.
function ghostFrames(g) {
  return 9
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
  ghosts = GHOSTS.map((g) => ({ ...g, col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0, frames: 10 }))
}

function reset() {
  score = 0
  level = 1
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
  arrive(e)
}

function arrive(e) {
  if (e !== player) return
  const here = key(player.col, player.row)
  if (pellets.delete(here)) score += 10
  if (powers.delete(here)) score += 50
  if (pellets.size === 0 && powers.size === 0) {
    level += 1
    fillPellets()
    placeActors()
  }
}

function choosePlayer(p) {
  // The wanted direction is remembered, so a turn pressed early happens at the next corner.
  if (!same(p.want, STOP) && canGo(p, p.want)) p.dir = p.want
  else if (!canGo(p, p.dir)) p.dir = STOP
}

function chooseGhost(g) {
  g.frames = ghostFrames(g)
  // Ghosts never turn back on their own: only the open ways that are not backwards.
  const options = Object.values(DIRECTIONS).filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))
  if (options.length === 0) {
    g.dir = reverse(g.dir)
    return
  }
  g.dir = options[0]
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

  for (const g of ghosts) {
    const q = position(g)
    ctx.fillStyle = g.color
    ctx.fillRect(q.x * TILE + 3, TOP + q.y * TILE + 3, TILE - 6, TILE - 6)
  }

  const p = position(player)
  ctx.fillStyle = '#facc15'
  ctx.beginPath()
  ctx.arc(p.x * TILE + TILE / 2, TOP + p.y * TILE + TILE / 2, 10, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 10, 27)
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level, canvas.width - 10, 27)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
