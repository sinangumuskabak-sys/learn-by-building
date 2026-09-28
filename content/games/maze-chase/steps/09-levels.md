---
title: Faster levels and a best score
title_tr: Hızlanan bölümler ve en iyi skor
skills: [game.state]
---

# --explanation--

A cleared maze should not simply start over the same: every level the ghosts get **faster** and the power pellets
**shorter**. Two small formulas do it, each with a limit so the game stays possible:

```js
Math.max(8, 10 - level)                       // ghost frames per tile: 9, then 8, never faster than the player
Math.max(120, 420 - 60 * (level - 1))         // scared frames: 7 s, 6 s, 5 s ... never under 2 s
```

`Math.max` as a **floor** is a pattern worth remembering: it lets a value shrink with the level but never past the point
where the game would break.

Finally the best score is kept in `localStorage` and shown next to the score. With that the game is complete: a maze
from text, smooth grid movement, buffered turns, four ghost personalities with scatter and chase, power pellets, lives
and levels.

# --explanation-tr--

**Bu adımda:** oyunu tamamlayacağız. Her yeni bölümde hayaletler hızlanacak, büyük yemlerin etkisi kısalacak. En iyi
skorun da kaydedilip sol üstte puanının yanında (`Best`) görünecek.

**Bölümle zorlaşmak.** Temizlenen labirent aynen yeniden başlamamalı. İki küçük formül bunu yapar; her birinin bir sınırı
var ki oyun oynanabilir kalsın:

```js
Math.max(8, 10 - level)                 // hayaletin bir kareyi geçtiği kare: 9, sonra 8, asla oyuncudan hızlı değil
Math.max(120, 420 - 60 * (level - 1))   // korku süresi: 7 sn, 6 sn, 5 sn ... asla 2 sn'nin altında değil
```

`Math.max(a, b)` iki sayıdan **büyüğünü** verir. Burada bir **taban** gibi çalışır: 1. bölümde `10 - 1` = 9 ve 8'den
büyük, 9 kullanılır; 5. bölümde `10 - 5` = 5 ama 8'den küçük, 8 kullanılır. Yani değer bölümle küçülür ama oyunun
bozulacağı noktanın altına asla inmez. Hatırlamaya değer bir kalıp. Oyuncu bir kareyi 8 karede geçtiği için hayalet
hiçbir zaman ondan hızlı olmaz.

**En iyi skor.** `localStorage` tarayıcının küçük defteridir; sayfa kapansa bile içindekini unutmaz.

- `localStorage.getItem('maze-best')` → `'maze-best'` adıyla yazılanı oku (hiç yazılmamışsa `null`, boş).
- `Number(...)` → okunan yazıyı sayıya çevirir; `|| 0` → "boş ya da geçersizse 0 kullan".
- `localStorage.setItem('maze-best', best)` → deftere yaz.

Oyun bittiğinde (`state = 'over'`) puan rekordan büyükse (`score > best`) rekor güncellenir ve kaydedilir.

Bununla oyun tamam: yazıdan labirent, akıcı ızgara hareketi, tamponlanmış dönüşler, dağılma ve kovalamalı dört hayalet
kişiliği, güç yemleri, canlar ve bölümler.

# --task--

1. `ghostFrames`: a scared ghost still needs `16`, otherwise `Math.max(8, 10 - level)`.
2. `frighten`: `scaredFor = Math.max(120, 420 - 60 * (level - 1))`.
3. Add `let best = Number(localStorage.getItem('maze-best')) || 0`. When the game ends with a higher score, save it under
   `'maze-best'`.
4. Draw `Score: 120  Best: 3400` at the top left.

# --task-tr--

1. `let chain ...` satırının hemen altına en iyi skoru okuyan satırı ekle:

   ```js
   let best = Number(localStorage.getItem('maze-best')) || 0
   ```

2. `ghostFrames` fonksiyonunun son satırını değiştir:

   ```js
   function ghostFrames(g) {
     if (g.scared) return 16
     return Math.max(8, 10 - level) // ← değişti (eskiden return 9)
   }
   ```

