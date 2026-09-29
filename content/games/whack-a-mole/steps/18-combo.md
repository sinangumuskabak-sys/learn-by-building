---
title: "Build it yourself: combos"
title_tr: "Kendin yap: kombo"
skills: [game.state]
---

# --goal--

Reward good aim: three hits in a row without a miss give a bonus point. Any click that does not hit a mole breaks the
streak.

# --goal-tr--

İyi nişanı ödüllendir: **ıskalamadan arka arkaya üç vuruş** bir **bonus puan** versin. Köstebeğe denk gelmeyen her
tıklama seriyi bozsun.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir sayaç, isabet ve ıska dalları (`if ... else`), `%` ile "her üçte bir".

# --task--

- Every third hit in a row scores 2 instead of 1.
- A click that misses (empty hole or grass) resets the streak.
- A new round starts with no streak.

# --task-tr--

- Iskasız serideki **her üçüncü** vuruş 1 yerine **2** puan getirsin (3 vuruş = 4 puan, 6 vuruş = 8 puan).
- Iskalayan bir tıklama (boş delik ya da çimen) seriyi **sıfırlasın**.
- Yeni tur seriyle değil sıfırla başlasın.

# --hint--

Keep a counter (for example `let streak = 0`). On a hit add 1 to it and, when `streak % 3 === 0`, add a bonus point;
on a miss (`else`) set it back to 0. Reset it in `start` too.

# --hint-tr--

Bir sayaç tut (ör. `let streak = 0`). İsabette 1 artır ve `streak % 3 === 0` olunca bir bonus puan ekle; ıskada
(`else`) sayacı 0 yap. `start` içinde de sıfırla.

# --tests--

Three hits in a row should give a bonus point.
tr: Arka arkaya üç vuruş bir bonus puan vermeli.

```js
$.pointerDown(180, 220)
for (let i = 0; i < 3; i++) {
  holes[4].upUntil = 1e9
  $.pointerDown(180, 220)
}
assert.strictEqual(score, 4)
```

A miss should break the streak.
tr: Bir ıska seriyi bozmalı.

```js
$.pointerDown(180, 220)
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
for (const hole of holes) hole.upUntil = 0
$.pointerDown(60, 100)
holes[4].upUntil = 1e9
$.pointerDown(180, 220)
assert.strictEqual(score, 3)
```

Six hits in a row should give two bonus points.
tr: Arka arkaya altı vuruş iki bonus puan vermeli.

```js
$.pointerDown(180, 220)
for (let i = 0; i < 6; i++) {
  holes[4].upUntil = 1e9
  $.pointerDown(180, 220)
}
assert.strictEqual(score, 8)
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
let popups = [] // floating "+1"s: { x, y, born }
let streak = 0 // hits in a row without a miss

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
  popups = []
  streak = 0
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
    popups.push({ x: hole.x, y: hole.y - 40, born: now })
    streak += 1
    if (streak % 3 === 0) score += 1
  } else {
    streak = 0
  }
})

function update() {
  popups = popups.filter((p) => now - p.born < 600)
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

  ctx.fillStyle = '#fef08a'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  for (const p of popups) {
    const t = (now - p.born) / 600 // 0 → 1 over the popup's life
    ctx.globalAlpha = 1 - t
    ctx.fillText('+1', p.x, p.y - t * 30)
  }
  ctx.globalAlpha = 1

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
