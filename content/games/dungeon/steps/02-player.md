---
title: The hero
title_tr: Kahraman
skills: [game.state, prog.functions]
---

# --goal--

The hero is a green square, 22 pixels, standing in the middle of the `P` tile. `findIn` finds a character in a room.
The hero also remembers which way it faces (down at first); the sword will need that. `reset` starts a new game.

# --goal-tr--

Kahraman 22 piksellik yeşil bir kare; `P` karesinin **ortasında** duruyor. `findIn` bir odada bir karakterin yerini
buluyor. Kahraman hangi yöne **baktığını** da hatırlıyor (önce aşağı); kılıç buna ihtiyaç duyacak. `reset` yeni bir
oyun başlatıyor.

# --code--

```js
const SIZE = 22 // the player's and the enemies' bodies
let player

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

  ctx.fillStyle = '#16a34a'
  ctx.fillRect(player.x, player.y, SIZE, SIZE)

reset()
```

# --meaning--

- `findIndex` finds the first row containing the character, `indexOf` its column.
- `(T - SIZE) / 2` is 5: the gap that centers a 22-pixel body on a 32-pixel tile.
- `dir: [0, 1]` means facing down: 0 sideways, 1 down.

# --meaning-tr--

- `lines.findIndex((line) => line.includes(ch))` → karakteri içeren ilk **satır**; `indexOf(ch)` o satırdaki
  **sütun**.
- `start.col * T` → karenin sol kenarı; `+ (T - SIZE) / 2` → 5 piksel içeri: 22 piksellik gövde 32 piksellik karede
  **ortalanır**.
- `dir: [0, 1]` → baktığı yön: yana 0, aşağı 1 (aşağı bakıyor).
- `reset` → oyuncuyu başa koyar ve ilk odaya girer; en alttaki `enter(0, 0)` yerine çağrılıyor.

# --task--

1. Under `TOP`, write `SIZE`; under `room`, write `player`.
2. Above `enter`, write `reset` and `findIn`.
3. In `draw`, draw the hero before `ctx.restore()`; at the bottom, call `reset()` instead of `enter(0, 0)`.

# --task-tr--

1. `TOP` satırının altına `SIZE`, `let room` satırının altına `let player` yaz.
2. `enter`'ın üstüne `reset` ve `findIn` yaz.
3. `draw`'da `ctx.restore()` satırının üstüne, bir boş satırdan sonra kahramanı çiz; en alttaki `enter(0, 0)`
   satırını `reset()` yap. **Çalıştır**.

# --tests--

The hero should stand in the middle of the start tile.
tr: Kahraman başlangıç karesinin ortasında durmalı.

```js
assert.deepEqual(findIn(ROOMS[1][1], 'E'), { row: 5, col: 7 })
assert.deepEqual(player, { x: 101, y: 69, dir: [0, 1] })
assert.deepEqual($.rects('#16a34a').map((r) => [r.x, r.y, r.w]), [[101, 69, 22]])
```

# --solution--

```js
// Dungeon adventure, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const T = 32 // one tile
const TOP = 48 // room for hearts, keys and the timer
const SIZE = 22 // the player's and the enemies' bodies
// Four rooms, in a 2 by 2 grid. # wall, D locked door, k key, h heart, e enemy, E the stairs out, P the start.
// A gap in the wall at the edge of a room leads to the room next to it.
const ROOMS = [
  [
    [
      '###############',
      '#.............#',
      '#..P..........#',
      '#....###......#',
      '#....#.....e..#',
      '#....#.........',
      '#.............#',
      '#..........h..#',
      '#.............#',
      '#.............#',
      '#######.#######',
    ],
    [
      '###############',
      '#.............#',
      '#..e......e...#',
      '#....#####....#',
      '#.............#',
      '..............#',
      '#.............#',
      '#...##...##...#',
      '#.......e.....#',
      '#.............#',
      '#######D#######',
    ],
  ],
  [
    [
      '#######.#######',
      '#.............#',
      '#..e..........#',
      '#...#######...#',
      '#.............#',
      '#.....k.......#',
      '#.............#',
      '#...#######...#',
      '#..........e..#',
      '#.............#',
      '###############',
    ],
    [
      '#######.#######',
      '#.............#',
      '#.e.........e.#',
      '#.............#',
      '#....#####....#',
      '#....#.E.#....#',
      '#....#...#....#',
      '#.............#',
      '#......e......#',
      '#.............#',
      '###############',
    ],
  ],
]
const COLS = 15
const ROWS = 11

let tiles // the current room, as arrays of characters we can change (doors open, keys are picked up)
let room // { rx, ry }: which room we are in
let player

function reset() {
  const start = findIn(ROOMS[0][0], 'P')
  player = { x: start.col * T + (T - SIZE) / 2, y: start.row * T + (T - SIZE) / 2, dir: [0, 1] }
  enter(0, 0)
}

function findIn(lines, ch) {
  const row = lines.findIndex((line) => line.includes(ch))
  return { row, col: lines[row].indexOf(ch) }
}

function enter(rx, ry) {
  room = { rx, ry }
  tiles = ROOMS[ry][rx].map((line) => [...line].map((ch) => (ch === 'P' || ch === 'e' ? '.' : ch)))
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(0, TOP)
  tiles.forEach((line, row) => {
    line.forEach((ch, col) => {
      const x = col * T
      const y = row * T
      ctx.fillStyle = ch === '#' ? '#57534e' : '#d6c7a1'
      ctx.fillRect(x, y, T, T)
    })
  })

  ctx.fillStyle = '#16a34a'
  ctx.fillRect(player.x, player.y, SIZE, SIZE)
  ctx.restore()
}

reset()
draw()
```
