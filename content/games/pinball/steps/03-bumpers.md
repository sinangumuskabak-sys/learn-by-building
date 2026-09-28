---
title: Bumpers
title_tr: Tamponlar
skills: [game.collision, game.state]
---

# --explanation--

**Bumpers** are the round targets that kick the ball away and score. They are circles, and a ball touches a circle when the
distance between the centres is less than the two radii added together.

A plain wall only gives back part of the speed it receives. A bumper is the opposite: it **adds** energy. We cancel the ball's
speed towards the bumper (`-vn`) and then add a fixed kick of 6 outwards, so even a slow ball flies off fast. That is what makes
pinball lively.

Each hit scores 100 and lights the bumper for 10 frames. While it is lit, further hits do not score: a ball wedged against a bumper
would otherwise touch it every frame and rack up thousands of points.

# --explanation-tr--

**Bu adımda:** masaya topu hızla geri iten üç kırmızı yuvarlak **tampon** (bumper) ve bir skor ekleyeceğiz. Top bir
tampona çarpınca tampon kısa bir an sarı yanacak, sol üstteki `Score` 100 artacak.

**Top daireye ne zaman değer?** İki dairenin merkezleri arasındaki uzaklık, iki yarıçapın toplamından küçükse
(`d < b.r + R`). Merkezden topa giden yön yine **normal**dir (`nx, ny`); topu bu yönde tam değecek kadar dışarı
iteriz.

**Tampon enerji ekler.** Duvar, aldığı hızın bir kısmını geri verir. Tampon ise tersine hız **ekler**: topun tampona
doğru olan hızını sıfırlarız (`-vn`) ve üstüne dışarı doğru sabit 6 birimlik bir tekme ekleriz. Yavaş gelen top bile
hızla uçar; pinball'u canlı yapan budur.

**Çift puanı önlemek.** Her vuruş 100 puan verir ve tamponu 10 kare boyunca yakar (`flash[i] = 10`). Yanarken
gelen vuruşlar puan vermez; yoksa tampona sıkışan bir top her karede değip binlerce puan toplardı.

**Yeni parçalar:**

- **Nesne listesi:** `BUMPERS` her biri `{ x, y, r }` (merkez ve yarıçap) olan üç nesneden oluşan bir dizidir.
  `b.r` "`b` tamponunun yarıçapı" demektir.
- **`dizi.map(...)`**: her eleman için yeni bir değer üretip yeni bir dizi yapar. `BUMPERS.map(() => 0)` her tampon
  için bir `0` koyar: `[0, 0, 0]`. `flash.map((n) => Math.max(0, n - 1))` her sayıyı 1 azaltır ama 0'ın altına
  indirmez.
- **`dizi.forEach(fonksiyon)`**: her eleman için fonksiyonu çağırır ve ona elemanı (`b`) ve sırasını (`i`, 0'dan
  başlar) verir. `BUMPERS.forEach(hitBumper)` yani `hitBumper(BUMPERS[0], 0)`, `hitBumper(BUMPERS[1], 1)`, ...
- **`koşul ? a : b`**: "koşul doğruysa `a`, değilse `b`". `flash[i] > 0 ? '#fde047' : '#e11d48'` yanıyorsa sarı,
  değilse kırmızı seçer.
- **Yazı çizmek:** `ctx.font` yazı tipini, `ctx.textAlign` hizalamayı ayarlar; `ctx.fillText(yazı, x, y)` yazar.
  `'Score ' + score` bir yazıyla bir sayıyı yan yana ekler: `score` 0 ise `'Score 0'` olur.
- `score += 100` skoru 100 artırır.

# --task--

1. Add `BUMPERS` (three circles of radius 22, at `(100, 160)`, `(200, 120)` and `(280, 280)`, as `{ x, y, r }`), `score` and `flash` (`0` and three zeros in `reset()`).
2. Write `hitBumper(b, i)`: if the ball overlaps the bumper, push it out along the line from the centre, add `(-vn + 6)` along the
   normal to its velocity, and if `flash[i]` is 0 add 100 to `score`; then set `flash[i] = 10`. `step()` calls it for every bumper.
3. `update()` counts every `flash` down to 0.
4. Draw the bumpers, `'#e11d48'`, or `'#fde047'` while lit, and `Score 0` at `(30, 50)` (white, `'bold 16px sans-serif'`).

# --task-tr--

1. `WALLS` listesinin kapanış `]` satırının hemen altına tamponları ekle:

   ```js
   const BUMPERS = [
     { x: 100, y: 160, r: 22 },
     { x: 200, y: 120, r: 22 },
     { x: 280, y: 280, r: 22 },
   ]
   ```

2. `let state ...` satırının altına iki değişken ekle:

   ```js
   let score
   let flash // frames each bumper stays lit
   ```

3. `reset()` fonksiyonunu şöyle değiştir:

   ```js
   function reset() {
     score = 0                      // ← yeni
     flash = BUMPERS.map(() => 0)   // ← yeni
     newBall()
   }
   ```

4. `hitSegment` fonksiyonunun kapanış `}`'inin altına tampon çarpışmasını yaz:

   ```js
   function hitBumper(b, i) {
     const dx = ball.x - b.x
     const dy = ball.y - b.y
     const d = Math.hypot(dx, dy)
     if (d >= b.r + R) return
     const nx = dx / d
     const ny = dy / d
     ball.x = b.x + nx * (b.r + R)
     ball.y = b.y + ny * (b.r + R)
     // A bumper kicks the ball away, faster than it came.
     const vn = ball.vx * nx + ball.vy * ny
     ball.vx += (-vn + 6) * nx
     ball.vy += (-vn + 6) * ny
     if (flash[i] === 0) score += 100
     flash[i] = 10
   }
   ```

