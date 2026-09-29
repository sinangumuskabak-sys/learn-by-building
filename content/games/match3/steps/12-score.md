---
title: A score and a fresh start
title_tr: Skor ve yeni başlangıç
skills: [game.state, prog.functions]
---

# --goal--

Matches will score points. `reset()` sets up everything a game starts with (a new board, nothing selected, a score
of 0) and runs once when the page loads. The score is written at the top left.

# --goal-tr--

Eşleşmeler birazdan puan getirecek; bir `score` (skor) değişkeni lazım. Bir oyunun başlangıcında olan her şeyi tek bir
fonksiyonda topluyoruz: `reset()` (sıfırla). Yeni tahta, seçim yok, skor 0. Sayfa açılınca bir kez çağrılıyor;
ileride oyun bitince de çağrılacak.

Skoru da sol üstteki boş şeride yazıyoruz.

# --code--

```js
let score

function reset() {
  newBoard()
  selected = null
  score = 0
}

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)

reset()
requestAnimationFrame(loop)
```

# --meaning--

- `reset` makes a new board and sets `selected` and `score` to their starting values. It replaces the `newBoard()`
  call at the bottom.
- `font` sets the text size and style, `textAlign = 'left'` starts the text at the given x, and `fillText` writes it.
  `'Score ' + score` joins the word and the number.

# --meaning-tr--

- `let score` → skor. Değerini `reset` verir.
- `function reset() {` → yeni oyun: yeni tahta, `selected = null` (hiçbir şey seçili değil), `score = 0`. Dikkat:
  içeride `let` yok; değişkenler yukarıda tanımlı, burada yalnız değer veriyoruz.
- En alttaki `newBoard()` yerine `reset()`.
- `ctx.font = 'bold 18px sans-serif'` → kalın, 18 piksel yazı. `ctx.textAlign = 'left'` → yazı verilen `x`'ten
  sağa doğru.
- `ctx.fillText('Score ' + score, LEFT, 30)` → `+` bir yazıyla bir sayıyı yan yana ekler: `'Score 0'`. Izgaranın sol
  kenarı hizasında, yukarıdan 30 pikselde.

# --task--

1. Under `let selected` write `let score`.
2. Above the `// Every cell that is part...` comment write `reset`.
3. At the bottom, replace `newBoard()` with `reset()`.
4. In `draw`, at the end, leave an empty line and write the four text lines.

# --task-tr--

1. `let selected` satırının altına `let score` yaz.
2. `// Every cell that is part...` yorum satırının **üstüne** `reset` fonksiyonunu yaz; altında bir boş satır kalsın.
3. En alttaki `newBoard()` satırını `reset()` yap.
4. `draw` içinde **en sona** (çerçeve bloğunun altına) bir boş satır bırakıp dört yazı satırını yaz.
5. **Çalıştır**: sol üstte `Score 0` görmelisin.

# --hint--

Inside `reset` write `score = 0`, not `let score = 0`: a `let` there would make a new variable that lives only inside `reset`.

# --hint-tr--

`reset` içinde `let score = 0` değil `score = 0` yaz: oradaki bir `let`, yalnız `reset`'in içinde yaşayan yeni bir değişken yaratır.

# --tests--

`reset()` should start a fresh game.
tr: `reset()` yepyeni bir oyun başlatmalı.

```js
assert.strictEqual(score, 0)
score = 90
selected = { r: 1, c: 1 }
const old = board
reset()
assert.strictEqual(score, 0)
assert.isNull(selected)
assert.notStrictEqual(board, old, 'a new board')
```

The score should be drawn.
tr: Puan çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Score 0')
score = 120
$.tick(1)
assert.include($.texts(), 'Score 120')
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
let score

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
  score = 0
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, LEFT, 30)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
