---
title: "Game feel: particles"
title_tr: "Oyun hissi: parçacıklar"
skills: [prog.arrays, game.physics]
---

# --explanation--

The game works. Now make it feel good. When a brick breaks, it just vanishes, and the moment has no impact. Game
developers call the fix **juice**: small effects that do not change the rules but make every action feel satisfying.

The classic effect is a burst of **particles**: a dozen tiny squares that fly out from the brick, fall with a little
gravity and fade away. Each particle is a tiny object with its own position, velocity and remaining **life**:

```js
{ x, y, vx, vy, life: 30, color }
```

Every frame: move it, add gravity, count its life down, and remove the dead ones with `filter`. This is the
spawn → update → despawn pattern, here with many short-lived objects. Explosions,
sparks, rain, dust and confetti are all built exactly like this.

Fading uses `ctx.globalAlpha`, the opacity for everything drawn after it: `1` is solid, `0` is invisible. Setting it
to `life / 30` fades a particle out over its last frames. Always set it back to `1` afterwards, or everything drawn
later turns see-through too.

# --explanation-tr--

**Bu adımda:** tuğla kırılınca küçük bir patlama efekti ekleyeceğiz. Kırılan tuğlanın ortasından onun renginde bir
avuç minik kare saçılacak, hafifçe aşağı düşecek ve yavaşça solup kaybolacak.

**Oyun hissi (juice).** Oyun çalışıyor; şimdi iyi hissettirsin. Tuğla kırıldığında sadece yok oluyor ve o anın hiç
etkisi yok. Oyun geliştiriciler bunun çözümüne **juice** (meyve suyu) der: kuralları değiştirmeyen ama her hareketi
tatmin edici yapan küçük efektler.

**Parçacıklar (particles).** En bilinen efekt: bir düzine minik kare tuğladan fırlar, biraz yerçekimiyle düşer ve
solar. Her parçacık kendi konumu, hızı ve kalan **ömrü** olan küçük bir nesnedir:

```js
{ x, y, vx, vy, life: 30, color }
```

`life: 30` → parçacık 30 kare (yarım saniye kadar) yaşar.

