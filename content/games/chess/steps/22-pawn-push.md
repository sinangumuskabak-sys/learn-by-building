---
title: Pawns step forward
title_tr: Piyonlar ileri yürür
skills: [prog.arrays]
---

# --goal--

Pawns move only **forward**: up the board for white, down for black. Writing that as a `dir` of `-1` or `1` lets one
piece of code serve both colors. A pawn steps onto an empty square ahead, and from its starting row it may step two
if both squares are empty.

# --goal-tr--

Piyon en karmaşık "basit" taştır. Önce yürüyüşü:

- Yalnız **ileri** gider. Beyaz için ileri **yukarı** (satır azalır), siyah için **aşağı** (satır artar). Bunu
  `dir` (yön) değişkeninde `-1` ya da `1` diye tutunca aynı kod iki renge de çalışır: `r + dir` her zaman "bir kare
  ileri".
- Yalnız **boş** kareye yürür (önündeki taşı yiyemez).
- **Başlangıç sırasındaysa** ve iki kare de boşsa **iki kare** gidebilir.

Bu adımdan sonra başlangıçta beyazın **20** hamlesi olacak: 16 piyon + 4 at. Satranç programcıları hamle üreticisini
tam bu sayıyla denetler.

# --code--

```js
      if (kind === 'P') {
        const dir = color === 'w' ? -1 : 1
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c)
          const start = color === 'w' ? 6 : 1
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
        }
      }
```

# --meaning--

- `dir` is `-1` for white (up) and `1` for black (down).
- `!board[r + dir][c]`: `!` means "not", so this is true when the square ahead is empty.
- The two-square move is inside that `if`: it needs the first square empty too, and the pawn on its starting row
  (6 for white, 1 for black).

# --meaning-tr--

- `const dir = color === 'w' ? -1 : 1` → beyaz yukarı (`-1`), siyah aşağı (`1`).
- `if (!board[r + dir][c]) {` → `!` "**değil**" demek. Boş kare `''` yanlış sayılır, `!''` doğru olur: yani
  "önündeki kare **boşsa**".
- `add(r, c, r + dir, c)` → bir kare ileri.
- `const start = color === 'w' ? 6 : 1` → başlangıç sırası: beyazın piyonları 6. sırada, siyahınkiler 1.'de.
- `if (r === start && !board[r + 2 * dir][c])` → piyon başlangıç sırasındaysa **ve** iki kare önü de boşsa iki kare
  ileri. Bu satır ilk `if`'in **içinde**: ilk kare doluysa iki kare de gidilemez.

# --task--

Under the slide block (after its closing `}`), write the pawn block.

# --task-tr--

1. `pseudoMoves` içinde kale/fil/vezir bloğu kapandıktan hemen **sonra** (onunla aynı hizada) piyon bloğunu yaz.
2. **Çalıştır**, bir piyona tıkla: iki nokta çıkmalı. Oynadıktan sonra tekrar tıkla: artık tek nokta.

# --predict--

White has a piece on e3 (right in front of the e2 pawn). How many moves does the e2 pawn have?
- [ ] One: e4, jumping over
- [x] None
  The two-square move is inside the `if` that needs the first square to be empty.
- [ ] Two

# --predict-tr--

e2 piyonunun hemen önünde, e3'te bir taş var. e2 piyonunun kaç hamlesi olur?
- [ ] Bir: üstünden atlayıp e4
- [x] Hiç
  İki kare gitme satırı, ilk karenin boş olmasını isteyen `if`'in içinde.
- [ ] İki

# --tests--

Each side should have 20 moves at the start.
tr: Başta her iki tarafın da 20 hamlesi olmalı.

```js
assert.lengthOf(pseudoMoves('w'), 20)
assert.lengthOf(pseudoMoves('b'), 20)
const e2 = pseudoMoves('w').filter((m) => m.from.join() === '6,4').map((m) => m.to.join())
assert.sameMembers(e2, ['5,4', '4,4'])
```

A pawn should be blocked by a piece right in front of it, and black pawns go down.
tr: Piyon hemen önündeki taşla durmalı; siyah piyonlar aşağı gitmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][4] = 'wP'
board[3][4] = 'bP'
assert.lengthOf(pseudoMoves('w'), 0)
board[1][1] = 'bP'
const to = pseudoMoves('b').filter((m) => m.from.join() === '1,1').map((m) => m.to.join())
assert.sameMembers(to, ['2,1', '3,1'])
```

A pawn that has moved should step only one square.
tr: Oynamış bir piyon yalnız bir kare gitmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[5][2] = 'wP'
assert.deepEqual(pseudoMoves('w').map((m) => m.to.join()), ['4,2'])
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
  const add = (r, c, tr, tc) => moves.push({ from: [r, c], to: [tr, tc] })
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
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c)
          const start = color === 'w' ? 6 : 1
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
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
  board[tr][tc] = piece
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
