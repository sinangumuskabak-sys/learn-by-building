---
title: Number pad and best time
title_tr: Rakam tuşları ve en iyi süre
skills: [game.input, game.state]
---

# --explanation--

On a phone there are no digit keys, so the game draws its own: a row of ten buttons under the board, 1 to 9 and an eraser.
Each is `PAD_W` wide, so the button under a tap is `Math.floor(x / PAD_W)`. Buttons 0 to 8 type the digits 1 to 9, and
button 9 erases. The keyboard and the pad both call the same `enter(d)`, so there is still only one place where digits are
written.

The clock counts frames, and `Math.floor(frames / 60)` is seconds; it stops once the puzzle is solved. A time is shown as
`m:ss`: `String(s % 60).padStart(2, '0')` turns 5 into `05`.

The best time is saved in `localStorage`, but **only for games without hints**. Otherwise pressing H fifty times would set an
unbeatable record, and the record would mean nothing.

# --explanation-tr--

**Bu adımda:** ızgaranın altına 1'den 9'a kadar rakam düğmeleri ve bir silgi (`⌫`) gelecek; telefonda da parmakla
oynayabileceksin. Sol üstte bir saat (`Time 0:42`), sağ üstte en iyi süren ve ipucu sayın (`Best 1:15  Hints 0`)
görünecek.

**Kendi tuş takımımız.** Telefonda rakam tuşu yok; oyun kendi düğmelerini çizer: ızgaranın altında on düğmelik bir
sıra. Her biri `PAD_W` genişliğinde (432 / 10 = 43,2 piksel), yani dokunulan düğmenin sırası
`Math.floor(x / PAD_W)`. 0'dan 8'e kadar düğmeler 1'den 9'a rakamları yazar (`button + 1`), 9. düğme siler
(`0`). Klavye de düğmeler de aynı `enter(d)`'yi çağırır; rakamların yazıldığı tek bir yer kalır.

`button === 9 ? 0 : button + 1` → "son düğmeyse 0 (sil), değilse sırasının bir fazlası".

**Saat.** Oyun döngüsü saniyede ~60 kez döner. Her turda bir sayacı artırırız (`frames += 1`); `Math.floor(frames /
60)` saniyedir. Bulmaca çözülünce sayacı durdururuz: `if (!won) frames += 1` ("kazanılmadıysa artır"; `!` "değil").

**Süreyi `d:ss` göstermek.** 75 saniye → `1:15`. Dakika `Math.floor(s / 60)`, saniye `s % 60` (bölümden kalan).
Saniye tek haneliyse başına sıfır ekleriz: `String(5).padStart(2, '0')` → `'05'` (yazıyı soldan 2 karaktere kadar
`'0'` ile doldurur). Bunu küçük bir fonksiyon yapar:

```js
const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
```

**En iyi süreyi saklamak (`localStorage`).** Tarayıcının, sayfa kapansa da hatırladığı küçük bir defterdir:
`localStorage.setItem('sudoku-best', 75)` yazar, `localStorage.getItem('sudoku-best')` okur (yazı olarak ya da hiç
yoksa `null`). `Number(...)` sayıya çevirir; kayıt yoksa `|| 0` ile `0` olur. `0` "henüz rekor yok" demek.

Rekor yalnızca **ipucu kullanılmayan** oyunlarda kaydedilir. Yoksa H'ye elli kez basan biri yenilmez bir rekor
koyardı ve rekorun anlamı kalmazdı:

```js
if (hints === 0 && (best === 0 || seconds < best))
```

"İpucu yoksa **ve** (henüz rekor yoksa **veya** bu süre daha kısaysa)". Parantez `||`'yi bir arada tutar.

# --task--

1. Add `PAD_Y = TOP + 9 * SIZE + 16`, `PAD_W = (9 * SIZE) / 10` and `PAD_H = 44`. Draw ten buttons from `LEFT`: a
   `'#e0e7ff'` rectangle 2 pixels inside each, with `1` to `9` and then `⌫` in `'#3730a3'`.
2. A click inside the pad calls `enter` with that button's digit (the last one erases).
3. Add `frames` (`0` in `reset()`), counted up each frame while not `won`. Draw `Time 0:42` at the top left.
4. Keep `best` in `localStorage` under `'sudoku-best'` (in seconds). In `checkWin`, save the time if there were no hints and it
   beats `best` (or there is no best yet).
