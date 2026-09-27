---
title: Angle and power
title_tr: Açı ve güç
skills: [game.input, prog.functions]
---

# --explanation--

A shot is decided by two numbers: the **angle** of the barrel and the **power** of the charge. Players adjust both, and the
screen tells them the values, so a shot that almost hit can be repeated with a small change.

The arrow keys nudge them: Left and Right turn the barrel, Up and Down change the power. Both are kept within limits.

With the pointer you point from the tank: the **direction** to the pointer is the angle and the **distance** is the power. One
trap: `Math.atan2` returns angles from `-π` to `π`, and anything **below** the barrel comes out positive, between 0 and π. A tank
cannot fire into the ground, so a point below and to the left means "flat to the left" (`-π`), and below and to the right means
"flat to the right" (`0`). Without that care, pointing exactly left would give `π`, which clamps to `0`, and the barrel would swing
to the **right**. The tests catch exactly that.

The barrel is a short thick line from the top of the tank, along the angle. The HUD shows the angle in degrees, counted up from the
right, as players expect: `Math.round(-angle * 180 / Math.PI)`.

# --explanation-tr--

Bir atışa iki sayı karar verir: namlunun **açısı** ve barutun **gücü**. Oyuncular ikisini de ayarlar ve ekran değerleri söyler;
böylece neredeyse isabet eden bir atış küçük bir değişiklikle tekrarlanabilir.

Ok tuşları onları dürter: Sol ve Sağ namluyu çevirir, Yukarı ve Aşağı gücü değiştirir. İkisi de sınırlar içinde tutulur.

İşaretçiyle tanktan gösterirsin: işaretçiye olan **yön** açıdır, **uzaklık** güçtür. Bir tuzak var: `Math.atan2` `-π`'den `π`'ye açılar
döndürür ve namlunun **altındaki** her şey 0 ile π arasında pozitif çıkar. Bir tank zemine ateş edemez; bu yüzden altta ve solda bir
nokta "sola düz" (`-π`), altta ve sağda bir nokta "sağa düz" (`0`) anlamına gelir. Bu özen olmasa tam sola göstermek `π` verirdi, bu
da `0`'a sınırlanır ve namlu **sağa** dönerdi. Testler tam olarak bunu yakalar.

Namlu, tankın tepesinden açı boyunca kısa, kalın bir çizgidir. Gösterge açıyı, oyuncuların beklediği gibi sağdan yukarı sayılan
derece olarak gösterir: `Math.round(-angle * 180 / Math.PI)`.

# --task--

1. Add `MAX_POWER = 12`, `dragging` (`false` in `reset()`), and `angle` and `power` for each tank: `-Math.PI / 4` and `8` for blue,
   `-3 * Math.PI / 4` and `8` for red.
2. Write `aimBy(dAngle, dPower)` for the blue tank: angle kept between `-Math.PI` and `0`, power between 2 and `MAX_POWER`. Left and
   Right change the angle by `0.03`, Up and Down the power by `0.25` (`preventDefault()`).
3. Write `pointAt(event)`: from `(t.x, t.y - 8)` to the pointer, the angle from `atan2` (fixed as above when positive) and the power
   `distance / 12` (limited as above). `pointerdown` starts dragging and points; `pointermove` points while dragging; the document's
   `pointerup` stops.
4. Draw each barrel (width 3, in the tank's color) 14 pixels from `(t.x, t.y - 8)` along its angle, and `Angle 45°  Power 8.0` at
   `(10, 20)` (`'#0f172a'`, `'bold 14px sans-serif'`).

# --task-tr--

1. `MAX_POWER = 12`, `dragging` (`reset()`'te `false`) ve her tank için `angle` ve `power` ekle: mavi için `-Math.PI / 4` ve `8`,
   kırmızı için `-3 * Math.PI / 4` ve `8`.
2. Mavi tank için `aimBy(dAngle, dPower)` yaz: açı `-Math.PI` ile `0`, güç 2 ile `MAX_POWER` arasında tutulur. Sol ve Sağ açıyı `0.03`,
   Yukarı ve Aşağı gücü `0.25` değiştirir (`preventDefault()`).
3. `pointAt(event)` yaz: `(t.x, t.y - 8)`'den işaretçiye, açı `atan2`'den (pozitifken yukarıdaki gibi düzeltilmiş) ve güç
   `uzaklık / 12` (yukarıdaki gibi sınırlı). `pointerdown` sürüklemeyi başlatır ve gösterir; `pointermove` sürüklerken gösterir;
   document'ın `pointerup`'ı durdurur.
4. Her namluyu (kalınlık 3, tankın renginde) `(t.x, t.y - 8)`'den açısı boyunca 14 piksel ve `(10, 20)`'ye `Angle 45°  Power 8.0`
   çiz (`'#0f172a'`, `'bold 14px sans-serif'`).

# --tests--

The keys should change the angle and the power within their limits.
tr: Tuşlar açıyı ve gücü sınırları içinde değiştirmeli.

```js
const t = tanks[0]
assert.closeTo(t.angle, -Math.PI / 4, 1e-9)
$.press('ArrowLeft')
assert.closeTo(t.angle, -Math.PI / 4 - 0.03, 1e-9)
$.press('ArrowUp')
assert.strictEqual(t.power, 8.25)
for (let i = 0; i < 100; i++) $.press('ArrowLeft')
assert.closeTo(t.angle, -Math.PI, 1e-9, 'no lower than flat to the left')
for (let i = 0; i < 100; i++) $.press('ArrowUp')
assert.strictEqual(t.power, MAX_POWER)
for (let i = 0; i < 100; i++) $.press('ArrowDown')
assert.strictEqual(t.power, 2)
```

Pointing should set the angle and the power, flat to the left when pointing left.
tr: Göstermek açıyı ve gücü ayarlamalı; sola gösterince sola düz.

```js
const t = tanks[0]
$.pointerDown(t.x + 60, t.y - 8 - 60)
assert.closeTo(t.angle, -Math.PI / 4, 1e-9, 'the pointer sets the direction')
assert.closeTo(t.power, Math.hypot(60, 60) / 12, 1e-9, 'and its distance the power')
$.move(t.x - 300, t.y - 8)
assert.closeTo(t.angle, -Math.PI, 1e-9)
assert.strictEqual(t.power, MAX_POWER)
$.pointerUp(t.x - 300, t.y - 8)
$.move(t.x + 10, t.y - 50)
assert.closeTo(t.angle, -Math.PI, 1e-9, 'moving without pressing does nothing')
```

The angle, the power and the barrel should be drawn.
tr: Açı, güç ve namlu çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Angle 45°  Power 8.0')
const t = tanks[0]
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map((v) => Math.round(v)).join())
assert.include(ends, [Math.round(t.x + Math.cos(t.angle) * 14), Math.round(t.y - 8 + Math.sin(t.angle) * 14)].join(), 'the barrel')
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const MAX_POWER = 12

let ground // ground[x]: the y of the surface in column x
let tanks // [blue, red]: { x, y, angle, power, color }
let dragging

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  dragging = false
}

function aimBy(dAngle, dPower) {
  const t = tanks[0]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else return
  event.preventDefault()
})

// Point from the tank: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[0]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  dragging = true
  pointAt(event)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pointAt(event)
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
  }

  const now = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
