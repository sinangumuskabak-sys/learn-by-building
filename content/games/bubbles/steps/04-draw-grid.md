---
title: Draw the grid
title_tr: Izgarayı çiz
skills: [game.canvas, prog.loops]
---

# --goal--

`cellPos(r, c)` turns a cell into a position on the canvas; all the geometry lives in this one function. Then `draw` visits
every cell and draws the ones that are not empty. A strip at the top leaves room for the score.

# --goal-tr--

Izgaradaki bir hücrenin ekrandaki yerini bir fonksiyon hesaplayacak: `cellPos` (hücrenin yeri). Bütün geometri bu tek
fonksiyonda duracak; bu, ileride çok işimize yarayacak.

Şimdilik en basit dizilişi kullanıyoruz: her balon bir çap (40 piksel) sağda, her satır bir çap aşağıda. Sonra `draw`
bütün hücreleri gezip dolu olanları çizecek. Üstte skor için koyu bir şerit bırakıyoruz. Test balonunun işi bitti.

# --code--

```js
const TOP = 30 // room for the score

const cellPos = (r, c) => ({ x: R + c * 2 * R, y: TOP + R + r * 2 * R })

  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
    }
  }
```

# --meaning--

- Column `c` is `R + c * 2R` from the left: the first bubble touches the left edge. Row `r` starts under the strip.
- `cellPos` returns an object `{ x, y }`; it is in parentheses so the braces are not read as a function body.
- Empty cells (`< 0`) are skipped with `continue`.

# --meaning-tr--

- `const TOP = 30` → üstteki şeridin yüksekliği.
- `const cellPos = (r, c) => ({ x: ..., y: ... })` → bir `{ x, y }` nesnesi **geri veren** ok fonksiyonu; nesnenin
  etrafındaki `( )` şart, yoksa `{` fonksiyon gövdesi sanılır.
  - `x: R + c * 2 * R` → 0. sütun x = 20 (balon sol kenara değer), her sütun bir çap (40) sağda.
  - `y: TOP + R + r * 2 * R` → 0. satır şeridin hemen altında (30 + 20 = 50), her satır bir çap aşağıda.
- Şerit: `'#312e81'` renkli, `TOP` yüksekliğinde bir dikdörtgen.
- İç içe iki döngü her hücreyi gezer; `if (grid[r][c] < 0) continue` → boş hücreyi atla.
- `const p = cellPos(r, c)` → hücrenin yeri; `drawBubble(p.x, p.y, grid[r][c])` → oraya, kendi renginde.

# --task--

1. Under `ROWS` write `TOP`.
2. Under `let grid ...`, leave an empty line and write `cellPos`.
3. In `draw`, replace the test bubble with the strip and the two loops. Press **Run**.

# --task-tr--

1. `const ROWS = 14` satırının altına `TOP` yaz.
2. `let grid ...` satırının altına bir boş satır bırak ve `cellPos` satırını yaz.
3. `draw` içinde test balonu satırını sil; yerine şeridi ve iki döngüyü yaz (şeritten sonra bir boş satır).
4. **Çalıştır**: üstte beş sıra renkli balon görmelisin.

# --tests--

`cellPos` should put the cells one diameter apart, below the strip.
tr: `cellPos` hücreleri bir çap arayla, şeridin altına koymalı.

```js
assert.deepEqual(cellPos(0, 0), { x: 20, y: 50 })
assert.deepEqual(cellPos(0, 9), { x: 380, y: 50 })
assert.deepEqual(cellPos(1, 0), { x: 20, y: 90 })
```

Every bubble in the grid should be drawn in its place and color.
tr: Izgaradaki her balon kendi yerinde ve renginde çizilmeli.

```js
$.tick(1)
const bubbles = $.arcs().filter((a) => a.r === 19)
assert.lengthOf(bubbles, 50, 'five rows of ten')
assert.deepInclude(bubbles, { x: 20, y: 50, r: 19, color: COLORS[grid[0][0]] })
assert.deepInclude($.rects('#312e81'), { x: 0, y: 0, w: 400, h: 30, color: '#312e81' })
```

# --solution--

```js
// Bubble shooter, step by step.
// The page already has <canvas id="game" width="400" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 20 // bubble radius
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14
const TOP = 30 // room for the score
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

let grid // grid[r][c]: a color index, or -1 for an empty cell

const cellPos = (r, c) => ({ x: R + c * 2 * R, y: TOP + R + r * 2 * R })

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
}

function drawBubble(x, y, color, r = R) {
  ctx.fillStyle = COLORS[color]
  ctx.beginPath()
  ctx.arc(x, y, r - 1, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#312e81'
  ctx.fillRect(0, 0, canvas.width, TOP)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] < 0) continue
      const p = cellPos(r, c)
      drawBubble(p.x, p.y, grid[r][c])
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
