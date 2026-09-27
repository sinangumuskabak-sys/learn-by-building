---
title: Levels and score
title_tr: Bölümler ve skor
skills: [game.state]
---

# --explanation--

After a landing, the next flight should be **harder**: gravity grows with every level, and from level 3 the pad is only
half as wide. Two small changes, and the same game keeps getting more demanding.

The score rewards both progress and skill: `100 × level` for each landing, plus the **fuel left**. A careful pilot who
burns only what is needed scores more than one who hovers around. Good scoring rules teach players how to play well.

The level and score belong to the whole game, the lander and the ground to one flight. So there are now two functions:
`startLevel()` makes new hills and a new lander, `reset()` goes back to level 1 with no score and then starts it. After a
landing Space goes to the next level; after a crash, to a new game. The best score is saved when the game ends.

# --explanation-tr--

Bir inişten sonra sonraki uçuş **daha zor** olmalı: yerçekimi her bölümle büyür ve 3. bölümden itibaren pist yarı genişliktedir.
İki küçük değişiklik ve aynı oyun giderek daha zorlayıcı olur.

Skor hem ilerlemeyi hem beceriyi ödüllendirir: her iniş için `100 × level`, artı **kalan yakıt**. Yalnızca gerektiği kadar yakan
dikkatli bir pilot, etrafta süzülüp duran birinden daha çok puan alır. İyi skor kuralları oyunculara iyi oynamayı öğretir.

Bölüm ve skor bütün oyuna, araç ve zemin tek bir uçuşa aittir. Bu yüzden artık iki fonksiyon var: `startLevel()` yeni tepeler
ve yeni bir araç yapar, `reset()` skorsuz 1. bölüme döner ve onu başlatır. Bir inişten sonra Boşluk sonraki bölüme, bir kazadan
sonra yeni bir oyuna götürür. En iyi skor oyun bittiğinde kaydedilir.

# --task--

1. Add `level`, `score`, `best` (from `localStorage` `'lander-best'`) and `gravity`, which replaces `GRAVITY`:
   `0.02 + level * 0.005`, set in `startLevel()`.
2. Split `reset()`: `startLevel()` makes the ground, the lander, the gravity and state `'flying'`; `reset()` sets `level = 1`,
   `score = 0` and calls `startLevel()`.
3. The pad is 2 steps wide before level 3 and 1 step from then on.
4. A landing adds `100 * level + fuel` to the score. A crash saves the score as the best if it beats it.
5. Write `next()` for Space and taps: after a landing, the next level; after a crash, `reset()`. Draw
   `Level 2  Score 530  Best 900` at the top right, and change the messages to `Landed! Space: next level` and
   `Crashed. Space: new game`.

# --task-tr--

