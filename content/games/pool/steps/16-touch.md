---
title: Balls that touch
title_tr: Değen toplar
skills: [game.collision]
---

# --goal--

Two balls touch when their centres are less than `2R` apart. First we only make sure they never overlap: push them apart
along the line between their centres until they just touch. Each pair of balls is checked once per step.

# --goal-tr--

Toplar şu an birbirinin **içinden geçiyor**. İki top, merkezleri arasındaki uzaklık bir çaptan (`2R`) az olunca
**değiyordur**.

Çarpışmayı iki adımda kuracağız. Bu adımda yalnız **iç içe geçmelerini** önleyeceğiz: değen iki topu, merkezlerini
birleştiren çizgi boyunca, **tam değecekleri** yere kadar birbirinden iteceğiz. Bu çizginin yönüne **normal** denir;
çarpışmanın her şeyi ona bağlı.

# --code--

```js
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
}

  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i], balls[j])
```

# --meaning--

- `dist` is the distance between the centres. Not touching (or exactly on top of each other, where there is no direction):
  nothing to do.
- `(nx, ny)` is the direction from `a` to `b` with length 1 (the **normal**).
- `overlap` is half of how much they overlap; each ball moves that much away from the other.
- In `step`, `j` starts at `i + 1`, so each pair is checked once and a ball never with itself.

# --meaning-tr--

- `dx`, `dy` → `a`'dan `b`'ye olan fark; `dist` → merkezler arası uzaklık (Pisagor).
- `if (dist >= R * 2 || dist === 0) return` → değmiyorlarsa bir şey yapma. `dist === 0` → tam üst üste; yön
  belirsiz, 0'a bölmemek için çık.
- `const nx = dx / dist`, `const ny = dy / dist` → `a`'dan `b`'ye yön, **uzunluğu 1**: **birim normal**. Bir yönü
  uzunluğuna bölmek onu 1 uzunluğa getirir.
- `const overlap = (R * 2 - dist) / 2` → ne kadar iç içe geçtiklerinin **yarısı**: her top o kadar geri çekilir.
- `a.x -= nx * overlap` ... → `a` normalin tersine, `b` normal yönünde itilir. Sonunda uzaklık tam `2R`.
- `step` içinde iç içe iki döngü → her **top çifti** için `collide`. `j` `i + 1`'den başlar: her çift bir kez, top hiç
  kendisiyle eşleşmez.

# --task--

1. Above `function step() {` write `collide`, with an empty line after it.
2. In `step`, after the ball loop's closing `}`, write the pair loop line.

# --task-tr--

1. `function step() {` satırının **üstüne** `collide` fonksiyonunu yaz; altında bir boş satır kalsın.
2. `step` içinde top döngüsünün kapanan `}`'sinden sonra, fonksiyonun son `}`'sinden önce çift döngüsü satırını yaz.
3. **Çalıştır** ve üçgene vur.

# --predict--

You hit the rack now. What happens?
- [ ] The balls scatter like in real pool
- [x] The cue ball pushes the balls ahead of it, like a bulldozer
  They no longer overlap, but no speed passes from ball to ball yet.
- [ ] The cue ball passes through

# --predict-tr--

Şimdi üçgene vurursan ne olur?
- [ ] Toplar gerçek bilardodaki gibi dağılır
- [x] İsteka topu önündeki topları buldozer gibi iter
  Artık iç içe geçmiyorlar, ama toptan topa henüz hız aktarılmıyor.
- [ ] İsteka topu içlerinden geçer

# --tests--

Two touching balls should be pushed apart until they just touch.
tr: Değen iki top tam değecekleri yere kadar itilmeli.

```js
const a = ball(100, 100, '#fff', 1)
const b = ball(110, 100, '#fff', 2)
collide(a, b)
assert.closeTo(a.x, 96, 1e-9)
assert.closeTo(b.x, 114, 1e-9)
const c = ball(100, 100, '#fff', 3)
const d = ball(300, 300, '#fff', 4)
collide(c, d)
assert.deepEqual([c.x, d.x], [100, 300], 'far apart: nothing happens')
collide(c, ball(100, 100, '#fff', 5))
assert.strictEqual(c.x, 100, 'exactly on top: no direction, nothing happens')
```

During a shot no two balls should overlap.
tr: Vuruş sırasında hiçbir iki top üst üste binmemeli.

```js
shoot()
for (let f = 0; f < 60; f++) {
  $.tick(1)
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      assert.isAtLeast(Math.hypot(balls[i].x - balls[j].x, balls[i].y - balls[j].y), R * 2 - 8.5)
    }
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
