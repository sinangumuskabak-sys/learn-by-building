---
title: Craters
title_tr: Kraterler
skills: [game.physics, prog.loops]
---

# --explanation--

An explosion should blow a hole in the ground. With a height map that is surprisingly easy: for every column the blast reaches, the
bottom of the round hole there is at

```js
const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
```

which is the lower half of a circle: in the middle `dx = 0` and the hole is `BLAST` deep; at the edges `dx = BLAST` and the depth is
zero. Where that bottom lies below the surface, the ground now starts there (`ground[cx] = bottom`). Where the circle does not reach
the ground, nothing changes.

A height map cannot store caves: a blast deep underground opens all the way up to the sky. It is the price of storing one number per
column, and games like this happily pay it.

Now a tank can be left standing on nothing. Every frame, a tank above the ground drops by `FALL` pixels until it lands again, so a
good shot under an enemy sends it tumbling into its own crater.

# --explanation-tr--

Bir patlama zeminde bir delik açmalı. Bir yükseklik haritasıyla bu şaşırtıcı derecede kolaydır: patlamanın ulaştığı her sütun için
oradaki yuvarlak deliğin dibi şuradadır:

```js
const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
```

bu bir dairenin alt yarısıdır: ortada `dx = 0` ve delik `BLAST` derinliğindedir; kenarlarda `dx = BLAST` ve derinlik sıfırdır. O dibin
yüzeyin altında kaldığı yerde zemin artık oradan başlar (`ground[cx] = bottom`). Dairenin zemine ulaşmadığı yerde hiçbir şey değişmez.

Bir yükseklik haritası mağara saklayamaz: yerin derinliklerindeki bir patlama gökyüzüne kadar açılır. Sütun başına bir sayı saklamanın
bedeli budur ve bu tür oyunlar onu memnuniyetle öder.

Artık bir tank boşlukta kalabilir. Her karede zeminin üstündeki bir tank yeniden inene kadar `FALL` piksel düşer; böylece bir düşmanın
altına yapılan iyi bir atış onu kendi kraterine yuvarlar.

# --task--

1. In `explode(x, y)`, for every column `cx` from `x - BLAST` to `x + BLAST` on the canvas, compute the bottom of the circle and, if
   it is below `ground[cx]`, move the ground down to it (never below `H - 2`).
2. Add `FALL = 2`. In `update()`, a tank above the ground moves down by `FALL` (not past the ground); otherwise it stays exactly on
   the ground.

# --task-tr--

