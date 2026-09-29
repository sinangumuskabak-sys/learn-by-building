---
title: Miss and fall
title_tr: Iskala ve düş
skills: [game.state]
---

# --goal--

The floor goes away. Miss a platform and you fall; once you drop below the bottom of the screen, the game is over.

# --goal-tr--

Taban **kalkıyor**. Bir platformu ıskalarsan düşersin; ekranın altından tamamen çıkınca oyun **biter**. Oyunun gerçek
heyecanı burada başlıyor.

# --code--

```js
let state = 'playing' // 'playing' or 'over'

  if (state !== 'playing') return

  if (player.y > cameraY + canvas.height) {
    state = 'over'
  }

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
```

# --meaning--

- `FLOOR` and the floor bounce are removed.
- When the player's top is below the bottom of the screen (`cameraY + canvas.height`), it is out of sight: game over.
- `update` stops while the game is over, and a see-through light layer with the message covers the picture.

# --meaning-tr--

- `FLOOR` sabiti ve taban bloğu **silinir**: artık seni tutan bir yer yok.
- `player.y > cameraY + canvas.height` → zıplayanın **üstü** ekranın altından (dünyada `cameraY + 600`) aşağıda mı?
  Tamamen gözden çıktı: oyun bitti.
- `if (state !== 'playing') return` → oyun bitince `update` hiçbir şey yapmaz, her şey donar.
- Bitiş ekranı: %85 opak açık bir perde, üstünde mesaj.

# --task--

1. Delete the `FLOOR` line, and in `update` the floor block with its comment.
2. Under `highest`, write `state`; make the state check the first line of `update`.
3. At the end of `update`, write the fall check; at the end of `draw`, the game over screen.

# --task-tr--

1. `FLOOR` satırını sil; `update` içindeki taban bloğunu yorumuyla birlikte sil.
2. `highest` satırının altına `state` satırını yaz; `update`'in ilk satırı `if (state !== 'playing') return` olsun
   (altında bir boş satır).
3. `update`'in sonuna düşme kontrolünü, `draw`'ın sonuna bitiş ekranını yaz.
4. **Çalıştır** ve bir platformu ıskala.

# --tests--

Falling below the screen should end the game.
tr: Ekranın altına düşmek oyunu bitirmeli.

```js
platforms = []
player.y = 598
player.vy = 5
update()
assert.strictEqual(state, 'over')
$.tick()
assert.include($.texts(), 'Game Over')
```

After game over nothing should move.
tr: Oyun bitince hiçbir şey hareket etmemeli.

```js
state = 'over'
const y = player.y
update()
assert.strictEqual(player.y, y)
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

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
let platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
let cameraY = 0 // the world y shown at the top of the screen: the camera
let highest = START_Y // world y of the highest platform so far
let state = 'playing' // 'playing' or 'over'
const keys = {}

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

fillPlatforms()
requestAnimationFrame(loop)
```
