---
title: Turn back at once
title_tr: Anında geri dön
skills: [game.input]
---

# --goal--

Turning into a side corridor waits for the next tile center, but turning **back** should not: when a ghost appears
ahead you must flee now. The trick: 3 frames into a step from tile 9 to 8 is the same place as 5 frames into a step from
tile 8 back to 9. So move to the tile you were heading to, flip `dir`, and set `progress = frames - progress`.

# --goal-tr--

Yan koridora dönmek için döşeme ortasını beklemek doğru. Ama **geri** dönmek için beklemek yanlış: önünde bir hayalet
belirdiğinde adımı bitirmeyi bekleyemezsin, **hemen** kaçmalısın. Geri dönüş her an mümkün: geldiğin yol zaten açık.

Hile şu: 9. döşemeden 8.'ye giden adımın **3. karesi**, 8.'den 9.'a giden adımın **5. karesiyle** aynı yer. O hâlde
geri dönmek = gittiğin döşemeye geç, yönü çevir, `progress`'i `frames - progress` yap. Ekrandaki yer **hiç
değişmez**; yalnız yön anında değişir.

# --code--

```js
const reverse = (dir) => [-dir[0], -dir[1]]

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
```

# --meaning--

- `reverse` flips both numbers of a direction.
- At a tile center (or standing still) flipping `dir` is enough.
- Mid-step: jump the tile to the one ahead, flip, and count the remaining frames from the other side. `position` gives
  the same point before and after.
- `steer` turns around at once only when the new direction is exactly backwards.

# --meaning-tr--

- `const reverse = (dir) => [-dir[0], -dir[1]]` → yönün **tersi**: `[-1, 0]` → `[1, 0]`.
- `if (e.progress === 0 || same(e.dir, STOP))` → döşemenin ortasındaysa ya da duruyorsa yönü çevirmek yeter.
- Adımın ortasındaysa:
  - `e.col = wrap(e.col + e.dir[0])`, `e.row += e.dir[1]` → gitmekte olduğun döşemeye geç.
  - `e.dir = reverse(e.dir)` → yönü çevir.
  - `e.progress = e.frames - e.progress` → 8 karelik adımın 3'ü bittiyse, tersten bakınca 5'i bitmiştir.
- `steer` içindeki yeni satır → istenen yön şu anki yönün **tam tersiyse** (ve `STOP` değilse) hemen geri dön.

# --task--

1. Under `same`, write `reverse`.
2. Above `steer`, write the comment and `turnAround`.
3. In `steer`, under `player.want = dir`, write the new line.

# --task-tr--

1. `const same = ...` satırının **altına** `reverse` satırını yaz.
2. `function steer(dir) {` satırının **üstüne** yorumu ve `turnAround` fonksiyonunu yaz; altında bir boş satır
   kalsın.
3. `steer` içinde `player.want = dir` satırının **altına** yeni satırı yaz.
4. **Çalıştır**, sola yürürken sağa bas: oyuncu adımın ortasında bile anında dönmeli.

# --predict--

The player is 3 frames into a step to the left and you press Right. Where is it drawn in the next picture?
- [x] Exactly where it was
  Tile 8 with 5 frames to go back is the same point as tile 9 with 3 frames done.
- [ ] Back on its old tile
- [ ] One tile to the left

# --predict-tr--

Oyuncu sola doğru adımının 3. karesinde ve sen Sağ'a basıyorsun. Bir sonraki resimde nerede çizilir?
- [x] Tam olduğu yerde
  "8. döşeme, geri dönüşün 5. karesi" ile "9. döşeme, gidişin 3. karesi" aynı nokta.
- [ ] Eski döşemesinde
- [ ] Bir döşeme solda

# --tests--

Reversing mid-step should turn at once without moving the player.
tr: Adımın ortasında geri dönmek oyuncuyu kıpırdatmadan hemen döndürmeli.

```js
$.press('ArrowLeft')
$.tick(3)
assert.deepEqual(position(player), { x: 8.625, y: 15 })
$.press('ArrowRight')
assert.strictEqual(player.dir.join(), '1,0')
assert.strictEqual(player.col, 8)
assert.strictEqual(player.progress, 5)
assert.deepEqual(position(player), { x: 8.625, y: 15 })
$.tick(3)
assert.deepEqual([player.col, player.progress], [9, 0])
```

Reversing should also work through the tunnel.
tr: Geri dönmek tünelde de çalışmalı.

```js
player = { col: 0, row: 9, dir: [-1, 0], want: [-1, 0], progress: 2, frames: 8 }
turnAround(player)
assert.deepEqual([player.col, player.progress], [18, 6])
assert.strictEqual(player.dir.join(), '1,0')
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
