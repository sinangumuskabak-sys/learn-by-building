---
title: Draw every frame
title_tr: Her karede çiz
skills: [game.loop]
---

# --goal--

The field will change with every click, and later a clock will tick. A loop redraws it before every screen refresh.

# --goal-tr--

Tarla her tıklamada değişecek; ileride bir saat de işleyecek. Resmi sürekli yeniden çizen bir **oyun döngüsü**
kuruyoruz.

`requestAnimationFrame(fn)` tarayıcıya "ekranı bir sonraki yenilemeden önce `fn`'i çalıştır" der (saniyede yaklaşık 60
kez). `loop` her turda çizip bir sonraki turu kendisi istediği için döngü hiç durmaz.

# --code--

```js
function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```

# --meaning--

- `loop` draws, then books itself for the next frame.
- The last line starts the loop, replacing the single `draw()` call.

# --meaning-tr--

- `function loop() { draw(); requestAnimationFrame(loop) }` → bir tur: çiz, sonra bir sonraki turu iste.
- En alttaki `requestAnimationFrame(loop)` → döngüyü **başlatır**; eski tek seferlik `draw()` çağrısının yerini alır.

# --task--

Above `newGame()` at the bottom, write `loop`. Replace the last `draw()` with `requestAnimationFrame(loop)`.

# --task-tr--

1. En alttaki `newGame()` satırının **üstüne** `loop` fonksiyonunu yaz; arada bir boş satır kalsın.
2. En alttaki `draw()` satırını sil, yerine `requestAnimationFrame(loop)` yaz.
3. **Çalıştır**. Ekran aynı görünür.

# --tests--

The loop should keep running by requesting the next frame.
tr: Döngü bir sonraki kareyi isteyerek sürmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1, 'loop() should call requestAnimationFrame(loop) once per frame')
```

Each frame should draw the current grid.
tr: Her kare o anki ızgarayı çizmeli.

```js
grid = [[grid[0][0]]]
$.tick(1)
assert.lengthOf($.rects('#94a3b8'), 1)
```

# --solution--

```js
// Minesweeper, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 9
const CELL = 40
const TOP = 40 // room for the mine counter and the timer

let grid

function newGame() {
  grid = Array.from({ length: SIZE }, (_, row) =>
    Array.from({ length: SIZE }, (_, col) => ({ row, col })),
  )
}

function draw() {
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const cell of grid.flat()) {
    const x = cell.col * CELL
    const y = TOP + cell.row * CELL
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
