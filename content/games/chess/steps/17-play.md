---
title: Play a move
title_tr: Hamleyi oyna
skills: [game.state, prog.functions]
---

# --goal--

`play(m)` carries out a move: the piece goes to the target square (whatever stood there is captured), its old square
is emptied, the turn passes to the other side and the selection is cleared.

# --goal-tr--

Hamleyi **oynayan** fonksiyonu yazıyoruz: `play(m)`. Bir hamle oynanınca dört şey olur:

1. Taş hedef kareye konur (orada rakip taş varsa üstüne yazılır, yani **yenir**).
2. Taşın eski karesi boşalır.
3. Sıra **öbür tarafa** geçer.
4. Seçim temizlenir.

Sırayı çevirmek için bir yardımcı daha: `other('w')` → `'b'`.

# --code--

```js
const other = (color) => (color === 'w' ? 'b' : 'w')

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
```

# --meaning--

- `other` returns the opposite color.
- `const [fr, fc] = m.from` unpacks the start square into row and column; `[tr, tc]` the target.
- Writing the piece into the target square replaces anything there: that is a capture.

# --meaning-tr--

- `const other = (color) => ...` → verilen rengin **tersi**: `'w'` ise `'b'`, değilse `'w'`.
- `const [fr, fc] = m.from` → diziyi **açarak** iki ada koyar: `m.from` `[7, 1]` ise `fr = 7` (from row),
  `fc = 1` (from column). `[tr, tc]` hedef için aynısı.
- `board[tr][tc] = piece` → taşı hedefe yaz. Orada bir taş varsa **silinir**: bu bir yeme hamlesi.
- `board[fr][fc] = ''` → eski kareyi boşalt.
- `turn = other(turn)` → sıra değişir.

# --task--

1. Under `const inside = ...` write `other`.
2. Above `const same = ...` write `play`, with an empty line after it.

# --task-tr--

1. `const inside = ...` satırının **altına** `other` satırını yaz.
2. `const same = ...` satırının **üstüne** `play` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**. Tıklayarak henüz oynayamazsın; `play`'i bir sonraki adımda tıklamaya bağlayacağız.

# --tests--

`other` should give the other color.
tr: `other` öbür rengi vermeli.

```js
assert.strictEqual(other('w'), 'b')
assert.strictEqual(other('b'), 'w')
```

`play` should move the piece, empty its square and pass the turn.
tr: `play` taşı taşımalı, karesini boşaltmalı ve sırayı geçirmeli.

```js
$.click(100, 476)
play({ from: [7, 1], to: [5, 2] })
assert.strictEqual(board[5][2], 'wN')
assert.strictEqual(board[7][1], '')
assert.strictEqual(turn, 'b')
assert.isNull(selected)
assert.deepEqual(targets, [])
```

Moving onto an enemy piece should capture it.
tr: Rakip taşın üstüne gitmek onu yemeli.

```js
play({ from: [7, 1], to: [1, 1] })
assert.strictEqual(board[1][1], 'wN')
assert.lengthOf(board.flat().filter((p) => p[0] === 'b'), 15)
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
