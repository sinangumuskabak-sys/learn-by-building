---
title: Follow the mouse
title_tr: Fareyi takip et
skills: [game.input]
---

# --goal--

Now the paddle follows the mouse (or a finger). The `pointermove` event fires every time the pointer moves over the
canvas; we put the paddle's middle under it.

# --goal-tr--

Şimdi raket **fareyi takip edecek** (telefonda parmağı). Tarayıcı, fare canvas'ın üstünde her kıpırdadığında
`pointermove` adlı bir **olay** yayınlar; fare, kalem ve dokunmatik için aynı olay. Biz o olayı dinleyip raketi
farenin altına taşıyacağız.

Olay bize farenin **sayfadaki** yerini verir. Canvas sayfanın içinde bir yerde durduğu için bunu canvas'a göre
çevirmemiz gerekiyor.

# --code--

```js
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})
```

# --meaning--

- `addEventListener('pointermove', ...)` runs the arrow function every time the pointer moves over the canvas.
- `event.clientX` is the pointer's x on the page; `rect.left` is where the canvas starts, so the difference is the x
  inside the canvas.
- `x - PADDLE_W / 2` puts the paddle's middle under the pointer; `clamp` keeps it on the screen.

# --meaning-tr--

- `canvas.addEventListener('pointermove', (event) => { ... })` → "fare canvas'ın üstünde **her hareket ettiğinde**
  süslü parantezin içini çalıştır". `(event) => { }` adı olmayan kısa bir fonksiyondur (**ok fonksiyonu**);
  tarayıcı olayın bilgilerini ona `event` adıyla verir.
- `canvas.getBoundingClientRect()` → canvas'ın ekranda durduğu kutu. `rect.left` sol kenarının sayfadaki yeri.
- `event.clientX - rect.left` → farenin canvas'ın sol kenarından **uzaklığı**, yani canvas içindeki x'i.
- `x - PADDLE_W / 2` → raketi farenin tam **ortasından** tutmak için sol kenarını yarım raket (40 piksel) sola
  koyarız. (Önce bölme yapılır, sonra çıkarma; matematikteki gibi.)
- `clamp(..., 0, canvas.width - PADDLE_W)` → sol kenar 0'dan küçük ya da 400'den (480 − 80) büyük olmasın; yoksa
  raket ekrandan taşar.
- Dikkat: olay yalnız **bilgiyi** (`paddle.x`) değiştiriyor. Çizimi döngü yapıyor.

# --task--

Leave an empty line under the `clamp` function's closing `}` and write the listener. Run and move the mouse over the
game.

# --task-tr--

1. `clamp` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve dinleyiciyi yaz. Kapanış `})` ile olur.
2. **Çalıştır**, sonra fareni oyun alanında gezdir: raket onu takip etmeli ve kenarlardan taşmamalı.

# --hint--

The last line must set `paddle.x`, not a new variable. `clamp` needs three numbers: the position, `0` and
`canvas.width - PADDLE_W`.

# --hint-tr--

Son satır yeni bir değişken değil, `paddle.x`'i değiştirmeli. `clamp`'e üç sayı ver: konum, `0` ve
`canvas.width - PADDLE_W`.

# --try--

Remove `- PADDLE_W / 2` and try again: now the pointer holds the paddle by its left end. Put it back.

# --try-tr--

`- PADDLE_W / 2` kısmını sil ve dene: fare raketi artık sol ucundan tutar. Sonra geri ekle.

# --tests--

Moving the pointer should center the paddle on it.
tr: İşaretçiyi hareket ettirmek raketi ona ortalamalı.

```js
$.move(100, 300)
assert.strictEqual(paddle.x, 60)
$.tick()
assert.strictEqual($.rects('#e2e8f0')[0].x, 60)
```

The paddle should stay on the screen.
tr: Raket ekranda kalmalı.

```js
$.move(5, 300)
assert.strictEqual(paddle.x, 0)
$.move(479, 300)
assert.strictEqual(paddle.x, 400)
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
