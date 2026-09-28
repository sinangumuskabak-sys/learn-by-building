---
title: Three birds
title_tr: Üç kuş
skills: [game.state]
---

# --explanation--

A puzzle needs a limit. You get **three birds** per level. After each shot the game waits until everything has settled (the
calm counter from before), then decides:

- no pigs left: the level is **cleared**, and every bird you did not need is worth 1000 points;
- pigs left but no birds: **out of birds**;
- otherwise: the next bird.

Waiting for calm matters here. A tower often keeps collapsing for a second after the hit, and a pig crushed at the very end
still counts.

The bonus for unused birds is what makes players replay a level: clearing it with one perfect shot is worth 2000 more than
clearing it with three.

# --explanation-tr--

**Bu adımda:** oyuna bir sınır koyacağız: seviye başına **üç kuş**. Sol üstte `Birds 3  Score 0` yazacak. Bütün
domuzları temizlersen `Level cleared!` (seviye temizlendi), kuşların biterse `Out of birds` (kuş kalmadı) paneli çıkacak.

**Bir bulmacanın sınırı olmalı.** `birdsLeft` kalan kuş sayısıdır: 3 ile başlar, her fırlatışta 1 azalır. Kuş kalmadıysa
`launch()` hiçbir şey yapmaz. Sapanda kuş çizimi de sadece kuş varken görünür.

**Atış bitince karar.** 2. adımdaki `calm` (sakinlik) sayacı, her şey bir saniye kıpırdamayınca atışı bitiriyordu. Şimdi o
anda şu karar verilir:

- domuz kalmadı (`pigs().length === 0`) → seviye **temizlendi** (`'won'`) ve kullanmadığın her kuş 1000 puan eder;
- domuz var ama kuş yok → **kuş kalmadı** (`'lost'`);
- değilse → sıradaki kuş (`'aiming'`).

**Sakinliği beklemek burada önemli.** Bir kule, çarpmadan sonra çoğu zaman bir saniye daha yıkılmaya devam eder; en
sonda ezilen bir domuz da sayılmalı.

**Neden kullanılmayan kuşa bonus?** Oyuncuları seviyeyi tekrar oynatan budur: seviyeyi tek mükemmel atışla temizlemek,
üç atışla temizlemekten 2000 puan fazla eder.

**Oyun bitince fizik durur.** `update()`'in başına "ne uçuyor ne nişan alınıyorsa dur" ekleriz. `next()` fonksiyonu,
oyun bittiyse `reset()` ile baştan başlatır. Boşluk: nişan alırken fırlatır, değilse `next()`'i çağırır:

```js
state === 'aiming' ? launch() : next()
```

`? :` burada iki işten birini seçer: "nişan alınıyorsa `launch()`, değilse `next()`". Oyun bittiyse ekrana dokunmak da
`next()`'i çağırır (`return next()` → "`next`'i çağır ve burada dur").

**Panel.** Yarı saydam koyu bir dikdörtgen (`'rgba(15, 23, 42, 0.8)'`) ve üstüne ortalanmış beyaz iki yazı.
`ctx.textAlign = 'center'` yazıyı verilen `x`'e ortalar.

# --task--

1. Add `birdsLeft` (`3` in `reset()`); `launch()` needs one and takes it.
2. `update()` works only while aiming or flying. When a shot has settled: with no pigs left, add `birdsLeft * 1000` to the
   score and set `'won'`; with no birds left, `'lost'`; otherwise `'aiming'`.
3. Write `next()`: in `'won'` or `'lost'`, `reset()`. Space calls `next()` unless aiming, and a tap does when the game is over.
4. Draw `Birds 3  Score 0`, and when over a `'rgba(15, 23, 42, 0.8)'` panel at `(130, 110)`, 300 by 80, with `Level cleared!`
   or `Out of birds` (`'bold 22px sans-serif'`, `y = 145`) and `Space or tap to play again` (`'15px sans-serif'`, `y = 172`),
   centered in white.

