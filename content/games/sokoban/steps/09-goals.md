---
title: The goals
title_tr: Hedefler
skills: [game.state, game.canvas]
---

# --goal--

Goals never move either, so they also go in a Set. Three characters mean a goal: `.`, and `*` and `+` (a box or the
player standing on one). They are drawn as small orange dots.

# --goal-tr--

Sırada **hedefler**: kutuların gideceği yerler. Onlar da hiç yer değiştirmez, bu yüzden onları da bir kümede tutarız.

Dikkat: üç harf hedef demek. `.` boş bir hedef; `*` üstünde kutu olan bir hedef; `+` üstünde oyuncu duran bir hedef.
Hedefleri turuncu, küçük bir nokta olarak çizeceğiz.

# --code--

```js
let goals

  goals = new Set()

      if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))

  for (const k of goals) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#f59e0b', 18)
  }
```

# --meaning--

- `goals` is a new Set, emptied in `loadLevel` like `walls`.
- `||` means "or": the character is a goal if it is `.`, `*` or `+`.
- The goals are drawn like the walls, in orange, inset by 18 pixels: a 12-pixel dot.

# --meaning-tr--

- `let goals` → hedeflerin kümesi; `loadLevel` içinde `goals = new Set()` ile her yüklemede boşalır.
- `ch === '.' || ch === '*' || ch === '+'` → `||` "**veya**": harf bu üçünden biriyse hedef.
- Bu satır ayrı bir `if`; duvar satırının **altına** gelir. Bir harf birden çok şey olabileceği için (`*` hem kutu hem
  hedef) her soru ayrı bir `if`.
- `tile(x, y, '#f59e0b', 18)` → turuncu, 18 piksel içeri çekilmiş: 48 − 36 = 12 piksellik küçük bir nokta.

# --task--

1. Under `let walls` write `let goals`.
2. In `loadLevel`, under `walls = new Set()` write `goals = new Set()`; under the wall `if`, write the goal `if`.
3. In `draw`, under the walls loop, write the goals loop. Press **Run**.

# --task-tr--

1. `let walls` satırının altına `let goals` yaz.
2. `loadLevel` içinde `walls = new Set()` satırının altına `goals = new Set()` yaz.
3. Aynı fonksiyonda `if (ch === '#') ...` satırının altına hedef satırını yaz.
4. `draw` içinde duvar döngüsünün kapanan `}`'sinin altına hedef döngüsünü yaz.
5. **Çalıştır**: koridorun sağ ucunda turuncu küçük bir nokta görmelisin.

# --tests--

The goal of the first level should be read.
tr: İlk bölümün hedefi okunmalı.

```js
assert.instanceOf(goals, Set)
assert.sameMembers([...goals], ['3,1'])
```

`*` and `+` should count as goals too.
tr: `*` ve `+` de hedef sayılmalı.

```js
LEVELS.push(['#####', '#+*.#', '#####'])
loadLevel(LEVELS.length - 1)
assert.sameMembers([...goals], ['1,1', '2,1', '3,1'])
```

The goal should be drawn as an orange dot.
tr: Hedef turuncu bir nokta olarak çizilmeli.

```js
draw()
assert.deepEqual($.rects('#f59e0b'), [{ x: 120 + 3 * 48 + 18, y: 192 + 48 + 18, w: 12, h: 12, color: '#f59e0b' }])
```

# --solution--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 48
const TOP = 48 // room for the level number and the move counter
const BOTTOM = 40 // room for the hint line
// The classic Sokoban text format: # wall, . goal, $ box, * box on a goal, @ player, + player on a goal.
const LEVELS = [
  [
    '#####',
    '#@$.#',
    '#####',
  ],
]

let level = 0
let walls
let goals

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  goals = new Set()
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
      if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))
    })
  })
}

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Center the level on the canvas.
  const rows = LEVELS[level].length
  const cols = Math.max(...LEVELS[level].map((line) => line.length))
  const ox = (canvas.width - cols * TILE) / 2
  const oy = TOP + (canvas.height - TOP - BOTTOM - rows * TILE) / 2
  const tile = (x, y, color, inset = 0) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + x * TILE + inset, oy + y * TILE + inset, TILE - inset * 2, TILE - inset * 2)
  }

  for (const k of walls) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#78716c', 1)
  }
  for (const k of goals) {
    const [x, y] = k.split(',').map(Number)
    tile(x, y, '#f59e0b', 18)
  }
}

loadLevel(0)
draw()
```
