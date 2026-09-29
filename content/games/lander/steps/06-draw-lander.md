---
title: Draw it around its own middle
title_tr: Kendi ortası etrafında çiz
skills: [game.canvas]
---

# --goal--

The lander will tilt. Instead of computing every tilted corner, we move and turn the **drawing itself** to the lander,
then draw a simple upright triangle around (0, 0).

# --goal-tr--

Araç ileride **eğilecek**. Eğik bir üçgenin her köşesini trigonometriyle hesaplamak zor olurdu. Canvas bunu bizim
yerimize yapabilir: **kâğıdı** aracın yerine kaydırır ve aracın açısı kadar çevirir; biz de aracı sanki hiç eğik
değilmiş gibi, `(0, 0)` etrafında düz çizeriz.

2D oyunlarda dönen hemen her şey böyle çizilir.

# --code--

```js
function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.restore()
}

  drawLander()
```

# --meaning--

- `save` remembers the normal drawing position; `restore` goes back to it, so later drawings are not moved or turned.
- `translate` makes (0, 0) the lander's middle; `rotate` turns "up" into the lander's up.
- The body is a triangle: tip at (0, -12), bottom corners at (9, 8) and (-9, 8).
- `drawLander()` is called after the ground, so the lander is drawn on top.

# --meaning-tr--

- `ctx.save()` → şu anki çizim ayarını (konum, açı, renk) **hatırla**.
- `ctx.translate(lander.x, lander.y)` → kâğıdı kaydır: `(0, 0)` artık **aracın ortası**.
- `ctx.rotate(lander.angle)` → kâğıdı aracın açısı kadar çevir: "yukarı" artık **aracın yukarısı**. Açı şimdilik 0;
  hiç dönmüyor.
- Üçgen: tepesi `(0, -12)` (ortanın 12 piksel yukarısı), alt köşeleri `(9, 8)` ve `(-9, 8)`. `moveTo`/`lineTo`/`fill`
  zemini çizerken kullandığımız komutlar.
- `ctx.restore()` → hatırlanan ayara **dön**. Bu olmasa sonra çizilen her şey de kaymış ve dönmüş olurdu.
- `drawLander()` → `draw` içinde pistten sonra çağrılır: araç zeminin **üstünde** görünür.

# --task--

1. Write `drawLander` just above `function draw() {`, with an empty line between.
2. In `draw`, under the pad's `fillRect` line, leave an empty line and write `drawLander()`.

# --task-tr--

1. `function draw() {` satırının **üstüne** `drawLander` fonksiyonunu yaz; aralarında bir boş satır kalsın.
2. `draw` içinde pisti çizen `ctx.fillRect(pad.x1, ...)` satırının altına bir boş satır bırak ve `drawLander()` yaz.
3. **Çalıştır**: sol üstte açık gri bir üçgen görmelisin.

# --try--

In `reset`, start with `angle: 0.5` and run: the lander is drawn tilted. Put 0 back.

# --try-tr--

`reset` içinde `angle: 0.5` ile başlat ve çalıştır: araç eğik çizilir. Sonra 0'a geri al.

# --tests--

The lander should be drawn moved and turned into place.
tr: Araç taşınıp döndürülerek yerine çizilmeli.

```js
const calls = $.screen()
assert.deepEqual(calls.find((c) => c.op === 'translate').args, [60, 40])
assert.deepEqual(calls.find((c) => c.op === 'rotate').args, [0])
assert.isTrue(calls.some((c) => c.op === 'fill' && c.fill === '#e2e8f0'))
```

A tilted lander should be drawn turned.
tr: Eğik bir araç dönmüş çizilmeli.

```js
lander.angle = 0.5
draw()
assert.deepEqual($.screen().find((c) => c.op === 'rotate').args, [0.5])
```

The drawing settings should be restored afterwards.
tr: Çizim ayarları sonrasında geri alınmalı.

```js
ctx.fillStyle = '#ff0000'
drawLander()
assert.strictEqual(ctx.fillStyle, '#ff0000', 'drawLander() should end with ctx.restore()')
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander

// Random hills, with one flat stretch: the pad.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = 2
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function reset() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }
}

function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.restore()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)

  drawLander()
}

reset()
draw()
```
