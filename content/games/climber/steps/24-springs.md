---
title: "Build it yourself: springs"
title_tr: "Kendin yap: yaylar"
skills: [game.physics, game.state]
---

# --goal--

Add springs: a pink kind of platform that launches the player with 1.5 times the normal bounce speed (more than twice as
high). About one platform in twelve that does not move should be a spring.

# --goal-tr--

**Yay** ekle: pembe yeni bir platform türü; üstüne konan zıplayanı normal sekiş hızının **1,5 katıyla** fırlatsın (bu,
iki kattan fazla yükseklik demek, çünkü yükseklik hızın karesiyle büyür). Hareket etmeyen platformların yaklaşık
**on ikide biri** yay olsun.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: `COLORS` tablosu, `fillPlatforms`'ta tür seçimi, inişte `vy`.

# --task--

- A new kind, `'spring'`, drawn pink (`COLORS.spring`).
- Landing on a spring sets `vy` to `JUMP * 1.5` instead of `JUMP`.
- In `fillPlatforms`, platforms that did not become moving ones sometimes become springs.

# --task-tr--

- Yeni bir tür: `'spring'` (yay), pembe çizilsin (`COLORS.spring`).
- Yaya konmak `vy`'yi `JUMP` yerine `JUMP * 1.5` yapsın.
- `fillPlatforms` içinde hareketli olmayan platformlar ara sıra (yaklaşık %8) yay olsun.

# --hint--

Add `spring` to `COLORS`. In `fillPlatforms`, after the moving-platform `if`, add `else if (Math.random() < 0.08)` that
sets the kind to `'spring'`. When landing, use `p.kind === 'spring' ? JUMP * 1.5 : JUMP`.

# --hint-tr--

`COLORS`'a `spring` ekle. `fillPlatforms`'ta hareketli platform `if`'inden sonra türü `'spring'` yapan bir
`else if (Math.random() < 0.08)` ekle. İnişte `p.kind === 'spring' ? JUMP * 1.5 : JUMP` kullan.

# --tests--

Landing on a spring should launch 1.5 times as fast.
tr: Yaya konmak 1,5 kat hızlı fırlatmalı.

```js
platforms = [{ x: 170, y: 500, w: 60, h: 12, kind: 'spring', vx: 0 }]
player.x = 180
player.y = 457
player.vy = 4
update()
assert.strictEqual(player.vy, -16.5)
```

Springs should be pink, and appear now and then.
tr: Yaylar pembe olmalı ve ara sıra çıkmalı.

```js
assert.isString(COLORS.spring)
platforms = []
highest = 500
cameraY = -40000
fillPlatforms()
const springs = platforms.filter((p) => p.kind === 'spring')
assert.isAbove(springs.length, 5)
assert.isBelow(springs.length / platforms.length, 0.2)
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
const START_Y = 500 // world y of the first platform
// A bounce rises about JUMP * JUMP / (2 * GRAVITY) = 172 pixels, so a gap must stay well below that.
const MAX_GAP = 110
const COLORS = { normal: '#16a34a', moving: '#2563eb', breaking: '#a16207', spring: '#db2777' }

let player
let platforms
let cameraY // the world y shown at the top of the screen: the camera
let highest // world y of the highest platform so far
let score
let state // 'playing' or 'over'
let best = Number(localStorage.getItem('doodle-best')) || 0
const keys = {}

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12, kind: 'normal', vx: 0 }]
  cameraY = 0
  highest = START_Y
  score = 0
  state = 'playing'
  fillPlatforms()
}

// 0 at the start, growing to 1 after climbing 10000 pixels.
function difficulty(y) {
  return Math.min(1, (START_Y - y) / 10000)
}

// Add platforms above the highest one until the screen (and a little more) is full.
function fillPlatforms() {
  while (highest > cameraY - 100) {
    const d = difficulty(highest)
    const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)
    highest -= gap
    const platform = { x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12, kind: 'normal', vx: 0 }
    if (Math.random() < d * 0.5) {
      platform.kind = 'moving'
      platform.vx = 1.5
    } else if (Math.random() < 0.08) {
      platform.kind = 'spring'
    }
    platforms.push(platform)
    // Sometimes a trap halfway to the next platform: it breaks instead of bouncing.
    if (Math.random() < 0.15 + 0.25 * d) {
      platforms.push({ x: Math.random() * (canvas.width - 60), y: highest + gap / 2, w: 60, h: 12, kind: 'breaking', vx: 0 })
    }
  }
}

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
  if (event.key === ' ' && state === 'over') reset()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

// Touch: hold the left or right half of the game to steer.
canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
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
  if (state !== 'playing') return

  const direction = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)
  player.x += direction * SPEED
  // Walking off one side brings you back on the other.
  if (player.x + player.w / 2 < 0) player.x += canvas.width
  if (player.x + player.w / 2 > canvas.width) player.x -= canvas.width

  for (const p of platforms) {
    if (p.broken) p.y += 5 // a broken platform falls away
    p.x += p.vx
    if (p.x < 0 || p.x + p.w > canvas.width) p.vx = -p.vx
  }

  const oldBottom = player.y + player.h
  player.vy += GRAVITY
  player.y += player.vy
  const bottom = player.y + player.h

  // Platforms only catch you on the way down, when your feet cross their top in this frame.
  if (player.vy > 0) {
    for (const p of platforms) {
      const over = player.x + player.w - 8 > p.x && player.x + 8 < p.x + p.w
      if (!p.broken && over && oldBottom <= p.y && bottom >= p.y) {
        if (p.kind === 'breaking') {
          p.broken = true
          continue
        }
        player.y = p.y - player.h
        player.vy = p.kind === 'spring' ? JUMP * 1.5 : JUMP
        break
      }
    }
  }

  // The camera only ever moves up, keeping the player in the upper part of the screen.
  if (player.y < cameraY + 200) cameraY = player.y - 200
  score = Math.max(score, Math.floor((START_Y - player.y - player.h) / 10))
  fillPlatforms()
  platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

  if (player.y > cameraY + canvas.height) {
    state = 'over'
    if (score > best) {
      best = score
      localStorage.setItem('doodle-best', best)
    }
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint lines fixed to the world, so you can see the climb even between platforms.
  ctx.fillStyle = '#e2e8f0'
  for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

  for (const p of platforms) {
    ctx.fillStyle = COLORS[p.kind]
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score: ' + score, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Best: ' + best, canvas.width - 10, 26)

  if (state === 'over') {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.85)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0f172a'
    ctx.textAlign = 'center'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2)
    ctx.font = '18px sans-serif'
    ctx.fillText('Press Space to play again', canvas.width / 2, canvas.height / 2 + 32)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
