---
title: Only legal moves
title_tr: Yalnız yasal hamleler
skills: [game.state, prog.functions]
---

# --goal--

Now the rule itself: a move is **legal** only if the mover's king is not in check after it. `legalMoves` tries each
pattern move, looks at the king, takes it back, and keeps the safe ones. The board then shows only legal moves.

# --goal-tr--

Parçalar hazır, kural tek fonksiyon: bir hamle ancak oynandıktan sonra oynayanın şahı **saldırı altında değilse
yasaldır**. `legalMoves()` her desen hamlesini:

1. tahtada **oynar** (`makeMove`),
2. kendi şahına **bakar** (`inCheck`),
3. **geri alır** (`undoMove`),
4. şah güvendeyse listede tutar.

Bu tek kural bir sürü satranç durumunu kendiliğinden çözer: **açmazdaki** taş yerinden oynayamaz, şah tehdit altına
**yürüyemez**, şah çekilince yalnız onu kurtaran hamleler kalır.

# --code--

```js
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

    targets = legalMoves().filter((m) => same(m.from, selected))
```

# --meaning--

- `color` is saved first: `makeMove` switches `turn`, but we must check the mover's king.
- The `filter` function plays, checks and undoes each move; `return safe` keeps it or drops it.
- `clickSquare` now asks `legalMoves()` instead of `pseudoMoves(turn)`.

# --meaning-tr--

- `const color = turn` → oynayan rengi **önceden** sakla: `makeMove` sırayı değiştirecek, ama biz oynayanın şahına
  bakmalıyız.
- `pseudoMoves(color).filter((m) => { ... })` → her hamle için süslü parantez içini çalıştır; `true` dönenler
  kalır.
- `const safe = !inCheck(color)` → hamleden sonra şahım saldırı altında **değil** mi?
- `undoMove(undo)` → tahtayı eski hâline getir. Oyuncu bunların hiçbirini görmez: hepsi bir sonraki çizimden önce
  olup biter.
- `clickSquare` içinde `pseudoMoves(turn)` yerine `legalMoves()` → noktalar artık yalnız yasal hamleleri gösterir.

# --task--

1. Above `function play(m) {` write the comment and `legalMoves`.
2. In `clickSquare`, replace `pseudoMoves(turn)` with `legalMoves()`.

# --task-tr--

1. `function play(m) {` satırının **üstüne** yorum satırını ve `legalMoves` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. `clickSquare` içinde `pseudoMoves(turn)` yazan yeri `legalMoves()` yap.
3. **Çalıştır** ve dene: e4, f5, Vh5 (beyaz vezir h5'e) oyna. Siyah şahtadır; siyahın hangi taşlarına tıklarsan
   tıkla yalnız şahı kurtaran hamleler görünür.

# --predict--

White's rook stands between its king and a black rook on the same file. What can the white rook do?
- [ ] Nothing at all
- [x] Move up and down that file, even capture the black rook
  Those moves keep the king covered, so they stay legal.
- [ ] Anything a rook can do

# --predict-tr--

Beyaz kale, kendi şahı ile aynı sütundaki siyah kalenin **arasında** duruyor. Beyaz kale ne yapabilir?
- [ ] Hiçbir şey
- [x] O sütunda yukarı aşağı gidebilir, siyah kaleyi bile alabilir
  Bu hamleler şahı korumaya devam eder; bu yüzden yasaldır.
- [ ] Bir kalenin yapabildiği her şeyi

# --tests--

A pinned piece should only move along the pin, and a king should not walk into check.
tr: Açmazdaki taş yalnız açmaz boyunca gitmeli; şah tehdit altına yürümemeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[7][4] = 'wK'
board[6][4] = 'wR'
board[0][4] = 'bR'
board[0][0] = 'bK'
turn = 'w'
const rook = legalMoves().filter((m) => m.from.join() === '6,4').map((m) => m.to.join())
assert.sameMembers(rook, ['5,4', '4,4', '3,4', '2,4', '1,4', '0,4'])
board[6][4] = ''
board[5][3] = 'bR'
const king = legalMoves().map((m) => m.to.join())
assert.sameMembers(king, ['7,5', '6,5'], 'the files d and e are covered by the rooks')
```

Clicking a pinned knight should show no dots.
tr: Açmazdaki bir ata tıklamak nokta göstermemeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[7][4] = 'wK'
board[6][4] = 'wN'
board[0][4] = 'bR'
board[0][0] = 'bK'
clickSquare(6, 4)
assert.deepEqual(selected, [6, 4])
assert.deepEqual(targets, [])
```

`legalMoves` should leave the board as it was.
tr: `legalMoves` tahtayı olduğu gibi bırakmalı.

```js
const before = JSON.stringify([board, turn])
assert.lengthOf(legalMoves(), 20)
assert.strictEqual(JSON.stringify([board, turn]), before)
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
