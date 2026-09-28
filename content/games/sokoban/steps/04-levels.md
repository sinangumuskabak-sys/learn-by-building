---
title: Solved! On to the next level
title_tr: Çözüldü! Sıradaki bölüme
skills: [game.state]
---

# --explanation--

A level is solved when **every box sits on a goal**. The level format guarantees there are exactly as many goals as
boxes, so checking the boxes is enough:

```js
boxes.every((box) => goals.has(key(box.x, box.y)))
```

This is also where the choice of `Set` pays off again: "is this tile a goal?" is a single `has` call.

Once solved, the board freezes (no more moves), a message appears, and Space loads the next level with `loadLevel(level
+ 1)`. Because loading a level rebuilds everything from its text, moving on is one call. The game already knew how to
start fresh, and a new level is just a fresh start with a different map.

A level counter at the top tells the player where they are. Boxes that sit on goals are already drawn green, which gives
feedback on progress before the level is fully solved.

# --explanation-tr--

**Bu adımda:** bölüm çözülünce oyun bunu anlayacak. Altta yeşil `Solved! Press Space for the next level` yazısı çıkacak,
**Boşluk** tuşu sıradaki bölümü açacak. Sol üstte `Level 1/3` gibi bir sayaç göreceksin.

**Ne zaman çözüldü?** **Her kutu bir hedefin üstündeyse.** Bölüm düzeninde hedef sayısı kutu sayısına eşittir, bu yüzden
kutulara bakmak yeter:

```js
boxes.every((box) => goals.has(key(box.x, box.y)))
```

`every` listenin **her elemanı** için soruyu sorar; hepsi "evet" derse `true` (doğru), biri bile "hayır" derse `false`
(yanlış) verir. Soru: "bu kutunun karesi bir hedef mi?" `Set` burada yine işe yarar: tek bir `has` çağrısı.

**Çözülünce ne olur?**

- Tahta donar: `move()`'un ilk satırı `if (solved()) return` olur, yani çözülmüşse hiç hareket yok.
- Boşluk (`' '`) sıradaki bölümü yükler: `loadLevel(level + 1)`. Bölüm yüklemek her şeyi yazıdan baştan kurduğu için
  sıradaki bölüme geçmek tek bir çağrıdır.
- Ama son bölümdeysek sıradaki yok. `LEVELS.length` bölüm sayısı (3), son bölümün numarası ise `LEVELS.length - 1` (2),
  çünkü sayma 0'dan başlar. `level < LEVELS.length - 1` → "son bölümde değil miyiz?" `&&` ("ve") ile üç koşulu birleştiririz:
  tuş Boşluk **ve** çözüldü **ve** son bölüm değil.

**Yazılar.**

- `'Level ' + (level + 1) + '/' + LEVELS.length` → `'Level 1/3'`. `level` 0'dan başlar ama insanlar 1'den sayar; parantez
  `level + 1`'in önce toplanmasını sağlar (yoksa yazıya `0` ve `1` ayrı ayrı eklenirdi: `'Level 01/3'`).
- `ctx.fillText(yazı, x, y)` yazıyı boyar. `ctx.textAlign` yazının yatay hizası (`'left'` sola, `'center'` ortaya),
  `ctx.textBaseline = 'middle'` ise dikey hizasıdır: yazının ortası `y`'ye gelir.
- Altta `if ... else` ile iki yazıdan biri: çözüldüyse yeşil mesaj, değilse gri `Arrows: move` ipucu. `else` "değilse"
  demektir. Son bölümde mesaj `All levels solved!` olur: `last ? a : b` → "son bölümse `a`, değilse `b`".

# --task--

1. Write `solved()` returning whether every box is on a goal.
2. `move()` should do nothing once the level is solved.
3. On Space, when the level is solved and it is not the last one, load the next level.
4. Draw `Level 2/3` left-aligned at `(12, TOP / 2)` with `textBaseline = 'middle'` (white, `'bold 18px sans-serif'`).
   At the bottom center, `(canvas.width / 2, canvas.height - 16)` in `'14px sans-serif'`, show
   `Solved! Press Space for the next level` in green `'#4ade80'` when solved (`All levels solved!` on the last level),
   or `Arrows: move` in grey `'#a8a29e'` otherwise.

