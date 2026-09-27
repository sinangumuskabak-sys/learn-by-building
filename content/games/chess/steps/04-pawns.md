---
title: Pawns
title_tr: Piyonlar
skills: [prog.arrays]
---

# --explanation--

Pawns are the most complicated simple piece. They are the only piece that:

- moves only **forwards**, which is up the board for white and down for black (a `dir` of `-1` or `1`),
- moves and captures **differently**: straight ahead onto an empty square, but diagonally forward to capture,
- may move **two squares** from its starting row, if both squares are empty,
- becomes a queen (**promotes**) when it reaches the far side.

Writing the direction as a variable means the same code handles both colors: `r + dir` is "one step forward" whichever side
is moving.

With pawns added the starting position has exactly **20** moves for white: 16 pawn moves and 4 knight moves. That number is a
classic check that a move generator is right.

# --explanation-tr--

Piyonlar en karmaşık basit taştır. Şunları yapan tek taştır:

- yalnızca **ileri** gider; bu beyaz için tahtada yukarı, siyah için aşağıdır (`-1` ya da `1` olan bir `dir`),
- **farklı** gider ve alır: boş bir kareye dümdüz ileri, ama almak için çapraz ileri,
- başlangıç satırından, iki kare de boşsa **iki kare** gidebilir,
- öbür uca ulaşınca vezire dönüşür (**terfi eder**).

Yönü bir değişken olarak yazmak, aynı kodun iki rengi de işlemesi demektir: hangi taraf oynarsa oynasın `r + dir` "bir adım
ileri"dir.

Piyonlar eklenince başlangıç konumunda beyazın tam **20** hamlesi olur: 16 piyon hamlesi ve 4 at hamlesi. Bu sayı bir hamle
üretecinin doğru olduğunun bilinen bir kontrolüdür.

# --task--

1. In `pseudoMoves`, for each pawn: one step forward if that square is empty, and then two steps from the starting row
   (row 6 for white, 1 for black) if that square is empty too; a diagonal step forward onto an enemy piece.
2. A pawn move onto the last row (0 for white, 7 for black) gets `promo: 'Q'`, and `play()` puts a queen there instead of the
   pawn.

# --task-tr--

1. `pseudoMoves` içinde her piyon için: o kare boşsa bir adım ileri, sonra o kare de boşsa başlangıç satırından (beyaz için 6,
   siyah için 1) iki adım; bir rakip taşın üstüne çapraz bir adım ileri.
2. Son satıra (beyaz için 0, siyah için 7) giden bir piyon hamlesi `promo: 'Q'` alır ve `play()` oraya piyon yerine bir vezir
   koyar.

# --tests--

White should have 20 moves at the start.
tr: Beyazın başta 20 hamlesi olmalı.

```js
assert.lengthOf(pseudoMoves('w'), 20)
assert.lengthOf(pseudoMoves('b'), 20)
const e2 = pseudoMoves('w').filter((m) => m.from.join() === '6,4').map((m) => m.to.join())
assert.sameMembers(e2, ['5,4', '4,4'])
```

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
board[5][1] = 'bP'
assert.sameMembers(pseudoMoves('b').filter((m) => m.from.join() === '5,1').map((m) => m.to.join()), ['6,1'], 'black pawns go down')
```

A pawn reaching the far side should become a queen.
tr: Öbür uca ulaşan bir piyon vezir olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[1][0] = 'wP'
const m = pseudoMoves('w')[0]
assert.deepEqual(m, { from: [1, 0], to: [0, 0], promo: 'Q' })
play(m)
assert.strictEqual(board[0][0], 'wQ')
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

// Every move that follows the pieces' patterns. (Check comes later: for now even a king can be taken.)
function pseudoMoves(color) {
  const moves = []
  const add = (r, c, tr, tc, extra = {}) => moves.push({ from: [r, c], to: [tr, tc], ...extra })
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
        const last = color === 'w' ? 0 : 7
        const promote = (tr) => (tr === last ? { promo: 'Q' } : {})
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c, promote(r + dir))
          const start = color === 'w' ? 6 : 1
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc, promote(tr))
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
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
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
