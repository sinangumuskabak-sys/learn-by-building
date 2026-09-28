---
title: Flippers
title_tr: Paletler
skills: [game.input, game.state]
---

# --explanation--

Two **flippers** guard the bottom. Each is a segment that turns around a pivot: the pivot is fixed, and the tip is at
`pivot + (cos(angle), sin(angle)) × length`.

A flipper has two angles, **rest** (down) and **up**. While its key is held it turns towards up at `FLIP_SPEED` radians per frame,
and when the key is let go it turns back to rest. The last bit of a turn is smaller than a full step, so the flipper stops exactly
on its angle instead of overshooting:

```js
f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? target - f.angle : dir * FLIP_SPEED
```

The right flipper points left, so its angles are around `π`, and its up angle is **larger** than its rest angle. Working with the
direction `Math.sign(target - angle)` instead of assuming "up means smaller" makes the same code work for both.

For collisions a flipper is just another segment. The angle changes a little in every physics step, so the ball meets the flipper
where it really is during the turn.

Left or Z moves the left flipper, Right, `/` or M the right one.

# --explanation-tr--

**Bu adımda:** masanın altına iki mavi **palet** (flipper) ekleyeceğiz. Sol ok ya da Z sol paleti, Sağ ok ya da M
sağ paleti kaldıracak; tuşu bırakınca palet geri düşecek. Top paletlere çarpınca duvara çarpmış gibi sekecek.

**Palet bir döner çizgidir.** Bir ucu (eksen, pivot) sabittir; diğer ucu (tip) bir açıyla döner. Ucun yeri
trigonometriyle bulunur:

```js
tipX = f.x + Math.cos(f.angle) * FLIPPER_LENGTH
tipY = f.y + Math.sin(f.angle) * FLIPPER_LENGTH
```

`Math.cos` ve `Math.sin` bir açının yatay ve dikey payını verir. Açılar **radyan** ile ölçülür: `Math.PI`
(π, yaklaşık 3.14) yarım tur, yani 180°'dir. Açı `0` sağı gösterir; `y` aşağı büyüdüğü için pozitif açı aşağıya,
negatif açı yukarıya eğer. Sol palet dinlenirken `0.45` (sağ-aşağı), kalkınca `-0.45` (sağ-yukarı) açıdadır.

**Hedefe doğru dönmek.** Her paletin iki açısı var: `rest` (aşağıda) ve `up` (yukarıda). Tuş basılıysa hedef `up`,
değilse `rest`. Palet her karede hedefe doğru `FLIP_SPEED` kadar döner. Son parça tam bir adımdan küçükse sadece
kalan kadar döner; böylece hedefi aşmaz, tam üstünde durur:

```js
f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
```

`Math.abs` bir sayının eksisini atar (uzaklık), `Math.sign` yönü verir: pozitifse `1`, negatifse `-1`, sıfırsa `0`.
Sağ palet sola baktığı için açıları `π` civarındadır ve onun "yukarısı" daha **büyük** bir açıdır. "Yukarı küçük
demek" diye varsaymak yerine `dir` ile çalışmak, aynı kodu iki palet için de doğru yapar.

**Çarpışma:** palet de bir çizgi parçasıdır, `hitSegment` ile çarpışır. Açı her küçük fizik adımında biraz
değiştiği için top paleti dönüşün tam o anındaki yerinde bulur.

**Yeni parçalar:**

- `{ ...f, angle: f.rest, speed: 0 }`: üç nokta (`...`) `f` nesnesinin bütün alanlarını yeni nesneye kopyalar,
  sonra `angle` ve `speed` eklenir. Böylece sabit `FLIPPERS` listesi değişmez; oyun kendi kopyasıyla çalışır.
- `(f) => ({ ... })`: bir nesne döndüren kısa fonksiyon. Nesnenin süslü parantezi fonksiyon gövdesiyle karışmasın
  diye `( )` içine alınır.
- `pressed[f.key]`: köşeli parantezle alan okumak. `f.key` `'left'` ise bu `pressed.left` ile aynıdır.
- **`keyup`**: tuş **bırakılınca** gelen olay. `key(event, down)` fonksiyonunu ikisi de çağırır: basınca
  `down = true`, bırakınca `false`. `true`/`false` evet/hayır değerleridir.
