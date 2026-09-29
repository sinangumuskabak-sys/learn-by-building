---
title: Lines on the wall
title_tr: Duvardaki çizgiler
skills: [game.canvas]
---

# --goal--

With a plain background you cannot tell you are climbing. Faint lines every 40 world pixels, like lines on a wall, slide
down as the camera goes up.

# --goal-tr--

Düz bir arka planda tırmandığını **hissedemezsin**. Dünyaya sabit, her 40 pikselde bir silik çizgiler çekelim; bir
duvardaki çizgiler gibi. Kamera yükseldikçe çizgiler aşağı kayar ve hareket hissi doğar.

# --code--

```js
// Faint lines fixed to the world, so you can see the climb even between platforms.
ctx.fillStyle = '#e2e8f0'
for (let y = ((-cameraY % 40) + 40) % 40; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1)
```

# --meaning--

- The lines sit at world heights that are multiples of 40, so on screen the first one is at `-cameraY` modulo 40.
- `% 40` of a negative number is negative in JavaScript; adding 40 and taking `% 40` again makes it 0 to 39.

# --meaning-tr--

- Çizgiler dünyada 40'ın katı yüksekliklerde. Ekranda ilk çizginin yeri: `-cameraY`'nin 40'a bölümünden kalan.
- JavaScript'te eksi bir sayının `% 40`'ı eksi çıkar (ör. -10 % 40 = -10). `+ 40` ekleyip yeniden `% 40` almak onu
  0–39 arasına getirir (-10 → 30).
- `for (...; y < canvas.height; y += 40)` → oradan ekranın altına kadar her 40 pikselde 1 piksellik bir çizgi.

# --task--

In `draw`, under the background, write the comment and the two lines.

# --task-tr--

`draw` içinde arka planın altına bir boş satır bırakıp yorumu ve iki satırı yaz. **Çalıştır** ve tırman.

# --tests--

The lines should be 40 pixels apart and move with the camera.
tr: Çizgiler 40 piksel arayla olmalı ve kamerayla kaymalı.

```js
cameraY = 0
draw()
assert.lengthOf($.rects('#e2e8f0'), 15)
assert.strictEqual($.rects('#e2e8f0')[0].y, 0)
cameraY = -10
draw()
assert.strictEqual($.rects('#e2e8f0')[0].y, 10)
cameraY = 10
draw()
assert.strictEqual($.rects('#e2e8f0')[0].y, 30)
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
```
