---
title: Crashing into pipes
title_tr: Borulara çarpmak
skills: [game.collision]
---

# --explanation--

Pipes you can fly through are not much of a challenge. You need **collision detection**: does the bird overlap a
pipe?

Exact circle-versus-rectangle math exists, but games often use a cheaper trick: treat the bird as the **square box**
around its circle (`x - r` to `x + r`, `y - r` to `y + r`). Checking boxes is just comparing edges.

Break the question into two simple ones:

1. **Is the bird level with the pipe?** Their horizontal ranges overlap when the bird's right edge is past the pipe's
   left edge *and* the bird's left edge is before the pipe's right edge:
   ```js
   bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
   ```
2. **Is it fully inside the opening?** Its top edge is below `gapY` and its bottom edge is above `gapY + GAP`.

The bird crashes when **1 is true and 2 is false**. Naming each part (`overlapsX`, `insideGap`) makes the rule
readable, and much easier to debug when it goes wrong.

`array.some(fn)` then answers "does the bird hit *any* pipe?" in one line.

# --explanation-tr--

İçinden geçilebilen borular pek zorlayıcı değil. **Çarpışma tespiti** gerekiyor: kuş bir boruyla üst üste biniyor mu?

Dairenin dikdörtgenle tam kesişim matematiği var, ama oyunlar çoğu zaman daha ucuz bir hile kullanır: kuşu, dairesini
çevreleyen **kare kutu** gibi düşün (`x - r`'den `x + r`'ye, `y - r`'den `y + r`'ye). Kutuları kontrol etmek yalnızca
kenarları karşılaştırmaktır.

Soruyu iki basit soruya böl:

1. **Kuş borunun hizasında mı?** Yatay aralıkları, kuşun sağ kenarı borunun sol kenarını geçtiğinde *ve* kuşun sol
   kenarı borunun sağ kenarından önce olduğunda kesişir:
   ```js
   bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
   ```
2. **Tamamen açıklığın içinde mi?** Üst kenarı `gapY`'nin altında, alt kenarı `gapY + GAP`'in üstünde.

Kuş, **1 doğru ve 2 yanlış** olduğunda çarpar. Her parçaya ad vermek (`overlapsX`, `insideGap`) kuralı okunur yapar
ve bir şeyler ters gittiğinde hata ayıklamayı çok kolaylaştırır.

`array.some(fn)` ise "kuş *herhangi bir* boruya çarpıyor mu?" sorusunu tek satırda cevaplar.

# --task--

1. Write `function hitsPipe(pipe)` that returns `true` when the bird's box overlaps the pipe horizontally and is not
   fully inside the gap (see the two conditions above).
2. In `update()`, also end the game (`state = 'over'`) when `pipes.some(hitsPipe)` is true.

# --task-tr--

1. Kuşun kutusu boruyla yatayda kesişiyor ve açıklığın tamamen içinde değilse `true` döndüren
   `function hitsPipe(pipe)` yaz (yukarıdaki iki koşul).
2. `update()` içinde `pipes.some(hitsPipe)` doğru olduğunda da oyunu bitir (`state = 'over'`).

# --tests--

A pipe far away should not hit the bird.
tr: Uzaktaki bir boru kuşa çarpmamalı.

```js
bird = { x: 100, y: 300, vy: 0, r: 14 }
assert.isFalse(hitsPipe({ x: 300, gapY: 0 }))
assert.isFalse(hitsPipe({ x: 115, gapY: 0 }), 'the pipe starts right after the bird')
```

A pipe level with the bird should hit it unless the bird is inside the gap.
tr: Kuşun hizasındaki bir boru, kuş açıklığın içinde değilse ona çarpmalı.

```js
bird = { x: 100, y: 300, vy: 0, r: 14 }
assert.isTrue(hitsPipe({ x: 90, gapY: 400 }), 'bird is above the gap: hits the top pipe')
assert.isTrue(hitsPipe({ x: 90, gapY: 100 }), 'bird is below the gap: hits the bottom pipe')
assert.isFalse(hitsPipe({ x: 90, gapY: 250 }), 'bird is inside the gap')
assert.isTrue(hitsPipe({ x: 90, gapY: 290 }), 'the top of the bird clips the top pipe')
```

Flying into a pipe should end the game.
tr: Bir boruya uçmak oyunu bitirmeli.

```js
state = 'playing'
pipes = [{ x: 90, gapY: 400 }]
update()
assert.strictEqual(state, 'over')
```

Flying through the gap should not end the game.
tr: Açıklıktan geçmek oyunu bitirmemeli.

```js
state = 'playing'
pipes = [{ x: 90, gapY: 240 }]
update()
assert.strictEqual(state, 'playing')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)
const PIPE_WIDTH = 60
const GAP = 160
const PIPE_SPEED = 2
const PIPE_EVERY = 90 // frames between new pipes

let bird = { x: 100, y: 300, vy: 0, r: 14 }
let state = 'ready' // 'ready', 'playing' or 'over'
let pipes = []
let frame = 0

function flap() {
  if (state === 'over') return
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY })
}

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
  return overlapsX && !insideGap
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) pipe.x -= PIPE_SPEED
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky || pipes.some(hitsPipe)) state = 'over'
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'green'
  for (const pipe of pipes) {
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY)
    ctx.fillRect(pipe.x, pipe.gapY + GAP, PIPE_WIDTH, canvas.height - pipe.gapY - GAP)
  }

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
