---
title: A camera that follows
title_tr: Takip eden kamera
skills: [game.state, game.canvas]
---

# --goal--

To climb forever, the world must be taller than the screen. Positions are now in the world, and `cameraY` is the world
height shown at the top of the screen. Everything is drawn shifted by the camera, and the camera moves up when the
player gets near the top.

# --goal-tr--

Sonsuza kadar tırmanmak için **dünya ekrandan uzun** olmalı. Artık konumlar **dünyada** ölçülüyor; `cameraY` (kamera)
ise ekranın en üstünde dünyanın hangi yüksekliğinin göründüğünü söylüyor. Her şeyi kamera kadar kaydırarak çiziyoruz;
zıplayan ekranın üst kısmına yaklaşınca kamera **yukarı** kayıyor.

Bir sinema kamerası gibi: oyuncu kameraya göre değil, **dünyada** hareket eder; kamera onu takip eder.

# --code--

```js
let cameraY = 0 // the world y shown at the top of the screen: the camera

  // The camera only ever moves up, keeping the player in the upper part of the screen.
  if (player.y < cameraY + 200) cameraY = player.y - 200

    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)

  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)
```

# --meaning--

- On screen, a world height `y` is drawn at `y - cameraY`.
- When the player is less than 200 pixels below the top of the screen, the camera moves so that it is exactly 200 below.
- The camera never moves down: falling shows the player dropping off the screen.

# --meaning-tr--

- `cameraY` → ekranın tepesinde görünen dünya yüksekliği. Başta 0: dünya ile ekran aynı.
- `p.y - cameraY` → dünyadaki bir yüksekliği **ekrandaki** yere çevirir. Kamera 100 yukarı kayınca (`cameraY = -100`),
  her şey ekranda 100 piksel **aşağı** çizilir.
- `if (player.y < cameraY + 200)` → zıplayan ekranın tepesine 200 pikselden yakın mı? Öyleyse kamerayı onu tam 200
  piksel aşağıda tutacak yere taşı.
- Kamera yalnız **yukarı** kayar; düşerken takip etmez, zıplayan ekrandan aşağı düşer (oyun sonu bu olacak).

# --task--

1. Under `platforms`, write `cameraY`.
2. In `update`, after the landing block, write the camera lines.
3. In `draw`, subtract `cameraY` in the platform and the three player `fillRect`s.

# --task-tr--

1. `platforms` listesinin altına `cameraY` satırını yaz.
2. `update` içinde iniş bloğunun altına bir boş satır bırakıp kamera satırlarını yaz.
3. `draw` içinde platformu ve zıplayanı çizen dört `fillRect`'te y değerinin sonuna `- cameraY` ekle.
4. **Çalıştır** ve en üst platforma kadar çık: ekran seninle kaymalı.

# --tests--

Near the top of the screen, the camera should move up with the player.
tr: Ekranın tepesine yaklaşınca kamera zıplayanla yukarı kaymalı.

```js
player.y = 150
player.vy = -5
update()
assert.closeTo(cameraY, player.y - 200, 1e-9)
```

Everything should be drawn shifted by the camera.
tr: Her şey kamera kadar kaydırılarak çizilmeli.

```js
cameraY = -100
player.y = 100
draw()
assert.strictEqual($.rects('#f59e0b')[0].y, 200)
assert.strictEqual($.rects('#16a34a')[0].y, 600)
```

The camera should never move down.
tr: Kamera asla aşağı kaymamalı.

```js
cameraY = -300
player.y = 400
player.vy = 5
update()
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
let cameraY = 0 // the world y shown at the top of the screen: the camera
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

  // The camera only ever moves up, keeping the player in the upper part of the screen.
  if (player.y < cameraY + 200) cameraY = player.y - 200

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
    ctx.fillRect(p.x, p.y - cameraY, p.w, p.h)
  }

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(player.x, player.y - cameraY, player.w, player.h)
  // Half off one side: draw the other half on the far side.
  if (player.x < 0) ctx.fillRect(player.x + canvas.width, player.y - cameraY, player.w, player.h)
  if (player.x + player.w > canvas.width) ctx.fillRect(player.x - canvas.width, player.y - cameraY, player.w, player.h)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
