---
title: A function for a fresh start
title_tr: Temiz başlangıç fonksiyonu
skills: [game.state, prog.functions]
---

# --goal--

To play again, every piece of state must go back to its start. We collect the starting values in one function,
`reset`, and the first game starts through it too.

# --goal-tr--

Tekrar oynayabilmek için bütün durum bilgileri (kuş, borular, sayaç, skor, aşama) **başlangıç hâline** dönmeli. Bunları
tek bir fonksiyonda topluyoruz: `reset` (sıfırla). İlk oyun da aynı yoldan başlayacak.

Neden? İlk oyun bir koddan, onuncu oyun başka bir koddan başlarsa, er ya da geç farklı başlarlar ve bu hatayı bulmak çok
zordur. Başlangıç hâli **tek bir yerde** yazılı olmalı. Ekran aynı kalacak.

# --code--

```js
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

reset()
requestAnimationFrame(loop)
```

# --meaning--

- The `let` lines now only declare the names; `reset` gives them their values.
- `reset()` at the very bottom sets up the first game, before the loop starts.

# --meaning-tr--

- `let bird`, `let pipes`... → değişkenleri en üstte yalnız **tanıtıyoruz** (değer vermeden). Böyle bir değişken
  şimdilik boştur; JavaScript buna `undefined` ("tanımsız") der. En üstte durmaları gerekir ki bütün fonksiyonlar
  onları görebilsin.
- `function reset() { ... }` → beş bilginin başlangıç değerleri. Eskiden `let` satırlarında yazılı olan değerler
  buraya taşındı.
- Son iki satır dosyanın **en altında**: `reset()` ilk oyunu hazırlar, sonra döngü başlar. Sıra önemli: boş bir `bird`
  ile çizmeye kalkarsak hata olur.

# --task--

1. Replace the five `let` lines with the five lines without values and the `reset` function.
2. At the very bottom, write `reset()` above `requestAnimationFrame(loop)`.

# --task-tr--

1. `let bird = ...`, `let pipes = []`, `let frame = 0`, `let score = 0` ve `let state = ...` satırlarını sil.
2. Yerine değersiz beş `let` satırını ve altına, bir boş satırdan sonra, `reset` fonksiyonunu yaz.
3. Dosyanın **en altında**, `requestAnimationFrame(loop)` satırının üstüne `reset()` yaz.
4. **Çalıştır**: oyun eskisi gibi çalışmalı.

# --hint--

If the game shows an error about `bird`, the `reset()` call at the bottom is missing or comes after the loop starts.

# --hint-tr--

`bird` ile ilgili bir hata görüyorsan en alttaki `reset()` çağrısı eksik ya da `requestAnimationFrame(loop)` satırının altında kalmış.

# --tests--

`reset()` should restore a fresh game.
tr: `reset()` yepyeni bir oyun getirmeli.

```js
bird = { x: 1, y: 2, vy: 3, r: 4 }
pipes = [{ x: 10, gapY: 100, passed: true }]
frame = 55
score = 9
state = 'over'
reset()
assert.deepEqual(bird, { x: 100, y: 300, vy: 0, r: 14 })
assert.deepEqual(pipes, [])
assert.strictEqual(frame, 0)
assert.strictEqual(score, 0)
assert.strictEqual(state, 'ready')
```

The first game should start ready.
tr: İlk oyun hazır başlamalı.

```js
$.tick()
assert.strictEqual(state, 'ready')
assert.deepEqual($.arcs(), [{ x: 100, y: 300, r: 14, color: 'gold' }])
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

reset()
requestAnimationFrame(loop)
```
