---
title: Through the opening
title_tr: Açıklıktan geç
skills: [game.collision]
---

# --goal--

Collision, part two: is the bird fully inside the opening? Its top edge is below `gapY` and its bottom edge above
`gapY + GAP`. The bird crashes when it is level with the pipe **and not** inside the opening.

# --goal-tr--

İkinci soru: **kuş tamamen açıklığın içinde mi?** Üst kenarı açıklığın başladığı yerin altında **ve** alt kenarı
açıklığın bittiği yerin üstündeyse, evet.

Kuş, **hizadaysa ve açıklığın içinde değilse** çarpar. Her parçaya bir ad vermek (`overlapsX`, `insideGap`) kuralı
okunur yapar; bir şey ters gidince hatayı bulmak da kolaylaşır.

# --code--

```js
const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
return overlapsX && !insideGap
```

# --meaning--

- `insideGap` is true when the bird's box is fully between `gapY` and `gapY + GAP`.
- `!` means "not": `!insideGap` is true when the bird is not inside the opening.

# --meaning-tr--

- `bird.y - bird.r > pipe.gapY` → kuşun **üst kenarı** açıklığın başladığı yerin **altında** mı? (y aşağı büyür;
  büyük y daha aşağı demek.)
- `bird.y + bird.r < pipe.gapY + GAP` → kuşun **alt kenarı** açıklığın bittiği yerin **üstünde** mi?
- İkisi birden doğruysa `insideGap` (açıklığın içinde) doğru.
- `!` → "**değil**": doğruyu yanlışa, yanlışı doğruya çevirir. `!insideGap` = "açıklığın içinde değil".
- `return overlapsX && !insideGap` → hizada **ve** açıklığın içinde değil: çarptı.

# --task--

In `hitsPipe`, add the `insideGap` line under `overlapsX`, and change the `return` line.

# --task-tr--

1. `hitsPipe` içinde `overlapsX` satırının altına `insideGap` satırını yaz.
2. `return overlapsX` satırını `return overlapsX && !insideGap` yap.
3. **Çalıştır** ve oyna: artık açıklıktan geçebilmelisin; borulara değersen oyun biter.

# --hint--

Check the direction of `>` and `<`, and the `!` in front of `insideGap`.

# --hint-tr--

`>` ve `<` işaretlerinin yönünü ve `insideGap`'in önündeki `!` işaretini kontrol et.

# --tests--

The bird should hit a pipe unless it is fully inside the opening.
tr: Kuş tamamen açıklığın içinde değilse boruya çarpmalı.

```js
bird = { x: 100, y: 300, vy: 0, r: 14 }
assert.isTrue(hitsPipe({ x: 90, gapY: 400 }), 'bird is above the gap: hits the top pipe')
assert.isTrue(hitsPipe({ x: 90, gapY: 100 }), 'bird is below the gap: hits the bottom pipe')
assert.isFalse(hitsPipe({ x: 90, gapY: 250 }), 'bird is inside the gap')
assert.isTrue(hitsPipe({ x: 90, gapY: 290 }), 'the top of the bird clips the top pipe')
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
let pipes = []
let frame = 0
let state = 'ready' // 'ready', 'playing' or 'over'

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
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
  }
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
