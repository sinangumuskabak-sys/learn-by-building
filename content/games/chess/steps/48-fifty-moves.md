---
title: "Build it yourself: the fifty-move rule"
title_tr: "Kendin yap: elli hamle kuralı"
skills: [game.state]
---

# --goal--

Your game, your rules. Real chess has one more way to draw: if **fifty moves by each side** (100 moves in total) pass
without any capture or pawn move, the game is a draw. Add it.

# --goal-tr--

Oyun senin! Gerçek satrançta bir beraberlik yolu daha var: **elli hamle kuralı**. İki taraf da **50'şer hamle** (toplam
100 hamle) boyunca hiç taş almaz ve hiç piyon oynatmazsa oyun **berabere** biter. Taşlar sonsuza kadar dolaşmasın
diye.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `reset`, `play`, `state` ve `draw`'daki mesajlar. Kontroller çalıştığında
yeşile döner.

# --task--

- Keep a counter `halfmoves`: the number of moves since the last capture or pawn move (0 after `reset()`).
- In `play`: a move that captures or moves a pawn sets it to 0; any other move adds 1.
- When `halfmoves` reaches 100 and the game is not already over, `state` becomes `'draw'`, the top says
  `Draw by the fifty-move rule. Click to play again`, and a click starts a new game.

# --task-tr--

- Bir sayaç tut: `halfmoves` → son taş alma ya da piyon hamlesinden bu yana oynanan hamle sayısı. `reset()` onu 0
  yapsın.
- `play` içinde: taş alan **ya da** piyon oynatan bir hamle sayacı **0** yapsın; başka her hamle **1 artırsın**.
- Sayaç **100**'e ulaşınca (ve oyun mat ya da patla zaten bitmediyse) `state` `'draw'` olsun; üstte
  `Draw by the fifty-move rule. Click to play again` yazsın; tıklamak yeni oyun başlatsın.

Takılırsan ipucu kutusuna bak ya da Maymun'a sor.

# --hint--

Decide whether a move is quiet **before** `makeMove(m)`: after it the target square holds the moving piece.

# --hint-tr--

Hamlenin "sessiz" olup olmadığına `makeMove(m)`'den **önce** karar ver: hedef kare boş mu (`!board[m.to[0]][m.to[1]]`)
ve oynayan taş piyon değil mi? `makeMove`'dan sonra hedefte artık oynayan taş durur. Beraberliği `play`'in sonundaki
`if ... else if` zincirine, bilgisayarın düşünmeye başladığı satırdan **önce** ekle.

# --tests--

`halfmoves` should count quiet moves and go back to 0 on a pawn move.
tr: `halfmoves` sessiz hamleleri saymalı, piyon hamlesinde 0'a dönmeli.

```js
assert.strictEqual(halfmoves, 0)
const move = (from, to) => play(legalMoves().find((m) => m.from.join() === from && m.to.join() === to))
move('7,6', '5,5') // Nf3
assert.strictEqual(halfmoves, 1)
move('0,1', '2,2') // Nc6
assert.strictEqual(halfmoves, 2)
move('6,4', '4,4') // e4, a pawn move
assert.strictEqual(halfmoves, 0)
```

A capture should set `halfmoves` back to 0, and `reset()` too.
tr: Taş almak `halfmoves`'u 0'a döndürmeli; `reset()` da.

```js
halfmoves = 30
play({ from: [7, 1], to: [1, 1] }) // the knight takes a pawn
assert.strictEqual(halfmoves, 0)
halfmoves = 30
reset()
assert.strictEqual(halfmoves, 0)
```

The hundredth quiet move should end the game in a draw.
tr: Yüzüncü sessiz hamle oyunu beraberlikle bitirmeli.

```js
halfmoves = 98
const move = (from, to) => play(legalMoves().find((m) => m.from.join() === from && m.to.join() === to))
move('7,6', '5,5')
assert.strictEqual(state, 'playing')
move('0,6', '2,5')
assert.strictEqual(halfmoves, 100)
assert.strictEqual(state, 'draw')
$.tick(30)
assert.strictEqual(turn, 'w', 'nobody moves after a draw')
assert.isTrue($.texts().some((t) => /fifty/i.test(t)), 'the message should mention the fifty-move rule')
$.click(100, 476)
assert.strictEqual(state, 'playing')
assert.strictEqual(halfmoves, 0)
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
const DEPTH = 3 // how many moves ahead the computer looks

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'
let turn // 'w' or 'b'
let castling // which castlings are still allowed
let enPassant // the square a pawn could capture onto en passant right now, or null
let selected // the square of the piece you picked up, or null
let targets // the moves of the selected piece
let lastMove
let state // 'playing', 'checkmate' or 'stalemate'
let thinking // frames until the computer moves
let halfmoves // moves since the last capture or pawn move

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  castling = { wK: true, wQ: true, bK: true, bQ: true }
  enPassant = null
  selected = null
  targets = []
  lastMove = null
  state = 'playing'
  thinking = 0
  halfmoves = 0
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
  const quiet = !board[m.to[0]][m.to[1]] && board[m.from[0]][m.from[1]][1] !== 'P'
  makeMove(m)
  halfmoves = quiet ? halfmoves + 1 : 0
  lastMove = m
  selected = null
  targets = []
  if (legalMoves().length === 0) state = inCheck(turn) ? 'checkmate' : 'stalemate'
  else if (halfmoves >= 100) state = 'draw'
  else if (turn === 'b') thinking = 20
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

// Negamax with alpha-beta: the best score the side to move can force, looking `depth` moves ahead.
function search(depth, alpha, beta) {
  const moves = legalMoves()
  if (moves.length === 0) return inCheck(turn) ? -100000 - depth : 0
  if (depth === 0) return evaluate() * (turn === 'w' ? 1 : -1)
  // Trying captures of big pieces first lets alpha-beta skip more of the rest.
  const gain = (m) => (board[m.to[0]][m.to[1]] ? VALUES[board[m.to[0]][m.to[1]][1]] : 0)
  moves.sort((a, b) => gain(b) - gain(a))
  for (const m of moves) {
    const undo = makeMove(m)
    const score = -search(depth - 1, -beta, -alpha)
    undoMove(undo)
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

function computerMove() {
  let best = null
  let bestScore = -Infinity
  for (const m of legalMoves()) {
    const undo = makeMove(m)
    const score = -search(DEPTH - 1, -Infinity, Infinity) + Math.random() // a tiny random tie-break
    undoMove(undo)
    if (score > bestScore) {
      best = m
      bestScore = score
    }
  }
  return best
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
  if (state !== 'playing' || turn !== 'w') return
  const move = targets.find((m) => same(m.to, [r, c]))
  if (move) {
    play(move)
    return
  }
  if (board[r][c][0] === 'w') {
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

function update() {
  if (state !== 'playing' || turn !== 'b') return
  thinking -= 1
  if (thinking <= 0) play(computerMove())
}

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

  let message = turn === 'w' ? 'Your move (white)' : 'Computer is thinking...'
  if (state === 'playing' && inCheck(turn)) message = 'Check! ' + message
  if (state === 'checkmate') message = (turn === 'w' ? 'Checkmate: the computer wins.' : 'Checkmate: you win!') + ' Click to play again'
  if (state === 'stalemate') message = 'Stalemate: a draw. Click to play again'
  if (state === 'draw') message = 'Draw by the fifty-move rule. Click to play again'
  ctx.fillStyle = 'white'
  ctx.font = 'bold 17px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(message, canvas.width / 2, 34)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
