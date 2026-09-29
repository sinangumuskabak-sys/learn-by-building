---
title: A score for a position
title_tr: Pozisyona bir puan
skills: [prog.functions, game.state]
---

# --goal--

Now the computer will play black. First it needs to judge a position with a number: count **material** (pawn 100,
knight 320, bishop 330, rook 500, queen 900) and add a little for pieces near the middle, where they control more
squares. White's pieces count plus, black's minus.

# --goal-tr--

Şimdi siyahı **bilgisayar** oynayacak. Bir bilgisayarın iyi hamle seçebilmesi için önce bir pozisyonun ne kadar iyi
olduğunu **bir sayıyla** söyleyebilmesi gerek. Buna **değerlendirme** denir.

Basit ama işe yarayan bir tarif:

- **Malzeme**: her taşın bir değeri var. Piyon 100, at 320, fil 330, kale 500, vezir 900. (Şahın değeri 0; zaten hiç
  yenmez.)
- **Merkez**: tahtanın ortasındaki taşlar daha çok kareyi kontrol eder; ortaya yakınlığa küçük bir bonus.
- Beyazın taşları **artı**, siyahınkiler **eksi** sayılır. Toplam artıysa beyaz iyi durumda, eksiyse siyah.

# --code--

```js
const VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 }

// Material, plus a little for pieces near the middle, from white's side: positive is good for white.
function evaluate() {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue
      const center = piece[1] === 'K' ? 0 : 6 - Math.abs(3.5 - r) - Math.abs(3.5 - c)
      score += (VALUES[piece[1]] + center * 4) * (piece[0] === 'w' ? 1 : -1)
    }
  }
  return score
}
```

# --meaning--

- `Math.abs` is the distance from zero: `Math.abs(-2)` is 2. `|3.5 - r| + |3.5 - c|` is how far the square is from the
  center (1 for the four middle squares, 7 for a corner), so `center` goes from 5 down to -1.
- Each piece adds its value plus `center * 4`, times `1` for white or `-1` for black.

# --meaning-tr--

- `const VALUES = { ... }` → taş türlerinin değerleri.
- `if (!piece) continue` → boş kareyi atla.
- `Math.abs(x)` → **mutlak değer**: sayının sıfıra uzaklığı, hep artı. `Math.abs(-2)` → 2.
- `Math.abs(3.5 - r) + Math.abs(3.5 - c)` → karenin tahtanın **tam ortasına** (3.5, 3.5) uzaklığı: ortadaki dört kare
  için 1, köşeler için 7.
- `6 - ...` → yakınlık: ortada 5, köşede -1. Şah için 0: şahı ortaya sürmek iyi değil.
- `(VALUES[piece[1]] + center * 4)` → taşın değeri + yakınlık × 4.
- `* (piece[0] === 'w' ? 1 : -1)` → beyazsa artı, siyahsa eksi olarak toplama ekle.
- Başlangıçta her şey simetrik: sonuç **0**.

# --task--

1. Under `DIAGONAL` write `VALUES`.
2. Above `const same = ...` write the comment and `evaluate`, with an empty line after it.

# --task-tr--

1. `const DIAGONAL = ...` satırının **altına** `VALUES` satırını yaz.
2. `const same = ...` satırının **üstüne** yorumu ve `evaluate` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**. Ekranda değişiklik yok.

# --predict--

Black loses its queen from d8 (row 0, column 3). What does `evaluate()` give?
- [ ] -900
- [x] A little more than +900
  Black's pieces count as minus, so losing one makes the total go up; the queen's small center bonus goes with it.
- [ ] 0

# --predict-tr--

Siyah, d8'deki (sıra 0, sütun 3) vezirini kaybediyor. `evaluate()` ne verir?
- [ ] -900
- [x] +900'den biraz fazla
  Siyahın taşları eksi sayılıyor; biri gidince toplam artar. Vezirin küçük merkez bonusu da onunla gider.
- [ ] 0

# --tests--

The start should score 0, and losing the black queen should give white about 900.
tr: Başlangıç 0 puan olmalı; siyah vezirin gitmesi beyaza yaklaşık 900 vermeli.

```js
assert.strictEqual(evaluate(), 0, 'the start is equal')
board[0][3] = ''
assert.strictEqual(evaluate(), 900 + 4 * 2, 'black lost its queen')
```

A piece in the middle should be worth more than in a corner.
tr: Ortadaki bir taş köşedekinden değerli olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[3][3] = 'wN'
const middle = evaluate()
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[0][0] = 'wN'
assert.strictEqual(middle, 320 + 5 * 4)
assert.strictEqual(evaluate(), 320 - 4)
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
const VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 }

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'
let turn // 'w' or 'b'
let castling // which castlings are still allowed
let enPassant // the square a pawn could capture onto en passant right now, or null
let selected // the square of the piece you picked up, or null
let targets // the moves of the selected piece
let lastMove
let state // 'playing', 'checkmate' or 'stalemate'

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  castling = { wK: true, wQ: true, bK: true, bQ: true }
  enPassant = null
  selected = null
  targets = []
  lastMove = null
  state = 'playing'
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
const other = (color) => (color === 'w' ? 'b' : 'w')

// Every move that follows the pieces' patterns, without checking whether it leaves the king in check.
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
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c, { double: true })
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc, promote(tr))
          if (enPassant && enPassant[0] === tr && enPassant[1] === tc) add(r, c, tr, tc, { ep: true })
        }
      }
      // Castling: the king still on its first square, the squares between free and the rook in its corner.
      if (kind === 'K' && c === 4 && r === (color === 'w' ? 7 : 0)) {
        const rook = color + 'R'
        if (castling[color + 'K'] && !board[r][5] && !board[r][6] && board[r][7] === rook) add(r, c, r, 6, { castle: 'K' })
        if (castling[color + 'Q'] && !board[r][1] && !board[r][2] && !board[r][3] && board[r][0] === rook) add(r, c, r, 2, { castle: 'Q' })
      }
    }
  }
  return moves
}

