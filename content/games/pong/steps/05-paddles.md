---
title: Two paddles
title_tr: İki raket
skills: [game.canvas, game.state]
---

# --goal--

Each paddle is a 10×80 rectangle. We keep each paddle's position in an object (`left`, `right`), 20 pixels in from its
side, and draw both from those objects.

# --goal-tr--

Her oyuncunun bir **raketi** var: 10 piksel eninde, 80 piksel boyunda bir dikdörtgen. Sol raket soldan 20 piksel
içeride, sağ raket sağdan 20 piksel içeride durur.

Raketler hareket edecek; bu yüzden konumlarını **değişebilen** bilgide tutuyoruz: her raket için bir **nesne**. Çizim de
bu nesnelere bakıyor.

# --code--

```js
const PADDLE_W = 10
const PADDLE_H = 80

let left = { x: 20, y: 160 }
let right = { x: canvas.width - 20 - PADDLE_W, y: 160 }

ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
```

# --meaning--

- `PADDLE_W` and `PADDLE_H` are the paddle's width and height.
- `{ x: 20, y: 160 }` is an object: two named values in one package. `left.x` reads the `x` inside `left`.
- The right paddle's `x` is `600 - 20 - 10 = 570`, so it is 20 pixels from the right edge.
- `y: 160` centers an 80 pixel paddle on a 400 pixel court.
- The pen is still white from the net, so no new color.

# --meaning-tr--

- `const PADDLE_W = 10`, `const PADDLE_H = 80` → raketin eni ve boyu (W: width, en; H: height, boy).
- `let left = { x: 20, y: 160 }` → bir **nesne**: iki bilgiyi tek pakette tutar. `x` soldan, `y` yukarıdan uzaklık.
  Süslü parantez paketi açıp kapatır; içinde `ad: değer` çiftleri virgülle ayrılır. `let`, çünkü raket hareket edecek.
- `canvas.width - 20 - PADDLE_W` → 600 − 20 − 10 = **570**: raketin sağ kenarı, sahanın sağından 20 piksel içeride.
- `y: 160` → (400 − 80) / 2 = 160: raket dikeyde ortada.
- `ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)` → `left.x` "sol raketin x'i". Nokta, paketin içinden bir bilgiyi
  okur.
- Renk seçmedik: kalem fileden beri hâlâ beyaz.

# --task--

1. Under `const ctx = ...`, leave an empty line and write the two sizes, then after an empty line the two paddles.
2. At the very end, leave an empty line and write the two `fillRect` lines. Press **Run**.

# --task-tr--

1. `const ctx = ...` satırının altına bir boş satır bırakıp iki boyut sabitini yaz; bir boş satırdan sonra `left` ve
   `right` satırlarını yaz.
2. Dosyanın **en sonuna**, bir boş satırdan sonra raketleri çizen iki satırı yaz.
3. **Çalıştır**: sahanın iki yanında birer beyaz raket görmelisin.

# --try--

Change `left`'s `y` to `0` and run: the left paddle jumps to the top. Put `160` back.

# --try-tr--

`left`'in `y`'sini `0` yap ve çalıştır: sol raket en tepeye zıplar. Sonra `160`'a geri al.

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

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = 'white'
for (let y = 0; y < canvas.height; y += 30) {
  ctx.fillRect(canvas.width / 2 - 2, y, 4, 15)
}

ctx.fillRect(left.x, left.y, PADDLE_W, PADDLE_H)
ctx.fillRect(right.x, right.y, PADDLE_W, PADDLE_H)
```
