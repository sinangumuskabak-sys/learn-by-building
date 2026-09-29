---
title: Remember the best score
title_tr: Rekoru hatırla
skills: [game.state]
---

# --goal--

The best score is kept in `localStorage`, the browser's little notebook, which survives page reloads. It is read once
at the start and updated when a game ends with a better score.

# --goal-tr--

Rekorunu kırmak insanı oyuna geri getirir. Ama normal değişkenler sayfa yenilenince sıfırlanır. **`localStorage`**
tarayıcının küçük bir **defteri** gibidir: içine yazdığın şey sayfayı yenilesen de kalır.

Rekoru oyun başında defterden okuyacağız; oyun daha yüksek bir skorla bitince deftere yazacağız.

# --code--

```js
let best = Number(localStorage.getItem('flappy-best')) || 0

function endGame() {
  state = 'over'
  if (score > best) {
    best = score
    localStorage.setItem('flappy-best', best)
  }
}
```

# --meaning--

- `localStorage.getItem('flappy-best')` reads the saved text, or `null` if there is none.
- `Number(...)` turns the text into a number; `|| 0` uses 0 when there is no best yet.
- In `endGame`, a higher score becomes the new best and is saved with `setItem`.

# --meaning-tr--

- `localStorage.getItem('flappy-best')` → defterde `'flappy-best'` başlığı altında ne yazıyor? Defter her şeyi
  **yazı** olarak saklar (`'3'`); hiç yazılmamışsa `null` ("hiçbir şey") verir.
- `Number(...)` → yazıyı sayıya çevirir: `'3'` → `3`.
- `|| 0` → "soldaki işe yarar bir değer değilse (boş ya da sıfırsa) `0` kullan". Rekor yoksa `best` 0 olur.
- `best` `reset`'in içinde değil: yeni oyunda skor sıfırlanır ama rekor kalır.
- `if (score > best) {` → skor rekordan büyükse...
  - `best = score` → yeni rekor,
  - `localStorage.setItem('flappy-best', best)` → deftere yaz.

# --task--

1. Under `let state // ...`, write the `best` line.
2. In `endGame`, under `state = 'over'`, write the `if` block.

# --task-tr--

1. `let state // ...` satırının hemen altına `best` satırını yaz.
2. `endGame` içinde `state = 'over'` satırının altına `if` bloğunu yaz.
3. **Çalıştır**. Rekor henüz ekranda görünmüyor; kontroller defteri deneyecek.

# --hint--

`'flappy-best'` must be spelled exactly the same in `getItem` and `setItem`.

# --hint-tr--

`'flappy-best'` yazısı `getItem` ve `setItem` içinde birebir aynı olmalı.

# --tests--

`best` should start at 0 when nothing is saved.
tr: Hiçbir şey kayıtlı değilken `best` 0'dan başlamalı.

```js
assert.strictEqual(best, 0)
```

A new best score should be saved when the game ends.
tr: Oyun bittiğinde yeni rekor kaydedilmeli.

```js
state = 'playing'
score = 3
bird.y = 590
update()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 3)
assert.strictEqual(localStorage.getItem('flappy-best'), '3')
```

A lower score should not replace the best.
tr: Daha düşük bir skor rekorun yerini almamalı.

```js
best = 10
score = 4
endGame()
assert.strictEqual(best, 10)
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
