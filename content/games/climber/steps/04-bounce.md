---
title: Bounce
title_tr: Sek
skills: [game.physics]
---

# --goal--

In this game you never press jump: every landing starts the next bounce. So on the floor, instead of stopping, the
player gets an upward speed of -11.

# --goal-tr--

Bu oyunda zıplama tuşu yok: **her iniş** bir sonraki zıplamayı başlatır, zıplayan durmadan seker. Tabana değince durmak
yerine yukarı doğru **-11** hız alsın; yer çekimi onu yavaşlatıp geri indirecek, sonra yine sekecek.

# --code--

```js
const JUMP = -11 // every bounce starts with this speed (negative = up)

  // Touching the floor starts the next bounce.
  if (player.y + player.h >= FLOOR) {
    player.y = FLOOR - player.h
    player.vy = JUMP
  }
```

# --meaning--

- `JUMP` is negative: up is negative on the canvas.
- Instead of `vy = 0`, the landing sets `vy = JUMP`: the player rises, slows down, falls and bounces again.

# --meaning-tr--

- `const JUMP = -11` → her sekişin başlangıç hızı; **eksi** çünkü canvas'ta yukarı eksi yöndür.
- `player.vy = JUMP` → `0` yerine: tabana değen zıplayan hemen yukarı fırlar. Yer çekimi her karede 0,35 ekleyerek onu
  yavaşlatır, tepe noktasında durur, sonra düşer ve yine seker.

# --task--

1. Under `GRAVITY`, write `JUMP`.
2. In `update`, add the comment and change `player.vy = 0` to `player.vy = JUMP`.

# --task-tr--

1. `GRAVITY` satırının altına `JUMP` satırını yaz.
2. `update` içindeki taban bloğunun üstüne yorumu yaz ve `player.vy = 0` satırını `player.vy = JUMP` yap.
3. **Çalıştır**: kutu durmadan sekmeli.

# --predict--

How high does a bounce go? (Start speed 11, gravity 0.35 each frame.)
- [ ] About 11 pixels
- [x] About 170 pixels
  The speed drops by 0.35 each frame, so the rise lasts about 31 frames: 11 × 11 ÷ (2 × 0.35) ≈ 172.
- [ ] Off the top of the screen

# --predict-tr--

Bir sekiş ne kadar yükselir? (Başlangıç hızı 11, her karede yer çekimi 0,35.)
- [ ] Yaklaşık 11 piksel
- [x] Yaklaşık 170 piksel
  Hız her karede 0,35 azalır, yükseliş ~31 kare sürer: 11 × 11 ÷ (2 × 0,35) ≈ 172.
- [ ] Ekranın üstünden çıkar

# --tests--

Landing on the floor should start a bounce.
tr: Tabana inmek bir sekiş başlatmalı.

```js
player.y = 559
player.vy = 2
update()
assert.strictEqual(player.vy, -11)
assert.strictEqual(player.y, 560)
```

A bounce should rise about 170 pixels.
tr: Bir sekiş yaklaşık 170 piksel yükselmeli.

```js
player.y = 559
player.vy = 2
update()
let top = player.y
for (let i = 0; i < 40; i++) {
  update()
  top = Math.min(top, player.y)
}
assert.isBelow(top, 560 - 160)
assert.isAbove(top, 560 - 180)
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
