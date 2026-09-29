---
title: Off the end of the road
title_tr: Yolun sonundan çıkış
skills: [game.state, prog.arrays]
---

# --goal--

An enemy past the end of the road has got through: `pointAt` gives `null`. We mark it with `hp = 0` (no health left)
and keep only the enemies with health. The same filter will later remove the ones the towers kill.

# --goal-tr--

Yolun sonunu geçen düşman **geçip gitmiştir**: `pointAt` ona `null` verir. Onu listede tutarsak `draw` `null`'un
`x`'ini okumaya çalışır ve oyun hata verir.

Her düşmanın bir **canı** (`hp`, health points) olacak. Geçip gideni `hp = 0` ile işaretliyoruz ve listede yalnız
canı olanları tutuyoruz. Neden doğrudan silmiyoruz? Çünkü ileride kulelerin öldürdükleri de canı 0'a inerek gidecek:
aynı süzgeç ikisini de temizleyecek.

# --code--

```js
for (const e of enemies) {
  if (pointAt(e.d) === null) {
    e.hp = 0
  }
}
enemies = enemies.filter((e) => e.hp > 0)
```

# --meaning--

- `pointAt(e.d) === null` means the enemy is past the end.
- `filter` builds a new list with the enemies whose `hp` is above 0.

# --meaning-tr--

- `if (pointAt(e.d) === null) { e.hp = 0 }` → yolun sonunu geçtiyse canını sıfırla.
- `enemies.filter((e) => e.hp > 0)` → yalnız canı 0'dan büyük düşmanları tutan **yeni bir liste**. `enemies =` eski
  listeyi onunla değiştirir.
- Dikkat: artık her düşmanın bir `hp`'si olmalı; `hp`'si olmayan bir düşman (`undefined > 0` yanlış) hemen silinir.
  Düşmanları bir sonraki adımda canlarıyla yaratacağız.

# --task--

In `update`, under the walking line, write the loop and the `filter`.

# --task-tr--

1. `update` içinde yürüme satırının **altına** döngüyü ve `filter` satırını yaz.
2. **Çalıştır**: ekranda fark yok; kontroller yeşil olmalı.

# --tests--

An enemy that reaches the end should leave.
tr: Sona ulaşan düşman gitmeli.

```js
enemies = [{ d: 26.95, hp: 10 }, { d: 3, hp: 10 }]
$.tick()
assert.lengthOf(enemies, 2)
$.tick()
assert.lengthOf(enemies, 1)
assert.closeTo(enemies[0].d, 3.06, 1e-9)
```

# --solution--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TILE = 40
const COLS = 12
const ROWS = 9
const TOP = 40 // room for gold, lives and the tower buttons
// The road, as corners in tiles. It starts off the left edge and ends off the right edge.
const PATH = [
  [-1, 1],
  [3, 1],
  [3, 6],
  [7, 6],
  [7, 2],
  [10, 2],
  [10, 7],
  [12, 7],
]
const SPEED = 0.03 // tiles per frame

let road // keys of the tiles the road covers
let enemies

const key = (col, row) => col + ',' + row

// Every tile between two corners, corner included.
function findRoad() {
  road = new Set()
  for (let i = 1; i < PATH.length; i++) {
    let [x, y] = PATH[i - 1]
    const [tx, ty] = PATH[i]
    while (true) {
      road.add(key(x, y))
      if (x === tx && y === ty) break
      x += Math.sign(tx - x)
      y += Math.sign(ty - y)
    }
  }
}

function reset() {
  findRoad()
  enemies = []
}

// Where on the road an enemy is after walking `d` tiles (null once it is past the end).
function pointAt(d) {
  for (let i = 1; i < PATH.length; i++) {
    const [ax, ay] = PATH[i - 1]
    const [bx, by] = PATH[i]
    const length = Math.abs(bx - ax) + Math.abs(by - ay)
    if (d <= length) return { x: ax + Math.sign(bx - ax) * d, y: ay + Math.sign(by - ay) * d }
    d -= length
  }
  return null
}

function update() {
  for (const e of enemies) e.d += SPEED
  for (const e of enemies) {
    if (pointAt(e.d) === null) {
      e.hp = 0
    }
  }
  enemies = enemies.filter((e) => e.hp > 0)
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
      ctx.fillRect(col * TILE, TOP + row * TILE, TILE, TILE)
    }
  }

  for (const e of enemies) {
    const p = pointAt(e.d)
    const x = (p.x + 0.5) * TILE
    const y = TOP + (p.y + 0.5) * TILE
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(x, y, 11, 0, Math.PI * 2)
    ctx.fill()
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
