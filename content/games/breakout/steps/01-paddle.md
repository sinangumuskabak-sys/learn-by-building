---
title: A paddle that follows the mouse
title_tr: Fareyi takip eden raket
skills: [game.input]
---

# --explanation--

In Breakout you steer the paddle with the mouse (or a finger). The `pointermove` event fires whenever the pointer moves
over the canvas, and it works for mouse, pen and touch alike, so one handler covers every device.

The event gives page coordinates. As in any canvas game, convert them to canvas pixels, taking both the canvas's
position **and** its displayed size into account:

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
```

The pointer should grab the paddle by its **middle**, so the paddle's left edge goes to `x - PADDLE_W / 2`. Then clamp
it so the paddle never leaves the screen.

Notice that the event handler only **changes state** (`paddle.x`); the loop does the drawing. Even though this step has
no movement of its own yet, the loop is already there: the next steps will fill it.

# --explanation-tr--

Tuğla Kırma'da raketi fareyle (ya da parmakla) yönetirsin. `pointermove` olayı işaretçi canvas üzerinde her hareket
ettiğinde tetiklenir ve fare, kalem ve dokunmatik için aynı şekilde çalışır; tek bir işleyici her cihazı kapsar.

Olay sayfa koordinatları verir. Her canvas oyununda olduğu gibi bunları canvas piksellerine çevir; canvas'ın hem
konumunu **hem de** gösterilen boyutunu hesaba kat:

```js
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
```

İşaretçi raketi **ortasından** tutmalı; bu yüzden raketin sol kenarı `x - PADDLE_W / 2`'ye gider. Sonra raket asla
ekrandan çıkmasın diye onu sınırla.

Olay işleyicinin yalnızca **durumu değiştirdiğine** (`paddle.x`) dikkat et; çizimi döngü yapar. Bu adımda henüz kendi
başına hareket eden bir şey olmasa da döngü şimdiden hazır: sonraki adımlar onu dolduracak.

# --task--

1. Store the canvas and context in `canvas` and `ctx`. Add `const PADDLE_W = 80`, `const PADDLE_H = 12`,
   `const PADDLE_Y = 370`, `let paddle = { x: 200 }` and a `clamp(value, min, max)` helper.
2. On `pointermove` over the canvas, convert the pointer to canvas pixels and set `paddle.x` so the paddle is centered
   on it, clamped between `0` and `canvas.width - PADDLE_W`.
3. Write `draw()` (background `'#0f172a'`, paddle `'#e2e8f0'` at `paddle.x`, `PADDLE_Y`) and a `loop()` that draws
   and requests the next frame. Start the loop.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut. `const PADDLE_W = 80`, `const PADDLE_H = 12`, `const PADDLE_Y = 370`,
   `let paddle = { x: 200 }` ve bir `clamp(value, min, max)` yardımcısı ekle.
2. Canvas üzerindeki `pointermove`'da işaretçiyi canvas piksellerine çevir ve `paddle.x`'i raket ona ortalanacak
   şekilde, `0` ile `canvas.width - PADDLE_W` arasında sınırlayarak ayarla.
3. `draw()` (arka plan `'#0f172a'`, raket `paddle.x`, `PADDLE_Y` noktasında `'#e2e8f0'`) ve çizip bir sonraki kareyi
   isteyen bir `loop()` yaz. Döngüyü başlat.

# --tests--

The paddle should start at x = 200, drawn at the bottom.
tr: Raket x = 200'de başlamalı ve altta çizilmeli.

```js
assert.deepEqual([PADDLE_W, PADDLE_H, PADDLE_Y], [80, 12, 370])
$.tick()
assert.deepEqual($.rects('#e2e8f0'), [{ x: 200, y: 370, w: 80, h: 12, color: '#e2e8f0' }])
```

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

Pointer positions should be scaled when the canvas is displayed at another size.
tr: Canvas başka bir boyutta gösterildiğinde işaretçi konumları ölçeklenmeli.

```js
$.canvas.getBoundingClientRect = () => ({ left: 20, top: 0, x: 20, y: 0, width: 960, height: 800, right: 980, bottom: 800 })
$.move(20 + 480, 300)
assert.strictEqual(paddle.x, 200, 'the middle of the displayed canvas is x = 240 in canvas pixels')
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
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