Her karede her parçacık için: hareket ettir, yerçekimi ekle (`vy`'yi biraz artır), ömrünü bir azalt; sonra ömrü
bitenleri `filter` ile listeden at. `filter`, bir listenin sadece istediğin elemanlarını tutan yeni bir liste verir:

```js
particles = particles.filter((p) => p.life > 0)   // ömrü 0'dan büyük olanları tut
```

Bu "doğ → güncellen → yok ol" deseni oyunlarda her yerdedir; patlamalar, kıvılcımlar, yağmur, toz ve konfeti hep
tam olarak böyle yapılır. Ömrü bitenleri silmeyi unutursan liste sonsuza kadar büyür ve oyun gittikçe yavaşlar.

**Rastgele yönler.** `Math.random()` her çağrıldığında 0 ile 1 arasında rastgele bir kesirli sayı verir.
`Math.random() * 6 - 3` önce 0–6 arasına büyütür, sonra 3 çıkarır: sonuç **-3 ile 3** arası. Böylece her parçacık
başka bir yöne uçar.

**Uzun nesneyi satırlara bölmek.** Çok alanlı bir nesneyi okunur olsun diye her alanı ayrı satıra yazabiliriz; her
alanın sonuna virgül konur:

```js
particles.push({
  x: brick.x + BRICK_W / 2,
  y: brick.y + BRICK_H / 2,
  ...
})
```

`brick.x + BRICK_W / 2` tuğlanın yatay ortası, `brick.y + BRICK_H / 2` dikey ortasıdır.

**Solma: `globalAlpha`.** `ctx.globalAlpha` bundan sonra çizilen her şeyin **opaklığıdır**: `1` tam görünür, `0`
görünmez, `0.5` yarı saydam. Onu `p.life / 30` yaparsak parçacık ömrü azaldıkça solar (30/30 = 1'den 0'a doğru).
Sonrasında **mutlaka** `1`'e geri döndür; yoksa ondan sonra çizilen raket, top ve yazılar da saydamlaşır.

# --task--

1. Add `let particles`, and set `particles = []` in `newGame()`.
2. Write `function burst(brick)` that adds 12 particles at the brick's center, each with
   `vx = Math.random() * 6 - 3`, `vy = Math.random() * 6 - 3`, `life: 30` and the brick's color
   (`COLORS[brick.row]`). Call it when a brick breaks.
3. At the start of `update()` (so particles keep moving even between serves), for every particle: add `vx`/`vy` to
   its position, add `0.15` to `vy`, and subtract 1 from `life`. Then keep only particles with `life > 0`.
4. In `draw()`, after the bricks, draw each particle as a 4×4 square centered on it
   (`fillRect(p.x - 2, p.y - 2, 4, 4)`) in its color with `globalAlpha = p.life / 30`. Reset `globalAlpha` to `1`.

# --task-tr--

1. `let bricks` satırının altına:

   ```js
   let particles
   ```

2. `newGame()` fonksiyonunda, `buildBricks()` satırının altına parçacık listesini boşaltan satırı ekle:

   ```js
   function newGame() {
     buildBricks()
     particles = []   // ← yeni
     lives = 3
     score = 0
     resetBall()
   }
   ```

3. `buildBricks()` fonksiyonunun kapanış `}`'inden sonra bir boş satır bırak ve patlama fonksiyonunu yaz:

   ```js
   function burst(brick) {
     for (let i = 0; i < 12; i++) {
       particles.push({
         x: brick.x + BRICK_W / 2,
         y: brick.y + BRICK_H / 2,
         vx: Math.random() * 6 - 3,
         vy: Math.random() * 6 - 3,
         life: 30,
         color: COLORS[brick.row],
       })
     }
   }
   ```

   Döngü 12 kez döner (`i` 0'dan 11'e) ve her turda tuğlanın ortasına, tuğlanın renginde, rastgele yönlü bir
   parçacık ekler.

4. `update()` fonksiyonunun **en başına**, `if (keys.ArrowLeft)` satırından önce parçacıkları hareket ettiren
   kodu ekle:

   ```js
   function update() {
     for (const p of particles) {                         // ← yeni
       p.x += p.vx                                        // ← yeni
       p.y += p.vy                                        // ← yeni
       p.vy += 0.15                                       // ← yeni
       p.life -= 1                                        // ← yeni
     }                                                    // ← yeni
     particles = particles.filter((p) => p.life > 0)      // ← yeni

     if (keys.ArrowLeft) paddle.x -= 7
     ...
   ```

   En başa koyuyoruz ki servis beklerken bile parçacıklar hareket etsin (sonraki `return`'ler onları durdurmasın).

5. Yine `update()` içinde, tuğla kıran `if (brick) { ... }` bloğunda `score += 10` satırının altına:

   ```js
       burst(brick)
   ```

6. `draw()` fonksiyonunda, tuğlaları çizen `for (const brick of bricks) { ... }` döngüsünün kapanış `}`'inden
   sonra (raketten **önce**) parçacıkları çiz:

   ```js
     for (const p of particles) {
       ctx.globalAlpha = p.life / 30
       ctx.fillStyle = p.color
       ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
     }
     ctx.globalAlpha = 1
   ```

   `p.x - 2`, `p.y - 2`: 4×4'lük kareyi parçacığın tam ortasına oturtur.

7. **Çalıştır**'a bas (ya da `Ctrl + Enter`). Oynamak için önce oyuna tıkla ve bir tuğla kır: tuğlanın renginde
   minik kareler saçılıp solmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kırmızı kalırsa
   `ctx.globalAlpha = 1` satırının döngünün **dışında**, `}`'den sonra olduğundan emin ol.

# --tests--

Breaking a brick should release 12 particles of its color from its center.
tr: Bir tuğla kırmak, merkezinden onun renginde 12 parçacık saçmalı.

```js
assert.deepEqual(particles, [])
$.tap(' ')
bricks = [{ x: 100, y: 100, row: 2, alive: true }, { x: 300, y: 100, row: 0, alive: true }]
ball = { x: 127, y: 129, vx: 0, vy: -4 }
update()
assert.lengthOf(particles, 12)
for (const p of particles) {
  assert.include(p, { x: 127, y: 109, life: 30, color: '#eab308' })
  assert.isAtLeast(p.vx, -3)
  assert.isAtMost(p.vx, 3)
}
```

`burst()` should give particles different directions.
tr: `burst()` parçacıklara farklı yönler vermeli.

```js
particles = []
burst({ x: 0, y: 0, row: 0, alive: false })
assert.isAbove(new Set(particles.map((p) => p.vx)).size, 6)
```

Particles should move, fall and fade out after 30 frames.
tr: Parçacıklar hareket etmeli, düşmeli ve 30 kare sonra kaybolmalı.

```js
particles = [{ x: 100, y: 100, vx: 2, vy: -1, life: 30, color: 'red' }]
update()
assert.include(particles[0], { x: 102, y: 99, life: 29 })
assert.closeTo(particles[0].vy, -0.85, 0.001)
for (let i = 0; i < 29; i++) update()
assert.lengthOf(particles, 0)
```

Particles should be drawn faded, and the opacity should be reset afterwards.
tr: Parçacıklar solarak çizilmeli ve opaklık sonrasında sıfırlanmalı.

```js
particles = [{ x: 100, y: 100, vx: 0, vy: 0, life: 15, color: '#ef4444' }]
draw()
const square = $.screen().find((c) => c.op === 'fillRect' && c.args[2] === 4 && c.args[3] === 4)
assert.deepEqual(square.args, [98, 98, 4, 4])
assert.strictEqual(square.alpha, 0.5)
const paddleCall = $.screen().find((c) => c.op === 'fillRect' && c.args[2] === 80)
assert.strictEqual(paddleCall.alpha, 1, 'things drawn after the particles are solid again')
```

# --solution--

```js
// Breakout, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const PADDLE_W = 80
const PADDLE_H = 12
const PADDLE_Y = 370
const BALL_R = 7
const COLS = 8
const ROWS = 5
const BRICK_W = 54
const BRICK_H = 18
const GAP = 4
const TOP = 50
const LEFT = 10 // (480 - 8 bricks - 7 gaps) / 2, so the wall is centered
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

let paddle = { x: 200 }
let ball
let bricks
let particles
let lives
let score
let state // 'serve', 'playing', 'won' or 'lost'
const keys = {}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function newGame() {
  buildBricks()
  particles = []
  lives = 3
  score = 0
  resetBall()
}

function resetBall() {
  state = 'serve'
  ball = { x: paddle.x + PADDLE_W / 2, y: PADDLE_Y - BALL_R, vx: 0, vy: 0 }
}

function launch() {
  if (state === 'won' || state === 'lost') {
    newGame()
    return
  }
  if (state !== 'serve') return
  state = 'playing'
  ball.vx = 3
  ball.vy = -4
}

function buildBricks() {
  bricks = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BRICK_W + GAP), y: TOP + row * (BRICK_H + GAP), row, alive: true })
    }
  }
}

function burst(brick) {
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: brick.x + BRICK_W / 2,
      y: brick.y + BRICK_H / 2,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * 6 - 3,
      life: 30,
      color: COLORS[brick.row],
    })
  }
}

canvas.addEventListener('pointermove', (event) => {
  // Convert page coordinates to canvas pixels (the canvas may be displayed scaled).
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  paddle.x = clamp(x - PADDLE_W / 2, 0, canvas.width - PADDLE_W)
})
canvas.addEventListener('pointerdown', launch)

document.addEventListener('keydown', (event) => {
  keys[event.key] = true
  if (event.key === ' ') launch()
})
document.addEventListener('keyup', (event) => {
  keys[event.key] = false
})

function hitsBrick(brick) {
  // The point of the brick closest to the ball's center; they touch if it is within one radius.
  const nearestX = clamp(ball.x, brick.x, brick.x + BRICK_W)
  const nearestY = clamp(ball.y, brick.y, brick.y + BRICK_H)
  const dx = ball.x - nearestX
  const dy = ball.y - nearestY
  return dx * dx + dy * dy <= BALL_R * BALL_R
}

function update() {
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15
    p.life -= 1
  }
  particles = particles.filter((p) => p.life > 0)

  if (keys.ArrowLeft) paddle.x -= 7
  if (keys.ArrowRight) paddle.x += 7
  paddle.x = clamp(paddle.x, 0, canvas.width - PADDLE_W)

  if (state === 'serve') {
    ball.x = paddle.x + PADDLE_W / 2
    return
  }
  if (state !== 'playing') return

  ball.x += ball.vx
  ball.y += ball.vy

  if (ball.x - BALL_R < 0 || ball.x + BALL_R > canvas.width) {
    ball.vx = -ball.vx
    ball.x = clamp(ball.x, BALL_R, canvas.width - BALL_R)
  }
  if (ball.y - BALL_R < 0) {
    ball.vy = Math.abs(ball.vy)
    ball.y = BALL_R
  }

  const onPaddle =
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y + BALL_R <= PADDLE_Y + PADDLE_H + ball.vy &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + PADDLE_W
  if (onPaddle) {
    // -1 at the paddle's left end, 0 in the middle, 1 at the right end
    const offset = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2)
    ball.vx = offset * 5
    ball.vy = -Math.abs(ball.vy)
    ball.y = PADDLE_Y - BALL_R
  }

  // Break at most one brick per frame, or two flips could cancel out.
  const brick = bricks.find((b) => b.alive && hitsBrick(b))
  if (brick) {
    brick.alive = false
    score += 10
    burst(brick)
    const throughTopOrBottom = ball.x >= brick.x && ball.x <= brick.x + BRICK_W
    if (throughTopOrBottom) ball.vy = -ball.vy
    else ball.vx = -ball.vx
    if (bricks.every((b) => !b.alive)) state = 'won'
  }

  if (ball.y - BALL_R > canvas.height) {
    lives -= 1
    if (lives === 0) state = 'lost'
    else resetBall()
  }
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const brick of bricks) {
    if (!brick.alive) continue
    ctx.fillStyle = COLORS[brick.row]
    ctx.fillRect(brick.x, brick.y, BRICK_W, BRICK_H)
  }

  for (const p of particles) {
    ctx.globalAlpha = p.life / 30
    ctx.fillStyle = p.color
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H)

  if (state === 'serve' || state === 'playing') {
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'white'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Lives: ' + lives, 10, 26)
  ctx.textAlign = 'right'
  ctx.fillText('Score: ' + score, canvas.width - 10, 26)

  ctx.textAlign = 'center'
  if (state === 'serve') ctx.fillText('Click or press Space to launch', canvas.width / 2, 260)
  if (state === 'won' || state === 'lost') {
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(state === 'won' ? 'You win!' : 'Game Over', canvas.width / 2, 250)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 280)
  }
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newGame()
requestAnimationFrame(loop)
```
