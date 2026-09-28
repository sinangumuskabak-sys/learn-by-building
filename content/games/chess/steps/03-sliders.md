---
title: Rooks, bishops and queens
title_tr: Kaleler, filler ve vezirler
skills: [prog.loops]
---

# --explanation--

Rooks, bishops and queens **slide**: they move any distance in a direction until something stops them. So instead of fixed
jumps they have **directions**, and each direction is followed square by square:

```js
while (inside(tr, tc)) {
  if (board[tr][tc]) {                      // a piece is in the way
    if (it is an enemy) add the capture
    break                                   // cannot go through it
  }
  add the move, then step one square further
}
```

A rook uses the four straight directions, a bishop the four diagonals, and a queen all eight: the queen is literally a rook
and a bishop together, and the code says exactly that with `[...STRAIGHT, ...DIAGONAL]`.

At the start the sliding pieces have no moves at all: every one of them is boxed in by its own pieces.

# --explanation-tr--

**Bu adımda:** kaleleri, filleri ve vezirleri hareket ettireceğiz. Başta görünürde bir şey değişmeyecek (bu taşların
hepsi kendi taşlarıyla çevrili); bir atı ya da piyonu kaldırıp yol açınca kale, fil ve vezir o yoldan kayabilecek.

**Kayan taşlar.** Kale, fil ve vezir **kayar**: bir şey onları durdurana kadar bir yönde istedikleri kadar giderler.
Bu yüzden sabit sıçramalar yerine **yönleri** vardır ve her yön kare kare takip edilir:

```js
while (inside(tr, tc)) {
  if (board[tr][tc]) {                      // yolda bir taş var
    if (rakipse) yeme hamlesini ekle
    break                                   // onun içinden geçemez
  }
  hamleyi ekle, sonra bir kare daha ilerle
}
```

**Yeni parçalar:**

- **`while (koşul) { ... }`**: koşul doğru olduğu sürece tekrar eder. Burada: kare tahtanın içinde olduğu sürece.
- **`break`**: döngüden hemen çıkar. Yolda bir taş bulunca o yönde daha fazla gidilmez.
- **`if (board[tr][tc])`**: karede bir şey varsa (boş yazı `''` "yok" sayılır, `'bN'` gibi dolu yazı "var").
- **`let` ile değişen konum:** `tr` ve `tc` her turda `tr += dr` ile bir kare daha ilerler (`+=` "üstüne ekle").
  Bu yüzden `const` değil `let` ile yazılır.
- **`[...STRAIGHT, ...DIAGONAL]`**: üç nokta (`...`) iki listenin elemanlarını tek bir yeni listeye döker; 4 + 4 = 8
  yön.
- Zincirli seçim: `kind === 'R' ? STRAIGHT : kind === 'B' ? DIAGONAL : [...]` → kale ise düz, fil ise çapraz, değilse
  (vezir) hepsi.

Kale dört düz yönü, fil dört çaprazı, vezir sekizini kullanır: vezir gerçekten kale ile filin toplamıdır ve kod da
tam bunu söyler.

Başlangıçta kayan taşların hiç hamlesi yoktur: her biri kendi taşlarıyla kapalıdır.

# --task--

1. Add `STRAIGHT` and `DIAGONAL` (four directions each).
2. In `pseudoMoves`, rooks slide in the straight directions, bishops in the diagonal ones and queens in both, stopping before
   their own pieces and on (capturing) enemy pieces. Update the comment above `pseudoMoves`: it now covers every piece's
   pattern, not just the knights and kings.

# --task-tr--

1. `const KING = [...]` satırının altına iki yön listesi ekle:

   ```js
   const STRAIGHT = [[1, 0], [-1, 0], [0, 1], [0, -1]]
   const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
   ```

2. `pseudoMoves`'un üstündeki yorumu değiştir, artık bütün taşları kapsıyor:

   ```js
   // Every move that follows the pieces' patterns. (Check comes later: for now even a king can be taken.)
   ```

3. `pseudoMoves` içinde, at-şah bloğunun (`if (kind === 'N' || kind === 'K') { ... }`) kapanış `}`'inin hemen altına
   kayan taşların bloğunu ekle. Döngünün içi şöyle olmalı:

   ```js
         const kind = piece[1]
         if (kind === 'N' || kind === 'K') {
           for (const [dr, dc] of kind === 'N' ? KNIGHT : KING) {
             const tr = r + dr
             const tc = c + dc
             if (inside(tr, tc) && board[tr][tc][0] !== color) add(r, c, tr, tc)
           }
         }
         if (kind === 'R' || kind === 'B' || kind === 'Q') {                                // ← yeni
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
         }                                                                                   // ← yeni blok bitti
       }
     }
     return moves
   ```

4. **Çalıştır**'a bas. Piyonlar henüz oynamıyor (sonraki adım), ama b1'deki atı oynatıp sıra tekrar beyaza
   gelince a1'deki kale boşalan kareye kayabilmeli. Alttaki kontrollerin hepsi yeşil olmalı. Sayfa donarsa `tr += dr`
   ve `tc += dc` satırlarını kontrol et; yoksa `while` hiç bitmez.

# --tests--

On an empty board a rook should have 14 moves, a bishop 13 and a queen 27 from the middle.
tr: Boş bir tahtada ortadan bir kalenin 14, bir filin 13, bir vezirin 27 hamlesi olmalı.

```js
const empty = () => Array.from({ length: 8 }, () => Array(8).fill(''))
for (const [piece, count] of [['wR', 14], ['wB', 13], ['wQ', 27]]) {
  board = empty()
  board[4][3] = piece
  assert.lengthOf(pseudoMoves('w'), count, piece)
}
```

A sliding piece should stop at the first piece in its way, taking it if it is an enemy.
tr: Kayan bir taş yolundaki ilk taşta durmalı, rakipse onu almalı.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[4][0] = 'wR'
board[4][3] = 'bN' // three squares to the right
board[1][0] = 'wP' // three squares up
const to = pseudoMoves('w').filter((m) => m.from.join() === '4,0').map((m) => m.to.join()).sort()
assert.deepEqual(to, ['2,0', '3,0', '4,1', '4,2', '4,3', '5,0', '6,0', '7,0'])
```

At the start the rooks, bishops and queens should be boxed in.
tr: Başta kaleler, filler ve vezirler kapalı olmalı.

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

// Every move that follows the pieces' patterns. (Check comes later: for now even a king can be taken.)
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
