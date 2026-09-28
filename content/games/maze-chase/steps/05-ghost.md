---
title: A ghost that hunts
title_tr: Avlanan bir hayalet
skills: [game.state, prog.arrays]
---

# --explanation--

The ghost uses the same `advance()` as the player, just with a different `choose` function. That is the benefit of
writing movement once: anything that walks the maze, walks it the same way.

The ghost's brain is famously simple, and it is the same one the original arcade game used. At every tile center:

1. list the open directions, **except going back** the way it came,
2. pick the one whose next tile is **closest to a target** (straight-line distance), ties going to up, left, down, right.

```js
const distance = (d) => (g.col + d[0] - t.col) ** 2 + (g.row + d[1] - t.row) ** 2
g.dir = options.reduce((best, d) => (distance(d) < distance(best) ? d : best))
```

There is no path-finding at all. The ghost can take a wrong turn, and that is part of the charm: it feels alive, and
you can outsmart it. The "never go back" rule is what stops it from shaking back and forth between two tiles; it only
reverses when it has no other choice. For now the target is simply the player.

(Squared distance is enough for comparing: if one distance is smaller, so is its square, and it avoids `Math.sqrt`.)

# --explanation-tr--

**Bu adımda:** ilk hayaleti ekleyeceğiz. Evin hemen üstünden çıkan kırmızı bir kare, labirentte seni kovalayacak
(henüz yakalayamaz, içinden geçer).

**Aynı yürüyüş, farklı beyin.** Hayalet de oyuncuyla aynı `advance()`'i kullanır; sadece yön seçen fonksiyonu (`choose`)
farklıdır. Hareketi bir kez yazmanın faydası bu: labirentte yürüyen her şey aynı şekilde yürür.

**Hayaletin beyni** ünlü derecede basittir ve orijinal salon oyunundakinin aynısıdır. Her kare ortasında:

1. açık yönleri listele, **geldiği yöne geri dönmek hariç**,
2. bunlardan bir sonraki karesi **hedefe en yakın** olanı seç (kuş uçuşu uzaklık). Eşitlikte sıra yukarı, sol, aşağı,
   sağ.

```js
const distance = (d) => (g.col + d[0] - t.col) ** 2 + (g.row + d[1] - t.row) ** 2
g.dir = options.reduce((bestDir, d) => (distance(d) < distance(bestDir) ? d : bestDir))
```

Hiç yol bulma (path-finding) yok. Hayalet yanlış yola sapabilir ve bu işin tadıdır: canlı gibi hissettirir ve onu
atlatabilirsin. "Asla geri dönme" kuralı onun iki kare arasında titreyip durmasını engeller; sadece başka yolu yoksa
geri döner. Şimdilik hedef doğrudan oyuncu.

(Karşılaştırmak için uzaklığın **karesi** yeter: bir uzaklık küçükse karesi de küçüktür; böylece `Math.sqrt`'e gerek
kalmaz. `**` üs almaktır: `3 ** 2` = 9.)

**Yeni araçlar:**

- `GHOSTS.map((g) => ({ ...g, col: ..., row: ... }))` → `map` listedeki her öğeden yeni bir öğe üretip **yeni bir liste**
  yapar. `...g` "g'nin bütün bilgilerini buraya kopyala" demektir; yanına `col`, `row` gibi yeni bilgiler eklenir.
  Böylece `GHOSTS`'taki ad ve renk korunur.
- `Object.values(DIRECTIONS)` → nesnedeki değerlerin listesi: `[[0, -1], [-1, 0], [0, 1], [1, 0]]`, yani yukarı,
  sol, aşağı, sağ sırasıyla. Eşitlikte bu sıra kazanır.
- `.filter((d) => canGo(g, d) && !same(d, reverse(g.dir)))` → "açık **ve** geri dönüş olmayan" yönleri tutar.
- `options.reduce((bestDir, d) => ...)` → listeyi baştan sona gezip tek bir sonuca indirir. `bestDir` şimdiye kadarki
  en iyi, `d` sıradaki; `d` daha yakınsa (`<`) yeni en iyi `d` olur, değilse `bestDir` kalır. Sadece **daha küçük**
  olan kazandığı için eşitlikte öndeki kalır.
- `koşul ? A : B` → kısa "eğer": doğruysa A, değilse B.

**Hız.** Hayalet bir kareyi `ghostFrames(g)` karede geçer (şimdilik 9; oyuncu 8). Büyük sayı = yavaş. Şimdilik hep 9
döndüren bu küçük fonksiyonu ileride hayaletin durumuna göre değiştireceğiz. `target(g)` de şimdilik hep oyuncuyu
döndürür; ileride her hayalete farklı hedef vereceğiz.

**Bölüm biterse.** Oyuncu bu karede labirenti bitirdiyse herkes yerine dönmüştür; aynı karede hayaletleri yürütmeyiz.
Bunun için `update` başta bölüm numarasını hatırlar ve değiştiyse `return` ile çıkar.

# --task--

1. Add `EXIT = { col: 9, row: 7 }` and `GHOSTS = [{ name: 'red', color: '#ef4444' }]`. `placeActors()` makes `ghosts` from
   it, each at `EXIT` with `dir: [-1, 0]`, `progress: 0` and `frames: 10`.
