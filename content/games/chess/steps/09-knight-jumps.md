---
title: The knight's jumps as data
title_tr: Atın sıçramaları veri olarak
skills: [prog.arrays, prog.functions]
---

# --goal--

Each kind of piece moves in a pattern. A knight has 8 fixed jumps, each written as `[rows, columns]`. A jump is only
possible if it lands on the board, so we also write `inside(r, c)`.

# --goal-tr--

Şimdi taşları oynatmaya hazırlanıyoruz. Her taş türü bir **desenle** gider. En basit desen atınki: **8 sabit
sıçrama** ("L" şekli). Her sıçramayı `[satır farkı, sütun farkı]` diye yazacağız: `[1, 2]` "1 sıra aşağı, 2 sütun
sağa".

Hamleleri koda `if` yığını olarak değil, böyle bir **veri listesi** olarak yazmak işi çok kolaylaştıracak.

Köşedeki bir at bazı sıçramalarda tahtanın dışına düşer. Bunu anlamak için küçük bir yardımcı da yazacağız:
`inside(r, c)` "bu kare tahtanın içinde mi?"

# --code--

```js
const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8
```

# --meaning--

- `KNIGHT` is an array of 8 small arrays: the row and column difference of each jump.
- `inside` is a short arrow function; `&&` means "and", so all four conditions must hold. It returns `true` or
  `false`.

# --meaning-tr--

- `const KNIGHT = [[1, 2], ...]` → **dizilerden oluşan bir dizi**: 8 sıçrama, her biri `[satır farkı, sütun farkı]`.
  Eksi sayı yukarı ya da sola demek: `[-2, 1]` "2 sıra yukarı, 1 sütun sağa".
- `const inside = (r, c) => ...` → iki sayı alan kısa bir **ok fonksiyonu**. `=>` sonrası doğrudan cevabıdır.
- `r >= 0 && r < 8 && c >= 0 && c < 8` → `>=` "büyük ya da eşit", `&&` "**ve**": dört koşulun **hepsi** doğruysa
  cevap `true` (doğru), biri bile yanlışsa `false` (yanlış). Satır ve sütun 0–7 arasında olmalı.

# --task--

1. Under the `START` line write `KNIGHT`.
2. Under the closing `}` of `reset`, leave an empty line and write `inside`.

# --task-tr--

1. `const START = [...]` satırının hemen **altına** `KNIGHT` satırını yaz.
2. `reset` fonksiyonunun kapanan `}`'inin **altına** bir boş satır bırakıp `inside` satırını yaz.
3. **Çalıştır**: ekran değişmez; kontroller yeşil olmalı.

# --tests--

`KNIGHT` should hold the 8 L-shaped jumps.
tr: `KNIGHT` 8 tane L biçimli sıçramayı tutmalı.

```js
assert.lengthOf(KNIGHT, 8)
for (const [dr, dc] of KNIGHT) assert.strictEqual(Math.abs(dr) * Math.abs(dc), 2, `[${dr}, ${dc}] is not an L`)
assert.lengthOf(new Set(KNIGHT.map((j) => j.join())), 8, 'no jump twice')
```

`inside` should say whether a square is on the board.
tr: `inside` bir karenin tahtada olup olmadığını söylemeli.

```js
assert.isTrue(inside(0, 0))
assert.isTrue(inside(7, 7))
assert.isFalse(inside(8, 0))
assert.isFalse(inside(3, -1))
assert.isFalse(inside(-2, 4))
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

let board // board[row][col]: '' or a color and a kind, like 'wN' or 'bQ'

function reset() {
  board = START.map((line) => [...line].map((ch) => (ch === '.' ? '' : (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase())))
}

const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8

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
