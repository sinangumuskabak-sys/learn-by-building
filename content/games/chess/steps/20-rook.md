---
title: The rook slides
title_tr: Kale kayar
skills: [prog.loops]
---

# --goal--

A rook does not jump: it **slides** any distance in one of four directions until something stops it. So for each
direction we keep stepping with a `while` loop: an empty square is a move; a piece ends the slide, and if it is an
enemy it can be taken.

# --goal-tr--

Kale sıçramaz, **kayar**: dört düz yönden birinde, bir şey onu durdurana kadar istediği kadar gider. Bu yüzden sabit
bir sıçrama listesi yetmez. Onun yerine **yönleri** yazacağız ve her yönde kare kare ilerleyeceğiz:

- Kare boşsa → bir hamle; bir kare daha ilerle.
- Karede taş varsa → dur. Taş rakipse onu **yiyebilir** (bu da bir hamle); kendi taşımızsa oraya gidemez.
- Tahtanın kenarına gelince → dur.

"Ne kadar süreceği belli olmayan tekrar" için `for` değil **`while`** döngüsü kullanırız.

# --code--

```js
const STRAIGHT = [[1, 0], [-1, 0], [0, 1], [0, -1]]

      if (kind === 'R') {
        for (const [dr, dc] of STRAIGHT) {
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
```

# --meaning--

- `STRAIGHT` lists the four straight directions as one-square steps.
- `while (inside(tr, tc))` repeats as long as the square is on the board.
- On a piece: add a capture if it is an enemy, then `break` leaves the loop: nothing can pass through a piece.
- Otherwise add the move and step one square further with `+=`.

# --meaning-tr--

- `const STRAIGHT = [...]` → dört düz yön, her biri **bir karelik adım**: aşağı, yukarı, sağ, sol.
- `let tr = r + dr` → yönde ilk kare. `const` değil `let`, çünkü ilerledikçe değişecek.
- `while (inside(tr, tc)) {` → **while** döngüsü: koşul doğru olduğu sürece (kare tahtada olduğu sürece) içeriyi
  tekrarlar.
- `if (board[tr][tc]) {` → karede bir taş var:
  - `if (board[tr][tc][0] !== color) add(...)` → rakipse yeme hamlesi ekle.
  - `break` → döngüden **hemen çık**: taşın arkasına geçilemez.
- `add(r, c, tr, tc)` → kare boştu: hamle ekle.
- `tr += dr` → `+=` "üstüne ekle": bir kare daha ilerle. `tc` de aynı.

# --task--

1. Under `KING` write `STRAIGHT`.
2. In `pseudoMoves`, under the closing `}` of the knight/king block (above the `}` that closes the `c` loop), write the
   rook block.

# --task-tr--

1. `const KING = ...` satırının **altına** `STRAIGHT` satırını yaz.
2. `pseudoMoves` içinde at/şah bloğu `if (kind === 'N' || kind === 'K') { ... }` kapandıktan hemen **sonra** (içteki
   `c` döngüsünü kapatan `}`'den önce) kale bloğunu yaz. Girinti at bloğuyla aynı hizada olsun.
3. **Çalıştır**. Başta kalelerin hamlesi yok (kendi taşları önlerinde); kontroller boş bir tahtada deneyecek.

# --hint--

Without `break` the rook would slide through pieces; without `tr += dr` the `while` loop would never end.

# --hint-tr--

`break` olmazsa kale taşların içinden geçer. `tr += dr` ve `tc += dc` olmazsa `while` döngüsü **hiç bitmez** ve sayfa
donar; böyle olursa sayfayı yenile ve bu iki satırı kontrol et.

# --tests--

On an empty board a rook in the middle should have 14 moves.
tr: Boş bir tahtanın ortasındaki bir kalenin 14 hamlesi olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][3] = 'wR'
assert.lengthOf(pseudoMoves('w'), 14)
```

A rook should stop at the first piece in its way, taking it if it is an enemy.
tr: Kale yolundaki ilk taşta durmalı, rakipse onu almalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][0] = 'wR'
board[4][3] = 'bN' // three squares to the right
board[1][0] = 'wP' // three squares up
const to = pseudoMoves('w').filter((m) => m.from.join() === '4,0').map((m) => m.to.join()).sort()
assert.deepEqual(to, ['2,0', '3,0', '4,1', '4,2', '4,3', '5,0', '6,0', '7,0'])
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
      if (kind === 'R') {
        for (const [dr, dc] of STRAIGHT) {
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
