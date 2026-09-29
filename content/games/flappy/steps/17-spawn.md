---
title: A pipe every 90 frames
title_tr: Her 90 karede bir boru
skills: [game.loop]
---

# --goal--

We count the frames of play in `frame`. Every 90 frames (one and a half seconds) a new pipe is added. The remainder
operator `%` tells when: `frame % 90 === 0` is true on frames 90, 180, 270...

# --goal-tr--

Borular düzenli aralıklarla gelmeli. Oyun sürerken kareleri saymak için bir **sayaç** tutacağız: `frame`. Her
**90 karede** bir (saniyede 60 kare, yani bir buçuk saniyede bir) yeni boru eklenecek.

"90'ın katı mı?" sorusunu `%` (bölümden kalan) cevaplar: `180 % 90` sıfır, `181 % 90` bir.

# --code--

```js
const PIPE_EVERY = 90 // frames between new pipes

let frame = 0

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
```

# --meaning--

- `frame` counts the frames of play; `update` adds 1 each time.
- `%` is the remainder: `frame % PIPE_EVERY` is 0 only when `frame` is a multiple of 90.
- On those frames `addPipe()` puts a new pipe at the right edge, and the loop below slides it left.

# --meaning-tr--

- `const PIPE_EVERY = 90` → kaç karede bir boru geleceği.
- `let frame = 0` → kare sayacı.
- `frame += 1` → `update` her çalıştığında (yani oyun sürerken her karede) sayaç bir artar.
- `frame % PIPE_EVERY` → `%` **bölümden kalan**: 90'ın içinde 90 bir kez var, kalan **0**. 91 için kalan 1.
- `=== 0` → kalan sıfırsa, yani `frame` 90, 180, 270... ise `addPipe()` çağrılır.
- Yeni boru sağ kenarda doğar; hemen altındaki döngü onu her karede sola kaydırır.

# --task--

1. Under `PIPE_SPEED`, write `PIPE_EVERY`.
2. Under `let pipes = []`, write `let frame = 0`.
3. In `update`, above the pipe loop, write the two `frame` lines.

# --task-tr--

1. `const PIPE_SPEED = 2` satırının altına `PIPE_EVERY` satırını yaz.
2. `let pipes = []` satırının altına `let frame = 0` yaz.
3. `update` içinde boruları kaydıran `for` döngüsünün **üstüne** iki `frame` satırını yaz.
4. **Çalıştır**, oyuna tıkla ve uç: bir buçuk saniyede bir sağdan boru gelmeli.

# --hint--

Put the two `frame` lines above the `for` loop, inside `update`, after the `if (state !== 'playing') return` line.

# --hint-tr--

İki `frame` satırı `update`'in içinde, `for` döngüsünün **üstünde** olmalı; oyun sürmüyorken sayaç da durur.

# --tests--

`PIPE_EVERY` should be 90 and `frame` should start at 0.
tr: `PIPE_EVERY` 90 olmalı, `frame` 0'dan başlamalı.

```js
assert.strictEqual(PIPE_EVERY, 90)
assert.strictEqual(frame, 0)
```

A new pipe should appear every 90 frames of play.
tr: Oyun sırasında her 90 karede bir yeni boru çıkmalı.

```js
state = 'playing'
for (let i = 0; i < 89; i++) {
  bird.y = 300
  bird.vy = 0
  update()
}
assert.lengthOf(pipes, 0)
update()
assert.lengthOf(pipes, 1)
assert.strictEqual(pipes[0].x, 398, 'the new pipe moves in the same frame')
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

function update() {
  if (state !== 'playing') return
  bird.vy += GRAVITY
  bird.y += bird.vy

  frame += 1
  if (frame % PIPE_EVERY === 0) addPipe()
  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
  }

  const hitGround = bird.y + bird.r >= canvas.height
  const hitSky = bird.y - bird.r <= 0
  if (hitGround || hitSky) state = 'over'
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