3. `frighten` fonksiyonunun ilk satırını değiştir:

   ```js
     scaredFor = Math.max(120, 420 - 60 * (level - 1)) // ← değişti (eskiden 420)
   ```

4. `caught` fonksiyonunun sonuna, `state = 'over'` satırından sonra rekoru kaydeden satırları ekle:

   ```js
   function caught() {
     lives -= 1
     if (lives > 0) {
       placeActors()
       return
     }
     state = 'over'
     if (score > best) {                        // ← yeni
       best = score
       localStorage.setItem('maze-best', best)
     }
   }
   ```

5. `draw()` içinde `ctx.fillText('Score: ' + score, 10, 27)` satırını rekoru da yazacak şekilde değiştir:

   ```js
     ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 27) // ← değişti
   ```

   `'  Best: '` başında **iki** boşluk var: sonuç `Score: 0  Best: 0` gibi.

6. **Çalıştır**'a bas. Sol üstte `Score: 0  Best: 0` görünmeli. Oynamak için önce oyuna tıkla; canların bitince puanın
   rekor olarak kaydedilmeli ve boşlukla yeni oyuna geçince `Best`'te görünmeli. Alttaki kontrollerin hepsi yeşil
   olmalı. Kırmızı kalırsa `Math.max` içindeki sayılara ve `'maze-best'` adının yazılışına bak.

# --tests--

Ghosts should get faster with the level, but never faster than the player.
tr: Hayaletler bölümle hızlanmalı ama asla oyuncudan hızlı olmamalı.

```js
const red = ghosts[0]
assert.strictEqual(ghostFrames(red), 9)
level = 2
assert.strictEqual(ghostFrames(red), 8)
level = 9
assert.strictEqual(ghostFrames(red), 8)
red.scared = true
assert.strictEqual(ghostFrames(red), 16)
```

Power pellets should get shorter with the level, down to two seconds.
tr: Güç yemleri bölümle kısalmalı, iki saniyeye kadar.

```js
level = 3
frighten()
assert.strictEqual(scaredFor, 300)
level = 12
frighten()
assert.strictEqual(scaredFor, 120)
```

The best score should be saved when the game ends, and shown.
tr: En iyi skor oyun bitince kaydedilmeli ve gösterilmeli.

