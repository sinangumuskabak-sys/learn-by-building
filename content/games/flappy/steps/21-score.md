---
title: Score each pipe once
title_tr: Her boruyu bir kez say
skills: [game.state]
---

# --goal--

A pipe scores when it has fully passed the bird. But that stays true for every frame until the pipe leaves the
screen. A `passed` flag on each pipe makes sure it counts only once.

# --goal-tr--

Puan ne zaman verilir? Boru kuşu **tamamen geçtiğinde**: borunun sağ kenarı kuşun sol kenarının solunda kalınca.

**Tuzak:** bu koşul, boru ekrandan çıkana kadar **her karede** doğru kalır. Her doğru olduğunda puan verirsek tek boru
40 puan eder! Çözüm, her borunun üstüne bir **bayrak** koymak: "bu boruyu saydım mı?" Bir kez sayınca bayrağı kaldır.

# --code--

```js
let score = 0

  pipes.push({ x: canvas.width, gapY, passed: false })

  for (const pipe of pipes) {
    pipe.x -= PIPE_SPEED
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {
      pipe.passed = true
      score += 1
    }
  }
```

# --meaning--

- New pipes start with `passed: false`.
- The `if` scores only a pipe that is not passed yet **and** is fully behind the bird; then it marks it as passed.
- On the next frames `!pipe.passed` is false, so the same pipe never scores again.

# --meaning-tr--

- `let score = 0` → skor.
- `passed: false` → yeni borular "henüz sayılmadı" diye doğar. `false` (yanlış/hayır) ve `true` (doğru/evet) tırnaksız
  yazılır; yazı değil, doğru/yanlış değerleridir.
- `if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - bird.r) {` → "bu boru **henüz sayılmadıysa** ve kuşu
  **tamamen geçtiyse**..."
  - `pipe.passed = true` → "...sayıldı diye işaretle"
  - `score += 1` → "...ve skoru bir artır".
- Sonraki karelerde `pipe.passed` artık `true`; `!pipe.passed` yanlış olur ve puan tekrar verilmez.
- "Bu zaten oldu mu?" bayrakları oyun kodunda her yerdedir: bir kez açılan kapı, bir kez çalan ses...

# --task--

1. Under `let frame = 0`, write `let score = 0`.
2. In `addPipe`, add `passed: false` to the new pipe.
3. In `update`, inside the pipe loop, under `pipe.x -= PIPE_SPEED`, write the `if` block.

# --task-tr--

1. `let frame = 0` satırının altına `let score = 0` yaz.
2. `addPipe` içindeki `pipes.push(...)` satırında `gapY`'den sonra `, passed: false` ekle.
3. `update` içinde boru döngüsünde, `pipe.x -= PIPE_SPEED` satırının **altına** `if` bloğunu yaz (döngünün `}`
   işaretinden önce).
4. **Çalıştır**. Skor henüz ekranda görünmüyor; kontroller sayıyı deneyecek.

# --predict--

Without the `passed` flag, how many points would one pipe give?
- [ ] 1
- [x] Many: one for every frame until the pipe leaves the screen
  The "fully passed" condition stays true for dozens of frames.
- [ ] 0

# --predict-tr--

`passed` bayrağı olmasaydı tek boru kaç puan verirdi?
- [ ] 1
- [x] Çok: boru ekrandan çıkana kadar her karede bir
  "Tamamen geçti" koşulu onlarca kare boyunca doğru kalır.
- [ ] 0

# --hint--

Check the `!` in `!pipe.passed` and the direction of `<`.

# --hint-tr--

`!pipe.passed` içindeki ünlemi ve `<` işaretinin yönünü kontrol et.

# --tests--

New pipes should start with `passed: false`.
tr: Yeni borular `passed: false` ile başlamalı.

```js
addPipe()
assert.isFalse(pipes[0].passed)
assert.strictEqual(score, 0)
```

A pipe should score once, when it has fully passed the bird.
tr: Bir boru, kuşu tamamen geçtiğinde bir kez puan vermeli.

```js
state = 'playing'
pipes = [{ x: 30, gapY: 250, passed: false }]
update()
assert.strictEqual(score, 0, 'the pipe is still overlapping the bird')
pipes = [{ x: 25, gapY: 250, passed: false }]
update()
assert.strictEqual(score, 1)
assert.isTrue(pipes[0].passed)
update()
update()
assert.strictEqual(score, 1, 'each pipe counts only once')
```

Playing through should earn points.
tr: Oynayarak puan kazanılmalı.

```js
flap()
for (let i = 0; i < 400; i++) {
  // Keep the bird in the middle of each gap so it survives.
  const next = pipes.find((p) => p.x + PIPE_WIDTH > bird.x - bird.r)
  bird.y = next ? next.gapY + GAP / 2 : 300
  bird.vy = 0
  update()
}
assert.strictEqual(state, 'playing')
assert.isAtLeast(score, 2)
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
