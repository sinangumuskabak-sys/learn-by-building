---
title: Pawns capture diagonally
title_tr: Piyon çapraz yer
skills: [prog.arrays]
---

# --goal--

A pawn is the only piece that captures differently from how it moves: one square diagonally forward, and only onto
an enemy piece.

# --goal-tr--

Piyon, **yürüdüğünden farklı yiyen** tek taştır: düz yürür ama **çapraz ileri** yer. Çapraz kareye yalnız orada
**rakip taş** varsa gidebilir; boş çapraz kareye gidemez.

İleri çapraz iki kare var: bir sütun solda, bir sütun sağda. İkisini de küçük bir döngüyle deneyeceğiz.

# --code--

```js
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
```

# --meaning--

- `for (const dc of [-1, 1])` tries the column to the left and to the right.
- `if (!inside(tr, tc)) continue` skips a square off the edge (a pawn on the a- or h-file).
- The capture needs a piece there (`board[tr][tc]`) of the other color.

# --meaning-tr--

- `for (const dc of [-1, 1]) {` → iki değerli küçük bir liste: önce sol sütun (`-1`), sonra sağ (`1`).
- `const tr = r + dir` → bir sıra ileri; `tc = c + dc` → bir sütun yana.
- `if (!inside(tr, tc)) continue` → kenardaki piyonun bir yanı tahtanın dışında kalır; o kareyi atla.
- `board[tr][tc] && board[tr][tc][0] !== color` → karede taş **var ve** rakibin taşı: yeme hamlesi ekle.

# --task--

Inside the pawn block, under the closing `}` of the forward-move `if`, write the capture loop.

# --task-tr--

1. Piyon bloğunun içinde, ileri yürüme `if (!board[r + dir][c]) { ... }` bloğu kapandıktan **sonra** (piyon bloğunun
   son `}`'inden önce) çapraz yeme döngüsünü yaz.
2. **Çalıştır** ve dene: e4, sonra siyahla d5 oyna. e4 piyonuna tıklayınca d5'te de bir nokta olmalı.

# --tests--

Pawns should be blocked straight ahead but capture diagonally.
tr: Piyonlar dümdüz önde engellenmeli ama çapraz almalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][4] = 'wP'
board[3][4] = 'bP' // right in front
board[3][3] = 'bN' // diagonal
board[3][5] = 'wN' // diagonal, but white
const to = pseudoMoves('w').filter((m) => m.from.join() === '4,4').map((m) => m.to.join())
assert.deepEqual(to, ['3,3'])
```

A pawn on the edge should still capture on its one diagonal.
tr: Kenardaki bir piyon tek çaprazında yine yiyebilmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[1][7] = 'bP'
board[2][6] = 'wN'
board[2][7] = 'wP'
const to = pseudoMoves('b').map((m) => m.to.join())
assert.deepEqual(to, ['2,6'])
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
const STRAIGHT = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'
let turn // 'w' or 'b'
let selected // the square of the piece you picked up, or null
let targets // the moves of the selected piece

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  selected = null
  targets = []
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
const other = (color) => (color === 'w' ? 'b' : 'w')

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
      if (kind === 'R' || kind === 'B' || kind === 'Q') {
        const dirs = kind === 'R' ? STRAIGHT : kind === 'B' ? DIAGONAL : [...STRAIGHT, ...DIAGONAL]
        for (const [dr, dc] of dirs) {
          let tr = r + dr
          let tc = c + dc
          while (inside(tr, tc)) {
            if (board[tr][tc]) {
              if (board[tr][tc][0] !== color) add(r, c, tr, tc)
              break
            }
            add(r, c, tr, tc)
            tr += dr
            tc += dc
          }
        }
      }
      if (kind === 'P') {
        const dir = color === 'w' ? -1 : 1
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c)
          const start = color === 'w' ? 6 : 1
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc)
        }
      }
    }
  }
  return moves
}

function play(m) {
  const [fr, fc] = m.from
  const [tr, tc] = m.to
  const piece = board[fr][fc]
  board[tr][tc] = piece
  board[fr][fc] = ''
  turn = other(turn)
  selected = null
  targets = []
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
  const move = targets.find((m) => same(m.to, [r, c]))
  if (move) {
    play(move)
    return
  }
  if (board[r][c][0] === turn) {
    selected = [r, c]
    targets = pseudoMoves(turn).filter((m) => same(m.from, selected))
  } else {
    selected = null
    targets = []
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
  // A dot on every square the selected piece can move to.
  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'
  for (const m of targets) {
    ctx.beginPath()
    ctx.arc(LEFT + m.to[1] * SQ + SQ / 2, TOP + m.to[0] * SQ + SQ / 2, 9, 0, Math.PI * 2)
    ctx.fill()
  }

  const message = turn === 'w' ? 'White to move' : 'Black to move'
  ctx.fillStyle = 'white'
  ctx.font = 'bold 17px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(message, canvas.width / 2, 34)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
