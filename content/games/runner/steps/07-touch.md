---
title: Tap to jump
title_tr: Dokunarak zıpla
skills: [game.input]
---

# --goal--

On a phone there is no Space key. Pressing on the canvas jumps and lifting the finger ends the jump, just like the key.

# --goal-tr--

Telefonda Boşluk tuşu yok. Canvas'a **basmak** zıplasın, parmağı **kaldırmak** zıplamayı bitirsin; tıpkı tuş gibi.
Fareyle de çalışır.

# --code--

```js
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)
```

# --meaning--

- A function name can be handed to `addEventListener` directly: `jump` runs on every press, `endJump` on every release.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', jump)` → canvas'a fare ya da parmakla basılınca `jump`'ı çalıştır.
  Fonksiyonun **adını** veriyoruz (parantezsiz): "şimdi çalıştır" değil, "olay olunca çalıştır".
- `pointerup` → bırakılınca `endJump`.

# --task--

Under the `keyup` listener, write the two lines.

# --task-tr--

`keyup` dinleyicisinin altına iki satırı yaz. **Çalıştır** ve oyuna tıkla.

# --tests--

Pressing on the canvas should jump.
tr: Canvas'a basmak zıplatmalı.

```js
$.pointerDown(300, 100)
assert.strictEqual(runner.vy, -11)
```

Lifting quickly should make a short hop.
tr: Çabuk kaldırmak kısa sıçrama yaptırmalı.

```js
$.pointerDown(300, 100)
$.tick()
$.pointerUp(300, 100)
assert.strictEqual(runner.vy, -4)
```

# --solution--

```js
// Endless runner, step by step.
// The page already has <canvas id="game" width="600" height="220"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 180 // y of the ground line
const GRAVITY = 0.6
const JUMP = -11 // speed at the start of a jump (negative = up)
const CUT = -4 // letting go early caps the upward speed at this
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (onGround()) runner.vy = JUMP
}

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
canvas.addEventListener('pointerdown', jump)
canvas.addEventListener('pointerup', endJump)

function update() {
  runner.vy += GRAVITY
  runner.y += runner.vy
  if (onGround()) {
    runner.y = GROUND - runner.h
    runner.vy = 0
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#475569'
  ctx.fillRect(0, GROUND, canvas.width, 2)

  ctx.fillStyle = '#334155'
  ctx.fillRect(runner.x, runner.y, runner.w, runner.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
