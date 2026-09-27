---
title: Bouncing forever
title_tr: Sonsuza kadar sekmek
skills: [game.physics, game.loop]
---

# --explanation--

In this game you never press "jump". The player **bounces automatically** whenever it lands, and all you do is steer.
That makes the physics the heart of the game, and it is only three lines:

```js
player.vy += GRAVITY   // gravity changes the speed a little every frame
player.y += player.vy  // the speed changes the position
if (landed) player.vy = JUMP   // a bounce starts with a fixed upward speed
```

Because every bounce starts with the same speed, every bounce reaches the **same height**. You can even calculate it:
the speed shrinks by `GRAVITY` each frame until it reaches zero, so the rise is about `JUMP² / (2 × GRAVITY)` =
`121 / 0.7` ≈ 172 pixels (a little less, 167, because the game moves in whole frames). Later that number decides how far
apart platforms may be, so the game is always possible.

When the player touches the floor, put it exactly **on** the floor before bouncing. Otherwise it would sink a few
pixels into the ground on each bounce.

# --explanation-tr--

Bu oyunda asla "zıpla"ya basmazsın. Oyuncu her yere indiğinde **kendiliğinden seker**; senin tek yaptığın yönlendirmek.
Bu da fiziği oyunun kalbi yapar ve fizik yalnızca üç satırdır:

```js
player.vy += GRAVITY   // yerçekimi hızı her karede biraz değiştirir
player.y += player.vy  // hız konumu değiştirir
if (landed) player.vy = JUMP   // bir sekiş sabit bir yukarı hızla başlar
```

Her sekiş aynı hızla başladığı için her sekiş **aynı yüksekliğe** çıkar. Bunu hesaplayabilirsin bile: hız her karede
`GRAVITY` kadar küçülür ve sıfıra iner; yani yükseliş yaklaşık `JUMP² / (2 × GRAVITY)` = `121 / 0.7` ≈ 172 pikseldir
(oyun tam karelerle ilerlediği için biraz daha az, 167). Sonra bu sayı platformların birbirinden ne kadar uzak
olabileceğine karar verecek; böylece oyun hep mümkün kalır.

Oyuncu zemine değdiğinde sekmeden önce onu tam olarak zeminin **üstüne** koy. Yoksa her sekişte birkaç piksel zemine
gömülürdü.

# --task--

1. Add `GRAVITY = 0.35`, `JUMP = -11`, `FLOOR = 600`, and `let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }`.
2. Write `update()`: add `GRAVITY` to `player.vy`, add `player.vy` to `player.y`, and if the player's bottom
   (`y + h`) reached `FLOOR`, put it on the floor and set `vy` to `JUMP`.
3. Write `draw()`: a `'#f8fafc'` background and the player as a `'#f59e0b'` rectangle.
4. Call `update()` and `draw()` every frame with `requestAnimationFrame`.

# --task-tr--

1. `GRAVITY = 0.35`, `JUMP = -11`, `FLOOR = 600` ve `let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }` ekle.
2. `update()` yaz: `player.vy`'ye `GRAVITY` ekle, `player.y`'ye `player.vy` ekle; oyuncunun altı (`y + h`) `FLOOR`'a
   ulaştıysa onu zeminin üstüne koy ve `vy`'yi `JUMP` yap.
3. `draw()` yaz: `'#f8fafc'` bir arka plan ve oyuncu için `'#f59e0b'` bir dikdörtgen.
4. Her karede `requestAnimationFrame` ile `update()` ve `draw()` çağır.

# --tests--

Gravity should pull the player down faster and faster.
tr: Yerçekimi oyuncuyu gittikçe hızlanarak aşağı çekmeli.

```js
$.tick(1)
assert.closeTo(player.vy, 0.35, 1e-9)
assert.closeTo(player.y, 460.35, 1e-9)
$.tick(1)
assert.closeTo(player.vy, 0.7, 1e-9)
assert.closeTo(player.y, 461.05, 1e-9)
```

Touching the floor should start a bounce, standing exactly on the floor.
tr: Zemine değmek, tam zeminin üstünde durarak bir sekiş başlatmalı.

```js
let frames = 0
while (player.vy >= 0 && frames < 200) {
  $.tick(1)
  frames++
}
assert.isBelow(frames, 200, 'the player never bounced')
assert.strictEqual(player.y, 560)
assert.strictEqual(player.vy, -11)
```

Every bounce should reach the same height.
tr: Her sekiş aynı yüksekliğe çıkmalı.

```js
const peaks = []
let lowest = Infinity
for (let i = 0; i < 300; i++) {
  const before = player.vy
  $.tick(1)
  if (before < 0 && player.vy >= 0) peaks.push(player.y)
}
assert.isAtLeast(peaks.length, 2)
for (const y of peaks) assert.closeTo(y, 392.6, 0.5)
```

The player should be drawn where it is.
tr: Oyuncu bulunduğu yerde çizilmeli.

```js
$.tick(1)
const [p] = $.rects('#f59e0b')
assert.deepEqual([p.x, p.w, p.h], [180, 40, 40])
assert.closeTo(p.y, 460.35, 1e-9)
```

# --seed--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
```

# --solution--

```js
// Doodle Jump-style climber, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GRAVITY = 0.35
const JUMP = -11 // every bounce starts with this speed (negative = up)
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }

function update() {
  player.vy += GRAVITY
  player.y += player.vy
  // Touching the floor starts the next bounce.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
