---
title: The same speed on every screen
title_tr: Her ekranda aynı hız
skills: [game.loop, game.physics]
---

# --goal--

`requestAnimationFrame` runs once per screen refresh: 60 times a second on most screens, 120 or 144 on many phones.
Since `update` runs once per frame, the bird falls twice as fast there. We keep the physics at exactly 60 steps per
second of real time instead.

# --goal-tr--

Oyunda gizli bir hata var. `requestAnimationFrame` ekran **her yenilendiğinde** bir kez çalışır. Çoğu ekran saniyede 60
kez yenilenir, ama birçok telefon ve oyun monitörü 120 ya da 144 kez. `update` her karede bir kez çalıştığı için
120 Hz'lik ekranda kuş **iki kat hızlı** düşer; yavaş bir bilgisayarda ise oyun ağır çekimde oynar.

Çözüm: fiziği ekrandan **ayırmak**. Bir **zaman kumbarası** tutacağız: her karede gerçekten geçen süreyi kumbaraya
atacağız, kumbarada bir adımlık süre (1/60 saniye) oldukça bir `update` harcayacağız.

# --code--

```js
const STEP = 1000 / 60 // one physics step, in milliseconds
let last = 0
let lag = 0

function loop(time) {
  // Run the physics at a fixed 60 steps per second, whatever the screen's refresh rate.
  lag += time - last
  last = time
  while (lag >= STEP) {
    update()
    lag -= STEP
  }
  draw()
```

# --meaning--

- The browser passes `loop` the current time in milliseconds.
- `lag` collects the time that really passed; `while` spends it in whole steps of `STEP`.
- On a 120 Hz screen `update` runs every second frame; on a 30 Hz screen twice per frame. Either way 60 per second.
- `draw` runs once per frame, after the `while`.

# --meaning-tr--

- `const STEP = 1000 / 60` → bir fizik adımı: 1 saniye = 1000 milisaniye; 1000 / 60 ≈ **16,7 ms**.
- `let last = 0` → bir önceki karenin zamanı. `let lag = 0` → kumbarada biriken süre.
- `function loop(time)` → tarayıcı `loop`'u çağırırken ona **şu anki zamanı** (ms) verir.
- `lag += time - last` → son kareden beri geçen süreyi kumbaraya at. `last = time` → şimdiki zamanı hatırla.
- `while (lag >= STEP) { ... }` → **`while` döngüsü**: "koşul doğru olduğu **sürece** tekrarla". Kumbarada bir
  adımlık süre oldukça bir `update` yap ve o süreyi (`lag -= STEP`) kumbaradan çıkar. Her turda `lag` azaldığı için
  döngü mutlaka biter.
  - 120 Hz ekranda her kare ~8 ms atar: `update` iki karede bir çalışır.
  - 30 Hz ekranda her kare ~33 ms atar: `update` her karede iki kez çalışır.
  - İkisinde de saniyede **60** güncelleme.
- `draw()` → `while`'ın **dışında**: fizik kaç adım atarsa atsın, ekrana bir kez çizeriz.

# --task--

1. Above `function loop`, write `STEP`, `last` and `lag`, then an empty line.
2. Change `loop` as shown: `time` in the parentheses, and `update()` inside the `while`.

# --task-tr--

1. `function loop() {` satırının **üstüne** `STEP`, `last` ve `lag` satırlarını ve bir boş satır yaz.
2. `loop`'u kodda görüldüğü gibi değiştir: parantez içine `time`; yorum, `lag`, `last` satırları; `update()` çağrısı
   `while` döngüsünün içine. `draw()` ve `requestAnimationFrame(loop)` aynı kalır.
3. **Çalıştır**: senin ekranında oyun aynı görünür. Fark: artık herkesin ekranında da aynı.

# --predict--

On your 60 Hz screen, how will the game look after this step?
- [x] Exactly the same
  At 60 Hz every frame deposits one step, so `update` still runs once per frame.
- [ ] Twice as fast
- [ ] In slow motion

# --predict-tr--

60 Hz'lik ekranında bu adımdan sonra oyun nasıl görünecek?
- [x] Tamamen aynı
  60 Hz'de her kare kumbaraya tam bir adım atar; `update` yine karede bir kez çalışır.
- [ ] İki kat hızlı
- [ ] Ağır çekimde

# --hint--

`update()` goes inside the `while`, `draw()` after it.

# --hint-tr--

`update()` `while`'ın **içinde**, `draw()` ise onun **dışında**, altında olmalı.

# --tests--

On a 120 Hz screen the game should still make about 60 updates per second.
tr: 120 Hz ekranda oyun yine saniyede yaklaşık 60 güncelleme yapmalı.

```js
state = 'playing'
for (let i = 1; i <= 120; i++) {
  bird.y = 300
  bird.vy = 0
  loop((i * 1000) / 120)
}
assert.isAtLeast(frame, 59)
assert.isAtMost(frame, 60)
```

On a 30 Hz screen the game should also make about 60 updates per second.
tr: 30 Hz ekranda da oyun saniyede yaklaşık 60 güncelleme yapmalı.

```js
state = 'playing'
for (let i = 1; i <= 30; i++) {
  bird.y = 300
  bird.vy = 0
  loop((i * 1000) / 30)
}
assert.isAtLeast(frame, 59)
assert.isAtMost(frame, 60)
```

The loop should still draw every frame and keep running.
tr: Döngü yine her karede çizmeli ve sürmeli.

```js
$.tick(30)
assert.strictEqual($.pendingFrames, 1)
assert.lengthOf($.arcs(), 1)
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
  lag += time - last
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
