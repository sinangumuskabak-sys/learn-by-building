---
title: The round ends
title_tr: Tur biter
skills: [game.state]
---

# --goal--

The rules exist, but the game ignores them: you can keep playing after a win. We keep the round's result in
`result`, update it after every move, and refuse moves once it is set.

# --goal-tr--

Kurallar hazır ama oyun onları dinlemiyor: biri kazandıktan sonra da oynamaya devam edebiliyorsun.

Turun sonucunu da bir durum bilgisi olarak tutacağız: `result`. Her hamleden sonra `outcome` ile güncellenecek; bir
kez belli olunca yeni hamle kabul edilmeyecek. Maç bitti düdüğü gibi.

# --code--

```js
let result = null // null while playing, then 'X', 'O' or 'draw'

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  return true
}
```

# --meaning--

- `result` starts as `null`: the round is still going.
- `result || ...` means "or": if the round is over, **or** the cell is taken, no move.
- After each move, `result = outcome(board)` records a win or a draw.

# --meaning-tr--

- `let result = null` → oynarken `null`, tur bitince `'X'`, `'O'` ya da `'draw'`.
- `if (result || board[index] !== '')` → `||` "**veya**" demek: "sonuç belliyse **veya** kutu doluysa, hamle yok".
  `null` yanlış, `'X'` gibi bir yazı doğru sayılır.
- `result = outcome(board)` → her hamleden sonra tahtaya bak: biri kazandı mı, tahta doldu mu?

# --task--

1. Under `let player = 'X'`, write the `result` line.
2. In `play`, add `result ||` to the `if`, and write `result = outcome(board)` under the line that switches `player`.

# --task-tr--

1. `let player = 'X'` satırının altına `result` satırını yaz.
2. `play` içindeki `if` satırında parantezin başına `result || ` ekle.
3. Sırayı değiştiren `player = ...` satırının altına `result = outcome(board)` yaz.
4. **Çalıştır** ve oyna: üçü yan yana gelince artık hiçbir kutuya oynayamamalısın. (Kazananı ekranda bir sonraki
   adımda göstereceğiz.)

# --tests--

A winning move should set `result`.
tr: Kazandıran hamle `result`'ı belirlemeli.

```js
for (const index of [0, 3, 1, 4]) play(index)
assert.isNull(result)
play(2)
assert.strictEqual(result, 'X')
```

No more moves should be accepted after the round ends.
tr: Tur bittikten sonra hamle kabul edilmemeli.

```js
for (const index of [0, 3, 1, 4, 2]) play(index)
assert.isFalse(play(8))
assert.strictEqual(board[8], '')
```

A full board with no winner should be a draw.
tr: Kazananı olmayan dolu bir tahta berabere olmalı.

```js
for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) play(index)
assert.strictEqual(result, 'draw')
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
let result = null // null while playing, then 'X', 'O' or 'draw'

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
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
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
