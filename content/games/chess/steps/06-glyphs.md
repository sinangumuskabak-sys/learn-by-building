---
title: Draw the pieces
title_tr: Taşları çiz
skills: [game.canvas]
---

# --goal--

The pieces are drawn as text: Unicode has chess symbols (`♚ ♛ ♜ ♝ ♞ ♟`). An object `GLYPHS` gives the symbol for each
kind; after painting a square, `draw` writes the symbol of the piece on it, white or black.

# --goal-tr--

Taşları resim olarak değil, **yazı** olarak çizeceğiz: bilgisayarın harf takımında (Unicode) satranç sembolleri var:
`♚ ♛ ♜ ♝ ♞ ♟`. Her taş türüne bir sembol eşleyen bir **sözlük** yapacağız. `draw` her kareyi boyadıktan sonra, karede
taş varsa sembolünü karenin **tam ortasına** yazacak; beyazsa beyaz, siyahsa siyah renkle.

# --code--

```js
const GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' }

      ctx.fillRect(x, y, SQ, SQ)
      const piece = board[r][c]
      if (piece) {
        ctx.font = '44px serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
        ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
      }
```

# --meaning--

- `GLYPHS` is an object: `name: value` pairs. `GLYPHS['N']` is `'♞'`.
- `if (piece)` is true when the square is not `''`.
- `font`, `textAlign = 'center'` and `textBaseline = 'middle'` put the text's center on the given point.
- `fillText(text, x, y)` writes it; `x + SQ / 2` is the middle of the square, `+ 3` nudges the symbol down to look
  centered.

# --meaning-tr--

- `const GLYPHS = { K: '♚', ... }` → bir **nesne** (object): `ad: değer` çiftleri. `GLYPHS['N']` → `'♞'`. Sözlükte
  bir kelimeye bakmak gibi. İki taraf da aynı dolu sembolleri kullanacak, yalnız rengi farklı olacak.
- `const piece = board[r][c]` → bu karedeki taş (`'wN'` gibi) ya da `''`.
- `if (piece) {` → boş metin `''` "yanlış" sayılır; yani **karede taş varsa** içeriyi yap.
- `ctx.font = '44px serif'` → yazı boyu ve yazı tipi.
- `textAlign = 'center'`, `textBaseline = 'middle'` → yazının **ortası** verilen noktaya gelsin (yatay ve dikey).
- `piece[0] === 'w' ? '#f8fafc' : '#0f172a'` → beyaz taş kırık beyaz, siyah taş lacivert-siyah.
- `ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)` → türün sembolünü yazar. `x + SQ / 2` karenin
  ortası; `+ 3` sembol gözle ortalı dursun diye onu biraz aşağı iter.

# --task--

1. Under the `TOP` line write `GLYPHS`.
2. In `draw`, right under `ctx.fillRect(x, y, SQ, SQ)` (inside both loops) write the piece lines.

# --task-tr--

1. `const TOP = 56 ...` satırının hemen **altına** `GLYPHS` satırını yaz. Sembolleri buradan kopyalayabilirsin.
2. `draw` içinde, iki döngünün içindeki `ctx.fillRect(x, y, SQ, SQ)` satırının hemen **altına** taşı çizen satırları
   yaz (içteki döngünün kapanan `}`'inden önce).
3. **Çalıştır**: taşlar başlangıç yerlerinde görünmeli. Beyazlar açık karelerde biraz soluk; onu sonraki adımda
   düzelteceğiz.

# --predict--

The board is painted first and the pieces in the same loop. Will a later square cover a piece?
- [ ] Yes, the piece on the left disappears
- [x] No
  Each piece is written right after its own square, and the next square is beside it, not on top of it.
- [ ] Only the white pieces

# --predict-tr--

Kareler ve taşlar aynı döngüde çiziliyor. Sonraki bir kare, bir taşın üstünü örter mi?
- [ ] Evet, soldaki taş kaybolur
- [x] Hayır
  Her taş kendi karesinden hemen sonra yazılır; sonraki kare onun **yanına** çizilir, üstüne değil.
- [ ] Yalnız beyaz taşları örter

# --tests--

Each of the 32 pieces should be drawn with its symbol.
tr: 32 taşın her biri sembolüyle çizilmeli.

```js
const glyphs = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(glyphs, 32)
assert.strictEqual(glyphs.filter((c) => c.args[0] === '♚').length, 2)
assert.strictEqual(glyphs.filter((c) => c.args[0] === '♟').length, 16)
```

The white queen should be white, in the middle of d1.
tr: Beyaz vezir beyaz renkte, d1'in ortasında olmalı.

```js
const queen = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '♛' && c.args[2] === 479)
assert.strictEqual(queen.args[1], 212)
assert.strictEqual(queen.fill, '#f8fafc')
const black = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '♛' && c.args[2] === 87)
assert.strictEqual(black.fill, '#0f172a')
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
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
        ctx.fillText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
      }
    }
  }
}

reset()
draw()
```
