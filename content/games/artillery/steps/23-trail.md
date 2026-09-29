---
title: "Build it yourself: a trail"
title_tr: "Kendin yap: iz"
skills: [game.canvas, prog.arrays]
---

# --goal--

Now it's your turn, without code to copy: after your shot, a dotted line of small dots stays on screen to show where
it flew, until your next shot.

# --goal-tr--

Şimdi sıra sende, kopyalanacak kod yok: atışından sonra ekranda merminin **nereden geçtiğini** gösteren küçük
noktalardan bir **iz** kalsın; bir sonraki atışına kadar. Böylece nişanını düzeltmek kolaylaşır.

# --task--

Remember the shell's positions during your shot, and draw a small dot at every few of them.

# --task-tr--

Atışın sırasında merminin konumlarını bir listede biriktir; `draw`'da birkaç konumda bir küçük bir nokta çiz. Yeni
atışında liste sıfırlansın.

# --hint--

Keep a list of points. Empty it when you fire, add `{ x, y }` of the shell each frame of your shot, and in `draw` use
`ctx.arc` for every fourth point.

# --hint-tr--

Bir nokta listesi tut. Ateş edince boşalt, atışının her karesinde merminin `{ x, y }`'sini ekle; `draw`'da her dördüncü
nokta için `ctx.arc` ile küçük bir daire çiz.

# --tests--

After your shot, dots should show where it flew.
tr: Atışından sonra noktalar merminin geçtiği yeri göstermeli.

```js
fire()
for (let i = 0; i < 400 && state !== 'aiming'; i++) $.tick(1)
assert.strictEqual(turn, 1)
$.tick(1)
const dots = $.arcs()
assert.isAtLeast(dots.length, 5, 'a dotted trail')
assert.isTrue(dots.every((d) => d.r <= 3), 'small dots')
assert.isTrue(dots.some((d) => Math.abs(d.x - tanks[0].x) < 60), 'starting near your tank')
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
let wind
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'
let thinking // frames until the computer shoots
let dragging
let trail = [] // where your last shot flew

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
  newWind()
  state = 'aiming'
  dragging = false
}

const newWind = () => (wind = Math.round((Math.random() - 0.5) * 10) / 100) // -0.05 to 0.05

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
  if (turn === 0) trail = []
}

// One frame of flight: wind pushes sideways, gravity pulls down. Returns what it hit, or null.
function fly(s) {
  s.vx += wind
  s.vy += GRAVITY
  s.x += s.vx
  s.y += s.vy
  if (s.x < 0 || s.x >= W) return 'away'
  if (s.y >= groundAt(s.x)) return 'ground'
  if (tanks.some((t) => t !== tanks[turn] && Math.hypot(t.x - s.x, t.y - 6 - s.y) < 12)) return 'tank'
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
  if (tanks[1].hp === 0) state = 'won'
  else if (tanks[0].hp === 0) state = 'lost'
  else {
    turn = 1 - turn
    newWind()
    state = 'aiming'
    if (turn === 1) thinking = 60
  }
}

// The computer tries many shots in its head, picks the one landing closest to you, then misses a little.
function computerAim() {
  const me = tanks[1]
  let best = null
  for (let angle = -Math.PI + 0.2; angle < -Math.PI / 2; angle += 0.03) {
    for (let power = 4; power <= MAX_POWER; power += 0.5) {
      const s = { x: me.x + Math.cos(angle) * 14, y: me.y - 8 + Math.sin(angle) * 14, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power }
      let hit = null
      for (let i = 0; i < 400 && !hit; i++) hit = fly(s)
      if (hit === 'away') continue
      const miss = Math.abs(s.x - tanks[0].x)
      if (!best || miss < best.miss) best = { miss, angle, power }
    }
  }
  me.angle = best.angle + (Math.random() - 0.5) * 0.08
  me.power = Math.min(MAX_POWER, best.power + (Math.random() - 0.5) * 0.8)
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
    computerAim()
    fire()
  }
  if (state !== 'flying') return
  const hit = fly(shell)
  if (turn === 0) trail.push({ x: shell.x, y: shell.y })
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
    if (state === 'won' || state === 'lost') reset()
    else if (turn === 0) fire()
  } else return
  event.preventDefault()
})

// Point from your tank: the direction is the aim, the distance is the power.
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
  if (state === 'won' || state === 'lost') return reset()
  if (state !== 'aiming' || turn !== 0) return
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

  ctx.fillStyle = '#0f172a'
  trail.forEach((p, i) => {
    if (i % 4 !== 0) return
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
    ctx.fill()
  })

  const you = tanks[0]
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20)
  ctx.textAlign = 'center'
  const arrow = wind > 0 ? '→' : wind < 0 ? '←' : ''
  ctx.fillText('Wind ' + arrow + ' ' + Math.abs(Math.round(wind * 100)), W / 2, 20)
  ctx.textAlign = 'right'
  ctx.fillText(turn === 0 ? 'Your turn' : 'Computer', W - 10, 20)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(140, 110, 280, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'You lose', W / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', W / 2, 172)
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
