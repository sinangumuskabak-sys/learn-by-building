---
title: Wait for calm
title_tr: Sakinliği bekle
skills: [game.state]
---

# --goal--

When is a shot over? When nothing has moved for a while. `calm` counts the frames in a row in which no body is
moving; any movement sets it back to 0.

# --goal-tr--

Bir atış ne zaman biter? Kuş yere indiğinde değil; **her şey durduğunda**. İleride kuş kuleleri yıkacak; bloklar
bir süre daha yuvarlanıp düşecek. Onların da durmasını beklemeliyiz.

`calm` (sakin) bir **sayaç**: kaç karedir üst üste hiçbir şey kıpırdamıyor? Bir şey kıpırdarsa 0'a döner. Bu adımda
yalnız sayıyoruz; bir sonraki adımda bu sayıyla karar vereceğiz.

# --code--

```js
let calm // frames everything has been still

  calm = 0

function update() {
  step()
  if (state !== 'flying') return
  // Wait until everything has stopped for a second before the next bird.
  const moving = bodies.some((b) => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.3)
  calm = moving ? 0 : calm + 1
}
```

# --meaning--

- `calm` starts at 0 in `reset` and again at each launch.
- `bodies.some(f)` is `true` if `f` is true for at least one body. `Math.abs` drops the sign, so a speed of `-3`
  counts as 3.
- `moving ? 0 : calm + 1` picks the first value when `moving` is true, otherwise the second.

# --meaning-tr--

- `let calm` → sakin kare sayacı. `reset` içinde ve her fırlatışta (`launch` içinde `state = 'flying'`'in altında)
  0'dan başlar.
- `if (state !== 'flying') return` → uçuş yoksa sayacak bir şey yok.
- `bodies.some((b) => ...)` → "listede koşulu sağlayan **en az bir** gövde var mı?" `true` ya da `false` verir.
- `Math.abs(b.vx)` → sayının işaretsiz hâli: `Math.abs(-3)` → `3`. Sola giden de hareket ediyordur.
- `Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.3` → yatay ya da dikey hızı küçük bir eşikten büyükse hareket ediyor.
  `||` "ya da" demek. (Çok küçük kıpırtılar sayılmaz.)
- `calm = moving ? 0 : calm + 1` → `? :` iki değerden birini seçer: hareket **varsa** 0, **yoksa** sayacı bir artır.

# --task--

1. Under `let state` write `let calm`.
2. Write `calm = 0` in `reset` (under `state = 'aiming'`) and in `launch` (under `state = 'flying'`).
3. In `update`, under `step()`, write the four new lines.

# --task-tr--

1. `let state` satırının altına `let calm` yaz.
2. `reset` içinde `state = 'aiming'` satırının altına `calm = 0` yaz.
3. `launch` içinde `state = 'flying'` satırının altına da `calm = 0` yaz.
4. `update` içinde `step()` satırının altına dört yeni satırı yaz.
5. **Çalıştır**: ekranda fark yok, kontroller yeşil olmalı.

# --tests--

`calm` should stay 0 while the bird moves.
tr: Kuş hareket ederken `calm` 0 kalmalı.

```js
assert.strictEqual(calm, 0)
launch()
$.tick(10)
assert.strictEqual(calm, 0)
```

Once the bird has stopped, `calm` should count the still frames.
tr: Kuş durunca `calm` sakin kareleri saymalı.

```js
aim = { angle: -0.2, pull: 20 }
launch()
$.tick(150)
assert.isAbove(calm, 30)
const c = calm
$.tick(10)
assert.strictEqual(calm, c + 10)
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

  // The sling and, while aiming, the pulled-back bird and the path it will take.
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
