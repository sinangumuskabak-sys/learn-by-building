---
title: Two paddles
title_tr: İki raket
skills: [game.state]
---

# --explanation--

Each paddle is a small piece of state: where it is. Both paddles have the same size, so the size goes in constants and
each paddle object only holds its position:

```js
const PADDLE_W = 10
const PADDLE_H = 80
let left = { x: 20, y: 160 }
```

The right paddle should sit 20 pixels from the right edge. Its `x` is its **left** side, so it is not
`canvas.width - 20` but `canvas.width - 20 - PADDLE_W`. Getting this right once, in one place, saves you from
off-by-ten bugs later.

Now that there are several things to draw, move all drawing into one `draw()` function that repaints the whole scene
from the state, back to front: court first, paddles on top.

# --explanation-tr--

Her raket küçük bir durum parçasıdır: nerede olduğu. İki raketin boyutu aynı, bu yüzden boyut sabitlere gider ve her
raket nesnesi yalnızca konumunu tutar:

```js
const PADDLE_W = 10
const PADDLE_H = 80
let left = { x: 20, y: 160 }
```

Sağ raket sağ kenardan 20 piksel içeride durmalı. `x` onun **sol** kenarıdır; bu yüzden `canvas.width - 20` değil
`canvas.width - 20 - PADDLE_W` olur. Bunu bir kez, tek yerde doğru yapmak, sonradan çıkacak "on piksel kayma"
hatalarından kurtarır.

Artık çizilecek birden fazla şey olduğu için tüm çizimi, sahneyi durumdan arkadan öne yeniden boyayan tek bir
`draw()` fonksiyonuna taşı: önce saha, üstüne raketler.

# --task--

1. Add `const PADDLE_W = 10` and `const PADDLE_H = 80`.
2. Add `let left = { x: 20, y: 160 }` and `let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }`.
3. Move the court drawing into `function draw()`, and after it draw both paddles as `'white'` rectangles
   `PADDLE_W` × `PADDLE_H` at their positions. Call `draw()` once.

# --task-tr--

1. `const PADDLE_W = 10` ve `const PADDLE_H = 80` ekle.
2. `let left = { x: 20, y: 160 }` ve `let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }` ekle.
3. Saha çizimini `function draw()` içine taşı; ardından iki raketi konumlarında `PADDLE_W` × `PADDLE_H` boyutunda
   `'white'` dikdörtgenler olarak çiz. `draw()`'u bir kez çağır.

# --tests--

The paddles should start at the given positions.
tr: Raketler verilen konumlarda başlamalı.

```js
assert.deepEqual([PADDLE_W, PADDLE_H], [10, 80])
assert.deepEqual(left, { x: 20, y: 160 })
assert.deepEqual(right, { x: 570, y: 160 })
```

Both paddles should be drawn as white 10×80 rectangles.
tr: İki raket de beyaz 10×80 dikdörtgen olarak çizilmeli.

```js
const paddles = $.rects('white').filter((r) => r.w === 10 && r.h === 80)
assert.sameDeepMembers(paddles, [
  { x: 20, y: 160, w: 10, h: 80, color: 'white' },
  { x: 570, y: 160, w: 10, h: 80, color: 'white' },
])
```

`draw()` should draw the paddles wherever they are, over the court.
tr: `draw()` raketleri nerede olurlarsa orada, sahanın üstüne çizmeli.

```js
left.y = 0
right.y = 320
draw()
const paddles = $.rects('white').filter((r) => r.w === 10 && r.h === 80)
assert.sameDeepMembers(paddles.map((p) => p.y), [0, 320])
assert.lengthOf($.rects('white').filter((r) => r.w === 4), 14, 'the center line is still drawn')
```

# --solution--

```js
// Pong, step by step.
// The page already has <canvas id="game" width="600" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'white'
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
  }

  ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
  ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
}

draw()
```