1. `explode(x, y)`'de canvas üstünde `x - BLAST`'tan `x + BLAST`'a her `cx` sütunu için dairenin dibini hesapla ve `ground[cx]`'in
   altındaysa zemini oraya indir (asla `H - 2`'nin altına değil).
2. `FALL = 2` ekle. `update()`'te zeminin üstündeki bir tank `FALL` kadar iner (zemini geçmeden); değilse tam zeminde kalır.

# --tests--

An explosion should dig a round hole as deep as the blast.
tr: Bir patlama, patlama kadar derin yuvarlak bir delik açmalı.

```js
const x = 300
const y = groundAt(x)
const before = ground.slice()
explode(x, y)
assert.closeTo(ground[300], y + BLAST, 1e-9, 'a hole as deep as the blast')
assert.strictEqual(ground[335], before[335], 'the ground farther away is untouched')
for (let dx = -29; dx <= 29; dx++) assert.isAtLeast(ground[x + dx], Math.min(H - 2, y + Math.sqrt(BLAST * BLAST - dx * dx)) - 1e-9, 'round')
```

A tank left in the air should fall until it lands on the new ground.
tr: Havada kalan bir tank yeni zemine inene kadar düşmeli.

```js
const t = tanks[0]
const y = t.y
explode(t.x, t.y)
assert.strictEqual(t.y, y, 'still in the air for a moment')
$.tick(1)
assert.strictEqual(t.y, y + FALL, 'then it falls')
$.tick(30)
assert.strictEqual(t.y, groundAt(t.x), 'until it lands on the new ground')
```

Holes should never go through the bottom of the screen.
tr: Delikler asla ekranın altını delmemeli.

```js
for (let i = 0; i < 8; i++) explode(200, ground[200])
assert.isAtMost(Math.max(...ground), H - 2, 'never through the bottom')
```

# --solution--

```js
// Artillery, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const W = canvas.width
const H = canvas.height
const GRAVITY = 0.15
const BLAST = 30 // explosion radius
const MAX_POWER = 12
const FALL = 2 // pixels per frame a tank drops when the ground under it is gone

let ground // ground[x]: the y of the surface in column x
let tanks // [blue, red]: { x, y, angle, power, color }
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying' or 'boom'
let dragging

// Hills from three sine waves of random size and position, added together.
function makeGround() {
  const waves = [1, 2, 3].map((n) => ({ size: (30 / n) * (0.5 + Math.random()), length: W / (n + Math.random()), shift: Math.random() * W }))
  ground = []
  for (let x = 0; x < W; x++) {
    let y = 220
    for (const w of waves) y += w.size * Math.sin(((x + w.shift) / w.length) * Math.PI * 2)
    ground.push(Math.max(120, Math.min(H - 20, y)))
  }
}

const groundAt = (x) => ground[Math.max(0, Math.min(W - 1, Math.round(x)))]

function reset() {
  makeGround()
  tanks = [
    { x: 70, y: 0, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  shell = null
  blast = null
  state = 'aiming'
  dragging = false
}

function fire() {
  if (state !== 'aiming') return
  const t = tanks[0]
  // The shell leaves from the end of the barrel.
  shell = {
    x: t.x + Math.cos(t.angle) * 14,
    y: t.y - 8 + Math.sin(t.angle) * 14,
    vx: Math.cos(t.angle) * t.power,
    vy: Math.sin(t.angle) * t.power,
  }
  state = 'flying'
}

// One frame of flight: gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  return null
}

// Blow a round hole in the ground.
function explode(x, y) {
  for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
    if (cx < 0 || cx >= W) continue
    const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
    if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
  }
  blast = { x, y }
}

function update() {
  for (const t of tanks) {
    if (t.y < groundAt(t.x)) t.y = Math.min(groundAt(t.x), t.y + FALL) // nothing under it: it falls
    else t.y = groundAt(t.x)
  }
  if (state === 'boom' && --timer === 0) {
    blast = null
    state = 'aiming'
  }
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20
}

function aimBy(dAngle, dPower) {
  if (state !== 'aiming') return
  const t = tanks[0]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else if (event.key === ' ') fire()
  else return
  event.preventDefault()
})

// Point from the tank: the direction is the aim, the distance is the power.
function pointAt(event) {
  const rect = canvas.getBoundingClientRect()
  const x = ((event.clientX - rect.left) * W) / rect.width
  const y = ((event.clientY - rect.top) * H) / rect.height
  const t = tanks[0]
  // Below the barrel, atan2 gives an angle between 0 and π: aim flat to that side instead.
  const angle = Math.atan2(y - (t.y - 8), x - t.x)
  t.angle = angle > 0 ? (angle > Math.PI / 2 ? -Math.PI : 0) : angle
  t.power = Math.max(2, Math.min(MAX_POWER, Math.hypot(x - t.x, y - (t.y - 8)) / 12))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'aiming') return
  dragging = true
  pointAt(event)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pointAt(event)
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  fire()
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const t of tanks) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
  }

  if (shell) {
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(shell.x, shell.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  if (blast) {
    // The fireball grows as the timer runs down.
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
    ctx.beginPath()
    ctx.arc(blast.x, blast.y, BLAST * (1 - timer / 40), 0, Math.PI * 2)
    ctx.fill()
  }

  const now = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-now.angle * 180) / Math.PI) + '°  Power ' + now.power.toFixed(1), 10, 20)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