# --task-tr--

1. `let bird ...` satırının altına kalan kuşları ekle ve `let state ...` satırının yorumunu güncelle:

   ```js
   let birdsLeft
   ```

   ```js
   let state // 'aiming', 'flying', 'won' or 'lost'
   ```

2. `reset()` içinde `bird = null` satırının altına ekle:

   ```js
     birdsLeft = 3
   ```

3. `launch()`'ta ilk satırı değiştir ve `bodies.push(bird)` satırının altına bir satır ekle:

   ```js
   function launch() {
     if (state !== 'aiming' || birdsLeft === 0) return // ← değişti
     const { vx, vy } = launchVelocity()
     bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
     bird.vx = vx
     bird.vy = vy
     bodies.push(bird)
     birdsLeft -= 1 // ← yeni
     state = 'flying'
     calm = 0
   }
   ```

4. `update()`'in başına bir satır ekle ve en sondaki `state = 'aiming'` satırını karar kısmıyla değiştir; hemen altına
   `next`'i yaz:

   ```js
   function update() {
     if (state !== 'flying' && state !== 'aiming') return // ← yeni
     for (let i = 0; i < SUB; i++) step()
   ```

   ```js
     if (bird) {
       bodies = bodies.filter((b) => b !== bird)
       bird = null
     }
     if (pigs().length === 0) { // ← yeni (buradan)
       score += birdsLeft * 1000 // unused birds are worth a lot
       state = 'won'
     } else if (birdsLeft === 0) state = 'lost'
     else state = 'aiming' // ← (buraya kadar)
   }

   function next() {
     if (state === 'won' || state === 'lost') reset()
   }
   ```

5. `keydown` olayındaki Boşluk satırını değiştir:

   ```js
     else if (event.key === ' ') state === 'aiming' ? launch() : next() // ← değişti
   ```

6. `pointerdown` olayının en başına ekle:

   ```js
   canvas.addEventListener('pointerdown', (event) => {
     if (state === 'won' || state === 'lost') return next() // ← yeni
     if (state !== 'aiming') return
   ```

7. `draw()`'da sapandaki kuşu çizen `if`'i değiştir:

   ```js
     if (state === 'aiming' && birdsLeft > 0) { // ← değişti
   ```

8. `draw()`'un en sonundaki puan satırını değiştir ve altına bitiş panelini ekle:

   ```js
     ctx.fillText('Birds ' + birdsLeft + '  Score ' + score, 10, 22) // ← değişti
     if (state === 'won' || state === 'lost') { // ← yeni (buradan)
       ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
       ctx.fillRect(130, 110, 300, 80)
       ctx.fillStyle = 'white'
       ctx.textAlign = 'center'
       ctx.font = 'bold 22px sans-serif'
       ctx.fillText(state === 'won' ? 'Level cleared!' : 'Out of birds', canvas.width / 2, 145)
       ctx.font = '15px sans-serif'
       ctx.fillText('Space or tap to play again', canvas.width / 2, 172)
     } // ← (buraya kadar)
   }
   ```

   `'  Score '` içinde başta **iki** boşluk var; kontroller yazıyı harfi harfine arar.

9. **Çalıştır**'a bas. Sol üstte `Birds 3  Score 0` görmelisin. Oynamak için önce oyuna tıkla ve üç kuşu fırlat: her
   atışta `Birds` bir azalmalı; üçü de ıskalarsa `Out of birds` çıkmalı, Boşluk baştan başlatmalı. Alttaki kontrollerin
   hepsi yeşil olmalı.

# --tests--

Three birds that miss should end the level, and Space should try again.
tr: Iskalayan üç kuş seviyeyi bitirmeli ve Boşluk yeniden denemeli.

