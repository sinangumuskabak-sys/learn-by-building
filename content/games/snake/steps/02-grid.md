---
title: Think in grid cells
title_tr: Izgara hücreleriyle düşün
skills: [game.canvas]
---

# --explanation--

Snake does not move smoothly pixel by pixel: it jumps from one **cell** of a grid to the next. So instead of thinking
in pixels, think in cells, and convert to pixels only when drawing.

With cells of 20 pixels, the 400×400 board is a 20×20 grid. The cell in column `5`, row `5` starts at pixel
`5 * 20 = 100` on both axes:

```
pixel x = column * CELL
pixel y = row * CELL
```

Putting the size in a named constant (`CELL`) instead of typing `20` everywhere means you can change it in one place
later, and the code says *why* the number is there.

# --explanation-tr--

Yılan pikselden piksele akıcı hareket etmez: bir ızgaranın bir **hücresinden** diğerine atlar. Bu yüzden piksel
yerine hücre olarak düşün, piksele yalnızca çizerken çevir.

Hücreler 20 piksel olursa 400×400 tahta 20×20'lik bir ızgaradır. `5`. sütun, `5`. satırdaki hücre iki eksende de
`5 * 20 = 100` pikselden başlar:

```
piksel x = sütun * CELL
piksel y = satır * CELL
```

Boyutu her yere `20` yazmak yerine adlı bir sabitte (`CELL`) tutmak, onu ileride tek yerden değiştirmeni sağlar ve
kod sayının *neden* orada olduğunu anlatır.

# --task--

1. Add a constant `CELL` with the value `20`.
2. After painting the background, draw one `'lime'` square exactly one cell big, in column `5`, row `5`. Use `CELL`
   for the position and the size.

# --task-tr--

1. Değeri `20` olan bir `CELL` sabiti ekle.
2. Arka planı boyadıktan sonra `5`. sütun, `5`. satıra tam bir hücre büyüklüğünde bir `'lime'` kare çiz. Konum ve
   boyut için `CELL` kullan.

# --tests--

`CELL` should be `20`.
tr: `CELL` değeri `20` olmalı.

```js
assert.strictEqual(CELL, 20)
```

A single lime 20×20 square should be drawn at pixel (100, 100).
tr: Piksel (100, 100) noktasına tek bir 20×20 lime kare çizilmeli.

```js
assert.deepEqual($.rects('lime'), [{ x: 100, y: 100, w: 20, h: 20, color: 'lime' }])
```

The square should be drawn on top of the background, not under it.
tr: Kare arka planın altına değil üstüne çizilmeli.

```js
const order = $.screen().filter((c) => c.op === 'fillRect').map((c) => c.fill)
assert.deepEqual(order, ['#111', 'lime'])
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20

ctx.fillStyle = '#111'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'lime'
ctx.fillRect(5 * CELL, 5 * CELL, CELL, CELL)
```
