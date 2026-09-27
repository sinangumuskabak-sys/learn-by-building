---
title: Finding matches
title_tr: Eşleşmeleri bulmak
skills: [prog.arrays, prog.loops]
---

# --explanation--

A swap only counts if it makes a match. So we need `findMatches()`: **every** cell that is part of three or more of one color
in a row or a column.

The idea is to walk each run **once, from its first gem**. For every cell we look in two directions, right `[0, 1]` and down
`[1, 0]`. If the cell before it in that direction has the same color, this cell is in the middle of a run we already counted
and we skip it. Otherwise we count how far the color continues:

```js
let length = 1
while (next cell is on the board && it has the same gem) length++
if (length >= 3) // add all `length` cells
```

A run of four or five is found the same way. A gem can be in a row run **and** a column run at once (an L or a T shape),
so we collect the cells in a `Set`: adding the same cell twice keeps it once. We store a cell as one number,
`r * N + c`, because a `Set` compares objects by identity and `{ r: 2, c: 3 }` would never equal another `{ r: 2, c: 3 }`.
The row is `Math.floor(cell / N)` and the column `cell % N`.

With that, `trySwap` swaps, looks, and **swaps back** when nothing matched, just like the real game, where a useless swap
bounces back.

# --explanation-tr--

Bir takas ancak bir eşleşme yaparsa sayılır. Öyleyse `findMatches()`'e ihtiyacımız var: bir satırda ya da sütunda tek
renkten üç ya da daha fazlasının parçası olan **her** hücre.

Fikir, her sırayı **ilk mücevherinden başlayarak bir kez** gezmek. Her hücre için iki yöne bakarız: sağ `[0, 1]` ve aşağı
`[1, 0]`. O yöndeki bir önceki hücre aynı renkteyse bu hücre zaten saydığımız bir sıranın ortasındadır ve onu atlarız. Değilse
rengin ne kadar devam ettiğini sayarız:

```js
let length = 1
while (sonraki hücre tahtada && aynı mücevher) length++
if (length >= 3) // `length` hücrenin hepsini ekle
```

Dört ya da beşlik bir sıra da aynı yolla bulunur. Bir mücevher aynı anda hem bir satır sırasında **hem de** bir sütun
sırasında olabilir (L ya da T şekli), bu yüzden hücreleri bir `Set`'te toplarız: aynı hücreyi iki kez eklemek onu bir kez
tutar. Bir hücreyi tek sayı olarak, `r * N + c` diye saklarız, çünkü `Set` nesneleri kimliğe göre karşılaştırır ve
`{ r: 2, c: 3 }` hiçbir zaman başka bir `{ r: 2, c: 3 }`'e eşit olmaz. Satır `Math.floor(cell / N)`, sütun `cell % N`'dir.

Bununla `trySwap` takas eder, bakar ve hiçbir şey eşleşmediyse **geri takas eder**; tıpkı işe yaramayan bir takasın geri
sektiği gerçek oyundaki gibi.

# --task--

1. Write `findMatches()`: a `Set` of `r * N + c` for every cell in a run of 3 or more, across rows and columns.
2. In `trySwap`, after swapping, if `findMatches()` is empty, swap back and return `false`.

# --task-tr--

1. `findMatches()` yaz: satırlarda ve sütunlarda 3 ya da daha uzun bir sıradaki her hücre için `r * N + c` içeren bir `Set`.
2. `trySwap`'ta takastan sonra `findMatches()` boşsa geri takas et ve `false` döndür.

# --tests--

`findMatches` should find runs of three and more in rows and columns, and nothing on a board without runs.
tr: `findMatches` satırlarda ve sütunlarda üç ve daha uzun sıraları bulmalı, sırasız bir tahtada hiçbir şey bulmamalı.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
assert.strictEqual(findMatches().size, 0)
board[2] = [3, 3, 3, 3, 1, 2, 2, 2]
board[5][6] = board[6][6] = board[7][6] = 5
assert.sameMembers([...findMatches()], [16, 17, 18, 19, 21, 22, 23, 46, 54, 62])
```

A swap that makes no match should bounce back.
tr: Eşleşme yapmayan bir takas geri sekmeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
$.click(32 + 48 * 4, 96 + 48 * 5)
$.click(32 + 48 * 5, 96 + 48 * 5)
assert.strictEqual(board[5][4], (5 + 8) % 6, 'no match: the gems go back')
assert.strictEqual(board[5][5], (5 + 10) % 6)
```

