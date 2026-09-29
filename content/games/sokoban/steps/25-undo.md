---
title: Undo
title_tr: Geri al
skills: [prog.arrays, game.state]
---

# --goal--

`undo()` takes the last photo off `history` and puts everything back as it was. The **Z** key calls it.

# --goal-tr--

Defter hazır; şimdi **geri alıyoruz**. `undo` (geri al) son fotoğrafı defterden **çıkarır** ve oyuncuyu, kutuları ve
hamle sayısını o fotoğraftaki hâline döndürür. **Z** tuşu onu çağıracak.

"Sona ekle, sondan al" diye çalışan listeye **yığın** (stack) denir; üst üste konmuş tabaklar gibi: en son koyduğun
tabağı ilk alırsın. Geri alma için tam uygun: en son hamle ilk geri alınır.

# --code--

```js
function undo() {
  const previous = history.pop()
  if (!previous) return
  ;({ player, boxes, moves } = JSON.parse(previous))
}

  if (event.key.toLowerCase() === 'z') undo()
```

# --meaning--

- `history.pop()` removes and gives back the last photo, or `undefined` if there is none; then we return.
- `JSON.parse` turns the text back into an object, and `({ player, boxes, moves } = ...)` puts its three values back
  into the three variables. The `;` and the parentheses are needed because a line cannot start with `{` here.
- `toLowerCase()` makes `Z` (Caps Lock) work too.

# --meaning-tr--

- `history.pop()` → listenin **son** elemanını çıkarır ve verir. Liste boşsa `undefined` verir.
- `if (!previous) return` → `!` "değil": fotoğraf **yoksa** hiçbir şey yapma.
- `JSON.parse(previous)` → yazıyı yeniden **nesneye** çevirir (`stringify`'ın tersi).
- `({ player, boxes, moves } = ...)` → "gelen nesnedeki `player`'ı `player`'a, `boxes`'ı `boxes`'a, `moves`'u `moves`'a
  koy". Üç değişken tek satırda geri gelir.
- Baştaki `;` ve dıştaki parantezler şart: satır `{` ile başlasaydı JavaScript onu bir kod bloğu sanırdı.
- `event.key.toLowerCase() === 'z'` → basılan tuşu **küçük harfe** çevirip sorar; Caps Lock açıkken gelen `'Z'` de
  çalışır.

# --task--

1. Under the `move` function, leave an empty line and write `undo`.
2. In the listener, under the arrow `if` block, write the `z` line. Press **Run**.

# --task-tr--

1. `move` fonksiyonunun kapanan `}`'sinin altına bir boş satır bırakıp `undo` fonksiyonunu yaz.
2. `keydown` dinleyicisinde ok tuşlarının `if` bloğunun kapanan `}`'sinin altına `z` satırını yaz.
3. **Çalıştır**, oyuna tıkla, birkaç adım at ve **Z**'ye bas: adımlar tek tek geri alınmalı.

# --predict--

You make two steps, then press Z three times. What happens on the third Z?
- [ ] An error: the list is empty
- [x] Nothing
  `pop()` gives `undefined` and `if (!previous) return` stops there.
- [ ] The level restarts

# --predict-tr--

İki adım atıp Z'ye üç kez basıyorsun. Üçüncü Z'de ne olur?
- [ ] Hata: liste boş
- [x] Hiçbir şey
  `pop()` `undefined` verir, `if (!previous) return` orada durur.
- [ ] Bölüm baştan başlar

# --tests--

Undo should step back through moves, one at a time.
tr: Geri alma hamleleri tek tek geri almalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 3 })
assert.deepEqual(boxAt(3, 2), { x: 3, y: 2 }, 'the box is back where it was')
assert.strictEqual(moves, 1)
$.tap('Z')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 4 })
assert.strictEqual(moves, 0)
```

Undo should also bring the screen back.
tr: Geri alma ekranı da geri getirmeli.

```js
$.press('ArrowRight')
$.tap('z')
assert.deepEqual($.rects('#38bdf8'), [{ x: 178, y: 250, w: 28, h: 28, color: '#38bdf8' }])
assert.include($.texts(), 'Arrows: move')
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
  if (event.key.toLowerCase() === 'z') undo()
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
  ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2)

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
