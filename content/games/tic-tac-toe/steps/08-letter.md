---
title: Write an X
title_tr: Bir X yaz
skills: [game.canvas]
---

# --goal--

Marks are big letters. We set a font, say that the point we give is the **middle** of the text, and write a pink
`X` in the middle of the top-left cell, at (50, 50).

# --goal-tr--

X ve O'yu **büyük harfler** olarak çizeceğiz. Canvas'a yazı yazmak da çizim gibidir: önce yazı tipini ve rengi
seçersin, sonra yazıyı bir noktaya koyarsın.

Bu adımda sol üst kutunun tam ortasına, yani (50, 50) noktasına pembe bir **X** yazıyoruz. Önce denemek için.

# --code--

```js
  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#f38ba8'
  ctx.fillText('X', 50, 50)
}
```

# --meaning--

- `ctx.font` sets the font: bold, 64 pixels, a plain sans-serif face.
- `textAlign = 'center'` and `textBaseline = 'middle'` make the given point the middle of the text, so a cell's
  center is all we need.
- `fillText('X', 50, 50)` writes the text at that point.

# --meaning-tr--

- `ctx.font = 'bold 64px sans-serif'` → yazı tipi: kalın (**bold**), 64 piksel boyunda, sade bir yazı tipi.
- `ctx.textAlign = 'center'` → verilen x, yazının **yatay ortası** olsun.
- `ctx.textBaseline = 'middle'` → verilen y, yazının **dikey ortası** olsun. Bu ikisi sayesinde bir kutunun
  ortasını vermek yeter; harf kendiliğinden ortalanır.
- `ctx.fillStyle = '#f38ba8'` → pembe renk.
- `ctx.fillText('X', 50, 50)` → `'X'` yazısını (50, 50) noktasına yazar. Sol üst kutu 0–100 arası; ortası 50.
- Sondaki `}` yeni satır değil: `draw` fonksiyonunun kapanışı. Yeni satırlar onun **üstüne** gelir.

# --task--

Inside `draw`, after the loop's closing `}` and before the function's last `}`, leave an empty line and write the
five lines. Press **Run**.

# --task-tr--

1. `draw` fonksiyonunun içinde, döngünün kapanan `}` işaretinin **altına** bir boş satır bırak.
2. Beş satırı fonksiyonun son `}` işaretinin **üstüne**, iki boşluk içeriden yaz.
3. **Çalıştır**: sol üst kutuda pembe, kocaman bir X görmelisin.

# --hint--

The lines must be inside `draw` (above its last `}`), otherwise the X is drawn only once, or before the background.

# --hint-tr--

Satırlar `draw`'un **içinde** (son `}` işaretinin üstünde) olmalı. Dışarıda kalırsa X yanlış zamanda çizilir.

# --try--

Remove the `textAlign` line and run: the X moves right, because 50 is now its left edge. Put the line back.

# --try-tr--

`textAlign` satırını sil ve çalıştır: X sağa kayar, çünkü 50 artık harfin sol kenarı. Sonra satırı geri yaz.

# --tests--

A pink X should be written in the middle of the top-left cell.
tr: Sol üst kutunun ortasına pembe bir X yazılmalı.

```js
const texts = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(texts, 1)
assert.deepEqual(texts[0].args.slice(0, 3), ['X', 50, 50])
assert.strictEqual(texts[0].fill, '#f38ba8')
assert.strictEqual(texts[0].font, 'bold 64px sans-serif')
```

The text should be centered on the point it is given.
tr: Yazı verilen noktaya ortalanmalı.

```js
assert.strictEqual(ctx.textAlign, 'center')
assert.strictEqual(ctx.textBaseline, 'middle')
```

# --solution--

```js
// Tic-tac-toe, step by step.
// The page already has <canvas id="game" width="300" height="300"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 100

let board = ['', '', '', '', '', '', '', '', '']

function draw() {
  ctx.fillStyle = '#1e1e2e'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#585b70'
  for (let i = 1; i < 3; i++) {
    ctx.fillRect(i * CELL - 2, 0, 4, canvas.height)
    ctx.fillRect(0, i * CELL - 2, canvas.width, 4)
  }

  ctx.font = 'bold 64px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#f38ba8'
  ctx.fillText('X', 50, 50)
}

draw()
```