# --task-tr--

1. `boxAt` fonksiyonunun kapanış `}`'sinin altına `solved()`'u yaz:

   ```js
   function solved() {
     return boxes.every((box) => goals.has(key(box.x, box.y)))
   }
   ```

2. `move()` fonksiyonunun **ilk satırı** olarak şunu ekle:

   ```js
   function move(dx, dy) {
     if (solved()) return // ← yeni
     const x = player.x + dx
   ```

3. `keydown` dinleyicisinde `draw()` satırının hemen **üstüne** Boşluk tuşunu ekle:

   ```js
   document.addEventListener('keydown', (event) => {
     if (directions[event.key]) {
       event.preventDefault()
       move(...directions[event.key])
     }
     if (event.key === ' ' && solved() && level < LEVELS.length - 1) loadLevel(level + 1) // ← yeni
     draw()
   })
   ```

4. `draw()`'un en sonunda, `tile(player.x, player.y, '#38bdf8', 10)` satırının altına (fonksiyonun son `}`'sinden önce)
   yazıları ekle:

   ```js
     ctx.fillStyle = 'white'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.textBaseline = 'middle'
     ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)

     ctx.textAlign = 'center'
     ctx.font = '14px sans-serif'
     if (solved()) {
       const last = level === LEVELS.length - 1
       ctx.fillStyle = '#4ade80'
       ctx.fillText(last ? 'All levels solved!' : 'Solved! Press Space for the next level', canvas.width / 2, canvas.height - 16)
     } else {
       ctx.fillStyle = '#a8a29e'
       ctx.fillText('Arrows: move', canvas.width / 2, canvas.height - 16)
     }
   ```

5. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. Sağ okla kutuyu hedefe it: altta yeşil mesaj çıkmalı. **Boşluk**'a
   bas: `Level 2/3` açılmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

Pushing the only box onto the goal should solve the first level.
tr: Tek kutuyu hedefe itmek ilk bölümü çözmeli.

```js
assert.isFalse(solved())
$.press('ArrowRight')
assert.isTrue(solved())
assert.include($.texts(), 'Solved! Press Space for the next level')
$.press('ArrowLeft')
assert.deepEqual(player, { x: 2, y: 1 }, 'the board is frozen once solved')
```

Space should load the next level.
tr: Boşluk sıradaki bölümü yüklemeli.

```js
$.press('ArrowRight')
$.press(' ')
assert.strictEqual(level, 1)
assert.isFalse(solved())
assert.include($.texts(), 'Level 2/3')
```

The second level should be solvable with the right moves.
tr: İkinci bölüm doğru hamlelerle çözülebilmeli.

```js
loadLevel(1)
const moves = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(moves[m])
assert.isTrue(solved())
```

The last level should say that everything is solved.
tr: Son bölüm her şeyin çözüldüğünü söylemeli.

```js
loadLevel(2)
const moves = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RURRDDDDLDRUUUULLLRDRDRDDLLDLLURLU') $.press(moves[m])
assert.isTrue(solved())
assert.include($.texts(), 'All levels solved!')
$.press(' ')
assert.strictEqual(level, 2)
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

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function move(dx, dy) {
  if (solved()) return
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
  if (event.key === ' ' && solved() && level < LEVELS.length - 1) loadLevel(level + 1)
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Level ' + (level + 1) + '/' + LEVELS.length, 12, TOP / 2)

  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  if (solved()) {
    const last = level === LEVELS.length - 1
    ctx.fillStyle = '#4ade80'
    ctx.fillText(last ? 'All levels solved!' : 'Solved! Press Space for the next level', canvas.width / 2, canvas.height - 16)
  } else {
    ctx.fillStyle = '#a8a29e'
    ctx.fillText('Arrows: move', canvas.width / 2, canvas.height - 16)
  }
}

loadLevel(0)
draw()
```
