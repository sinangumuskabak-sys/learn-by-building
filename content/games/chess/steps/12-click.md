---
title: Which square was clicked?
title_tr: Hangi kareye tıklandı?
skills: [game.input]
---

# --goal--

To pick up a piece we must turn a click into a square. The listener converts the pointer position into canvas pixels,
removes the margins, divides by the square size and rounds down. `clickSquare` remembers the square in `selected`.

# --goal-tr--

Taşı oynatmak için önce onu **almamız** lazım: oyuncu bir kareye tıklayacak. Tarayıcı bize tıklamanın **ekrandaki**
yerini verir; biz ise "hangi sıra, hangi sütun?" diye soruyoruz. Bu adımda bu çeviriyi yapacağız ve tıklanan kareyi
`selected` (seçili) değişkeninde tutacağız.

Henüz ekranda bir şey görünmeyecek; seçili kareyi bir sonraki adımda boyayacağız.

# --code--

```js
let selected // the square of the piece you picked up, or null

  selected = null

function clickSquare(r, c) {
  selected = [r, c]
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width - LEFT
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height - TOP
  const r = Math.floor(y / SQ)
  const c = Math.floor(x / SQ)
  if (inside(r, c)) clickSquare(r, c)
})
```

# --meaning--

- `selected` is `null` ("nothing") until a square is clicked.
- `pointerdown` fires when a mouse button or a finger goes down on the canvas.
- `getBoundingClientRect()` is where the canvas is on the screen and how big it is shown; subtracting its `left` and
  scaling by `canvas.width / rect.width` gives canvas pixels even if the canvas is shown smaller.
- Minus `LEFT`/`TOP`, divided by `SQ` and rounded down with `Math.floor`, the pixel becomes a row and column.

# --meaning-tr--

- `let selected` → seçilen karenin `[satır, sütun]`'u. `reset` içinde `null` yapıyoruz: **"hiçbir şey"** (henüz
  seçim yok).
- `canvas.addEventListener('pointerdown', (event) => { ... })` → canvas'a **fare ya da parmak değdiğinde** içerideki
  fonksiyonu çalıştır. `event` tıklamanın bilgilerini taşır.
- `canvas.getBoundingClientRect()` → canvas'ın ekrandaki yeri ve **gösterilen** boyu. Canvas ekranda küçültülmüş
  olabilir; o yüzden:
  - `event.clientX - rect.left` → tıklamanın canvas'ın solundan uzaklığı (ekran pikseli),
  - `* canvas.width / rect.width` → onu canvas pikseline çevirir (küçültmeyi geri alır),
  - `- LEFT` → tahtanın sol boşluğunu çıkarır. `y` aynısını dikey yapar.
- `Math.floor(y / SQ)` → kareye böl ve **aşağı yuvarla**: `Math.floor(130 / 56)` → `2`. Böylece piksel, sıra ve
  sütun numarasına döner.
- `if (inside(r, c)) clickSquare(r, c)` → tahtanın dışına (ör. üstteki mesaj alanına) tıklanırsa bir şey yapma.
- `clickSquare` → şimdilik yalnız kareyi hatırlar: `selected = [r, c]`.

# --task--

1. Under `let board ...` write `let selected ...`; in `reset`, under the `board = ...` line write `selected = null`.
2. Above `function draw() {` write `clickSquare` and the listener.

# --task-tr--

1. `let board ...` satırının **altına** `let selected ...` satırını yaz.
2. `reset` içinde uzun `board = ...` satırının **altına** `selected = null` yaz.
3. `function draw() {` satırının **üstüne** `clickSquare` fonksiyonunu ve dinleyiciyi yaz; aralarında ve `draw`'dan
   önce birer boş satır kalsın.
4. **Çalıştır**. Ekran değişmez; kontroller tıklamayı deneyecek.

# --hint--

Check the parentheses in the `x` and `y` lines, and that the listener is on `canvas`.

# --hint-tr--

`x` ve `y` satırlarındaki parantezleri kontrol et. `Math.floor` büyük `M` ile yazılır. Dinleyici `canvas`'a
eklenmeli (`document`'a değil).

# --tests--

Clicking a square should select its row and column.
tr: Bir kareye tıklamak onun satır ve sütununu seçmeli.

```js
assert.isNull(selected)
$.click(100, 476) // the knight on b1
assert.deepEqual(selected, [7, 1])
$.click(460, 60) // the top right corner square
assert.deepEqual(selected, [0, 7])
```

A click outside the board should do nothing.
tr: Tahtanın dışına tıklamak bir şey yapmamalı.

```js
$.click(240, 20) // the message area above the board
assert.isNull(selected)
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
let selected // the square of the piece you picked up, or null

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
  selected = null
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

function clickSquare(r, c) {
  selected = [r, c]
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
