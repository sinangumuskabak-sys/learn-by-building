---
title: "Build it yourself: a medal"
title_tr: "Kendin yap: madalya"
skills: [game.state, game.canvas]
---

# --goal--

Your game, your idea. Give the player a medal on the Game Over screen: bronze from 10 points, silver from 20, gold
from 40.

# --goal-tr--

Oyun senin! Oyun sonu ekranında oyuncuya **madalya** ver: 10 puandan itibaren bronz, 20'den itibaren gümüş, 40'tan
itibaren altın.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `score`, `if` ya da kısa soru (`? :`), `fillText`... Kontroller
çalıştığında yeşile döner.

# --task--

On the Game Over screen, write `Bronze` (score 10 or more), `Silver` (20 or more) or `Gold` (40 or more). Below 10
there is no medal. Only one medal at a time.

# --task-tr--

- Yalnız **oyun sonu** ekranında (`state === 'over'`), `Press Space to try again` yazısının altına madalyayı yaz.
- Skor 10 ya da fazlaysa `Bronze`, 20 ya da fazlaysa `Silver`, 40 ya da fazlaysa `Gold` yazsın (yanına `medal` gibi
  bir kelime ekleyebilirsin).
- 10'un altında madalya yok. Aynı anda tek madalya: 45 puan yalnız altın.

Değiştireceğin yer `draw` fonksiyonu. Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Inside the `if (state === 'over')` block, pick the medal from the top down: check 40 first, then 20, then 10.

# --hint-tr--

`draw` içindeki `if (state === 'over') {` bloğunda madalyayı **yukarıdan aşağı** seç: önce 40'a, sonra 20'ye, sonra
10'a bak. Kısa soruları zincirleyebilirsin: `score >= 40 ? 'Gold' : score >= 20 ? 'Silver' : ...`. Önce 10'a bakarsan
45 puan da bronz alır!

# --tests--

A score of 10 or more should earn a bronze medal.
tr: 10 ya da daha fazla puan bronz madalya kazandırmalı.

```js
state = 'over'
score = 12
draw()
const shown = $.texts().join(' ')
assert.match(shown, /bronze/i)
assert.notMatch(shown, /silver|gold/i)
```

20 or more should earn silver, 40 or more gold, one medal at a time.
tr: 20 ve üstü gümüş, 40 ve üstü altın; aynı anda tek madalya.

```js
state = 'over'
score = 25
draw()
assert.match($.texts().join(' '), /silver/i)
assert.notMatch($.texts().join(' '), /bronze|gold/i)
score = 45
draw()
assert.match($.texts().join(' '), /gold/i)
assert.notMatch($.texts().join(' '), /bronze|silver/i)
```

No medal below 10, and none while playing.
tr: 10'un altında ve oyun sürerken madalya olmamalı.

```js
state = 'over'
score = 9
draw()
assert.notMatch($.texts().join(' '), /bronze|silver|gold/i)
state = 'playing'
score = 45
draw()
assert.notMatch($.texts().join(' '), /bronze|silver|gold/i)
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
    const medal = score >= 40 ? 'Gold' : score >= 20 ? 'Silver' : score >= 10 ? 'Bronze' : ''
    if (medal) ctx.fillText(medal + ' medal', canvas.width / 2, canvas.height / 2 + 70)
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
