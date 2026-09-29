---
title: Losing the right to castle
title_tr: Rok hakkını kaybetmek
skills: [game.state]
---

# --goal--

Once the king moves, both of its castlings are gone for good; once a rook leaves its corner (or is captured there),
that side is gone. `makeMove` turns the flags off, and since that is a change too, `undo` keeps a copy of the flags
to restore.

# --goal-tr--

Rok hakkı bir kez giderse **bir daha gelmez**:

- Şah oynarsa → o rengin iki roku da biter.
- Bir kale köşesinden ayrılırsa → o taraftaki rok biter.
- Köşedeki kale **yenirse** → o taraftaki rok yine biter.

Bayrakları `makeMove` kapatacak. Ama dikkat: `makeMove`'u deneme için de çağırıyoruz. Bayraklar da değişen bir bilgi;
geri alınabilmesi için `undo` onların bir **kopyasını** saklamalı.

# --code--

```js
  const undo = { m, piece, captured: board[tr][tc], castling: { ...castling } }

  // Moving the king or a rook, or capturing a rook on its first square, ends castling on that side for good.
  if (piece[1] === 'K') castling[piece[0] + 'K'] = castling[piece[0] + 'Q'] = false
  for (const [row, col, side] of [[7, 7, 'wK'], [7, 0, 'wQ'], [0, 7, 'bK'], [0, 0, 'bQ']]) {
    if ((fr === row && fc === col) || (tr === row && tc === col)) castling[side] = false
  }

  castling = undo.castling
```

# --meaning--

- `{ ...castling }` makes a **new** object with the same four flags: a copy. Saving `castling` itself would save the
  same object that is about to change.
- `a = b = false` sets both flags.
- Each corner is listed with the flag it guards; a move from or to that corner turns the flag off.

# --meaning-tr--

- `castling: { ...castling }` → `{ ... }` içinde yayma, nesnenin alanlarıyla **yeni bir nesne** yapar: bir kopya.
  Kopya şart: `castling`'in kendisini saklasaydık, birazdan değişecek **aynı** nesneyi saklamış olurduk ve geri alma
  işe yaramazdı.
- `castling[piece[0] + 'K'] = castling[piece[0] + 'Q'] = false` → oynayan şahsa, rengin iki bayrağını birden
  kapatır (`a = b = false` sağdan sola: önce `b`, sonra `a`).
- `[[7, 7, 'wK'], ...]` → dört köşe ve koruduğu bayrak.
- `(fr === row && fc === col) || (tr === row && tc === col)` → hamle bu köşeden **çıkıyor** (kale oynadı) **veya**
  bu köşeye **giriyor** (kale yendi). İkisinde de bayrak kapanır.
- `castling = undo.castling` → `undoMove` saklanan kopyayı geri koyar.

# --task--

1. In `makeMove`, add `castling: { ...castling }` to the `undo` object.
2. Under the two castling rook lines in `makeMove`, write the comment, the king line and the corner loop.
3. In `undoMove`, under its castling lines, write `castling = undo.castling`.

# --task-tr--

1. `makeMove` içinde `undo` nesnesinin sonuna, `}`'den önce `, castling: { ...castling }` ekle.
2. `makeMove` içinde iki `m.castle` satırının **altına** yorumu, şah satırını ve köşe döngüsünü yaz.
3. `undoMove` içinde iki `undo.m.castle` satırının **altına** `castling = undo.castling` yaz.
4. **Çalıştır**.

# --predict--

What would go wrong if `undo` saved `castling` instead of `{ ...castling }`?
- [ ] Nothing
- [x] Just trying a king move while listing legal moves would take the rights away
  The saved object is the same one `makeMove` changes, so the undo would put back the already-changed flags.
- [ ] Castling would never be possible at the start

# --predict-tr--

`undo`, `{ ...castling }` yerine `castling`'in kendisini saklasaydı ne ters giderdi?
- [ ] Hiçbir şey
- [x] Yasal hamleler listelenirken bir şah hamlesini **denemek** bile rok hakkını götürürdü
  Saklanan nesne, `makeMove`'un değiştirdiği nesnenin ta kendisi; geri alma zaten değişmiş bayrakları geri koyardı.
- [ ] Başta rok hiç mümkün olmazdı

# --tests--

Castling, or moving the king, should end both of that side's rights.
tr: Rok yapmak ya da şahı oynatmak o rengin iki hakkını da bitirmeli.

```js
board[7][5] = board[7][6] = ''
play(legalMoves().find((m) => m.castle === 'K'))
assert.deepEqual(castling, { wK: false, wQ: false, bK: true, bQ: true })
```

Moving a rook, or capturing one in its corner, should end that side only.
tr: Bir kaleyi oynatmak ya da köşesinde yemek yalnız o tarafı bitirmeli.

```js
board[6][7] = ''
play({ from: [7, 7], to: [5, 7] })
assert.deepEqual(castling, { wK: false, wQ: true, bK: true, bQ: true })
play({ from: [1, 0], to: [2, 0] })
play({ from: [7, 1], to: [0, 0] }) // a knight lands on a8 and takes the rook
assert.isFalse(castling.bQ)
```

Taking a move back should give the rights back.
tr: Hamleyi geri almak hakları geri vermeli.

```js
const undo = makeMove({ from: [7, 4], to: [5, 4] })
assert.isFalse(castling.wK)
undoMove(undo)
assert.deepEqual(castling, { wK: true, wQ: true, bK: true, bQ: true })
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
  const undo = { m, piece, captured: board[tr][tc], castling: { ...castling } }
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
  board[fr][fc] = ''
  if (m.castle === 'K') [board[fr][5], board[fr][7]] = [board[fr][7], '']
  if (m.castle === 'Q') [board[fr][3], board[fr][0]] = [board[fr][0], '']
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
  if (undo.m.castle === 'K') [board[fr][7], board[fr][5]] = [board[fr][5], '']
  if (undo.m.castle === 'Q') [board[fr][0], board[fr][3]] = [board[fr][3], '']
  castling = undo.castling
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
