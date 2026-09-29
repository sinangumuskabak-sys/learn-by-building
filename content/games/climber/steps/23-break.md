---
title: It breaks!
title_tr: Kırılıyor!
skills: [game.collision, game.state]
---

# --goal--

Landing on a trap breaks it: no bounce, and the broken platform falls away. The player keeps falling, maybe onto a real
platform below.

# --goal-tr--

Tuzağa konmak onu **kırar**: sekiş yok, kırık platform **düşüp gider**. Zıplayan düşmeye devam eder; belki alttaki
gerçek bir platforma konar, belki de oyun biter.

# --code--

```js
if (p.broken) p.y += 5 // a broken platform falls away

  if (!p.broken && over && oldBottom <= p.y && bottom >= p.y) {
    if (p.kind === 'breaking') {
      p.broken = true
      continue
    }
```

# --meaning--

- A broken platform can no longer catch anyone (`!p.broken`).
- Landing on a trap marks it broken and `continue`s to the next platform instead of bouncing.
- Every frame a broken platform drops 5 pixels until it leaves the screen.

# --meaning-tr--

- `!p.broken &&` → kırılmış platform kimseyi tutmaz.
- `if (p.kind === 'breaking')` → tuzağa kondun: `p.broken = true` ile kır ve `continue` ile **sekmeden** sıradaki
  platforma bak (belki aynı karede bir başkasına denk gelirsin).
- `if (p.broken) p.y += 5` → kırık platform her karede 5 piksel aşağı düşer; ekranın altından çıkınca `filter` onu
  atar.

# --task--

1. In the platforms loop of `update`, write the falling line first.
2. In the landing check, add `!p.broken &&` and the trap block.

# --task-tr--

1. `update` içinde platformları kaydıran döngünün **ilk satırı** kırık platformun düşme satırı olsun.
2. İniş kontrolündeki koşulun başına `!p.broken && ` ekle ve altına tuzak bloğunu yaz.
3. **Çalıştır** ve bir tuzağa kon. Oyun bitti!

# --tests--

Landing on a trap should break it without a bounce.
tr: Tuzağa konmak sekmeden onu kırmalı.

```js
platforms = [{ x: 170, y: 500, w: 60, h: 12, kind: 'breaking', vx: 0 }]
player.x = 180
player.y = 457
player.vy = 4
update()
assert.isTrue(platforms[0].broken)
assert.isAbove(player.vy, 0)
```

A broken platform should fall away and catch no one.
tr: Kırık platform düşüp gitmeli ve kimseyi tutmamalı.

```js
platforms = [{ x: 170, y: 500, w: 60, h: 12, kind: 'breaking', vx: 0, broken: true }]
update()
assert.strictEqual(platforms[0].y, 505)
player.x = 180
player.y = platforms[0].y - 43
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
