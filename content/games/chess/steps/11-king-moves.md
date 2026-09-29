---
title: The king steps too
title_tr: Şah da adım atar
skills: [prog.arrays]
---

# --goal--

A king steps one square in any of 8 directions: another fixed list. The same loop now handles both pieces; only the
list changes.

# --goal-tr--

Şah da sabit bir desenle gider: **8 yöne birer kare**. Onu da bir liste olarak yazınca, at için yazdığımız döngü şahı
da halleder; değişen tek şey **hangi listeyi** kullandığımız. Veriyle yazmanın faydası tam bu.

# --code--

```js
const KING = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]

      if (kind === 'N' || kind === 'K') {
        for (const [dr, dc] of kind === 'N' ? KNIGHT : KING) {
```

# --meaning--

- `KING` lists the 8 neighbouring squares.
- `||` means "or": knights and kings both enter the block.
- `kind === 'N' ? KNIGHT : KING` picks the list for this piece.

# --meaning-tr--

- `const KING = [...]` → komşu 8 kare: aşağı, sağ-aşağı, sağ, sağ-yukarı, ...
- `kind === 'N' || kind === 'K'` → `||` "**veya**": taş at ya da şahsa bloğa gir.
- `kind === 'N' ? KNIGHT : KING` → at ise at listesini, değilse şah listesini dolaş.

# --task--

1. Under `KNIGHT` write `KING`.
2. In `pseudoMoves`, change the `if (kind === 'N')` line and the `for` line under it.

# --task-tr--

1. `const KNIGHT = ...` satırının **altına** `KING` satırını yaz.
2. `pseudoMoves` içinde `if (kind === 'N') {` satırını ve altındaki `for` satırını koddaki gibi değiştir.
3. **Çalıştır**. Başta şahların hiç hamlesi yok: dört yanı kendi taşlarıyla çevrili.

# --predict--

How many moves does white have at the start after this step?
- [ ] 12: four for the knights and eight for the king
- [x] Still 4
  Every square around the king holds a white piece.
- [ ] 0

# --predict-tr--

Bu adımdan sonra başlangıçta beyazın kaç hamlesi olur?
- [ ] 12: atların dört, şahın sekiz
- [x] Yine 4
  Şahın etrafındaki her karede beyaz bir taş var.
- [ ] 0

# --tests--

A king in the middle should have eight moves, in a corner three.
tr: Ortadaki bir şahın sekiz, köşedekinin üç hamlesi olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][4] = 'wK'
assert.lengthOf(pseudoMoves('w'), 8)
board[4][4] = ''
board[0][0] = 'bK'
assert.lengthOf(pseudoMoves('b'), 3)
```

At the start the kings should be boxed in.
tr: Başta şahlar kapalı olmalı.

```js
assert.lengthOf(pseudoMoves('w'), 4, 'still only the knights')
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

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
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

function draw() {
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const x = LEFT + c * SQ
      const y = TOP + r * SQ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#e7d8b8' : '#b58863'
      ctx.fillRect(x, y, SQ, SQ)
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
