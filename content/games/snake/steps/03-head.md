---
title: Keep the game in variables, draw from them
title_tr: Oyunu değişkenlerde tut, onlardan çiz
skills: [game.state, prog.functions]
---

# --explanation--

The square is painted at a fixed spot. To make it move, its position has to live in **data** that can change, and
the drawing code has to read that data every time it paints.

This split is the most important idea in game programming:

- **State**: what is true about the game right now (where the snake is, the score...). Plain variables and objects.
- **Drawing**: a function that looks at the state and paints it. It never decides anything; it only shows.

An object groups the two numbers that describe one position:

```js
let head = { x: 5, y: 5 }   // column and row
head.x                      // 5
```

We use `let` because the head will be replaced or changed later. A `draw()` function repaints the **whole** picture
each time: background first, then everything on top.

# --explanation-tr--

Kare sabit bir yere boyanıyor. Hareket etmesi için konumunun değişebilen bir **veride** yaşaması ve çizim kodunun
her boyamada o veriyi okuması gerekir.

Bu ayrım oyun programlamanın en önemli fikridir:

- **Durum (state)**: oyunda şu an doğru olan her şey (yılan nerede, skor kaç...). Düz değişkenler ve nesneler.
- **Çizim**: durumu okuyup boyayan bir fonksiyon. Hiçbir şeye karar vermez, yalnızca gösterir.

Bir nesne, tek bir konumu anlatan iki sayıyı bir arada tutar:

```js
let head = { x: 5, y: 5 }   // sütun ve satır
head.x                      // 5
```

Baş ileride değişeceği için `let` kullanıyoruz. `draw()` fonksiyonu her seferinde resmin **tamamını** yeniden
boyar: önce arka plan, sonra üstündeki her şey.

# --task--

1. Add `let head = { x: 5, y: 5 }` after `CELL`.
2. Move the two painting parts (background and lime square) into a function named `draw`. The square must use
   `head.x` and `head.y` instead of the fixed `5`.
3. Call `draw()` once at the end.

# --task-tr--

1. `CELL`'den sonra `let head = { x: 5, y: 5 }` ekle.
2. İki boyama kısmını (arka plan ve lime kare) `draw` adlı bir fonksiyonun içine taşı. Kare sabit `5` yerine
   `head.x` ve `head.y` kullanmalı.
3. En sonda `draw()` fonksiyonunu bir kez çağır.

# --tests--

`head` should start as `{ x: 5, y: 5 }`.
tr: `head` başlangıçta `{ x: 5, y: 5 }` olmalı.

```js
assert.deepEqual(head, { x: 5, y: 5 })
```

`draw` should be a function.
tr: `draw` bir fonksiyon olmalı.

```js
assert.isFunction(draw)
```

`draw()` should paint the square wherever `head` is.
tr: `draw()` kareyi `head` neredeyse oraya boyamalı.

```js
head = { x: 2, y: 7 }
draw()
assert.deepEqual($.rects('lime'), [{ x: 40, y: 140, w: 20, h: 20, color: 'lime' }])
```

`draw()` should repaint the background first, so old squares disappear.
tr: `draw()` önce arka planı yeniden boyamalı ki eski kareler silinsin.

```js
head = { x: 9, y: 9 }
draw()
assert.lengthOf($.rects('lime'), 1)
```

# --solution--

```js
// Snake, step by step.
// The page already has <canvas id="game" width="400" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const CELL = 20
let head = { x: 5, y: 5 }

function draw() {
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'lime'
  ctx.fillRect(head.x * CELL, head.y * CELL, CELL, CELL)
}

draw()
```
