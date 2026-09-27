---
title: Balls that collide
title_tr: Çarpışan toplar
skills: [game.physics, game.collision]
---

# --explanation--

This is the heart of the game. Two balls touch when the distance between their centres is less than `2R`. What happens then?

Draw the line from one centre to the other and call its direction `n` (the **normal**). Split each velocity into a part
**along** `n` and a part **across** it. In a collision between two balls of the same mass, with no energy lost, the two
balls simply **swap the parts along `n`**, and the parts across `n` stay as they were.

```js
const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny // how fast they approach along n
a.vx -= along * nx
a.vy -= along * ny
b.vx += along * nx
b.vy += along * ny
```

Two famous facts follow, and every pool player knows them:

- **head-on**, the cue ball stops dead and the other ball takes all its speed;
- **glancing**, the two balls leave at exactly **90 degrees** to each other.

Two practical details. Between frames the balls may already overlap a little, so first we push them apart along `n` until
they only just touch. And if `along` is not positive, they are already moving apart, so we do nothing; otherwise two balls
could stick together, bouncing back and forth every frame.

# --explanation-tr--

Oyunun kalbi burası. Merkezleri arasındaki uzaklık `2R`'den az olduğunda iki top değer. O zaman ne olur?

Bir merkezden diğerine çizgiyi çiz ve yönüne `n` de (**normal**). Her hızı `n` **boyunca** bir parça ve onun **karşısında** bir
parça olarak böl. Aynı kütlede iki top arasındaki, enerji kaybı olmayan bir çarpışmada iki top basitçe **`n` boyunca olan
parçaları takas eder**, `n`'nin karşısındaki parçalar olduğu gibi kalır.

```js
const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny // n boyunca ne kadar hızlı yaklaşıyorlar
a.vx -= along * nx
a.vy -= along * ny
b.vx += along * nx
b.vy += along * ny
```

Bundan her bilardocunun bildiği iki ünlü gerçek çıkar:

- **tam karşıdan** vuruşta isteka topu olduğu yerde durur, diğer top bütün süratini alır;
- **sıyırarak** vuruşta iki top birbirine tam **90 derece** açıyla ayrılır.

İki pratik ayrıntı. Kareler arasında toplar zaten biraz üst üste binmiş olabilir; bu yüzden önce onları `n` boyunca yalnızca
değene kadar iteriz. Ve `along` pozitif değilse zaten ayrılıyorlardır, hiçbir şey yapmayız; yoksa iki top birbirine yapışıp her
karede ileri geri sekebilirdi.

# --task--

1. Write `collide(a, b)`: if the centres are `2R` or more apart (or exactly on top of each other), do nothing. Otherwise
   compute the unit normal `(nx, ny)` from `a` to `b`, move each ball half the overlap apart along it, and if they approach
   (`along > 0`) exchange `along` along the normal as shown above.
2. At the end of `step()`, call `collide` for every pair of balls (`j` starting at `i + 1`, so each pair once).

# --task-tr--

1. `collide(a, b)` yaz: merkezler `2R` ya da daha fazla uzaksa (ya da tam üst üsteyse) hiçbir şey yapma. Değilse `a`'dan `b`'ye
   birim normal `(nx, ny)`'yi hesapla, her topu onun boyunca örtüşmenin yarısı kadar ayır ve yaklaşıyorlarsa (`along > 0`)
   yukarıdaki gibi normal boyunca `along`'u değiş tokuş et.