```js
assert.strictEqual(birdsLeft, 3)
aim = { angle: -1.2, pull: 20 }
for (let n = 3; n > 0; n--) {
  launch()
  assert.strictEqual(birdsLeft, n - 1)
  for (let i = 0; i < 2000 && state === 'flying'; i++) $.tick(1)
}
assert.strictEqual(state, 'lost', 'out of birds with pigs left')
$.tick(1)
assert.include($.texts(), 'Out of birds')
$.press(' ')
assert.strictEqual(state, 'aiming')
assert.strictEqual(birdsLeft, 3)
```

Clearing the last pig should win, with 1000 points for each unused bird.
tr: Son domuzu temizlemek kazandırmalı; kullanılmayan her kuş için 1000 puan.

```js
bodies = bodies.filter((b) => b.kind !== 'pig')
bodies.push(body('pig', 480, 268, 22, 22))
bodies[bodies.length - 1].hp = -1
aim = { angle: -1.2, pull: 20 }
launch()
for (let i = 0; i < 2000 && state === 'flying'; i++) $.tick(1)
assert.strictEqual(state, 'won')
assert.strictEqual(score, 500 + 2 * 1000, 'each unused bird is worth 1000')
$.tick(1)
assert.include($.texts(), 'Level cleared!')
```

A tap after the end should play again.
tr: Sondan sonra bir dokunuş yeniden oynatmalı.

```js
state = 'won'
$.click(280, 150)
assert.strictEqual(state, 'aiming', 'a tap plays again')
assert.strictEqual(score, 0)
$.tick(1)
assert.include($.texts(), 'Birds 3  Score 0')
```

# --solution--

