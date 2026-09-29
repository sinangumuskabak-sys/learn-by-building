---
title: Clicks on any screen size
title_tr: Her ekran boyunda tıklama
skills: [game.input]
---

# --goal--

The canvas is 300 pixels inside, but the page may show it bigger or smaller (on a phone, or in a wide panel). We
scale the click by `canvas.width / rect.width` so it always lands in the right cell.

# --goal-tr--

Canvas'ın içi 300 piksel, ama sayfa onu ekranda **daha büyük ya da küçük** gösterebilir: telefonda küçülür, geniş bir
panelde büyür. Bir fotoğrafı büyütmek gibi: resim aynı, sadece ekrandaki boyu farklı.

Bu durumda tıklamayı **ölçeklemek** gerekir. Bu adımı atlamak çok yaygın bir hatadır: kendi ekranında her şey doğru
çalışır, telefonda tıklamalar yanlış kutuya düşer.

# --code--

```js
// The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
const y = (event.clientY - rect.top) * (canvas.height / rect.height)
```

# --meaning--

- `rect.width` is the size the canvas is shown at; `canvas.width` is its real size (300).
- If it is shown at 600 pixels, `300 / 600` is `0.5`: a click 400 pixels in becomes 200, the right cell.
- The parentheses make the subtraction happen before the multiplication.

# --meaning-tr--

- `rect.width` → canvas'ın ekranda **gösterildiği** en. `canvas.width` → gerçek eni (300).
- `canvas.width / rect.width` → oran. Canvas 600 piksel gösteriliyorsa 300 / 600 = **0.5**. Soldan 400 piksele
  tıklamak, canvas'ın içinde 400 × 0.5 = **200** demek: doğru kutu.
- Aynı boyda gösteriliyorsa oran 1'dir; hiçbir şey bozulmaz.
- `( ... ) * ( ... )` → parantezler önce hesaplanır: önce çıkarma, sonra çarpma.
- `//` ile başlayan satır bir **yorum**: neden böyle yaptığımızı anlatan not. Bilgisayar okumaz; yazmasan da olur.

# --task--

Change the `x` and `y` lines as shown and add the comment line above `const rect`. Press **Run**.

# --task-tr--

1. `const rect = ...` satırının üstüne yorum satırını yaz.
2. `x` satırında `event.clientX - rect.left` kısmını paranteze al ve sonuna `* (canvas.width / rect.width)` ekle.
3. `y` satırında aynısını `height` ile yap.
4. **Çalıştır**: oyun aynı çalışmalı. Fark, canvas farklı boyda gösterildiğinde ortaya çıkar; kontrol onu dener.

# --predict--

The canvas is shown at 600×600 on a big screen, and you click near its right edge (590 pixels in). Without scaling,
where would the click land?
- [ ] In the top-right cell, correctly
- [x] Nowhere: `Math.floor(590 / 100)` is column 5, which does not exist
  Scaling turns 590 into 295, which is column 2, the right one.
- [ ] In the top-left cell

# --predict-tr--

Büyük bir ekranda canvas 600×600 gösteriliyor ve sağ kenarına yakın (590 piksel içeri) tıklıyorsun. Ölçekleme
olmasaydı tıklama nereye düşerdi?
- [ ] Doğru şekilde sağ üst kutuya
- [x] Hiçbir yere: `Math.floor(590 / 100)` = 5. sütun, böyle bir sütun yok
  Ölçekleme 590'ı 295 yapar: 2. sütun, yani doğru kutu.
- [ ] Sol üst kutuya

# --hint--

Put `event.clientX - rect.left` in parentheses, otherwise only `rect.left` gets multiplied.

# --hint-tr--

`event.clientX - rect.left` kısmını paranteze almayı unutma; yoksa çarpma yalnız `rect.left`'e uygulanır.

# --tests--

Clicks should be scaled when the canvas is displayed at a different size.
tr: Canvas farklı boyda gösterildiğinde tıklamalar ölçeklenmeli.

```js
// Pretend the canvas is shown twice as big, starting 10px from the left of the page.
$.canvas.getBoundingClientRect = () => ({ left: 10, top: 0, x: 10, y: 0, width: 600, height: 600, right: 610, bottom: 600 })
$.click(10 + 590, 10)
assert.strictEqual(board[2], 'X', 'a click near the right edge of the big canvas is the top-right cell')
$.click(10 + 300, 590)
assert.strictEqual(board[7], 'O', 'a click at the bottom middle of the big canvas is cell 7')
```

Clicks should still work at the normal size.
tr: Normal boyda tıklamalar yine çalışmalı.

```js
$.click(150, 150)
assert.strictEqual(board[4], 'X')
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
let player = 'X'

function play(index) {
  if (board[index] !== '') return false
  board[index] = player
  player = player === 'X' ? 'O' : 'X'
  return true
}

canvas.addEventListener('click', (event) => {
  // The canvas may be displayed at a different size than its 300×300 pixels, so scale the click.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const index = Math.floor(y / CELL) * 3 + Math.floor(x / CELL)
  play(index)
  draw()
})

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
  board.forEach((mark, index) => {
    if (mark === '') return
    ctx.fillStyle = mark === 'X' ? '#f38ba8' : '#89b4fa'
    const x = (index % 3) * CELL + CELL / 2
    const y = Math.floor(index / 3) * CELL + CELL / 2
    ctx.fillText(mark, x, y)
  })
}

draw()
```
