---
title: Launch and gravity
title_tr: Fırlatma ve yerçekimi
skills: [game.physics, game.state]
---

# --explanation--

Space launches the bird. Its starting velocity points along the aim, and its size grows with the pull:

```js
vx = Math.cos(aim.angle) * aim.pull * LAUNCH
vy = Math.sin(aim.angle) * aim.pull * LAUNCH
```

From then on, only **gravity** acts: every frame it adds a little to `vy`. Nothing changes `vx` in the air, so the bird moves
sideways at a steady speed while its fall speeds up, and that combination draws the famous curve of every thrown thing, a
**parabola**.

The bird becomes a **body**: a box with a position, a size and a velocity. Everything that will move in this game (the bird,
blocks, pigs) will be a body in one `bodies` array, updated by the same `step()`. For now there is only the bird.

When it lands, the ground stops its fall and rubs its sideways speed away. Once nothing has moved for a second (60 calm
frames), or the bird has flown off the screen, the bird is removed and the sling is ready again. A `state` of `'aiming'` or
`'flying'` keeps the two apart, so you cannot launch a second bird mid-flight.

# --explanation-tr--

Boşluk kuşu fırlatır. Başlangıç hızı nişan yönündedir ve büyüklüğü çekişle artar:

```js
vx = Math.cos(aim.angle) * aim.pull * LAUNCH
vy = Math.sin(aim.angle) * aim.pull * LAUNCH
```

Ondan sonra yalnızca **yerçekimi** etki eder: her karede `vy`'ye biraz ekler. Havada hiçbir şey `vx`'i değiştirmez; bu yüzden kuş
düşüşü hızlanırken yana sabit hızla ilerler ve bu birleşim fırlatılan her şeyin ünlü eğrisini çizer: bir **parabol**.

Kuş bir **cisim** olur: konumu, boyutu ve hızı olan bir kutu. Bu oyunda hareket edecek her şey (kuş, bloklar, domuzlar) aynı
`step()` ile güncellenen tek bir `bodies` dizisinde bir cisim olacak. Şimdilik yalnızca kuş var.

Yere indiğinde zemin düşüşünü durdurur ve yana doğru hızını sürtünerek yok eder. Hiçbir şey bir saniye (60 sakin kare) hareket
etmediğinde ya da kuş ekrandan uçup gittiğinde kuş kaldırılır ve sapan yeniden hazır olur. `'aiming'` ya da `'flying'` olan bir
`state` ikisini ayrı tutar; böylece uçuş ortasında ikinci bir kuş fırlatamazsın.

# --task--

1. Add `GRAVITY = 0.25` and `LAUNCH = 0.2`, and `bodies`, `bird`, `state` and `calm` (`[]`, `null`, `'aiming'` and `0` in
   `reset()`).
2. Write `body(kind, x, y, w, h)` (with `vx: 0, vy: 0`), `launchVelocity()` and `launch()`: only while aiming, make the bird a
   `2 * BIRD` box centered on the sling with the launch velocity, add it to `bodies` and set `'flying'`.
3. Write `step()`: every body gets `GRAVITY` added to `vy` and moves by its velocity; below the ground, put it on the ground,
   stop its fall and multiply `vx` by `0.9`. Remove bodies more than 50 pixels off the sides (and forget the bird if it
   goes).
4. Write `update()`: `step()`; while flying, count `calm` frames in which no body moves (`|vx| > 0.1` or `|vy| > 0.3` counts
   as moving). After 60 calm frames, or with the bird off the right edge, remove the bird and go back to `'aiming'`.
5. Up and Down change `aim.angle` by `0.03`, Right and Left change `aim.pull` by 2 (between 10 and `MAX_PULL`), Space launches.
6. Draw the pulled-back bird only while aiming, and every body as a circle in its color.

# --task-tr--

