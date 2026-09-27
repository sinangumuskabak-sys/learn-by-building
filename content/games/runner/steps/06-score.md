---
title: Distance, speed and a best score
title_tr: Mesafe, hız ve rekor
skills: [game.state, game.loop]
---

# --explanation--

An endless runner has no finish line, so the score is **how far you got**. Add the speed to a `distance` counter every
frame and show `distance / 10`, rounded down, so the numbers climb at a satisfying pace.

To keep it endless *and* interesting, the world speeds up a tiny bit every frame:

```js
speed = Math.min(12, speed + 0.003)
```

`0.003` looks like nothing, but over a minute (3600 frames) that is +10.8, which would double the starting speed if it
were not capped at 12. Small per-frame changes add up. When tuning a game, always ask "what does this become after a
minute? after five?".

Scores like `00042` use `String(score).padStart(5, '0')`: pad the text on the left with zeros up to five characters.
The best score is saved in `localStorage` as in the other games, and as always, one `reset()` function sets up every
new run.

# --explanation-tr--

Sonsuz koşucunun bitiş çizgisi yoktur; skor **ne kadar uzağa gittiğindir**. Her karede hızı bir `distance` sayacına
ekle ve `distance / 10`'u aşağı yuvarlayarak göster; böylece sayılar tatmin edici bir hızda artar.

Hem sonsuz *hem de* ilginç kalsın diye dünya her karede biraz hızlanır:

```js
speed = Math.min(12, speed + 0.003)
```

`0.003` hiçbir şey gibi görünür ama bir dakikada (3600 kare) +10,8 eder; 12'de sınırlanmasa başlangıç hızını iki
katından fazlasına çıkarırdı. Karelik küçük değişiklikler birikir. Bir oyunu ayarlarken hep sor: "bu bir dakika sonra
neye dönüşür? beş dakika sonra?".

`00042` gibi skorlar `String(score).padStart(5, '0')` kullanır: metni soldan beş karaktere kadar sıfırla doldur. Rekor,
diğer oyunlardaki gibi `localStorage`'a kaydedilir ve her zamanki gibi tek bir `reset()` fonksiyonu her yeni koşuyu kurar.

# --task--

1. Declare `runner`, `state`, `obstacles`, `speed`, `nextIn` and a new `distance` with `let` but no values, and write
   `function reset()` that gives them their starting values (runner on the ground with `vy: 0`, `'ready'`, `[]`, `6`,
   `60`, `0`). Call it at startup.
2. While running, add `speed` to `distance` and raise `speed` by `0.003` per frame, up to `12`.
3. Add `let best = Number(localStorage.getItem('runner-best')) || 0`. When the run ends, with
   `score = Math.floor(distance / 10)`, save a new best under `'runner-best'`.
4. When the game is over, `jump()` should call `reset()` instead of doing nothing.
5. Draw `HI 00120  00042` (best, two spaces, score, both padded to 5 digits) right-aligned at `(canvas.width - 10, 24)`
   in `'16px monospace'`, and `Press Space to try again` under `Game Over`.

# --task-tr--

1. `runner`, `state`, `obstacles`, `speed`, `nextIn` ve yeni bir `distance`'ı `let` ile değersiz tanımla ve onlara
   başlangıç değerlerini veren `function reset()` yaz (zeminde `vy: 0` ile koşucu, `'ready'`, `[]`, `6`, `60`, `0`).
   Açılışta çağır.
2. Koşarken her karede `distance`'a `speed` ekle ve `speed`'i `12`'ye kadar `0.003` artır.
3. `let best = Number(localStorage.getItem('runner-best')) || 0` ekle. Koşu bitince `score = Math.floor(distance / 10)`
   ile yeni rekoru `'runner-best'` altında kaydet.
4. Oyun bittiğinde `jump()` hiçbir şey yapmamak yerine `reset()` çağırmalı.
5. `(canvas.width - 10, 24)` noktasına sağa hizalı, `'16px monospace'` ile `HI 00120  00042` (rekor, iki boşluk, skor;
   ikisi de 5 haneye doldurulmuş) yaz; `Game Over`'ın altına da `Press Space to try again`.

# --tests--

Distance should grow with the speed, and the speed should creep up to 12.
tr: Mesafe hızla birlikte artmalı, hız da yavaşça 12'ye çıkmalı.

```js
$.press(' ')
$.release(' ')
update()
assert.closeTo(distance, 6, 0.01)
assert.closeTo(speed, 6.003, 0.0001)
speed = 11.999
obstacles = []
nextIn = 1000
update()
assert.strictEqual(speed, 12)
```

The score should be shown padded to five digits, next to the best score.
tr: Skor beş haneye doldurularak rekorun yanında gösterilmeli.

```js
best = 120
distance = 425
draw()
assert.include($.texts(), 'HI 00120  00042')
```

A new best should be saved when the run ends.
tr: Koşu bitince yeni rekor kaydedilmeli.

```js
$.press(' ')
distance = 1234
obstacles = [{ x: 80, y: 140, w: 20, h: 40 }]
update()
assert.strictEqual(state, 'over')
assert.strictEqual(best, 124)
assert.strictEqual(localStorage.getItem('runner-best'), '124')
```

Jumping after game over should start a fresh run.
tr: Oyun bittikten sonra zıplamak yeni bir koşu başlatmalı.

```js
$.press(' ')
obstacles = [{ x: 80, y: 140, w: 20, h: 40 }]
update()
$.release(' ')
$.press(' ')
assert.strictEqual(state, 'ready')
assert.deepEqual(obstacles, [])
assert.strictEqual(distance, 0)
assert.strictEqual(speed, 6)
assert.include(runner, { y: 136, vy: 0 })
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

let runner
let state // 'ready', 'running' or 'over'
let obstacles
let speed
let distance
let nextIn // frames until the next obstacle
let best = Number(localStorage.getItem('runner-best')) || 0

function reset() {
  runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }
  state = 'ready'
  obstacles = []
  speed = 6
  distance = 0
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

  distance += speed
  speed = Math.min(12, speed + 0.003)

  nextIn -= 1
  if (nextIn <= 0) spawn()
  for (const o of obstacles) o.x -= speed
  obstacles = obstacles.filter((o) => o.x + o.w > 0)

  if (obstacles.some(hits)) {
    state = 'over'
    const score = Math.floor(distance / 10)
    if (score > best) {
      best = score
      localStorage.setItem('runner-best', best)
    }
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)

  ctx.fillStyle = '#15803d'
  for (const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)

  const score = Math.floor(distance / 10)
  ctx.fillStyle = '#334155'
  ctx.font = '16px monospace'
  ctx.textAlign = 'right'
  ctx.fillText('HI ' + String(best).padStart(5, '0') + '  ' + String(score).padStart(5, '0'), canvas.width - 10, 24)

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
