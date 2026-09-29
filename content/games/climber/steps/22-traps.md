---
title: Traps
title_tr: Tuzaklar
skills: [game.state]
---

# --goal--

Sometimes a brown trap platform appears halfway between two real ones. It looks like a way up, but it will break.

# --goal-tr--

Bazen iki gerçek platformun **ortasında** kahverengi bir **tuzak** platform belirsin. Yukarı giden bir yol gibi görünür
ama üstüne basınca **kırılacak** (bunu sonraki adımda yapıyoruz). Olasılık başta %15, çok yukarıda %40.

# --code--

```js
const COLORS = { normal: '#16a34a', moving: '#2563eb', breaking: '#a16207' }

    // Sometimes a trap halfway to the next platform: it breaks instead of bouncing.
    if (Math.random() < 0.15 + 0.25 * d) {
      platforms.push({ x: Math.random() * (canvas.width - 60), y: highest + gap / 2, w: 60, h: 12, kind: 'breaking', vx: 0 })
    }
```

# --meaning--

- `highest + gap / 2` is halfway between the new platform and the one below it, so the traps never block the way.
- The chance grows from 15% to 40% with the difficulty.

# --meaning-tr--

- `0.15 + 0.25 * d` → başta 0,15 (%15), zorluk 1'de 0,40 (%40).
- `y: highest + gap / 2` → yeni platform ile altındakinin tam **ortası**. Tuzak ek bir platform; gerçek yolu kapatmaz,
  sadece yanıltır.
- `kind: 'breaking'` → kahverengi çizilir.

# --task--

1. Add `breaking: '#a16207'` to `COLORS`.
2. In `fillPlatforms`, under `platforms.push(platform)`, write the comment and the trap block.

# --task-tr--

1. `COLORS` tablosuna `breaking: '#a16207'` ekle.
2. `fillPlatforms` içinde `platforms.push(platform)` satırının altına yorumu ve tuzak bloğunu yaz.
3. **Çalıştır**: kahverengi platformlar görünmeli (şimdilik onlar da sektiriyor).

# --tests--

Traps should appear halfway between platforms, about 15% of the time at the start.
tr: Başlarda tuzaklar yaklaşık %15 olasılıkla platformların ortasında belirmeli.

```js
platforms = []
highest = 500
cameraY = -30000
fillPlatforms()
const traps = platforms.filter((p) => p.kind === 'breaking')
assert.isAbove(traps.length, 5)
assert.isTrue(traps.every((t) => t.vx === 0 && t.w === 60))
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
const COLORS = { normal: '#16a34a', moving: '#2563eb', breaking: '#a16207' }

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
      if (over && oldBottom <= p.y && bottom >= p.y) {
        player.y = p.y - player.h
        player.vy = JUMP
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