1. `GRAVITY = 0.25` ve `LAUNCH = 0.2` ile `bodies`, `bird`, `state` ve `calm` ekle (`reset()`'te `[]`, `null`, `'aiming'` ve `0`).
2. `body(kind, x, y, w, h)`'yi (`vx: 0, vy: 0` ile), `launchVelocity()`'yi ve `launch()`'u yaz: yalnızca nişan alırken kuşu sapana
   ortalı `2 * BIRD`'lük bir kutu olarak fırlatma hızıyla yap, `bodies`'e ekle ve `'flying'` yap.
3. `step()` yaz: her cismin `vy`'sine `GRAVITY` eklenir ve cisim hızı kadar hareket eder; zeminin altındaysa onu zemine koy,
   düşüşünü durdur ve `vx`'i `0.9` ile çarp. Kenarlardan 50 pikselden fazla dışarıdaki cisimleri kaldır (giden kuşsa onu da unut).
4. `update()` yaz: `step()`; uçarken hiçbir cismin hareket etmediği `calm` karelerini say (`|vx| > 0.1` ya da `|vy| > 0.3`
   hareket sayılır). 60 sakin kareden sonra ya da kuş sağ kenarın dışındayken kuşu kaldır ve `'aiming'`'e dön.
5. Yukarı ve Aşağı `aim.angle`'ı `0.03`, Sağ ve Sol `aim.pull`'u 2 değiştirir (10 ile `MAX_PULL` arasında), Boşluk fırlatır.
6. Geri çekilmiş kuşu yalnızca nişan alırken, her cismi de kendi renginde bir daire olarak çiz.

# --tests--

The arrow keys should change the angle and the pull, within limits.
tr: Ok tuşları açıyı ve çekişi sınırlar içinde değiştirmeli.

```js
$.press('ArrowUp')
assert.closeTo(aim.angle, -0.63, 1e-9)
$.press('ArrowDown')
$.press('ArrowDown')
assert.closeTo(aim.angle, -0.57, 1e-9)
$.press('ArrowRight')
assert.strictEqual(aim.pull, 52)
for (let i = 0; i < 20; i++) $.press('ArrowRight')
assert.strictEqual(aim.pull, MAX_PULL)
for (let i = 0; i < 40; i++) $.press('ArrowLeft')
assert.strictEqual(aim.pull, 10)
```

Space should launch the bird along the aim, and gravity should pull it down.
tr: Boşluk kuşu nişan boyunca fırlatmalı ve yerçekimi onu aşağı çekmeli.

```js
aim = { angle: -0.5, pull: 40 }
$.press(' ')
assert.strictEqual(state, 'flying')
assert.lengthOf(bodies, 1)
assert.strictEqual(bird, bodies[0])
assert.closeTo(bird.vx, Math.cos(-0.5) * 40 * LAUNCH, 1e-9)
assert.closeTo(bird.vy, Math.sin(-0.5) * 40 * LAUNCH, 1e-9)
const vy = bird.vy
$.tick(1)
assert.isAbove(bird.vy, vy, 'gravity pulls it down')
$.press(' ')
assert.lengthOf(bodies, 1, 'one bird at a time')
```

The bird should land and stop, or fly off the screen; then the sling is ready again.
tr: Kuş inip durmalı ya da ekrandan uçup gitmeli; sonra sapan yeniden hazır olur.

```js
aim = { angle: -0.2, pull: 20 }
launch()
let landed = false
for (let i = 0; i < 400 && state === 'flying'; i++) {
  $.tick(1)
  if (bird && bird.y + bird.h === GROUND) landed = true
  if (bird) assert.isAtMost(bird.y + bird.h, GROUND, 'never under the ground')
}
assert.isTrue(landed)
assert.strictEqual(state, 'aiming', 'once it stops, the next bird can go')
assert.lengthOf(bodies, 0)
aim = { angle: -0.3, pull: 70 }
launch()
for (let i = 0; i < 200 && state === 'flying'; i++) $.tick(1)
assert.strictEqual(state, 'aiming', 'a bird that flies off the screen is gone too')
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
const MATERIALS = {
  bird: { color: '#dc2626', density: 4 },
}

let bodies // { kind, x, y, w, h, vx, vy }
let bird // the bird in flight, or null
let aim // { angle, pull }
let state // 'aiming' or 'flying'
let calm // frames everything has been still

const body = (kind, x, y, w, h) => ({ kind, x, y, w, h, vx: 0, vy: 0 })

function reset() {
  bodies = []
  bird = null
  aim = { angle: -0.6, pull: 50 }
  state = 'aiming'
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

function step() {
  for (const b of bodies) {
    b.vy += GRAVITY
    b.x += b.vx
    b.y += b.vy
    if (b.y + b.h > GROUND) {
      b.y = GROUND - b.h
      b.vy = 0
      b.vx *= 0.9 // the ground is rough
    }
  }
  // Fallen off the world: gone.
  bodies = bodies.filter((b) => {
    if (b.x < canvas.width + 50 && b.x + b.w > -50) return true
    if (b === bird) bird = null
    return false
  })
}

function update() {
  step()
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

function draw() {
  ctx.fillStyle = '#bae6fd'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#65a30d'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  // The sling and, while aiming, the pulled-back bird.
  ctx.fillStyle = '#78350f'
  ctx.fillRect(SLING.x - 4, SLING.y, 8, GROUND - SLING.y)
  if (state === 'aiming') {
    const bx = SLING.x - Math.cos(aim.angle) * aim.pull * 0.5
    const by = SLING.y - Math.sin(aim.angle) * aim.pull * 0.5
    ctx.strokeStyle = '#451a03'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(SLING.x, SLING.y)
    ctx.lineTo(bx, by)
    ctx.stroke()
    ctx.fillStyle = MATERIALS.bird.color
    ctx.beginPath()
    ctx.arc(bx, by, BIRD, 0, Math.PI * 2)
    ctx.fill()
  }

  for (const b of bodies) {
    const m = MATERIALS[b.kind]
    ctx.fillStyle = m.color
    ctx.beginPath()
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2)
    ctx.fill()
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