```js
// Angry Birds-style game, step by step.
// The page already has <canvas id="game" width="560" height="320"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 290
const GRAVITY = 0.25
const SLING = { x: 90, y: 220 } // where the bird sits before it is launched
const MAX_PULL = 70
const LAUNCH = 0.2 // speed per pixel of pull
const BIRD = 10 // the bird is a 20 by 20 box
const SUB = 4 // physics steps per frame
const MATERIALS = {
  wood: { color: '#b45309', density: 1, hp: 60 },
  stone: { color: '#64748b', density: 2.5, hp: 160 },
  pig: { color: '#65a30d', density: 1, hp: 25 },
  bird: { color: '#dc2626', density: 4, hp: Infinity },
}
// The level: [kind, x, y, width, height], x and y the top left corner.
const LEVEL = [
  ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
  ['pig', 480, 268, 22, 22],
]

let bodies // { kind, x, y, w, h, vx, vy, hp }
let bird // the bird in flight, or null
let birdsLeft
let aim // { angle, pull }
let dragging
let score
let state // 'aiming', 'flying', 'won' or 'lost'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
const pigs = () => bodies.filter((b) => b.kind === 'pig')

function reset() {
  bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
  bird = null
  birdsLeft = 3
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  score = 0
  calm = 0
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming' || birdsLeft === 0) return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
  birdsLeft -= 1
  state = 'flying'
  calm = 0
}

// Two overlapping boxes: push them apart along the axis where they overlap least, then bounce their velocities
// along that axis like a collision between two masses, with a little friction along the other axis.
function collide(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (ox <= 0 || oy <= 0) return
  const ia = 1 / mass(a)
  const ib = 1 / mass(b)
  let nx = 0
  let ny = 0
  let depth
  if (ox < oy) [nx, depth] = [a.x + a.w / 2 < b.x + b.w / 2 ? 1 : -1, ox]
  else [ny, depth] = [a.y + a.h / 2 < b.y + b.h / 2 ? 1 : -1, oy]
  const push = depth / (ia + ib)
  a.x -= nx * push * ia
  a.y -= ny * push * ia
  b.x += nx * push * ib
  b.y += ny * push * ib
  const closing = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (closing <= 0) return
  const j = (1.2 * closing) / (ia + ib) // 1.2: a slightly bouncy hit
  a.vx -= j * nx * ia
  a.vy -= j * ny * ia
  b.vx += j * nx * ib
  b.vy += j * ny * ib
  // Friction: slow down the sliding along the surface.
  const slide = (a.vx - b.vx) * ny - (a.vy - b.vy) * nx
  const f = Math.max(-0.5 * j, Math.min(0.5 * j, slide / (ia + ib)))
  a.vx -= f * ny * ia
  a.vy += f * nx * ia
  b.vx += f * ny * ib
  b.vy -= f * nx * ib
  damage(a, closing)
  damage(b, closing)
}

// Hits harder than a gentle landing hurt; things fall apart at 0 hp.
function damage(b, speed) {
  if (speed > 2) b.hp -= (speed - 2) * 25
}

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY / SUB
    b.x += b.vx / SUB
    b.y += b.vy / SUB
    if (b.y + b.h > GROUND) {
      if (b.vy > 0) damage(b, b.vy)
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) collide(bodies[i], bodies[j])
  // Broken or fallen off the world: gone. Every pig and block that goes scores.
  bodies = bodies.filter((b) => {
    if (b.hp > 0 && b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    else score += b.kind === 'pig' ? 500 : 100
    return false
  })
}

function update() {
  if (state !== 'flying' && state !== 'aiming') return
  for (let i = 0; i < SUB; i++) step()
  if (state !== 'flying') return
  // Wait until everything has stopped for a second before the next bird.
  const moving = bodies.some((b) => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.3)
  calm = moving ? 0 : calm + 1
  if (calm < 60 && !(bird && bird.x > canvas.width)) return
  if (bird) {
    bodies = bodies.filter((b) => b !== bird)
    bird = null
  }
  if (pigs().length === 0) {
    score += birdsLeft * 1000 // unused birds are worth a lot
    state = 'won'
  } else if (birdsLeft === 0) state = 'lost'
  else state = 'aiming'
}

function next() {
  if (state === 'won' || state === 'lost') reset()
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') state === 'aiming' ? launch() : next()
  else return
  event.preventDefault()
})

function toCanvas(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  }
}

// Drag back from the sling like a real one: the bird flies the other way, harder the further you pull.
function pull(point) {
  const dx = SLING.x - point.x
  const dy = SLING.y - point.y
  aim.angle = Math.atan2(dy, dx)
  aim.pull = Math.min(MAX_PULL, Math.hypot(dx, dy))
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'won' || state === 'lost') return next()
  if (state !== 'aiming') return
  const point = toCanvas(event)
  if (Math.hypot(point.x - SLING.x, point.y - SLING.y) > 60) return
  dragging = true
  pull(point)
})

canvas.addEventListener('pointermove', (event) => {
  if (dragging) pull(toCanvas(event))
})

document.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  if (aim.pull >= 15) launch()
})

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird and the path it will take.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  if (state === 'aiming' && birdsLeft > 0) {
    const { vx, vy } = launchVelocity()
    const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
    const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SLING.x, SLING.y)
    ctx.lineTo(bx, by)
    ctx.stroke()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let t = 4; t <= 60; t += 4) {
      // Where the bird will be after t frames: x grows steadily, y follows a parabola.
      const x = SLING.x + vx * t
      const y = SLING.y + vy * t + (GRAVITY * t * t) / 2
      if (y > GROUND) break
      ctx.fillRect(x - 2, y - 2, 4, 4)
    }
    ctx.fillStyle = MATERIALS.bird.color
    ctx.beginPath()
    ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    if (b.kind === 'pig' || b.kind === 'bird') {
      ctx.beginPath()
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(b.x, b.y, b.w, b.h)
      // Cracks show how hurt a block is.
      if (b.hp < m.hp / 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.fillRect(b.x + b.w / 2 - 1, b.y, 2, b.h)
      }
    }
  }

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Birds ' + birdsLeft + '  Score ' + score, 10, 22)
  if (state === 'won' || state === 'lost') {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
    ctx.fillRect(130, 110, 300, 80)
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText(state === 'won' ? 'Level cleared!' : 'Out of birds', canvas.width / 2, 145)
    ctx.font = '15px sans-serif'
    ctx.fillText('Space or tap to play again', canvas.width / 2, 172)
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
