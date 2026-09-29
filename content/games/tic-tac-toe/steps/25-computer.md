---
title: A computer that picks a cell
title_tr: Kutu seçen bir bilgisayar
skills: [prog.arrays, prog.functions]
---

# --goal--

Now the computer will play O. Its first version is simple: make a list of the free cells and pick one at random.

# --goal-tr--

Şimdi O'yu **bilgisayar** oynayacak. İlk sürümü çok basit: boş kutuların listesini çıkar, içinden **rastgele** birini
seç. Zar atmak gibi.

Bu adımda yalnız hamleyi seçen fonksiyonu yazıyoruz; tıklamaya bir sonraki adımda bağlayacağız.

# --code--

```js
function computerMove(cells) {
  const free = []
  cells.forEach((cell, index) => {
    if (cell === '') free.push(index)
  })
  const random = free[Math.floor(Math.random() * free.length)]
  return random
}
```

# --meaning--

- `free` starts as an empty array; `free.push(index)` adds each empty cell's number to its end.
- `Math.random()` is a random number from 0 up to (not including) 1. Times `free.length`, rounded down, it is a
  valid position in `free`.
- The function returns the chosen cell number.

# --meaning-tr--

- `const free = []` → `[]` **boş bir dizi**. Boş kutuların numaralarını buraya toplayacağız.
- `cells.forEach((cell, index) => { ... })` → 10. adımdaki gibi: her kutu için, içeriği `cell`, numarası `index`.
- `free.push(index)` → `push` bir elemanı dizinin **sonuna ekler**. Sonunda `free` örneğin `[1, 2, 3, 5]` olur.
- `Math.random()` → 0 ile 1 arasında (1 hariç) rastgele bir sayı: 0.73 gibi.
- `free.length` → dizideki eleman sayısı. `Math.random() * free.length` → 0 ile eleman sayısı arasında bir sayı;
  `Math.floor` ile aşağı yuvarlayınca geçerli bir **sıra numarası** çıkar: 0, 1, 2...
- `free[...]` → o sıradaki boş kutunun numarası. `return random` → seçimi geri ver.

# --task--

Under `outcome`, leave an empty line and write `computerMove` (above `function play`). Press **Run**.

# --task-tr--

1. `outcome` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak.
2. `computerMove` fonksiyonunu yaz; `function play`'in üstünde kalsın.
3. **Çalıştır**: oyun henüz değişmez; kontroller fonksiyonu deneyecek.

# --hint--

`free.push(index)` adds the cell's number, not its content: push `index`, not `cell`.

# --hint-tr--

`free.push(index)` kutunun **numarasını** ekler, içeriğini değil: `cell` değil `index` ekle.

# --tests--

`computerMove()` should return a free cell.
tr: `computerMove()` boş bir kutu dönmeli.

```js
for (let i = 0; i < 20; i++) {
  assert.include([1, 2, 3, 5, 6, 7], computerMove(['X', '', '', '', 'O', '', '', '', 'X']))
}
assert.strictEqual(computerMove(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', '']), 8)
```

The choice should be random, and the board should not change.
tr: Seçim rastgele olmalı, tahta değişmemeli.

```js
const cells = ['X', '', '', '', 'O', '', '', '', 'X']
const seen = new Set()
for (let i = 0; i < 40; i++) seen.add(computerMove(cells))
assert.isAbove(seen.size, 1)
assert.deepEqual(cells, ['X', '', '', '', 'O', '', '', '', 'X'])
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

let board
let player
let result // null while playing, then 'X', 'O' or 'draw'

function reset() {
  board = ['', '', '', '', '', '', '', '', '']
  player = 'X'
  result = null
}

function winningLine(cells) {
  return LINES.find(([a, b, c]) => cells[a] !== '' && cells[a] === cells[b] && cells[a] === cells[c])
}

function outcome(cells) {
  const line = winningLine(cells)
  if (line) return cells[line[0]]
  if (cells.every((cell) => cell !== '')) return 'draw'
  return null
}

function computerMove(cells) {
  const free = []
  cells.forEach((cell, index) => {
    if (cell === '') free.push(index)
  })
  const random = free[Math.floor(Math.random() * free.length)]
  return random
}

function play(index) {
  if (result || board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  result = outcome(board)
  return true
}

canvas.addEventListener('click', (event) => {
  if (result) {
    reset()
  } else {
    // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
    play(index)
  }
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

  if (result) {
    // Dim the board, then light up the winning line on top so it stands out.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const line = winningLine(board)
    if (line) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)'
      for (const index of line) ctx.fillRect((index % 3) * CELL, Math.floor(index / 3) * CELL, CELL, CELL)
    }
    ctx.fillStyle = 'white'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText(result === 'draw' ? "It's a draw" : result + ' wins!', canvas.width / 2, 140)
    ctx.font = '14px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 172)
  }
}

reset()
draw()
```
