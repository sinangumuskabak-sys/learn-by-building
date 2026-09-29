---
title: The height at any x
title_tr: Her x için yükseklik
skills: [game.physics, prog.functions]
---

# --goal--

To know when the lander touches the ground, we need the ground's height at **any** x, not only at the points. Between
two points the ground is a straight line, so we blend between their heights.

# --goal-tr--

Aracın yere değip değmediğini anlamak için zeminin **herhangi bir** `x`'teki yüksekliğini bilmemiz gerekecek; yalnız
noktalarda değil, aralarında da. İki nokta arasında zemin **düz bir çizgi**. O hâlde: `x`'in solundaki ve sağındaki
noktayı bul, `x`'in aradaki yolun ne kadarında olduğuna göre iki yüksekliği **karıştır**.

Buna **doğrusal ara değer bulma** (linear interpolation) denir; oyunlarda en çok kullanılan formüllerden biridir:
renkleri geçişli değiştirmek, bir şeyi A'dan B'ye yumuşakça kaydırmak hep bununla yapılır.

# --code--

```js
// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}
```

# --meaning--

- `i` is the point on the left of `x`, kept between 0 and the second-to-last point so `i + 1` always exists.
- `t` is how far `x` is from point `i` to point `i + 1`: 0 at the left one, 1 at the right one.
- The result starts at the left height and moves `t` of the way to the right height.

# --meaning-tr--

- `Math.floor(x / STEP)` → `x`'in **solundaki** noktanın sıra numarası (100 / 40 = 2.5 → 2).
- `Math.max(0, Math.min(ground.length - 2, ...))` → bu numarayı 0 ile sondan ikinci nokta arasında tut; böylece
  `ground[i + 1]` hep var olur (ekranın dışındaki `x`'lerde bile).
- `const t = (x - i * STEP) / STEP` → `x`, `i`. noktadan sonraki noktaya giden yolun **ne kadarında**: solda 0,
  ortada 0.5, sağda 1.
- `ground[i] + (ground[i + 1] - ground[i]) * t` → soldaki yükseklikten başla, iki yükseklik arasındaki farkın `t`
  kadarını ekle. Örnek: 100 ile 200 arasında, yolun yarısında → 100 + 100 × 0.5 = **150**.

# --task--

Leave an empty line under `makeGround` and write `groundY` with its comment.

# --task-tr--

`makeGround` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve yorumuyla birlikte `groundY` fonksiyonunu
yaz. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

The ground is 100 at x = 0 and 200 at x = 40. What is `groundY(10)`?
- [ ] 110
- [x] 125
  10 is a quarter of the way from 0 to 40, so the height is a quarter of the way from 100 to 200.
- [ ] 150

# --predict-tr--

Zemin x = 0'da 100, x = 40'ta 200. `groundY(10)` kaç verir?
- [ ] 110
- [x] 125
  10, 0'dan 40'a giden yolun dörtte biri; yükseklik de 100'den 200'e giden yolun dörtte biri.
- [ ] 150

# --tests--

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

The pad should be flat all along.
tr: Pist boydan boya düz olmalı.

```js
assert.strictEqual(groundY(pad.x1), pad.y)
assert.strictEqual(groundY((pad.x1 + pad.x2) / 2), pad.y)
assert.strictEqual(groundY(pad.x2), pad.y)
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

makeGround()
draw()
```
