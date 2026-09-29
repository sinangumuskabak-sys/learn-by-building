---
title: A random soup
title_tr: Rastgele bir çorba
skills: [prog.arrays]
---

# --goal--

To start, about a quarter of the cells come alive at random. `map` makes a new grid from the old one, cell by cell.

# --goal-tr--

Boş bir dünya sıkıcı. Başlangıçta hücrelerin **yaklaşık dörtte biri rastgele canlansın**: Hayat Oyunu'nda buna
"çorba" denir. Her hücre için yazı tura atar gibi karar vereceğiz: dört seferde bir "canlı".

# --code--

```js
function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
}

function reset() {
  grid = emptyGrid()
  randomize()
}
```

# --meaning--

- `Math.random()` gives a random number from 0 up to 1; `< 0.25` is true about one time in four.
- `condition ? 1 : 0` is `1` when the condition is true, `0` otherwise.
- `grid.map(...)` makes a new list with one result for each row; the inner `row.map(...)` does the same for each cell.
- `reset` now makes an empty grid and fills it at random.

# --meaning-tr--

- `Math.random()` → her çağrıldığında 0 ile 1 arasında **rastgele** bir sayı verir (0.73, 0.12...).
- `Math.random() < 0.25` → sayı 0.25'ten küçükse doğru. Bu, **dört seferde bir** olur.
- `koşul ? 1 : 0` → "koşul doğruysa `1`, değilse `0`". Kısa bir "eğer ... değilse" yazılışı.
- `grid.map((row) => ...)` → `map`, listenin **her elemanı için** sağdaki işi yapar ve sonuçlardan **yeni bir liste**
  kurar. Burada her satır (`row`) için yeni bir satır yapıyoruz.
- `row.map(() => ...)` → aynı şey bir satırın her hücresi için: her hücrenin yerine `1` ya da `0` koyar.
- `grid = ...` → yeni ızgarayı `grid` kutusuna koyar.
- `reset` içindeki `randomize()` → boş ızgarayı kurduktan hemen sonra rastgele doldurur.

# --task--

1. Write `randomize` above `function reset() {`, with an empty line between them.
2. Inside `reset`, under `grid = emptyGrid()`, call `randomize()`. Press **Run**.

# --task-tr--

1. `randomize` fonksiyonunu `function reset() {` satırının **üstüne** yaz; aralarında bir boş satır kalsın.
2. `reset` içinde `grid = emptyGrid()` satırının altına `randomize()` yaz.
3. **Çalıştır**: ızgaraya serpilmiş yüzlerce yeşil nokta görmelisin.

# --try--

Change `0.25` to `0.6` and run: the grid gets crowded. Put `0.25` back.

# --try-tr--

`0.25`'i `0.6` yap ve çalıştır: ızgara kalabalıklaşır. Sonra `0.25`'e geri al.

# --tests--

About a quarter of the cells should be alive, and every cell `0` or `1`.
tr: Hücrelerin yaklaşık dörtte biri canlı olmalı, her hücre `0` ya da `1`.

```js
assert.lengthOf(grid, 48)
for (const row of grid) assert.lengthOf(row, 60)
const alive = grid.flat().filter((cell) => cell === 1).length
assert.strictEqual(grid.flat().filter((cell) => cell !== 0 && cell !== 1).length, 0, 'every cell is 0 or 1')
assert.isAbove(alive, 2880 * 0.18)
assert.isBelow(alive, 2880 * 0.32)
```

`randomize` should make a new pattern each time.
tr: `randomize` her seferinde yeni bir desen yapmalı.

```js
const before = grid.flat().join('')
randomize()
assert.notStrictEqual(grid.flat().join(''), before)
```

Every live cell should be on screen.
tr: Her canlı hücre ekranda olmalı.

```js
const alive = grid.flat().filter((cell) => cell === 1).length
assert.lengthOf($.rects('#4ade80'), alive)
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

function randomize() {
  grid = grid.map((row) => row.map(() => (Math.random() < 0.25 ? 1 : 0)))
}

function reset() {
  grid = emptyGrid()
  randomize()
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