// Is the square (r, c) attacked by a piece of color `by`? Look outwards from the square for each kind of attacker.
function attacked(r, c, by) {
  const pawnRow = r + (by === 'w' ? 1 : -1) // a white pawn attacks upwards, so it stands one row below
  for (const dc of [-1, 1]) {
    if (inside(pawnRow, c + dc) && board[pawnRow][c + dc] === by + 'P') return true
  }
  for (const [list, kind] of [[KNIGHT, 'N'], [KING, 'K']]) {
    for (const [dr, dc] of list) {
      if (inside(r + dr, c + dc) && board[r + dr][c + dc] === by + kind) return true
    }
  }
  for (const [dirs, kind] of [[STRAIGHT, 'R'], [DIAGONAL, 'B']]) {
    for (const [dr, dc] of dirs) {
      let tr = r + dr
      let tc = c + dc
      while (inside(tr, tc)) {
        const piece = board[tr][tc]
        if (piece) {
          if (piece === by + kind || piece === by + 'Q') return true
          break
        }
        tr += dr
        tc += dc
      }
    }
  }
  return false
}

function findKing(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) if (board[r][c] === color + 'K') return [r, c]
  }
}

function inCheck(color) {
  const [r, c] = findKing(color)
  return attacked(r, c, other(color))
}

// Play a move on the board, and return what is needed to take it back.
function makeMove(m) {
  const [fr, fc] = m.from
  const [tr, tc] = m.to
  const piece = board[fr][fc]
  const undo = { m, piece, captured: board[tr][tc], castling: { ...castling }, enPassant, taken: '' }
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
  board[fr][fc] = ''
  if (m.ep) {
    // The pawn taken en passant stands beside the moving pawn, not on the square it moves to.
    undo.taken = board[fr][tc]
    board[fr][tc] = ''
  }
  if (m.castle === 'K') [board[fr][5], board[fr][7]] = [board[fr][7], '']
  if (m.castle === 'Q') [board[fr][3], board[fr][0]] = [board[fr][0], '']
  enPassant = m.double ? [(fr + tr) / 2, fc] : null
  // Moving the king or a rook, or capturing a rook on its first square, ends castling on that side for good.
  if (piece[1] === 'K') castling[piece[0] + 'K'] = castling[piece[0] + 'Q'] = false
  for (const [row, col, side] of [[7, 7, 'wK'], [7, 0, 'wQ'], [0, 7, 'bK'], [0, 0, 'bQ']]) {
    if ((fr === row && fc === col) || (tr === row && tc === col)) castling[side] = false
  }
  turn = other(turn)
  return undo
}

function undoMove(undo) {
  const [fr, fc] = undo.m.from
  const [tr, tc] = undo.m.to
  board[fr][fc] = undo.piece
  board[tr][tc] = undo.captured
  if (undo.m.ep) board[fr][tc] = undo.taken
  if (undo.m.castle === 'K') [board[fr][7], board[fr][5]] = [board[fr][5], '']
  if (undo.m.castle === 'Q') [board[fr][0], board[fr][3]] = [board[fr][3], '']
  castling = undo.castling
  enPassant = undo.enPassant
  turn = other(turn)
}

// The moves the side to play can really make: try each one, and keep it if its own king is not left in check.
function legalMoves() {
  const color = turn
  return pseudoMoves(color).filter((m) => {
    if (m.castle) {
      const row = m.from[0]
      // No castling out of check or across an attacked square.
      if (attacked(row, 4, other(color)) || attacked(row, m.castle === 'K' ? 5 : 3, other(color))) return false
    }
    const undo = makeMove(m)
    const safe = !inCheck(color)
    undoMove(undo)
    return safe
  })
}

function play(m) {
  makeMove(m)
  lastMove = m
  selected = null
  targets = []
  if (legalMoves().length === 0) state = inCheck(turn) ? 'checkmate' : 'stalemate'
}

// Material, plus a little for pieces near the middle, from white's side: positive is good for white.
function evaluate() {
  let score = 0
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (!piece) continue
      const center = piece[1] === 'K' ? 0 : 6 - Math.abs(3.5 - r) - Math.abs(3.5 - c)
      score += (VALUES[piece[1]] + center * 4) * (piece[0] === 'w' ? 1 : -1)
    }
  }
  return score
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
  if (state !== 'playing') return
  const move = targets.find((m) => same(m.to, [r, c]))
  if (move) {
    play(move)
    return
  }
  if (board[r][c][0] === turn) {
    selected = [r, c]
    targets = legalMoves().filter((m) => same(m.from, selected))
  } else {
    selected = null
    targets = []
  }
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') {
    reset()
    return
  }
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
      const highlight = same(selected, [r, c]) || (lastMove && (same(lastMove.from, [r, c]) || same(lastMove.to, [r, c])))
      if (highlight) {
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

  let message = turn === 'w' ? 'White to move' : 'Black to move'
  if (state === 'playing' && inCheck(turn)) message = 'Check! ' + message
  if (state === 'checkmate') message = 'Checkmate: ' + (turn === 'w' ? 'black' : 'white') + ' wins! Click to play again'
  if (state === 'stalemate') message = 'Stalemate: a draw. Click to play again'
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
