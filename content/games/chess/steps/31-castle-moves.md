---
title: Castling moves
title_tr: Rok hamleleri
skills: [game.state]
---

# --goal--

**Castling** moves the king two squares towards a rook. It needs history the board cannot show (has the king or that
rook ever moved?), so `castling` keeps four flags: `wK`, `wQ`, `bK`, `bQ` (king side and queen side for each color).
A king on its first square gets a castling move when the flag is on, the squares between are empty and the rook is in
its corner.

# --goal-tr--

**Rok**, şahı kaleye doğru **iki kare** götürüp kaleyi de şahın öbür yanına atlatan özel bir hamle. Yalnız şah ve o
kale **hiç oynamamışsa** yapılabilir.

"Hiç oynamadı mı?" sorusunun cevabı tahtada görünmez; bu bir **geçmiş** bilgisi. O yüzden dört bayrak tutacağız:
`castling = { wK, wQ, bK, bQ }`. `wK` beyazın şah tarafı (kısa rok), `wQ` vezir tarafı (uzun rok); siyah için aynısı.
Hepsi başta `true`.

Bu adımda yalnız rok **hamlelerini** listeye ekliyoruz: şah kendi başlangıç karesinde, bayrak açık, aradaki kareler
boş ve kale köşesinde. Kaleyi taşımayı bir sonraki adımda yapacağız.

# --code--

```js
let castling // which castlings are still allowed

  castling = { wK: true, wQ: true, bK: true, bQ: true }

      // Castling: the king still on its first square, the squares between free and the rook in its corner.
      if (kind === 'K' && c === 4 && r === (color === 'w' ? 7 : 0)) {
        const rook = color + 'R'
        if (castling[color + 'K'] && !board[r][5] && !board[r][6] && board[r][7] === rook) add(r, c, r, 6, { castle: 'K' })
        if (castling[color + 'Q'] && !board[r][1] && !board[r][2] && !board[r][3] && board[r][0] === rook) add(r, c, r, 2, { castle: 'Q' })
      }
```

# --meaning--

- `castling[color + 'K']` reads a flag by a name built from text, like `castling['wK']`.
- King side: columns 5 and 6 empty and the rook on column 7; the king goes to column 6.
- Queen side: columns 1, 2, 3 empty and the rook on column 0; the king goes to column 2.
- The move carries `castle: 'K'` or `castle: 'Q'` through `add`'s extra fields.

# --meaning-tr--

- `let castling` → dört rok hakkı. `reset` hepsini `true` yapar.
- `kind === 'K' && c === 4 && r === (color === 'w' ? 7 : 0)` → şah, kendi başlangıç karesinde mi (e1 ya da e8)?
- `const rook = color + 'R'` → kendi kalemiz: `'wR'` ya da `'bR'`.
- `castling[color + 'K']` → köşeli parantezle, adı **metinden kurulan** bir alanı okuruz: `castling['wK']`, yani
  `castling.wK`.
- Kısa rok: 5. ve 6. sütun boş, kale 7. sütunda → şah 6. sütuna gider. Hamleye `{ castle: 'K' }` eklenir.
- Uzun rok: 1., 2., 3. sütun boş, kale 0. sütunda → şah 2. sütuna gider, `{ castle: 'Q' }`.

# --task--

1. Under `let turn ...` write `let castling ...`; in `reset`, under `turn = 'w'` write the flags.
2. In `pseudoMoves`, under the pawn block (after its closing `}`), write the castling block.

# --task-tr--

1. `let turn ...` satırının **altına** `let castling ...` satırını yaz.
2. `reset` içinde `turn = 'w'` satırının **altına** `castling = { ... }` satırını yaz.
3. `pseudoMoves` içinde piyon bloğu kapandıktan hemen **sonra** (aynı hizada) yorum satırını ve rok bloğunu yaz.
4. **Çalıştır**. Denemek için: e4, e5, Af3, Af6, Fc4, Fc5 oyna, sonra beyaz şaha tıkla: g1'de bir nokta görmelisin.
   (Kale henüz yerinden kıpırdamıyor.)

# --tests--

All castling rights should be on at the start.
tr: Başta bütün rok hakları açık olmalı.

```js
assert.deepEqual(castling, { wK: true, wQ: true, bK: true, bQ: true })
```

A king with an empty path to its rook should get a castling move.
tr: Kalesine giden yol boş olan şah rok hamlesi almalı.

```js
board[7][5] = board[7][6] = ''
assert.deepEqual(pseudoMoves('w').find((m) => m.castle), { from: [7, 4], to: [7, 6], castle: 'K' })
board[7][1] = board[7][2] = board[7][3] = ''
assert.deepEqual(pseudoMoves('w').find((m) => m.castle === 'Q'), { from: [7, 4], to: [7, 2], castle: 'Q' })
```

No castling once the right is gone or the rook is missing.
tr: Hak bitince ya da kale yoksa rok olmamalı.

```js
board[7][5] = board[7][6] = ''
castling.wK = false
assert.isUndefined(pseudoMoves('w').find((m) => m.castle))
castling.wK = true
board[7][7] = ''
assert.isUndefined(pseudoMoves('w').find((m) => m.castle))
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
let selected // the square of the piece you picked up, or null
let targets // the moves of the selected piece

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  turn = 'w'
  castling = { wK: true, wQ: true, bK: true, bQ: true }
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
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc, promote(tr))
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
  const undo = { m, piece, captured: board[tr][tc] }
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
  board[fr][fc] = ''
  turn = other(turn)
  return undo
}

function undoMove(undo) {
  const [fr, fc] = undo.m.from
  const [tr, tc] = undo.m.to
  board[fr][fc] = undo.piece
  board[tr][tc] = undo.captured
  turn = other(turn)
}

// The moves the side to play can really make: try each one, and keep it if its own king is not left in check.
function legalMoves() {
  const color = turn
  return pseudoMoves(color).filter((m) => {
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
