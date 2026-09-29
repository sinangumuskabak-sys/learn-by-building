---
title: Show the best score
title_tr: Rekoru göster
skills: [game.canvas]
---

# --goal--

Under the score we write `Best: 3` (with the real number), in smaller text.

# --goal-tr--

Rekor ekranda görünmezse kırmanın tadı çıkmaz. Skorun hemen altına, daha küçük yazıyla `Best: 3` (en iyi: 3) gibi
rekoru yazacağız.

# --code--

```js
ctx.font = '16px sans-serif'
ctx.fillText('Best: ' + best, canvas.width / 2, 95)
```

# --meaning--

- `'Best: ' + best` glues the text and the number together: `'Best: 3'`.

# --meaning-tr--

- `ctx.font = '16px sans-serif'` → skordan küçük, 16 piksel.
- `'Best: ' + best` → yazılarda `+` "toplamak" değil **ucuna eklemek** demek: `best` 3 ise sonuç `'Best: 3'`.
- `canvas.width / 2, 95` → ortada, skorun (70) biraz altında.

# --task--

In `draw`, under the score's `fillText`, write the two lines.

# --task-tr--

`draw` içinde skoru yazan `ctx.fillText(String(score), ...)` satırının hemen **altına** iki satırı yaz. **Çalıştır**, bir kez oyna ve kaybet: rekorun görünmeli; sayfayı yenilesen de kalmalı.

# --try--

Beat your best, then press Run again: the best is still there, read back from `localStorage`.

# --try-tr--

Rekorunu kır, sonra yeniden **Çalıştır**'a bas: rekor hâlâ orada, `localStorage` defterinden okundu.

# --tests--

The best score should be drawn under the score.
tr: Rekor skorun altında yazılmalı.

```js
best = 3
draw()
assert.include($.texts(), 'Best: 3')
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

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
