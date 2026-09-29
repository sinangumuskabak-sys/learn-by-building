---
title: Draw every living cell
title_tr: Her canlı hücreyi çiz
skills: [prog.loops]
---

# --goal--

`draw` should show the data: visit every cell of `grid` with two nested loops and paint a green square where the cell
is `1`.

# --goal-tr--

Şimdi resmi dünyaya bağlıyoruz: `draw`, `grid`'deki **her hücreye tek tek bakacak** ve canlı olanları yeşil kare
olarak çizecek.

2880 hücreyi (48 × 60) tek tek yazamayız. Bunun için **döngü** kullanırız: "şu işi, şu sayı şuna gelene kadar tekrar
et". Bir döngünün içine ikinci bir döngü koyarsak önce satırları, her satırda da sütunları gezeriz: kitap okur gibi,
satır satır, soldan sağa.

# --code--

```js
ctx.fillStyle = '#4ade80'
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
  }
}
```

# --meaning--

- `for (let r = 0; r < ROWS; r++)` runs its body with `r` = 0, 1, 2 ... 47: every row.
- The inner loop does the same with `c` for every column of that row.
- `if (grid[r][c])` is true for `1` and false for `0`, so only live cells are painted, at column `c` and row `r`.

# --meaning-tr--

- `for (let r = 0; r < ROWS; r++) {` → **döngü**. Üç parçası var, `;` ile ayrılır:
  - `let r = 0` → sayaç `r` (row, satır) 0'dan başlar.
  - `r < ROWS` → `r` 48'den **küçük** olduğu sürece `{ }` içini yap.
  - `r++` → her turdan sonra `r`'ye 1 ekle.
  Yani içerisi `r` = 0, 1, 2 ... 47 için, **her satır için bir kez** çalışır.
- İçteki `for (let c = 0; c < COLS; c++)` → aynısı sütunlar (`c`, column) için: her satırda 60 tur.
  Toplam 48 × 60 = 2880 tur.
- `if (grid[r][c]) ...` → "**eğer** bu hücre canlıysa şunu yap". `1` doğru, `0` yanlış sayılır; ölü hücreler atlanır.
- `ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)` → önceki adımdaki kare, ama `3` yerine `c`, `2` yerine
  `r`: kare, hücre neredeyse oraya çizilir.

# --task--

In `draw`, replace the line that paints the fixed square with the two loops. The `fillStyle` line above stays.

# --task-tr--

1. `draw` içinde `ctx.fillStyle = '#4ade80'` satırının altındaki `ctx.fillRect(3 * CELL, ...)` satırını **sil**.
2. Yerine iki döngüyü yaz. Her döngü bir `{` ile açılır, kendi `}`'si ile kapanır; girintiler yol gösterir.
3. **Çalıştır**.

# --predict--

What will you see after Run?
- [ ] The same green square as before
- [x] No green square at all
  `draw` now shows `grid`, and every cell in it is `0`.
- [ ] The whole grid turns green

# --predict-tr--

Çalıştır'a basınca ne göreceksin?
- [ ] Önceki yeşil kareyi
- [x] Hiç yeşil kare yok
  `draw` artık `grid`'i gösteriyor ve içindeki her hücre `0`.
- [ ] Bütün ızgara yeşile döner

# --hint--

Count the braces: each `for` opens a `{` and needs its own `}`. The `if` line has no braces because it is one line.

# --hint-tr--

Süslü parantezleri say: her `for` bir `{` açar ve kendi `}`'sine ihtiyaç duyar. `if` satırı tek satır olduğu için
süslü parantezsiz yazıldı.

# --try--

In `reset`, under `grid = emptyGrid()`, add `grid[10][10] = 1` and run: one cell lights up. Remove the line.

# --try-tr--

`reset` içinde `grid = emptyGrid()` satırının altına `grid[10][10] = 1` ekle ve çalıştır: bir hücre yanar. Sonra satırı sil.

# --tests--

Each live cell should be drawn as a small green square at its column and row.
tr: Her canlı hücre, kendi sütununa ve satırına küçük yeşil bir kare olarak çizilmeli.

```js
grid = emptyGrid()
grid[2][3] = 1
grid[47][59] = 1
draw()
assert.deepEqual($.rects('#4ade80'), [
  { x: 24, y: 52, w: 7, h: 7, color: '#4ade80' },
  { x: 472, y: 412, w: 7, h: 7, color: '#4ade80' },
])
```

An empty grid should show no green squares.
tr: Boş bir ızgarada hiç yeşil kare görünmemeli.

```js
grid = emptyGrid()
draw()
assert.lengthOf($.rects('#4ade80'), 0)
```

# --solution--

```js
// Game of Life, step by step.
// The page already has <canvas id="game" width="480" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 8
const COLS = 60
const ROWS = 48
const TOP = 36

let grid // grid[row][col]: 1 alive, 0 dead

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

function reset() {
  grid = emptyGrid()
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, TOP, COLS * CELL, ROWS * CELL)

  ctx.fillStyle = '#4ade80'
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) ctx.fillRect(c * CELL, TOP + r * CELL, CELL - 1, CELL - 1)
    }
  }
}

reset()
draw()
```
