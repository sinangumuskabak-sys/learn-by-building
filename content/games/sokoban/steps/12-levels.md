---
title: Two more levels
title_tr: İki bölüm daha
skills: [prog.arrays]
---

# --goal--

Because a level is only text, adding one is just writing it. We add a small room with two boxes and a harder level
with seven.

# --goal-tr--

Bölüm sadece yazı olduğu için yeni bölüm eklemek, onu **yazmak** kadar kolay. İki bölüm ekliyoruz: iki kutulu küçük
bir oda ve yedi kutulu, daha zor bir bölüm. (İnternette binlerce Sokoban bölümü bu biçimde paylaşılır; hepsini
buraya yapıştırabilirsin.)

Satırların içindeki **boşluklar da önemli**: boşluk, üzerinde yürünebilen zemin demek.

# --code--

```js
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
```

# --meaning--

- Each level is one more item of `LEVELS`, separated by commas.
- A space is floor. Rows can have different lengths; `cols` takes the longest.
- `*` in the third level is a box already on a goal.

# --meaning-tr--

- Her bölüm `LEVELS` listesinin bir elemanı: köşeli parantez içinde satırlar, sonunda virgül.
- Boşluk → üstünde yürünebilen **zemin**. Duvarın dışındaki boşluklar (üçüncü bölümün sol üstü) sadece hizalama için.
- Satırlar farklı uzunlukta olabilir; `cols` en uzununu alıyor, `Math.max` bu yüzden vardı.
- Üçüncü bölümdeki `*` → baştan hedefin üstünde duran bir kutu.
- `LEVELS[1]` ikinci bölüm, `LEVELS[2]` üçüncü (sayma 0'dan başlar).

# --task--

Inside `LEVELS`, under the first level's `],`, write the two new levels. Press **Run**.

# --task-tr--

`LEVELS` listesinin içinde, ilk bölümü kapatan `],` satırının altına iki yeni bölümü yaz; listeyi kapatan `]` en sonda
kalsın. Boşlukları doğru yazmak zor; bu bölümleri kopyalayıp yapıştırabilirsin. **Çalıştır**. Ekranda hâlâ ilk bölüm
var; aşağıdaki denemeyle diğerlerine bakabilirsin.

# --try--

At the bottom, change `loadLevel(0)` to `loadLevel(2)` and run to see the third level. Put `0` back.

# --try-tr--

En alttaki `loadLevel(0)`'ı `loadLevel(2)` yap ve çalıştır: üçüncü bölümü görürsün. Sonra `0`'a geri al.

# --tests--

There should be three levels.
tr: Üç bölüm olmalı.

```js
assert.lengthOf(LEVELS, 3)
```

The second level should load with two boxes and two goals, and nothing left over from the first.
tr: İkinci bölüm iki kutu ve iki hedefle yüklenmeli; ilk bölümden bir şey kalmamalı.

```js
loadLevel(1)
assert.strictEqual(level, 1)
assert.lengthOf(boxes, 2)
assert.strictEqual(goals.size, 2)
assert.deepEqual(player, { x: 3, y: 4 })
assert.isFalse(walls.has('4,1'), 'no walls left over from level 1')
```

The third level should have seven boxes and seven goals.
tr: Üçüncü bölümde yedi kutu ve yedi hedef olmalı.

```js
loadLevel(2)
assert.lengthOf(boxes, 7)
assert.strictEqual(goals.size, 7)
assert.deepEqual(player, { x: 2, y: 2 })
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
  for (const box of boxes) tile(box.x, box.y, '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
