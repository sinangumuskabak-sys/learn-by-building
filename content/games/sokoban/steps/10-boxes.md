---
title: The boxes
title_tr: Kutular
skills: [prog.arrays, game.state]
---

# --goal--

Boxes move, so they are not keys in a Set but `{ x, y }` objects in an array: `$` and `*` each add one.

# --goal-tr--

Şimdi **kutular**. Kutular duvar ve hedeften farklı: **hareket edecekler**. Bu yüzden onları kümeye yazı olarak değil,
bir **listede** `{ x, y }` **nesneleri** olarak tutacağız; itince sayılarını değiştireceğiz.

İki harf kutu demek: `$` (kutu) ve `*` (hedefin üstündeki kutu). Kutular kahverengi, büyükçe kareler olacak.

# --code--

```js
let boxes

  boxes = []

      if (ch === '$' || ch === '*') boxes.push({ x, y })

  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
```

# --meaning--

- `boxes = []` starts an empty array on every load.
- `boxes.push({ x, y })` adds a box object at the end. `{ x, y }` is short for `{ x: x, y: y }`.
- The loop draws each box in brown, inset by 6 pixels.

# --meaning-tr--

- `let boxes` → kutuların listesi.
- `boxes = []` → `loadLevel` içinde: boş bir liste. Her yüklemede temiz başlar.
- `{ x, y }` → bir **nesne**: adlandırılmış değerlerden oluşan küçük bir kart. `{ x: x, y: y }`'nin kısa yazılışı:
  "x adında x'in değeri, y adında y'nin değeri".
- `boxes.push(...)` → listenin **sonuna ekler**.
- `for (const box of boxes) tile(box.x, box.y, '#b45309', 6)` → her kutu için bir kare: kahverengi, 6 piksel içeri
  çekilmiş. `box.x` "kutunun x'i". Döngünün tek komutu olduğu için süslü parantez gerekmez.

# --task--

1. Under `let goals` write `let boxes`.
2. In `loadLevel`, under `goals = new Set()` write `boxes = []`; under the goal `if`, write the box `if`.
3. In `draw`, under the goals loop, write the box line. Press **Run**.

# --task-tr--

1. `let goals` satırının altına `let boxes` yaz.
2. `loadLevel` içinde `goals = new Set()` satırının altına `boxes = []`, hedef `if`'inin altına kutu `if`'ini yaz.
3. `draw` içinde hedef döngüsünün altına kutu satırını yaz.
4. **Çalıştır**: koridorun ortasında kahverengi bir kutu görmelisin.

# --tests--

The box of the first level should be read.
tr: İlk bölümün kutusu okunmalı.

```js
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
```

`*` should be a box and a goal at the same time.
tr: `*` aynı anda hem kutu hem hedef olmalı.

```js
LEVELS.push(['#####', '# *.#', '#####'])
loadLevel(LEVELS.length - 1)
assert.deepEqual(boxes, [{ x: 2, y: 1 }])
assert.isTrue(goals.has('2,1'))
```

The box should be drawn in brown.
tr: Kutu kahverengi çizilmeli.

```js
draw()
assert.deepEqual($.rects('#b45309'), [{ x: 120 + 2 * 48 + 6, y: 192 + 48 + 6, w: 36, h: 36, color: '#b45309' }])
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
let boxes

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
  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
}

loadLevel(0)
draw()
```
