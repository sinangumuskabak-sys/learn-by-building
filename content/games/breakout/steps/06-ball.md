---
title: A ball with a velocity
title_tr: Hızı olan bir top
skills: [game.physics, game.state]
---

# --goal--

The ball needs a position and a **velocity**: how far it moves each frame. `resetBall()` puts it in the middle,
heading up and to the right.

# --goal-tr--

Sıra topta. Topun iki çift bilgisi olacak:

- **konum**: `x`, `y` (top nerede?)
- **hız**: `vx`, `vy` (her karede x ve y ne kadar değişecek?)

Topu başlangıç yerine koyan satırı `resetBall` (topu sıfırla) adlı bir fonksiyona yazıyoruz, çünkü top düşünce de
aynı şeyi yapacağız. Bu adımda top henüz **görünmeyecek**; önce bilgisini hazırlıyoruz.

# --code--

```js
const BALL_R = 7

let ball

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}
```

# --meaning--

- `BALL_R` is the ball's radius. The ball is a circle, so `x, y` will be its **center**.
- `let ball` declares the variable without a value; `resetBall()` gives it one.
- `vx: 3, vy: -4` means 3 pixels right and 4 pixels **up** per frame (y grows downward).

# --meaning-tr--

- `const BALL_R = 7` → topun **yarıçapı** 7 piksel. Top bir daire olduğu için `x, y` onun **merkezi** olacak;
  raketin `x`'i ise sol kenarıydı. Bu farkı aklında tut.
- `let ball` → değişkeni **değersiz** tanımlar. Değerini `resetBall()` verecek. En üstte tanımlıyoruz ki bütün
  fonksiyonlar onu görebilsin.
- `ball = { x: 240, y: 200, vx: 3, vy: -4 }` → top alanın ortasında (240, 200). `vx: 3` her karede 3 piksel
  **sağa**, `vy: -4` her karede 4 piksel **yukarı** demek (y aşağı doğru büyüdüğü için eksi yukarıdır).

# --task--

1. Under `const PADDLE_Y = 370` write `const BALL_R = 7`.
2. Under `let paddle = ...` write `let ball`.
3. Leave an empty line under the `clamp` function and write `resetBall`.

# --task-tr--

1. `const PADDLE_Y = 370` satırının altına `const BALL_R = 7` yaz.
2. `let paddle = { x: 200 }` satırının altına `let ball` yaz.
3. `clamp` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve `resetBall` fonksiyonunu yaz.
4. **Çalıştır**: ekranda değişiklik yok, kontroller yeşil olmalı.

# --predict--

Will you see the ball after Run?
- [ ] Yes, in the middle
- [x] No
  Nobody calls `resetBall()` yet, and `draw` does not draw a ball.
- [ ] Yes, flying up

# --predict-tr--

Çalıştır'a basınca topu görecek misin?
- [ ] Evet, ortada
- [x] Hayır
  `resetBall()`'u henüz kimse çağırmıyor ve `draw` top çizmiyor.
- [ ] Evet, yukarı uçarken

# --tests--

`BALL_R` should be 7.
tr: `BALL_R` 7 olmalı.

```js
assert.strictEqual(BALL_R, 7)
```

`resetBall()` should put the ball in the middle, moving up and to the right.
tr: `resetBall()` topu ortaya koymalı, sağa ve yukarı giderken.

```js
resetBall()
assert.deepEqual(ball, { x: 240, y: 200, vx: 3, vy: -4 })
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
const BALL_R = 7

let paddle = { x: 200 }
let ball

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function resetBall() {
  ball = { x: 240, y: 200, vx: 3, vy: -4 }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
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
