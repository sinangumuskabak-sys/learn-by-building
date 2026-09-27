---
title: Falling, and a lander that can turn
title_tr: Düşmek ve dönebilen bir iniş aracı
skills: [game.physics, game.canvas]
---

# --explanation--

On the moon gravity is weak, so the lander drifts down slowly, speeding up a little every frame. It also keeps any
sideways speed it has: nothing slows it down in a vacuum.

The lander will soon tilt, and drawing a tilted triangle by computing every corner with `sin` and `cos` would be
painful. The canvas can do it for you by moving and turning the **drawing itself**:

```js
ctx.save()                     // remember the normal drawing position
ctx.translate(lander.x, lander.y)   // (0, 0) is now the lander's middle
ctx.rotate(lander.angle)       // and "up" is now the lander's up
...draw the lander around (0, 0), as if it were not tilted...
ctx.restore()                  // back to normal for everything else
```

This is how almost every rotating thing in 2D games is drawn: draw it simply, around its own center, and let `translate`
and `rotate` put it in place.

When a foot touches the ground (the ground under the left foot, the middle or the right foot is not below the feet any
more), the lander stops. Whether that was a landing or a crash comes later. Leaving one side of the screen brings the
lander back on the other.

# --explanation-tr--

Ay'da yerçekimi zayıftır; bu yüzden iniş aracı yavaşça aşağı süzülür ve her karede biraz hızlanır. Yan hızını da korur:
boşlukta onu hiçbir şey yavaşlatmaz.

İniş aracı yakında eğilecek ve eğik bir üçgeni her köşesini `sin` ve `cos` ile hesaplayarak çizmek zahmetli olurdu. Canvas
bunu senin için **çizimin kendisini** taşıyıp döndürerek yapabilir:

```js
ctx.save()                     // normal çizim konumunu hatırla
ctx.translate(lander.x, lander.y)   // (0, 0) artık aracın ortası
ctx.rotate(lander.angle)       // ve "yukarı" artık aracın yukarısı
...aracı (0, 0) çevresine, eğik değilmiş gibi çiz...
ctx.restore()                  // geri kalan her şey için normale dön
```

2B oyunlarda dönen neredeyse her şey böyle çizilir: onu kendi merkezi çevresinde basitçe çiz, `translate` ve `rotate` yerine
koysun.

Bir ayak zemine değince (sol ayağın, ortanın ya da sağ ayağın altındaki zemin artık ayakların altında değilse) araç durur.
Bunun bir iniş mi yoksa bir kaza mı olduğu sonra gelecek. Ekranın bir yanından çıkmak aracı öbür yandan geri getirir.

# --task--

1. Add `FEET = 9` and `GRAVITY = 0.025`. `reset()` also creates `lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }` and
   sets `state = 'flying'`.
2. Write `update()`, which does nothing unless flying: add `GRAVITY` to `vy`, move by `vx` and `vy`, wrap `x` with
   `(x + canvas.width) % canvas.width`. The feet are at `y + 10`; if that reaches `groundY` at `x - FEET`, `x` or `x + FEET`,
   the state becomes `'down'`.
3. Write `drawLander()` with `save`, `translate`, `rotate` and `restore`: a `'#e2e8f0'` triangle `(0, -12)`, `(9, 8)`,
   `(-9, 8)` and two 2 by 2 feet at `(-FEET, 8)` and `(FEET - 2, 8)`. Draw it after the ground.

# --task-tr--

1. `FEET = 9` ve `GRAVITY = 0.025` ekle. `reset()` ayrıca `lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0 }`'ı yaratır ve
   `state = 'flying'` yapar.
2. Uçmuyorsa hiçbir şey yapmayan `update()` yaz: `vy`'ye `GRAVITY` ekle, `vx` ve `vy` kadar hareket ettir, `x`'i
   `(x + canvas.width) % canvas.width` ile sar. Ayaklar `y + 10`'dadır; bu `x - FEET`, `x` ya da `x + FEET`'teki `groundY`'ye
   ulaşırsa durum `'down'` olur.
3. `save`, `translate`, `rotate` ve `restore` ile `drawLander()` yaz: `'#e2e8f0'` bir üçgen `(0, -12)`, `(9, 8)`, `(-9, 8)` ve
   `(-FEET, 8)` ile `(FEET - 2, 8)`'de 2'ye 2 iki ayak. Zeminden sonra çiz.

# --tests--

The lander should fall faster and faster and keep drifting sideways.
tr: İniş aracı gittikçe hızlanarak düşmeli ve yana süzülmeye devam etmeli.

```js
$.tick(10)
assert.closeTo(lander.vy, 0.25, 1e-9)
assert.closeTo(lander.y, 40 + 0.025 * 55, 1e-9)
assert.strictEqual(lander.x, 70)
```

The lander should stop when its feet touch the ground.
tr: İniş aracı ayakları zemine değince durmalı.

```js
ground = Array(13).fill(300)
$.tick(140)
assert.strictEqual(state, 'flying')
$.tick(1)
assert.strictEqual(state, 'down')
const y = lander.y
$.tick(10)
assert.strictEqual(lander.y, y)
```

A foot on a slope should count too, and the lander should wrap around the sides.
tr: Yokuştaki bir ayak da sayılmalı ve araç kenarlardan dolanmalı.

```js
ground = Array(13).fill(350)
ground[3] = 100 // a peak at x = 120
lander = { x: 111, y: 150, vx: 0, vy: 0, angle: 0 }
$.tick(1)
assert.strictEqual(state, 'down', 'the right foot at x = 120 is on the peak')
reset()
lander.x = 479.5
$.tick(1)
assert.closeTo(lander.x, 0.5, 1e-9)
```

The lander should be drawn moved and turned into place.
tr: İniş aracı taşınıp döndürülerek yerine çizilmeli.

```js
lander.angle = 0.5
$.tick(1)
const calls = $.screen()
const move = calls.find((c) => c.op === 'translate')
assert.closeTo(move.args[0], 61, 1e-9)
assert.deepEqual(calls.find((c) => c.op === 'rotate').args, [0.5])
assert.isTrue(calls.some((c) => c.op === 'fill' && c.fill === '#e2e8f0'))
assert.lengthOf($.rects('#e2e8f0').filter((r) => r.w === 2 && r.h === 2), 2)
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it
const GRAVITY = 0.025 // speed gained per frame, downwards

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let state // 'flying' or 'down'

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
  state = 'flying'
}

function update() {
  if (state !== 'flying') return

  lander.vy += GRAVITY
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) state = 'down'
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
  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
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

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
