---
title: Traps that break
title_tr: Kırılan tuzaklar
skills: [game.collision, game.state]
---

# --explanation--

The last kind of platform looks like a way up but is a **trap**: it breaks when you land on it and does not bounce you,
so you keep falling. Broken platforms drop away out of sight.

The important design question is: can a trap make the game impossible? It must not. That is why traps are **extra**
platforms, added halfway between two real ones, instead of replacing one. The chain of real platforms is still there
with gaps of at most 110 pixels, so the level can always be climbed; the trap only punishes a player who does not look
before landing.

Inside the landing loop a trap is handled with `continue`: mark it broken and keep looking. The player might be over a
real platform at the same height, and that one should still catch them.

With that, the game is complete: bounce physics, one-way platforms, a camera, fair endless generation, rising
difficulty, moving platforms and traps.

# --explanation-tr--

Son platform türü yukarı giden bir yol gibi görünür ama bir **tuzaktır**: üstüne konunca kırılır ve seni sektirmez;
düşmeye devam edersin. Kırılan platformlar düşüp gözden kaybolur.

Önemli tasarım sorusu şu: bir tuzak oyunu imkânsız hâle getirebilir mi? Getirmemeli. Tuzakların birinin yerine geçmek yerine
iki gerçek platformun tam ortasına eklenen **fazladan** platformlar olmasının nedeni budur. Gerçek platformların zinciri en
fazla 110 piksellik boşluklarla hâlâ oradadır; yani bölüm her zaman tırmanılabilir. Tuzak yalnızca konmadan önce bakmayan
oyuncuyu cezalandırır.

İniş döngüsünde bir tuzak `continue` ile işlenir: kırık olarak işaretle ve aramaya devam et. Oyuncu aynı yükseklikte gerçek
bir platformun üstünde olabilir ve o platform onu yine tutmalıdır.

Bununla oyun tamamlandı: sekme fiziği, tek yönlü platformlar, bir kamera, adil sonsuz üretim, artan zorluk, hareketli
platformlar ve tuzaklar.

# --task--

1. In `fillPlatforms()`, after adding a platform, with a chance of `0.15 + 0.25 * d` also add a `'breaking'` platform
   (`vx: 0`) at a random `x`, halfway down the gap (`highest + gap / 2`).
2. When landing: skip platforms that are `broken`. Landing on a `'breaking'` platform sets `p.broken = true` and
   `continue`s without a bounce.
3. Every frame, a broken platform falls 5 pixels.
4. Add `breaking: '#a16207'` to `COLORS`.

# --task-tr--

1. `fillPlatforms()` içinde bir platform ekledikten sonra `0.15 + 0.25 * d` olasılıkla rastgele bir `x`'te, boşluğun
   yarısında (`highest + gap / 2`) bir `'breaking'` platform (`vx: 0`) da ekle.
2. İnerken: `broken` olan platformları atla. Bir `'breaking'` platforma konmak `p.broken = true` yapar ve sekmeden
   `continue` eder.
3. Her karede kırık bir platform 5 piksel düşer.
4. `COLORS`'a `breaking: '#a16207'` ekle.

# --tests--

Landing on a trap should break it and not bounce.
tr: Bir tuzağa konmak onu kırmalı ve sektirmemeli.

```js
const trap = { x: 170, y: 500, w: 60, h: 12, kind: 'breaking', vx: 0 }
platforms = [trap]
player = { x: 180, y: 455, w: 40, h: 40, vy: 6 }
$.tick(1)
assert.isTrue(trap.broken)
assert.isAbove(player.vy, 0, 'still falling')
$.tick(4)
assert.strictEqual(trap.y, 520, 'a broken platform falls 5 pixels a frame')
```

A real platform at the same height should still catch the player.
tr: Aynı yükseklikte gerçek bir platform oyuncuyu yine tutmalı.

```js
const trap = { x: 150, y: 500, w: 60, h: 12, kind: 'breaking', vx: 0 }
const real = { x: 190, y: 500, w: 60, h: 12, kind: 'normal', vx: 0 }
platforms = [trap, real]
player = { x: 180, y: 455, w: 40, h: 40, vy: 6 }
$.tick(1)
assert.isTrue(trap.broken)
assert.strictEqual(player.vy, -11)
```

Traps should be extras: the real platforms alone must still be climbable.
tr: Tuzaklar fazladan olmalı: gerçek platformlar tek başına hâlâ tırmanılabilir olmalı.

```js
cameraY = -20000
fillPlatforms()
const traps = platforms.filter((p) => p.kind === 'breaking')
const real = platforms.filter((p) => p.kind !== 'breaking').map((p) => p.y).sort((a, b) => b - a)
assert.isAbove(traps.length, 30)
for (let i = 1; i < real.length; i++) assert.isAtMost(real[i - 1] - real[i], 110)
for (const t of traps) {
  const below = real.filter((y) => y > t.y)
  const above = real.filter((y) => y < t.y)
  assert.isTrue(below.length > 0 && above.length > 0)
  assert.closeTo(Math.min(...below) - t.y, t.y - Math.max(...above), 1e-6, 'halfway between two real platforms')
}
```

Traps should have their own color.
tr: Tuzakların kendi rengi olmalı.

```js
platforms.push({ x: 100, y: 300, w: 60, h: 12, kind: 'breaking', vx: 0 })
$.tick(1)
assert.isAtLeast($.rects('#a16207').length, 1)
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
