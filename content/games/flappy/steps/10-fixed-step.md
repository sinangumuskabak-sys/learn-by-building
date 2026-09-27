---
title: The same speed on every screen
title_tr: Her ekranda aynı hız
skills: [game.loop, game.physics]
---

# --explanation--

There is a hidden bug in this game. `requestAnimationFrame` runs once per **screen refresh**. Most screens refresh 60
times a second, but many phones and gaming monitors do 90, 120 or 144. Because `update()` runs once per frame, the
bird falls **twice as fast** on a 120 Hz screen, and the game becomes much harder. On a slow laptop that drops to 30,
it runs in slow motion.

The physics was designed for steps of 1/60 of a second. The fix is to **decouple** the physics from the screen: keep
running `update()` at exactly 60 steps per second of real time, no matter how often the screen draws.

The idea is a bank account of time, often called the *accumulator*:

```js
const STEP = 1000 / 60   // one physics step, in ms
lag += time - last       // deposit the time that really passed
last = time
while (lag >= STEP) {    // spend it in whole steps
  update()
  lag -= STEP
}
draw()
```

- On a 120 Hz screen each frame deposits ~8 ms, so `update()` runs on every second frame.
- On a 30 Hz screen each frame deposits ~33 ms, so `update()` runs twice per frame.
- Either way: 60 updates per second.

One more guard: if the tab was in the background for 10 seconds, `time - last` is huge and the loop would try to run
600 updates at once. Capping the deposit (`Math.min(time - last, 100)`) avoids that "spiral of death".

This pattern, the **fixed timestep**, is used by real physics engines. It also makes the game deterministic: the same
inputs always give the same result.

# --explanation-tr--

Bu oyunda gizli bir hata var. `requestAnimationFrame` her **ekran yenilemesinde** bir kez çalışır. Çoğu ekran saniyede
60 kez yenilenir, ama birçok telefon ve oyuncu monitörü 90, 120 ya da 144 yapar. `update()` her karede bir kez
çalıştığı için, 120 Hz ekranda kuş **iki kat hızlı** düşer ve oyun çok zorlaşır. 30'a düşen yavaş bir dizüstünde ise
ağır çekimde oynar.

Fizik, saniyenin 1/60'ı kadar adımlar için tasarlandı. Çözüm, fiziği ekrandan **ayırmak**: ekran ne sıklıkta çizerse
çizsin `update()`'i gerçek zamanda saniyede tam 60 adım çalıştırmak.

Fikir, genelde *biriktirici* (accumulator) denen bir zaman hesabı:

```js
const STEP = 1000 / 60   // bir fizik adımı, ms cinsinden
lag += time - last       // gerçekten geçen zamanı yatır
last = time
while (lag >= STEP) {    // onu tam adımlar hâlinde harca
  update()
  lag -= STEP
}
draw()
```

- 120 Hz ekranda her kare ~8 ms yatırır; `update()` iki karede bir çalışır.
- 30 Hz ekranda her kare ~33 ms yatırır; `update()` karede iki kez çalışır.
- Her iki durumda da: saniyede 60 güncelleme.

Bir koruma daha: sekme 10 saniye arka planda kaldıysa `time - last` çok büyük olur ve döngü bir anda 600 güncelleme
çalıştırmaya kalkar. Yatırılan miktarı sınırlamak (`Math.min(time - last, 100)`) bu "ölüm sarmalını" önler.

Bu kalıp, yani **sabit zaman adımı**, gerçek fizik motorlarında kullanılır. Oyunu belirlenimci de yapar: aynı
girdiler her zaman aynı sonucu verir.

# --task--

1. Add `const STEP = 1000 / 60`, `let last = 0` and `let lag = 0` above `loop`.
2. Change `loop` to take `time`, add `Math.min(time - last, 100)` to `lag`, set `last = time`, then call `update()`
   and subtract `STEP` while `lag >= STEP`. Draw once after the `while`, then request the next frame.

The game will look exactly the same on your screen. Now it will also look the same on everyone else's.

# --task-tr--

1. `loop`'un üstüne `const STEP = 1000 / 60`, `let last = 0` ve `let lag = 0` ekle.
2. `loop`'u `time` alacak şekilde değiştir: `lag`'e `Math.min(time - last, 100)` ekle, `last = time` yap, sonra
   `lag >= STEP` olduğu sürece `update()` çağırıp `STEP` çıkar. `while`'dan sonra bir kez çiz, sonra bir sonraki
   kareyi iste.

Oyun senin ekranında tamamen aynı görünecek. Artık herkesin ekranında da aynı görünecek.

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

A long pause should not trigger hundreds of updates at once.
tr: Uzun bir duraklama bir anda yüzlerce güncellemeyi tetiklememeli.

```js
state = 'playing'
bird.y = 300
bird.vy = 0
loop(10000)
assert.isAtMost(frame, 6)
```

The loop should still draw every frame and keep running.
tr: Döngü yine her karede çizmeli ve çalışmaya devam etmeli.

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
