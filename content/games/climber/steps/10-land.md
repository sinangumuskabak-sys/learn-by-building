---
title: Land on platforms
title_tr: Platformlara kon
skills: [game.collision]
---

# --goal--

A platform catches the player only on the way down, and only when the feet cross its top during this frame. So you can
jump up through a platform from below and land on it on the way down, just like the real game.

# --goal-tr--

Bir platform zıplayanı yalnız **düşerken** yakalar ve yalnız ayaklar **bu karede** platformun üstünü **geçtiyse**.
Böylece aşağıdan platformun içinden geçip yukarı çıkabilir, düşerken üstüne konabilirsin; tıpkı gerçek oyundaki gibi.

Bunun için ayakların hareketten **önceki** ve **sonraki** yerini karşılaştırıyoruz.

# --code--

```js
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
```

# --meaning--

- `oldBottom` and `bottom` are the feet before and after this frame's move.
- `vy > 0` means falling. `over` checks the player is above the platform sideways (8 pixels of each side do not count).
- The feet crossed the top when they were above it before (`oldBottom <= p.y`) and at or below it now.
- Then the player is put on top and bounces; `break` stops looking at other platforms.

# --meaning-tr--

- `const oldBottom = player.y + player.h` → ayakların hareketten **önceki** yeri; `bottom` → **sonraki** yeri.
- `if (player.vy > 0)` → yalnız **düşerken** (vy artı).
- `over` → yatayda platformun üstünde mi? Kenarlardan 8'er piksel sayılmaz; köşesiyle değmek yetmesin.
- `oldBottom <= p.y && bottom >= p.y` → ayaklar önce platformun **üstündeydi**, şimdi **hizasında ya da altında**: bu
  karede üstünü geçtiler.
- `player.y = p.y - player.h` → platformun tam üstüne koy; `player.vy = JUMP` → sek.
- `break` → bir platform yeter, diğerlerine bakma.

# --task--

1. In `update`, write `oldBottom` above the gravity lines and `bottom` under them.
2. Write the comment and the landing block, then change the floor comment.

# --task-tr--

1. `update` içinde `player.vy += GRAVITY` satırının üstüne `oldBottom` satırını, `player.y += player.vy` satırının
   altına `bottom` satırını yaz.
2. Bir boş satır bırakıp yorumu ve iniş bloğunu yaz.
3. Taban bloğunun üstündeki yorumu `// For now the floor still bounces you back up.` yap.
4. **Çalıştır**: platformlara sekerek yukarı çık.

# --predict--

The player jumps up from below a platform. What happens when its head reaches the platform?
- [ ] It bumps its head and falls back
- [x] It passes through
  Platforms only catch a falling player (`vy > 0`).
- [ ] It lands on it at once

# --predict-tr--

Zıplayan bir platformun altından yukarı zıplıyor. Başı platforma gelince ne olur?
- [ ] Başını çarpıp geri düşer
- [x] İçinden geçer
  Platformlar yalnız düşen zıplayanı (`vy > 0`) yakalar.
- [ ] Hemen üstüne konar

# --tests--

Falling onto a platform should bounce off it.
tr: Bir platformun üstüne düşmek ondan sektirmeli.

```js
player.x = 180
player.y = 457
player.vy = 4
update()
assert.strictEqual(player.y, 460)
assert.strictEqual(player.vy, -11)
```

Rising through a platform from below should not stop the player.
tr: Aşağıdan bir platformun içinden yükselmek zıplayanı durdurmamalı.

```js
player.x = 180
player.y = 500
player.vy = -8
update()
assert.isBelow(player.y, 500)
assert.isBelow(player.vy, 0)
assert.notStrictEqual(player.vy, -11)
```

Only just touching the platform's corner should not count.
tr: Platformun köşesine hafifçe değmek sayılmamalı.

```js
player.x = 126
player.y = 457
player.vy = 4
update()
assert.isAbove(player.vy, 0)
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
