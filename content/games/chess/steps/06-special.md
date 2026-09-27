---
title: Castling and en passant
title_tr: Rok ve geçerken alma
skills: [game.state]
---

# --explanation--

Two special moves need the game to **remember the past**, which the board alone cannot show.

**Castling** moves the king two squares towards a rook and jumps the rook over it, in one move. It is only allowed if neither
the king nor that rook has ever moved, the squares between them are empty, and the king is not in check, does not pass
through an attacked square and does not land on one. "Never moved" is history, so keep four flags in `castling`
(`wK`, `wQ`, `bK`, `bQ`) and turn them off for good when a king or rook moves, or a rook is captured in its corner.

**En passant**: when a pawn moves two squares and lands beside an enemy pawn, that pawn may capture it **as if it had moved
only one square**, but only on the very next move. So `enPassant` remembers the square the pawn skipped over, for exactly
one move. The captured pawn is not on the square the capturing pawn moves to, but beside it.

Both change more than one square, so `makeMove` and `undoMove` grow a little. The legality check stays the same: try the
move, look at the king, take it back.

# --explanation-tr--

İki özel hamle, oyunun tahtanın tek başına gösteremeyeceği **geçmişi hatırlamasını** gerektirir.

**Rok**, tek hamlede şahı bir kaleye doğru iki kare taşır ve kaleyi onun üstünden atlatır. Yalnızca ne şah ne de o kale hiç
hareket etmediyse, aradaki kareler boşsa ve şah şahta değilse, saldırı altındaki bir kareden geçmiyorsa ve birine inmiyorsa
izinlidir. "Hiç hareket etmedi" geçmiştir; bu yüzden `castling`'de dört bayrak tut (`wK`, `wQ`, `bK`, `bQ`) ve bir şah ya da
kale hareket edince ya da bir kale köşesinde alınınca onları kalıcı olarak kapat.

**Geçerken alma**: bir piyon iki kare gidip rakip bir piyonun yanına inerse, o piyon onu **yalnızca bir kare gitmiş gibi**
alabilir, ama yalnızca hemen sonraki hamlede. Bu yüzden `enPassant`, piyonun atladığı kareyi tam bir hamle boyunca hatırlar.
Alınan piyon, alan piyonun gittiği karede değil, onun yanındadır.

İkisi de birden fazla kareyi değiştirir; bu yüzden `makeMove` ve `undoMove` biraz büyür. Yasallık kontrolü aynı kalır: hamleyi
dene, şaha bak, geri al.

# --task--

1. Add `castling = { wK: true, wQ: true, bK: true, bQ: true }` and `enPassant = null` to `reset()`.
2. In `pseudoMoves`: a pawn's two-step move gets `double: true`; a pawn can capture diagonally onto `enPassant` with `ep: true`;
   a king on its first square adds castling moves (`castle: 'K'` to column 6, `castle: 'Q'` to column 2) when the right is
   still there, the squares between are empty and the rook is in its corner.
3. In `makeMove`: remove the pawn taken en passant, move the rook when castling, set `enPassant` after a double step (or
   clear it), and turn off castling rights as described. Save and restore `castling`, `enPassant` and the pawn taken en
   passant in `undoMove`.
4. In `legalMoves`, a castling move is not allowed if the king's square or the square it passes over is attacked.

# --task-tr--

1. `reset()`'e `castling = { wK: true, wQ: true, bK: true, bQ: true }` ve `enPassant = null` ekle.
2. `pseudoMoves` içinde: bir piyonun iki adım hamlesi `double: true` alır; bir piyon `enPassant`'a `ep: true` ile çapraz alabilir;
   ilk karesindeki bir şah, hak hâlâ varsa, aradaki kareler boşsa ve kale köşesindeyse rok hamleleri ekler (6. sütuna
   `castle: 'K'`, 2. sütuna `castle: 'Q'`).
3. `makeMove` içinde: geçerken alınan piyonu kaldır, rok yaparken kaleyi taşı, iki adımdan sonra `enPassant`'ı ayarla (ya da
   temizle) ve rok haklarını anlatıldığı gibi kapat. `undoMove`'da `castling`'i, `enPassant`'ı ve geçerken alınan piyonu kaydet
   ve geri yükle.
4. `legalMoves` içinde, şahın karesi ya da üstünden geçtiği kare saldırı altındaysa bir rok hamlesine izin verilmez.

# --tests--

Castling should move both the king and the rook, and end the right to castle.
tr: Rok hem şahı hem kaleyi taşımalı ve rok hakkını bitirmeli.

```js
board[7][5] = board[7][6] = ''
const castle = legalMoves().find((m) => m.castle === 'K')
assert.deepEqual(castle.to, [7, 6])
play(castle)
assert.deepEqual(board[7].slice(4), ['', 'wR', 'wK', ''])
assert.isFalse(castling.wK)
assert.isFalse(castling.wQ)
assert.isTrue(castling.bK)
```

Castling should not be allowed through an attacked square.
tr: Saldırı altındaki bir kareden geçerek rok yapılmamalı.

```js
board[7][5] = board[7][6] = board[6][5] = ''
board[2][5] = 'bR' // attacks f1, the square the king passes over
assert.isUndefined(legalMoves().find((m) => m.castle))
board[2][5] = ''
assert.isDefined(legalMoves().find((m) => m.castle === 'K'))
```

A pawn that jumps two squares past an enemy pawn should be taken en passant, only right away.
tr: Rakip bir piyonun yanından iki kare atlayan piyon, yalnızca hemen, geçerken alınabilmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[7][4] = 'wK'
board[0][4] = 'bK'
board[3][4] = 'wP'
board[1][3] = 'bP'
turn = 'b'
play(legalMoves().find((m) => m.double))
assert.deepEqual(enPassant, [2, 3])
const ep = legalMoves().find((m) => m.ep)
assert.deepEqual([ep.from, ep.to], [[3, 4], [2, 3]])
const undo = makeMove(ep)
assert.strictEqual(board[3][3], '', 'the black pawn beside it is taken')
assert.strictEqual(board[2][3], 'wP')
undoMove(undo)
assert.strictEqual(board[3][3], 'bP')
play(legalMoves().find((m) => m.from.join() === '7,4'))
play(legalMoves().find((m) => m.from.join() === '0,4'))
assert.isUndefined(legalMoves().find((m) => m.ep), 'one move later it is too late')
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

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  castling = { wK: true, wQ: true, bK: true, bQ: true }
  enPassant = null
  selected = null
  targets = []
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
    targets = legalMoves().filter((m) => same(m.from, selected))
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
