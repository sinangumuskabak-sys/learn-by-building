---
title: Win, draw or go on
title_tr: Kazanç, beraberlik ya da devam
skills: [prog.functions, prog.arrays]
---

# --goal--

`outcome(cells)` sums up a board in one word: `'X'` or `'O'` if someone has three in a row, `'draw'` if the board is
full, and `null` while the game goes on.

# --goal-tr--

Bir tahtaya bakınca üç şeyden biri doğrudur: biri **kazanmıştır**, tahta dolmuştur ve kimse kazanmamıştır
(**berabere**), ya da oyun **sürüyordur**.

`outcome` (sonuç) fonksiyonu bunu tek kelimeyle söyleyecek: `'X'`, `'O'`, `'draw'` (berabere) ya da `null` (henüz
bir şey yok).

# --code--

```js
function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}
```

# --meaning--

- If there is a winning line, the mark in its first cell is the winner.
- `cells.every(test)` is true when every cell passes: all filled means a draw.
- `null` means "nothing yet". Order matters: a win on the last move is checked before the draw.

# --meaning-tr--

- `const line = winningLine(cells)` → önceki adımın fonksiyonu: kazanan çizgi ya da `undefined`.
- `if (line) return cells[line[0]]` → "bir çizgi bulunduysa". `undefined` **yanlış**, bulunmuş bir dizi **doğru**
  sayılır. `line[0]` çizginin ilk kutu numarası; `cells[...]` o kutudaki işaret: `'X'` ya da `'O'`, yani kazanan.
- `cells.every((cell) => cell !== '')` → "**her** kutu boş değil mi?" Hepsi doluysa `'draw'`.
- `return null` → `null` "henüz yok" demenin değeri: oyun sürüyor.
- **Sıra önemli:** `return` fonksiyondan hemen çıkar. Kazanç önce sorulduğu için, son hamlede gelen kazanç
  beraberlik sayılmaz.

# --task--

Under `winningLine`, leave an empty line and write `outcome` (still above `function play`). Press **Run**.

# --task-tr--

1. `winningLine` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak.
2. `outcome` fonksiyonunu yaz; `function play`'in üstünde kalsın.
3. **Çalıştır**: oyun aynı çalışmalı, kontroller yeşil olmalı.

# --hint--

If a full board with a winner says `'draw'`, the `every` line is above the `if (line)` line. Swap them.

# --hint-tr--

Kazananı olan dolu bir tahta `'draw'` diyorsa, `every` satırı `if (line)` satırının üstünde kalmış. Yerlerini değiştir.

# --tests--

`outcome()` should report a winner.
tr: `outcome()` kazananı bildirmeli.

```js
assert.strictEqual(outcome(['X', 'X', 'X', 'O', 'O', '', '', '', '']), 'X')
assert.strictEqual(outcome(['O', 'X', 'X', 'X', 'O', '', '', '', 'O']), 'O')
```

`outcome()` should report a draw, or `null` while the game goes on.
tr: `outcome()` beraberliği ya da oyun sürerken `null` bildirmeli.

```js
assert.isNull(outcome(['X', '', '', '', 'O', '', '', '', '']))
assert.strictEqual(outcome(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']), 'draw')
```

A win on the last move is a win, not a draw.
tr: Son hamlede gelen kazanç beraberlik değil, kazançtır.

```js
assert.strictEqual(outcome(['X', 'O', 'O', 'X', 'O', 'X', 'X', 'X', 'O']), 'X')
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
]

let board = ['', '', '', '', '', '', '', '', '']
let player = 'X'

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
  play(index)
  draw()
})

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```
