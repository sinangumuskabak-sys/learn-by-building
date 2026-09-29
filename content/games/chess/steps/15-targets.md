---
title: Where can it go?
title_tr: Nereye gidebilir?
skills: [prog.arrays]
---

# --goal--

When a piece is picked up, keep its moves in `targets`: all the moves of the side to move, filtered to those that
start on the selected square.

# --goal-tr--

Bir taşı alınca oyun, onun **nereye gidebileceğini** bilmeli. Hamle listemiz zaten var: `pseudoMoves(turn)`, sırası
gelen tarafın bütün hamleleri. Bunlardan yalnız **seçili kareden başlayanları** süzüp `targets` (hedefler)
değişkeninde tutacağız.

# --code--

```js
let targets // the moves of the selected piece

  targets = []

    selected = [r, c]
    targets = pseudoMoves(turn).filter((m) => same(m.from, selected))
  } else {
    selected = null
    targets = []
  }
```

# --meaning--

- `targets` starts as an empty list.
- `filter` keeps the items for which the function returns true: here, the moves whose `from` is the selected square.
- Clearing the selection also clears `targets`.

# --meaning-tr--

- `let targets` → seçili taşın hamleleri. `reset` onu boş liste `[]` yapar.
- `pseudoMoves(turn)` → sırası gelen tarafın **bütün** hamleleri.
- `.filter((m) => same(m.from, selected))` → `filter` listedeki her eleman için fonksiyonu sorar ve cevabı `true`
  olanları **yeni bir listede** toplar. Burada: başlangıç karesi seçili kare olan hamleler.
- `else` içindeki `targets = []` → seçim kalkınca hedefler de temizlenir.

# --task--

1. Under `let selected ...` write `let targets ...`; in `reset`, under `selected = null` write `targets = []`.
2. In `clickSquare`, add the two `targets` lines.

# --task-tr--

1. `let selected ...` satırının **altına** `let targets ...` satırını yaz.
2. `reset` içinde `selected = null` satırının **altına** `targets = []` yaz.
3. `clickSquare` içinde `selected = [r, c]` satırının altına `targets = pseudoMoves(...)` satırını, `selected = null`
   satırının altına `targets = []` satırını yaz.
4. **Çalıştır**: ekran değişmez; noktaları bir sonraki adımda çizeceğiz.

# --predict--

You click the white king at the start. What is in `targets`?
- [x] Nothing: `[]`
  The king is surrounded by its own pieces, so it has no moves yet.
- [ ] The 8 squares around it
- [ ] The two knights' moves

# --predict-tr--

Başlangıçta beyaz şaha tıklıyorsun. `targets`'ta ne olur?
- [x] Hiçbir şey: `[]`
  Şahın etrafı kendi taşlarıyla dolu; henüz hamlesi yok.
- [ ] Etrafındaki 8 kare
- [ ] İki atın hamleleri

# --tests--

Selecting a knight should keep its two moves in `targets`.
tr: Bir atı seçmek iki hamlesini `targets`'ta tutmalı.

```js
assert.deepEqual(targets, [])
$.click(100, 476) // the knight on b1
assert.sameDeepMembers(targets.map((m) => m.to), [[5, 0], [5, 2]])
assert.isTrue(targets.every((m) => same(m.from, [7, 1])))
```

Clearing the selection should clear `targets`.
tr: Seçim kalkınca `targets` da temizlenmeli.

```js
$.click(100, 476)
$.click(240, 260)
assert.deepEqual(targets, [])
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
