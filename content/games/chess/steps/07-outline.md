---
title: An outline for white
title_tr: Beyaza bir dış çizgi
skills: [game.canvas]
---

# --goal--

White pieces fade into the light squares. Give them a dark outline: `strokeText` draws only the edge of the letters.
The outline goes first and the white fill on top, otherwise the thick line would cover the thin parts of the symbol.

# --goal-tr--

Beyaz taşlar açık karelerde kayboluyor. Onlara **koyu bir dış çizgi** çizeceğiz: `strokeText`, yazının yalnız
**kenarını** çizer.

Sıra önemli: çizgi **önce**, beyaz dolgu **sonra**. Canvas'ta sonra çizilen öncekinin üstüne gelir; 3 piksellik kalın
çizgi sonra gelseydi sembolün ince yerlerini kapatırdı.

# --code--

```js
        ctx.textBaseline = 'middle'
        // White pieces get a dark outline, drawn first so the white fill goes on top of it.
        if (piece[0] === 'w') {
          ctx.strokeStyle = '#0f172a'
          ctx.lineWidth = 3
          ctx.strokeText(GLYPHS[piece[1]], x + SQ / 2, y + SQ / 2 + 3)
        }
        ctx.fillStyle = piece[0] === 'w' ? '#f8fafc' : '#0f172a'
```

# --meaning--

- `strokeStyle` is the line color, `lineWidth` its thickness.
- `strokeText` draws the outline of the text at the same place the fill will go.
- Only white pieces get it (`piece[0] === 'w'`).

# --meaning-tr--

- `if (piece[0] === 'w') {` → yalnız **beyaz** taşlar için.
- `ctx.strokeStyle = '#0f172a'` → **çizgi** rengi (dolgu rengi `fillStyle`'dan ayrıdır).
- `ctx.lineWidth = 3` → çizgi kalınlığı: 3 piksel.
- `ctx.strokeText(...)` → sembolün yalnız **dış hattını** çizer; yeri `fillText` ile aynı, böylece dolgu tam
  üstüne oturur.

# --task--

Write the comment and the `if` block between `ctx.textBaseline = 'middle'` and the `fillStyle` line.

# --task-tr--

1. `draw` içinde `ctx.textBaseline = 'middle'` satırının **altına**, `ctx.fillStyle = piece[0] === ...` satırının
   **üstüne** yorum satırını ve `if` bloğunu yaz.
2. **Çalıştır**: beyaz taşlar artık koyu kenarlı ve net görünmeli.

# --try--

Move the `if` block below the `fillText` line and run: the white pieces look thin and dark. Put it back.

# --try-tr--

`if` bloğunu `fillText` satırının altına taşı ve çalıştır: beyaz taşlar incecik ve koyu görünür. Sonra geri al.

# --tests--

Only the 16 white pieces should get an outline.
tr: Yalnız 16 beyaz taş dış çizgi almalı.

```js
const outlines = $.screen().filter((c) => c.op === 'strokeText')
assert.lengthOf(outlines, 16)
assert.isTrue(outlines.every((c) => c.args[2] > 400), 'white stands on the two bottom rows')
```

The outline should be drawn first, then the fill on top.
tr: Önce dış çizgi, sonra üstüne dolgu çizilmeli.

```js
const calls = $.screen()
const first = calls.findIndex((c) => c.op === 'strokeText')
const fill = calls.slice(first).find((c) => c.op === 'fillText')
assert.deepEqual(fill.args, calls[first].args)
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

reset()
draw()
```
