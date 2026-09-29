---
title: A grid of cells
title_tr: Hücrelerden bir ızgara
skills: [prog.arrays]
---

# --goal--

The bubbles hang in rows. We keep them in a 2D array, `grid[r][c]`: a list of rows, each a list of cells. A cell holds a
color number, or -1 when it is empty. A new game fills the top five rows with random colors.

# --goal-tr--

Balonlar tavandan **satırlar** hâlinde sarkar. Onları **iki boyutlu** bir dizide tutacağız: `grid[r][c]`. Yani bir
satırlar listesi; her satır da bir hücreler listesi. Bir sinemanın koltuk planı gibi: sıra numarası ve koltuk numarası.

Her hücrede bir renk numarası (0–4) ya da boşsa **-1** olacak. Yeni oyun (`reset`) ilk beş satırı rastgele renklerle
dolduracak, gerisini boş bırakacak. Bu adımda ekranda bir şey değişmeyecek; ızgarayı bir sonraki adımda çizeceğiz.

# --code--

```js
const COLS = 10 // bubbles in an even row; odd rows have one less and sit half a bubble to the right
const ROWS = 14

let grid // grid[r][c]: a color index, or -1 for an empty cell

function reset() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) grid[r].push(r < 5 ? Math.floor(Math.random() * COLORS.length) : -1)
  }
}

reset()
```

# --meaning--

- `grid` starts as an empty list; each row pushes a new empty list, then fills it cell by cell.
- `Math.floor(Math.random() * COLORS.length)` is a random whole number 0 to 4.
- `r < 5 ? ... : -1`: the first five rows get a color, the others -1.
- The comment on `COLS` already tells the plan for odd rows; we will get there soon.

# --meaning-tr--

- `const COLS = 10` → bir satırdaki balon sayısı; yorum tek satırlar için planı şimdiden söylüyor (birazdan).
  `const ROWS = 14` → satır sayısı.
- `let grid` → ızgara; yorum: `grid[r][c]` bir renk numarası ya da boş hücre için -1.
- `grid = []` → boş liste. `for (let r = 0; r < ROWS; r++)` → her satır için:
  - `grid.push([])` → ızgaraya yeni, boş bir **satır** ekle.
  - `for (let c = 0; c < COLS; c++) grid[r].push(...)` → o satıra 10 hücre ekle.
- `Math.random()` 0 ile 1 arasında rastgele sayı; `* COLORS.length` → 0 ile 4.99...; `Math.floor` küsuratı atar →
  0–4 arası rastgele bir renk.
- `r < 5 ? renk : -1` → ilk beş satır renkli, gerisi boş.
- En alttaki `reset()` → oyunu başta bir kez kur.

# --task--

1. Under `R` write `COLS` and `ROWS`.
2. Under `COLORS`, leave an empty line and write `let grid` and `reset`.
3. Write `reset()` just above the last line, `requestAnimationFrame(loop)`.

# --task-tr--

1. `const R = 20 ...` satırının altına `COLS` ve `ROWS` satırlarını yaz.
2. `COLORS` satırının altına bir boş satır bırak; `let grid` satırını ve `reset` fonksiyonunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `reset()` yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

The grid should have 14 rows of 10 cells, with the first five filled.
tr: Izgarada 10 hücrelik 14 satır olmalı ve ilk beşi dolu olmalı.

```js
assert.lengthOf(grid, ROWS)
for (const row of grid) assert.lengthOf(row, 10)
for (let r = 0; r < 5; r++) for (const color of grid[r]) assert.include([0, 1, 2, 3, 4], color)
for (let r = 5; r < ROWS; r++) for (const color of grid[r]) assert.strictEqual(color, -1)
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
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']

let grid // grid[r][c]: a color index, or -1 for an empty cell

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

  drawBubble(200, 260, 3)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
