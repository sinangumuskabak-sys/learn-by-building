---
title: "Alpha-beta: skip what cannot matter"
title_tr: "Alfa-beta: önemsizi atla"
skills: [prog.functions]
---

# --goal--

Three moves deep is about 30 × 30 × 30 positions. **Alpha-beta** skips most of them. `alpha` is the score we are
already sure of, `beta` the most the opponent will allow. As soon as a move scores `beta` or more, the opponent would
never let us reach this position, so the rest of our moves here need not be looked at.

# --goal-tr--

Üç hamle derinlik yaklaşık 30 × 30 × 30 = 27.000 pozisyon demek; üstüne her birinde yasal hamle hesabı. Yavaş.
**Alfa-beta budama** bunların çoğunu hiç açmadan atlar. İki sınır taşırız:

- `alpha` → **bizim garantimiz**: şimdiye kadar bulduğumuz en iyi puan. Bundan kötüsü bizi ilgilendirmez.
- `beta` → **rakibin izin vereceği en fazla**: rakibin başka bir yolda zaten elinde tuttuğu seçenek.

Bir hamle `beta`'ya ulaşırsa, rakip **bu pozisyona hiç gelmeye izin vermez** (başka yolu daha iyi). O yüzden buradaki
diğer hamlelerimize bakmaya gerek kalmaz: dalı **budarız**. Sonuç aynı, iş çok daha az.

# --code--

```js
// Negamax with alpha-beta: the best score the side to move can force, looking `depth` moves ahead.
function search(depth, alpha, beta) {
  const moves = legalMoves()
  if (moves.length === 0) return inCheck(turn) ? -100000 - depth : 0
  if (depth === 0) return evaluate() * (turn === 'w' ? 1 : -1)
  for (const m of moves) {
    const undo = makeMove(m)
    const score = -search(depth - 1, -beta, -alpha)
    undoMove(undo)
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

    const score = -search(DEPTH - 1, -Infinity, Infinity) + Math.random() // a tiny random tie-break
```

# --meaning--

- `alpha` replaces `best`: it starts at what the caller already guarantees and grows with each better move.
- For the opponent the window flips and swaps: `-beta, -alpha`, just like the score flips with `-`.
- `score >= beta` returns at once (a cut). The result is the same move choice with far fewer positions.
- `computerMove` starts with the widest window: `-Infinity, Infinity`.

# --meaning-tr--

- `function search(depth, alpha, beta)` → iki yeni parametre: pencerenin alt ve üst sınırı.
- `let best` satırı gitti; onun işini artık `alpha` yapıyor: `if (score > alpha) alpha = score`.
- `-search(depth - 1, -beta, -alpha)` → rakibin gözünden bakınca pencere **ters döner**: bizim garantimiz onun
  üst sınırı olur, onun üst sınırı bizim alt sınırımız. Puanı `-` ile çevirdiğimiz gibi sınırları da çeviririz.
- `if (score >= beta) return beta` → **budama**: rakip buna izin vermez; kalan hamlelere bakmadan dön.
- `return alpha` → bulunan en iyi (ya da garanti edilen) puan.
- `computerMove`'da `-Infinity, Infinity` → en üstte hiçbir sınır yok: en geniş pencere.

# --task--

Change `search` as shown (its comment, its header, the loop and the last line), and pass `-Infinity, Infinity` in
`computerMove`.

# --task-tr--

1. `search`'ün yorumuna `with alpha-beta` ekle ve başlığını `function search(depth, alpha, beta) {` yap.
2. `let best = -Infinity` satırını sil.
3. Döngüde `-search(depth - 1)` çağrısını `-search(depth - 1, -beta, -alpha)` yap.
4. `if (score > best) best = score` satırının yerine iki satırı yaz: `if (score >= beta) return beta` ve
   `if (score > alpha) alpha = score`.
5. Son satırı `return alpha` yap.
6. `computerMove` içinde `-search(DEPTH - 1)` çağrısını `-search(DEPTH - 1, -Infinity, Infinity)` yap.
7. **Çalıştır**.

# --hint--

The order of the window matters: `-search(depth - 1, -beta, -alpha)`, with `beta` first.

# --hint-tr--

Pencerenin sırası önemli: `-search(depth - 1, -beta, -alpha)`, önce `beta`. `return beta` satırı `alpha`'yı
güncelleyen satırdan **önce** gelmeli.

# --tests--

A score at or above `beta` should be cut off at `beta`.
tr: `beta`'ya ulaşan puan `beta`'da kesilmeli.

```js
assert.strictEqual(search(1, -Infinity, -1000), -1000, 'white is doing better than -1000, so the search stops at beta')
```

When no move beats `alpha`, `alpha` should come back.
tr: Hiçbir hamle `alpha`'yı geçemezse `alpha` geri dönmeli.

```js
assert.strictEqual(search(1, 5000, Infinity), 5000)
```

The computer should still find a mate in one.
tr: Bilgisayar tek hamlelik matı yine bulmalı.

```js
const move = (from, to) => play(legalMoves().find((m) => m.from.join() === from && m.to.join() === to))
move('6,5', '5,5')
move('1,4', '3,4')
move('6,6', '4,6')
const mate = computerMove()
assert.deepEqual([mate.from, mate.to], [[0, 3], [4, 7]])
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

// Negamax with alpha-beta: the best score the side to move can force, looking `depth` moves ahead.
function search(depth, alpha, beta) {
  const moves = legalMoves()
  if (moves.length === 0) return inCheck(turn) ? -100000 - depth : 0
  if (depth === 0) return evaluate() * (turn === 'w' ? 1 : -1)
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