5. The top right shows `Best 1:15  Hints 0` (`Best -` with no best yet), and the win message becomes `Solved in 1:15!`.

# --task-tr--

1. `const TOP = 56` satırının hemen **altına** tuş takımı ölçülerini ekle:

   ```js
   const PAD_Y = TOP + 9 * SIZE + 16 // the row of number buttons for touch screens
   const PAD_W = (9 * SIZE) / 10
   const PAD_H = 44
   ```

2. `let selected` satırının altına `let frames`, `let hints` satırının altına da rekoru ekle:

   ```js
   let frames
   ```

   ```js
   let best = Number(localStorage.getItem('sudoku-best')) || 0
   ```

3. `reset()` içinde `selected = { r: 4, c: 4 }` satırının hemen **altına** ekle:

   ```js
     frames = 0
   ```

4. `checkWin()` fonksiyonunun sonuna rekoru kaydeden kısmı ekle:

   ```js
   function checkWin() {
     for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] === 0 || conflict(r, c)) return
     won = true
     const seconds = Math.floor(frames / 60)                  // ← yeni
     if (hints === 0 && (best === 0 || seconds < best)) {     // ← yeni
       best = seconds                                         // ← yeni
       localStorage.setItem('sudoku-best', best)              // ← yeni
     }                                                        // ← yeni
   }
   ```

5. Tıklama dinleyicisinde, `if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }` satırının hemen
   **altına** tuş takımını ekle:

   ```js
     else if (y >= PAD_Y && y < PAD_Y + PAD_H && x >= 0 && x < 9 * SIZE) {
       const button = Math.floor(x / PAD_W)
       enter(button === 9 ? 0 : button + 1) // the last button erases
     }
   ```

   Burada `x` zaten `LEFT` çıkarılmış hâli; yani `0` tuş takımının sol kenarı.

