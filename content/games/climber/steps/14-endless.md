---
title: Endless platforms
title_tr: Bitmeyen platformlar
skills: [prog.loops, game.state]
---

# --goal--

The six fixed platforms give way to endless random ones. `fillPlatforms` keeps adding platforms above the highest one
until the screen (plus a margin) is full; the gap grows with the difficulty but never beyond what a bounce can reach.
Platforms that fall below the screen are forgotten.

# --goal-tr--

Altı sabit platform yerine **bitmeyen**, rastgele platformlar geliyor. `fillPlatforms` en yüksek platformun üstüne,
ekran (ve biraz fazlası) dolana kadar platform ekliyor. Aralarındaki boşluk zorlukla büyüyor ama bir sekişin
ulaşabileceğinden asla fazla olmuyor. Ekranın altına düşen platformlar unutuluyor; bellek şişmesin.

# --code--

```js
// A bounce rises about JUMP * JUMP / (2 * GRAVITY) = 172 pixels, so a gap must stay well below that.
const MAX_GAP = 110

let platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
let highest = START_Y // world y of the highest platform so far

// Add platforms above the highest one until the screen (and a little more) is full.
function fillPlatforms() {
  while (highest > cameraY - 100) {
    const d = difficulty(highest)
    const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)
    highest -= gap
    platforms.push({ x: Math.random() * (canvas.width - 60), y: highest, w: 60, h: 12 })
  }
}

  fillPlatforms()
  platforms = platforms.filter((p) => p.y < cameraY + canvas.height + 20)

fillPlatforms()
```

# --meaning--

- The loop runs while the highest platform is still lower than 100 pixels above the top of the screen.
- The gap is at least 45; at the start at most 45 + 65 × 0.4 = 71, growing to 110 at full difficulty.
- `x` is random, keeping the whole platform on screen.
- After the camera moves, new platforms are added at the top and those below the screen dropped.

# --meaning-tr--

- `let platforms = [...]` → artık `let`: liste değişecek. Başta tek platform, `START_Y`'de.
- `let highest = START_Y` → şimdiye kadarki **en yüksek** platformun yüksekliği.
- `while (highest > cameraY - 100)` → en yüksek platform hâlâ ekranın tepesinin 100 piksel üstüne ulaşmadıysa **ekle**.
  `while` koşul doğru olduğu sürece döner.
- `const gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)` → en az 45; başta en fazla 45 + 65 × 0,4 = 71,
  zorluk arttıkça en fazla 110. (110, bir sekişin ~172 pikselinin rahatça altında.)
- `highest -= gap` → bir üst platformun yüksekliği.
- `x: Math.random() * (canvas.width - 60)` → platform tamamen ekranda kalacak şekilde rastgele yatay yer.
- `update`'te: kamera kayınca yukarıya yenilerini ekle, ekranın 20 piksel altından aşağı düşenleri `filter` ile at.
- En alttaki `fillPlatforms()` → oyun başlarken ekranı doldur.

# --task--

1. Under `START_Y`, write the comment and `MAX_GAP`.
2. Replace the list of six platforms with the one-platform `let platforms`, and write `highest` under `cameraY`.
3. Under `difficulty`, write the comment and `fillPlatforms`.
4. In `update`, under the camera line, write the two lines.
5. Call `fillPlatforms()` above `requestAnimationFrame(loop)` at the bottom.

# --task-tr--

1. `START_Y` satırının altına yorumu ve `MAX_GAP` satırını yaz.
2. Altı platformluk `const platforms = [...]` listesini tek platformlu `let platforms = [...]` satırıyla değiştir;
   `cameraY` satırının altına `highest` satırını yaz.
3. `difficulty` fonksiyonunun altına yorumu ve `fillPlatforms` fonksiyonunu yaz.
4. `update` içinde kamera satırının altına iki satırı yaz.
5. En alttaki `requestAnimationFrame(loop)` satırının üstüne `fillPlatforms()` yaz.
6. **Çalıştır**: sonsuza kadar tırmanabilmelisin.

# --tests--

The screen should be filled with platforms, gaps between 45 and 110.
tr: Ekran platformlarla dolmalı; boşluklar 45 ile 110 arasında.

```js
assert.isAtMost(highest, -100)
const ys = platforms.map((p) => p.y).sort((a, b) => b - a)
for (let i = 1; i < ys.length; i++) {
  assert.isAtLeast(ys[i - 1] - ys[i], 45)
  assert.isAtMost(ys[i - 1] - ys[i], 110)
}
assert.isTrue(platforms.every((p) => p.x >= 0 && p.x + p.w <= 400))
```

Climbing should add platforms above and drop those far below.
tr: Tırmanmak yukarıya platform eklemeli, çok aşağıdakileri atmalı.

```js
cameraY = -2000
player.y = -1850
player.vy = -5
update()
assert.isAtMost(highest, cameraY - 100)
assert.isTrue(platforms.every((p) => p.y < cameraY + 620))
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
const FLOOR = 600 // the bottom of the canvas

let player = { x: 180, y: 460, w: 40, h: 40, vy: 0 }
let platforms = [{ x: 170, y: START_Y, w: 60, h: 12 }]
let cameraY = 0 // the world y shown at the top of the screen: the camera
let highest = START_Y // world y of the highest platform so far
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

fillPlatforms()
requestAnimationFrame(loop)
```
