---
title: A move that remembers
title_tr: Hatırlayan hamle
skills: [prog.functions, se.refactoring]
---

# --goal--

To know whether a move leaves the king in check, we will **try** it and then **take it back**. So the board part of
`play` becomes `makeMove`, which also returns an `undo` object: the move, the piece that moved and whatever was
captured. `play` calls it and then clears the selection.

# --goal-tr--

Bir hamlenin şahı tehlikede bırakıp bırakmadığını anlamanın en kolay yolu: hamleyi tahtada **dene**, şaha bak, sonra
**geri al**. Geri alabilmek için hamle neyi değiştirdiğini **hatırlamalı**: hangi taş oynadı, hedefte ne vardı?

Bu yüzden `play`'i ikiye ayırıyoruz:

- `makeMove(m)` → yalnız **tahtadaki** işi yapar (taş, sıra) ve geri alma bilgisini (`undo`) döndürür.
- `play(m)` → gerçek bir hamle: `makeMove`'u çağırır, sonra seçimi temizler.

Oyun aynı oynanır; ama artık hamleleri "hayalde" deneyebileceğiz.

# --code--

```js
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

function play(m) {
  makeMove(m)
  selected = null
  targets = []
}
```

# --meaning--

- `{ m, piece, captured: board[tr][tc] }` is short for `{ m: m, piece: piece, captured: ... }`; it is saved **before**
  the board changes.
- `makeMove` touches only the board and the turn, never the selection, so it is safe to call while "thinking".

# --meaning-tr--

- `function play(m)` → adı `makeMove` oldu; başına bir yorum eklendi.
- `const undo = { m, piece, captured: board[tr][tc] }` → geri alma bilgisi. `{ m, piece }` kısaltması
  `{ m: m, piece: piece }` demek: değişkenin adı alanın adı olur. `captured` → hedefte **ne vardı** (yenen taş ya
  da `''`). Bu satır tahta değişmeden **önce** gelmeli; sonra hedefte artık oynayan taş olur.
- `return undo` → bilgiyi geri verir.
- `selected = null` ve `targets = []` → `makeMove`'dan çıktı, yeni `play`'e taşındı. `makeMove` seçime dokunmamalı;
  birazdan onu oyuncunun haberi olmadan yüzlerce kez çağıracağız.
- Yeni `play(m)` → `makeMove(m)` ile tahtayı değiştirir, sonra seçimi temizler.

# --task--

Rename `play` to `makeMove` (with the comment), add the `undo` and `return` lines, move the two selection lines into a
new `play` below it.

# --task-tr--

1. `function play(m) {` satırının üstüne yorum satırını yaz ve adını `makeMove` yap.
2. `const piece = ...` satırının **altına** `const undo = ...` satırını yaz.
3. `selected = null` ve `targets = []` satırlarını sil; `turn = other(turn)` satırının altına `return undo` yaz.
4. `makeMove`'un kapanan `}`'inin altına bir boş satır bırak ve yeni `play` fonksiyonunu yaz.
5. **Çalıştır** ve oyna: her şey eskisi gibi çalışmalı.

# --hint--

The `undo` line must come before the board changes, or `captured` will be the moving piece.

# --hint-tr--

`const undo = ...` satırı tahtayı değiştiren satırlardan **önce** olmalı; yoksa `captured` yenen taşı değil oynayan
taşı görür.

# --tests--

`makeMove` should play the move and return what it needs to take it back.
tr: `makeMove` hamleyi oynamalı ve geri almak için gerekeni döndürmeli.

```js
const m = { from: [7, 1], to: [1, 1] }
const undo = makeMove(m)
assert.strictEqual(board[1][1], 'wN')
assert.strictEqual(turn, 'b')
assert.deepEqual(undo, { m, piece: 'wN', captured: 'bP' })
```

`makeMove` should not touch the selection; `play` should clear it.
tr: `makeMove` seçime dokunmamalı; `play` onu temizlemeli.

```js
$.click(100, 476)
makeMove({ from: [6, 0], to: [5, 0] })
assert.deepEqual(selected, [7, 1])
turn = 'w'
play({ from: [7, 1], to: [5, 2] })
assert.isNull(selected)
assert.strictEqual(board[5][2], 'wN')
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