6. `draw()` fonksiyonunda çizgileri çizen `for` döngüsünden sonraki dört satırı (`ctx.fillStyle = '#0f172a'`'dan
   `ctx.fillText('Hints ' + ...)`'e kadar) sil ve yerine şunları yaz:

   ```js
     for (let i = 0; i < 10; i++) {
       const x = LEFT + i * PAD_W
       ctx.fillStyle = '#e0e7ff'
       ctx.fillRect(x + 2, PAD_Y, PAD_W - 4, PAD_H)
       ctx.fillStyle = '#3730a3'
       ctx.font = 'bold 22px sans-serif'
       ctx.textAlign = 'center'
       ctx.fillText(i === 9 ? '⌫' : String(i + 1), x + PAD_W / 2, PAD_Y + 30)
     }

     const seconds = Math.floor(frames / 60)
     const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
     ctx.fillStyle = '#0f172a'
     ctx.font = 'bold 18px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Time ' + clock(seconds), LEFT, 34)
     ctx.textAlign = 'right'
     ctx.fillText('Best ' + (best ? clock(best) : '-') + '  Hints ' + hints, canvas.width - LEFT, 34)
   ```

   `⌫` simgesini kopyalayıp yapıştırabilirsin. `'  Hints '`'in başında **iki** boşluk var.

7. `if (won) { ... }` bloğunda `'Solved!'` yazan satırı süreyi gösterecek şekilde değiştir:

   ```js
       ctx.fillText('Solved in ' + clock(seconds) + '!', canvas.width / 2, TOP + 4.5 * SIZE) // ← değişti
   ```

8. En alttaki `loop()` fonksiyonunun ilk satırı olarak saati ekle:

   ```js
   function loop() {
     if (!won) frames += 1 // ← yeni
     draw()
     requestAnimationFrame(loop)
   }
   ```

9. **Çalıştır**'a bas. Izgaranın altında 1–9 ve `⌫` düğmeleri, üstte `Time 0:00` ve `Best -  Hints 0` görmelisin;
   saat saniye saniye ilerlemeli. Boş bir hücre seçip bir rakam düğmesine tıkla, rakam yazılmalı. Alttaki
   kontrollerin hepsi yeşil olmalı. `Best -  Hints 0` testi kırmızıysa aradaki iki boşluğu kontrol et.

# --tests--

The number buttons should type digits into the selected cell, and the last one should erase.
tr: Rakam düğmeleri seçili hücreye rakam yazmalı, sonuncusu silmeli.

```js
$.click(38 + 48 * 4, 80 + 48 * 4)
let empty
for (let i = 0; i < 81 && !empty; i++) if (!given[Math.floor(i / 9)][i % 9]) empty = { r: Math.floor(i / 9), c: i % 9 }
$.click(38 + 48 * empty.c, 80 + 48 * empty.r)
const d = solution[empty.r][empty.c]
$.click(14 + (d - 1) * PAD_W + PAD_W / 2, PAD_Y + PAD_H / 2)
assert.strictEqual(grid[empty.r][empty.c], d, 'a number button types its digit')
$.click(14 + 9 * PAD_W + PAD_W / 2, PAD_Y + PAD_H / 2)
assert.strictEqual(grid[empty.r][empty.c], 0, 'the last button erases')
$.tick(1)
const labels = $.texts()
for (const label of ['1', '5', '9', '⌫']) assert.include(labels, label)
```

The clock should count up in minutes and seconds.
tr: Saat dakika ve saniye olarak ilerlemeli.

```js
$.tick(1)
assert.include($.texts(), 'Time 0:00')
assert.include($.texts(), 'Best - Hints 0')
$.tick(125)
assert.include($.texts(), 'Time 0:02')
```

Solving without hints should save the best time and stop the clock; a game with hints should not count.
tr: İpucusuz çözmek en iyi süreyi kaydetmeli ve saati durdurmalı; ipuçlu bir oyun sayılmamalı.

```js
$.tick(60 * 75)
for (let i = 0; i < 81; i++) {
  const r = Math.floor(i / 9)
  const c = i % 9
  if (given[r][c]) continue
  $.click(38 + 48 * c, 80 + 48 * r)
  $.press(String(solution[r][c]))
}
assert.isTrue(won)
assert.strictEqual(best, 75)
assert.strictEqual(localStorage.getItem('sudoku-best'), '75')
$.tick(1)
assert.include($.texts(), 'Solved in 1:15!')
$.tick(120)
assert.include($.texts(), 'Time 1:15', 'the clock stops')
$.click(200, 300)
$.press('h')
for (let i = 0; i < 60; i++) $.press('h')
assert.isTrue(won)
assert.strictEqual(best, 75, 'a game with hints does not count')
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
const PAD_Y = TOP + 9 * SIZE + 16 // the row of number buttons for touch screens
const PAD_W = (9 * SIZE) / 10
const PAD_H = 44
const HOLES = 50 // how many cells are emptied

let grid // grid[r][c]: 1 to 9, or 0 for an empty cell
let given // given[r][c]: true for the puzzle's own digits, which cannot be changed
let solution
let selected
let frames
let won
let hints
let best = Number(localStorage.getItem('sudoku-best')) || 0

// Can digit d go at (r, c)? Not if it is already in the row, the column or the 3 by 3 box.
function canPlace(board, r, c, d) {
  const br = r - (r % 3)
  const bc = c - (c % 3)
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === d || board[i][c] === d) return false
    if (board[br + Math.floor(i / 3)][bc + (i % 3)] === d) return false
  }
  return true
}

// The empty cell with the fewest digits that fit, and those digits.
function bestCell(board) {
  let found = null
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) continue
      const options = []
      for (let d = 1; d <= 9; d++) if (canPlace(board, r, c, d)) options.push(d)
      if (!found || options.length < found.options.length) found = { r, c, options }
    }
  }
  return found
}

// Backtracking: fill a cell with each digit that fits and try to solve the rest; undo when stuck.
// Counts solutions up to `limit`; `order` shuffles the digits to make random grids.
function countSolutions(board, limit = 2, order = false) {
  const cell = bestCell(board)
  if (!cell) return 1 // no empty cell left: solved
  const { r, c, options } = cell
  if (order) shuffle(options)
  let count = 0
  for (const d of options) {
    board[r][c] = d
    count += countSolutions(board, limit - count, order)
    if (count >= limit) return count // keep the board as it is: that is the solution
    board[r][c] = 0
  }
  return count
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

const copy = (board) => board.map((row) => row.slice())

// A random full grid, then empty cells one by one, keeping only removals that leave exactly one solution.
function makePuzzle() {
  const full = Array.from({ length: 9 }, () => Array(9).fill(0))
  countSolutions(full, 1, true)
  const puzzle = copy(full)
  let removed = 0
  for (const cell of shuffle([...Array(81).keys()])) {
    if (removed === HOLES) break
    const r = Math.floor(cell / 9)
    const c = cell % 9
    const digit = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSolutions(copy(puzzle), 2) === 1) removed++
    else puzzle[r][c] = digit // two solutions: put it back
  }
  return { puzzle, full }
}

function reset() {
  const { puzzle, full } = makePuzzle()
  grid = puzzle
  solution = full
  given = grid.map((row) => row.map((d) => d !== 0))
  selected = { r: 4, c: 4 }
  frames = 0
  won = false
  hints = 0
}

// Does the digit at (r, c) clash with another cell in its row, column or box?
function conflict(r, c) {
  const d = grid[r][c]
  if (d === 0) return false
  grid[r][c] = 0
  const ok = canPlace(grid, r, c, d)
  grid[r][c] = d
  return !ok
}

function checkWin() {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (grid[r][c] === 0 || conflict(r, c)) return
  won = true
  const seconds = Math.floor(frames / 60)
  if (hints === 0 && (best === 0 || seconds < best)) {
    best = seconds
    localStorage.setItem('sudoku-best', best)
  }
}

function enter(d) {
  if (won || given[selected.r][selected.c]) return
  grid[selected.r][selected.c] = d
  checkWin()
}

// A hint fills the selected cell (or the first empty one) from the solution.
function hint() {
  if (won) return
  let cell = grid[selected.r][selected.c] === solution[selected.r][selected.c] ? null : selected
  for (let i = 0; i < 81 && !cell; i++) {
    const r = Math.floor(i / 9)
    const c = i % 9
    if (grid[r][c] !== solution[r][c]) cell = { r, c }
  }
  if (!cell) return
  selected = cell
  grid[cell.r][cell.c] = solution[cell.r][cell.c]
  hints += 1
  checkWin()
}

document.addEventListener('keydown', (event) => {
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  if (moves[event.key]) {
    event.preventDefault()
    const [dr, dc] = moves[event.key]
    selected = { r: (selected.r + dr + 9) % 9, c: (selected.c + dc + 9) % 9 }
  } else if (event.key >= '1' && event.key <= '9') enter(Number(event.key))
  else if (event.key === '0' || event.key === 'Backspace' || event.key === 'Delete') enter(0)
  else if (event.key === 'h' || event.key === 'H') hint()
  else if (event.key === 'n' || event.key === 'N') reset()
})

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height
  if (won) {
    reset()
    return
  }
  const r = Math.floor((y - TOP) / SIZE)
  const c = Math.floor(x / SIZE)
  if (r >= 0 && r < 9 && c >= 0 && c < 9) selected = { r, c }
  else if (y >= PAD_Y && y < PAD_Y + PAD_H && x >= 0 && x < 9 * SIZE) {
    const button = Math.floor(x / PAD_W)
    enter(button === 9 ? 0 : button + 1) // the last button erases
  }
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
      if (conflict(r, c)) fill = '#fecaca'
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

  for (let i = 0; i < 10; i++) {
    const x = LEFT + i * PAD_W
    ctx.fillStyle = '#e0e7ff'
    ctx.fillRect(x + 2, PAD_Y, PAD_W - 4, PAD_H)
    ctx.fillStyle = '#3730a3'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(i === 9 ? '⌫' : String(i + 1), x + PAD_W / 2, PAD_Y + 30)
  }

  const seconds = Math.floor(frames / 60)
  const clock = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Time ' + clock(seconds), LEFT, 34)
  ctx.textAlign = 'right'
  ctx.fillText('Best ' + (best ? clock(best) : '-') + '  Hints ' + hints, canvas.width - LEFT, 34)
  if (won) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'
    ctx.fillRect(0, TOP + 3 * SIZE, canvas.width, 3 * SIZE)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Solved in ' + clock(seconds) + '!', canvas.width / 2, TOP + 4.5 * SIZE)
    ctx.font = '18px sans-serif'
    ctx.fillText('Click for a new puzzle', canvas.width / 2, TOP + 5.3 * SIZE)
  }
}

function loop() {
  if (!won) frames += 1
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