```js
score = 1230
lives = 1
caught()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 1230)
assert.strictEqual(localStorage.getItem('maze-best'), '1230')
$.press(' ')
$.tick(1)
assert.include($.texts(), 'Score: 0 Best: 1230')
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
const GHOSTS = [
  { name: 'red', color: '#ef4444', corner: { col: 18, row: 0 }, delay: 0 },
  { name: 'pink', color: '#f9a8d4', corner: { col: 0, row: 0 }, delay: 120 },
  { name: 'orange', color: '#fb923c', corner: { col: 0, row: 20 }, delay: 300 },
  { name: 'cyan', color: '#22d3ee', corner: { col: 18, row: 20 }, delay: 480 },
]
const SCATTER = 420 // frames of scatter at the start of every 27-second cycle
const CYCLE = 1620

let pellets // keys of the tiles that still have a pellet
let powers // keys of the tiles that still have a power pellet
let player
let ghosts
let score
let lives
let level
let state // 'ready', 'playing' or 'over'
let clock // frames played on this life, for the scatter / chase cycle
let scaredFor // frames the ghosts stay scared
let chain // points for the next ghost eaten
let best = Number(localStorage.getItem('maze-best')) || 0

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
  if (g.scared) return 16
  return Math.max(8, 10 - level)
}

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
  ghosts = GHOSTS.map((g, i) => ({ ...g, col: 8 + (i % 3), row: 9, dir: STOP, progress: 0, frames: 10, waiting: g.delay, scared: false }))
  for (const g of ghosts) if (g.waiting === 0) release(g)
  clock = 0
  scaredFor = 0
  state = 'ready'
}

// Out of the house: the ghost starts on the tile above it, heading left.
function release(g) {
  Object.assign(g, { col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0 })
}

function reset() {
  score = 0
  lives = 3
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
  if (powers.delete(here)) {
    score += 50
    frighten()
  }
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

function mode() {
  return clock % CYCLE < SCATTER ? 'scatter' : 'chase'
}

function target(g) {
  if (mode() === 'scatter') return g.corner
  if (g.name === 'pink') return { col: player.col + player.dir[0] * 4, row: player.row + player.dir[1] * 4 }
  if (g.name === 'orange') {
    const far = (g.col - player.col) ** 2 + (g.row - player.row) ** 2 > 64
    return far ? player : g.corner
  }
  if (g.name === 'cyan') {
    // Double the arrow from the red ghost to two tiles ahead of the player: it cuts the player off from the other side.
    const red = ghosts[0]
    return { col: 2 * (player.col + player.dir[0] * 2) - red.col, row: 2 * (player.row + player.dir[1] * 2) - red.row }
  }
  return player
}

function chooseGhost(g) {
  g.frames = ghostFrames(g)
  // Ghosts never turn back on their own: only the open ways that are not backwards.
  const options = Object.values(DIRECTIONS).filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))
  if (options.length === 0) {
    g.dir = reverse(g.dir)
    return
  }
  if (g.scared) {
    g.dir = options[Math.floor(Math.random() * options.length)]
    return
  }
  const t = target(g)
  const distance = (d) => (g.col + d[0] - t.col) ** 2 + (g.row + d[1] - t.row) ** 2
  g.dir = options.reduce((bestDir, d) => (distance(d) < distance(bestDir) ? d : bestDir))
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
  if (state === 'over') return
  state = 'playing'
  player.want = dir
  if (same(dir, reverse(player.dir)) && !same(dir, STOP)) turnAround(player)
}

function frighten() {
  scaredFor = Math.max(120, 420 - 60 * (level - 1))
  chain = 200
  for (const g of ghosts) {
    if (g.waiting > 0) continue
    g.scared = true
    turnAround(g)
  }
}

function caught() {
  lives -= 1
  if (lives > 0) {
    placeActors()
    return
  }
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('maze-best', best)
  }
}

document.addEventListener('keydown', (event) => {
  const dir = DIRECTIONS[event.key]
  if (dir) {
    event.preventDefault()
    steer(dir)
  }
  if (event.key === ' ' && state === 'over') reset()
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
  if (state === 'over') {
    reset()
    return
  }
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
  if (Math.abs(dx) > Math.abs(dy)) steer([Math.sign(dx), 0])
  else steer([0, Math.sign(dy)])
})

function update() {
  if (state !== 'playing') return
  clock += 1
  if (scaredFor > 0) {
    scaredFor -= 1
    if (scaredFor === 0) for (const g of ghosts) g.scared = false
  }

  const startLevel = level
  advance(player, choosePlayer)
  if (level !== startLevel) return

  for (const g of ghosts) {
    if (g.waiting > 0) {
      g.waiting -= 1
      if (g.waiting === 0) release(g)
      continue
    }
    advance(g, chooseGhost)
  }

  const p = position(player)
  for (const g of ghosts) {
    if (g.waiting > 0) continue
    const q = position(g)
    if (Math.abs(p.x - q.x) + Math.abs(p.y - q.y) > 0.6) continue
    if (!g.scared) {
      caught()
      return
    }
    // A scared ghost is eaten: points, and back to the house for a while.
    score += chain
    chain *= 2
    Object.assign(g, { col: 9, row: 9, dir: STOP, progress: 0, waiting: 180, scared: false })
  }
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
    // Blue while scared, flashing white in the last two seconds.
    const flash = scaredFor < 120 && Math.floor(scaredFor / 10) % 2 === 0
    ctx.fillStyle = g.scared ? (flash ? '#e5e7eb' : '#3b82f6') : g.color
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
  ctx.fillText('Score: ' + score + '  Best: ' + best, 10, 27)
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '   Lives: ' + lives, canvas.width - 10, 27)

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillStyle = '#facc15'
    ctx.fillText('Press an arrow key', canvas.width / 2, TOP + 11 * TILE + 18)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(11, 16, 32, 0.75)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
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
