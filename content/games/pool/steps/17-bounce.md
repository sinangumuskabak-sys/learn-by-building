---
title: Swap the push
title_tr: İtişi değiş tokuş et
skills: [game.physics, game.collision]
---

# --goal--

The heart of the game. Split each velocity into a part **along** the normal and a part **across** it. When two balls of
the same mass collide, they simply **swap the parts along the normal**; the parts across stay as they were.

# --goal-tr--

Oyunun kalbi burası. Her topun hızını iki parçaya ayırdığını düşün: merkezleri birleştiren çizgi (normal) **boyunca**
olan parça ve ona **dik** olan parça. Aynı ağırlıkta iki top çarpışınca yalnız **normal boyunca olan parçaları değiş
tokuş ederler**; dik parçalar olduğu gibi kalır.

Bundan her bilardocunun bildiği iki sonuç çıkar:

- **tam karşıdan** vurursan isteka topu **olduğu yerde durur**, öbür top bütün hızını alır;
- **sıyırarak** vurursan iki top birbirine **90 derece** açıyla ayrılır.

# --code--

```js
// Two balls of the same mass that touch swap the parts of their velocities that point along the line between them.

  const along = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
  if (along <= 0) return // already moving apart
  a.vx -= along * nx
  a.vy -= along * ny
  b.vx += along * nx
  b.vy += along * ny
```

# --meaning--

- `along` is how fast `a` approaches `b` along the normal: the difference of their velocities, projected on `(nx, ny)`
  with a **dot product** (`x * nx + y * ny`).
- If it is not positive they are already moving apart; doing the swap would glue them together.
- `a` loses that much along the normal and `b` gains it: exactly swapping their parts along the line.

# --meaning-tr--

- `(a.vx - b.vx) * nx + (a.vy - b.vy) * ny` → `a`'nın `b`'ye normal boyunca **ne hızla yaklaştığı**. Bir yönü
  `(nx, ny)` birim yönüne izdüşürmenin yolu **nokta çarpım**: `x * nx + y * ny`. Sonuç: o yöndeki parçanın büyüklüğü.
- `if (along <= 0) return` → sıfır ya da eksiyse zaten **uzaklaşıyorlar**. Yine değiş tokuş yapsaydık iki top her karede
  ileri geri çarpışıp birbirine yapışırdı.
- `a.vx -= along * nx`, `a.vy -= along * ny` → `a` normal boyunca o kadar hız **kaybeder**.
- `b.vx += along * nx`, `b.vy += along * ny` → `b` aynı kadar **kazanır**. Sonuç tam olarak normal boyunca parçaların
  yer değiştirmesi.
- Tam karşıdan: `a` 5 hızla gelir, `b` durur → `along` = 5 → `a` 0, `b` 5.

# --task--

1. Put the comment above `function collide(a, b) {`.
2. At the end of `collide`, under `b.y += ny * overlap`, write the six lines.

# --task-tr--

1. `function collide(a, b) {` satırının üstüne yorum satırını ekle.
2. `collide`'ın sonunda `b.y += ny * overlap` satırının altına altı satırı yaz.
3. **Çalıştır** ve üçgene vur: açılış vuruşu!

# --hint--

`along` uses the **difference** of the two velocities: `(a.vx - b.vx) * nx + (a.vy - b.vy) * ny`.

# --hint-tr--

`along` iki hızın **farkını** kullanır: `(a.vx - b.vx) * nx + (a.vy - b.vy) * ny`.

# --try--

Aim straight at ball 1 (aim 0) and shoot: the cue ball stops dead where it hits. That is the head-on rule.

# --try-tr--

Tam 1 numaraya nişan al (aim 0) ve vur: isteka topu çarptığı yerde durur. Tam karşıdan vuruş kuralı bu.

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
let state // 'aiming', 'rolling' or 'won'

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
  if (moving) return
  state = 'aiming'
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
