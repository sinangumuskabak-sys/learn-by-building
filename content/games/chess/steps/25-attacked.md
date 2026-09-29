---
title: Is a square attacked?
title_tr: Kare saldırı altında mı?
skills: [prog.functions, game.state]
---

# --goal--

The rule that makes chess chess: **you may never leave your own king in check**. First we need to know whether a square
is attacked. Instead of listing all enemy moves, look **outwards from the square**: a pawn diagonally in front of it?
A knight a jump away? A king next to it?

# --goal-tr--

Satrancı satranç yapan kural: **kendi şahını asla saldırı altında (şahta) bırakamazsın.** Bunun için önce "bu kare
saldırı altında mı?" sorusunu cevaplamalıyız.

Rakibin bütün hamlelerini üretmek yerine daha akıllı bir yol var: **kareden dışarı bak**. Desenler iki yöne de
işler: bu kareden bir at sıçraması uzakta rakip at varsa, o at da bu kareye sıçrayabilir demektir. Hamle desenlerini
**tersten** kullanıyoruz.

Bu adımda sabit mesafeden saldıranlar: **piyon, at, şah**. Kayan taşlar bir sonraki adımda.

# --code--

```js
// Is the square (r, c) attacked by a piece of color `by`? Look outwards from the square for each kind of attacker.
function attacked(r, c, by) {
  const pawnRow = r + (by === 'w' ? 1 : -1) // a white pawn attacks upwards, so it stands one row below
  for (const dc of [-1, 1]) {
    if (inside(pawnRow, c + dc) && board[pawnRow][c + dc] === by + 'P') return true
  }
  for (const [list, kind] of [[KNIGHT, 'N'], [KING, 'K']]) {
    for (const [dr, dc] of list) {
      if (inside(r + dr, c + dc) && board[r + dr][c + dc] === by + kind) return true
    }
  }
  return false
}
```

# --meaning--

- A white pawn captures upwards, so a white attacker stands one row **below** the square (`r + 1`); a black one
  above.
- `[[KNIGHT, 'N'], [KING, 'K']]` pairs each jump list with the piece that uses it; one loop checks both.
- `by + kind` builds the piece to look for, like `'bN'`. The first attacker found returns `true` at once.

# --meaning-tr--

- `attacked(r, c, by)` → `(r, c)` karesine `by` renginden bir taş saldırıyor mu? Cevap `true` ya da `false`.
- `const pawnRow = r + (by === 'w' ? 1 : -1)` → beyaz piyon **yukarı** doğru yer; yani bu kareye saldıran beyaz piyon
  bir sıra **aşağıda** (`r + 1`) durur. Siyahınki bir sıra yukarıda.
- İlk döngü → o sıranın solundaki ve sağındaki kareye bakar: orada `by + 'P'` (ör. `'wP'`) var mı?
- `return true` → saldıran bulundu; fonksiyon **hemen** biter, gerisine bakmaya gerek yok.
- `for (const [list, kind] of [[KNIGHT, 'N'], [KING, 'K']])` → her eleman bir **çift**: sıçrama listesi ve onu
  kullanan taş. Aynı döngü önce atları, sonra şahı arar.
- `board[r + dr][c + dc] === by + kind` → o sıçrama kadar ötede rakibin atı (ya da şahı) mı duruyor?
- `return false` → hiçbir saldıran bulunamadı.

# --task--

Above `function play(m) {`, write the comment and `attacked`, with an empty line after it.

# --task-tr--

1. `function play(m) {` satırının **üstüne** yorum satırını ve `attacked` fonksiyonunu yaz; altında bir boş satır
   kalsın.
2. **Çalıştır**. Ekranda değişiklik yok; kontroller fonksiyonu deneyecek.

# --predict--

A black pawn stands on row 3. Which row's squares does it attack?
- [ ] Row 2
- [x] Row 4
  Black moves down the board, so its pawn captures one row further down.
- [ ] Row 3, beside it

# --predict-tr--

Siyah bir piyon 3. sırada duruyor. Hangi sıradaki karelere saldırır?
- [ ] 2. sıra
- [x] 4. sıra
  Siyah tahtada aşağı doğru ilerler; piyonu da bir sıra aşağıyı yer.
- [ ] Yanındaki 3. sıra

# --tests--

Pawns should attack diagonally forward, from their own side.
tr: Piyonlar kendi yönlerinde çapraz ileri saldırmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[3][3] = 'bP'
assert.isTrue(attacked(4, 4, 'b'), 'a black pawn attacks downwards')
assert.isTrue(attacked(4, 2, 'b'))
assert.isFalse(attacked(2, 4, 'b'), 'not upwards')
assert.isFalse(attacked(4, 3, 'b'), 'not straight ahead')
board[6][6] = 'wP'
assert.isTrue(attacked(5, 5, 'w'), 'a white pawn attacks upwards')
assert.isFalse(attacked(7, 5, 'w'))
```

Knights and kings should attack the squares they could move to.
tr: Atlar ve şahlar gidebilecekleri karelere saldırmalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[2][5] = 'wN'
assert.isTrue(attacked(4, 4, 'w'))
assert.isFalse(attacked(4, 5, 'w'))
assert.isFalse(attacked(4, 4, 'b'), 'the knight is white')
board[0][0] = 'bK'
assert.isTrue(attacked(1, 1, 'b'))
assert.isFalse(attacked(2, 2, 'b'))
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

// Is the square (r, c) attacked by a piece of color `by`? Look outwards from the square for each kind of attacker.
function attacked(r, c, by) {
  const pawnRow = r + (by === 'w' ? 1 : -1) // a white pawn attacks upwards, so it stands one row below
  for (const dc of [-1, 1]) {
    if (inside(pawnRow, c + dc) && board[pawnRow][c + dc] === by + 'P') return true
  }
  for (const [list, kind] of [[KNIGHT, 'N'], [KING, 'K']]) {
    for (const [dr, dc] of list) {
      if (inside(r + dr, c + dc) && board[r + dr][c + dc] === by + kind) return true
    }
  }
  return false
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