A swap that makes a match should stay, and gems that are not neighbours still cannot be swapped.
tr: Eşleşme yapan bir takas kalmalı; komşu olmayan mücevherler yine takas edilememeli.

```js
board = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r + 2 * c) % 6))
board[0][0] = board[0][1] = board[1][2] = 1
assert.isTrue(trySwap({ r: 1, c: 2 }, { r: 0, c: 2 }))
assert.deepEqual(board[0].slice(0, 3), [1, 1, 1], 'the swap stays')
assert.isFalse(trySwap({ r: 3, c: 3 }, { r: 5, c: 3 }), 'only neighbours')
```

# --solution--

```js
// Match three, step by step.
// The page already has <canvas id="game" width="400" height="480"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 8 // 8 by 8 gems
const SIZE = 48
const LEFT = (canvas.width - N * SIZE) / 2
const TOP = 72 // room for the score and the moves left
const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

let board // board[row][col]: a color index
let selected

const randomGem = () => Math.floor(Math.random() * COLORS.length)

// Would this gem make three in a row with the two to its left, or the two above it?
function makesRun(r, c, gem) {
  const left = c >= 2 && board[r][c - 1] === gem && board[r][c - 2] === gem
  const up = r >= 2 && board[r - 1][c] === gem && board[r - 2][c] === gem
  return left || up
}

// A new board with no three in a row: each gem avoids the colors that would make one.
function newBoard() {
  board = []
  for (let r = 0; r < N; r++) {
    board.push([])
    for (let c = 0; c < N; c++) {
      let gem
      do gem = randomGem()
      while (makesRun(r, c, gem))
      board[r].push(gem)
    }
  }
}

function reset() {
  newBoard()
  selected = null
}

// Every cell that is part of three or more of the same color in a row or a column.
function findMatches() {
  const cells = new Set()
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const gem = board[r][c]
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        // Only start counting at the first gem of a run.
        const pr = r - dr
        const pc = c - dc
        if (pr >= 0 && pc >= 0 && board[pr][pc] === gem) continue
        let length = 1
        while (r + dr * length < N && c + dc * length < N && board[r + dr * length][c + dc * length] === gem) length++
        if (length >= 3) for (let i = 0; i < length; i++) cells.add((r + dr * i) * N + (c + dc * i))
      }
    }
  }
  return cells
}

function swap(a, b) {
  const gem = board[a.r][a.c]
  board[a.r][a.c] = board[b.r][b.c]
  board[b.r][b.c] = gem
}

function trySwap(a, b) {
  if (Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) return false
  swap(a, b)
  if (findMatches().size === 0) {
    swap(a, b) // no match: the gems go back
    return false
  }
  return true
}

function cellAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SIZE)
  const c = Math.floor(x / SIZE)
  return r >= 0 && r < N && c >= 0 && c < N ? { r, c } : null
}

canvas.addEventListener('pointerdown', (event) => {
  const cell = cellAt(event)
  if (!cell) return
  if (selected && trySwap(selected, cell)) selected = null
  else selected = selected && selected.r === cell.r && selected.c === cell.c ? null : cell
})

function draw() {
  ctx.fillStyle = '#1e1b4b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#3730a3'
      ctx.fillRect(x, y, SIZE, SIZE)
      const gem = board[r][c]
      ctx.fillStyle = COLORS[gem]
      ctx.beginPath()
      ctx.arc(x + SIZE / 2, y + SIZE / 2, SIZE / 2 - 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (selected) {
    ctx.lineWidth = 3
    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(LEFT + selected.c * SIZE + 2, TOP + selected.r * SIZE + 2, SIZE - 4, SIZE - 4)
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
