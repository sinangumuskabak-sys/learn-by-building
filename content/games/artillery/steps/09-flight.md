---
title: Flight
title_tr: Uçuş
skills: [game.physics, game.loop]
---

# --goal--

Every frame gravity adds a little to the downward speed, and the shell moves by its speed. That is all it takes for a
real curve. `fly` moves a shell one frame and says what it hit: `'away'` off the side, `'ground'`, or `null`.
When the shell hits something it disappears, and you can aim again.

# --goal-tr--

Her karede **yerçekimi** aşağı hıza biraz ekliyor, mermi de hızı kadar ilerliyor. Gerçek bir **eğri** için bu kadarı
yetiyor. `fly` bir mermiyi bir kare ilerletip neye çarptığını söylüyor: yandan çıktıysa `'away'`, zemine değdiyse
`'ground'`, hiçbir şeye değmediyse `null`. Mermi bir şeye çarpınca kaybolur ve yeniden nişan alabilirsin.

# --code--

```js
const GRAVITY = 0.15

// One frame of flight: gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  return null
}

function update() {
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  shell = null
  state = 'aiming'
}

  update()
```

# --meaning--

- Gravity changes the speed, the speed changes the position: this makes a parabola, like a thrown ball.
- The shell is below the surface when its `y` is at least the ground's y there.
- `fly` takes the shell as a parameter, so later the computer can try imaginary shells with it too.

# --meaning-tr--

- `s.vy += GRAVITY` → yerçekimi **hızı** değiştirir; `s.x += s.vx`, `s.y += s.vy` → hız **konumu** değiştirir.
  Bu ikisi birlikte havaya atılan bir top gibi bir **parabol** çizer.
- `s.y >= groundAt(s.x)` → mermi o sütunda yüzeyin altına indi: zemine çarptı.
- `fly` mermiyi parametre olarak alıyor (`s`); ileride bilgisayar da kafasında hayalî mermiler denerken kullanacak.
- `update` → mermi uçuyorsa bir kare ilerlet; bir şeye çarptıysa mermiyi kaldır ve yeniden nişan al.

# --task--

1. Under `H`, write `GRAVITY`.
2. Above `aimBy`, write `fly` with its comment and `update`.
3. In `loop`, call `update()` before `draw()`.

# --task-tr--

1. `H` satırının altına `GRAVITY` yaz.
2. `aimBy`'ın üstüne yorumuyla `fly` fonksiyonunu ve `update` fonksiyonunu yaz.
3. `loop` içinde `draw()`'ın üstüne `update()` yaz. **Çalıştır** ve ateş et.

# --tests--

Gravity should pull the shell down every frame.
tr: Yerçekimi mermiyi her karede aşağı çekmeli.

```js
fire()
const { x, vx, vy } = shell
$.tick(1)
assert.closeTo(shell.vy, vy + GRAVITY, 1e-9)
assert.closeTo(shell.x, x + vx, 1e-9)
```

The shell should stop where it meets the ground, and you can aim again.
tr: Mermi zemine değdiği yerde durmalı ve yeniden nişan alınabilmeli.

```js
const s = { x: 100, y: groundAt(100) - 2, vx: 0, vy: 2 }
assert.strictEqual(fly(s), 'ground')
assert.strictEqual(fly({ x: W - 1, y: 10, vx: 5, vy: 0 }), 'away')
fire()
for (let i = 0; i < 400 && state === 'flying'; i++) $.tick(1)
assert.strictEqual(state, 'aiming')
assert.isNull(shell)
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
const MAX_POWER = 12

let ground // ground[x]: the y of the surface in column x
let tanks // [you, the computer]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
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

function update() {
  if (state !== 'flying') return
  const hit = fly(shell)
  if (!hit) return
  shell = null
  state = 'aiming'
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
