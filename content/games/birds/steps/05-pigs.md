---
title: Damage and pigs
title_tr: Hasar ve domuzlar
skills: [game.collision, game.state]
---

# --explanation--

Now things can **break**. Every body gets hit points (`hp`) from its material: pigs are fragile (25), wood is medium (60),
stone is tough (160), and the bird never breaks.

How hard was a hit? `collide` already knows: `closing` is how fast the two boxes were moving towards each other. A gentle
touch, like a block settling on another, should do nothing, so only the speed **above** 2 counts:

```js
if (speed > 2) b.hp -= (speed - 2) * 25
```

That one threshold gives a lot of the game's feel. Blocks resting in a tower never get hurt. A bird at full speed smashes wood.
A plank that falls onto a pig crushes it. Landing on the ground counts too, so a pig knocked off a tower may break from the fall.

Anything at 0 hp or less is removed, and scores: 500 for a pig, 100 for a block. As a block weakens, a dark crack shows it is
about to go.

# --explanation-tr--

**Bu adımda:** işler **kırılabilecek**. Sahneye iki yeşil domuz gelecek: biri kulenin kirişinin üstünde, biri yerde.
Sert çarpan her şey hasar alacak; zayıflayan bloklarda koyu bir çatlak belirecek, canı biten şey yok olup puan
getirecek. Sol üstte `Score 0` yazacak.

**Her gövdenin canı (`hp`) var.** Can, malzemeden gelir: domuzlar kırılgan (25), tahta orta (60), taş dayanıklı (160),
kuş ise hiç kırılmaz (`Infinity`, yani "sonsuz"). Bir gövde yaratılırken canı malzemesinin canıyla başlar:
`hp: MATERIALS[kind].hp`.

**Çarpma ne kadar sertti?** `collide` bunu zaten biliyor: 4. adımdaki `closing`, iki kutunun birbirine doğru ne hızla
geldiğiydi. Nazik bir dokunuş (bir bloğun ötekinin üstüne oturması gibi) hiçbir şey yapmamalı; bu yüzden sadece 2'nin
**üstündeki** hız sayılır:

```js
if (speed > 2) b.hp -= (speed - 2) * 25
```

Örnek: 4 hızla çarpan bir tahta `(4 - 2) × 25 = 50` can kaybeder, 60'tan 10'a düşer. 1.5 hızla dokunan hiç kaybetmez.

Bu tek eşik oyunun hissinin büyük kısmını verir. Kulede duran bloklar asla zarar görmez. Tam hızla gelen kuş tahtayı
parçalar. Bir domuzun üstüne düşen tahta onu ezer. Yere düşmek de sayılır: düşüş hızı (`vy`) ile hasar verilir; kuleden
düşen domuz düşüşten kırılabilir.

**Kırılan gider ve puan getirir.** `step()` zaten ekrandan çıkanları listeden atıyordu (`filter`). Şimdi canı 0 ya da
altında olanları da atar. Giden domuz 500, giden blok 100 puan eder (`b.kind === 'pig' ? 500 : 100`). Kuş giderse puan
yok, sadece `bird` unutulur.

**Çatlak.** Canı yarısının altına düşen bloğun ortasına 2 piksel enli, yarı saydam siyah bir çizgi çizeriz: yakında
kırılacağını gösterir.

**Yeni küçük şeyler:**

- `const pigs = () => bodies.filter((b) => b.kind === 'pig')` → listedeki domuzları veren küçük bir fonksiyon. İleride
  "domuz kaldı mı?" diye sormak için kullanılacak.
- `if (b.vy > 0) damage(b, b.vy)` → sadece aşağı doğru düşerken yere çarpmak hasar verir.
- `ctx.font`, `ctx.textAlign` ve `ctx.fillText('Score ' + score, 10, 22)` → yazı tipi, hizalama ve yazıyı boyamak.
  `'Score ' + score` yazı ile sayıyı yan yana koyar.

# --task--

