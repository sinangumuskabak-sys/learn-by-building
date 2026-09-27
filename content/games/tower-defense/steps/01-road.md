---
title: A road from corners
title_tr: Köşelerden bir yol
skills: [prog.arrays]
---

# --explanation--

Enemies will walk along a winding road. You could list every road tile by hand, but it is shorter and harder to get
wrong to list only the **corners** and let the code fill in the straight lines between them:

```js
const PATH = [[-1, 1], [3, 1], [3, 6], [7, 6], ...]   // tile coordinates of the corners
```

Between two corners, one coordinate stays the same and the other walks towards the target one step at a time.
`Math.sign(tx - x)` is `1`, `-1` or `0`, exactly the step to take, so the same loop works for all four directions:

```js
x += Math.sign(tx - x)
y += Math.sign(ty - y)
```

The road starts at column `-1` and ends at column `12`, just off the screen, so enemies walk in from the left edge and out
on the right. The road tiles go into a `Set` of keys like `'3,4'`, so later "is this tile road?" is a single `has`.

# --explanation-tr--

Düşmanlar kıvrılan bir yol boyunca yürüyecek. Her yol döşemesini elle listeleyebilirdin ama yalnızca **köşeleri**
listelemek ve aralarındaki düz çizgileri kodun doldurmasına izin vermek hem daha kısa hem de hata yapması daha zordur:

```js
const PATH = [[-1, 1], [3, 1], [3, 6], [7, 6], ...]   // köşelerin döşeme koordinatları
```

İki köşe arasında bir koordinat aynı kalır, öbürü hedefine birer adım yürür. `Math.sign(tx - x)` `1`, `-1` ya da `0`'dır; tam
atılacak adım. Böylece aynı döngü dört yön için de çalışır:

```js
x += Math.sign(tx - x)
y += Math.sign(ty - y)
```

Yol `-1`. sütunda başlar ve `12`. sütunda, ekranın hemen dışında biter; böylece düşmanlar sol kenardan girer, sağdan
çıkar. Yol döşemeleri `'3,4'` gibi anahtarlardan oluşan bir `Set`'e girer; sonradan "bu döşeme yol mu?" tek bir `has`
olur.

# --task--

1. Add `TILE = 40`, `COLS = 12`, `ROWS = 9`, `TOP = 40` and the `PATH` from the solution.
2. Write `key(col, row)` and `findRoad()`: for each pair of neighbouring corners, walk from the first to the second with
   `Math.sign` steps, adding every tile (both corners included) to the `road` set. `reset()` calls it.
3. Draw every frame: a `'#0f172a'` background, then each map tile as a full tile, `'#a8a29e'` if it is road and
   `'#3f6212'` if not. Row `r` starts at `TOP + r * TILE`.

# --task-tr--

1. `TILE = 40`, `COLS = 12`, `ROWS = 9`, `TOP = 40` ve çözümdeki `PATH`'i ekle.
2. `key(col, row)` ve `findRoad()` yaz: komşu her köşe çifti için birinciden ikinciye `Math.sign` adımlarıyla yürü ve her
   döşemeyi (iki köşe de dahil) `road` kümesine ekle. `reset()` onu çağırır.
3. Her karede çiz: `'#0f172a'` bir arka plan, sonra her harita döşemesini tam bir döşeme olarak; yolsa `'#a8a29e'`, değilse
   `'#3f6212'`. `r` satırı `TOP + r * TILE`'da başlar.

# --tests--

The road should fill in the straight lines between the corners.
tr: Yol köşeler arasındaki düz çizgileri doldurmalı.

```js
assert.strictEqual(key(3, 4), '3,4')
for (const k of ['-1,1', '0,1', '3,1', '3,4', '5,6', '7,3', '9,2', '10,5', '11,7', '12,7']) {
  assert.isTrue(road.has(k), k + ' should be road')
}
assert.isFalse(road.has('4,4'))
assert.isFalse(road.has('0,0'))
assert.strictEqual(road.size, 28, '26 tiles on the map plus one off each edge')
```

The map should be drawn with road and grass tiles.
tr: Harita yol ve çimen döşemeleriyle çizilmeli.

```js
$.tick(1)
assert.lengthOf($.rects('#a8a29e'), 26)
assert.lengthOf($.rects('#3f6212'), 82)
const first = $.rects('#a8a29e')[0]
assert.deepEqual([first.x, first.y, first.w, first.h], [0, 80, 40, 40])
```

# --seed--

```js
// Tower defense, step by step.
// The page already has <canvas id="game" width="480" height="440"></canvas>.
// Write your code below.
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
const TOP = 40 // room for a status line (it comes later)
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