2. Write `ghostFrames(g)` returning `9`, `target(g)` returning the player, and `chooseGhost(g)`: set `g.frames`, then the
   options are the open directions that are not the reverse of `g.dir`. With no options, turn back. Otherwise pick the
   closest to the target as above.
3. Every frame after the player moves, `advance` each ghost with `chooseGhost`. Only the player eats pellets. If the
   player clears the maze during its move, skip the ghosts for that frame.
4. Draw each ghost as a square in its color, 3 pixels smaller than its tile on each side, at its `position`.

# --task-tr--

1. `const PLAYER_FRAMES = 8 ...` satırının hemen altına evin çıkışını ve hayalet listesini ekle:

   ```js
   const EXIT = { col: 9, row: 7 } // the tile just above the ghost house
   const GHOSTS = [{ name: 'red', color: '#ef4444' }]
   ```

2. `let player` satırının hemen altına ekle:

   ```js
   let ghosts
   ```

3. `fillPellets` fonksiyonunun kapanış `}`'inden sonra, `function placeActors()`'tan önce hız fonksiyonunu yaz:

   ```js
   // Frames a ghost needs to cross one tile (the player always needs PLAYER_FRAMES): smaller is faster.
   function ghostFrames(g) {
     return 9
   }
   ```

4. `placeActors` içinde `player = ...` satırının altına hayaletleri kuran satırı ekle:

   ```js
     player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
     ghosts = GHOSTS.map((g) => ({ ...g, col: EXIT.col, row: EXIT.row, dir: [-1, 0], progress: 0, frames: 10 })) // ← yeni
   ```

5. `choosePlayer` fonksiyonunun kapanış `}`'inden sonra, `// Turning around...` yorumundan önce hayaletin hedefini ve
   beynini yaz:

   ```js
   function target(g) {
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
   ```

6. `update` fonksiyonunu şu hâle getir:

   ```js
   function update() {
     const startLevel = level                          // ← yeni
     advance(player, choosePlayer)
     if (level !== startLevel) return                  // ← yeni

     for (const g of ghosts) advance(g, chooseGhost)   // ← yeni
   }
   ```

7. `draw()` içinde oyuncuyu çizen `const p = position(player)` satırından **önce** hayaletleri çiz (her yanda 3 piksel
   küçük kareler):

   ```js
     for (const g of ghosts) {                                          // ← yeni
       const q = position(g)
       ctx.fillStyle = g.color
       ctx.fillRect(q.x * TILE + 3, TOP + q.y * TILE + 3, TILE - 6, TILE - 6)
     }

     const p = position(player)
   ```

8. **Çalıştır**'a bas. Evin üstünde kırmızı bir kare belirmeli ve labirentte sana doğru gelmeli. Oynamak için önce oyuna
   tıkla ve kaç: hayalet seni izlemeli ama hiç geri dönüp titrememeli. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı
   kalırsa `reduce` satırındaki `<` işaretine (küçük-eşit değil) ve `...g` yazımındaki üç noktaya bak.

# --tests--

The ghost should leave from above the house and cross a tile in nine frames.
tr: Hayalet evin üstünden çıkmalı ve bir döşemeyi dokuz karede geçmeli.

```js
const red = ghosts[0]
assert.deepEqual([red.col, red.row], [9, 7])
$.tick(1)
assert.strictEqual(red.frames, 9)
const [r] = $.rects('#ef4444')
assert.closeTo(r.x, (9 - 1 / 9) * 24 + 3, 1e-9)
assert.strictEqual(r.y, 40 + 7 * 24 + 3)
$.tick(8)
assert.deepEqual([red.col, red.row], [8, 7])
assert.strictEqual(pellets.size, 146, 'ghosts do not eat pellets')
```

At a crossing the ghost should take the way closest to its target, but never turn back.
tr: Bir kavşakta hayalet hedefine en yakın yolu seçmeli ama asla geri dönmemeli.

```js
const red = ghosts[0]
Object.assign(red, { col: 4, row: 9, dir: [0, 1], progress: 0 }) // came down into the crossing at (4, 9)
chooseGhost(red)
assert.deepEqual(red.dir, [0, 1], 'down is closest to the player at (9, 15)')
Object.assign(player, { col: 4, row: 3 })
red.dir = [0, 1]
chooseGhost(red)
assert.deepEqual(red.dir, [-1, 0], 'up would be closest, but that is back: left and right tie, left wins')
```

The ghost should never reverse on its own, and should find a player who stands still.
tr: Hayalet kendi kendine asla geri dönmemeli ve duran bir oyuncuyu bulmalı.

```js
const red = ghosts[0]
let reached = false
for (let i = 0; i < 1500 && !reached; i++) {
  const before = red.dir
  $.tick(1)
  assert.isFalse(red.dir[0] === -before[0] && red.dir[1] === -before[1] && (before[0] || before[1]), 'turned back')
  reached = red.col === player.col && red.row === player.row
}
assert.isTrue(reached)
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

function target(g) {
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
  const startLevel = level
  advance(player, choosePlayer)
  if (level !== startLevel) return

  for (const g of ghosts) advance(g, chooseGhost)
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
