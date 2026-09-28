---
title: Eating pellets
title_tr: Yem yemek
skills: [game.state]
---

# --explanation--

Eating happens when the player **arrives** at a tile. That moment already exists in `advance()`, so it is the natural
place to hook in: after the step is finished, call `arrive(e)`.

Because pellets are a `Set` of keys, eating one is a single line, and `delete` even tells you whether there was
something to eat:

```js
if (pellets.delete(here)) score += 10   // true only if the pellet was still there
```

When both sets are empty, the maze is cleared: the level goes up, the pellets come back from the maze text and everyone
goes back to their start. This is the payoff of keeping the level (the text) apart from the state (the sets): starting
over is just rebuilding the state.

# --explanation-tr--

**Bu adımda:** oyuncu yemleri yiyecek. Üstünden geçtiğin yemler kaybolacak, sol üstte puanın (`Score`), sağ üstte bölüm
numaran (`Level`) yazacak. Bütün yemleri bitirince labirent yeniden dolacak ve bölüm bir artacak.

**Ne zaman yenir?** Oyuncu bir kareye **vardığında**. O an zaten `advance()` içinde var: `progress` sıfırlanıp `col`/`row`
ilerlediği yer. Oraya yeni bir fonksiyon çağrısı ekleriz: `arrive(e)` ("vardı").

`advance` hem oyuncu hem ileride hayaletler için çalışacak; ama sadece oyuncu yer. `if (e !== player) return` →
"varan oyuncu değilse hiçbir şey yapma". `!==` "eşit değil" demektir.

**Tek satırda yemek.** Yemler bir küme (`Set`) olduğu için yemek tek satırdır. Üstelik `delete` sana silinecek bir şey
olup olmadığını da söyler:

```js
if (pellets.delete(here)) score += 10   // yem hâlâ oradaysa true, zaten yenmişse false
```

Yani aynı kareden ikinci kez geçince puan gelmez. Yem 10, güç yemi 50 puan.

**Labirent bitince.** İki küme de boşsa (`size === 0`, `&&` "ve") labirent temizlenmiştir: bölüm artar, yemler labirent
yazısından yeniden kurulur ve herkes başlangıç yerine döner. 1. adımda "bölüm (yazı)" ile "durum (kümeler)" ayrı
tuttuğumuzun faydası burada: yeniden başlamak sadece durumu yeniden kurmaktır.

**Yazı.** `'Score: ' + score` → `+` yazıları yan yana ekler: `'Score: 10'`. `ctx.font` yazının kalınlığını, boyunu ve
türünü seçer; `ctx.textAlign = 'left'` yazıyı verilen noktadan sağa, `'right'` sola doğru yazar (sağ kenara yaslamak
için). `ctx.fillText(yazı, x, y)` yazıyı boyar.

# --task--

1. Add `let score` and `let level`; `reset()` sets them to `0` and `1`.
2. At the end of `advance()`, after moving, call `arrive(e)`. In `arrive`, for the player only: delete the pellet on its
   tile (10 points) or the power pellet (50 points). When `pellets` and `powers` are both empty, add 1 to `level`, refill
   the pellets and place the actors again.
3. Draw `Score: 10` at the top left and `Level 1` at the top right (white, `'bold 18px sans-serif'`).

# --task-tr--

1. `let player` satırının hemen altına iki ad ekle:

   ```js
   let score
   let level
   ```

2. `reset` fonksiyonunun başına puanı ve bölümü sıfırlayan iki satır ekle:

   ```js
   function reset() {
     score = 0 // ← yeni
     level = 1 // ← yeni
     fillPellets()
     placeActors()
   }
   ```

3. `advance` fonksiyonunun sonuna, `e.row += e.dir[1]` satırından sonra `arrive(e)` çağrısını ekle; `advance`'in
   kapanış `}`'inden sonra da `arrive` fonksiyonunu yaz:

   ```js
     e.col = wrap(e.col + e.dir[0])
     e.row += e.dir[1]
     arrive(e) // ← yeni
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
   ```

4. `draw()`'un en sonunda, oyuncuyu çizen `ctx.fill()` satırından sonra ve kapanış `}`'inden önce puanı ve bölümü yaz:

   ```js
     ctx.fill()

     ctx.fillStyle = 'white'                                   // ← yeni
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Score: ' + score, 10, 27)
     ctx.textAlign = 'right'
     ctx.fillText('Level ' + level, canvas.width - 10, 27)
   }
   ```

5. **Çalıştır**'a bas. Üstte `Score: 0` ve `Level 1` görünmeli. Oynamak için önce oyuna tıkla ve yürü: yediğin yemler
   kaybolmalı, puan 10'ar artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa `'Score: '` içindeki iki
   noktadan sonraki boşluğa ve `arrive(e)` çağrısının `advance`'in **en sonunda** olduğuna bak.

# --tests--

Walking over a pellet should eat it once.
tr: Bir yemin üstünden yürümek onu bir kez yemeli.

```js
$.press('ArrowLeft')
$.tick(8)
assert.strictEqual(score, 10)
assert.strictEqual(pellets.size, 145)
assert.isFalse(pellets.has('8,15'))
$.press('ArrowRight')
$.tick(16)
assert.strictEqual(score, 20, 'walking back over (8, 15) scores nothing, (10, 15) scores 10')
$.tick(1)
assert.lengthOf($.rects('#fde68a'), 144)
assert.include($.texts(), 'Score: 20')
```

A power pellet should be worth 50.
tr: Bir güç yemi 50 değerinde olmalı.

```js
player = { col: 2, row: 15, dir: [-1, 0], want: [-1, 0], progress: 0, frames: 8 }
$.tick(8)
assert.strictEqual(score, 50)
assert.strictEqual(powers.size, 3)
```

Clearing the maze should start the next level with a full maze.
tr: Labirenti bitirmek dolu bir labirentle sonraki bölümü başlatmalı.

```js
pellets = new Set()
powers = new Set(['8,15'])
$.press('ArrowLeft')
$.tick(8)
assert.strictEqual(level, 2)
assert.strictEqual(pellets.size, 146)
assert.strictEqual(powers.size, 4)
assert.deepEqual([player.col, player.row], [9, 15])
$.tick(1)
assert.include($.texts(), 'Level 2')
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

function placeActors() {
  const row = MAZE.findIndex((line) => line.includes('P'))
  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
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
