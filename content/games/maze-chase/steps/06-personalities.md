---
title: Four ghosts, four personalities
title_tr: Dört hayalet, dört kişilik
skills: [game.state]
---

# --explanation--

Four ghosts that all chase the player would just follow each other in a line. What makes the game interesting is that
every ghost uses the **same brain with a different target**:

- **red** aims at the player: a direct chaser.
- **pink** aims 4 tiles **ahead** of the player: it tries to cut you off.
- **orange** chases while it is more than 8 tiles away, but when it gets close it heads to its corner: it is shy, which
  makes it unpredictable.
- **cyan** takes the point 2 tiles ahead of the player and doubles the arrow from red to that point. Together with red
  it closes in from the other side.

Every 27 seconds the ghosts also switch between two **modes**: 7 seconds of **scatter**, when each one heads to its own
corner, and 20 seconds of **chase**. Scatter gives the player a breather and makes the ghosts spread out instead of
bunching up. A single `clock` counter and `%` is enough for a repeating schedule:

```js
clock % CYCLE < SCATTER ? 'scatter' : 'chase'
```

Finally, the ghosts no longer all start at once. They wait in the house (`waiting` frames) and come out one by one, so
the start of a maze is calm and it gets busier.

# --explanation-tr--

**Bu adımda:** dört hayalet olacak ve her birinin kendine özgü bir kişiliği olacak. Kırmızı hemen çıkar; pembe, turuncu
ve camgöbeği evde bekleyip birer birer çıkar. Arada bir hepsi köşelerine dağılır, sonra yine kovalamaya başlar.

**Aynı beyin, farklı hedef.** Hepsi oyuncuyu kovalasaydı arka arkaya dizilip tek sıra halinde gelirlerdi. Oyunu ilginç
yapan şey, hepsinin **aynı beyni farklı bir hedefle** kullanmasıdır. Sadece `target(g)`'yi değiştiririz:

- **kırmızı** (red) oyuncuyu hedefler: doğrudan kovalar.
- **pembe** (pink) oyuncunun **4 kare önünü** hedefler: önünü kesmeye çalışır. Oyuncunun yönünü 4 ile çarpıp konumuna
  ekleriz: `player.col + player.dir[0] * 4`.
- **turuncu** (orange) 8 kareden uzaktayken kovalar, yaklaşınca kendi köşesine kaçar: utangaçtır, bu yüzden ne yapacağı
  kestirilemez. Uzaklığın karesini 64 (8 × 8) ile karşılaştırırız.
- **camgöbeği** (cyan) oyuncunun 2 kare önündeki noktayı alır ve kırmızıdan o noktaya giden oku **iki katına** uzatır.
  Kırmızıyla birlikte oyuncuyu öbür taraftan kıstırır. Hesap: `2 * nokta - kırmızı`.

**Dağılma ve kovalama.** Her 27 saniyede hayaletler iki **mod** arasında geçiş yapar: 7 saniye **dağılma** (scatter),
her biri kendi köşesine gider; sonra 20 saniye **kovalama** (chase). Dağılma oyuncuya nefes aldırır ve hayaletlerin
kümelenmesini önler. Tekrarlayan bir takvim için tek bir sayaç (`clock`, her karede 1 artar) ve `%` yeter:

```js
clock % CYCLE < SCATTER ? 'scatter' : 'chase'
```

Saniyede yaklaşık 60 kare çizildiği için 7 saniye = 420 kare (`SCATTER`), 27 saniye = 1620 kare (`CYCLE`). `%` bölümden
kalanı verir: `clock` 1620'ye gelince kalan yeniden 0'dan başlar, takvim tekrarlanır.

**Evden birer birer.** Hayaletler artık aynı anda başlamaz. Evde beklerler (`waiting` kare sayar) ve teker teker çıkarlar;
labirentin başı sakin geçer, sonra kalabalıklaşır. Bekleme sayacı 0'a inince `release(g)` hayaleti evin üstündeki
çıkış karesine koyar.

