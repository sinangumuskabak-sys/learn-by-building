---
title: Jump
title_tr: Zıpla
skills: [game.input, game.physics]
---

# --goal--

A jump is just an upward speed: Space or the up arrow sets `vy` to -11, and gravity does the rest, slowing the rise
and bringing the runner back down.

# --goal-tr--

Zıplamak aslında sadece **yukarı doğru bir hız**: Boşluk ya da yukarı ok `vy`'yi -11 yapar, gerisini yer çekimi
halleder. Yükseliş yavaşlar, durur, koşucu geri iner. Yalnız yerdeyken zıplanabilsin; havada zıplamak yok.

# --code--

```js
const JUMP = -11 // speed at the start of a jump (negative = up)

function jump() {
  if (onGround()) runner.vy = JUMP
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
})
```

# --meaning--

- `JUMP` is negative because up is negative on the canvas.
- `jump` only works on the ground, so there is no jumping in mid-air.
- `event.repeat` is true for the automatic repeats of a held key; ignoring them means one press, one jump.

# --meaning-tr--

- `const JUMP = -11` → zıplamanın başlangıç hızı. **Eksi**, çünkü canvas'ta yukarı eksi yöndür.
- `function jump()` → yalnız `onGround()` doğruysa hızı -11 yap: havadayken basmak işe yaramaz.
- `event.key === ' ' || event.key === 'ArrowUp'` → Boşluk ya da yukarı ok.
- `!event.repeat` → tuş basılı tutulunca tarayıcı tekrar tekrar `keydown` yollar; `repeat` o tekrarlarda `true`
  olur. Onları yok sayıyoruz: bir basış, bir zıplama.

# --task--

1. Under `GRAVITY`, write `JUMP`.
2. Under `onGround`, write `jump` and the `keydown` listener.

# --task-tr--

1. `const GRAVITY = 0.6` satırının altına `JUMP` satırını yaz.
2. `onGround` fonksiyonunun altına bir boş satır bırakıp `jump` fonksiyonunu ve `keydown` dinleyicisini yaz.
3. **Çalıştır**, oyuna tıkla ve Boşluk'a bas.

# --predict--

You keep Space held down. How many times does the runner jump?
- [x] Once
  Held keys send repeats, and `!event.repeat` ignores them.
- [ ] Again and again, like a spring
- [ ] Never

# --predict-tr--

Boşluk'u basılı tutuyorsun. Koşucu kaç kez zıplar?
- [x] Bir kez
  Basılı tuş tekrar olayları yollar; `!event.repeat` onları yok sayar.
- [ ] Yay gibi durmadan
- [ ] Hiç

# --tests--

Space should make the runner jump about 100 pixels high and land again.
tr: Boşluk koşucuyu yaklaşık 100 piksel zıplatmalı ve geri indirmeli.

```js
$.press(' ')
assert.strictEqual(runner.vy, -11)
let top = runner.y
for (let i = 0; i < 60; i++) {
  $.tick()
  top = Math.min(top, runner.y)
}
assert.isBelow(top, 136 - 90)
assert.strictEqual(runner.y, 136, 'back on the ground')
```

There should be no jumping in mid-air.
tr: Havada zıplamak olmamalı.

```js
$.press('ArrowUp')
$.release('ArrowUp')
$.tick(5)
const vy = runner.vy
$.press('ArrowUp')
assert.strictEqual(runner.vy, vy)
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
const STAND_H = 44

let runner = { x: 50, y: GROUND - STAND_H, w: 40, h: STAND_H, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (onGround()) runner.vy = JUMP
}

document.addEventListener('keydown', (event) => {
  if ((event.key === ' ' || event.key === 'ArrowUp') && !event.repeat) jump()
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
