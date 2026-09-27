---
title: A table of lines
title_tr: Çizgilerden bir masa
skills: [game.canvas, prog.arrays]
---

# --explanation--

A pinball table is walls, bumpers and flippers. The walls are the simplest part, and the most flexible way to describe them is as
a list of **line segments**, each `[x1, y1, x2, y2]`.

That one idea goes a long way. A curved top is just a few short segments at angles; the launch lane on the right is two long
parallel segments and a floor; the slopes that guide the ball towards the flippers are two more. To change the table you edit the
list, and every later rule (collisions) works for any shape you draw with it.

Drawing is one loop: for every segment, a path from one end to the other, stroked. `lineCap = 'round'` rounds the ends so the
corners where segments meet look joined.

The ball starts at the bottom of the launch lane, waiting.

# --explanation-tr--

Bir pinball masası duvarlar, tamponlar ve paletlerdir. Duvarlar en basit kısımdır ve onları tanımlamanın en esnek yolu, her biri
`[x1, y1, x2, y2]` olan bir **doğru parçaları** listesidir.

Bu tek fikir çok yol alır. Kavisli bir tepe, açılı birkaç kısa parçadan ibarettir; sağdaki fırlatma kanalı iki uzun paralel parça ve
bir zemindir; topu paletlere yönlendiren eğimler iki parça daha. Masayı değiştirmek için listeyi düzenlersin ve sonraki her kural
(çarpışmalar) onunla çizdiğin her şekil için çalışır.

Çizmek tek bir döngüdür: her parça için bir uçtan diğerine bir yol çiz. `lineCap = 'round'` uçları yuvarlar; böylece parçaların
buluştuğu köşeler birleşik görünür.

Top fırlatma kanalının dibinde bekleyerek başlar.

# --task--

1. Add `R = 8`, `LANE_X = 375` and `WALLS` (the list in the solution: the outline, the launch lane and the two slopes).
2. Write `newBall()`, which puts `ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }`, and `reset()`, which calls it.
3. Draw the table `'#0c0a09'`, every wall as a `'#a8a29e'` line 4 wide with round caps, and the ball as a `'#e7e5e4'` circle.

# --task-tr--

1. `R = 8`, `LANE_X = 375` ve `WALLS`'u (çözümdeki liste: dış hat, fırlatma kanalı ve iki eğim) ekle.
2. `ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }` yapan `newBall()`'u ve onu çağıran `reset()`'i yaz.
3. Masayı `'#0c0a09'`, her duvarı yuvarlak uçlu, 4 kalınlığında `'#a8a29e'` bir çizgi ve topu `'#e7e5e4'` bir daire olarak çiz.

# --tests--

The walls should be a list of segments, four numbers each.
tr: Duvarlar her biri dört sayıdan oluşan bir parçalar listesi olmalı.

```js
assert.isAtLeast(WALLS.length, 10)
for (const w of WALLS) assert.lengthOf(w, 4)
assert.deepInclude(WALLS, [20, 470, 20, 120], 'the left wall')
```

Every wall should be drawn as one line.
tr: Her duvar bir çizgi olarak çizilmeli.

```js
$.tick(1)
assert.lengthOf($.screen().filter((c) => c.op === 'stroke'), WALLS.length, 'one line per wall')
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.join())
assert.include(ends, '20,120')
```

The ball should wait in the launch lane.
tr: Top fırlatma kanalında beklemeli.

```js
$.tick(1)
assert.deepInclude($.arcs(), { x: LANE_X, y: 570, r: R, color: '#e7e5e4' }, 'the ball waits in the launch lane')
```

# --seed--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

function reset() {
  newBall()
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
