---
title: Faster and faster
title_tr: Giderek hızlan
skills: [game.state, prog.functions]
---

# --goal--

As the round goes on, moles stay up for less time (1000 ms down to 500) and come more often (every 700 ms down to 350).

# --goal-tr--

Tur ilerledikçe köstebekler **daha kısa** kalsın (1000 ms'den 500'e) ve **daha sık** gelsin (700 ms'den 350'ye). Son
saniyeler çılgınca olsun!

Bunun için `progress`'i kullanıp iki değer arasında **düzgün geçiş** yapıyoruz: kolay değerden zor değere.

# --code--

```js
// Linear interpolation from the easy value to the hard value as the round goes on.
function upTime() {
  return 1000 - 500 * progress()
}

function popGap() {
  return 700 - 350 * progress()
}

      hole.upUntil = now + upTime()
    nextPop = now + popGap()
```

# --meaning--

- `1000 - 500 * progress()` is 1000 at the start, 750 halfway and 500 at the end: a straight line between the two.
- `update` uses these functions instead of the fixed numbers.

# --meaning-tr--

- `1000 - 500 * progress()` → başta (progress 0) 1000, yarıda (0,5) 750, sonda (1) 500. İki değer arasında **doğrusal
  geçiş** (lerp): progress kaç ise yolun o kadarı.
- `popGap` aynı fikir: 700'den 350'ye.
- `update` içinde sabit `1000` ve `700` yerine artık bu fonksiyonlar.

# --task--

1. Under `progress`, write the comment, `upTime` and `popGap`.
2. In `update`, replace `1000` with `upTime()` and `700` with `popGap()`.

# --task-tr--

1. `progress` fonksiyonunun altına yorumu, `upTime` ve `popGap` fonksiyonlarını yaz.
2. `update` içinde `now + 1000` yerine `now + upTime()`, `now + 700` yerine `now + popGap()` yaz.
3. **Çalıştır** ve bir turu sonuna kadar oyna.

# --tests--

Moles should stay up for less time as the round goes on.
tr: Tur ilerledikçe köstebekler daha kısa kalmalı.

```js
endsAt = 31000
now = 1000
assert.closeTo(upTime(), 1000, 1e-9)
now = 16000
assert.closeTo(upTime(), 750, 1e-9)
now = 31000
assert.closeTo(upTime(), 500, 1e-9)
```

Moles should come more often as the round goes on.
tr: Tur ilerledikçe köstebekler daha sık gelmeli.

```js
endsAt = 31000
now = 1000
assert.closeTo(popGap(), 700, 1e-9)
now = 31000
assert.closeTo(popGap(), 350, 1e-9)
```

Late in a round, a new mole should stay up for less than a second.
tr: Tur sonlarında yeni bir köstebek bir saniyeden kısa kalmalı.

```js
$.pointerDown(180, 220)
$.run(25)
for (const hole of holes) hole.upUntil = 0
nextPop = 0
update()
const hole = holes.find(isUp)
assert.isBelow(hole.upUntil - now, 700)
```

# --solution--

```js
// Whack-a-mole, step by step.
// The page already has <canvas id="game" width="360" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const SIZE = 3 // holes per row and per column
const CELL = 120
const TOP = 40 // room for the score and timer
const HOLE_R = 40
const ROUND = 30000 // a round lasts 30 seconds

const holes = []
for (let row = 0; row < SIZE; row++) {
  for (let col = 0; col < SIZE; col++) {
    holes.push({ x: col * CELL + CELL / 2, y: TOP + row * CELL + CELL / 2, upUntil: 0 })
  }
}

let now = 0 // time of the current frame, in ms
let nextPop = 0 // when the next mole pops up
let score = 0
let state = 'ready' // 'ready', 'playing' or 'over'
let endsAt = 0
let best = Number(localStorage.getItem('mole-best')) || 0

function isUp(hole) {
  return now < hole.upUntil
}

// 0 when the round starts, 1 when it ends.
function progress() {
  return Math.min(1, Math.max(0, 1 - (endsAt - now) / ROUND))
}

// Linear interpolation from the easy value to the hard value as the round goes on.
function upTime() {
  return 1000 - 500 * progress()
}

function popGap() {
  return 700 - 350 * progress()
}

function holeAt(x, y) {
  return holes.find((hole) => {
    const dx = x - hole.x
    const dy = y - hole.y
    return dx * dx + dy * dy <= HOLE_R * HOLE_R
  })
}

function start() {
  state = 'playing'
  score = 0
  endsAt = now + ROUND
  nextPop = now
  for (const hole of holes) hole.upUntil = 0
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') {
    start()
    return
  }
  // The canvas may be displayed at a different size than its own pixels, so scale the pointer.
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  const hole = holeAt(x, y)
  if (hole && isUp(hole)) {
    score += 1
    hole.upUntil = 0
  }
})

function update() {
  if (state !== 'playing') return
  if (now >= endsAt) {
    state = 'over'
    for (const hole of holes) hole.upUntil = 0
    if (score > best) {
      best = score
      localStorage.setItem('mole-best', best)
    }
    return
  }
  if (now >= nextPop) {
    const empty = holes.filter((hole) => !isUp(hole))
    if (empty.length > 0) {
      const hole = empty[Math.floor(Math.random() * empty.length)]
      hole.upUntil = now + upTime()
    }
    nextPop = now + popGap()
  }
}

function draw() {
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const hole of holes) {
    ctx.fillStyle = '#3f2d1d'
    ctx.beginPath()
    ctx.arc(hole.x, hole.y, HOLE_R, 0, Math.PI * 2)
    ctx.fill()
    if (isUp(hole)) {
      ctx.fillStyle = '#92400e'
      ctx.beginPath()
      ctx.arc(hole.x, hole.y, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 12, 28)
  if (state === 'playing') {
    ctx.textAlign = 'right'
    ctx.fillText('Time: ' + Math.ceil((endsAt - now) / 1000), canvas.width - 12, 28)
  }

  ctx.textAlign = 'center'
  if (state === 'ready') {
    ctx.fillText('Click to start', canvas.width / 2, canvas.height / 2)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, canvas.height / 2 + 28)
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 150, canvas.width, 150)
    ctx.fillStyle = 'white'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText("Time's up!", canvas.width / 2, 190)
    ctx.font = '20px sans-serif'
    ctx.fillText('Score: ' + score, canvas.width / 2, 225)
    ctx.font = '16px sans-serif'
    ctx.fillText('Best: ' + best, canvas.width / 2, 252)
    ctx.fillText('Click to play again', canvas.width / 2, 282)
  }
}

function loop(time) {
  now = time
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
