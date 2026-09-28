---
title: A record for every level
title_tr: Her bölüm için bir rekor
skills: [game.state]
---

# --explanation--

Solving a level is one goal; solving it in **fewer moves** is the next. Keep a best (fewest) move count for **each**
level.

`localStorage` only stores strings, but a whole object can be stored as JSON text:

```js
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')   // { 0: 1, 1: 9 } or {} the first time
...
localStorage.setItem('sokoban-best', JSON.stringify(best))
```

The `|| '{}'` gives a sensible default when nothing was saved yet. An object keyed by level number is a small
**dictionary**: `best[level]` is `undefined` until that level has been solved once, which is exactly the "no record
yet" case to check (with `=== undefined`, since `0` would never be a real Sokoban record but it is good practice not to
treat falsy values as missing).

Show the record next to the move counter, so the player always knows the number to beat.

# --explanation-tr--

**Bu adımda:** her bölüm için ayrı bir rekor tutacağız: bölümü en az kaç hamlede çözdüğün. Sağ üstte `Moves: 12  (best 9)`
gibi, geçmen gereken sayıyı göreceksin. Sayfayı kapatıp açsan da rekorlar kalacak.

**Rekorlar bir sözlükte.** Her bölümün rekorunu, bölüm numarasına göre bir **nesnede** tutarız:

```js
{ 0: 1, 1: 9 }   // 1. bölüm (numara 0) 1 hamlede, 2. bölüm (numara 1) 9 hamlede çözüldü
```

`best[level]` o bölümün rekorudur. Bölüm hiç çözülmediyse `best[level]` `undefined` (yok) olur: "henüz rekor yok" durumu
tam budur.

**Kalıcı saklamak: `localStorage`.** Tarayıcının küçük bir defteri vardır; sayfa kapansa da içindekiler kalır.
`localStorage.setItem(ad, yazı)` kaydeder, `localStorage.getItem(ad)` okur. Defter yalnızca **yazı** saklar; bu yüzden
nesneyi 5. adımdaki gibi JSON yazısına çevirip saklarız:

```js
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')
localStorage.setItem('sokoban-best', JSON.stringify(best))
```

İlk oyunda kayıt yoktur ve `getItem` `null` verir. `|| '{}'` → "işe yarar bir değer yoksa `'{}'` kullan": `'{}'` boş bir
nesnenin yazısıdır, böylece `best` boş sözlükle başlar.

**Ne zaman kaydederiz?** Her hamlenin sonunda: bölüm çözüldüyse **ve** (henüz rekor yoksa **ya da** bu sefer daha az
hamle yapıldıysa):

```js
if (solved() && (best[level] === undefined || moves < best[level])) { ... }
```

Parantez önemli: önce içerideki "ya da" hesaplanır, sonra "ve" ile birleşir. `=== undefined` diye açıkça sorarız;
`!best[level]` yazsaydık `0` gibi bir sayı da "yok" sayılırdı. Sokoban'da 0 hamlelik rekor olmaz, ama bu iyi bir alışkanlık.

**Yazıda göstermek.** Rekor yoksa hiçbir şey, varsa `'  (best 9)'` eklenir:

```js
const record = best[level] === undefined ? '' : '  (best ' + best[level] + ')'
```

`''` boş yazıdır. `koşul ? a : b` "doğruysa `a`, değilse `b`".

# --task--

1. Add `let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}')`.
2. At the end of a move, if the level is now solved and `best[level]` is `undefined` or bigger than `moves`, set it and
   save the whole object with `JSON.stringify` under `'sokoban-best'`.
3. When a level has a record, show it after the move counter: `Moves: 12  (best 9)`.

# --task-tr--

1. `let history` satırının altına rekor sözlüğünü ekle:

   ```js
   let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}') // fewest moves, per level
   ```

