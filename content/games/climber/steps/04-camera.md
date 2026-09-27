---
title: A camera and endless platforms
title_tr: Bir kamera ve sonsuz platformlar
skills: [game.loop, game.state]
---

# --explanation--

To climb forever, the game needs two ideas.

**A camera.** The player and the platforms now live in a tall **world**, and `cameraY` is the world y shown at the top of
the screen. Everything is drawn at `y - cameraY`. Whenever the player rises above 200 pixels from the top of the screen, the
camera follows: `cameraY = player.y - 200`. It never moves down, so falling is dangerous: once the player drops below the
bottom of the screen, the game is over.

**Endless platforms.** Instead of a fixed list, `fillPlatforms()` keeps adding platforms above the highest one until the
area just above the screen is filled, and platforms far below the screen are thrown away. Only about fifteen exist at a
time, however high you climb.

Random is only fun when it is **fair**. A bounce rises about 167 pixels, so the gap to the next platform is never more
than `MAX_GAP = 110`: every generated level can be climbed. The gap is random but its range grows with a
`difficulty()` between 0 and 1: at the start the gaps are between 45 and 71 pixels, 10000 pixels up they can reach 110.
That is **procedural generation**: rules that guarantee the result is possible, and randomness inside those rules.

The faint lines in the background are fixed to the world, so you can see the climb even when no platform is near.

# --explanation-tr--

Sonsuza kadar tırmanmak için oyunun iki fikre ihtiyacı var.

**Bir kamera.** Oyuncu ve platformlar artık uzun bir **dünyada** yaşıyor ve `cameraY`, ekranın tepesinde gösterilen dünya
y'sidir. Her şey `y - cameraY`'ta çizilir. Oyuncu ekranın tepesinden 200 pikselden yukarı çıktığında kamera onu izler:
`cameraY = player.y - 200`. Kamera asla aşağı inmez; bu yüzden düşmek tehlikelidir: oyuncu ekranın altından düştüğü an oyun
biter.

**Sonsuz platformlar.** Sabit bir liste yerine `fillPlatforms()`, ekranın hemen üstündeki alan dolana kadar en yüksek
platformun üstüne platform eklemeye devam eder; ekranın çok altında kalan platformlar atılır. Ne kadar yükseğe tırmanırsan
tırman, aynı anda yalnızca on beş kadar platform vardır.

Rastgelelik ancak **adil** olduğunda eğlencelidir. Bir sekiş yaklaşık 167 piksel yükselir; bu yüzden bir sonraki platforma
boşluk hiçbir zaman `MAX_GAP = 110`'dan fazla olmaz: üretilen her bölüm tırmanılabilir. Boşluk rastgeledir ama aralığı 0
ile 1 arasındaki bir `difficulty()` ile büyür: başta boşluklar 45 ile 71 piksel arasındadır, 10000 piksel yukarıda 110'a
ulaşabilir. Bu **prosedürel üretimdir**: sonucun mümkün olduğunu garanti eden kurallar ve o kuralların içinde rastgelelik.

Arka plandaki silik çizgiler dünyaya sabittir; böylece yakında platform olmasa da tırmanışı görürsün.

# --task--

1. Remove `FLOOR` and the fixed platforms. Add `START_Y = 500`, `MAX_GAP = 110`, and `let player`, `platforms`, `cameraY`,
   `highest` and `state`.
2. Write `reset()`: the player at `{ x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }`, one platform
   `{ x: 170, y: START_Y, w: 60, h: 12 }`, `cameraY = 0`, `highest = START_Y`, state `'playing'`, then `fillPlatforms()`.
   Call it before the loop, and on Space (or a tap) when the game is over.
3. Write `difficulty(y)`: `Math.min(1, (START_Y - y) / 10000)`. Write `fillPlatforms()`: while `highest > cameraY - 100`,
   pick `gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)` with `d = difficulty(highest)`, move `highest` up
   by it and add a 60 by 12 platform there at a random `x` from `0` to `canvas.width - 60`.
4. At the end of `update()` (which does nothing unless playing): move the camera up when `player.y < cameraY + 200`, call
   `fillPlatforms()`, keep only platforms with `p.y < cameraY + canvas.height + 20`, and end the game when
   `player.y > cameraY + canvas.height`.
5. Draw everything at `y - cameraY`, the `'#e2e8f0'` lines 1 pixel high every 40 world pixels (the first one at
   `((-cameraY % 40) + 40) % 40`), and the Game Over screen as before.

# --task-tr--

1. `FLOOR`'u ve sabit platformları kaldır. `START_Y = 500`, `MAX_GAP = 110` ve `let player`, `platforms`, `cameraY`, `highest`
   ile `state` ekle.
