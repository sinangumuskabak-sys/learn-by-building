---
title: Undo
title_tr: Geri al
skills: [prog.arrays, game.state]
---

# --explanation--

In Sokoban one careless push can make a level impossible. Restarting the whole level for one mistake is painful, so
every good version has **undo**.

The simplest reliable undo is a **history of snapshots**: before each move, save a copy of everything the move could
change. Undo pops the last snapshot and puts it back.

```js
history.push(JSON.stringify({ player, boxes, moves }))   // before the move
...
;({ player, boxes, moves } = JSON.parse(history.pop()))   // undo
```

`JSON.stringify` makes a **deep copy** in text form. That matters: pushing the `boxes` array itself would store a
reference to the same array, and the next move would change the "saved" copy too. (It is the same value-versus-reference
lesson as the shared row in 2048.) The last line uses destructuring assignment to set three variables at once; the
leading `;` and the parentheses are needed because a line cannot start with `{` there.

A **stack** (push, then pop the last) is exactly the right shape for undo: the most recent change is undone first. `R`
restarts the level, and a move counter shows how efficient the solution is.

# --explanation-tr--

Sokoban'da tek bir dikkatsiz itiş bir bölümü imkânsız hâle getirebilir. Tek bir hata için bütün bölümü yeniden başlatmak
acı verir; bu yüzden her iyi sürümde **geri alma** vardır.

En basit güvenilir geri alma bir **anlık görüntü geçmişidir**: her hamleden önce hamlenin değiştirebileceği her şeyin bir
kopyasını kaydet. Geri alma son görüntüyü çıkarır ve yerine koyar.

```js
history.push(JSON.stringify({ player, boxes, moves }))   // hamleden önce
...
;({ player, boxes, moves } = JSON.parse(history.pop()))   // geri al
```

`JSON.stringify` metin biçiminde **derin bir kopya** yapar. Bu önemli: `boxes` dizisinin kendisini eklemek aynı diziye bir
başvuru saklardı ve bir sonraki hamle "kaydedilmiş" kopyayı da değiştirirdi. (2048'deki paylaşılan satırla aynı
değer–başvuru dersi.) Son satır üç değişkeni birden ayarlamak için ayrıştırmalı atama kullanır; baştaki `;` ve parantezler
gerekli, çünkü orada bir satır `{` ile başlayamaz.

Bir **yığın** (ekle, sonra sonuncuyu çıkar) geri alma için tam doğru biçimdir: en son değişiklik ilk geri alınır. `R`
bölümü yeniden başlatır, bir hamle sayacı da çözümün ne kadar verimli olduğunu gösterir.

# --task--

1. Add `let moves` and `let history`, set to `0` and `[]` in `loadLevel()`.
2. Write `snapshot()` returning `JSON.stringify({ player, boxes, moves })`. In `move()`, push a snapshot just before a
   move happens (only when it is allowed), and add 1 to `moves` after it.
3. Write `undo()`: pop the last snapshot, if any, and restore `player`, `boxes` and `moves` from it. Call it on `z`,
   and restart the level on `r`.
4. Draw `Moves: 12` right-aligned at the top, and change the hint to `Arrows: move   Z: undo   R: restart`.

# --task-tr--

1. `let moves` ve `let history` ekle; `loadLevel()` içinde `0` ve `[]` yap.
2. `JSON.stringify({ player, boxes, moves })` döndüren `snapshot()` yaz. `move()` içinde bir hamle gerçekleşmeden hemen
   önce (yalnızca izin verildiyse) bir görüntü ekle, sonrasında `moves`'u 1 artır.
3. `undo()` yaz: varsa son görüntüyü çıkar ve `player`, `boxes` ve `moves`'u ondan geri yükle. `z`'de çağır; `r`'de
   bölümü yeniden başlat.
4. Tepede sağa hizalı `Moves: 12` çiz ve ipucunu `Arrows: move   Z: undo   R: restart` yap.

# --tests--

Each move should be counted, and blocked moves should not.
tr: Her hamle sayılmalı, engellenen hamleler sayılmamalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.press('ArrowUp')
assert.strictEqual(moves, 2, 'the third push was blocked by the wall')
assert.lengthOf(history, 2)
assert.include($.texts(), 'Moves: 2')
```

Undo should step back through pushes, one at a time.
tr: Geri alma itişleri tek tek geri almalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 3 })
assert.deepEqual(boxAt(3, 2), { x: 3, y: 2 }, 'the box is back where it was')
assert.strictEqual(moves, 1)
$.tap('z')
$.tap('z')
assert.deepEqual(player, { x: 3, y: 4 })
assert.strictEqual(moves, 0)
```

Snapshots should be real copies, not shared with the live boxes.
tr: Anlık görüntüler canlı kutularla paylaşılan değil gerçek kopyalar olmalı.

```js
loadLevel(1)
$.press('ArrowUp')
const saved = history[0]
$.press('ArrowUp')
assert.strictEqual(history[0], saved, 'pushing a box later must not change an earlier snapshot')
```

`r` should restart the level.
tr: `r` bölümü yeniden başlatmalı.

```js
loadLevel(1)
$.press('ArrowUp')
$.press('ArrowUp')
$.tap('r')
assert.deepEqual(player, { x: 3, y: 4 })
assert.strictEqual(moves, 0)
assert.lengthOf(history, 0)
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
  ctx.fillText('Moves: ' + moves, canvas.width - 12, TOP / 2)

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
