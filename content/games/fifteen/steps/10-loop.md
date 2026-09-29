---
title: Draw again and again
title_tr: Tekrar tekrar çiz
skills: [game.loop]
---

# --goal--

Tiles will move and later even slide smoothly, so we redraw all the time: a loop that draws and asks the browser to run
it again before the next screen refresh.

# --goal-tr--

Taşlar hareket edecek, hatta ileride **kayarak** gidecek. Bunun için resmi sürekli yeniden çizen bir **oyun döngüsü**
kuruyoruz.

Tarayıcı ekranı saniyede yaklaşık **60 kez** yeniler. `requestAnimationFrame` ona "bir sonraki yenilemeden önce bu
fonksiyonu çalıştır" der. Fonksiyon kendini her seferinde yeniden istediği için döngü hiç durmaz.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws once, then books itself for the next frame.
- The last line starts the loop, replacing the single `draw()` call.

# --meaning-tr--

- `function loop() {` → döngünün **bir turu**: çiz, sonra bir sonraki turu iste.
- `requestAnimationFrame(loop)` → "ekran bir sonraki yenilenmeden önce **loop'u yine** çalıştır".
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Above `reset()` at the bottom, write `loop`. Replace the last `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `reset()` satırının **üstüne** `loop` fonksiyonunu yaz; arada bir boş satır kalsın.
2. En alttaki `draw()` satırını sil, yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**. Ekran aynı görünür.

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

Each frame should draw the latest board.
tr: Her kare en son tahtayı çizmeli.

```js
tiles[14] = 0
tiles[15] = 15
$.tick(1)
assert.isTrue($.rects('#f59e0b').some((r) => r.x === 11 + 3 * 96 && r.y === 60 + 3 * 96))
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
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  tiles.forEach((number, i) => {
    if (number === 0) return
    drawTile(number, squareX(i), squareY(i))
  })
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
