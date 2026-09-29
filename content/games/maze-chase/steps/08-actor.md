---
title: What a mover remembers
title_tr: Hareket edenin hafızası
skills: [game.state]
---

# --goal--

The player will **glide** from tile to tile, not jump. So besides its tile it keeps: `dir` (where it is going),
`want` (where the player would like to go), `progress` (frames done of the current step) and `frames` (frames one step
takes). `STOP` is the direction "nowhere", and `same` compares two directions.

# --goal-tr--

Oyuncu döşemeden döşemeye **zıplamayacak, kayacak**. Bir döşemeyi geçmesi 8 kare (yaklaşık 0.13 saniye) sürecek.
Bunun için oyuncunun yerinden başka şeyleri de hatırlaması gerek:

- `dir` → şu an gittiği yön.
- `want` → oyuncunun **gitmek istediği** yön (bastığı ok tuşu). Neden ayrı olduğunu birazdan göreceğiz.
- `progress` → şu anki adımda kaç kare yol aldı (0'dan 8'e).
- `frames` → bir adım kaç kare sürer.

`STOP = [0, 0]` "hiçbir yöne" demek. İki yönü karşılaştırmak için de `same` yardımcısını yazacağız. Bu adımda
ekranda değişiklik yok.

# --code--

```js
const STOP = [0, 0]
const PLAYER_FRAMES = 8 // frames the player needs to cross one tile

const same = (a, b) => a[0] === b[0] && a[1] === b[1]

  player = { col: MAZE[row].indexOf('P'), row, dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }
```

# --meaning--

- `STOP` is a direction that adds nothing.
- Two arrays are never `===` unless they are the same array, so `same` compares their two numbers.
- The player now starts standing still, with no step in progress.

# --meaning-tr--

- `const STOP = [0, 0]` → adım atmayan yön: sütuna da sıraya da 0 ekler.
- `PLAYER_FRAMES = 8` → oyuncu bir döşemeyi 8 karede geçer. Sayı küçüldükçe oyuncu hızlanır.
- `const same = (a, b) => a[0] === b[0] && a[1] === b[1]` → iki yön aynı mı? İki diziyi `===` ile karşılaştıramayız:
  `[0, 0] === [0, 0]` bile `false`, çünkü `===` "aynı dizi mi" diye bakar, içine değil. Bu yüzden iki sayıyı tek tek
  karşılaştırıyoruz. `&&` "**ve**".
- `player = { ..., dir: STOP, want: STOP, progress: 0, frames: PLAYER_FRAMES }` → oyuncu başta **duruyor**, yarım
  kalmış bir adımı yok.

# --task--

1. Under `COLS` write `STOP` and `PLAYER_FRAMES`.
2. Under `canGo`, after an empty line, write `same`.
3. In `placeActors`, add the four new fields to `player`.

# --task-tr--

1. `const COLS = ...` satırının **altına** `STOP` ve `PLAYER_FRAMES` satırlarını yaz.
2. `canGo` fonksiyonunun altına bir boş satır bırakıp `same` satırını yaz.
3. `placeActors` içinde `player = { ... }` satırının sonuna, `}`'den önce dört yeni alanı ekle.
4. **Çalıştır**.

# --tests--

The player should start standing still.
tr: Oyuncu başta duruyor olmalı.

```js
assert.deepEqual(player, { col: 9, row: 15, dir: [0, 0], want: [0, 0], progress: 0, frames: 8 })
assert.strictEqual(player.dir, STOP)
```

`same` should compare two directions.
tr: `same` iki yönü karşılaştırmalı.

```js
assert.isTrue(same([0, 0], STOP))
assert.isTrue(same([-1, 0], [-1, 0]))
assert.isFalse(same([1, 0], [0, 1]))
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
