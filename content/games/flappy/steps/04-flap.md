---
title: Flap
title_tr: Kanat çırp
skills: [game.input, game.physics]
---

# --explanation--

A flap does not push the bird up by some pixels. It **sets the velocity** to a fixed upward speed:

```js
bird.vy = FLAP   // FLAP = -8: negative means up, because y grows downwards
```

Gravity then takes over as usual: `-8, -7.5, -7, ...` The bird rises fast, slows down, stops for a moment at the top
and falls again. That smooth arc comes for free from the two lines you wrote in the last step. You never have to
program "go up, then slow down".

Why *set* instead of *add*? If a flap added `-8`, flapping while falling fast would barely help, and flapping twice
would launch the bird into space. Setting it makes every flap feel the same, which is what makes the game fair.

Players will flap with Space, the Up arrow, or by clicking/tapping the game. Put the flap in one function and call it
from every input. One behavior, many triggers.

# --explanation-tr--

Kanat çırpmak kuşu birkaç piksel yukarı itmez. **Hızı** sabit bir yukarı hıza **ayarlar**:

```js
bird.vy = FLAP   // FLAP = -8: negatif yukarı demek, çünkü y aşağı doğru büyür
```

Sonra yerçekimi her zamanki gibi devralır: `-8, -7.5, -7, ...` Kuş hızla yükselir, yavaşlar, tepede bir an durur ve
yeniden düşer. O yumuşak kavis, önceki adımda yazdığın iki satırdan bedavaya çıkar. "Yukarı çık, sonra yavaşla" diye
bir şey programlaman hiç gerekmez.

Neden *eklemek* değil de *ayarlamak*? Kanat çırpış `-8` ekleseydi, hızla düşerken çırpmak pek işe yaramaz, iki kez
çırpmak da kuşu uzaya fırlatırdı. Ayarlamak her çırpışı aynı hissettirir; oyunu adil yapan da budur.

Oyuncular Boşluk, Yukarı ok ya da oyuna tıklayarak/dokunarak kanat çırpacak. Çırpmayı bir fonksiyona koy ve her
girdiden onu çağır. Tek davranış, birçok tetikleyici.

# --task--

1. Add `const FLAP = -8`.
2. Write `function flap()` that sets `bird.vy` to `FLAP`.
3. Call `flap()` on `keydown` when the key is `' '` (Space) or `'ArrowUp'`, and on `pointerdown` on the canvas.

# --task-tr--

1. `const FLAP = -8` ekle.
2. `bird.vy`'yi `FLAP` yapan `function flap()` yaz.
3. `flap()`'i tuş `' '` (Boşluk) ya da `'ArrowUp'` olduğunda `keydown`'da, ayrıca canvas üzerindeki `pointerdown`'da
   çağır.

# --tests--

`flap()` should set the bird's velocity to `FLAP` (-8), even while falling fast.
tr: `flap()` kuşun hızını, hızla düşerken bile `FLAP` (-8) yapmalı.

```js
assert.strictEqual(FLAP, -8)
bird.vy = 12
flap()
assert.strictEqual(bird.vy, -8)
```

Space and the Up arrow should flap.
tr: Boşluk ve Yukarı ok kanat çırpmalı.

```js
bird.vy = 5
$.press(' ')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowUp')
assert.strictEqual(bird.vy, -8)
bird.vy = 5
$.press('ArrowDown')
assert.strictEqual(bird.vy, 5)
```

Clicking or tapping the game should flap.
tr: Oyuna tıklamak ya da dokunmak kanat çırpmalı.

```js
bird.vy = 5
$.click(200, 300)
assert.strictEqual(bird.vy, -8)
```

After a flap the bird should rise, then fall again.
tr: Kanat çırptıktan sonra kuş yükselmeli, sonra yeniden düşmeli.

```js
$.tick(5)
const before = bird.y
flap()
$.tick(8)
assert.isBelow(bird.y, before, 'the bird should be higher after flapping')
$.tick(30)
assert.isAbove(bird.vy, 0, 'gravity should win again')
```

# --solution--

```js
// Flappy, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.5 // added to the bird's speed every frame
const FLAP = -8 // the bird's speed right after a flap (negative = up)

let bird = { x: 100, y: 300, vy: 0, r: 14 }

function flap() {
  bird.vy = FLAP
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowUp') flap()
})
canvas.addEventListener('pointerdown', flap)

function update() {
  bird.vy += GRAVITY
  bird.y += bird.vy
}

function draw() {
  ctx.fillStyle = '#70c5ce'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'gold'
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
