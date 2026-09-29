---
title: Craters
title_tr: Kraterler
skills: [game.physics, prog.arrays]
---

# --goal--

An explosion digs a round hole. For each column within the blast, the bottom of a circle of radius 30 is found; if it
is lower than the ground there, the ground drops to it. Holes never go through the bottom of the screen.

# --goal-tr--

Patlama **yuvarlak bir çukur** kazsın. Patlama içindeki her sütun için 30 yarıçaplı bir dairenin **alt kenarı**
bulunuyor; zeminden aşağıdaysa zemin oraya iniyor. Çukur ekranın altını hiç delmesin.

# --code--

```js
// Blow a round hole in the ground and hurt the tanks nearby.
  for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
    if (cx < 0 || cx >= W) continue
    const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
    if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
  }
```

# --meaning--

- The circle: at a sideways distance `d` from the middle, its bottom is `√(r² − d²)` below the middle (Pythagoras).
- Ground only goes down, never up: a blast in the air above a hill does not fill anything.
- `continue` skips columns off the canvas.

# --meaning-tr--

- Daire: ortadan yana `d` uzaklıkta, alt kenarı ortanın `√(r² − d²)` altındadır (**Pisagor**). `** 2` → karesi.
- `if (bottom > ground[cx])` → zemin yalnız **aşağı** iner: havada patlayan mermi tepeyi doldurmaz.
- `if (cx < 0 || cx >= W) continue` → tuvalin dışındaki sütunları **atla**.
- `Math.min(H - 2, bottom)` → çukur en alta 2 piksel kalana kadar iner; zemin hiç kaybolmaz.
- Yorumdaki "tankları yaralama" iki adım sonra geliyor.

# --task--

1. Above `explode`, write the comment.
2. At the top of `explode`, dig the hole.

# --task-tr--

1. `explode`'un üstüne yorum satırını yaz.
2. `explode`'un en üstüne kazma döngüsünü yaz. **Çalıştır** ve zemine ateş et.

# --tests--

An explosion should dig a round hole as deep as the blast.
tr: Patlama patlama kadar derin, yuvarlak bir çukur kazmalı.

```js
const x = 300
const y = groundAt(x)
const before = ground.slice()
explode(x, y)
assert.closeTo(ground[300], y + BLAST, 1e-9, 'a hole as deep as the blast')
assert.strictEqual(ground[335], before[335], 'the ground farther away is untouched')
for (let dx = -29; dx <= 29; dx++) assert.isAtLeast(ground[x + dx], Math.min(H - 2, y + Math.sqrt(BLAST * BLAST - dx * dx)) - 1e-9, 'round')
```

Holes should never go through the bottom of the screen.
tr: Çukurlar ekranın altını delmemeli.

```js
for (let i = 0; i < 8; i++) explode(200, ground[200])
assert.isAtMost(Math.max(...ground), H - 2, 'never through the bottom')
explode(5, ground[5])
assert.lengthOf(ground, W)
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

let ground // ground[x]: the y of the surface in column x
let tanks // [you, the computer]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'

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
    { x: 70, y: 0, hp: 100, angle: -Math.PI / 4, power: 8, color: '#2563eb' },
    { x: W - 70, y: 0, hp: 100, angle: (-3 * Math.PI) / 4, power: 8, color: '#dc2626' },
  ]
  for (const t of tanks) t.y = groundAt(t.x)
  turn = 0
  shell = null
  blast = null
  state = 'aiming'
}

function fire() {
  if (state !== 'aiming') return
  const t = tanks[turn]
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

// Blow a round hole in the ground and hurt the tanks nearby.
function explode(x, y) {
  for (let cx = Math.floor(x - BLAST); cx <= x + BLAST; cx++) {
    if (cx < 0 || cx >= W) continue
    const bottom = y + Math.sqrt(BLAST * BLAST - (cx - x) ** 2)
    if (bottom > ground[cx]) ground[cx] = Math.min(H - 2, bottom)
  }
  blast = { x, y }
}

function update() {
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
  const t = tanks[0]
  t.angle = Math.max(-Math.PI, Math.min(0, t.angle + dAngle))
  t.power = Math.max(2, Math.min(MAX_POWER, t.power + dPower))
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aimBy(-0.03, 0)
  else if (event.key === 'ArrowRight') aimBy(0.03, 0)
  else if (event.key === 'ArrowUp') aimBy(0, 0.25)
  else if (event.key === 'ArrowDown') aimBy(0, -0.25)
  else if (event.key === ' ') {
    fire()
  } else return
  event.preventDefault()
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

  const you = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
