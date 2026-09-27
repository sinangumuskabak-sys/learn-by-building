---
title: Six rows of five
title_tr: Beşerli altı satır
skills: [game.canvas]
---

# --explanation--

The whole game happens on a grid of 6 rows (one for each try) and 5 columns (one for each letter). Everything about its
layout comes from a few numbers: the tile `SIZE`, the `GAP` between tiles, and where the grid starts.

To center the grid, work out how wide it is and split what is left over:

```js
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2   // 5 tiles, 4 gaps between them
```

Then tile `i` of row `row` is at `LEFT + i * (SIZE + GAP)` across and `TOP + row * (SIZE + GAP)` down. Change `SIZE` and
the whole grid rearranges itself, which is why layouts are written as formulas instead of fixed positions.

Empty tiles are just outlines: `strokeRect` draws the border of a rectangle without filling it.

# --explanation-tr--

Bütün oyun 6 satırlık (her deneme için bir) ve 5 sütunluk (her harf için bir) bir ızgarada geçer. Yerleşimiyle ilgili her şey
birkaç sayıdan gelir: döşeme boyutu `SIZE`, döşemeler arasındaki boşluk `GAP` ve ızgaranın nerede başladığı.

Izgarayı ortalamak için ne kadar geniş olduğunu hesapla ve kalanı ikiye böl:

```js
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2   // 5 döşeme, aralarında 4 boşluk
```

Sonra `row` satırının `i`. döşemesi yatayda `LEFT + i * (SIZE + GAP)`'de, dikeyde `TOP + row * (SIZE + GAP)`'dedir. `SIZE`'ı
değiştir, bütün ızgara kendini yeniden düzenler; yerleşimlerin sabit konumlar yerine formül olarak yazılmasının nedeni budur.

Boş döşemeler yalnızca çerçevedir: `strokeRect` bir dikdörtgenin kenarını doldurmadan çizer.

# --task--

1. Add `TRIES = 6`, `SIZE = 56`, `GAP = 6`, `TOP = 12` and `LEFT` as above.
2. Every frame fill the canvas with `'#18181b'` and draw an outline for each of the 30 tiles with `strokeRect`, 1 pixel
   inside the tile (`x + 1, y + 1, SIZE - 2, SIZE - 2`), in `'#3f3f46'` with a `lineWidth` of 2.

# --task-tr--

1. `TRIES = 6`, `SIZE = 56`, `GAP = 6`, `TOP = 12` ve yukarıdaki gibi `LEFT` ekle.
2. Her karede canvas'ı `'#18181b'` ile doldur ve 30 döşemenin her biri için `strokeRect` ile döşemenin 1 piksel içinden
   (`x + 1, y + 1, SIZE - 2, SIZE - 2`) `'#3f3f46'` renkte, `lineWidth` 2 olan bir çerçeve çiz.

# --tests--

The grid should be centered.
tr: Izgara ortalanmış olmalı.

```js
assert.strictEqual(LEFT, 28)
```

Every tile should be drawn as an outline.
tr: Her döşeme bir çerçeve olarak çizilmeli.

```js
$.tick(1)
const boxes = $.screen().filter((c) => c.op === 'strokeRect').map((c) => c.args)
assert.lengthOf(boxes, 30)
assert.deepEqual(boxes[0], [29, 13, 54, 54])
assert.deepEqual(boxes[4], [29 + 4 * 62, 13, 54, 54])
assert.deepEqual(boxes[29], [29 + 4 * 62, 13 + 5 * 62, 54, 54])
```

# --seed--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
```

# --solution--

```js
// Word guessing game, step by step.
// The page already has <canvas id="game" width="360" height="560"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const TRIES = 6
const SIZE = 56 // one letter tile
const GAP = 6
const LEFT = (canvas.width - 5 * SIZE - 4 * GAP) / 2
const TOP = 12

function draw() {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < TRIES; row++) {
    for (let i = 0; i < 5; i++) {
      const x = LEFT + i * (SIZE + GAP)
      const y = TOP + row * (SIZE + GAP)
      ctx.strokeStyle = '#3f3f46'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2)
    }
  }
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
