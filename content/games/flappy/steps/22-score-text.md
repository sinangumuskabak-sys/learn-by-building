---
title: Show the score
title_tr: Skoru göster
skills: [game.canvas]
---

# --goal--

The score is drawn as a big white number, centered near the top. `fillText` wants text, so `String(score)` turns the
number into text.

# --goal-tr--

Skoru ekranın üstünde, ortada, **kocaman beyaz bir sayı** olarak göstereceğiz. Oyuncu gözünü borulardan ayırmadan
görebilsin.

# --code--

```js
ctx.textAlign = 'center'
ctx.font = 'bold 40px sans-serif'
ctx.fillText(String(score), canvas.width / 2, 70)
```

# --meaning--

- The color (`white`) and centering come from the two lines above.
- `String(7)` is `'7'`: `fillText` writes text.
- (200, 70) is the middle, 70 pixels from the top.

# --meaning-tr--

- `ctx.textAlign = 'center'` satırı zaten vardı; yeni satırlar onun altına geliyor. Renk bir üstteki `'white'`'tan gelir.
- `ctx.font = 'bold 40px sans-serif'` → kalın, 40 piksel.
- `String(score)` → sayıyı (`7`) yazıya (`'7'`) çevirir. `fillText` yazı ister.
- `canvas.width / 2, 70` → yatayda tam orta, yukarıdan 70 piksel aşağı.
- Bu iki satır `if`'lerin **dışında**: skor her aşamada görünür.

# --task--

In `draw`, under `ctx.textAlign = 'center'`, write the two lines.

# --task-tr--

`draw` içinde `ctx.textAlign = 'center'` satırının hemen **altına** iki satırı yaz (`if (state === 'ready')` satırından önce). **Çalıştır**: üstte `0` görmelisin; oynayınca artmalı.

# --tests--

The score should be drawn at the top.
tr: Skor üstte çizilmeli.

```js
score = 7
draw()
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === '7')
assert.exists(text, 'the score 7 should be drawn')
assert.deepEqual(text.args.slice(1, 3), [200, 70])
assert.strictEqual(text.fill, 'white')
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
let score = 0
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
  pipes.push({ x: canvas.width, gapY, passed: false })
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
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
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
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(String(score), canvas.width / 2, 70)
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
