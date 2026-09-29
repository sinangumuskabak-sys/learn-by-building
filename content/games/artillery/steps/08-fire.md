---
title: Fire!
title_tr: Ateş!
skills: [game.input, game.physics]
---

# --goal--

Space fires a shell from the end of the barrel. It gets a speed: the barrel's direction times the power. `state` tells
what is happening, `turn` whose shot it is (0 is you). The shell is drawn as a small dark ball; flying comes next.

# --goal-tr--

**Boşluk** namlunun ucundan bir **mermi** atsın. Merminin bir **hızı** var: namlunun yönü çarpı güç. `state` o an ne
olduğunu (`'aiming'` nişan alınıyor, `'flying'` mermi uçuyor…), `turn` sıranın kimde olduğunu (0 sen) tutuyor. Mermi
küçük koyu bir top; uçması sonraki adımda.

# --code--

```js
let turn // 0 or 1: whose shot it is
let shell // { x, y, vx, vy } or null
let state // 'aiming', 'flying', 'boom', 'won' or 'lost'

  turn = 0
  shell = null
  state = 'aiming'

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

  else if (event.key === ' ') {
    fire()
  } else return

  if (shell) {
    ctx.fillStyle = '#0f172a'
    ctx.beginPath()
    ctx.arc(shell.x, shell.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
```

# --meaning--

- `vx`, `vy` is the speed in pixels per frame: the barrel's direction, `power` pixels long.
- While a shell flies, `state` is `'flying'`, so a second Space does nothing.
- Space gets its own `{ }` block because more will go in it later.

# --meaning-tr--

- Mermi `{ x, y, vx, vy }`: konumu ve **hızı** (karede kaç piksel yana ve aşağı). Hız namlu yönünde, `power` uzunlukta.
- `const t = tanks[turn]` → sırası gelen tank. Şimdilik hep sen; ileride bilgisayar da ateş edecek.
- `if (state !== 'aiming') return` → mermi uçarken ikinci Boşluk bir şey yapmasın.
- Boşluk dalı süslü parantezli bir blok: ileride içine bir satır daha gelecek.
- `ctx.arc(x, y, 3, 0, Math.PI * 2)` → 3 piksel yarıçaplı tam daire.

# --task--

1. Under `tanks`, write `turn`, `shell` and `state`; in `reset`, set them after the tanks.
2. Above `aimBy`, write `fire`; in the key listener, fire on Space.
3. In `draw`, draw the shell above the readout.

# --task-tr--

1. `let tanks` satırının altına `turn`, `shell` ve `state` yaz; `reset`'te tank döngüsünün altına üç satırı yaz.
2. `aimBy`'ın üstüne `fire` fonksiyonunu yaz; tuş dinleyicisine `else return`'den önce Boşluk bloğunu ekle.
3. `draw`'da tank döngüsünün altına mermi bloğunu yaz. **Çalıştır** ve Boşluk'a bas.

# --tests--

Space should fire from the end of the barrel, once.
tr: Boşluk namlunun ucundan bir kez ateş etmeli.

```js
const t = tanks[0]
$.press(' ')
assert.strictEqual(state, 'flying')
assert.closeTo(shell.x, t.x + Math.cos(t.angle) * 14, 1e-9, 'from the end of the barrel')
assert.closeTo(shell.vx, Math.cos(t.angle) * t.power, 1e-9)
assert.closeTo(shell.vy, Math.sin(t.angle) * t.power, 1e-9)
const s = shell
$.press(' ')
assert.strictEqual(shell, s)
$.tick()
assert.isTrue($.arcs().some((a) => a.r === 3))
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
