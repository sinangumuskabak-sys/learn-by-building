---
title: A canvas shown at another size
title_tr: Başka boyda gösterilen canvas
skills: [game.input]
---

# --goal--

On a phone or a big screen the canvas may be shown smaller or larger than 480 pixels. We scale the pointer position
so the paddle still ends up under the finger.

# --goal-tr--

Canvas'ın kendi eni 480 pikseldir, ama ekranda **küçültülmüş ya da büyütülmüş** gösterilebilir: telefonda daha
küçük, büyük ekranda daha büyük. O zaman sayfadaki 1 piksel, canvas'taki 1 piksel değildir ve raket parmağın altına
denk gelmez.

Çözüm: uzaklığı, canvas'ın gerçek eni ile ekrandaki eni arasındaki **oran** ile çarpmak.

# --code--

```js
// Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
const rect = canvas.getBoundingClientRect()
const x = (event.clientX - rect.left) * (canvas.width / rect.width)
```

# --meaning--

- `rect.width` is the width the canvas is displayed at; `canvas.width` is its real width (480).
- `canvas.width / rect.width` is the scale: 0.5 when it is shown twice as big.
- The parentheses make the subtraction happen before the multiplication.

# --meaning-tr--

- İlk satır bir **yorum**: bilgisayar okumaz, sana not.
- `rect.width` → canvas'ın ekranda **göründüğü** en. `canvas.width` → canvas'ın **gerçek** eni (480).
- `canvas.width / rect.width` → oran. Canvas iki kat büyük gösteriliyorsa (960) oran 480 / 960 = **0.5** olur;
  sayfadaki uzaklık yarıya iner. Normal boyda oran 1'dir, hiçbir şey değişmez.
- `(event.clientX - rect.left) * (...)` → parantezler önce çıkarmanın, sonra çarpmanın yapılmasını sağlar.

# --task--

In the `pointermove` listener, add the comment above `const rect` and change the `const x` line as shown.

# --task-tr--

1. `pointermove` dinleyicisinde `const rect = ...` satırının **üstüne** yorum satırını yaz.
2. `const x = ...` satırını kodda görüldüğü gibi değiştir: çıkarmayı paranteze al, sonuna oranla çarpmayı ekle.
3. **Çalıştır**: normal boyda raket eskisi gibi davranmalı.

# --predict--

On a normal screen, will the game feel any different after this step?
- [x] No
  At normal size `canvas.width / rect.width` is 1, and multiplying by 1 changes nothing.
- [ ] Yes, the paddle moves twice as fast
- [ ] Yes, the paddle moves half as fast

# --predict-tr--

Normal bir ekranda bu adımdan sonra oyun farklı hissettirir mi?
- [x] Hayır
  Normal boyda `canvas.width / rect.width` 1'dir; 1 ile çarpmak hiçbir şeyi değiştirmez.
- [ ] Evet, raket iki kat hızlı gider
- [ ] Evet, raket yarı hızda gider

# --tests--

Pointer positions should be scaled when the canvas is displayed at another size.
tr: Canvas başka bir boyutta gösterildiğinde işaretçi konumları ölçeklenmeli.

```js
$.canvas.getBoundingClientRect = () => ({ left: 20, top: 0, x: 20, y: 0, width: 960, height: 800, right: 980, bottom: 800 })
$.move(20 + 480, 300)
assert.strictEqual(paddle.x, 200, 'the middle of the displayed canvas is x = 240 in canvas pixels')
```

At normal size the paddle should still follow the pointer exactly.
tr: Normal boyda raket işaretçiyi yine tam izlemeli.

```js
$.move(100, 300)
assert.strictEqual(paddle.x, 60)
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