2. `step()`'in sonunda her top çifti için `collide`'ı çağır (`j`, `i + 1`'den başlar; böylece her çift bir kez).

# --tests--

A head-on hit should stop the moving ball and give all its speed to the other.
tr: Tam karşıdan bir vuruş hareket eden topu durdurmalı ve bütün süratini diğerine vermeli.

```js
const a = ball(100, 100, '#fff', 1)
const b = ball(117, 100, '#fff', 2)
a.vx = 5
collide(a, b)
assert.closeTo(a.vx, 0, 1e-9, 'a head-on hit stops the moving ball')
assert.closeTo(b.vx, 5, 1e-9, 'and the other takes all its speed')
assert.isAtLeast(Math.hypot(b.x - a.x, b.y - a.y), R * 2 - 1e-9, 'pushed apart')
const c = ball(100, 100, '#fff', 3)
const d = ball(300, 300, '#fff', 4)
c.vx = 5
collide(c, d)
assert.strictEqual(c.vx, 5, 'far apart: nothing happens')
```

A glancing hit should send the balls off at 90 degrees, keeping momentum and energy.
tr: Sıyırarak bir vuruş topları 90 derece açıyla göndermeli; momentum ve enerji korunmalı.

```js
const a = ball(100, 100, '#fff', 1)
const b = ball(112, 110, '#fff', 2)
a.vx = 4
a.vy = 1
collide(a, b)
assert.closeTo(a.vx * b.vx + a.vy * b.vy, 0, 1e-9, 'after a glancing hit the balls leave at 90 degrees')
assert.closeTo(a.vx + b.vx, 4, 1e-9, 'momentum is kept')
assert.closeTo(a.vx ** 2 + a.vy ** 2 + b.vx ** 2 + b.vy ** 2, 17, 1e-9, 'and so is energy')
```

The break should spread the rack with no balls left overlapping.
tr: Açılış vuruşu üçgeni dağıtmalı ve üst üste binen top kalmamalı.

```js
shoot()
for (let i = 0; i < 2000 && state === 'rolling'; i++) $.tick(1)
assert.strictEqual(state, 'aiming')
const moved = balls.filter((b) => !b.cue && Math.hypot(b.x - 330, b.y - 160) > 60)
assert.isAbove(moved.length, 3, 'the break spreads the balls')
for (let i = 0; i < balls.length; i++) {
  for (let j = i + 1; j < balls.length; j++) {
    assert.isAtLeast(Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y), R * 2 - 0.5)
  }
}
```

# --solution--

```js
// Pool, step by step.
// The page already has <canvas id="game" width="480" height="340"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const LEFT = 20
const TOP = 40
const RIGHT = 460
const BOTTOM = 280
const R = 9 // ball radius
const COLORS = ['#facc15', '#2563eb', '#dc2626', '#7c3aed', '#f97316', '#16a34a', '#7f1d1d', '#111827', '#0891b2', '#db2777']
const FRICTION = 0.985 // speed kept each frame
const BOUNCE = 0.8 // speed kept when hitting a cushion
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue
let aim // angle of the shot, in radians
let power
let shots
let state // 'aiming' or 'rolling'

const ball = (x, y, color, number) => ({ x, y, vx: 0, vy: 0, color, number, cue: number === 0 })

// Ten balls in a triangle pointing at the cue ball: 1, 2, 3, then 4 in the back row.
function rack() {
  cue = ball(CUE_START.x, CUE_START.y, '#f8fafc', 0)
  balls = [cue]
  let n = 0
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      const x = 330 + row * (R * 2 * 0.87 + 0.5)
      const y = 160 + (i - row / 2) * (R * 2 + 0.5)
      balls.push(ball(x, y, COLORS[n], n + 1))
      n += 1
    }
  }
}

function reset() {
  rack()
  aim = 0
  power = 8
  shots = 0
  state = 'aiming'
}

function shoot() {
  if (state !== 'aiming') return
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
  shots += 1
  state = 'rolling'
}

// Two balls of the same mass that touch swap the parts of their velocities that point along the line between them.
function collide(a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dist = Math.hypot(dx, dy)
  if (dist >= R * 2 || dist === 0) return
  const nx = dx / dist
  const ny = dy / dist
  // Push them apart so they only just touch.
  const overlap = (R * 2 - dist) / 2
  a.x -= nx * overlap
  a.y -= ny * overlap
  b.x += nx * overlap
  b.y += ny * overlap
  const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (along <= 0) return // already moving apart
  a.vx -= along * nx
  a.vy -= along * ny
  b.vx += along * nx
  b.vy += along * ny
}

function step() {
  for (const b of balls) {
    b.x += b.vx
    b.y += b.vy
    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
}

function update() {
  if (state !== 'rolling') return
  step()
  let moving = false
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
    else moving = true
  }
  if (!moving) state = 'aiming'
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else if (event.key === ' ') shoot()
  else return
  event.preventDefault()
})

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

  if (state === 'aiming') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cue.x, cue.y)
    ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
    ctx.stroke()
  }

  for (const b of balls) {
    ctx.fillStyle = b.color
    ctx.beginPath()
    ctx.arc(b.x, b.y, R, 0, Math.PI * 2)
    ctx.fill()
    if (b.cue) continue
    ctx.fillStyle = 'white'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(b.number), b.x, b.y + 3)
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots, LEFT, 22)
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
