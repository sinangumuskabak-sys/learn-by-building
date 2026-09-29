---
title: Angle and power
title_tr: Açı ve güç
skills: [game.canvas]
---

# --goal--

Top left shows your angle in degrees (up is positive, as people say it) and your power with one decimal.

# --goal-tr--

Sol üstte açın **derece** olarak (insanların söylediği gibi, yukarı artı) ve gücün tek ondalıkla yazsın.

# --code--

```js
const you = tanks[0]
ctx.fillStyle = '#0f172a'
ctx.font = 'bold 14px sans-serif'
ctx.textAlign = 'left'
ctx.fillText('Angle ' + Math.round((-you.angle * 180) / Math.PI) + '°  Power ' + you.power.toFixed(1), 10, 20)
```

# --meaning--

- Radians to degrees: times 180, divided by π. The minus sign turns the canvas's "up is negative" around.
- `toFixed(1)` writes one digit after the dot.

# --meaning-tr--

- Radyandan dereceye: × 180 ÷ π. Baştaki eksi tuvalin "yukarı eksi" yönünü çevirir: −π/4 → **45°**.
- `Math.round` → tam dereceye yuvarla. `toFixed(1)` → gücü tek ondalıkla: `8.0`.

# --task--

At the end of `draw`, write the readout.

# --task-tr--

`draw`'ın sonuna, bir boş satırdan sonra açı ve güç yazısını yaz. **Çalıştır** ve nişan al.

# --tests--

The angle and power should be shown.
tr: Açı ve güç yazmalı.

```js
$.tick()
assert.include($.texts(), 'Angle 45° Power 8.0')
$.press('ArrowDown')
$.press('ArrowDown')
$.tick()
assert.include($.texts(), 'Angle 45° Power 7.5')
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
  else return
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
