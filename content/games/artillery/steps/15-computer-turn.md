---
title: The computer's shot
title_tr: Bilgisayarın atışı
skills: [game.state, game.loop]
---

# --goal--

On its turn the computer "thinks" for one second (60 frames) and then fires with its barrel as it is. It doesn't aim yet;
that comes later. A small triangle above a tank shows whose turn it is.

# --goal-tr--

Sırası gelince bilgisayar bir saniye (60 kare) **"düşünsün"**, sonra namlusu nasılsa öyle ateş etsin. Henüz nişan
almıyor; o daha sonra. Bir tankın üstündeki küçük **üçgen** sıranın kimde olduğunu göstersin.

# --code--

```js
let thinking // frames until the computer shoots

  if (turn === 1) thinking = 60

  if (state === 'aiming' && turn === 1 && --thinking === 0) {
    fire()
  }

  for (const [i, t] of tanks.entries()) {

    if (i === turn && state === 'aiming') {
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.moveTo(t.x - 5, t.y - 34)
      ctx.lineTo(t.x + 5, t.y - 34)
      ctx.lineTo(t.x, t.y - 27)
      ctx.fill()
    }
```

# --meaning--

- `thinking` counts down from 60 on the computer's turn; at 0 it fires.
- `fire` already uses `tanks[turn]`, so the same function fires for the computer.
- `tanks.entries()` gives each tank with its number `i`, to compare with `turn`.
- The triangle is a filled path of three points, pointing down at the tank.

# --meaning-tr--

- `thinking` → bilgisayarın sırasında 60'tan geri sayar; 0 olunca `fire()`. `--thinking` önce azaltır, sonra
  karşılaştırır.
- `fire` zaten `tanks[turn]` kullanıyor: aynı fonksiyon bilgisayar için de ateş eder.
- `for (const [i, t] of tanks.entries())` → her tankı **numarasıyla** verir; `i === turn` ile karşılaştırmak için.
- Üçgen: üç noktalı bir yol, `fill()` ile doldurulur; tankın üstünde aşağı bakar.

# --task--

1. Under `state`, write `thinking`; in `endTurn`, start thinking on the computer's turn.
2. In `update`, after the explosion block, fire when thinking is over.
3. In `draw`, number the tanks in the loop, and draw the triangle after the health bar.

# --task-tr--

1. `let state` satırının altına `thinking` yaz; `endTurn`'ün sonuna düşünme satırını yaz.
2. `update`'te patlama bloğunun altına bilgisayarın ateş bloğunu yaz.
3. `draw`'da `for (const t of tanks)` satırını `entries` ile yaz; can çubuğunun altına üçgen bloğunu yaz.
4. **Çalıştır** ve ateş et: bilgisayar bir saniye sonra karşılık vermeli.

# --tests--

A second after your shot the computer should fire by itself.
tr: Atışından bir saniye sonra bilgisayar kendiliğinden ateş etmeli.

```js
fire()
for (let i = 0; i < 400 && state !== 'aiming'; i++) $.tick(1)
assert.strictEqual(turn, 1)
$.tick(58)
assert.strictEqual(state, 'aiming')
$.tick(1)
assert.strictEqual(state, 'flying')
assert.isBelow(shell.x, tanks[1].x, 'from the red barrel, to the left')
for (let i = 0; i < 400 && state !== 'aiming'; i++) $.tick(1)
assert.strictEqual(turn, 0, 'then it is your turn again')
```

A triangle should mark whose turn it is.
tr: Bir üçgen sıranın kimde olduğunu göstermeli.

```js
$.tick(1)
const t = tanks[0]
const points = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args)
assert.deepInclude(points, [t.x, t.y - 27])
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
let tanks // [you, the computer]: { x, y, hp, angle, power, color }
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let thinking // frames until the computer shoots

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
  for (const t of tanks) {
    const d = Math.hypot(t.x - x, t.y - 6 - y)
    if (d < BLAST) t.hp = Math.max(0, Math.round(t.hp - (1 - d / BLAST) * 60))
  }
  blast = { x, y }
}

function endTurn() {
  turn = 1 - turn
  state = 'aiming'
  if (turn === 1) thinking = 60
}

function update() {
  for (const t of tanks) {
    if (t.y < groundAt(t.x)) t.y = Math.min(groundAt(t.x), t.y + FALL) // nothing under it: it falls
    else t.y = groundAt(t.x)
  }
  if (state === 'boom' && --timer === 0) {
    blast = null
    endTurn()
  }
  if (state === 'aiming' && turn === 1 && --thinking === 0) {
    fire()
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
  if (state !== 'aiming' || turn !== 0) return
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
    if (turn === 0) fire()
  } else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#7dd3fc'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#65a30d'
  for (let x = 0; x < W; x++) ctx.fillRect(x, ground[x], 1, H - ground[x])

  for (const [i, t] of tanks.entries()) {
    ctx.fillStyle = t.color
    ctx.fillRect(t.x - 10, t.y - 8, 20, 8)
    ctx.strokeStyle = t.color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(t.x, t.y - 8)
    ctx.lineTo(t.x + Math.cos(t.angle) * 14, t.y - 8 + Math.sin(t.angle) * 14)
    ctx.stroke()
    // Health bar
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(t.x - 16, t.y - 22, 32, 4)
    ctx.fillStyle = t.hp > 30 ? '#22c55e' : '#ef4444'
    ctx.fillRect(t.x - 16, t.y - 22, (32 * t.hp) / 100, 4)
    if (i === turn && state === 'aiming') {
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.moveTo(t.x - 5, t.y - 34)
      ctx.lineTo(t.x + 5, t.y - 34)
      ctx.lineTo(t.x, t.y - 27)
      ctx.fill()
    }
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
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Your turn' : 'Computer', W - 10, 20)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
