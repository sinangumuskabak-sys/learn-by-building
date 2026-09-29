---
title: A photo of the game
title_tr: Oyunun fotoğrafı
skills: [game.state]
---

# --goal--

One careless push can make a level impossible, so we will add undo. First, `snapshot()` turns everything a move can
change into one piece of text: a photo of the game. `history` will keep the photos.

# --goal-tr--

Sokoban'da tek bir dikkatsiz itiş bölümü **çözülemez** yapabilir. Tek hata için bütün bölümü baştan oynamak can sıkar;
bu yüzden **geri alma** ekleyeceğiz.

Yöntem: her hamleden önce oyunun bir **fotoğrafını** çekip bir deftere koymak. Geri alırken son fotoğrafı çıkarıp
her şeyi ona göre geri koyarız. Bu adımda fotoğraf makinesini (`snapshot`) ve boş defteri (`history`) hazırlıyoruz.

# --code--

```js
let history

  history = []

function snapshot() {
  return JSON.stringify({ player, boxes, moves })
}
```

# --meaning--

- `history` is the list of photos, emptied on every load.
- `{ player, boxes, moves }` is an object with the three things a move can change.
- `JSON.stringify` turns it into text: a real copy. Storing the `boxes` array itself would store the same array, and
  the next push would change the "saved" copy too.

# --meaning-tr--

- `let history` → fotoğraf defteri (geçmiş). `loadLevel` içinde `history = []`: her bölümde boş başlar.
- `{ player, boxes, moves }` → üç değeri tek pakette toplayan bir nesne (`{ player: player, ... }`'nin kısası). Bir
  hamlenin değiştirebileceği her şey bunlar.
- `JSON.stringify(...)` → nesneyi **yazıya** çevirir: `'{"player":{"x":1,"y":1},"boxes":[...],"moves":0}'`.
- Neden yazı? `boxes` listesinin kendisini deftere koysaydık, defterde aynı listeye bir **işaret** olurdu; sonraki itiş
  kutuyu değiştirince "kaydedilmiş" hâl de değişirdi. Yazı ise gerçek bir **kopya**: fotoğrafın kâğıda basılmış hâli
  gibi, sonradan değişmez.

# --task--

1. Under `let moves` write `let history`.
2. At the end of `loadLevel`, under `moves = 0`, write `history = []`.
3. Above `function move`, write `snapshot`. Press **Run**.

# --task-tr--

1. `let moves` satırının altına `let history` yaz.
2. `loadLevel` içinde `moves = 0` satırının altına `history = []` yaz.
3. `function move(dx, dy) {` satırının **üstüne** `snapshot` fonksiyonunu yaz; arada bir boş satır kalsın.
4. **Çalıştır**. Ekran değişmez; kontroller fotoğrafa bakıyor.

# --tests--

`history` should start as an empty list.
tr: `history` boş bir liste olarak başlamalı.

```js
assert.deepEqual(history, [])
history.push('x')
loadLevel(0)
assert.deepEqual(history, [])
```

`snapshot()` should be a text copy of the player, the boxes and the moves.
tr: `snapshot()` oyuncu, kutular ve hamlelerin yazı kopyası olmalı.

```js
const photo = snapshot()
assert.isString(photo)
assert.deepEqual(JSON.parse(photo), { player: { x: 1, y: 1 }, boxes: [{ x: 2, y: 1 }], moves: 0 })
$.press('ArrowRight')
assert.deepEqual(JSON.parse(photo).boxes, [{ x: 2, y: 1 }], 'the photo does not change later')
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
    box.x = bx
    box.y = by
  }
  player = { x, y }
  moves += 1
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
