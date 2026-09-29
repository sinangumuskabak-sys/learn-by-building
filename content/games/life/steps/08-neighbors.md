---
title: Count the neighbours
title_tr: Komşuları say
skills: [prog.loops, prog.functions]
---

# --goal--

The rules of Life depend on one number: how many of a cell's 8 neighbours (sides and corners) are alive. We write a
function that counts them.

# --goal-tr--

Hayat Oyunu'nun kuralları tek bir sayıya bakar: bir hücrenin **8 komşusundan** (sağ, sol, üst, alt ve dört çapraz)
**kaçı canlı?** Bir satranç tahtasında şahın gidebileceği 8 kare gibi.

Bu adımda o sayıyı bulan bir fonksiyon yazıyoruz. Ekran değişmeyecek; sayıyı bir sonraki adımda kullanacağız.

# --code--

```js
// Live neighbours among the 8 around (r, c), skipping those off the board.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) count += grid[nr][nc]
    }
  }
  return count
}
```

# --meaning--

- `r` and `c` are parameters: the row and column we pass in, as in `countNeighbors(10, 10)`.
- The two loops run `dr` and `dc` over -1, 0, 1: the row above, the same and below, times the column left, same
  and right. That is 9 places.
- `continue` skips `(0, 0)`, the cell itself.
- The long `if` counts a neighbour only when it is on the board. Cells are `1` or `0`, so we can just add them.
- `return count` hands the number back to whoever called the function.

# --meaning-tr--

- `function countNeighbors(r, c)` → parantez içindeki `r` ve `c` **parametre**: fonksiyonu çağırırken verdiğin
  satır ve sütun. `countNeighbors(10, 10)` dersen içeride `r` 10, `c` 10 olur.
- `let count = 0` → bir **sayaç**. `count += grid[nr][nc]` → "sayaca o hücreyi ekle". Hücre `1` ya da `0`
  olduğu için canlıysa 1 artar, ölüyse değişmez.
- İki döngü `dr` ve `dc`'yi **-1, 0, 1** yapar (`<=` "küçük **ya da eşit**"). `dr` bir üst / aynı / bir alt satır,
  `dc` bir sol / aynı / bir sağ sütun: 3 × 3 = 9 yer.
- `if (dr === 0 && dc === 0) continue` → ortadaki yer **hücrenin kendisi**; onu saymayız. `===` "eşit mi?" diye sorar,
  `&&` "**ve**" demektir. `continue` → "bu turu atla, sıradakine geç".
- `const nr = r + dr` ve `const nc = c + dc` → komşunun satırı ve sütunu.
- `if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS)` → komşu **tahtanın içindeyse** say. Kenardaki bir hücrenin
  bazı komşuları tahtanın dışına düşer; `grid[-1]` diye bir satır yok.
- `return count` → fonksiyon işi bitince bu sayıyı **geri verir**.

# --task--

Write the function under `reset`, after an empty line.

# --task-tr--

`reset` fonksiyonunun kapanan `}`'sinin altında bir boş satır bırak ve yorum satırıyla birlikte `countNeighbors`'ı yaz.
**Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --hint--

If the count is one too many, you are counting the cell itself: check the `continue` line. If you get an error about
`undefined`, the `if` that keeps the neighbour on the board is missing a part.

# --hint-tr--

Sayı hep bir fazla çıkıyorsa hücrenin kendisini de sayıyorsun: `continue` satırına bak. `undefined` ile ilgili bir
hata alıyorsan komşuyu tahtada tutan uzun `if`'in bir parçası eksik.

# --tests--

`countNeighbors` should count the live cells around a cell, but not the cell itself.
tr: `countNeighbors` bir hücrenin çevresindeki canlı hücreleri saymalı, ama hücrenin kendisini değil.

```js
grid = emptyGrid()
grid[10][10] = grid[10][11] = grid[11][10] = 1
assert.strictEqual(countNeighbors(10, 10), 2, 'a cell does not count itself')
assert.strictEqual(countNeighbors(11, 11), 3)
assert.strictEqual(countNeighbors(12, 12), 0)
assert.strictEqual(countNeighbors(9, 9), 1)
```

Cells at the edge should only count neighbours that are on the board.
tr: Kenardaki hücreler yalnız tahtanın içindeki komşuları saymalı.

```js
grid = emptyGrid()
grid[0][1] = grid[1][0] = grid[1][1] = 1
assert.strictEqual(countNeighbors(0, 0), 3)
assert.strictEqual(countNeighbors(47, 59), 0)
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

// Live neighbours among the 8 around (r, c), skipping those off the board.
function countNeighbors(r, c) {
  let count = 0
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) count += grid[nr][nc]
    }
  }
  return count
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