1. `level`, `score`, `best` (`localStorage` `'lander-best'`'ten) ve `GRAVITY`'nin yerini alan `gravity`'yi ekle:
   `startLevel()`'da ayarlanan `0.02 + level * 0.005`.
2. `reset()`'i böl: `startLevel()` zemini, aracı, yerçekimini ve `'flying'` durumunu yapar; `reset()` `level = 1`,
   `score = 0` yapar ve `startLevel()` çağırır.
3. Pist 3. bölümden önce 2 adım, o zamandan sonra 1 adım genişliğindedir.
4. Bir iniş skora `100 * level + fuel` ekler. Bir kaza, skor en iyiyi geçiyorsa onu en iyi olarak kaydeder.
5. Boşluk ve dokunuşlar için `next()` yaz: bir inişten sonra sonraki bölüm; bir kazadan sonra `reset()`. Sağ üste
   `Level 2  Score 530  Best 900` çiz ve mesajları `Landed! Space: next level` ile `Crashed. Space: new game` yap.

# --tests--

A landing should score and lead to a harder level.
tr: Bir iniş puan kazandırmalı ve daha zor bir bölüme götürmeli.

```js
assert.strictEqual(gravity, 0.025)
ground = Array(13).fill(300)
pad = { x1: 40, x2: 120, y: 300 }
lander = { x: 80, y: 285, vx: 0, vy: 0.5, angle: 0, fuel: 250 }
$.tick(20)
assert.strictEqual(state, 'landed')
assert.strictEqual(score, 350)
$.press(' ')
assert.deepEqual([state, level, score], ['flying', 2, 350])
assert.closeTo(gravity, 0.03, 1e-9)
$.tick(1)
assert.include($.texts(), 'Level 2  Score 350  Best 0')
```

From level 3 the pad should be narrower.
tr: 3. bölümden itibaren pist daha dar olmalı.

```js
level = 2
startLevel()
assert.strictEqual(pad.x2 - pad.x1, 80)
level = 3
startLevel()
assert.strictEqual(pad.x2 - pad.x1, 40)
```

A crash should end the game, save the best score, and Space should start over.
tr: Bir kaza oyunu bitirmeli, en iyi skoru kaydetmeli ve Boşluk baştan başlatmalı.

```js
score = 900
level = 4
ground = Array(13).fill(300)
lander = { x: 400, y: 285, vx: 0, vy: 3, angle: 0, fuel: 0 }
$.tick(5)
assert.strictEqual(state, 'crashed')
assert.strictEqual(best, 900)
assert.strictEqual(localStorage.getItem('lander-best'), '900')
assert.include($.texts(), 'Crashed. Space: new game')
$.press(' ')
assert.deepEqual([state, level, score], ['flying', 1, 0])
```

# --solution--

```js
// Lunar lander, step by step.
// The page already has <canvas id="game" width="480" height="360"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const STEP = 40 // the ground is a line through a point every STEP pixels
const THRUST = 0.1 // speed gained per frame of engine, along the direction the lander points
const SPIN = 0.05 // radians per frame
const SAFE = { vy: 1.2, vx: 0.6, angle: 0.2 } // the most a landing may have
const FEET = 9 // the feet are this far left and right of the middle, and 10 below it

let ground // y of the ground at x = 0, STEP, 2 * STEP, ...
let pad // { x1, x2, y }: the flat landing pad
let lander
let gravity
let level
let score
let state // 'flying', 'landed' or 'crashed'
let best = Number(localStorage.getItem('lander-best')) || 0
const keys = {}

// Random hills, with one flat stretch: the pad. It gets narrower on later levels.
function makeGround() {
  const points = canvas.width / STEP + 1
  ground = Array.from({ length: points }, () => 210 + Math.random() * 120)
  const width = level < 3 ? 2 : 1
  const start = 1 + Math.floor(Math.random() * (points - 2 - width))
  const y = 250 + Math.random() * 70
  for (let i = start; i <= start + width; i++) ground[i] = y
  pad = { x1: start * STEP, x2: (start + width) * STEP, y }
}

// The ground between two points is a straight line: find where x is along it.
function groundY(x) {
  const i = Math.max(0, Math.min(ground.length - 2, Math.floor(x / STEP)))
  const t = (x - i * STEP) / STEP
  return ground[i] + (ground[i + 1] - ground[i]) * t
}

function startLevel() {
  makeGround()
  lander = { x: 60, y: 40, vx: 1, vy: 0, angle: 0, fuel: 400 }
  gravity = 0.02 + level * 0.005
  state = 'flying'
}

function reset() {
  level = 1
  score = 0
  startLevel()
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault()
  if (event.key === ' ') next()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// After a landing, the next level; after a crash, a new game.
function next() {
  if (state === 'landed') {
    level += 1
    startLevel()
  } else if (state === 'crashed') {
    reset()
  }
}

// Touch: hold the left third to turn left, the right third to turn right, the middle for the engine.
canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'flying') {
    next()
    return
  }
  const rect = canvas.getBoundingClientRect()
  const third = ((event.clientX - rect.left) / rect.width) * 3
  keys[third < 1 ? 'ArrowLeft' : third < 2 ? 'ArrowUp' : 'ArrowRight'] = true
})
function stopTouch() {
  keys.ArrowLeft = false
  keys.ArrowUp = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopTouch)
canvas.addEventListener('pointercancel', stopTouch)

function burning() {
  return state === 'flying' && keys.ArrowUp && lander.fuel > 0
}

function touchdown() {
  const onPad = lander.x - FEET >= pad.x1 && lander.x + FEET <= pad.x2
  const gentle = lander.vy <= SAFE.vy && Math.abs(lander.vx) <= SAFE.vx && Math.abs(lander.angle) <= SAFE.angle
  if (onPad && gentle) {
    state = 'landed'
    lander.y = pad.y - 10
    score += 100 * level + lander.fuel
    return
  }
  state = 'crashed'
  if (score > best) {
    best = score
    localStorage.setItem('lander-best', best)
  }
}

function update() {
  if (state !== 'flying') return

  if (keys.ArrowLeft) lander.angle -= SPIN
  if (keys.ArrowRight) lander.angle += SPIN
  if (burning()) {
    // The engine pushes along the direction the lander points: angle 0 is straight up.
    lander.vx += Math.sin(lander.angle) * THRUST
    lander.vy -= Math.cos(lander.angle) * THRUST
    lander.fuel -= 1
  }
  lander.vy += gravity
  lander.x += lander.vx
  lander.y += lander.vy
  // Leaving one side brings the lander back on the other.
  lander.x = (lander.x + canvas.width) % canvas.width

  const feet = lander.y + 10
  if (feet >= groundY(lander.x - FEET) || feet >= groundY(lander.x) || feet >= groundY(lander.x + FEET)) touchdown()
}

function drawLander() {
  ctx.save()
  ctx.translate(lander.x, lander.y)
  ctx.rotate(lander.angle)
  if (burning()) {
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.moveTo(-5, 8)
    ctx.lineTo(5, 8)
    ctx.lineTo(0, 16 + Math.random() * 8)
    ctx.fill()
  }
  ctx.fillStyle = '#e2e8f0'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(9, 8)
  ctx.lineTo(-9, 8)
  ctx.fill()
  ctx.fillRect(-FEET, 8, 2, 2)
  ctx.fillRect(FEET - 2, 8, 2, 2)
  ctx.restore()
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height)
  ground.forEach((y, i) => ctx.lineTo(i * STEP, y))
  ctx.lineTo(canvas.width, canvas.height)
  ctx.fill()
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(pad.x1, pad.y - 2, pad.x2 - pad.x1, 4)

  drawLander()

  // Readouts: green while the value is safe for landing, red when it is not.
  const readouts = [
    ['Fuel ' + lander.fuel, lander.fuel > 50],
    ['Down ' + lander.vy.toFixed(1), lander.vy <= SAFE.vy],
    ['Side ' + lander.vx.toFixed(1), Math.abs(lander.vx) <= SAFE.vx],
    ['Tilt ' + Math.round((lander.angle * 180) / Math.PI) + '°', Math.abs(lander.angle) <= SAFE.angle],
  ]
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'left'
  readouts.forEach(([text, ok], i) => {
    ctx.fillStyle = ok ? '#4ade80' : '#f87171'
    ctx.fillText(text, 10, 20 + i * 18)
  })
  ctx.fillStyle = 'white'
  ctx.textAlign = 'right'
  ctx.fillText('Level ' + level + '  Score ' + score + '  Best ' + best, canvas.width - 10, 20)

  ctx.textAlign = 'center'
  ctx.font = 'bold 22px sans-serif'
  if (state === 'landed') {
    ctx.fillStyle = '#4ade80'
    ctx.fillText('Landed! Space: next level', canvas.width / 2, 140)
  }
  if (state === 'crashed') {
    ctx.fillStyle = '#f87171'
    ctx.fillText('Crashed. Space: new game', canvas.width / 2, 140)
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
