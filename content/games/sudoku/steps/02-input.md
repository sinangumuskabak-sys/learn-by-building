---
title: Selecting and typing
title_tr: Seçmek ve yazmak
skills: [game.input, game.state]
---

# --explanation--

The player needs a **selected cell**: the arrow keys move it, a click puts it anywhere, and the digit keys write into it.

Moving off the edge should wrap around, so that Up on the top row goes to the bottom. The `%` operator does that, as long as
the number is not negative. Adding 9 first keeps it positive:

```js
selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
```

Typing is one small function, `enter(d)`, used by every key: a digit writes `d`, and `0`, Backspace and Delete write `0`,
which empties the cell. It refuses to touch a **given** cell; that single check is what protects the puzzle.

Good Sudoku apps help your eyes. When you select a cell they shade its **row, column and box**, the three places where its
digit may not appear again, and highlight every cell holding the **same digit**. It is only a few `if`s choosing the fill
color, but it makes the game much easier to read.

# --explanation-tr--

Oyuncunun bir **seçili hücreye** ihtiyacı var: ok tuşları onu hareket ettirir, bir tıklama onu herhangi bir yere koyar ve
rakam tuşları ona yazar.

Kenardan çıkmak başa sarmalı; üst satırda Yukarı, en alta gitmeli. Sayı negatif olmadığı sürece `%` operatörü bunu yapar.
Önce 9 eklemek onu pozitif tutar:

```js
selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
```

Yazmak, her tuşun kullandığı küçük bir fonksiyondur: `enter(d)`. Bir rakam `d` yazar; `0`, Backspace ve Delete ise hücreyi
boşaltan `0`'ı yazar. **Verilen** bir hücreye dokunmayı reddeder; bulmacayı koruyan o tek kontroldür.

İyi Sudoku uygulamaları gözüne yardım eder. Bir hücre seçtiğinde onun **satırını, sütununu ve kutusunu**, yani rakamının
yeniden görünemeyeceği üç yeri gölgelendirir ve **aynı rakamı** tutan her hücreyi vurgular. Dolgu rengini seçen birkaç
`if`'ten ibarettir ama oyunu okumayı çok kolaylaştırır.

# --task--

1. Add `selected`, `{ r: 4, c: 4 }` in `reset()`.
2. Write `enter(d)`: if the selected cell is not given, set it to `d`.
3. On `keydown`: the arrow keys move `selected` with wrap-around (and `preventDefault()`), `'1'` to `'9'` call `enter` with
   that digit, and `'0'`, `'Backspace'` and `'Delete'` call `enter(0)`.
4. On `pointerdown`, convert to canvas pixels and select the cell under the pointer, if any.
5. Choose each cell's fill: `'#e2e8f0'` in the selected cell's row, column or box, `'#bfdbfe'` if it holds the selected cell's
   digit (when that is not `0`), `'#93c5fd'` for the selected cell itself, otherwise white. Later rules win.

# --task-tr--

1. `selected` ekle, `reset()`'te `{ r: 4, c: 4 }`.
2. `enter(d)` yaz: seçili hücre verilen bir hücre değilse onu `d` yap.
3. `keydown`'da: ok tuşları `selected`'ı başa sararak hareket ettirir (ve `preventDefault()`), `'1'`'den `'9'`'a o rakamla
   `enter`'ı, `'0'`, `'Backspace'` ve `'Delete'` ise `enter(0)`'ı çağırır.
4. `pointerdown`'da canvas piksellerine çevir ve varsa işaretçinin altındaki hücreyi seç.
5. Her hücrenin dolgusunu seç: seçili hücrenin satırında, sütununda ya da kutusunda `'#e2e8f0'`, seçili hücrenin rakamını
   tutuyorsa (`0` değilken) `'#bfdbfe'`, seçili hücrenin kendisi için `'#93c5fd'`, değilse beyaz. Sonraki kurallar kazanır.

# --tests--

The arrow keys should move the selection and wrap around the edges, and a click should select a cell.
tr: Ok tuşları seçimi hareket ettirmeli ve kenarlardan başa sarmalı; bir tıklama bir hücre seçmeli.

```js
assert.deepEqual(selected, { r: 4, c: 4 })
$.press('ArrowUp')
$.press('ArrowLeft')
assert.deepEqual(selected, { r: 3, c: 3 })
for (let i = 0; i < 4; i++) $.press('ArrowUp')
assert.deepEqual(selected, { r: 8, c: 3 }, 'going off the top wraps to the bottom')
$.press('ArrowRight')
$.click(38 + 48 * 2, 80)
assert.deepEqual(selected, { r: 0, c: 2 }, 'clicking a cell selects it')
```

Digits should be typed into empty cells and erased with Backspace, but given digits should not change.
tr: Rakamlar boş hücrelere yazılmalı ve Backspace ile silinmeli, ama verilen rakamlar değişmemeli.

```js
$.click(38 + 48 * 2, 80)
$.press('4')
assert.strictEqual(grid[0][2], 4)
$.press('9')
assert.strictEqual(grid[0][2], 9, 'a new digit replaces the old one')
$.press('Backspace')
assert.strictEqual(grid[0][2], 0)
$.click(38, 80)
$.press('1')
assert.strictEqual(grid[0][0], 5, 'the puzzle\'s own digits cannot change')
```

The selected cell, its row, column and box should be shaded.
tr: Seçili hücre, satırı, sütunu ve kutusu gölgelendirilmeli.

```js
$.click(38 + 48 * 2, 80)
$.press('4')
$.tick(1)
assert.deepInclude($.rects('#93c5fd'), { x: 14 + 48 * 2, y: 56, w: 48, h: 48, color: '#93c5fd' })
assert.deepInclude($.rects('#e2e8f0'), { x: 14 + 48 * 8, y: 56, w: 48, h: 48, color: '#e2e8f0' }, 'same row')
assert.deepInclude($.rects('#e2e8f0'), { x: 14 + 48 * 2, y: 56 + 48 * 8, w: 48, h: 48, color: '#e2e8f0' }, 'same column')
assert.deepInclude($.rects('#e2e8f0'), { x: 14, y: 56 + 48 * 2, w: 48, h: 48, color: '#e2e8f0' }, 'same box')
assert.deepInclude($.rects('#ffffff'), { x: 14 + 48 * 4, y: 56 + 48 * 4, w: 48, h: 48, color: '#ffffff' })
assert.include($.texts(), '4')
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
let selected

function reset() {
  grid = Array.from({ length: 9 }, (_, r) => [...PUZZLE.slice(r * 9, r * 9 + 9)].map(Number))
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
}

function enter(d) {
  if (given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
}

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
})

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
})

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const d = selected && grid[selected.r][selected.c]
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = LEFT + c * SIZE
      const y = TOP + r * SIZE
      // Light up the selected cell's row, column and box, and every cell with the same digit.
      const sameBox = Math.floor(r / 3) === Math.floor(selected.r / 3) && Math.floor(c / 3) === Math.floor(selected.c / 3)
      let fill = '#ffffff'
      if (r === selected.r || c === selected.c || sameBox) fill = '#e2e8f0'
      if (d && grid[r][c] === d) fill = '#bfdbfe'
      if (r === selected.r && c === selected.c) fill = '#93c5fd'
      ctx.fillStyle = fill
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