2. `move()` fonksiyonunun sonunda, `moves += 1` satırının altına (son `}`'den önce) rekor kontrolünü ekle:

   ```js
     moves += 1
     if (solved() && (best[level] === undefined || moves < best[level])) { // ← yeni
       best[level] = moves                                                  // ← yeni
       localStorage.setItem('sokoban-best', JSON.stringify(best))           // ← yeni
     }                                                                      // ← yeni
   }
   ```

3. `draw()`'da hamle sayacını çizen satırı (`ctx.fillText('Moves: ' + moves, ...)`) şu iki satırla değiştir:

   ```js
     ctx.textAlign = 'right'
     const record = best[level] === undefined ? '' : '  (best ' + best[level] + ')' // ← yeni
     ctx.fillText('Moves: ' + moves + record, canvas.width - 12, TOP / 2)           // ← değişti
   ```

4. **Çalıştır**'a bas. Oynamak için önce oyuna tıkla. İlk bölümü çöz: sağ üstte `Moves: 1  (best 1)` görmelisin. Alttaki
   kontrollerin hepsi yeşil olmalı. Yazı kontrolü kırmızıysa `'  (best '` içindeki **iki boşluğu** kontrol et.

# --tests--

Solving a level should record its move count.
tr: Bir bölümü çözmek hamle sayısını kaydetmeli.

```js
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.strictEqual(best[1], 9)
assert.deepEqual(JSON.parse(localStorage.getItem('sokoban-best')), { 1: 9 })
assert.include($.texts(), 'Moves: 9  (best 9)')
```

A longer solution should not replace a better record.
tr: Daha uzun bir çözüm daha iyi bir rekorun yerini almamalı.

```js
best[1] = 9
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'LRRUUULDULD') $.press(keys[m])
assert.isTrue(solved())
assert.strictEqual(best[1], 9)
```

Records should be kept separately for each level.
tr: Rekorlar her bölüm için ayrı tutulmalı.

```js
$.press('ArrowRight')
loadLevel(1)
const keys = { R: 'ArrowRight', L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown' }
for (const m of 'RUUULDULD') $.press(keys[m])
assert.deepEqual(best, { 0: 1, 1: 9 })
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
let moves
let history
let best = JSON.parse(localStorage.getItem('sokoban-best') || '{}') // fewest moves, per level

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
  moves = 0
  history = []
}

function boxAt(x, y) {
  return boxes.find((box) => box.x === x && box.y === y)
}

function solved() {
  return boxes.every((box) => goals.has(key(box.x, box.y)))
}

function snapshot() {
  return JSON.stringify({ player, boxes, moves })
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
    history.push(snapshot())
    box.x = bx
    box.y = by
  } else {
    history.push(snapshot())
  }
  player = { x, y }
  moves += 1
  if (solved() && (best[level] === undefined || moves < best[level])) {
    best[level] = moves
    localStorage.setItem('sokoban-best', JSON.stringify(best))
  }
}

function undo() {
  const previous = history.pop()
  if (!previous) return
  ;({ player, boxes, moves } = JSON.parse(previous))
}

const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

document.addEventListener('keydown', (event) => {
  if (directions[event.key]) {
    event.preventDefault()
    move(...directions[event.key])
  }
  if (event.key === 'z') undo()
  if (event.key === 'r') loadLevel(level)
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
  ctx.textAlign = 'right'
  const record = best[level] === undefined ? '' : '  (best ' + best[level] + ')'
  ctx.fillText('Moves: ' + moves + record, canvas.width - 12, TOP / 2)

  ctx.textAlign = 'center'
  ctx.font = '14px sans-serif'
  if (solved()) {
    const last = level === LEVELS.length - 1
    ctx.fillStyle = '#4ade80'
    ctx.fillText(last ? 'All levels solved!' : 'Solved! Press Space for the next level', canvas.width / 2, canvas.height - 16)
  } else {
    ctx.fillStyle = '#a8a29e'
    ctx.fillText('Arrows: move   Z: undo   R: restart', canvas.width / 2, canvas.height - 16)
  }
}

loadLevel(0)
draw()
```
