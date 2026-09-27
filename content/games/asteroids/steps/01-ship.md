---
title: A ship that points somewhere
title_tr: Bir yöne bakan gemi
skills: [game.canvas, game.physics]
---

# --explanation--

So far every game moved in four directions. The ship here can face **any** angle, so you need the one bit of
trigonometry that game programmers use every day:

> A direction at angle `a` (in radians) is the vector `(Math.cos(a), Math.sin(a))`.

Angle `0` points right: `(1, 0)`. Because `y` grows downwards on a canvas, `Math.PI / 2` points **down** and
`-Math.PI / 2` points **up**. A full turn is `2π`.

To find a point at distance `r` from the center in direction `a`, scale the direction vector:

```js
x = ship.x + Math.cos(a) * r
y = ship.y + Math.sin(a) * r
```

The ship is a triangle with three such points: the nose at `angle`, and two back corners at `angle + 2.5` and
`angle - 2.5` (about 143° either side). Draw it as a **path** of lines and `stroke()` it instead of filling it, for the
glowing-vector look of the 1979 arcade original.

# --explanation-tr--

Şimdiye kadar her oyun dört yönde hareket etti. Buradaki gemi **herhangi bir** açıya bakabilir; bu yüzden oyun
programcılarının her gün kullandığı o tek trigonometri parçasına ihtiyacın var:

> `a` açısındaki (radyan cinsinden) bir yön, `(Math.cos(a), Math.sin(a))` vektörüdür.

`0` açısı sağı gösterir: `(1, 0)`. Canvas'ta `y` aşağı doğru büyüdüğü için `Math.PI / 2` **aşağıyı**, `-Math.PI / 2`
**yukarıyı** gösterir. Tam tur `2π`'dir.

Merkezden `a` yönünde `r` uzaklıktaki bir noktayı bulmak için yön vektörünü ölçekle:

```js
x = ship.x + Math.cos(a) * r
y = ship.y + Math.sin(a) * r
```

Gemi, böyle üç noktadan oluşan bir üçgendir: `angle`'da burun, `angle + 2.5` ve `angle - 2.5`'te (iki yana yaklaşık
143°) iki arka köşe. 1979 arcade orijinalinin parlayan vektör görünümü için onu doldurmak yerine çizgilerden bir **yol**
olarak çiz ve `stroke()` et.

# --task--

1. Store the canvas and context in `canvas` and `ctx`, and add `const SHIP_R = 14`.
2. Add `let ship` and `function resetShip()` that puts the ship in the center of the canvas, facing up
   (`angle: -Math.PI / 2`), with `vx: 0, vy: 0`.
3. Write `drawShip()`: compute the nose at `angle` and the back corners at `angle + 2.5` and `angle - 2.5`, all at
   distance `SHIP_R`; then `beginPath()`, `moveTo` the nose, `lineTo` the two corners, `closePath()` and `stroke()`.
4. `draw()`: black background, `strokeStyle = 'white'`, `lineWidth = 2`, then the ship. Call `resetShip()` and
   `draw()`.

# --task-tr--

1. Canvas'ı ve bağlamı `canvas` ile `ctx`'te tut, `const SHIP_R = 14` ekle.
2. `let ship` ve gemiyi canvas'ın ortasına, yukarı bakacak şekilde (`angle: -Math.PI / 2`), `vx: 0, vy: 0` ile koyan
   `function resetShip()` ekle.
3. `drawShip()` yaz: burnu `angle`'da, arka köşeleri `angle + 2.5` ve `angle - 2.5`'te, hepsi `SHIP_R` uzaklıkta hesapla;
   sonra `beginPath()`, buruna `moveTo`, iki köşeye `lineTo`, `closePath()` ve `stroke()`.
4. `draw()`: siyah arka plan, `strokeStyle = 'white'`, `lineWidth = 2`, sonra gemi. `resetShip()` ve `draw()` çağır.

# --tests--

The ship should start in the middle, facing up.
tr: Gemi ortada, yukarı bakarak başlamalı.

```js
assert.include(ship, { x: 300, y: 225, vx: 0, vy: 0 })
assert.closeTo(ship.angle, -Math.PI / 2, 1e-9)
```

The nose should be drawn 14 pixels in the direction the ship faces.
tr: Burun, geminin baktığı yönde 14 piksel ötede çizilmeli.

```js
const start = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(start.args[0], 300, 0.001)
assert.closeTo(start.args[1], 211, 0.001)
assert.lengthOf($.screen().filter((c) => c.op === 'lineTo'), 2)
assert.isTrue($.screen().some((c) => c.op === 'stroke' && c.stroke === 'white'))
```

Turning the ship should turn its nose.
tr: Gemiyi döndürmek burnunu da döndürmeli.

```js
ship.angle = 0
draw()
const nose = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(nose.args[0], 314, 0.001)
assert.closeTo(nose.args[1], 225, 0.001)
ship.angle = Math.PI / 2
draw()
const down = $.screen().find((c) => c.op === 'moveTo')
assert.closeTo(down.args[1], 239, 0.001, 'PI / 2 points down, because y grows downwards')
```

# --seed--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
```

# --solution--

```js
// Asteroids, step by step.
// The page already has <canvas id="game" width="600" height="450"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SHIP_R = 14 // the ship's size: distance from its center to its nose

let ship

function resetShip() {
  ship = { x: canvas.width / 2, y: canvas.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
}

function drawShip() {
  const tip = { x: ship.x + Math.cos(ship.angle) * SHIP_R, y: ship.y + Math.sin(ship.angle) * SHIP_R }
  const left = { x: ship.x + Math.cos(ship.angle + 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle + 2.5) * SHIP_R }
  const right = { x: ship.x + Math.cos(ship.angle - 2.5) * SHIP_R, y: ship.y + Math.sin(ship.angle - 2.5) * SHIP_R }
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.stroke()
}

function draw() {
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2

  drawShip()
}

resetShip()
draw()
```