- `else if`: "değilse, şu da doğru mu?". `} else return` başka bir tuşsa fonksiyondan çıkar; böylece
  `preventDefault()` sadece oyunun tuşlarında çalışır.

# --task--

1. Add `FLIPPER_LENGTH = 62`, `FLIP_SPEED = 0.25` and `FLIPPERS` (pivots at `(130, 530)` and `(270, 530)`, angles as in the
   solution, with a `key` of `'left'` or `'right'`). In `reset()`, make `flippers` from them with `angle` at rest and `speed: 0`, and
   `pressed = { left: false, right: false }`.
2. Write `tip(f)`. Each frame, set each flipper's `speed` towards its target as above; `step()` turns it by `speed / SUB` and
   collides the ball with it (`bounce` 0.3). While ready, turn it by the whole `speed`.
3. `keydown` and `keyup` set `pressed.left` (Left, Z) and `pressed.right` (Right, `/`, M); Space and Down still launch.
4. Draw each flipper as a `'#38bdf8'` line 10 wide from its pivot to its tip.

# --task-tr--

1. `BUMPERS` listesinin kapanış `]` satırının altına palet ayarlarını ekle:

   ```js
   const FLIPPER_LENGTH = 62
   const FLIP_SPEED = 0.25 // radians per frame
   const FLIPPERS = [
     { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
     { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
   ]
   ```

2. `let ball // { x, y, vx, vy }` satırının altına iki değişken ekle:

   ```js
   let flippers // { ...FLIPPERS[i], angle, speed }
   let pressed // { left, right }
   ```

3. `reset()` fonksiyonunu şöyle değiştir:

   ```js
   function reset() {
     score = 0
     flash = BUMPERS.map(() => 0)
     flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 })) // ← yeni
     pressed = { left: false, right: false }                            // ← yeni
     newBall()
   }
   ```

4. `reset()`'in kapanış `}`'inin altına paletin ucunu hesaplayan kısa fonksiyonu yaz:

   ```js
   const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })
   ```

5. `step()` fonksiyonunun sonuna, `BUMPERS.forEach(hitBumper)` satırının altına paletleri ekle:

   ```js
     BUMPERS.forEach(hitBumper)
     for (const f of flippers) {        // ← yeni
       f.angle += f.speed / SUB         // ← yeni
       const t = tip(f)                 // ← yeni
       hitSegment(f.x, f.y, t.x, t.y, 0.3) // ← yeni
     }                                  // ← yeni
   }
   ```

6. `update()` fonksiyonunun başını şöyle değiştir (`flash = ...` satırı aynı kalır; `if (state === 'ready') return`
   satırının yerine yeni blok gelir):

   ```js
   function update() {
     flash = flash.map((n) => Math.max(0, n - 1))
     for (const f of flippers) {                                   // ← yeni
       // Up while the key is held, back down when it is let go, and stop at either end.
       const target = pressed[f.key] ? f.up : f.rest
       const dir = Math.sign(target - f.angle)
       f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
     }
     if (state === 'ready') {                                      // ← değişti
       for (const f of flippers) f.angle += f.speed
       return
     }
     for (let i = 0; i < SUB; i++) step()
   ```

   Top kanalda beklerken `step()` çalışmadığı için paletleri burada bir kerede döndürürüz.

7. `document.addEventListener('keydown', ...)` bloğunun **tamamını** (son `})` satırına kadar) sil ve yerine şunu
   yaz:

   ```js
   function key(event, down) {
     const k = event.key
     if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
     else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
     else if (k === ' ' || k === 'ArrowDown') {
       if (down) launch()
     } else return
     event.preventDefault()
   }

   document.addEventListener('keydown', (event) => key(event, true))
   document.addEventListener('keyup', (event) => key(event, false))
   ```

8. `draw()`'da tamponları çizen `BUMPERS.forEach(...)` bloğunun kapanış `})` satırının altına paletleri çiz:

   ```js
     ctx.strokeStyle = '#38bdf8'
     ctx.lineWidth = 10
     for (const f of flippers) {
       const t = tip(f)
       ctx.beginPath()
       ctx.moveTo(f.x, f.y)
       ctx.lineTo(t.x, t.y)
       ctx.stroke()
     }
   ```