1. Give `MATERIALS` an `hp` each (`wood` 60, `stone` 160, `bird` `Infinity`) and add `pig` (`'#65a30d'`, density 1, hp 25).
   `body` starts with its material's `hp`. Add `pigs()`, which returns the bodies of kind `'pig'`, and
   change `LEVEL` to this (the stone block is gone, two pigs are in):

   ```js
   const LEVEL = [
     ['wood', 380, 230, 12, 60], ['wood', 440, 230, 12, 60], ['wood', 370, 218, 94, 12], ['pig', 406, 196, 22, 22],
     ['pig', 480, 268, 22, 22],
   ]
   ```

2. Write `damage(b, speed)` as above. `collide` damages both bodies with `closing`; landing on the ground damages a body with
   its falling `vy`.
3. `step()` removes bodies with `hp <= 0` as well as those off the sides; each removed pig adds 500 to `score` and each block
   100 (`score` is `0` in `reset()`).
4. Draw pigs as circles like the bird; draw a `'rgba(0, 0, 0, 0.35)'` crack (2 wide, the full height, in the middle) on blocks
   below half their hp; draw `Score 0` at `(10, 22)` (`'#0f172a'`, `'bold 16px sans-serif'`).

# --task-tr--

1. `MATERIALS`'ı ve `LEVEL`'ı şöyle değiştir (her malzemeye `hp`, yeni `pig`; seviyede taş yerine iki domuz):

   ```js
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
   ```

2. `let bodies ...` satırının yorumunu güncelle ve `let dragging` satırının altına puanı ekle:

   ```js
   let bodies // { kind, x, y, w, h, vx, vy, hp }
   ```

   ```js
   let dragging
   let score // ← yeni
   ```

3. `const body = ...` satırına canı ekle ve `const mass = ...` satırının altına `pigs`'i ekle:

   ```js
   const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp }) // ← değişti
   const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
   const pigs = () => bodies.filter((b) => b.kind === 'pig') // ← yeni
   ```

4. `reset()` içinde `state = 'aiming'` satırının altına ekle:

   ```js
     score = 0
   ```

5. `collide()`'ın en sonuna (son `b.vy -= f * nx * ib` satırının altına) iki satır ekle ve fonksiyonun hemen altına
   `damage`'ı yaz:

   ```js
     b.vy -= f * nx * ib
     damage(a, closing) // ← yeni
     damage(b, closing) // ← yeni
   }

   // Hits harder than a gentle landing hurt; things fall apart at 0 hp.
   function damage(b, speed) {
     if (speed > 2) b.hp -= (speed - 2) * 25
   }
   ```

6. `step()`'te iki değişiklik: yere inerken hasar ver, ve listeden atma kısmını kırılanları da atacak şekilde değiştir:

   ```js
       if (b.y + b.h > GROUND) {
         if (b.vy > 0) damage(b, b.vy) // ← yeni
         b.y = GROUND - b.h
   ```

   ```js
     // Broken or fallen off the world: gone. Every pig and block that goes scores. // ← değişti
     bodies = bodies.filter((b) => {
       if (b.hp > 0 && b.x < canvas.width + 50 && b.x + b.w > -50) return true // ← değişti
       if (b === bird) bird = null
       else score += b.kind === 'pig' ? 500 : 100 // ← yeni
       return false
     })
   ```

7. `draw()`'un sonundaki gövde döngüsünü şöyle yap ve altına puan yazısını ekle:

   ```js
     for (const b of bodies) {
       const m = MATERIALS[b.kind]
       ctx.fillStyle = m.color
       if (b.kind === 'pig' || b.kind === 'bird') { // ← değişti
         ctx.beginPath()
         ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
         ctx.fill()
       } else {
         ctx.fillRect(b.x, b.y, b.w, b.h)
         // Cracks show how hurt a block is. // ← yeni (buradan)
         if (b.hp < m.hp / 2) {
           ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
           ctx.fillRect(b.x + b.w / 2 - 1, b.y, 2, b.h)
         } // ← (buraya kadar)
       }
     }

     ctx.fillStyle = '#0f172a' // ← yeni (buradan)
     ctx.font = 'bold 16px sans-serif'
     ctx.textAlign = 'left'
     ctx.fillText('Score ' + score, 10, 22) // ← (buraya kadar)
   }
   ```

