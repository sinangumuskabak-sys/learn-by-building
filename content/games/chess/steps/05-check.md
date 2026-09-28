---
title: Check and legal moves
title_tr: Şah ve yasal hamleler
skills: [prog.functions, game.state]
---

# --explanation--

The one rule that makes chess chess: **you may never leave your own king in check.** A move that follows the piece's
pattern is only **legal** if, after it, your king is not attacked.

First, "is this square attacked?". Instead of generating all the enemy's moves, look **outwards from the square**: a knight
jump away, is there an enemy knight? Sliding straight, is the first piece an enemy rook or queen? Diagonally, a bishop or
queen? One step diagonally forward (from the enemy's side), a pawn? Next to it, the king? It is the move patterns used
backwards.

Then the trick for legality is to **try each move and take it back**:

```js
const undo = makeMove(m)      // play it on the board
const safe = !inCheck(color)  // is my king attacked now?
undoMove(undo)                // put everything back exactly
```

`makeMove` returns everything needed to undo the move (the piece that moved, what was captured). Being able to take a move
back exactly is also what the computer player will need to think ahead.

This handles pinned pieces, moving into check and answering a check, all with one rule.

# --explanation-tr--

**Bu adımda:** satranca asıl kuralını ekleyeceğiz: **kendi şahını asla tehdit altında (şahta) bırakamazsın.** Artık
bir taşa tıklayınca sadece gerçekten oynanabilecek (yasal) hamlelerin noktaları çıkacak; örneğin şahını açıkta
bırakacak bir taşın noktaları kaybolacak.

**Yasal hamle nedir?** Taşın desenine uyan bir hamle, ancak ondan sonra kendi şahın saldırı altında değilse
**yasaldır** (legal). Şimdiye kadar ürettiğimiz hamlelere "desene uyan" (pseudo) hamleler diyoruz.

**Önce: "bu kare saldırı altında mı?"** Rakibin bütün hamlelerini üretmek yerine **kareden dışarı doğru bakarız**:

- Bir at sıçraması uzakta rakip at var mı?
- Düz kayınca rastlanan ilk taş rakip kale ya da vezir mi?
- Çapraz kayınca rastlanan ilk taş rakip fil ya da vezir mi?
- Bir çapraz adım ötede (rakibin tarafından) piyon var mı? Beyaz piyon yukarı saldırır; bu yüzden karenin bir satır
  **altında** durur.
- Hemen yanında rakip şah var mı?

Bu, hamle desenlerinin **tersten** kullanılmasıdır.

**Sonra: dene ve geri al.** Yasallık için hile, her hamleyi **oynayıp geri almaktır**:

```js
const undo = makeMove(m)      // hamleyi tahtada oyna
const safe = !inCheck(color)  // şahım şimdi saldırı altında mı?
undoMove(undo)                // her şeyi tam olarak geri koy
```

`makeMove` hamleyi geri almak için gereken her şeyi döndürür: hamlenin kendisi, oynayan taş ve yenen taş (yoksa `''`).
Bir hamleyi tam olarak geri alabilmek, ileride bilgisayar oyuncusunun ileriyi düşünmesi için de gerekecek.

Bu tek kural; açmaz (pin) durumundaki taşları, şahın kendini tehdide sokmasını ve şah çekildiğinde cevap vermeyi hep
birlikte halleder.

**Yeni parçalar:**

- `for (const [list, kind] of [[KNIGHT, 'N'], [KING, 'K']])`: iki çift üzerinden döner; ilk turda `list` at
  sıçramaları ve `kind` `'N'`, ikinci turda şahınkiler ve `'K'`. Aynı kontrolü iki kez yazmamak için.
- `by + 'P'`: rengi ve türü birleştirip taş yazısını kurar (`'b' + 'P'` → `'bP'`).
- `findKing` tahtayı gezip şahın karesini `[r, c]` olarak döndürür.
- `{ m, piece, captured: board[tr][tc] }`: `{ m: m, piece: piece, ... }` kısaltması.
- `legalMoves()` `filter` ile, içindeki fonksiyon `true` döndüren hamleleri tutar.

# --task--

1. Write `attacked(r, c, by)` by looking outwards from `(r, c)` as described (a white pawn attacks upwards, so it stands one
   row **below** the square), `findKing(color)` and `inCheck(color)`.
2. Write `makeMove(m)` (move the piece, promote, switch `turn`, return `{ m, piece, captured }`) and `undoMove(undo)` that
   restores the board and `turn`.
3. Write `legalMoves()`: the side to move's pseudo moves that do not leave its own king in check. `play()` uses
   `makeMove`, and selecting a piece shows only its legal moves.

# --task-tr--

1. `pseudoMoves`'un üstündeki yorumu değiştir:

   ```js
   // Every move that follows the pieces' patterns, without checking whether it leaves the king in check.
   ```

2. `play(m)` fonksiyonunun **tamamını** (`function play(m) {` satırından kapanış `}`'ine kadar) sil ve yerine şunların
   hepsini yaz:

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
     for (const [dirs, kind] of [[STRAIGHT, 'R'], [DIAGONAL, 'B']]) {
       for (const [dr, dc] of dirs) {
         let tr = r + dr
         let tc = c + dc
         while (inside(tr, tc)) {
           const piece = board[tr][tc]
           if (piece) {
             if (piece === by + kind || piece === by + 'Q') return true
             break
           }
           tr += dr
           tc += dc
         }
       }
     }
     return false
   }

   function findKing(color) {
     for (let r = 0; r < 8; r++) {
       for (let c = 0; c < 8; c++) if (board[r][c] === color + 'K') return [r, c]
     }
   }

   function inCheck(color) {
     const [r, c] = findKing(color)
     return attacked(r, c, other(color))
   }

   // Play a move on the board, and return what is needed to take it back.
   function makeMove(m) {
     const [fr, fc] = m.from
     const [tr, tc] = m.to
     const piece = board[fr][fc]
     const undo = { m, piece, captured: board[tr][tc] }
     board[tr][tc] = m.promo ? piece[0] + m.promo : piece
     board[fr][fc] = ''
     turn = other(turn)
     return undo
   }

   function undoMove(undo) {
     const [fr, fc] = undo.m.from
     const [tr, tc] = undo.m.to
     board[fr][fc] = undo.piece
     board[tr][tc] = undo.captured
     turn = other(turn)
   }

   // The moves the side to play can really make: try each one, and keep it if its own king is not left in check.
   function legalMoves() {
     const color = turn
     return pseudoMoves(color).filter((m) => {
       const undo = makeMove(m)
       const safe = !inCheck(color)
       undoMove(undo)
       return safe
     })
   }

   function play(m) {
     makeMove(m)
     selected = null
     targets = []
   }
   ```

   Eski `play()`'in tahtayı değiştiren kısmı artık `makeMove`'da; yeni `play()` onu çağırıp seçimi temizler.

3. `clickSquare` içinde hedefleri bulan satırı değiştir:

   ```js
       targets = legalMoves().filter((m) => same(m.from, selected)) // ← değişti
   ```

4. **Çalıştır**'a bas. Oyun eskisi gibi oynanmalı, ama şahını tehlikeye atan hamlelerin noktası çıkmamalı. Alttaki
   kontrollerin hepsi yeşil olmalı. "Geri alma" kontrolü kırmızıysa `undoMove`'da `turn = other(turn)` satırını
   unutmuş olabilirsin.

# --tests--

Squares should know who attacks them.
tr: Kareler kimin saldırdığını bilmeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[3][3] = 'bP'
assert.isTrue(attacked(4, 4, 'b'), 'a black pawn attacks downwards')
assert.isFalse(attacked(2, 4, 'b'))
board[0][7] = 'bB'
assert.isTrue(attacked(5, 2, 'b'))
board[2][5] = 'wN' // now in the way of the bishop
assert.isFalse(attacked(5, 2, 'b'))
assert.isTrue(attacked(4, 4, 'w'), 'the knight on (2, 5) attacks (4, 4)')
```

A pinned piece should only move along the pin, and a king should not walk into check.
tr: Açmazdaki bir taş yalnızca açmaz boyunca gitmeli ve şah şahın içine yürümemeli.

```js
board = Array.from({ length: 8 }, () => Array(8).fill(''))
board[7][4] = 'wK'
board[6][4] = 'wR'
board[0][4] = 'bR'
board[0][0] = 'bK'
turn = 'w'
const rook = legalMoves().filter((m) => m.from.join() === '6,4').map((m) => m.to.join())
assert.sameMembers(rook, ['5,4', '4,4', '3,4', '2,4', '1,4', '0,4'])
board[6][4] = ''
board[5][3] = 'bR'
const king = legalMoves().map((m) => m.to.join())
assert.sameMembers(king, ['7,5', '6,5'], 'the files d and e are covered by the rooks')
assert.isTrue(inCheck('w'))
```

A move should be taken back exactly.
tr: Bir hamle tam olarak geri alınmalı.

```js
const before = JSON.stringify([board, turn])
let count = 0
for (const m of legalMoves()) {
  const undo = makeMove(m)
  count += legalMoves().length
  undoMove(undo)
  assert.strictEqual(JSON.stringify([board, turn]), before)
}
assert.strictEqual(count, 400, 'the classic number of positions after one move each')
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
  for (const [dirs, kind] of [[STRAIGHT, 'R'], [DIAGONAL, 'B']]) {
    for (const [dr, dc] of dirs) {
      let tr = r + dr
      let tc = c + dc
      while (inside(tr, tc)) {
        const piece = board[tr][tc]
        if (piece) {
          if (piece === by + kind || piece === by + 'Q') return true
          break
        }
        tr += dr
        tc += dc
      }
    }
  }
  return false
}

function findKing(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) if (board[r][c] === color + 'K') return [r, c]
  }
}

function inCheck(color) {
  const [r, c] = findKing(color)
  return attacked(r, c, other(color))
}

// Play a move on the board, and return what is needed to take it back.
function makeMove(m) {
  const [fr, fc] = m.from
  const [tr, tc] = m.to
  const piece = board[fr][fc]
  const undo = { m, piece, captured: board[tr][tc] }
  board[tr][tc] = m.promo ? piece[0] + m.promo : piece
  board[fr][fc] = ''
  turn = other(turn)
  return undo
}

function undoMove(undo) {
  const [fr, fc] = undo.m.from
  const [tr, tc] = undo.m.to
  board[fr][fc] = undo.piece
  board[tr][tc] = undo.captured
  turn = other(turn)
}

// The moves the side to play can really make: try each one, and keep it if its own king is not left in check.
function legalMoves() {
  const color = turn
  return pseudoMoves(color).filter((m) => {
    const undo = makeMove(m)
    const safe = !inCheck(color)
    undoMove(undo)
    return safe
  })
}

function play(m) {
  makeMove(m)
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
    targets = legalMoves().filter((m) => same(m.from, selected))
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
