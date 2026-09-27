---
title: Reading a level
title_tr: Bir bölümü okumak
skills: [prog.arrays, game.state]
---

# --explanation--

Sokoban puzzles have been shared for decades in one tiny text format:

```
#  wall        .  goal        $  box        @  player
*  box that is already on a goal            +  player standing on a goal
```

Using an existing standard means you can paste in any of the thousands of published levels. Reading it is a job of
turning characters into **state**: walk every character with its `x` and `y`, and sort what you find.

Walls and goals never move, and the only question you will ever ask them is "is there one at this tile?". A **`Set`**
answers that instantly (`walls.has(...)`), but a Set can only compare simple values, not `{x, y}` objects (two objects
with the same numbers are still different objects). So turn each position into a **string key**:

```js
const key = (x, y) => x + ',' + y   // key(3, 2) is "3,2"
walls.add(key(x, y))
```

Boxes do move, so they stay a list of `{ x, y }` objects. Notice `*` and `+`: one character sets **two** things (a box
and a goal, or the player and a goal), which is why each test is its own `if`, not an `else if`.

# --explanation-tr--

Sokoban bulmacaları on yıllardır tek bir minik metin biçimiyle paylaşılıyor:

```
#  duvar        .  hedef        $  kutu        @  oyuncu
*  zaten hedefte olan kutu                    +  bir hedefin üstünde duran oyuncu
```

Var olan bir standardı kullanmak, yayımlanmış binlerce bölümden herhangi birini yapıştırabileceğin demek. Onu okumak
karakterleri **duruma** çevirme işidir: her karakteri `x` ve `y`'siyle gez ve bulduğunu ayır.

Duvarlar ve hedefler hiç hareket etmez ve onlara soracağın tek soru "bu döşemede bir tane var mı?"dır. Bir **`Set`** bunu
anında cevaplar (`walls.has(...)`), ama bir küme yalnızca basit değerleri karşılaştırabilir, `{x, y}` nesnelerini değil
(aynı sayılara sahip iki nesne yine de farklı nesnelerdir). Bu yüzden her konumu bir **metin anahtarına** çevir:

```js
const key = (x, y) => x + ',' + y   // key(3, 2) "3,2"dir
walls.add(key(x, y))
```

Kutular hareket eder, bu yüzden `{ x, y }` nesnelerinden oluşan bir liste olarak kalırlar. `*` ve `+`'ya dikkat et: tek
bir karakter **iki** şeyi ayarlar (bir kutu ve bir hedef ya da oyuncu ve bir hedef); bu yüzden her kontrol `else if`
değil kendi `if`'idir.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, add `TILE = 48`, `TOP = 48`, `BOTTOM = 40` and the `LEVELS` array from the
   solution (three levels, each a list of strings).
2. Add `let level = 0`, `let walls`, `let goals`, `let boxes`, `let player` and `const key = (x, y) => x + ',' + y`.
3. Write `loadLevel(index)`: set `level`, make `walls` and `goals` new `Set`s and `boxes` an empty array, then read every
   character of `LEVELS[level]`: `#` adds a wall; `.`, `*` and `+` add a goal; `$` and `*` add a box; `@` and `+` set
   `player`.
4. Write `draw()` as in the solution (level centered; walls, goals, boxes, player) and call `loadLevel(0)` and `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut; `TILE = 48`, `TOP = 48`, `BOTTOM = 40` ve çözümdeki `LEVELS` dizisini (her biri bir
   metin listesi olan üç bölüm) ekle.
2. `let level = 0`, `let walls`, `let goals`, `let boxes`, `let player` ve `const key = (x, y) => x + ',' + y` ekle.
3. `loadLevel(index)` yaz: `level`'ı ayarla, `walls` ve `goals`'u yeni `Set`'ler, `boxes`'ı boş bir dizi yap, sonra
   `LEVELS[level]`'ın her karakterini oku: `#` bir duvar ekler; `.`, `*` ve `+` bir hedef ekler; `$` ve `*` bir kutu
   ekler; `@` ve `+` `player`'ı ayarlar.
4. `draw()`'u çözümdeki gibi yaz (bölüm ortalı; duvarlar, hedefler, kutular, oyuncu) ve `loadLevel(0)` ile `draw()`
   çağır.

# --tests--

The first level should be read into walls, a goal, a box and the player.
tr: İlk bölüm duvarlara, bir hedefe, bir kutuya ve oyuncuya okunmalı.

```js
assert.lengthOf(LEVELS, 3)
assert.strictEqual(key(3, 2), '3,2')
assert.strictEqual(walls.size, 12)
assert.isTrue(walls.has('0,0'))
assert.sameMembers([...goals], ['3,1'])
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
assert.deepEqual(player, { x: 1, y: 1 })
```

`*` and `+` should each count as two things.
tr: `*` ve `+` her biri iki şey sayılmalı.

```js
LEVELS.push(['#####', '#+*.#', '#####'])
loadLevel(3)
assert.sameMembers([...goals], ['1,1', '2,1', '3,1'])
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
assert.deepEqual(player, { x: 1, y: 1 })
LEVELS.pop()
```

Loading another level should start from a clean slate.
tr: Başka bir bölüm yüklemek temiz bir sayfadan başlamalı.

```js
loadLevel(1)
assert.strictEqual(level, 1)
assert.lengthOf(boxes, 2)
assert.strictEqual(goals.size, 2)
assert.deepEqual(player, { x: 3, y: 4 })
assert.isFalse(walls.has('4,1'), 'no walls left over from level 1')
```

The level should be drawn centered.
tr: Bölüm ortalanarak çizilmeli.

```js
draw()
assert.deepInclude($.rects('#38bdf8'), { x: 178, y: 250, w: 28, h: 28, color: '#38bdf8' })
```

# --seed--

```js
// Sokoban, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
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
  [
    '######',
    '#    #',
    '# $$ #',
    '# .. #',
    '#  @ #',
    '######',
  ],
  [
    '  #####',
    '###   #',
    '#.@$  #',
    '### $.#',
    '#.##$ #',
    '# # . ##',
    '#$ *$$.#',
    '#   .  #',
    '########',
  ],
]

let level = 0
let walls
let goals
let boxes
let player

const key = (x, y) => x + ',' + y // one string per tile, so tiles can go in a Set

function loadLevel(index) {
  level = index
  walls = new Set()
  goals = new Set()
  boxes = []
  LEVELS[level].forEach((line, y) => {
    ;[...line].forEach((ch, x) => {
      if (ch === '#') walls.add(key(x, y))
      if (ch === '.' || ch === '*' || ch === '+') goals.add(key(x, y))
      if (ch === '$' || ch === '*') boxes.push({ x, y })
      if (ch === '@' || ch === '+') player = { x, y }
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
  for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
