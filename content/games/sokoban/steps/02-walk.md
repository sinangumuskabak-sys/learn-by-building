---
title: Walking on a grid
title_tr: Izgarada yürümek
skills: [game.input]
---

# --explanation--

Sokoban has no physics and no time: one key press is exactly one step, one tile. That makes it a pure **turn-based**
game, so, like Tic-tac-toe and 2048, it needs no loop. Handle the key, change the state, redraw.

Arrow keys map to a direction as `[dx, dy]` pairs in a lookup object:

```js
const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
move(...directions[event.key])   // spread the pair into move(dx, dy)
```

`move` looks at the target tile first: a wall blocks the step, and for now, so does a box (pushing comes next). Only if
the tile is free does the player move.

`event.preventDefault()` on the arrow keys stops them from scrolling the page while you play.

# --explanation-tr--

**Bu adımda:** oyuncuyu ok tuşlarıyla yürüteceğiz. Her basış tam bir kare. Duvarlar ve (şimdilik) kutular yolu kapatacak.

**Sıra tabanlı oyun.** Sokoban'da fizik ve zaman yok: bir tuş = bir adım. Bu yüzden saniyede 60 kez çalışan bir oyun
döngüsüne gerek yok. Tuşa basılınca durumu değiştirir, sonra yeniden çizeriz.

**Tuşu dinlemek (olay, event).** Tarayıcı bir tuşa basıldığında `keydown` adında bir **olay** yayar:

```js
document.addEventListener('keydown', (event) => { ... })
```

"Sayfada her tuşa basıldığında `{ }` içini çalıştır." `event.key` basılan tuşun adıdır: `'ArrowLeft'` (sol ok),
`'ArrowUp'` (yukarı ok) gibi.

**Yön tablosu.** Her ok tuşu bir yöne karşılık gelir; yön `[dx, dy]` çiftiyle yazılır: `x`'e ve `y`'ye ne eklenecek.
`y` aşağı doğru büyüdüğü için yukarı `[0, -1]`'dir. Bunları bir **nesnede** (anahtar–değer tablosu) tutarız:

```js
const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
```

`directions['ArrowUp']` → `[0, -1]`. Tabloda olmayan bir tuş sorulursa `undefined` (yok) gelir; `if (directions[event.key])`
böylece "bu bir ok tuşu mu?" diye sorar.

`move(...directions[event.key])` → `...` çifti açıp iki ayrı değer olarak verir: `move(0, -1)` gibi.

`event.preventDefault()` tarayıcının o tuşla yapacağı kendi işini engeller: ok tuşları normalde sayfayı kaydırır.

**Kutu var mı? `boxAt(x, y)`.** `boxes.find(...)` listede koşula uyan **ilk** elemanı verir, hiçbiri uymazsa `undefined`.
Koşul: kutunun `x`'i ve (`&&`) `y`'si verilen sayılara eşit mi. `return` bulunan değeri fonksiyondan **geri verir**.

**`move(dx, dy)`.** Önce gidilecek kareyi hesaplar (`player.x + dx`, `player.y + dy`). Sonra sırayla sorar:

- duvar mı? (`walls.has(key(x, y))`) → `return`, yani hiçbir şey yapmadan fonksiyondan çık;
- kutu mu? → şimdilik o da engel (itmeyi sonraki adımda ekleyeceğiz);
- ikisi de değilse oyuncu oraya geçer: `player = { x, y }`.

En sonda `draw()` çağrılır ki yeni durum ekranda görünsün.

# --task--

1. Write `boxAt(x, y)` that returns the box at a tile, or `undefined`.
2. Write `move(dx, dy)`: the target tile is `player.x + dx`, `player.y + dy`; if it is a wall or has a box, do nothing;
   otherwise move the player there.
3. On `keydown`, map the arrow keys to directions with a lookup object, call `event.preventDefault()` and `move`, then
   `draw()`.

# --task-tr--

1. `loadLevel` fonksiyonunun kapanış `}`'sinin altına, `function draw()` satırından önce, bir satır boşluk bırakıp şunları
   yaz:

   ```js
   function boxAt(x, y) {
     return boxes.find((box) => box.x === x && box.y === y)
   }

   function move(dx, dy) {
     const x = player.x + dx
     const y = player.y + dy
     if (walls.has(key(x, y))) return
     if (boxAt(x, y)) return // pushing comes in the next step
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
   ```

2. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra ok tuşlarına bas: mavi kare her basışta bir kare yürümeli,
   duvar ve kutudan geçememeli. Alttaki kontrollerin hepsi yeşil olmalı. `ArrowLeft` gibi adlarda büyük harflere dikkat.

# --tests--

The player should walk one tile per key press.
tr: Oyuncu her tuş basışında bir döşeme yürümeli.

```js
loadLevel(1)
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 })
$.press('ArrowRight')
assert.deepEqual(player, { x: 4, y: 3 })
```

Walls should block the player.
tr: Duvarlar oyuncuyu engellemeli.

```js
loadLevel(1)
$.press('ArrowRight')
$.press('ArrowRight')
$.press('ArrowRight')
assert.deepEqual(player, { x: 4, y: 4 })
$.press('ArrowDown')
assert.deepEqual(player, { x: 4, y: 4 })
```

For now, boxes should block the player too.
tr: Şimdilik kutular da oyuncuyu engellemeli.

```js
loadLevel(1)
assert.deepEqual(boxAt(2, 2), { x: 2, y: 2 })
assert.isUndefined(boxAt(1, 1))
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 3 }, 'the box at (3, 2) is in the way')
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

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function move(dx, dy) {
  const x = player.x + dx
  const y = player.y + dy
  if (walls.has(key(x, y))) return
  if (boxAt(x, y)) return // pushing comes in the next step
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
  for (const box of boxes) tile(box.x, box.y, goals.has(key(box.x, box.y)) ? '#22c55e' : '#b45309', 6)
  tile(player.x, player.y, '#38bdf8', 10)
}

loadLevel(0)
draw()
```
