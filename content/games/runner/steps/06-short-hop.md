---
title: Short hops
title_tr: Kısa sıçrama
skills: [game.physics, game.input]
---

# --goal--

Good platform games let you control the jump: hold the key for a high jump, tap it for a short hop. When the key is
let go while still rising fast, the upward speed is cut to -4.

# --goal-tr--

İyi oyunlarda zıplamayı **kontrol** edersin: tuşu **basılı tut** yüksek zıpla, **dokun bırak** kısa sıçra. Yöntem çok
basit: tuş bırakıldığında koşucu hâlâ hızla yükseliyorsa, yukarı hızını **-4'e düşür**. Yer çekimi onu çabucak indirir.

# --code--

```js
const CUT = -4 // letting go early caps the upward speed at this

// Letting go early makes a short hop: cap the upward speed.
function endJump() {
  if (runner.vy < CUT) runner.vy = CUT
}

document.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') endJump()
})
```

# --meaning--

- `vy < CUT` means rising faster than 4 pixels a frame (more negative).
- Then the speed becomes -4: the jump ends lower. If the runner is already slower or falling, nothing changes.
- `keyup` fires when a key is let go.

# --meaning-tr--

- `runner.vy < CUT` → hız -4'ten **daha eksi** mi? Yani saniyede... karede 4 pikselden hızlı mı yükseliyor?
- `runner.vy = CUT` → öyleyse yükselişi -4'e indir: zıplama daha alçakta biter.
- Koşucu zaten yavaşladıysa ya da düşüyorsa (`vy` -4'ten büyük) hiçbir şey değişmez; bırakmanın geç kalmış hâli.
- `keyup` → tuş **bırakıldığında** gelen olay.

# --task--

1. Under `JUMP`, write `CUT`.
2. Under `jump`, write the comment and `endJump`.
3. Under the `keydown` listener, write the `keyup` listener.

# --task-tr--

1. `JUMP` satırının altına `CUT` satırını yaz.
2. `jump` fonksiyonunun altına yorumu ve `endJump` fonksiyonunu yaz.
3. `keydown` dinleyicisinin altına `keyup` dinleyicisini yaz.
4. **Çalıştır**: Boşluk'a kısa dokun, sonra basılı tut; farkı gör.

# --tests--

A quick tap should give a much lower jump than holding the key.
tr: Hızlı bir dokunuş, tuşu basılı tutmaktan çok daha alçak bir zıplama vermeli.

```js
$.press(' ')
$.tick(2)
$.release(' ')
let top = runner.y
for (let i = 0; i < 40; i++) {
  $.tick()
  top = Math.min(top, runner.y)
}
assert.isAbove(top, 136 - 50)
```

Letting go while already falling should change nothing.
tr: Zaten düşerken bırakmak bir şey değiştirmemeli.

```js
runner.vy = 2
endJump()
assert.strictEqual(runner.vy, 2)
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
