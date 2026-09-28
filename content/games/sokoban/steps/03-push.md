---
title: Pushing boxes
title_tr: Kutu itmek
skills: [game.state, game.collision]
---

# --explanation--

The whole game is one rule: **you can push a box, but only one, and never into a wall.** When the tile you step onto
has a box, look one tile further in the same direction:

```
@ $ .     →     . @ $      the box moves into the free tile beyond
@ $ #     →     blocked    a wall is behind the box
@ $ $     →     blocked    another box is behind it: you are not strong enough for two
```

And you can never **pull**. That asymmetry is what makes Sokoban a puzzle: push a box into a corner and it is stuck
forever. Every move has consequences, so players have to think ahead.

Notice how short the rule is in code: two lookups (`walls.has`, `boxAt`) on the tile beyond. Choosing data structures
that answer your questions directly (a Set for walls, a lookup for boxes) keeps the game logic readable.

# --explanation-tr--

**Bu adımda:** kutuları iteceğiz. Oyuncuyu bir kutuya doğru yürütünce kutu bir kare ilerleyecek. Kutuyu hedefin üstüne
ittiğinde yeşile döndüğünü göreceksin.

**Oyunun bütün kuralı tek cümle:** bir kutuyu itebilirsin, ama **yalnızca bir tane** ve **asla duvara doğru** değil.
Gideceğin karede kutu varsa, aynı yönde **bir kare daha** ötesine bakarsın:

```
@ $ .     →     . @ $      kutunun arkası boş: kutu ilerler, sen de
@ $ #     →     olmaz      kutunun arkasında duvar var
@ $ $     →     olmaz      arkasında başka kutu var: iki kutuyu itecek kadar güçlü değilsin
```

Ve kutuyu asla **çekemezsin**. Sokoban'ı bulmaca yapan budur: bir kutuyu köşeye itersen sonsuza dek orada kalır. Her
hamlenin sonucu olduğu için önceden düşünmen gerekir.

**Kodda nasıl?** `move()` içinde, gideceğin karedeki kutuyu `boxAt` ile alırız:

```js
const box = boxAt(x, y)
if (box) { ... }
```

`boxAt` kutu yoksa `undefined` verir; `if (box)` yalnızca kutu **varsa** `{ }` içine girer. İçeride kutunun
gideceği kareyi hesaplarız: `bx = x + dx`, `by = y + dy` (oyuncunun gideceği karenin bir ötesi). Sonra:

- `walls.has(key(bx, by)) || boxAt(bx, by)` → "orada duvar var **ya da** (`||`) başka kutu var mı?" Varsa `return`:
  hiçbir şey olmaz, oyuncu da yerinde kalır.
- Yoksa kutunun konumunu değiştiririz: `box.x = bx`, `box.y = by`. `box` listedeki kutunun kendisi olduğu için bu
  değişiklik `boxes` listesinde de görünür.

`if`'ten sonra oyuncu her durumda yeni kareye geçer (`player = { x, y }`): ya kutu yoktu, ya da kutu az önce yol açtı.

Kural kodda ne kadar kısa, fark ettin mi? İki soru: `walls.has` ve `boxAt`. Sorularına doğrudan cevap veren veri
yapıları seçmek (duvarlar için `Set`, kutular için arama) oyun kodunu okunur tutar.

# --task--

In `move()`, replace "a box blocks the player" with pushing: if there is a box on the target tile, check the tile
beyond it (`x + dx`, `y + dy`). If that tile is a wall or has another box, do nothing. Otherwise move the box there,
then move the player.

# --task-tr--

1. `move()` fonksiyonunda `if (boxAt(x, y)) return // pushing comes in the next step` satırını sil ve yerine itme kodunu
   yaz. Fonksiyon şöyle olmalı:

   ```js
   function move(dx, dy) {
     const x = player.x + dx
     const y = player.y + dy
     if (walls.has(key(x, y))) return
     const box = boxAt(x, y)                                                           // ← yeni
     if (box) {                                                                        // ← yeni
       const bx = x + dx                                                               // ← yeni
       const by = y + dy                                                               // ← yeni
       if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
       box.x = bx                                                                      // ← yeni
       box.y = by                                                                      // ← yeni
     }                                                                                 // ← yeni
     player = { x, y }
   }
   ```

   (Ortadaki uzun `if (walls.has(...` satırı da yeni; sonundaki yorumla birlikte yaz.)

2. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla, sonra sağ oka bas: kutu hedefe gitmeli ve yeşile dönmeli. Alttaki
   kontrollerin hepsi yeşil olmalı. "İki kutu" kontrolü kırmızıysa `|| boxAt(bx, by)` kısmını unutmuş olabilirsin.

# --tests--

Walking into a box should push it one tile.
tr: Bir kutuya yürümek onu bir döşeme itmeli.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 2 })
assert.deepEqual(boxAt(3, 1), { x: 3, y: 1 })
assert.isUndefined(boxAt(3, 2))
```

A box should not move into a wall, and the player should stay put.
tr: Bir kutu duvara doğru hareket etmemeli, oyuncu da yerinde kalmalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.deepEqual(player, { x: 3, y: 2 })
assert.deepEqual(boxAt(3, 1), { x: 3, y: 1 })
```

Two boxes in a row should not move.
tr: Arka arkaya iki kutu hareket etmemeli.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowRight')
$.press('ArrowUp')
$.press('ArrowLeft')
$.press('ArrowLeft')
assert.deepEqual(player, { x: 4, y: 2 }, 'two boxes side by side cannot be pushed together')
assert.deepEqual(boxes.map((b) => [b.x, b.y]).sort(), [[2, 2], [3, 2]])
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
  const box = boxAt(x, y)
  if (box) {
    const bx = x + dx
    const by = y + dy
    if (walls.has(key(bx, by)) || boxAt(bx, by)) return // a box cannot push into a wall or another box
    box.x = bx
    box.y = by
  }
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
