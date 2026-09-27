---
title: Hills and a landing pad
title_tr: Tepeler ve bir iniş pisti
skills: [prog.arrays, game.canvas]
---

# --explanation--

The moon's surface is a list of heights, one every 40 pixels, joined by straight lines. Random heights make hills; one
flat stretch where several points share the same height is the **landing pad**.

```js
ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
```

Later the game needs the height of the ground at **any** `x`, not only at the points. Between two points the ground is a
straight line, so find the two points around `x` and blend between them by how far `x` is along:

```js
const t = (x - i * STEP) / STEP          // 0 at point i, 1 at point i + 1
return ground[i] + (ground[i + 1] - ground[i]) * t
```

This is **linear interpolation**, one of the most used formulas in games: it is also how you fade colors, move things
smoothly from A to B and animate numbers.

The ground is drawn as one filled shape: start at the bottom left, go through every point, finish at the bottom right.

# --explanation-tr--

Ay yüzeyi, her 40 pikselde bir olan ve düz çizgilerle birleşen yüksekliklerin bir listesidir. Rastgele yükseklikler tepeleri
yapar; birkaç noktanın aynı yüksekliği paylaştığı düz bir parça da **iniş pistidir**.

```js
ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
```

Sonra oyunun yalnızca noktalarda değil, **her** `x`'te zeminin yüksekliğine ihtiyacı olacak. İki nokta arasında zemin düz bir
çizgidir; öyleyse `x`'in etrafındaki iki noktayı bul ve `x`'in ne kadar ilerde olduğuna göre aralarında karıştır:

```js
const t = (x - i * STEP) / STEP          // i. noktada 0, i + 1. noktada 1
return ground[i] + (ground[i + 1] - ground[i]) * t
```

Bu **doğrusal ara değerlemedir** (linear interpolation), oyunlarda en çok kullanılan formüllerden biri: renkleri geçişli
değiştirmek, bir şeyi A'dan B'ye akıcıca taşımak ve sayıları canlandırmak da böyle yapılır.

Zemin tek bir dolu şekil olarak çizilir: sol alttan başla, her noktadan geç, sağ altta bitir.

# --task--

1. Add `STEP = 40`, and write `makeGround()`: `ground` gets `canvas.width / STEP + 1` random heights from `210` to `330`.
   Pick a random start point from `1` so the pad fits, a random `y` from `250` to `320`, set the pad's 3 points (a width of
   2 steps) to that `y`, and save `pad = { x1, x2, y }` in pixels.
2. Write `groundY(x)` with linear interpolation, keeping `i` between `0` and `ground.length - 2`.
3. Draw every frame: a `'#020617'` sky, the ground as one `'#475569'` shape through all the points, and the pad as a
   `'#22c55e'` bar 4 pixels high centered on its `y`.

# --task-tr--

1. `STEP = 40` ekle ve `makeGround()` yaz: `ground` `210` ile `330` arasında `canvas.width / STEP + 1` rastgele yükseklik
   alır. Pist sığacak biçimde `1`'den başlayan rastgele bir başlangıç noktası, `250` ile `320` arasında rastgele bir `y` seç,
   pistin 3 noktasını (2 adım genişlik) o `y`'ye ayarla ve `pad = { x1, x2, y }`'yi piksel olarak kaydet.
2. `i`'yi `0` ile `ground.length - 2` arasında tutarak doğrusal ara değerlemeyle `groundY(x)` yaz.
3. Her karede çiz: `'#020617'` bir gökyüzü, bütün noktalardan geçen tek bir `'#475569'` şekil olarak zemin ve pisti `y`'sinde
   ortalı 4 piksel yüksekliğinde `'#22c55e'` bir çubuk olarak.

# --tests--

The ground should be random hills with one flat pad.
tr: Zemin, düz bir pisti olan rastgele tepeler olmalı.

```js
assert.lengthOf(ground, 13)
assert.isTrue(ground.every((y) => y >= 210 && y <= 330))
assert.strictEqual(pad.x2 - pad.x1, 80)
assert.isTrue(pad.x1 >= 40 && pad.x2 <= 480)
assert.strictEqual(groundY(pad.x1), pad.y)
assert.strictEqual(groundY((pad.x1 + pad.x2) / 2), pad.y)
```

Between the points, the ground should be a straight line.
tr: Noktaların arasında zemin düz bir çizgi olmalı.

```js
ground = [100, 200, 200, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
assert.strictEqual(groundY(0), 100)
assert.strictEqual(groundY(20), 150)
assert.strictEqual(groundY(30), 175)
assert.strictEqual(groundY(100), 250)
assert.strictEqual(groundY(480), 300)
```

The ground and the pad should be drawn.
tr: Zemin ve pist çizilmeli.

```js
$.tick(1)
assert.deepEqual($.rects('#22c55e').map((r) => [r.x, r.y, r.w, r.h]), [[pad.x1, pad.y - 2, 80, 4]])
const lines = $.screen().filter((c) => c.op === 'lineTo')
assert.lengthOf(lines, 14, 'one line to every point, then to the bottom right')
assert.isTrue($.screen().some((c) => c.op === 'fill' && c.fill === '#475569'))
```

# --seed--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
