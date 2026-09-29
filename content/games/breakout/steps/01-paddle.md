---
title: The field and the paddle
title_tr: Oyun alanı ve raket
skills: [game.canvas]
---

# --goal--

Breakout is played on a `<canvas>` 480 pixels wide and 400 tall. We paint it dark blue and draw the paddle, a light
bar near the bottom.

# --goal-tr--

Tuğla Kırma oyunu sayfadaki 480×400 piksellik bir **canvas** (tuval) üzerinde oynanır. İlk adımda sahneyi kuruyoruz:
bütün alanı koyu laciverte boyayıp altına açık renkli bir **raket** (paddle) çizeceğiz.

Raketin ölçüleri hiç değişmeyecek, bu yüzden onları adlı **sabitlerde** tutuyoruz. Yeri ise değişecek (fareyle
kayacak), o yüzden bir **değişkende**.

# --code--

```js
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370

let paddle = { x: 200 }

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#e2e8f0'
ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
```

# --meaning--

- `canvas` is the `#game` element; `ctx` is its 2D drawing context.
- `PADDLE_W`, `PADDLE_H` and `PADDLE_Y` are the paddle's width, height and distance from the top.
- `paddle` is an object whose `x` (the left edge) will change later.
- Each drawing is two lines: pick a `fillStyle`, then `fillRect(x, y, width, height)`.

# --meaning-tr--

- `document.getElementById('game')` → sayfada kimliği `game` olan canvas'ı bulur; `const canvas =` ona bir ad verir.
- `canvas.getContext('2d')` → canvas'ın **2D çizim kalemini** alır. Bütün çizim komutları `ctx.` ile başlar.
- `const PADDLE_W = 80` → raketin **eni** 80 piksel. `PADDLE_H` **boyu** (12), `PADDLE_Y` üstten **uzaklığı** (370,
  yani en alta yakın). Hiç değişmeyecek sayılara büyük harfli ad vermek bir alışkanlıktır.
- `let paddle = { x: 200 }` → bir **nesne**: etiketli bilgilerden oluşan küçük bir kart. `paddle.x` raketin **sol
  kenarının** yeri. `let` kullandık, çünkü bu değer değişecek.
- `ctx.fillStyle = '#0f172a'` → kalemin rengini seçer (koyu lacivert).
- `ctx.fillRect(0, 0, canvas.width, canvas.height)` → içi dolu bir dikdörtgen boyar: sol üst köşe `(0, 0)`, eni ve
  boyu canvas'ın kendisi kadar. Canvas'ta `x` sağa, `y` **aşağı** doğru büyür.
- Son iki satır raketi açık griyle çizer: sol kenarı `paddle.x`, üstü `PADDLE_Y`.

# --task--

Write the code under the three comment lines, then press **Run**.

# --task-tr--

Kodu editördeki üç yorum satırının (`//` ile başlayanlar) **altına** yaz; boş satırları da aynen bırak.
**Çalıştır**'a bas: koyu bir alanın altında açık renkli bir raket görmelisin.

# --hint--

Check the spelling: `getElementById` has a capital `E`, `B` and `I`, and color codes start with `#` inside quotes.

# --hint-tr--

Yazımı kontrol et: `getElementById` içinde büyük `E`, `B` ve `I` var; renk kodları tırnak içinde ve `#` ile başlar.

# --try--

Set `paddle` to `{ x: 0 }` and run: the paddle jumps to the left edge. Put 200 back.

# --try-tr--

`paddle`'ı `{ x: 0 }` yap ve çalıştır: raket sol kenara zıplar. Sonra 200'e geri al.

# --tests--

The whole field should be painted `#0f172a`.
tr: Bütün alan `#0f172a` ile boyanmalı.

```js
const full = $.rects('#0f172a').filter((r) => r.x === 0 && r.y === 0 && r.w === 480 && r.h === 400)
assert.lengthOf(full, 1)
```

The paddle should be 80×12, drawn at x = 200, y = 370.
tr: Raket 80×12 olmalı ve x = 200, y = 370'e çizilmeli.

```js
assert.deepEqual([PADDLE_W, PADDLE_H, PADDLE_Y], [80, 12, 370])
assert.deepEqual(paddle, { x: 200 })
assert.deepEqual($.rects('#e2e8f0'), [{ x: 200, y: 370, w: 80, h: 12, color: '#e2e8f0' }])
```

# --seed--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370

let paddle = { x: 200 }

ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.fillStyle = '#e2e8f0'
ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
```
