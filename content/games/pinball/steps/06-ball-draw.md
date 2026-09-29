---
title: Draw the ball
title_tr: Topu çiz
skills: [game.canvas]
---

# --goal--

Now we draw the ball wherever `ball` says: a filled circle of radius `R`.

# --goal-tr--

Topu artık görünür yapıyoruz: `ball` nerede diyorsa orada, `R` yarıçaplı, içi dolu, açık renkli bir **daire**.
Çizim her karede `ball`'a baktığı için, ileride `ball.x` ve `ball.y` değişince top da kendiliğinden hareket
edecek.

# --code--

```js
ctx.fillStyle = '#e7e5e4'
ctx.beginPath()
ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
ctx.fill()
```

# --meaning--

- `arc(x, y, r, start, end)` plans a circle around `(x, y)` with radius `r`, from angle `start` to `end`.
- Angles are in radians: `Math.PI * 2` is a full turn, so this is a whole circle.
- `fill()` fills the planned shape with `fillStyle`.

# --meaning-tr--

- `ctx.fillStyle = '#e7e5e4'` → topun rengi: kırık beyaz.
- `ctx.beginPath()` → yeni bir şekil başlat (yoksa daire son duvar çizgisine eklenirdi).
- `ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)` → bir **yay** (daire parçası) planlar:
  - `ball.x, ball.y` → merkez.
  - `R` → yarıçap.
  - `0, Math.PI * 2` → hangi açıdan hangi açıya. Açılar **radyan** ile ölçülür: `Math.PI` (π ≈ 3.14) yarım tur,
    `Math.PI * 2` tam tur. 0'dan tam tura: **bütün daire**.
- `ctx.fill()` → planlanan şeklin içini boyar. (Çizgiler `stroke()`, dolu şekiller `fill()` ile boyanır.)

# --task--

Inside `draw`, after the `for` loop that draws the walls, write the four lines.

# --task-tr--

1. `draw` fonksiyonunun içinde, duvarları çizen `for` döngüsünün kapanan `}` satırının **altına** dört satırı yaz
   (fonksiyonun kapanan `}` işaretinden önce, iki boşluk içeriden).
2. **Çalıştır**: sağ altta, kanalın dibinde beyaz bir top görmelisin.

# --hint--

`Math.PI` is written with a capital `M` and capital `PI`.

# --hint-tr--

`Math.PI` büyük `M` ve büyük `PI` ile yazılır.

# --try--

Change `Math.PI * 2` to `Math.PI` and run: only half a ball. Put it back.

# --try-tr--

`Math.PI * 2` yerine `Math.PI` yaz ve çalıştır: yarım top! Sonra geri al.

# --tests--

The ball should be drawn at its place in the launch lane.
tr: Top, fırlatma kanalındaki yerinde çizilmeli.

```js
$.tick(1)
assert.deepInclude($.arcs(), { x: 375, y: 570, r: 8, color: '#e7e5e4' })
```

The drawing should follow `ball`.
tr: Çizim `ball`'u izlemeli.

```js
ball = { x: 200, y: 300, vx: 0, vy: 0 }
$.tick(1)
assert.deepInclude($.arcs(), { x: 200, y: 300, r: 8, color: '#e7e5e4' })
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

newBall()
requestAnimationFrame(loop)
```
