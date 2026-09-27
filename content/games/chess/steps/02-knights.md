---
title: Knights, kings and taking turns
title_tr: Atlar, şahlar ve sırayla oynamak
skills: [prog.arrays, game.input]
---

# --explanation--

Each kind of piece moves in a pattern, and the simplest patterns are fixed **jumps**. A knight can jump to 8 squares and a
king can step to 8 squares, each written as a `[rows, columns]` offset:

```js
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
```

For each offset: the target square must be on the board, and must not hold a piece of the **same** color (an enemy piece
there is a capture). Describing moves as data means one loop handles both pieces.

The move list is the heart of any board game. The player picks up a piece (click it), the game shows where it can go (a dot
on each target), and a click on a target plays the move. Only the side whose `turn` it is can move.

For now there is no check at all: kings can even be captured. The rules that make kings special come later.

# --explanation-tr--

Her taş türü bir desenle hareket eder ve en basit desenler sabit **sıçramalardır**. Bir at 8 kareye sıçrayabilir, bir şah 8
kareye adım atabilir; her biri `[satır, sütun]` farkı olarak yazılır:

```js
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
```

Her fark için: hedef kare tahtada olmalı ve **aynı** renkte bir taş tutmamalı (oradaki bir rakip taş bir almadır). Hamleleri veri
olarak tanımlamak, tek bir döngünün iki taşı da işlemesi demektir.

Hamle listesi her tahta oyununun kalbidir. Oyuncu bir taşı alır (ona tıklar), oyun nereye gidebileceğini gösterir (her hedefte bir
nokta) ve bir hedefe tıklamak hamleyi oynar. Yalnızca `turn`'ü (sırası) olan taraf oynayabilir.

Şimdilik hiç şah çekme yok: şahlar alınabilir bile. Şahları özel yapan kurallar sonra geliyor.

# --task--

1. Add `KNIGHT` and `KING` offsets, `turn` (`'w'` in `reset()`), `selected` and `targets` (`null` and `[]`).
2. Write `pseudoMoves(color)`: for every knight and king of that color, a move `{ from: [r, c], to: [tr, tc] }` for each
   offset that stays on the board and does not land on a piece of the same color.
3. Write `play(m)`: move the piece, empty the square it left, switch `turn`, clear the selection.
4. Write `clickSquare(r, c)`: if it is one of `targets`, play that move; else if it holds a piece of the side to move,
   select it and set `targets` to its moves; else clear the selection. A `pointerdown` on the board calls it.
5. Draw the selected square with a `'rgba(250, 204, 21, 0.45)'` layer, a `'rgba(15, 23, 42, 0.4)'` dot of radius 9 on each
   target, and `White to move` or `Black to move` centered at the top (`y = 34`, white, `'bold 17px sans-serif'`).

# --task-tr--

1. `KNIGHT` ve `KING` farklarını, `turn`'ü (`reset()`'te `'w'`), `selected` ve `targets`'ı (`null` ve `[]`) ekle.
2. `pseudoMoves(color)` yaz: o rengin her atı ve şahı için, tahtada kalan ve aynı renkte bir taşa düşmeyen her fark için bir
   hamle `{ from: [r, c], to: [tr, tc] }`.
3. `play(m)` yaz: taşı taşı, ayrıldığı kareyi boşalt, `turn`'ü değiştir, seçimi temizle.
4. `clickSquare(r, c)` yaz: `targets`'tan biriyse o hamleyi oyna; değilse sırası olan tarafın bir taşını tutuyorsa onu seç ve
   `targets`'ı hamleleri yap; değilse seçimi temizle. Tahtadaki bir `pointerdown` onu çağırır.
5. Seçili kareyi bir `'rgba(250, 204, 21, 0.45)'` katmanıyla, her hedefte 9 yarıçaplı `'rgba(15, 23, 42, 0.4)'` bir nokta ve
   tepede ortalı `White to move` ya da `Black to move` çiz (`y = 34`, beyaz, `'bold 17px sans-serif'`).

# --tests--

At the start, the knights should have two moves each and the kings none.
tr: Başta atların ikişer hamlesi olmalı, şahların hiç olmamalı.

```js
const moves = pseudoMoves('w').map((m) => m.from.join() + '>' + m.to.join()).sort()
assert.deepEqual(moves, ['7,1>5,0', '7,1>5,2', '7,6>5,5', '7,6>5,7'])
```

A king in the middle should have eight moves, in a corner three.
tr: Ortadaki bir şahın sekiz, köşedekinin üç hamlesi olmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][4] = 'wK'
assert.lengthOf(pseudoMoves('w'), 8)
board[4][4] = ''
board[0][0] = 'wK'
board[0][1] = 'wN'
board[1][1] = 'bN'
assert.lengthOf(pseudoMoves('w').filter((m) => m.from[1] === 0), 2, 'not onto its own knight; the black one can be taken')
```

Clicking a piece and then a dot should play the move, and the turn should pass.
tr: Bir taşa, sonra bir noktaya tıklamak hamleyi oynamalı ve sıra geçmeli.

```js
$.click(100, 476) // the knight on b1
assert.deepEqual(selected, [7, 1])
assert.lengthOf(targets, 2)
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.r === 9), 2)
$.click(156, 364) // c3
assert.strictEqual(board[5][2], 'wN')
assert.strictEqual(board[7][1], '')
assert.strictEqual(turn, 'b')
$.click(212, 476) // a white piece, but it is black's turn
assert.isNull(selected)
$.tick(1)
assert.include($.texts(), 'Black to move')
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

// The moves of the knights and kings. (Check comes later: for now even a king can be taken.)
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
