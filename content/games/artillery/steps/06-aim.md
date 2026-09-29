---
title: Aim
title_tr: Nişan al
skills: [game.input]
---

# --goal--

Left and right turn your barrel, up and down change the power. The angle stays between flat left and flat right, and
the power between 2 and 12.

# --goal-tr--

Sol ve sağ oklar namlunu **döndürsün**, yukarı ve aşağı **gücü** değiştirsin. Açı dümdüz sol ile dümdüz sağ arasında,
güç 2 ile 12 arasında kalsın.

# --code--

```js
const MAX_POWER = 12

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
```

# --meaning--

- `aimBy` changes the angle and power by the given amounts, then keeps them within their limits.
- The angle `-Math.PI` is flat left, `0` flat right; everything between points up.
- `else return` leaves other keys alone; only the arrow keys are kept from scrolling the page.

# --meaning-tr--

- `aimBy(dAngle, dPower)` → açıyı ve gücü verilen miktarlar kadar değiştir, sonra sınırlar içinde tut.
- `Math.max(-Math.PI, Math.min(0, ...))` → açı −180° (dümdüz sol) ile 0 (dümdüz sağ) arasında: namlu hep yukarı yarıda.
- Her ok basışı 0.03 radyan (~1.7°) ya da 0.25 güç.
- `else return` → başka bir tuşsa hiçbir şey yapma; `preventDefault` yalnız oklarda: sayfa kaymasın.

# --task--

1. Under `H`, write `MAX_POWER`.
2. Above `draw`, write `aimBy` and the key listener.

# --task-tr--

1. `H` satırının altına `MAX_POWER` yaz.
2. `draw`'ın üstüne `aimBy` ve tuş dinleyicisini yaz. **Çalıştır**, oyuna tıkla ve oklarla nişan al.

# --tests--

The arrows should turn the barrel and change the power.
tr: Oklar namluyu döndürmeli ve gücü değiştirmeli.

```js
const t = tanks[0]
$.press('ArrowLeft')
assert.closeTo(t.angle, -Math.PI / 4 - 0.03, 1e-9)
$.press('ArrowUp')
assert.strictEqual(t.power, 8.25)
```

The angle and power should stay within their limits.
tr: Açı ve güç sınırlarında kalmalı.

```js
const t = tanks[0]
t.angle = -3.1
for (let i = 0; i < 5; i++) $.press('ArrowLeft')
assert.strictEqual(t.angle, -Math.PI)
t.power = 11.9
$.press('ArrowUp')
assert.strictEqual(t.power, 12)
t.power = 2.1
$.press('ArrowDown')
assert.strictEqual(t.power, 2)
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