8. **Çalıştır**'a bas. Kulenin tepesinde ve yerde birer yeşil domuz görmelisin; sol üstte `Score 0` yazmalı ve hiçbir
   şey kendi kendine kırılmamalı. Oynamak için önce oyuna tıkla ve kuşu domuzlara fırlat: vurulan domuz kaybolmalı,
   puan artmalı. Alttaki kontrollerin hepsi yeşil olmalı. Kule kendi kendine puan getiriyorsa `damage`'daki `speed > 2`
   eşiğini kontrol et.

# --tests--

Hard hits should break things, gentle ones should not.
tr: Sert çarpmalar bir şeyleri kırmalı, nazik olanlar kırmamalı.

```js
const pig = body('pig', 118, 100, 22, 22)
const b = body('bird', 100, 100, 20, 20)
b.vx = 6
collide(b, pig)
assert.isBelow(pig.hp, 0, 'a hard hit breaks a pig')
const w = body('wood', 0, 0, 12, 60)
damage(w, 1.5)
assert.strictEqual(w.hp, 60, 'a gentle touch does nothing')
damage(w, 4)
assert.strictEqual(w.hp, 10)
```

A standing tower should never get hurt, but a pig falling from high up should break and score.
tr: Duran bir kule hiç zarar görmemeli, ama yüksekten düşen bir domuz kırılıp puan getirmeli.

```js
const start = score
$.tick(900)
assert.strictEqual(score, start)
for (const b of bodies) assert.strictEqual(b.hp, MATERIALS[b.kind].hp, 'standing still never hurts')
bodies.push(body('pig', 200, 60, 22, 22))
$.tick(120)
assert.lengthOf(pigs(), 2, 'a fall from high up breaks a pig')
assert.strictEqual(score, 500)
```

Weak blocks should show a crack, pigs should be round and green, and the score should be drawn.
tr: Zayıf bloklar çatlak göstermeli, domuzlar yuvarlak ve yeşil olmalı ve puan çizilmeli.

```js
const w = body('wood', 200, 230, 12, 60)
w.hp = 20
bodies = [w]
$.tick(1)
assert.deepInclude($.rects('rgba(0, 0, 0, 0.35)'), { x: 205, y: 230, w: 2, h: 60, color: 'rgba(0, 0, 0, 0.35)' }, 'a crack')
assert.lengthOf($.arcs().filter((a) => a.color === '#65a30d'), 0)
bodies.push(body('pig', 300, 268, 22, 22))
$.tick(1)
assert.lengthOf($.arcs().filter((a) => a.color === '#65a30d'), 1, 'pigs are round and green')
$.tick(1)
assert.include($.texts(), 'Score 0')
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
let aim // { angle, pull }
let dragging
let score
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0, hp: MATERIALS[kind].hp })
const mass = (b) => (b.w * b.h * MATERIALS[b.kind].density) / 400
const pigs = () => bodies.filter((b) => b.kind === 'pig')

function reset() {
  bodies = LEVEL.map(([kind, x, y, w, h]) => body(kind, x, y, w, h))
  bird = null
  aim = { angle: -0.6, pull: 50 }
  dragging = false
  state = 'aiming'
  score = 0
  calm = 0
}

// The launch velocity: pulled back by `pull` pixels, the bird flies the opposite way.
const launchVelocity = () => ({ vx: Math.cos(aim.angle) * aim.pull * LAUNCH, vy: Math.sin(aim.angle) * aim.pull * LAUNCH })

function launch() {
  if (state !== 'aiming') return
  const { vx, vy } = launchVelocity()
  bird = body('bird', SLING.x - BIRD, SLING.y - BIRD, BIRD * 2, BIRD * 2)
  bird.vx = vx
  bird.vy = vy
  bodies.push(bird)
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
  state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') aim.angle -= 0.03
  else if (event.key === 'ArrowDown') aim.angle += 0.03
  else if (event.key === 'ArrowRight') aim.pull = Math.min(MAX_PULL, aim.pull + 2)
  else if (event.key === 'ArrowLeft') aim.pull = Math.max(10, aim.pull - 2)
  else if (event.key === ' ') launch()
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
  if (state === 'aiming') {
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
  ctx.fillText('Score ' + score, 10, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
