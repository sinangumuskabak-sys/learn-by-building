---
title: Play again
title_tr: Yeniden oyna
skills: [game.state, prog.functions]
---

# --goal--

After a fall, Space starts a new climb. All the starting values move into `reset`, which runs at the start and after
every game over.

# --goal-tr--

Düştükten sonra **Boşluk** yeni bir tırmanış başlatsın. Bütün başlangıç değerlerini `reset` (sıfırla) fonksiyonuna
topluyoruz: oyun açılırken bir kez, her oyun bitişinden sonra yeniden çalışır.

# --code--

```js
let player
let platforms
let cameraY // the world y shown at the top of the screen: the camera
let highest // world y of the highest platform so far
let state // 'playing' or 'over'

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
  cameraY = 0
  highest = START_Y
  state = 'playing'
  fillPlatforms()
}

  if (event.key === ' ' && state === 'over') reset()

reset()
```

# --meaning--

- The variables are declared without values at the top; `reset` sets them, and fills the screen with platforms.
- The player starts standing on the first platform (`START_Y - 40`).
- Space only restarts after a game over.

# --meaning-tr--

- `let player` ... → değişkenler en üstte **değersiz**; değerlerini `reset` verir. İçeride `let` yok.
- `y: START_Y - 40` → zıplayan ilk platformun tam üstünde başlar (eskiden yazılı olan 460 ile aynı).
- `fillPlatforms()` → `reset`'in sonunda ekranı yeni platformlarla doldurur.
- `if (event.key === ' ' && state === 'over') reset()` → Boşluk yalnız oyun bittiyse yeniden başlatır.
- En alttaki `reset()` → `fillPlatforms()` yerine; ilk oyunu kurar.

# --task--

1. Replace the five variable lines with plain declarations, and write `reset` under `const keys = {}`.
2. In `keydown`, add the Space line.
3. Replace `fillPlatforms()` at the bottom with `reset()`.

# --task-tr--

1. `let player = { ... }` satırından `let state = 'playing' ...` satırına kadar olan beş satırı değersiz tanımlarla
   değiştir; `const keys = {}` satırının altına bir boş satır bırakıp `reset` fonksiyonunu yaz.
2. `keydown` dinleyicisinin sonuna Boşluk satırını ekle.
3. En alttaki `fillPlatforms()` satırını `reset()` yap.
4. **Çalıştır**, düş ve Boşluk'a bas.

# --tests--

Space after a fall should start a fresh climb.
tr: Düştükten sonra Boşluk yeni bir tırmanış başlatmalı.

```js
state = 'over'
cameraY = -3000
$.tap(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(cameraY, 0)
assert.deepEqual(player, { x: 180, y: 460, w: 40, h: 40, vy: 0 })
assert.deepEqual(platforms[0], { x: 170, y: 500, w: 60, h: 12 })
assert.isAbove(platforms.length, 5)
```

Space during a climb should do nothing.
tr: Tırmanırken Boşluk bir şey yapmamalı.

```js
cameraY = -300
$.tap(' ')
assert.strictEqual(cameraY, -300)
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

let player
let platforms
let cameraY // the world y shown at the top of the screen: the camera
let highest // world y of the highest platform so far
let state // 'playing' or 'over'
const keys = {}

function reset() {
  player = { x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }
  platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
  cameraY = 0
  highest = START_Y
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
    platforms.push({ x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12 })
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
  fillPlatforms()
  platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

  if (player.y > cameraY + canvas.height) {
    state = 'over'
  }
}

function draw() {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint lines fixed to the world, so you can see the climb even between platforms.
  ctx.fillStyle = '#e2e8f0'
  for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)

  ctx.fillStyle = '#16a34a'
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)

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
