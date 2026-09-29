---
title: One frame of movement
title_tr: Bir karelik hareket
skills: [game.state, prog.functions]
---

# --goal--

`advance(e, choose)` moves anything by one frame. At the center of a tile (`progress === 0`) it lets `choose` decide
the direction. Then `progress` grows by one; after `frames` frames the step is done: the tile changes and `progress`
starts again from 0.

# --goal-tr--

Hareketin kalbi: `advance(e, choose)`, bir şeyi **bir kare** ilerletir. Oyuncu da hayaletler de aynı fonksiyonla
yürüyecek; farkları yalnız **nasıl yön seçtikleri**. O yüzden yön seçen fonksiyonu (`choose`) parametre olarak
alıyor.

Kural: yön yalnız bir döşemenin **tam ortasında** (`progress === 0`) seçilir. Böylece herkes koridorlara tam hizalı
kalır. Sonra her karede `progress` bir artar; `frames`'e ulaşınca adım biter: döşeme değişir, `progress` yine 0 olur.

# --code--

```js
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
```

# --meaning--

- A function can be passed to another function like any value: `choose(e)` calls whatever was passed.
- A stopped mover does nothing more; `return` ends the function early.
- Only when `progress` reaches `frames` does the tile change; the column is wrapped for the tunnel.

# --meaning-tr--

- `function advance(e, choose)` → `e` hareket eden şey, `choose` onun **yön seçen fonksiyonu**. Fonksiyonlar da
  başka bir fonksiyona değer gibi verilebilir; `choose(e)` ona ne verildiyse onu çağırır.
- `if (e.progress === 0) choose(e)` → döşemenin ortasındaysa yön seç.
- `if (same(e.dir, STOP)) return` → duruyorsa bu karede başka bir şey yapma. `return` fonksiyonu **erken** bitirir.
- `e.progress += 1` → adımda bir kare daha.
- `if (e.progress < e.frames) return` → adım henüz bitmedi.
- Adım bitti: `progress` sıfırlanır, `col` ve `row` yön kadar değişir. Sütun `wrap` ile sarılır; tünel böyle çalışır.

# --task--

Under `reset`, leave an empty line and write the comment and `advance`.

# --task-tr--

1. `reset` fonksiyonunun kapanan `}`'inin altına bir boş satır bırak; yorumu ve `advance` fonksiyonunu yaz.
2. **Çalıştır**. Henüz kimse `advance`'i çağırmıyor; kontroller onu elle çağıracak.

# --tests--

Eight calls should carry the player one tile.
tr: Sekiz çağrı oyuncuyu bir döşeme taşımalı.

```js
player.dir = [-1, 0]
const nothing = () => {}
for (let i = 0; i < 7; i++) advance(player, nothing)
assert.deepEqual([player.col, player.progress], [9, 7])
advance(player, nothing)
assert.deepEqual([player.col, player.progress], [8, 0])
```

`choose` should be asked only at the center of a tile.
tr: `choose` yalnız döşemenin ortasında sorulmalı.

```js
let asked = 0
const choose = (e) => {
  asked += 1
  e.dir = [1, 0]
}
for (let i = 0; i < 9; i++) advance(player, choose)
assert.strictEqual(asked, 2)
assert.deepEqual([player.col, player.progress], [10, 1])
```

A stopped mover should stay put, and the tunnel should wrap.
tr: Duran kıpırdamamalı; tünel sarmalamalı.

```js
advance(player, () => {})
assert.deepEqual([player.col, player.progress], [9, 0])
player = { col: 0, row: 9, dir: [-1, 0], want: [-1, 0], progress: 0, frames: 8 }
for (let i = 0; i < 8; i++) advance(player, () => {})
assert.strictEqual(player.col, 18)
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
