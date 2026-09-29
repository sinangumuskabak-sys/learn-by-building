---
title: A pawn becomes a queen
title_tr: Piyon vezir olur
skills: [prog.functions, game.state]
---

# --goal--

A pawn that reaches the far side is **promoted** to a queen. The move carries an extra field `promo: 'Q'`, so `add`
learns to take extra fields, and `play` puts a queen on the board instead of the pawn.

# --goal-tr--

Öbür uca (beyaz için 0. sıra, siyah için 7. sıra) ulaşan piyon **terfi eder**: vezir olur. Bunu hamlenin kendisine
yazacağız: böyle bir hamle fazladan bir alan taşır, `promo: 'Q'`.

Üç küçük değişiklik:

1. `add` isteğe bağlı **fazladan alanlar** alabilsin.
2. Piyon hamleleri son sıraya varıyorsa `promo: 'Q'` eklensin.
3. `play`, `promo`'lu bir hamlede tahtaya piyon değil **vezir** koysun.

# --code--

```js
  const add = (r, c, tr, tc, extra = {}) => moves.push({ from: [r, c], to: [tr, tc], ...extra })

        const dir = color === 'w' ? -1 : 1
        const last = color === 'w' ? 0 : 7
        const promote = (tr) => (tr === last ? { promo: 'Q' } : {})
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c, promote(r + dir))

          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc, promote(tr))

  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
```

# --meaning--

- `extra = {}` is a default value: if `add` is called without a fifth argument, `extra` is an empty object.
  `...extra` copies its fields into the move.
- `promote(tr)` returns `{ promo: 'Q' }` when the pawn lands on the last row, otherwise `{}`.
- In `play`, `piece[0] + m.promo` makes `'wQ'` from `'wP'`.

# --meaning-tr--

- `extra = {}` → **varsayılan değer**: `add` beşinci bir şey verilmeden çağrılırsa `extra` boş nesne `{}` olur.
  Böylece eski çağrılar hiç değişmeden çalışır.
- `...extra` → nesnelerde de yayma var: `extra`'nın alanlarını hamle nesnesine **kopyalar**. `{}` ise hiçbir şey
  eklemez; `{ promo: 'Q' }` ise hamleye `promo: 'Q'` ekler.
- `const last = color === 'w' ? 0 : 7` → piyonun varacağı son sıra.
- `const promote = (tr) => (tr === last ? { promo: 'Q' } : {})` → hedef sıra son sıraysa `{ promo: 'Q' }`, değilse
  `{}`. (Nesneyi ok fonksiyonunda döndürürken parantez içine alırız.)
- `add(..., promote(r + dir))` ve `add(..., promote(tr))` → düz yürüyüş ve çapraz yeme, ikisi de terfi edebilir.
  (İki kare gitme hiç son sıraya varmaz.)
- `m.promo ? piece[0] + m.promo : piece` → hamlede `promo` varsa rengi koru, türü değiştir: `'w' + 'Q'` → `'wQ'`.

# --task--

1. In `pseudoMoves`, change the `add` line.
2. In the pawn block, add `last` and `promote` under `dir`, and pass `promote(...)` to the two `add` calls shown.
3. In `play`, change the `board[tr][tc] = piece` line.

# --task-tr--

1. `pseudoMoves`'un başındaki `const add = ...` satırını yenisiyle değiştir.
2. Piyon bloğunda `const dir = ...` satırının **altına** `last` ve `promote` satırlarını yaz.
3. Bir kare ileri giden `add(r, c, r + dir, c)` çağrısının sonuna `, promote(r + dir)` ekle; çapraz yemedeki
   `add(r, c, tr, tc)` çağrısının sonuna `, promote(tr)` ekle.
4. `play` içinde `board[tr][tc] = piece` satırını `board[tr][tc] = m.promo ? piece[0] + m.promo : piece` yap.
5. **Çalıştır**. (Bir piyonu sona kadar sürmek uzun sürer; kontroller bunu senin yerine dener.)

# --hint--

`promote` must be defined above the first line that uses it, right under `dir`.

# --hint-tr--

`promote`, onu kullanan ilk satırdan **önce** tanımlanmalı: `const dir` satırının hemen altına. `...extra`'daki üç
noktayı unutma.

# --tests--

A pawn move onto the last row should carry `promo: 'Q'`, other moves not.
tr: Son sıraya giden piyon hamlesi `promo: 'Q'` taşımalı, diğerleri taşımamalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[1][0] = 'wP'
board[0][1] = 'bR'
board[4][4] = 'wN'
const moves = pseudoMoves('w')
assert.deepEqual(moves.filter((m) => m.from.join() === '1,0'), [
  { from: [1, 0], to: [0, 0], promo: 'Q' },
  { from: [1, 0], to: [0, 1], promo: 'Q' },
])
assert.deepEqual(moves.find((m) => m.from.join() === '4,4'), { from: [4, 4], to: [5, 6] })
```

Playing a promotion should put a queen on the board.
tr: Terfi hamlesini oynamak tahtaya vezir koymalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[6][3] = 'bP'
turn = 'b'
play(pseudoMoves('b')[0])
assert.strictEqual(board[7][3], 'bQ')
assert.strictEqual(board[6][3], '')
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
        const last = color === 'w' ? 0 : 7
        const promote = (tr) => (tr === last ? { promo: 'Q' } : {})
        if (!board[r + dir][c]) {
          add(r, c, r + dir, c, promote(r + dir))
          const start = color === 'w' ? 6 : 1
          if (r === start && !board[r + 2 * dir][c]) add(r, c, r + 2 * dir, c)
        }
        for (const dc of [-1, 1]) {
          const tr = r + dir
          const tc = c + dc
          if (!inside(tr, tc)) continue
          if (board[tr][tc] && board[tr][tc][0] !== color) add(r, c, tr, tc, promote(tr))
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
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
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
