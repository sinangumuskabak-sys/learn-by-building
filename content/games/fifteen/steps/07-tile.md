---
title: Draw one tile
title_tr: Bir taş çiz
skills: [game.canvas, prog.functions]
---

# --goal--

`drawTile(number, x, y)` draws a tile at a point. For now it is an orange square, and we try it on the first square.

# --goal-tr--

Taş çizen bir fonksiyon yazıyoruz: `drawTile` (taş çiz). Ona **hangi taşı** ve **nereye** çizeceğini söyleyeceğiz:
`drawTile(number, x, y)`. Şimdilik sadece turuncu bir kare çiziyor; numarayı bir sonraki adımda yazacağız.

Denemek için ilk kareye bir taş çizelim.

# --code--

```js
function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawTile(1, squareX(0), squareY(0))
}
```

# --meaning--

- `number`, `x` and `y` are parameters: the values given in the call. `number` is not used yet.
- The tile is a `SIZE` by `SIZE` orange square with its top-left corner at `x, y`.
- `drawTile(1, squareX(0), squareY(0))` draws tile 1 on square 0: at (11, 60).

# --meaning-tr--

- `function drawTile(number, x, y)` → üç **parametre**: fonksiyona çağrılırken verilen değerler. `drawTile(1, 11,
  60)` diye çağırınca içeride `number` 1, `x` 11, `y` 60 olur. `number`'ı henüz kullanmıyoruz.
- `ctx.fillStyle = '#f59e0b'` → turuncu. `ctx.fillRect(x, y, SIZE, SIZE)` → sol üst köşesi `x, y` olan 90×90 kare.
- `drawTile(1, squareX(0), squareY(0))` → 1 numaralı taşı 0. kareye çiz: (11, 60). Arka plandan **sonra** çizildiği
  için üstünde görünür.

# --task--

1. Above `function draw() {`, write `drawTile` and leave an empty line.
2. In `draw`, under the `fillRect` line, leave an empty line and write the `drawTile(...)` call. Press **Run**.

# --task-tr--

1. `function draw() {` satırının **üstüne** `drawTile` fonksiyonunu yaz; arada bir boş satır kalsın.
2. `draw` içinde `ctx.fillRect(...)` satırının altına bir boş satır bırakıp `drawTile(1, squareX(0), squareY(0))` yaz.
3. **Çalıştır**: sol üstte turuncu bir kare görmelisin.

# --try--

Change `squareX(0), squareY(0)` to `squareX(5), squareY(5)`: the tile moves to square 5. Put `0` back.

# --try-tr--

`squareX(0), squareY(0)` yerine `squareX(5), squareY(5)` yaz: taş 5. kareye gider. Sonra `0`'a geri al.

# --tests--

One orange 90×90 tile should be drawn on the first square.
tr: İlk kareye 90×90'lık tek bir turuncu taş çizilmeli.

```js
draw()
assert.deepEqual($.rects('#f59e0b'), [{ x: 11, y: 60, w: 90, h: 90, color: '#f59e0b' }])
```

`drawTile` should draw at the point it is given.
tr: `drawTile` verilen noktaya çizmeli.

```js
draw()
drawTile(5, 100, 200)
assert.deepInclude($.rects('#f59e0b'), { x: 100, y: 200, w: 90, h: 90, color: '#f59e0b' })
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawTile(1, squareX(0), squareY(0))
}

reset()
draw()
```