9. **Çalıştır**'a bas. Altta iki mavi palet görünmeli. Oynamak için önce oyuna tıkla: Sol ok / Z ve Sağ ok / M
   paletleri kaldırmalı, bırakınca inmeli. Alttaki kontrollerin hepsi yeşil olmalı. Palet takılı kalıyorsa
   `keyup` satırını unutmuş olabilirsin.

# --tests--

A flipper should go up while its key is held and come back down, each on its own key.
tr: Bir palet tuşu basılıyken yukarı çıkmalı ve geri inmeli; her biri kendi tuşuyla.

```js
const left = flippers[0]
assert.closeTo(left.angle, 0.45, 1e-9)
$.press('ArrowLeft')
$.tick(4)
assert.closeTo(left.angle, -0.45, 1e-9, 'up while the key is held')
assert.closeTo(flippers[1].angle, Math.PI - 0.45, 1e-9, 'the other one stays down')
$.release('ArrowLeft')
$.tick(4)
assert.closeTo(left.angle, 0.45, 1e-9, 'and back down')
$.press('m')
$.tick(4)
assert.closeTo(flippers[1].angle, Math.PI + 0.45, 1e-9)
```

A flipper should stop the ball like a wall.
tr: Bir palet topu bir duvar gibi durdurmalı.

```js
launch()
const f = flippers[0]
const t = tip(f)
ball = { x: (f.x + t.x) / 2, y: (f.y + t.y) / 2 - 30, vx: 0, vy: 3 }
let bounced = false
for (let i = 0; i < 30; i++) {
  $.tick(1)
  if (ball.vy < 0) bounced = true
}
assert.isTrue(bounced, 'the flipper stops the ball')
```

Both flippers should be drawn.
tr: İki palet de çizilmeli.

```js
$.tick(1)
const flips = $.screen().filter((c) => c.op === 'stroke' && c.stroke === '#38bdf8')
assert.lengthOf(flips, 2)
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
const FLIPPER_LENGTH = 62
const FLIP_SPEED = 0.25 // radians per frame
const FLIPPERS = [
  { x: 130, y: 530, rest: 0.45, up: -0.45, key: 'left' },
  { x: 270, y: 530, rest: Math.PI - 0.45, up: Math.PI + 0.45, key: 'right' },
]

let ball // { x, y, vx, vy }
let flippers // { ...FLIPPERS[i], angle, speed }
let pressed // { left, right }
let state // 'ready' (in the lane) or 'playing'
let score
let flash // frames each bumper stays lit

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
  state = 'ready'
}

function reset() {
  flippers = FLIPPERS.map((f) => ({ ...f, angle: f.rest, speed: 0 }))
  pressed = { left: false, right: false }
  score = 0
  flash = BUMPERS.map(() => 0)
  newBall()
}

const tip = (f) => ({ x: f.x + Math.cos(f.angle) * FLIPPER_LENGTH, y: f.y + Math.sin(f.angle) * FLIPPER_LENGTH })

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
  for (const f of flippers) {
    f.angle += f.speed / SUB
    const t = tip(f)
    hitSegment(f.x, f.y, t.x, t.y, 0.3)
  }
}

function update() {
  flash = flash.map((n) => Math.max(0, n - 1))
  for (const f of flippers) {
    // Up while the key is held, back down when it is let go, and stop at either end.
    const target = pressed[f.key] ? f.up : f.rest
    const dir = Math.sign(target - f.angle)
    f.speed = Math.abs(target - f.angle) < FLIP_SPEED ? (target - f.angle) : dir * FLIP_SPEED
  }
  if (state === 'ready') {
    for (const f of flippers) f.angle += f.speed
    return
  }
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

function key(event, down) {
  const k = event.key
  if (k === 'ArrowLeft' || k === 'z' || k === 'Z') pressed.left = down
  else if (k === 'ArrowRight' || k === '/' || k === 'm' || k === 'M') pressed.right = down
  else if (k === ' ' || k === 'ArrowDown') {
    if (down) launch()
  } else return
  event.preventDefault()
}

document.addEventListener('keydown', (event) => key(event, true))
document.addEventListener('keyup', (event) => key(event, false))

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
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 10
  for (const f of flippers) {
    const t = tip(f)
    ctx.beginPath()
    ctx.moveTo(f.x, f.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()
  }
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
