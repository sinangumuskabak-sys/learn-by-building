---
title: Check, checkmate and stalemate
title_tr: Şah, mat ve pat
skills: [game.state]
---

# --explanation--

With legal moves done, the end of the game is almost free. After every move, ask: does the side to move have **any** legal
move?

- **No, and its king is attacked**: that is **checkmate**, and the other side wins.
- **No, but its king is safe**: that is **stalemate**, a draw. (Beginners often throw away won games this way.)
- **Yes, and its king is attacked**: that is **check**, and the game says so.

Chess needs no special code for "is it mate?" beyond what already exists: `legalMoves()` and `inCheck()`. Clean building
blocks make the big rules small.

The last move is highlighted on the board, so you can always see what just happened, and a click after the game ends starts
a new one.

# --explanation-tr--

Yasal hamleler bitince oyunun sonu neredeyse bedavadır. Her hamleden sonra sor: sırası olan tarafın **herhangi** bir yasal
hamlesi var mı?

- **Yok ve şahı saldırı altında**: bu **mattır** ve öbür taraf kazanır.
- **Yok ama şahı güvende**: bu **pattır**, beraberlik. (Yeni başlayanlar kazanılmış oyunları sık sık böyle kaçırır.)
- **Var ve şahı saldırı altında**: bu **şahtır** ve oyun bunu söyler.

Satrancın "mat mı?" için zaten var olanın ötesinde özel bir koda ihtiyacı yoktur: `legalMoves()` ve `inCheck()`. Temiz yapı
taşları büyük kuralları küçük yapar.

Son hamle tahtada vurgulanır; böylece az önce ne olduğunu hep görebilirsin ve oyun bittikten sonra bir tıklama yenisini başlatır.

# --task--

1. Add `lastMove` and `state` (`null` and `'playing'` in `reset()`).
2. After `play()`, if the side to move has no legal moves, the state is `'checkmate'` if it is in check and `'stalemate'`
   otherwise. No clicks count on the board once the game is over; a click then calls `reset()`.
3. Highlight the two squares of the last move like the selected square.
4. The message starts with `Check! ` when the side to move is in check. After checkmate it is
   `Checkmate: black wins! Click to play again` (or white), after stalemate `Stalemate: a draw. Click to play again`.

# --task-tr--

1. `lastMove` ve `state` ekle (`reset()`'te `null` ve `'playing'`).
2. `play()`'den sonra sırası olan tarafın yasal hamlesi yoksa, durum şahtaysa `'checkmate'`, değilse `'stalemate'` olur. Oyun
   bittikten sonra tahtada hiçbir tıklama sayılmaz; bir tıklama o zaman `reset()` çağırır.
3. Son hamlenin iki karesini seçili kare gibi vurgula.
4. Sırası olan taraf şahtayken mesaj `Check! ` ile başlar. Mattan sonra `Checkmate: black wins! Click to play again` (ya da
   white), pattan sonra `Stalemate: a draw. Click to play again` olur.

# --tests--

The fool's mate should end the game in checkmate.
tr: Aptal matı oyunu matla bitirmeli.

```js
const move = (from, to) => play(legalMoves().find((m) => m.from.join() === from && m.to.join() === to))
move('6,5', '5,5') // f3
move('1,4', '3,4') // e5
move('6,6', '4,6') // g4
move('0,3', '4,7') // Qh4#
assert.strictEqual(state, 'checkmate')
assert.strictEqual(turn, 'w')
$.tick(1)
assert.include($.texts(), 'Checkmate: black wins! Click to play again')
$.click(100, 476)
assert.strictEqual(state, 'playing')
assert.strictEqual(board[6][5], 'wP', 'a new game')
```

A king with no moves that is not in check should be stalemate.
tr: Hamlesi olmayan ama şahta olmayan bir şah pat olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[0][7] = 'bK'
board[1][5] = 'wK'
board[3][6] = 'wQ'
play({ from: [3, 6], to: [2, 6] })
assert.strictEqual(state, 'stalemate')
$.tick(1)
assert.include($.texts(), 'Stalemate: a draw. Click to play again')
```

A check should be announced, and the last move highlighted.
tr: Şah duyurulmalı ve son hamle vurgulanmalı.

```js
const move = (from, to) => play(legalMoves().find((m) => m.from.join() === from && m.to.join() === to))
move('6,4', '4,4') // e4
move('1,5', '2,5') // f6
move('7,3', '3,7') // Qh5+
assert.strictEqual(state, 'playing')
$.tick(1)
assert.include($.texts(), 'Check! Black to move')
assert.lengthOf($.rects('rgba(250, 204, 21, 0.45)'), 2)
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
