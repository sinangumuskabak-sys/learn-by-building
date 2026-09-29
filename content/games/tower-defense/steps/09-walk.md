---
title: Walk
title_tr: Yürü
skills: [game.loop]
---

# --goal--

Moving along the road is now one line: every frame, every enemy's `d` grows by `SPEED`. `update` holds the game's
rules and runs before `draw` in the loop.

# --goal-tr--

`pointAt` sayesinde yürümek artık **tek satır**: her karede her düşmanın `d`'si `SPEED` kadar büyür. Köşeleri dönmek
için hiçbir şey yapmıyoruz; `pointAt` hallediyor.

Oyunun kurallarını `update` (güncelle) fonksiyonuna koyuyoruz; döngü her turda önce günceller, sonra çizer.

# --code--

```js
const SPEED = 0.03 // tiles per frame

function update() {
  for (const e of enemies) e.d += SPEED
}

function loop() {
  update()
  draw()
```

# --meaning--

- At 0.03 tiles a frame (60 frames a second), an enemy walks about 1.8 tiles a second.
- The loop now updates first, then draws.

# --meaning-tr--

- `const SPEED = 0.03` → düşmanın karede yürüdüğü yol: 0.03 kare. Saniyede 60 kare ile yaklaşık 1.8 kare/saniye.
- `for (const e of enemies) e.d += SPEED` → her düşmanın mesafesini büyüt (`+=` "üstüne ekle").
- `loop` içinde `update()` → önce durumu değiştir, sonra `draw()` ile çiz.

# --task--

1. Under `PATH` write `SPEED`.
2. Above `function draw() {` write `update`.
3. In `loop`, write `update()` above `draw()`.

# --task-tr--

1. `PATH`'in kapanan `]` satırının altına `SPEED` satırını yaz.
2. `function draw() {` satırının **üstüne** `update` fonksiyonunu yaz.
3. `loop` içinde `draw()` satırının **üstüne** `update()` yaz.
4. **Çalıştır**: ekranda fark yok (düşman yok). Denemek için aşağıdaki "dene" kutusuna bak.

# --try--

In `reset`, write `enemies = [{ d: 0 }]` and run: an enemy walks in from the left and around the corners. Put `[]` back before it reaches the end.

# --try-tr--

`reset` içinde `enemies = [{ d: 0 }]` yaz ve çalıştır: bir düşman soldan girip köşeleri döner. Yolun sonuna varmadan `[]`'e geri al (sonrası bir sonraki adımın işi).

# --tests--

Every frame, every enemy should walk `SPEED` tiles.
tr: Her karede her düşman `SPEED` kare yürümeli.

```js
assert.strictEqual(SPEED, 0.03)
enemies = [{ d: 0 }, { d: 5 }]
$.tick()
assert.closeTo(enemies[0].d, 0.03, 1e-9)
$.tick(9)
assert.closeTo(enemies[1].d, 5.3, 1e-9)
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
