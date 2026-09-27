---
title: The board and the pieces
title_tr: Tahta ve taşlar
skills: [prog.arrays, game.canvas]
---

# --explanation--

A chess board is an 8 by 8 grid, and each square is empty or holds one piece. Store each piece as a short string: its
**color** and its **kind**, like `'wN'` (white knight) or `'bQ'` (black queen). An empty square is `''`. Then
`piece[0]` is the color and `piece[1]` the kind, and comparing pieces is just comparing strings.

The starting position is easiest to write the way chess players do: one string per row, capitals for white, small letters
for black, dots for empty squares.

```js
'rnbqkbnr'   // row 0: black's back rank, at the top
'PPPPPPPP'   // row 6: white's pawns
```

The pieces are drawn with chess symbols from Unicode (`♚ ♛ ♜ ♝ ♞ ♟`). The same filled symbols are used for both sides,
colored white or black. White pieces also get a dark outline so they stand out on light squares: the outline is drawn
**first** and the white fill on top, otherwise the outline would cover the thin parts of the symbol.

# --explanation-tr--

Satranç tahtası 8'e 8 bir ızgaradır ve her kare boştur ya da bir taş tutar. Her taşı kısa bir metin olarak sakla: **rengi** ve
**türü**, `'wN'` (beyaz at) ya da `'bQ'` (siyah vezir) gibi. Boş bir kare `''`'dir. O zaman `piece[0]` renk, `piece[1]` türdür ve
taşları karşılaştırmak yalnızca metinleri karşılaştırmaktır.

Başlangıç konumu en kolay satranççıların yazdığı gibi yazılır: her satır için bir metin, beyaz için büyük harf, siyah için küçük
harf, boş kareler için nokta.

```js
'rnbqkbnr'   // 0. satır: siyahın arka sırası, en üstte
'PPPPPPPP'   // 6. satır: beyazın piyonları
```

Taşlar Unicode'daki satranç simgeleriyle (`♚ ♛ ♜ ♝ ♞ ♟`) çizilir. İki taraf için de aynı dolu simgeler kullanılır, beyaz ya da
siyaha boyanır. Beyaz taşlar açık karelerde belirgin olsun diye ayrıca koyu bir çerçeve alır: çerçeve **önce** çizilir, beyaz dolgu
üstüne gelir; yoksa çerçeve simgenin ince kısımlarını örterdi.

# --task--

1. Add `SQ = 56`, `LEFT = 16`, `TOP = 56`, `GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }` and the `START`
   rows from the solution.
2. `reset()` builds `board` from `START`: `''` for a dot, otherwise `'w'` or `'b'` (capital or not) followed by the letter in
   capitals.
3. Draw every frame: a `'#1c1917'` background and the 64 squares from `(LEFT, TOP)`, `'#e7d8b8'` when `row + col` is even and
   `'#b58863'` otherwise. Draw each piece's glyph centered in its square (`'44px serif'`, at `y + SQ / 2 + 3` with a
   `'middle'` baseline): white pieces first get a `'#0f172a'` outline (`strokeText`, `lineWidth` 3), then every piece is filled,
   `'#f8fafc'` for white and `'#0f172a'` for black.

# --task-tr--

1. `SQ = 56`, `LEFT = 16`, `TOP = 56`, `GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }` ve çözümdeki `START`
   satırlarını ekle.
2. `reset()`, `START`'tan `board`'u kurar: nokta için `''`, değilse `'w'` ya da `'b'` (büyük harf mi değil mi) ve ardından büyük
   harfle harf.
3. Her karede çiz: `'#1c1917'` bir arka plan ve `(LEFT, TOP)`'tan 64 kare; `row + col` çiftse `'#e7d8b8'`, değilse `'#b58863'`.
   Her taşın simgesini karesinde ortalı çiz (`'44px serif'`, `'middle'` taban çizgisiyle `y + SQ / 2 + 3`'te): beyaz taşlar önce
   `'#0f172a'` bir çerçeve (`strokeText`, `lineWidth` 3) alır, sonra her taş doldurulur; beyaz için `'#f8fafc'`, siyah için
   `'#0f172a'`.

# --tests--

The board should start in the starting position.
tr: Tahta başlangıç konumunda başlamalı.

```js
assert.deepEqual(board[7], ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'])
assert.deepEqual(board[0], ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'])
assert.deepEqual(board[6], Array(8).fill('wP'))
assert.deepEqual(board[3], Array(8).fill(''))
```

The squares should alternate, with a light square in the top left corner.
tr: Kareler sırayla değişmeli, sol üst köşede açık bir kare olmalı.

```js
$.tick(1)
const light = $.rects('#e7d8b8')
assert.lengthOf(light, 32)
assert.lengthOf($.rects('#b58863'), 32)
assert.deepEqual([light[0].x, light[0].y, light[0].w], [16, 56, 56])
```

Each piece should be drawn with its glyph in its square.
tr: Her taş karesinde simgesiyle çizilmeli.

```js
$.tick(1)
const glyphs = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(glyphs, 32)
assert.strictEqual(glyphs.filter((c) => c.args[0] === '♚').length, 2)
const queen = glyphs.find((c) => c.args[0] === '♛' && c.args[2] === 479)
assert.strictEqual(queen.args[1], 212, 'the white queen on d1')
assert.strictEqual(queen.fill, '#f8fafc')
const outlines = $.screen().filter((c) => c.op === 'strokeText')
assert.lengthOf(outlines, 16, 'only the white pieces get an outline')
const calls = $.screen()
const first = calls.findIndex((c) => c.op === 'strokeText')
assert.strictEqual(calls.slice(first).find((c) => c.op === 'fillText').args[1], outlines[0].args[1], 'outline first, then the fill')
```

# --seed--

```js
// Chess, step by step.
// The page already has <canvas id="game" width="480" height="520"></canvas>.
// Write your code below.
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

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
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
