---
title: The number on the tile
title_tr: Taşın üstündeki sayı
skills: [game.canvas]
---

# --goal--

Now the tile gets its number, dark and bold, right in the middle.

# --goal-tr--

Taşın **numarası** olmalı. Koyu, kalın bir sayı, tam ortada.

Yazı yazmak da çizim gibi: önce renk, yazı tipi ve hiza, sonra `fillText`. Bu kez yazıyı **iki yönde de** ortalayacağız.

# --code--

```js
function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}
```

# --meaning--

- `textAlign = 'center'` centers the text left to right, `textBaseline = 'middle'` top to bottom.
- `x + SIZE / 2, y + SIZE / 2` is the middle of the tile; `+ 2` nudges it down a little, which looks more centered.
- `String(number)` turns the number into text.

# --meaning-tr--

- `ctx.fillStyle = '#1c1917'` → koyu yazı rengi. `ctx.font = 'bold 36px sans-serif'` → kalın, 36 piksel.
- `ctx.textAlign = 'center'` → yazının **yatay ortası** verilen x'e gelir.
- `ctx.textBaseline = 'middle'` → yazının **dikey ortası** verilen y'ye gelir.
- `x + SIZE / 2, y + SIZE / 2` → taşın tam ortası (kenarın yarısı: 45 piksel). `+ 2` → rakamlar göze biraz yukarıda
  durduğu için 2 piksel aşağı iteriz.
- `String(number)` → sayıyı **yazıya** çevirir: `1` → `'1'`. `fillText` yazı bekler.

# --task--

In `drawTile`, under the `fillRect` line, write the five lines. Press **Run**.

# --task-tr--

`drawTile` içinde `ctx.fillRect(x, y, SIZE, SIZE)` satırının altına beş satırı yaz. **Çalıştır**: turuncu taşın
ortasında `1` görmelisin.

# --tests--

The tile's number should be written in its middle.
tr: Taşın numarası ortasına yazılmalı.

```js
draw()
const t = $.screen().filter((c) => c.op === 'fillText')
assert.lengthOf(t, 1)
assert.deepEqual(t[0].args, ['1', 56, 107])
assert.strictEqual(t[0].font, 'bold 36px sans-serif')
```

# --solution--

```js
// Sliding puzzle, step by step.
// The page already has <canvas id="game" width="400" height="460"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const N = 4 // 4 by 4: tiles 1 to 15 and one gap
const SIZE = 90
const GAP = 6
const LEFT = (canvas.width - N * SIZE - (N - 1) * GAP) / 2
const TOP = 60

let tiles // tiles[position] is the number on that square, 0 for the gap; positions go row by row

const rowOf = (i) => Math.floor(i / N)
const colOf = (i) => i % N

function reset() {
  tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
}

function squareX(i) {
  return LEFT + colOf(i) * (SIZE + GAP)
}
function squareY(i) {
  return TOP + rowOf(i) * (SIZE + GAP)
}

function drawTile(number, x, y) {
  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(x, y, SIZE, SIZE)
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(number), x + SIZE / 2, y + SIZE / 2 + 2)
}

function draw() {
  ctx.fillStyle = '#292524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawTile(1, squareX(0), squareY(0))
}

reset()
draw()
```
