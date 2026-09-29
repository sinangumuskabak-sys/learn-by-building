---
title: A puzzle from a string
title_tr: Metinden bir bulmaca
skills: [prog.arrays]
---

# --goal--

A puzzle is 81 digits, row by row, with 0 for an empty cell. We write it as one text and turn it into a 9 × 9 grid of
numbers, then draw the digits.

# --goal-tr--

Bir bulmaca 81 rakamdan oluşur: satır satır, boş hücre için **0**. Onu tek bir **metin** olarak yazıp 9 × 9'luk bir
**sayı ızgarasına** çeviriyoruz, sonra rakamları hücrelere çiziyoruz. (Bu bulmaca Vikipedi'deki ünlü sudoku örneği.)

# --code--

```js
// The puzzle, row by row; 0 is an empty cell.
const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
}

      if (grid[r][c] === 0) continue
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(grid[r][c]), x + SIZE / 2, y + SIZE / 2 + 9)
```

# --meaning--

- `Array.from({ length: 9 }, (_, r) => ...)` builds 9 rows; row `r` is the 9 characters from position `r * 9`.
- `[...text]` splits a text into characters; `.map(Number)` turns `'5'` into `5`.
- Empty cells (`0`) are skipped with `continue`; the others show their digit in the middle of the cell.

# --meaning-tr--

- `PUZZLE.slice(r * 9, r * 9 + 9)` → metnin `r`. satırı: `r * 9`. karakterden başlayan 9 karakter.
- `[...metin]` → metni tek tek **karakterlere** ayırır: `'530'` → `['5', '3', '0']`.
- `.map(Number)` → her karakteri sayıya çevirir: `'5'` → `5`.
- `Array.from({ length: 9 }, (_, r) => ...)` → 9 elemanlı bir dizi kurar; her eleman için fonksiyonu sıra numarasıyla
  (`r`) çağırır. Sonuç: 9 satırlık **ızgara** (dizilerden oluşan dizi). `grid[r][c]` → `r`. satırın `c`. hücresi.
- `if (grid[r][c] === 0) continue` → boş hücreye rakam yazma, sıradakine geç.
- `x + SIZE / 2`, `y + SIZE / 2 + 9` → hücrenin ortası (yazının taban çizgisi biraz aşağıda, o yüzden `+ 9`).

# --task--

1. Under `TOP`, write the comment, `PUZZLE`, `let grid` and `reset`.
2. In `draw`, under the white cell, write the digit lines.
3. Call `reset()` above `draw()` at the bottom.

# --task-tr--

1. `const TOP = 56` satırının altına bir boş satır bırakıp yorumu, `PUZZLE`'ı, `let grid`'i ve `reset`'i yaz. (81
   rakamı dikkatle yaz; hata yaparsan kontrol yakalar.)
2. `draw` içinde beyaz hücreyi çizen satırın altına rakam satırlarını yaz.
3. En alttaki `draw()` satırının üstüne `reset()` yaz.
4. **Çalıştır**: bulmacanın rakamları görünmeli.

# --tests--

`grid` should hold the puzzle as 9 rows of 9 numbers.
tr: `grid` bulmacayı 9 sayılık 9 satır olarak tutmalı.

```js
assert.lengthOf(grid, 9)
assert.deepEqual(grid[0], [5, 3, 0, 0, 7, 0, 0, 0, 0])
assert.deepEqual(grid[8], [0, 0, 0, 0, 8, 0, 0, 7, 9])
```

The puzzle's 30 digits should be drawn in their cells.
tr: Bulmacanın 30 rakamı hücrelerine çizilmeli.

```js
const digits = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(digits, 30)
assert.deepEqual(digits[0].args, ['5', 14 + 24, 56 + 24 + 9])
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

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
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
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 26px sans-serif'
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

reset()
draw()
```
