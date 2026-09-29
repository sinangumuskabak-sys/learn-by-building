---
title: Boom
title_tr: Bum
skills: [game.state, game.canvas]
---

# --goal--

Where the shell meets the ground there is an explosion: an orange fireball that grows for 20 frames. During that time
the state is `'boom'`, and nobody can shoot. A shell that flies off the side just ends the shot, with no explosion.

# --goal-tr--

Merminin zemine değdiği yerde bir **patlama** olsun: 20 kare boyunca büyüyen turuncu bir ateş topu. O sırada durum
`'boom'`; kimse ateş edemez. Yandan çıkan mermi atışı patlamasız bitirir.

# --code--

```js
const BLAST = 30 // explosion radius
let blast // { x, y } while an explosion shows
let timer // frames left to watch the explosion

  blast = null

function explode(x, y) {
  blast = { x, y }
}

  if (state === 'boom' && --timer === 0) {
    blast = null
    state = 'aiming'
  }

  if (hit !== 'away') explode(shell.x, shell.y)
  shell = null
  state = 'boom'
  timer = 20

  if (blast) {
    // The fireball grows as the timer runs down.
    ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
    ctx.beginPath()
    ctx.arc(blast.x, blast.y, BLAST * (1 - timer / 40), 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- `--timer` takes one off first and then compares, so the explosion lasts exactly 20 frames.
- `explode` only marks the spot for now; next steps make it dig and hurt.
- The fireball's radius goes from half of `BLAST` (timer 20) up to `BLAST` (timer 0).

# --meaning-tr--

- `--timer === 0` → önce bir azalt, **sonra** karşılaştır: patlama tam 20 kare sürer.
- `explode` şimdilik yalnız yeri işaretliyor; sonraki adımlarda zemini kazacak ve tankları yaralayacak.
- `hit !== 'away'` → yandan çıkan mermide patlama yok, ama atış yine `'boom'` ile biter.
- Ateş topunun yarıçapı `BLAST * (1 - timer / 40)`: timer 20'deyken 15, 0'a inerken 30'a büyür.

# --task--

1. Under `GRAVITY`, write `BLAST`; under `shell`, write `blast` and `timer`; in `reset`, clear `blast`.
2. Above `update`, write `explode`.
3. At the top of `update`, count the explosion down; at the end, explode and wait.
4. In `draw`, draw the fireball after the shell.

# --task-tr--

1. `GRAVITY` altına `BLAST`, `let shell` altına `blast` ve `timer` yaz; `reset`'te `shell = null` altına
   `blast = null` yaz.
2. `update`'in üstüne `explode` yaz.
3. `update`'in en üstüne patlama sayacı bloğunu yaz; sonundaki iki satırı dört satırla değiştir.
4. `draw`'da mermi bloğunun altına ateş topu bloğunu yaz. **Çalıştır** ve ateş et.

# --tests--

The shell should explode where it meets the ground, and after the blast you can aim again.
tr: Mermi zemine değdiği yerde patlamalı; patlamadan sonra yeniden nişan alınabilmeli.

```js
fire()
let landed = null
for (let i = 0; i < 400 && state === 'flying'; i++) {
  $.tick(1)
  if (state === 'boom') landed = { ...blast }
}
assert.strictEqual(state, 'boom')
assert.isAtLeast(landed.y, groundAt(landed.x) - 12, 'it explodes where it meets the ground')
$.tick(1)
assert.isTrue($.arcs().some((a) => a.color === 'rgba(249, 115, 22, 0.8)'))
$.tick(19)
assert.strictEqual(state, 'aiming')
assert.isNull(blast)
```

A shell leaving the screen should end the shot with no explosion.
tr: Ekrandan çıkan mermi atışı patlamasız bitirmeli.

```js
tanks[0].angle = -Math.PI / 2 - 0.3
tanks[0].power = 12
fire()
for (let i = 0; i < 400 && state === 'flying'; i++) $.tick(1)
assert.strictEqual(state, 'boom')
assert.isNull(blast, 'with no explosion')
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

function explode(x, y) {
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
