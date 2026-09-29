---
title: No catching up after a pause
title_tr: Aradan sonra telafi yok
skills: [game.loop]
---

# --goal--

If the tab was in the background for 10 seconds, `time - last` is huge and the loop would run 600 updates at once.
We cap each deposit at 100 ms.

# --goal-tr--

Bir sorun daha: oyunun sekmesi 10 saniye arka planda kaldıysa, dönüşte `time - last` **10.000 ms** olur ve döngü bir
anda 600 güncelleme yapmaya kalkar. Kuş sen daha ne olduğunu anlamadan yere çakılır, yavaş cihazlarda oyun donar. Buna
"ölüm sarmalı" denir.

Çözüm basit: kumbaraya bir seferde en fazla **100 ms** at.

# --code--

```js
lag += Math.min(time - last, 100)
```

# --meaning--

- `Math.min(a, b)` is the smaller of the two numbers: at most 100 ms (6 steps) per frame.

# --meaning-tr--

- `Math.min(a, b)` → iki sayıdan **küçüğünü** verir. Normalde `time - last` 16,7 gibi küçük bir sayı; o kullanılır.
  Uzun bir aradan sonra 10.000 olur; o zaman 100 kullanılır.
- 100 ms en fazla 6 adım demek: aradan sonra oyun kaldığı yerden sakince sürer.

# --task--

In `loop`, change the `lag` line as shown.

# --task-tr--

`loop` içindeki `lag += time - last` satırını `lag += Math.min(time - last, 100)` yap. **Çalıştır**: oyun aynı görünmeli. Tebrikler, oyunun bitti!

# --tests--

A long pause should not trigger hundreds of updates at once.
tr: Uzun bir duraklama bir anda yüzlerce güncellemeyi tetiklememeli.

```js
state = 'playing'
bird.y = 300
bird.vy = 0
loop(10000)
assert.isAtMost(frame, 6)
```

Normal frames should still make one update each.
tr: Normal kareler yine birer güncelleme yapmalı.

```js
state = 'playing'
for (let i = 1; i <= 60; i++) {
  bird.y = 300
  bird.vy = 0
  loop((i * 1000) / 60)
}
assert.isAtLeast(frame, 59)
assert.isAtMost(frame, 60)
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

let bird
let pipes
let frame
let score
let state // 'ready', 'playing' or 'over'
let best = Number(localStorage.getItem('flappy-best')) || 0

function reset() {
  bird = { x: 100, y: 300, vy: 0, r: 14 }
  pipes = []
  frame = 0
  score = 0
  state = 'ready'
}

function flap() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'playing'
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function addPipe() {
  const gapY = 60 + Math.random() * (canvas.height - GAP - 120)
  pipes.push({ x: canvas.width, gapY, passed: false })
}

function hitsPipe(pipe) {
  const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + PIPE_WIDTH
  const insideGap = bird.y - bird.r > pipe.gapY && bird.y + bird.r < pipe.gapY + GAP
  return overlapsX && !insideGap
}

function endGame() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('flappy-best', best)
  }
}

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
  }
  pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky || pipes.some(hitsPipe)) endGame()
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
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(String(score), canvas.width / 2, 70)
  ctx.font = '16px sans-serif'
  ctx.fillText('Best: ' + best, canvas.width / 2, 95)
  if (state === 'ready') {
    ctx.font = '22px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2 + 80)
  }
  if (state === 'over') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 34)
  }
}

const STEP = 1000 / 60 // one physics step, in milliseconds
let last = 0
let lag = 0

function loop(time) {
  // Run the physics at a fixed 60 steps per second, whatever the screen's refresh rate.
  lag += Math.min(time - last, 100)
  last = time
  while (lag >= STEP) {
    update()
    lag -= STEP
  }
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
