---
title: One-way platforms
title_tr: Tek yönlü platformlar
skills: [game.collision]
---

# --explanation--

The platforms in this game are **one-way**: you jump up through them from below, and they only catch you on the way
down. That is what lets you climb without ever bumping your head.

So a landing needs three things at once:

1. the player is **falling** (`vy > 0`),
2. the feet **crossed the top** of the platform in this frame: above it before the move, at or below it after,
3. the player is horizontally **over** the platform, with 8 pixels of overlap needed on each side, so you do not bounce
   off the very corner.

Checking "crossed in this frame" instead of "is touching" matters. The player can move 10 pixels in a frame and a
platform is only 12 pixels thick, so a fast fall could skip over the moment of touching. Comparing the feet before and
after the move catches every crossing, however fast. (The same idea stops fast bullets from passing through walls.)

# --explanation-tr--

Bu oyundaki platformlar **tek yönlüdür**: alttan içlerinden geçerek zıplarsın; seni yalnızca aşağı inerken tutarlar. Başını
hiç çarpmadan tırmanmanı sağlayan budur.

Yani bir iniş için üç şey aynı anda gerekir:

1. oyuncu **düşüyor** (`vy > 0`),
2. ayaklar bu karede platformun **tepesini geçti**: hareketten önce üstündeydi, sonra tepede ya da altında,
3. oyuncu yatayda platformun **üstünde**; köşeden sekmesin diye her iki yanda 8 piksellik örtüşme gerekir.

"Değiyor mu" yerine "bu karede geçti mi" diye bakmak önemli. Oyuncu bir karede 10 piksel gidebilir ve bir platform yalnızca
12 piksel kalınlığındadır; hızlı bir düşüş değme anını atlayabilir. Ayakları hareketten önce ve sonra karşılaştırmak, ne
kadar hızlı olursa olsun her geçişi yakalar. (Aynı fikir hızlı mermilerin duvarlardan geçmesini de engeller.)

# --task--

1. Add the `platforms` array from the solution (six platforms, each `{ x, y, w: 60, h: 12 }`).
2. In `update()`, remember `oldBottom = player.y + player.h` before the physics, and `bottom` after. If the player is
   falling, look for a platform where `player.x + player.w - 8 > p.x`, `player.x + 8 < p.x + p.w`,
   `oldBottom <= p.y` and `bottom >= p.y`: put the player on it and set `vy` to `JUMP`.
3. Keep the floor bounce after that for now, and draw the platforms in `'#16a34a'`.

# --task-tr--

1. Çözümdeki `platforms` dizisini ekle (her biri `{ x, y, w: 60, h: 12 }` olan altı platform).
2. `update()` içinde fizikten önce `oldBottom = player.y + player.h`'yi, sonra `bottom`'ı hatırla. Oyuncu düşüyorsa
   `player.x + player.w - 8 > p.x`, `player.x + 8 < p.x + p.w`, `oldBottom <= p.y` ve `bottom >= p.y` olan bir platform
   ara: oyuncuyu onun üstüne koy ve `vy`'yi `JUMP` yap.
3. Şimdilik zemin sekişini bundan sonra tut ve platformları `'#16a34a'` ile çiz.

# --tests--

Falling onto a platform should bounce off it.
tr: Bir platformun üstüne düşmek ondan sektirmeli.

```js
player = { x: 180, y: 455, w: 40, h: 40, vy: 6 }
$.tick(1)
assert.strictEqual(player.y, 460)
assert.strictEqual(player.vy, -11)
```

Jumping up from below should pass through a platform.
tr: Alttan yukarı zıplamak bir platformun içinden geçmeli.

```js
player = { x: 180, y: 510, w: 40, h: 40, vy: -8 }
$.tick(1)
assert.closeTo(player.y, 502.35, 1e-9)
$.tick(8)
assert.isBelow(player.y + player.h, 500, 'the feet are above the platform now')
assert.isBelow(player.vy, 0)
```

A fast fall should not skip through a platform.
tr: Hızlı bir düşüş bir platformun içinden kaçmamalı.

```js
player = { x: 180, y: 452, w: 40, h: 40, vy: 15 }
$.tick(1)
assert.strictEqual(player.y, 460, 'the feet went from 492 to over 507 in one frame')
```

Only a real overlap of 8 pixels should count as standing on it.
tr: Yalnızca 8 piksellik gerçek bir örtüşme üstünde durmak sayılmalı.

```js
player = { x: 130, y: 455, w: 40, h: 40, vy: 6 }
$.tick(1)
assert.isAbove(player.y, 460, 'only 0 pixels over the platform: falls past it')
player = { x: 140, y: 455, w: 40, h: 40, vy: 6 }
$.tick(1)
assert.strictEqual(player.y, 460)
assert.lengthOf($.rects('#16a34a'), 6)
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
const platforms = [
  { x: 170, y: 500, w: 60, h: 12 },
  { x: 50, y: 410, w: 60, h: 12 },
  { x: 250, y: 320, w: 60, h: 12 },
  { x: 120, y: 230, w: 60, h: 12 },
  { x: 290, y: 140, w: 60, h: 12 },
  { x: 30, y: 60, w: 60, h: 12 },
]
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

  const oldBottom = player.y + player.h
  player.vy += GRAVITY
  player.y += player.vy
  const bottom = player.y + player.h

  // Platforms only catch you on the way down, when your feet cross their top in this frame.
  if (player.vy > 0) {
    for (const p of platforms) {
      const over = player.x + player.w - 8 > p.x && player.x + 8 < p.x + p.w
      if (over && oldBottom <= p.y && bottom >= p.y) {
        player.y = p.y - player.h
        player.vy = JUMP
        break
      }
    }
  }

  // For now the floor still bounces you back up.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h)
  }

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
