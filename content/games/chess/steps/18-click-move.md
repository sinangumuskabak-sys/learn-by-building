---
title: Click a dot to move
title_tr: Noktaya tıkla, oyna
skills: [game.input]
---

# --goal--

A click on one of the dots plays that move. So `clickSquare` first looks for a target move ending on the clicked
square; if there is one, it plays it and stops.

# --goal-tr--

Parçalar hazır; birleştirme zamanı. Oyuncu bir taşı seçtikten sonra **noktalardan birine** tıklarsa o hamle
oynanmalı. Yani `clickSquare` önce şunu sormalı: "tıklanan kare, hedeflerden birinin **varış karesi** mi?" Öyleyse
hamleyi oyna ve dur; değilse eskisi gibi seçim yap.

# --code--

```js
function clickSquare(r, c) {
  const move = targets.find((m) => same(m.to, [r, c]))
  if (move) {
    play(move)
    return
  }
```

# --meaning--

- `find` returns the first item for which the function is true, or `undefined`.
- If a move was found, `play` it; `return` ends `clickSquare` there, so the selection code below does not run.

# --meaning-tr--

- `targets.find((m) => same(m.to, [r, c]))` → `find` listede koşula uyan **ilk** elemanı verir; hiçbiri uymazsa
  `undefined`. Burada: varış karesi tıklanan kare olan hamle.
- `if (move) {` → böyle bir hamle bulunduysa:
- `play(move)` → oyna.
- `return` → fonksiyonu **burada bitir**; aşağıdaki seçim kodu çalışmasın.

# --task--

At the top of `clickSquare`, above the `if (board[r][c][0] === turn)` line, write the new lines.

# --task-tr--

1. `clickSquare` fonksiyonunun içinde **en üste**, `if (board[r][c][0] === turn) {` satırının **üstüne** yeni
   satırları yaz.
2. **Çalıştır**. b1'deki ata, sonra bir noktaya tıkla: at oraya gitmeli. Sonra siyahın bir atını oyna: sıra
   gerçekten el değiştiriyor.

# --predict--

You select the b1 knight and then click a square that has no dot. What happens?
- [ ] The knight jumps there anyway
- [x] No move is played; the click is handled like a normal selection
  `find` finds no move, so the code below runs as before.
- [ ] An error

# --predict-tr--

b1'deki atı seçip **noktası olmayan** bir kareye tıklıyorsun. Ne olur?
- [ ] At yine de oraya sıçrar
- [x] Hamle oynanmaz; tıklama normal bir seçim gibi işlenir
  `find` hamle bulamaz, aşağıdaki kod eskisi gibi çalışır.
- [ ] Hata çıkar

# --tests--

Clicking a piece and then a dot should play the move.
tr: Bir taşa, sonra bir noktaya tıklamak hamleyi oynamalı.

```js
$.click(100, 476) // the knight on b1
$.click(156, 364) // c3
assert.strictEqual(board[5][2], 'wN')
assert.strictEqual(board[7][1], '')
assert.strictEqual(turn, 'b')
```

After white moves, white pieces can no longer be picked up.
tr: Beyaz oynadıktan sonra beyaz taşlar alınamamalı.

```js
$.click(100, 476)
$.click(156, 364)
$.click(212, 476) // a white piece, but it is black's turn
assert.isNull(selected)
$.click(100, 84) // black's knight on b8
assert.deepEqual(selected, [0, 1])
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
