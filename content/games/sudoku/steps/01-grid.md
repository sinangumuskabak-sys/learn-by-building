---
title: A grid from a string
title_tr: Bir metinden ızgara
skills: [prog.arrays, game.canvas]
---

# --explanation--

Sudoku is a 9 by 9 grid split into nine 3 by 3 **boxes**. Every row, every column and every box must hold the digits 1 to 9
exactly once. Some digits are given; you fill in the rest.

A puzzle is easy to write down as **81 characters**, row after row, with `0` for an empty cell. That is how puzzles are
shared online, and it is easy to turn into a 2D array:

```js
grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
```

`PUZZLE.slice(r * 9, r * 9 + 9)` is row `r` as text, `[...text]` splits it into characters and `.map(Number)` turns `'5'` into
`5`.

We also remember which digits were **given**, in a second grid of `true`/`false`. The player will not be allowed to change
them, and they are drawn in bold so they look different from the player's own digits.

The thick lines are what make the boxes visible: every third line is thicker and darker. A line is just a thin `fillRect`,
centered on the border between two cells.

# --explanation-tr--

Sudoku, dokuz tane 3'e 3 **kutuya** bölünmüş 9'a 9 bir ızgaradır. Her satır, her sütun ve her kutu 1'den 9'a rakamları tam
bir kez içermelidir. Bazı rakamlar verilmiştir; gerisini sen doldurursun.

Bir bulmacayı satır satır, boş hücre için `0` ile **81 karakter** olarak yazmak kolaydır. Bulmacalar internette böyle
paylaşılır ve 2 boyutlu bir diziye çevirmesi kolaydır:

```js
grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
```

`PUZZLE.slice(r * 9, r * 9 + 9)` metin olarak `r` satırıdır, `[...text]` onu karakterlere böler ve `.map(Number)` `'5'`'i
`5`'e çevirir.

Hangi rakamların **verildiğini** de ikinci bir `true`/`false` ızgarasında hatırlarız. Oyuncunun onları değiştirmesine izin
verilmeyecek ve oyuncunun kendi rakamlarından farklı görünsünler diye kalın çizilirler.

Kutuları görünür kılan kalın çizgilerdir: her üçüncü çizgi daha kalın ve daha koyudur. Bir çizgi, iki hücre arasındaki sınırın
ortasına yerleştirilmiş ince bir `fillRect`'ten ibarettir.

# --task--

1. Add `SIZE = 48`, `LEFT = (canvas.width - 9 * SIZE) / 2`, `TOP = 56` and the puzzle:
   `PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'`.
2. In `reset()`, build `grid` from `PUZZLE`, and `given`: `true` where the digit is not `0`.
3. Each frame fill the canvas with `'#f8fafc'`, draw each cell as a white 48 by 48 square, and its digit (if not `0`) in the
   middle: `'bold 26px sans-serif'` in `'#0f172a'` for given digits, `'26px sans-serif'` in `'#2563eb'` for the others,
   centered at `y + SIZE / 2 + 9`.
4. Draw the 10 lines each way: width 3 in `'#0f172a'` when `i % 3 === 0`, otherwise width 1 in `'#94a3b8'`.

# --task-tr--

1. `SIZE = 48`, `LEFT = (canvas.width - 9 * SIZE) / 2`, `TOP = 56` ve bulmacayı ekle:
   `PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'`.
2. `reset()`'te `PUZZLE`'dan `grid`'i ve `given`'ı kur: rakamın `0` olmadığı yerde `true`.
3. Her karede canvas'ı `'#f8fafc'` ile doldur, her hücreyi beyaz 48'e 48 bir kare olarak ve rakamını (`0` değilse) ortasına
   çiz: verilen rakamlar için `'#0f172a'` renginde `'bold 26px sans-serif'`, diğerleri için `'#2563eb'` renginde
   `'26px sans-serif'`, `y + SIZE / 2 + 9`'da ortalı.
4. Her yönde 10 çizgi çiz: `i % 3 === 0` olduğunda `'#0f172a'` renginde 3 kalınlığında, değilse `'#94a3b8'` renginde 1
   kalınlığında.

# --tests--

The grid should be read from the puzzle string, and the given digits remembered.
tr: Izgara bulmaca metninden okunmalı ve verilen rakamlar hatırlanmalı.

```js
assert.lengthOf(grid, 9)
assert.deepEqual(grid[0], [5, 3, 0, 0, 7, 0, 0, 0, 0])
assert.deepEqual(grid[8], [0, 0, 0, 0, 8, 0, 0, 7, 9])
assert.isTrue(given[0][0])
assert.isFalse(given[0][2])
assert.isTrue(given[8][8])
```

The 30 given digits should be drawn, row by row.
tr: Verilen 30 rakam satır satır çizilmeli.

```js
$.tick(1)
const digits = $.texts()
assert.lengthOf(digits, 30, 'the 30 digits of the puzzle')
assert.deepEqual(digits.slice(0, 5), ['5', '3', '7', '6', '1'])
```

There should be 81 white cells, four thick lines and six thin lines each way.
tr: 81 beyaz hücre, her yönde dört kalın ve altı ince çizgi olmalı.

```js
$.tick(1)
const thick = $.rects('#0f172a').filter((r) => r.w === 3 || r.h === 3)
assert.lengthOf(thick, 8, 'four thick lines each way')
assert.lengthOf($.rects('#94a3b8'), 12, 'six thin lines each way')
assert.lengthOf($.rects('#ffffff').filter((r) => r.w === 48 && r.h === 48), 81)
```

# --seed--

```js
// Sudoku, step by step.
// The page already has <canvas id="game" width="460" height="560"></canvas>.
// Write your code below.
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
