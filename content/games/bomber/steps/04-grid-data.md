---
title: The arena as data
title_tr: Veri olarak arena
skills: [prog.arrays]
---

# --goal--

The arena is a grid of characters: `'#'` a wall, `'+'` a crate, `' '` floor. `grid` is an array of rows, each row an
array of 13 characters. `makeGrid` builds it with a wall all round and floor inside.

# --goal-tr--

Arenadaki her kareyi **tek bir karakterle** tutacağız:

- `'#'` → **duvar**, hiçbir şey kıramaz,
- `'+'` → **kasa**, bombalar yok eder,
- `' '` (boşluk) → **zemin**.

`grid` (ızgara) bir **liste içinde liste**: 11 satırlık bir dizi, her satır 13 karakterlik bir dizi. `grid[r][c]`,
`r`. satırın `c`. karesi. `makeGrid` bu ızgarayı kuracak: şimdilik kenarlar duvar, içerisi zemin. Ekranda bu adımda
fark olmayacak; çizimi bir sonraki adımda ızgaraya bağlayacağız.

# --code--

```js
let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) grid[r].push('#')
      else grid[r].push(' ')
    }
  }
}

function reset() {
  makeGrid()
}

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `grid.push([])` adds a new, empty row; `grid[r].push(...)` adds a tile to the end of row `r`.
- A tile on the first or last row or column is a wall: `||` means "or".
- `reset` sets the game up; it is called once before the loop starts.

# --meaning-tr--

- `let grid` → ızgara; yorum, içinde ne olduğunu anlatıyor.
- `grid = []` → boş liste ile başla.
- `grid.push([])` → listenin sonuna **yeni, boş bir satır** ekler. `push` "sona ekle" demek.
- `grid[r].push('#')` → `r`. satırın sonuna bir duvar ekler.
- `if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1)` → ilk satır **ya da** ilk sütun **ya da** son satır
  **ya da** son sütunsa duvar. `||` "ya da", `===` "eşit mi" demek. `ROWS - 1` son satırın numarası (10), çünkü
  sayma 0'dan başlar.
- `else grid[r].push(' ')` → değilse zemin.
- `function reset() { makeGrid() }` → oyunu kuran fonksiyon; ileride bütün başlangıç değerleri burada olacak.
  En alttaki `reset()` onu döngüden önce bir kez çağırır.

# --task--

1. Under the `TOP` line, after an empty line, write `let grid`, `makeGrid` and `reset`.
2. At the end, write `reset()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `const TOP = ...` satırının altında bir boş satır bırak; `let grid` satırını, `makeGrid` ve `reset` fonksiyonlarını
   yaz.
2. En alttaki `requestAnimationFrame(loop)` satırının **üstüne** `reset()` yaz.
3. **Çalıştır**: ekranda fark yok ama kontroller yeşil olmalı.

# --hint--

`ROWS - 1` and `COLS - 1` are the last row and column, because counting starts at 0.

# --hint-tr--

Son satır `ROWS - 1`, son sütun `COLS - 1`'dir; çünkü sayma 0'dan başlar. `reset()` çağrısını unutma.

# --tests--

`grid` should have 11 rows of 13 tiles.
tr: `grid` 13 karelik 11 satır olmalı.

```js
assert.lengthOf(grid, ROWS)
for (const row of grid) assert.lengthOf(row, COLS)
```

The border should be wall and the inside floor.
tr: Kenar duvar, içerisi zemin olmalı.

```js
for (let c = 0; c < COLS; c++) assert.deepEqual([grid[0][c], grid[ROWS - 1][c]], ['#', '#'])
for (let r = 0; r < ROWS; r++) assert.deepEqual([grid[r][0], grid[r][COLS - 1]], ['#', '#'])
assert.strictEqual(grid[1][1], ' ')
assert.strictEqual(grid[5][7], ' ')
```

# --solution--

```js
// Bomberman-style game, step by step.
// The page already has <canvas id="game" width="416" height="384"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const COLS = 13
const ROWS = 11
const TILE = 32
const TOP = 32 // room for the lives and the time

let grid // grid[r][c]: '#' wall, '+' crate or ' ' floor

function makeGrid() {
  grid = []
  for (let r = 0; r < ROWS; r++) {
    grid.push([])
    for (let c = 0; c < COLS; c++) {
      if (r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1) grid[r].push('#')
      else grid[r].push(' ')
    }
  }
}

function reset() {
  makeGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE
      const y = TOP + r * TILE
      ctx.fillStyle = '#3f6212'
      ctx.fillRect(x, y, TILE, TILE)
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
