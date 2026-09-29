---
title: Keep drawing
title_tr: Çizmeye devam
skills: [game.loop]
---

# --goal--

The board will change as you play, so it is redrawn every frame by a loop.

# --goal-tr--

Tahta oynadıkça değişecek; her karede yeniden çizilsin. Bunun için bildik **döngüyü** kuruyoruz.

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

- `requestAnimationFrame(loop)` runs `loop` again before the next screen refresh, about 60 times a second.

# --meaning-tr--

- `function loop()` → bir tur: çiz, sonra `requestAnimationFrame(loop)` ile bir sonraki turu iste (saniyede ~60).
- En alttaki `requestAnimationFrame(loop)` tek seferlik `draw()`'ın yerini alır ve döngüyü başlatır.

# --task--

Replace the `draw()` call at the bottom with `loop` and `requestAnimationFrame(loop)`.

# --task-tr--

En alttaki `draw()` satırını sil; `reset()`'in üstüne `loop` fonksiyonunu, altına `requestAnimationFrame(loop)` yaz. **Çalıştır**.

# --tests--

The board should be redrawn every frame.
tr: Tahta her karede yeniden çizilmeli.

```js
$.tick(3)
assert.strictEqual($.pendingFrames, 1)
grid[0][2] = 4
$.tick()
assert.isTrue($.screen().some((c) => c.op === 'fillText' && c.args[0] === '4'))
```

# --solution--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 48
const LEFT = (canvas.width - 9 * SIZE) / 2
const TOP = 56

// The puzzle, row by row; 0 is an empty cell.
const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x, y, SIZE, SIZE)
      if (grid[r][c] === 0) continue
      ctx.fillStyle = given[r][c] ? '#0f172a' : '#2563eb'
      ctx.font = (given[r][c] ? 'bold ' : '') + '26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
    }
  }
  // Thin lines between cells, thick ones around each box.
  for (let i = 0; i <= 9; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#0f172a' : '#94a3b8'
    const w = i % 3 === 0 ? 3 : 1
    ctx.fillRect(LEFT + i * SIZE - w / 2, TOP, w, 9 * SIZE)
    ctx.fillRect(LEFT, TOP + i * SIZE - w / 2, 9 * SIZE, w)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
