---
title: Kinds of platform
title_tr: Platform türleri
skills: [game.state]
---

# --goal--

Soon there will be several kinds of platform. Each one gets a `kind` and a sideways speed `vx`, and its color is looked
up in a table by its kind.

# --goal-tr--

Birazdan farklı **türde** platformlar olacak: hareket eden, kırılan... Her platforma bir `kind` (tür) ve bir yatay hız
`vx` veriyoruz; rengini de türüne göre bir **tablodan** bakıyoruz. Şimdilik tek tür var: `normal`.

# --code--

```js
const COLORS = { normal: '#16a34a' }

  platforms = [{ x: 170, y: START_Y, w: 60, h: 12, kind: 'normal', vx: 0 }]

    const platform = { x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12, kind: 'normal', vx: 0 }
    platforms.push(platform)

  for (const p of platforms) {
    ctx.fillStyle = COLORS[p.kind]
```

# --meaning--

- `COLORS` maps a kind to a color; `COLORS[p.kind]` looks it up.
- The new platform is kept in a variable before it is pushed, so the next steps can change it first.

# --meaning-tr--

- `const COLORS = { normal: '#16a34a' }` → türden renge bir tablo.
- `kind: 'normal', vx: 0` → her platformun türü ve yatay hızı (şimdilik hareketsiz).
- `const platform = { ... }` → yeni platformu önce bir değişkende tutup sonra listeye ekliyoruz; sonraki adımlarda
  eklemeden önce onu değiştireceğiz.
- `ctx.fillStyle = COLORS[p.kind]` → rengi türüne göre tablodan al. Artık döngünün **içinde**, çünkü her platform farklı
  renkte olabilir.

# --task--

1. Under `MAX_GAP`, write `COLORS`.
2. Add `kind: 'normal', vx: 0` to the platform in `reset`, and build the new platform in a variable in `fillPlatforms`.
3. In `draw`, pick each platform's color inside the loop.

# --task-tr--

1. `MAX_GAP` satırının altına `COLORS` satırını yaz.
2. `reset`'teki platforma ve `fillPlatforms`'taki yeni platforma `kind: 'normal', vx: 0` ekle; `fillPlatforms`'ta
   platformu önce `const platform` değişkenine koy, sonra `platforms.push(platform)`.
3. `draw` içinde `ctx.fillStyle = '#16a34a'` satırını sil; döngünün içine `ctx.fillStyle = COLORS[p.kind]` yaz.
4. **Çalıştır**: görünüş aynı.

# --tests--

Every platform should have a kind and a sideways speed.
tr: Her platformun bir türü ve yatay hızı olmalı.

```js
assert.isTrue(platforms.every((p) => p.kind === 'normal' && p.vx === 0))
```

Platforms should be drawn in their kind's color.
tr: Platformlar türlerinin renginde çizilmeli.

```js
COLORS.test = '#123456'
platforms = [{ x: 10, y: 300, w: 60, h: 12, kind: 'test', vx: 0 }]
$.tick()
assert.lengthOf($.rects('#123456'), 1)
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
const COLORS = { normal: '#16a34a' }

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
    platforms.push(platform)
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