2. `reset()` yaz: oyuncu `{ x: 180, y: START_Y - 40, w: 40, h: 40, vy: 0 }`'da, bir platform
   `{ x: 170, y: START_Y, w: 60, h: 12 }`, `cameraY = 0`, `highest = START_Y`, `'playing'` durumu, sonra `fillPlatforms()`.
   Döngüden önce ve oyun bittiğinde Boşluk'ta (ya da dokunuşta) çağır.
3. `difficulty(y)` yaz: `Math.min(1, (START_Y - y) / 10000)`. `fillPlatforms()` yaz: `highest > cameraY - 100` olduğu sürece
   `d = difficulty(highest)` ile `gap = 45 + Math.random() * (MAX_GAP - 45) * (0.4 + 0.6 * d)` seç, `highest`'ı o kadar
   yukarı taşı ve oraya `0` ile `canvas.width - 60` arasında rastgele bir `x`'te 60'a 12 bir platform ekle.
4. `update()`'in sonunda (oynanmıyorsa hiçbir şey yapmaz): `player.y < cameraY + 200` iken kamerayı yukarı taşı,
   `fillPlatforms()` çağır, yalnızca `p.y < cameraY + canvas.height + 20` olan platformları tut ve
   `player.y > cameraY + canvas.height` olunca oyunu bitir.
5. Her şeyi `y - cameraY`'ta çiz; her 40 dünya pikselinde 1 piksel yüksekliğinde `'#e2e8f0'` çizgiler (ilki
   `((-cameraY % 40) + 40) % 40`'ta) ve eskisi gibi Game Over ekranı.

# --tests--

The camera should follow the player up.
tr: Kamera oyuncuyu yukarı izlemeli.

```js
player = { x: 180, y: 150, w: 40, h: 40, vy: -5 }
$.tick(1)
assert.closeTo(cameraY, -54.65, 1e-9)
assert.isAtMost(highest, cameraY - 100, 'new platforms fill the space above the screen')
assert.isTrue(platforms.every((p) => p.y < cameraY + 620), 'platforms far below are removed')
$.tick(1)
const [p] = $.rects('#f59e0b')
assert.closeTo(p.y, player.y - cameraY, 1e-9)
assert.closeTo(p.y, 200, 1e-9)
```

The camera should never move down.
tr: Kamera asla aşağı inmemeli.

```js
cameraY = -300
player = { x: 0, y: -100, w: 40, h: 40, vy: 8 }
$.tick(5)
assert.strictEqual(cameraY, -300)
```

Gaps should be random, but never too big to climb, and grow as you climb.
tr: Boşluklar rastgele olmalı ama tırmanılamayacak kadar büyük olmamalı ve tırmandıkça büyümeli.

```js
assert.strictEqual(difficulty(500), 0)
assert.strictEqual(difficulty(-4500), 0.5)
assert.strictEqual(difficulty(-50000), 1)
cameraY = -20000
fillPlatforms()
const ys = platforms.map((p) => p.y).sort((a, b) => b - a)
const gaps = ys.slice(1).map((y, i) => ys[i] - y)
assert.isAbove(gaps.length, 200)
for (const g of gaps) assert.isTrue(g >= 45 && g <= 110, 'gap of ' + g)
const low = gaps.slice(0, 20)
const high = gaps.slice(-60)
assert.isTrue(low.every((g) => g <= 45 + 65 * 0.52), 'easy gaps at the start')
assert.isTrue(high.some((g) => g > 100), 'big gaps high up')
assert.isAbove(new Set(platforms.map((p) => p.x)).size, 100, 'platforms should be at random x positions')
```

Falling below the screen should end the game, and Space should start again.
tr: Ekranın altına düşmek oyunu bitirmeli, Boşluk yeniden başlatmalı.

```js
player.y = 610
$.tick(1)
assert.strictEqual(state, 'over')
assert.include($.texts(), 'Game Over')
$.press(' ')
assert.strictEqual(state, 'playing')
assert.strictEqual(cameraY, 0)
assert.deepEqual(player, { x: 180, y: 460, w: 40, h: 40, vy: 0 })
```

The background lines should move with the world.
tr: Arka plan çizgileri dünyayla birlikte hareket etmeli.

```js
cameraY = -10
draw()
const lines = $.rects('#e2e8f0')
assert.lengthOf(lines, 15)
assert.strictEqual(lines[0].y, 10)
cameraY = -1000
draw()
assert.strictEqual($.rects('#e2e8f0')[0].y, 0)
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