5. `step()` fonksiyonunun sonuna, duvar satırının altına bir satır ekle:

   ```js
     for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
     BUMPERS.forEach(hitBumper) // ← yeni
   }
   ```

6. `update()` fonksiyonunun **en başına**, `if (state === 'ready') return` satırından önce ekle:

   ```js
   function update() {
     flash = flash.map((n) => Math.max(0, n - 1)) // ← yeni
     if (state === 'ready') return
   ```

   Böylece tampon ışıkları top beklerken de söner.

7. `draw()` fonksiyonunda duvarları çizen `for` döngüsünün kapanış `}`'inin hemen altına tamponları çiz:

   ```js
     BUMPERS.forEach((b, i) => {
       ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
       ctx.beginPath()
       ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
       ctx.fill()
     })
   ```

8. `draw()`'un en sonunda, topu çizen `ctx.fill()` satırının altına (fonksiyonun kapanış `}`'inden önce) skoru yaz:

   ```js

     ctx.fillStyle = 'white'
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Score ' + score, 30, 50)
   ```

9. **Çalıştır**'a bas. Üç kırmızı tampon ve sol üstte `Score 0` görünmeli. Oyuna tıklayıp Boşluk'a bas: top bir
   tampona çarpınca tampon sarı yanmalı, skor artmalı. Alttaki kontrollerin hepsi yeşil olmalı.

# --tests--

A bumper should push the ball out, kick it away harder than it came and score once.
tr: Bir tampon topu dışarı itmeli, geldiğinden daha sert tekmelemeli ve bir kez puan vermeli.

```js
const b = BUMPERS[0]
ball = { x: b.x - b.r - R + 2, y: b.y, vx: 3, vy: 0 }
hitBumper(b, 0)
assert.isAtMost(ball.x, b.x - b.r - R + 1e-9, 'pushed out')
assert.isBelow(ball.vx, -5.9, 'kicked away harder than it came')
assert.strictEqual(score, 100)
assert.strictEqual(flash[0], 10)
ball.x = b.x - b.r - R + 2
ball.vx = 3
hitBumper(b, 0)
assert.strictEqual(score, 100, 'no double points while it is still lit')
```

A hit bumper should light up for a moment.
tr: Çarpılan bir tampon bir an yanmalı.

```js
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#e11d48'), 3)
flash[1] = 5
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#fde047'), 1, 'a lit bumper')
$.tick(10)
assert.lengthOf($.arcs().filter((a) => a.color === '#fde047'), 0, 'and it goes out')
```

The score should be drawn.
tr: Puan çizilmeli.

```js
$.tick(1)
assert.include($.texts(), 'Score 0')
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
const SUB = 4 // physics steps per frame
const MAX_SPEED = 18
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]
const BUMPERS = [
  { x: 100, y: 160, r: 22 },
  { x: 200, y: 120, r: 22 },
  { x: 280, y: 280, r: 22 },
]

let ball // { x, y, vx, vy }
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  score = 0
  flash = BUMPERS.map(() => 0)
  newBall()
}

// Push the ball out of a segment and bounce it.
function hitSegment(x1, y1, x2, y2, bounce) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((ball.x - x1) * dx + (ball.y - y1) * dy) / (dx * dx + dy * dy)))
  const px = x1 + t * dx
  const py = y1 + t * dy
  const d = Math.hypot(ball.x - px, ball.y - py)
  if (d >= R || d === 0) return false
  const nx = (ball.x - px) / d
  const ny = (ball.y - py) / d
  ball.x = px + nx * R
  ball.y = py + ny * R
  const vn = ball.vx * nx + ball.vy * ny
  if (vn < 0) {
    ball.vx -= (1 + bounce) * vn * nx
    ball.vy -= (1 + bounce) * vn * ny
  }
  return true
}

function hitBumper(b, i) {
  const dx = ball.x - b.x
  const dy = ball.y - b.y
  const d = Math.hypot(dx, dy)
  if (d >= b.r + R) return
  const nx = dx / d
  const ny = dy / d
  ball.x = b.x + nx * (b.r + R)
  ball.y = b.y + ny * (b.r + R)
  // A bumper kicks the ball away, faster than it came.
  const vn = ball.vx * nx + ball.vy * ny
  ball.vx += (-vn + 6) * nx
  ball.vy += (-vn + 6) * ny
  if (flash[i] === 0) score += 100
  flash[i] = 10
}

function step() {
  ball.vy += GRAVITY / SUB
  ball.x += ball.vx / SUB
  ball.y += ball.vy / SUB
  for (const w of WALLS) hitSegment(w[0], w[1], w[2], w[3], 0.5)
  BUMPERS.forEach(hitBumper)
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  if (state === 'ready') return
  for (let i = 0; i < SUB; i++) step()
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed > MAX_SPEED) {
    ball.vx *= MAX_SPEED / speed
    ball.vy *= MAX_SPEED / speed
  }
  // A ball that rolled back down the lane waits to be launched again.
  if (ball.x > 360 && ball.y > 550 && Math.hypot(ball.vx, ball.vy) < 0.5) newBall()
  if (ball.y > canvas.height + R) newBall() // drained: the next ball
}

function launch() {
  if (state !== 'ready') return
  ball.vy = -16
  state = 'playing'
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  BUMPERS.forEach((b, i) => {
    ctx.fillStyle = flash[i] > 0 ? '#fde047' : '#e11d48'
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 30, 50)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