**Yeni araçlar:**

- `GHOSTS.map((g, i) => ...)` → `map`'in ikinci parametresi `i`, öğenin sıra numarasıdır (0, 1, 2, 3). `8 + (i % 3)`
  hayaletleri evin içinde 8, 9, 10, 8. sütunlara dağıtır.
- `Object.assign(g, { col: ..., row: ... })` → `g` nesnesinin bu bilgilerini tek seferde değiştirir, diğerlerine
  dokunmaz.
- `continue` → döngüde "bu hayaleti burada bırak, sıradakine geç". Bekleyen hayalet yürümez.
- `ghosts[0]` → listedeki ilk hayalet, yani kırmızı.

# --task--

1. Replace `GHOSTS` with the four ghosts from the solution (each with a `corner` and a `delay`), and add `SCATTER = 420`
   and `CYCLE = 1620`.
2. In `placeActors()`, ghosts start in the house (`col: 8 + (i % 3)`, `row: 9`, `dir: STOP`) with `waiting: g.delay`;
   write `release(g)` that puts a ghost on `EXIT` heading left, and release at once those with nothing to wait for. Reset
   `clock` to `0`.
3. Every frame add 1 to `clock`. A waiting ghost counts down instead of moving, and is released when it reaches `0`.
4. Write `mode()`, and in `target(g)`: in scatter, the ghost's corner; in chase, the targets described above.

# --task-tr--

1. `const GHOSTS = [{ name: 'red', color: '#ef4444' }]` satırını dört hayaletli listeyle değiştir ve altına iki süre
   ekle:

   ```js
   const GHOSTS = [
     { name: 'red', color: '#ef4444', corner: { col: 18, row: 0 }, delay: 0 },
     { name: 'pink', color: '#f9a8d4', corner: { col: 0, row: 0 }, delay: 120 },
     { name: 'orange', color: '#fb923c', corner: { col: 0, row: 20 }, delay: 300 },
     { name: 'cyan', color: '#22d3ee', corner: { col: 18, row: 20 }, delay: 480 },
   ]
   const SCATTER = 420 // frames of scatter at the start of every 27-second cycle
   const CYCLE = 1620
   ```

   `corner` dağılırken gideceği köşe, `delay` evde kaç kare bekleyeceği.

2. `let level` satırının hemen altına sayacı ekle:

   ```js
   let clock // frames played on this life, for the scatter / chase cycle
   ```

3. `placeActors` içindeki `ghosts = ...` satırını değiştir, altına iki satır ekle; fonksiyonun kapanışından sonra da
   `release`'i yaz:

   ```js
     ghosts = GHOSTS.map((g, i) => ({ ...g, col: 8 + (i % 3), row: 9, dir: STOP, progress: 0, frames: 10, waiting: g.delay })) // ← değişti
     for (const g of ghosts) if (g.waiting === 0) release(g) // ← yeni
     clock = 0                                               // ← yeni
   }

   // Out of the house: the ghost starts on the tile above it, heading left.
   function release(g) {
     Object.assign(g, { col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0 })
   }
   ```

4. `function target(g)`'den hemen önce mod fonksiyonunu yaz ve `target`'ı şu hâle getir:

   ```js
   function mode() {
     return clock % CYCLE < SCATTER ? 'scatter' : 'chase'
   }

   function target(g) {
     if (mode() === 'scatter') return g.corner                                                          // ← yeni
     if (g.name === 'pink') return { col: player.col + player.dir[0] * 4, row: player.row + player.dir[1] * 4 } // ← yeni
     if (g.name === 'orange') {                                                                          // ← yeni
       const far = (g.col - player.col) ** 2 + (g.row - player.row) ** 2 > 64
       return far ? player : g.corner
     }
     if (g.name === 'cyan') {                                                                            // ← yeni
       // Double the arrow from the red ghost to two tiles ahead of the player: it cuts the player off from the other side.
       const red = ghosts[0]
       return { col: 2 * (player.col + player.dir[0] * 2) - red.col, row: 2 * (player.row + player.dir[1] * 2) - red.row }
     }
     return player
   }
   ```

