---
title: Jump, and land
title_tr: Zıpla ve yere in
skills: [game.physics, game.input]
---

# --explanation--

A jump is the same physics as the flappy bird, with one new part: **the ground stops you**.

```js
runner.vy += GRAVITY   // gravity pulls a little more every frame
runner.y += runner.vy  // move
if (onGround()) {      // went into (or onto) the ground?
  runner.y = GROUND - runner.h   // stand exactly on it
  runner.vy = 0                  // and stop falling
}
```

Gravity keeps pulling even while the runner stands still; the ground check undoes it every frame. That sounds
wasteful, but it is the simplest correct approach: there is only one set of rules, whether the runner is in the air or
not.

A jump sets the velocity to `JUMP` (up), but **only when on the ground**. Without that check the player can jump again
in mid-air and fly away. (Some games allow a "double jump" on purpose. Then it is a counted, deliberate rule, never an
accident.)

# --explanation-tr--

Zıplama, Flappy kuşuyla aynı fizik; tek bir yeni parçayla: **zemin seni durdurur**.

```js
runner.vy += GRAVITY   // yerçekimi her karede biraz daha çeker
runner.y += runner.vy  // hareket et
if (onGround()) {      // zemine girdin mi (ya da değdin mi)?
  runner.y = GROUND - runner.h   // tam üstünde dur
  runner.vy = 0                  // ve düşmeyi bırak
}
```

Koşucu dururken bile yerçekimi çekmeye devam eder; zemin kontrolü bunu her karede geri alır. Kulağa israf gibi gelir
ama en basit doğru yaklaşım budur: koşucu havada olsun olmasın tek bir kural seti vardır.

Zıplama hızı `JUMP` (yukarı) yapar, ama **yalnızca yerdeyken**. Bu kontrol olmadan oyuncu havada yeniden zıplayıp uçup
gider. (Bazı oyunlar bilerek "çift zıplamaya" izin verir. O zaman sayılan, bilinçli bir kuraldır; asla bir kaza
değildir.)

# --task--

1. Add `const GRAVITY = 0.6` and `const JUMP = -11`, and give the runner `vy: 0`.
2. Write `function onGround()` that returns whether the runner's bottom (`runner.y + runner.h`) is at or below
   `GROUND`.
3. Write `function jump()` that sets `runner.vy = JUMP` only when the runner is on the ground. Call it on `keydown`
   for Space (`' '`) and `'ArrowUp'`.
4. Write `update()` with the gravity and landing code above, and a `loop()` that calls `update()`, `draw()` and
   `requestAnimationFrame(loop)`. Start the loop.

# --task-tr--

1. `const GRAVITY = 0.6` ve `const JUMP = -11` ekle; koşucuya `vy: 0` ver.
2. Koşucunun altı (`runner.y + runner.h`) `GROUND`'da ya da altındaysa doğru döndüren `function onGround()` yaz.
3. Yalnızca koşucu yerdeyken `runner.vy = JUMP` yapan `function jump()` yaz. Boşluk (`' '`) ve `'ArrowUp'` için
   `keydown`'da çağır.
4. Yukarıdaki yerçekimi ve yere inme koduyla `update()`'i, `update()`, `draw()` ve `requestAnimationFrame(loop)`
   çağıran bir `loop()` yaz. Döngüyü başlat.

# --tests--

Standing still, the runner should stay on the ground.
tr: Dururken koşucu zeminde kalmalı.

```js
assert.deepEqual([GRAVITY, JUMP], [0.6, -11])
$.tick(30)
assert.strictEqual(runner.y, 136)
assert.strictEqual(runner.vy, 0)
assert.isTrue(onGround())
```

Space should start a jump that rises, then lands back on the ground.
tr: Boşluk yükselen, sonra zemine geri inen bir zıplama başlatmalı.

```js
$.press(' ')
assert.strictEqual(runner.vy, -11)
$.tick(10)
assert.isBelow(runner.y, 70, 'about 77 px up after 10 frames')
assert.isFalse(onGround())
$.tick(40)
assert.strictEqual(runner.y, 136)
assert.strictEqual(runner.vy, 0)
```

There should be no jumping in mid-air.
tr: Havada zıplamak olmamalı.

```js
$.press('ArrowUp')
$.release('ArrowUp')
$.tick(5)
const vy = runner.vy
$.press(' ')
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

let runner = { x: 50, y: GROUND - 44, w: 40, h: 44, vy: 0 }

function onGround() {
  return runner.y + runner.h >= GROUND
}

function jump() {
  if (onGround()) runner.vy = JUMP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') jump()
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
