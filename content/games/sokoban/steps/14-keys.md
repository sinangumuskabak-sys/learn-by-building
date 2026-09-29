---
title: Walk with the arrows
title_tr: Oklarla yürü
skills: [game.input]
---

# --goal--

Arrow keys call `move`. A lookup object maps each key name to its `[dx, dy]`, and after every key the picture is
drawn again. Sokoban is turn-based, so it needs no game loop.

# --goal-tr--

Şimdi ok tuşlarını bağlıyoruz. Tarayıcıya "bir tuşa basılınca bana haber ver" deriz: buna **olay dinlemek** (event
listener) denir; kapı zili gibi, çalınca ne yapılacağını önceden söylersin.

Sokoban **sıra tabanlı** bir oyun: bir tuş = bir adım. Saniyede 60 kez çizen bir döngüye gerek yok; tuşa basılınca
durumu değiştirir ve resmi **bir kez** yeniden çizeriz.

# --code--

```js
const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  draw()
})
```

# --meaning--

- `directions` is a lookup object: `directions['ArrowUp']` is `[0, -1]`. For any other key it is `undefined`, so the
  `if` asks "is this an arrow?".
- `event.preventDefault()` stops the arrows from scrolling the page.
- `...` spreads the pair into two arguments: `move(0, -1)`.
- `draw()` shows the new state after every key.

# --meaning-tr--

- `const directions = { ArrowLeft: [-1, 0], ... }` → bir **nesne**, burada bir **tablo** gibi: sol tarafta ad
  (anahtar), sağ tarafta değer. `directions['ArrowUp']` → `[0, -1]`.
- `document.addEventListener('keydown', (event) => { ... })` → sayfada bir tuşa **basıldığında** süslü parantez içini
  çalıştır. `event` basılan tuşun bilgilerini taşır; `event.key` tuşun adı (`'ArrowUp'` gibi).
- `if (directions[event.key])` → tabloda olmayan bir tuş sorulursa `undefined` (yok) gelir ve `if` girmez. Yani "bu bir
  ok tuşu mu?"
- `event.preventDefault()` → tarayıcının o tuşla yapacağı **kendi işini engeller**: ok tuşları normalde sayfayı kaydırır.
- `move(...directions[event.key])` → `...` çifti açıp iki ayrı değer olarak verir: `move(0, -1)` gibi.
- `draw()` → her tuştan sonra yeni durumu çiz.

# --task--

Above `function draw() {`, write `directions` and the listener, and leave an empty line. Press **Run**, click the game
and use the arrows.

# --task-tr--

1. `function draw() {` satırının **üstüne** `directions` tablosunu ve dinleyiciyi yaz; aralarda birer boş satır kalsın.
2. **Çalıştır**, oyuna bir kez **tıkla** (klavye oyuna gitsin) ve ok tuşlarına bas: mavi kare yürümeli, duvardan
   geçmemeli.

# --predict--

In the first level, you press the right arrow once. What happens?
- [ ] The box moves onto the goal
- [x] The player stands on the box
  `move` only checks walls so far. Boxes come next.
- [ ] Nothing, the box blocks the way

# --predict-tr--

İlk bölümde sağ oka bir kez basıyorsun. Ne olur?
- [ ] Kutu hedefe gider
- [x] Oyuncu kutunun üstüne çıkar
  `move` şimdilik sadece duvarlara bakıyor. Kutular sıradaki adımda.
- [ ] Hiçbir şey; kutu yolu kapatır

# --hint--

Key names are case-sensitive: `ArrowUp` with a capital `A` and `U`. Click the game before pressing keys.

# --hint-tr--

Tuş adlarında büyük/küçük harf önemli: `ArrowUp` büyük `A` ve büyük `U` ile. Tuşlara basmadan önce oyuna tıkla.

# --tests--

The player should walk one tile per arrow key.
tr: Oyuncu her ok tuşunda bir kare yürümeli.

```js
loadLevel(1)
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 })
$.press('ArrowRight')
assert.deepEqual(player, { x: 4, y: 3 })
$.press('ArrowLeft')
$.press('ArrowDown')
assert.deepEqual(player, { x: 3, y: 4 })
```

Other keys should not move the player.
tr: Diğer tuşlar oyuncuyu yürütmemeli.

```js
loadLevel(1)
$.press('a')
$.press('Enter')
assert.deepEqual(player, { x: 3, y: 4 })
```

The picture should be drawn again after a key.
tr: Tuştan sonra resim yeniden çizilmeli.

```js
$.press('ArrowDown')
$.press('ArrowRight')
assert.deepEqual($.rects('#38bdf8'), [{ x: 178 + 48, y: 250, w: 28, h: 28, color: '#38bdf8' }])
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

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  player = { x, y }
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  draw()
})

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
