---
title: Try again
title_tr: Yeniden dene
skills: [game.state, prog.functions]
---

# --goal--

After a crash, Space (or a tap) should bring back a fresh run. All the starting values move into a `reset` function,
which runs at the start and again after every game over.

# --goal-tr--

Çarptıktan sonra Boşluk (ya da dokunuş) **yeni bir koşu** getirsin. Bunun için bütün başlangıç değerlerini tek bir
`reset` (sıfırla) fonksiyonuna taşıyoruz: oyun açılırken bir kez, her oyun bitişinden sonra yeniden çalışır.

# --code--

```js
let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let nextIn // frames until the next obstacle

function reset() {
  runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  nextIn = 60
}

  if (state === 'over') {
    reset()
    return
  }

reset()
```

# --meaning--

- The variables are declared without values at the top; `reset` gives them their starting values.
- After a game over, a jump resets instead of jumping (and the next jump starts the run).
- `reset()` at the bottom sets up the first run.

# --meaning-tr--

- `let runner` ... → değişkenler en üstte **değersiz** tanımlanır; değerleri `reset` verir. İçeride `let` yok: yukarıdaki
  değişkenlere **değer atıyoruz**.
- `jump` başında: oyun bittiyse zıplama yerine `reset()` ve `return`. Sonraki basış yeni koşuyu başlatır.
- En alttaki `reset()` → ilk koşuyu kurar, sonra döngü başlar.

# --task--

1. Replace the five variable lines with plain declarations and the `reset` function.
2. At the top of `jump`, write the game-over block.
3. Call `reset()` right above `requestAnimationFrame(loop)` at the bottom.

# --task-tr--

1. `let runner = { ... }` satırından `let nextIn = 60 ...` satırına kadar olan beş satırı değersiz tanımlarla ve
   `reset` fonksiyonuyla değiştir.
2. `jump` fonksiyonunun en başına oyun bitti bloğunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının üstüne `reset()` yaz.
4. **Çalıştır**, çarp ve Boşluk'a bas.

# --tests--

After a game over, a jump should bring back a fresh, waiting run.
tr: Oyun bitince bir zıplama yeni, bekleyen bir koşu getirmeli.

```js
state = 'over'
obstacles = [{ x: 70, y: 140, w: 20, h: 40 }]
runner.y = 100
$.tap(' ')
assert.strictEqual(state, 'ready')
assert.lengthOf(obstacles, 0)
assert.strictEqual(runner.y, 136)
assert.strictEqual(speed, 6)
```

The next jump should start running again.
tr: Sonraki zıplama koşuyu yeniden başlatmalı.

```js
state = 'over'
$.tap(' ')
$.tap(' ')
assert.strictEqual(state, 'running')
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const JUMP = -11 // speed at the start of a jump (negative = up)
const CUT = -4 // letting go early caps the upward speed at this
const MARGIN = 6 // forgiving hitboxes: shrink both boxes by this much
const STAND_H = 44

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let nextIn // frames until the next obstacle

function reset() {
  runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  nextIn = 60
}

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (state === 'over') {
    reset()
    return
  }
  state = 'running'
  if (onGround()) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function spawn() {
  obstacles.push({ x: canvas.width, y: GROUND - 40, w: 20, h: 40 })
  // At least 50 frames apart, so there is always room to land and jump again.
  nextIn = 50 + Math.floor(Math.random() * 70)
}

function hits(o) {
  return (
    runner.x + MARGIN < o.x + o.w &&
    runner.x + runner.w - MARGIN > o.x &&
    runner.y + MARGIN < o.y + o.h &&
    runner.y + runner.h - MARGIN > o.y
  )
}

function update() {
  if (state !== 'running') return

  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) {
    state = 'over'
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  for (const o of obstacles) {
    ctx.fillStyle = '#15803d'
    ctx.fillRect(o.x, o.y, o.w, o.h)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to start', canvas.width / 2, canvas.height / 2)
  }
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Press Space to try again', canvas.width / 2, canvas.height / 2 + 28)
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