5. `update` fonksiyonunu şu hâle getir: saat her karede ilerlesin, bekleyen hayalet saysın ve sırası gelince çıksın:

   ```js
   function update() {
     clock += 1 // ← yeni

     const startLevel = level
     advance(player, choosePlayer)
     if (level !== startLevel) return

     for (const g of ghosts) {    // ← değişti
       if (g.waiting > 0) {
         g.waiting -= 1
         if (g.waiting === 0) release(g)
         continue
       }
       advance(g, chooseGhost)
     }
   }
   ```

6. **Çalıştır**'a bas. Kırmızı hayalet hemen çıkmalı, diğer üçü evde beklemeli ve 2, 5, 8 saniye sonra teker teker
   çıkmalı. İlk 7 saniye köşelerine gittiklerini, sonra seni kovaladıklarını görmelisin. Alttaki kontrollerin hepsi
   yeşil olmalı. Kırmızı kalırsa camgöbeği satırındaki parantezlere ve `GHOSTS` sırasına (red, pink, orange, cyan)
   bak.

# --tests--

Ghosts should leave the house one by one.
tr: Hayaletler evden birer birer çıkmalı.

```js
const [red, pink, orange, cyan] = ghosts
assert.deepEqual([red.col, red.row], [9, 7])
assert.deepEqual([pink.col, pink.row, pink.waiting], [9, 9, 120])
$.tick(119)
assert.strictEqual(pink.row, 9)
$.tick(1)
assert.deepEqual([pink.col, pink.row], [9, 7])
assert.strictEqual(orange.row, 9)
$.tick(360)
assert.strictEqual(cyan.waiting, 0)
assert.notStrictEqual(orange.row, 9)
```

The ghosts should scatter for 7 seconds, then chase for 20, and repeat.
tr: Hayaletler 7 saniye dağılmalı, sonra 20 saniye kovalamalı ve bu tekrarlanmalı.

```js
assert.strictEqual(mode(), 'scatter')
clock = 419
assert.strictEqual(mode(), 'scatter')
clock = 420
assert.strictEqual(mode(), 'chase')
clock = 1620
assert.strictEqual(mode(), 'scatter')
clock = 10
assert.deepEqual(target(ghosts[1]), { col: 0, row: 0 }, 'pink goes to its corner')
```

In chase mode each ghost should have its own target.
tr: Kovalama modunda her hayaletin kendi hedefi olmalı.

```js
const [red, pink, orange, cyan] = ghosts
clock = 500
player.dir = [-1, 0]
assert.strictEqual(target(red), player)
assert.deepEqual(target(pink), { col: 5, row: 15 }, '4 tiles ahead of the player')
Object.assign(orange, { col: 8, row: 13 })
assert.deepEqual(target(orange), { col: 0, row: 20 }, 'close: the shy ghost runs to its corner')
Object.assign(orange, { col: 1, row: 1 })
assert.strictEqual(target(orange), player)
assert.deepEqual(target(cyan), { col: 5, row: 23 }, 'twice the arrow from red (9, 7) to (7, 15)')
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
let level
let clock // frames played on this life, for the scatter / chase cycle

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
  ghosts = GHOSTS.map((g, i) => ({ ...g, col: 8 + (i % 3), row: 9, dir: STOP, progress: 0, frames: 10, waiting: g.delay }))
  for (const g of ghosts) if (g.waiting === 0) release(g)
  clock = 0
}

// Out of the house: the ghost starts on the tile above it, heading left.
function release(g) {
  Object.assign(g, { col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0 })
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
  clock += 1

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
