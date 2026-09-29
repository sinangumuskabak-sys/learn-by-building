---
title: One place where the game ends
title_tr: Oyunun bittiği tek yer
skills: [prog.functions]
---

# --goal--

We give "the game just ended" a name: `endGame`. Everything that should happen at that moment will live in this one
function; the next step adds the best score there.

# --goal-tr--

"Oyun şimdi bitti" anına bir **ad** veriyoruz: `endGame` (oyunu bitir). O anda olması gereken her şey bu tek fonksiyonda
duracak. Bir sonraki adımda buraya rekor kaydını ekleyeceğiz; ileride bir ses ya da madalya eklemek istersen de yine
buraya eklersin.

Oyun aynı görünecek.

# --code--

```js
function endGame() {
  state = 'over'
}

  if (hitGround || hitSky || pipes.some(hitsPipe)) endGame()
```

# --meaning--

- `endGame` sets the state to `'over'` for now.
- `update` calls it instead of setting the state itself.

# --meaning-tr--

- `function endGame() { state = 'over' }` → şimdilik tek iş: durumu `'over'` yapmak.
- `update` içinde `state = 'over'` yerine `endGame()` → oyun nereden biterse bitsin (yer, tavan, boru), hep aynı
  kapıdan geçer.

# --task--

1. Under `hitsPipe`, leave an empty line and write `endGame`.
2. In `update`, replace `state = 'over'` at the end of the last line with `endGame()`.

# --task-tr--

1. `hitsPipe` fonksiyonunun kapanan `}` işaretinin altına bir boş satır bırak ve `endGame`'i yaz.
2. `update`'in son satırında `state = 'over'` kısmını `endGame()` yap.
3. **Çalıştır**: oyun aynı çalışmalı.

# --tests--

`endGame()` should end the game.
tr: `endGame()` oyunu bitirmeli.

```js
state = 'playing'
endGame()
assert.strictEqual(state, 'over')
```

Hitting the ground should still end the game.
tr: Yere çarpmak oyunu yine bitirmeli.

```js
state = 'playing'
bird.y = 590
update()
assert.strictEqual(state, 'over')
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
