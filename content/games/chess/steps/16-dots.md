---
title: Show the targets
title_tr: Hedefleri göster
skills: [game.canvas]
---

# --goal--

Draw a small see-through dot in the middle of each target square, after the board and pieces so the dots are on top.

# --goal-tr--

Şimdi hedefleri **gösterelim**: gidilebilecek her karenin ortasına küçük, yarı saydam koyu bir **nokta**. Noktalar
tahtanın ve taşların **üstünde** görünsün diye onları en son, iki döngü bittikten sonra çizeceğiz.

# --code--

```js
  // A dot on every square the selected piece can move to.
  ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'
  for (const m of targets) {
    ctx.beginPath()
    ctx.arc(LEFT + m.to[1] * SQ + SQ / 2, TOP + m.to[0] * SQ + SQ / 2, 9, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- For each move in `targets`, `m.to[1]` is the column and `m.to[0]` the row; the same formula as the squares, plus
  half a square, gives the center.
- `beginPath`, `arc(x, y, radius, start, end)` and `fill` draw a filled circle; `Math.PI * 2` is a full turn.

# --meaning-tr--

- `for (const m of targets) {` → her hedef hamle için.
- `LEFT + m.to[1] * SQ + SQ / 2` → hedef sütunun (`m.to[1]`) karesinin **ortası**; kareleri çizerken kullandığımız
  formülün aynısı, artı yarım kare. İkincisi aynı hesabı satır (`m.to[0]`) için yapar.
- `ctx.beginPath()` → yeni bir şekle başla.
- `ctx.arc(x, y, 9, 0, Math.PI * 2)` → merkezi `(x, y)`, yarıçapı 9 piksel olan bir **yay**. Açılar radyanla verilir:
  0'dan `Math.PI * 2`'ye (360°) kadar, yani **tam daire**.
- `ctx.fill()` → daireyi seçili renkle doldurur.

# --task--

In `draw`, after the two loops close (before the last `}` of `draw`), write the dot lines.

# --task-tr--

1. `draw` içinde iki `for` döngüsünün kapanan `}`'lerinin **altına**, `draw`'un son `}`'inden **önce** yorumu ve
   nokta satırlarını yaz.
2. **Çalıştır** ve b1'deki ata (en alt sıra, soldan ikinci taş) tıkla: iki nokta çıkmalı.

# --tests--

Selecting a knight should draw a dot of radius 9 on each of its two targets.
tr: Bir atı seçmek iki hedefinin her birine 9 yarıçaplı bir nokta çizmeli.

```js
$.click(100, 476)
$.tick(1)
const dots = $.arcs().filter((a) => a.r === 9)
assert.lengthOf(dots, 2)
assert.sameDeepMembers(dots.map((a) => [a.x, a.y]), [[44, 364], [156, 364]])
```

Without a selection there should be no dots.
tr: Seçim yokken nokta olmamalı.

```js
$.click(100, 476)
$.click(240, 260)
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.r === 9), 0)
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
    }
  }
  return moves
}

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

function clickSquare(r, c) {
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
