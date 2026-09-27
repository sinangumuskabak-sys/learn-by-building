---
title: Steering and wrapping around
title_tr: Yönlendirmek ve kenardan dolanmak
skills: [game.input]
---

# --explanation--

Steering has to be smooth: while a key is **held**, the player keeps moving. So instead of acting on each `keydown`,
remember which keys are down in a `keys` object, and let `update()` read it every frame:

```js
const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)   // -1, 0 or 1
player.x += direction * SPEED
```

Holding both keys gives `0`, which is exactly what you would expect.

There are no walls: walk off the right side and you come back on the left. The switch happens when the player's
**middle** crosses the edge, and while it is half off one side, draw it a second time on the other side, so it seems to
slide through the edge instead of jumping.

On a phone, holding a finger on the left or right half of the game does the same as holding an arrow key. The touch
handlers simply set the same `keys`, so `update()` does not need to know where the input came from.

# --explanation-tr--

Yönlendirme akıcı olmalı: bir tuş **basılı tutulduğu** sürece oyuncu hareket etmeye devam eder. Bu yüzden her `keydown`'da
bir şey yapmak yerine hangi tuşların basılı olduğunu bir `keys` nesnesinde hatırla ve `update()` bunu her karede okusun:

```js
const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)   // -1, 0 ya da 1
player.x += direction * SPEED
```

İki tuşu birden basılı tutmak `0` verir; tam da beklediğin gibi.

Duvar yok: sağ taraftan çıkarsan soldan geri gelirsin. Geçiş oyuncunun **ortası** kenarı geçtiğinde olur ve oyuncu bir
taraftan yarı yarıya taşmışken onu öbür tarafa ikinci kez çiz; böylece zıplamak yerine kenardan kayarak geçiyormuş gibi
görünür.

Telefonda parmağını oyunun sol ya da sağ yarısında tutmak bir ok tuşunu basılı tutmakla aynıdır. Dokunma işleyicileri
aynı `keys`'i ayarlar; böylece `update()`'in girdinin nereden geldiğini bilmesi gerekmez.

# --task--

1. Add `SPEED = 5` and `const keys = {}`. On `keydown` set `keys[event.key] = true` (and `preventDefault()` for the left
   and right arrows); on `keyup` set it back to `false`.
2. In `update()`, move the player by `direction * SPEED` before the physics. If its middle (`x + w / 2`) went below `0`,
   add `canvas.width` to `x`; if it went past `canvas.width`, subtract it.
3. In `draw()`, when `player.x < 0` also draw the player at `x + canvas.width`, and when its right edge is past the
   canvas, also at `x - canvas.width`.
4. On `pointerdown` on the canvas, hold `ArrowLeft` if the touch is in the left half (`event.clientX - rect.left <
   rect.width / 2`, with `rect = canvas.getBoundingClientRect()`), otherwise `ArrowRight`. On `pointerup` and
   `pointercancel`, release both.

# --task-tr--

1. `SPEED = 5` ve `const keys = {}` ekle. `keydown`'da `keys[event.key] = true` yap (sol ve sağ oklar için
   `preventDefault()`); `keyup`'ta onu yeniden `false` yap.
2. `update()` içinde fizikten önce oyuncuyu `direction * SPEED` kadar hareket ettir. Ortası (`x + w / 2`) `0`'ın altına
   indiyse `x`'e `canvas.width` ekle; `canvas.width`'i geçtiyse çıkar.
3. `draw()` içinde `player.x < 0` iken oyuncuyu `x + canvas.width`'te de, sağ kenarı canvas'ı geçtiğinde
   `x - canvas.width`'te de çiz.
4. Canvas'taki `pointerdown`'da dokunuş sol yarıdaysa (`rect = canvas.getBoundingClientRect()` ile
   `event.clientX - rect.left < rect.width / 2`) `ArrowLeft`'i, değilse `ArrowRight`'ı basılı tut. `pointerup` ve
   `pointercancel`'da ikisini de bırak.

# --tests--

Holding an arrow key should keep the player moving that way.
tr: Bir ok tuşunu basılı tutmak oyuncuyu o yöne hareket ettirmeye devam etmeli.

```js
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230)
$.release('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230)
$.press('ArrowLeft')
$.press('ArrowRight')
$.tick(10)
assert.strictEqual(player.x, 230, 'both keys cancel out')
```

Walking off one side should bring the player back on the other.
tr: Bir taraftan çıkmak oyuncuyu öbür taraftan geri getirmeli.

```js
player.x = 370
$.press('ArrowRight')
$.tick(2)
assert.strictEqual(player.x, 380, 'the middle is exactly on the edge: not yet')
$.tick(1)
assert.strictEqual(player.x, -15)
$.release('ArrowRight')
$.press('ArrowLeft')
$.tick(2)
assert.strictEqual(player.x, 375)
```

Half off one side, the player should also be drawn on the other side.
tr: Bir taraftan yarı yarıya taşmışken oyuncu öbür tarafta da çizilmeli.

```js
player.x = -15
$.tick(1)
assert.deepEqual($.rects('#f59e0b').map((r) => r.x), [-15, 385])
player.x = 100
$.tick(1)
assert.lengthOf($.rects('#f59e0b'), 1)
```

Holding a finger on the left or right half should steer.
tr: Parmağı sol ya da sağ yarıda tutmak yönlendirmeli.

```js
$.pointerDown(50, 300)
$.tick(4)
assert.strictEqual(player.x, 160)
$.pointerUp(50, 300)
$.tick(4)
assert.strictEqual(player.x, 160)
$.pointerDown(350, 300)
$.tick(2)
assert.strictEqual(player.x, 170)
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
const SPEED = 5 // sideways pixels per frame
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
const keys = {}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left or right half of the game to steer.
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  const left = event.clientX - rect.left < rect.width / 2
  keys[left ? 'ArrowLeft' : 'ArrowRight'] = true
})
function stopSteering() {
  keys.ArrowLeft = false
  keys.ArrowRight = false
}
canvas.addEventListener('pointerup', stopSteering)
canvas.addEventListener('pointercancel', stopSteering)

function update() {
  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
  // Walking off one side brings you back on the other.
  if (player.x + player.w / 2 < 0) player.x += canvas.width
  if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width

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
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
