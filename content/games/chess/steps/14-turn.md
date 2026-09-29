---
title: Whose turn is it?
title_tr: Sıra kimde?
skills: [game.state, game.input]
---

# --goal--

Only the side to move may pick up a piece. `turn` is `'w'` or `'b'`; a click on one of your own pieces selects it,
any other click clears the selection.

# --goal-tr--

Şu an boş karelere ve rakip taşlara da tıklanabiliyor. Satrançta ise yalnız **sırası gelen** taraf, yalnız **kendi
taşını** alabilir. Sırayı `turn` değişkeninde tutacağız: `'w'` (beyaz) ya da `'b'` (siyah). Satrançta hep beyaz başlar.

Kendi taşına tıklarsan seçilir; başka bir yere tıklarsan seçim **kalkar**.

# --code--

```js
let turn // 'w' or 'b'

  turn = 'w'

function clickSquare(r, c) {
  if (board[r][c][0] === turn) {
    selected = [r, c]
  } else {
    selected = null
  }
}
```

# --meaning--

- `turn` starts as `'w'` in `reset`: white moves first.
- `board[r][c][0]` is the color of the piece on the square (or `undefined` if it is empty).
- `else` runs when the `if` condition is false.

# --meaning-tr--

- `let turn` → sıra kimde: `'w'` ya da `'b'`. `reset` onu `'w'` yapar.
- `board[r][c][0] === turn` → tıklanan karedeki taşın rengi, sırası gelen renk mi? Boş karede `[0]` `undefined`
  olduğu için eşit çıkmaz.
- `selected = [r, c]` → evetse kareyi seç.
- `} else {` → **değilse**: `selected = null`, seçimi kaldır.

# --task--

1. Under `let board ...` write `let turn ...`; in `reset`, under the `board = ...` line write `turn = 'w'`.
2. Change the body of `clickSquare` as shown.

# --task-tr--

1. `let board ...` satırının **altına** `let turn ...` satırını yaz.
2. `reset` içinde `board = ...` satırının **altına** (`selected = null`'ın üstüne) `turn = 'w'` yaz.
3. `clickSquare` fonksiyonunun içindeki tek satırı sil; yerine `if ... else` bloğunu yaz.
4. **Çalıştır**: beyaz bir taşa tıklayınca sararmalı; siyah bir taşa ya da boş kareye tıklayınca sarılık kaybolmalı.

# --tests--

`turn` should start as `'w'`.
tr: `turn` başlangıçta `'w'` olmalı.

```js
assert.strictEqual(turn, 'w')
```

Only a piece of the side to move can be selected.
tr: Yalnız sırası gelen tarafın taşı seçilebilmeli.

```js
$.click(100, 476) // a white knight
assert.deepEqual(selected, [7, 1])
$.click(100, 140) // a black pawn
assert.isNull(selected)
turn = 'b'
$.click(100, 140)
assert.deepEqual(selected, [1, 1])
```

Clicking an empty square should clear the selection.
tr: Boş bir kareye tıklamak seçimi kaldırmalı.

```js
$.click(100, 476)
$.click(240, 260) // an empty square in the middle
assert.isNull(selected)
```

# --solution--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SQ = 56 // one square
const LEFT = 16
const TOP = 56 // room for the messages
const GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }
// Row 0 is black's back rank at the top, row 7 white's at the bottom. Capitals are white.
const START = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR']
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
const KING = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'
let turn // 'w' or 'b'
let selected // the square of the piece you picked up, or null

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  selected = null
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

// Every move that follows the pieces' patterns, without checking whether it leaves the king in check.
function pseudoMoves(color) {
  const moves = []
  const add = (r, c, tr, tc) => moves.push({ from: [r, c], to: [tr, tc] })
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece[0] !== color) continue
      const kind = piece[1]
      if (kind === 'N' || kind === 'K') {
        for (const [dr, dc] of kind === 'N' ? KNIGHT : KING) {
          const tr = r + dr
          const tc = c + dc
          if (inside(tr, tc) && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
      }
    }
  }
  return moves
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
  if (board[r][c][0] === turn) {
    selected = [r, c]
  } else {
    selected = null
  }
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SQ)
  const c = Math.floor(x / SQ)
  if (inside(r, c)) clickSquare(r, c)
})

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
      if (same(selected, [r, c])) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.45)'
        ctx.fillRect(x, y, SQ, SQ)
      }
      const piece = board[r][c]
      if (piece) {
        ctx.font = '44px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        // White pieces get a dark outline, drawn first so the white fill goes on top of it.
        if (piece[0] === 'w') {
          ctx.strokeStyle = '#0f172a'
          ctx.lineWidth = 3
          ctx.strokeText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
        }
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
        ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
      }
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
