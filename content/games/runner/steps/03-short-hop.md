---
title: Short hops and long jumps
title_tr: Kısa sekme ve uzun atlama
skills: [game.input, game.physics]
---

# --explanation--

Every jump is the same height right now. Good platformers let you control it: **tap** for a short hop, **hold** for a
full jump. It feels like the jump button is analog, but the trick is tiny:

> When the button is released while the runner is still going up fast, cut the upward speed.

```js
if (runner.vy < CUT) runner.vy = CUT   // CUT = -4: keep rising a little, then fall early
```

Nothing else changes; gravity does the rest. Releasing early turns the arc into a small hop, and holding lets the full
jump play out.

Two details make input feel solid:

- **Key repeat**: holding a key makes the browser fire `keydown` again and again. Those repeated events have
  `event.repeat === true`; ignore them for the jump, so holding Space does not bounce the runner the instant it lands.
- **Touch and mouse**: `pointerdown` jumps and `pointerup` cuts, so a tap and a long press work the same way as the
  keyboard. Put the release logic in one function, `endJump()`, and call it from both.

# --explanation-tr--

Şu an her zıplama aynı yükseklikte. İyi platform oyunları bunu kontrol etmene izin verir: kısa bir sekme için
**dokun**, tam zıplama için **basılı tut**. Zıplama tuşu analogmuş gibi hissettirir ama hile küçücük:

> Koşucu hâlâ hızla yükselirken tuş bırakılırsa yukarı hızı kes.

```js
if (runner.vy < CUT) runner.vy = CUT   // CUT = -4: biraz daha yüksel, sonra erken düş
```

Başka hiçbir şey değişmez; gerisini yerçekimi yapar. Erken bırakmak kavisi küçük bir sekmeye çevirir, basılı tutmak tam
zıplamanın sonuna kadar gitmesine izin verir.

İki ayrıntı girdiyi sağlam hissettirir:

- **Tuş tekrarı**: bir tuşu basılı tutmak tarayıcının `keydown`'ı tekrar tekrar göndermesine yol açar. Bu tekrarlanan
  olaylarda `event.repeat === true`'dur; zıplama için onları görmezden gel, yoksa Boşluk'u basılı tutmak koşucuyu yere
  indiği anda yeniden zıplatır.
- **Dokunma ve fare**: `pointerdown` zıplatır, `pointerup` keser; böylece kısa dokunuş ve uzun basış klavyeyle aynı
  çalışır. Bırakma mantığını tek bir fonksiyona, `endJump()`'a koy ve ikisinden de çağır.

# --task--

1. Add `const CUT = -4` and `function endJump()` that sets `runner.vy = CUT` when `runner.vy < CUT`.
2. Call `endJump()` on `keyup` for Space and `'ArrowUp'`, and on `pointerup` on the canvas.
3. Ignore repeated `keydown` events (`event.repeat`) when jumping, and also jump on `pointerdown` on the canvas.

# --task-tr--

1. `const CUT = -4` ve `runner.vy < CUT` olduğunda `runner.vy = CUT` yapan `function endJump()` ekle.
2. Boşluk ve `'ArrowUp'` için `keyup`'ta ve canvas üzerindeki `pointerup`'ta `endJump()` çağır.
3. Zıplarken tekrarlanan `keydown` olaylarını (`event.repeat`) görmezden gel; canvas üzerindeki `pointerdown`'da da
   zıpla.

# --tests--

Releasing early should cut the upward speed to `CUT`.
tr: Erken bırakmak yukarı hızı `CUT`'a indirmeli.

```js
assert.strictEqual(CUT, -4)
$.press(' ')
$.tick(3)
$.release(' ')
assert.strictEqual(runner.vy, -4)
```

A short hop should stay lower than a full jump.
tr: Kısa sekme tam zıplamadan daha alçakta kalmalı.

```js
function peak(holdFrames) {
  let highest = runner.y
  $.press(' ')
  for (let i = 0; i < 60; i++) {
    if (i === holdFrames) $.release(' ')
    $.tick()
    highest = Math.min(highest, runner.y)
  }
  $.release(' ')
  return 136 - highest
}
const hop = peak(3)
const full = peak(60)
assert.isBelow(hop, 50)
assert.isAbove(full, 90)
```

Releasing while already falling should change nothing.
tr: Zaten düşerken bırakmak hiçbir şeyi değiştirmemeli.

```js
$.press(' ')
$.tick(25)
const vy = runner.vy
assert.isAbove(vy, 0)
$.release(' ')
assert.strictEqual(runner.vy, vy)
```

Tapping the game should jump, and letting go should cut the jump too.
tr: Oyuna dokunmak zıplatmalı, parmağı kaldırmak da zıplamayı kesmeli.

```js
$.pointerDown(100, 100)
assert.strictEqual(runner.vy, -11)
$.tick(2)
$.pointerUp(100, 100)
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

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }

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
