---
title: Draw the road
title_tr: Yolu çiz
skills: [game.canvas]
---

# --goal--

Now each tile asks the `road` set: road tiles are grey, the rest stays grass.

# --goal-tr--

Her kare boyanırken `road` kümesine sorsun: **yol mu?** Yolsa gri, değilse yeşil. Harita ilk kez bir oyun haritasına
benzeyecek.

# --code--

```js
ctx.fillStyle = road.has(key(col, row)) ? '#a8a29e' : '#3f6212'
```

# --meaning--

- `road.has(key(col, row))` is `true` for road tiles.
- `condition ? A : B` gives `A` when the condition is true, otherwise `B`.

# --meaning-tr--

- `road.has(key(col, row))` → bu karenin anahtarı kümede var mı? Yolsa `true`.
- `koşul ? A : B` → koşul doğruysa A (`'#a8a29e'`, gri), değilse B (yeşil).
- Haritanın dışındaki iki yol karesi (`-1` ve `12`. sütun) hiç çizilmez; döngü yalnız 0–11 sütunlarını dolaşır.

# --task--

In `draw`, change the tiles' `fillStyle` line as shown.

# --task-tr--

1. `draw` içinde karelerin `ctx.fillStyle = '#3f6212'` satırını yeni hâliyle değiştir.
2. **Çalıştır**: soldan girip kıvrılarak sağdan çıkan gri bir yol görmelisin.

# --tests--

The map should be drawn with road and grass tiles.
tr: Harita yol ve çimen kareleriyle çizilmeli.

```js
$.tick()
assert.lengthOf($.rects('#a8a29e'), 26)
assert.lengthOf($.rects('#3f6212'), 82)
assert.deepInclude($.rects('#a8a29e'), { x: 0, y: 80, w: 40, h: 40, color: '#a8a29e' })
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

let road // keys of the tiles the road covers

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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
