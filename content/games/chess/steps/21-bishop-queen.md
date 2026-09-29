---
title: Bishops and queens
title_tr: Filler ve vezirler
skills: [prog.arrays]
---

# --goal--

A bishop slides the same way, only diagonally; a queen is a rook and a bishop together. The slide code stays as it
is; only the list of directions changes.

# --goal-tr--

Fil de kale gibi kayar, yalnız **çapraz**. Vezir ise kale ile filin **toplamıdır**: hem düz hem çapraz, 8 yön.

Kayma kodunu hiç değiştirmiyoruz; yalnız taşa göre **hangi yön listesini** dolaşacağımızı seçiyoruz. Kod da tam bunu
söyleyecek: vezirin yönleri = düz yönler + çapraz yönler.

# --code--

```js
const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

      if (kind === 'R' || kind === 'B' || kind === 'Q') {
        const dirs = kind === 'R' ? STRAIGHT : kind === 'B' ? DIAGONAL : [...STRAIGHT, ...DIAGONAL]
        for (const [dr, dc] of dirs) {
```

# --meaning--

- `DIAGONAL` lists the four diagonal steps.
- The chained `? :` reads: rook → straight, else bishop → diagonal, else (queen) → both.
- `[...STRAIGHT, ...DIAGONAL]` spreads both lists into one new list of 8 directions.

# --meaning-tr--

- `const DIAGONAL = [...]` → dört çapraz adım: sağ-aşağı, sol-aşağı, sağ-yukarı, sol-yukarı.
- `kind === 'R' || kind === 'B' || kind === 'Q'` → kale, fil ya da vezir.
- `kind === 'R' ? STRAIGHT : kind === 'B' ? DIAGONAL : [...]` → iki `? :` art arda: kale ise düz yönler; **değilse**
  fil ise çapraz yönler; o da değilse (vezir) ikisi birden.
- `[...STRAIGHT, ...DIAGONAL]` → `...` (yayma) bir listenin elemanlarını **açıp döker**: iki listenin elemanlarından
  8 elemanlı **yeni bir liste** olur.
- `for (const [dr, dc] of dirs)` → artık seçilen listeyi dolaşır.

# --task--

1. Under `STRAIGHT` write `DIAGONAL`.
2. Replace the `if (kind === 'R') {` line and the `for` line under it with the three new lines.

# --task-tr--

1. `const STRAIGHT = ...` satırının **altına** `DIAGONAL` satırını yaz.
2. `pseudoMoves` içinde `if (kind === 'R') {` satırını ve altındaki `for (const [dr, dc] of STRAIGHT) {` satırını
   sil; yerine üç yeni satırı yaz. Döngünün içi aynen kalır.
3. **Çalıştır**.

# --predict--

At the start, how many moves do the bishops and the queen have?
- [ ] A few each
- [x] None
  Every one of them is boxed in by its own pawns.
- [ ] Only the queen can move

# --predict-tr--

Başlangıçta fillerin ve vezirin kaç hamlesi var?
- [ ] Birkaç tane
- [x] Hiç yok
  Hepsinin önü kendi piyonlarıyla kapalı.
- [ ] Yalnız vezir oynayabilir

# --tests--

On an empty board a bishop in the middle should have 13 moves and a queen 27.
tr: Boş bir tahtanın ortasındaki bir filin 13, bir vezirin 27 hamlesi olmalı.

```js
for (const [piece, count] of [['wR', 14], ['wB', 13], ['wQ', 27]]) {
  board = Array.from({ length: 8 }, () => Array(8).fill(''))
  board[4][3] = piece
  assert.lengthOf(pseudoMoves('w'), count, piece)
}
```

A bishop should stop at the first piece on each diagonal.
tr: Fil her çaprazda ilk taşta durmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[7][2] = 'bB'
board[5][4] = 'wP'
board[6][1] = 'bP'
const to = pseudoMoves('b').filter((m) => m.from.join() === '7,2').map((m) => m.to.join()).sort()
assert.deepEqual(to, ['5,4', '6,3'])
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
