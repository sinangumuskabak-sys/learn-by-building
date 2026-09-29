---
title: Cushions
title_tr: Bantlar
skills: [game.physics, game.collision]
---

# --goal--

A cushion reflects the ball: past the left edge, put it back on the edge and flip `vx`. Real cushions absorb some energy,
so the bounce keeps only 80% of the speed.

# --goal-tr--

Bant, topu **geri yansıtır**. Top sol kenarı geçtiyse onu kenara geri koyar, yatay hızının **işaretini çeviririz**:
sola giden sağa döner. Üst ve alt bantta aynısı dikey hızla.

Gerçek bantlar enerjinin bir kısmını yutar; bu yüzden sekişte hızın yalnız **%80**'i kalacak.

Topun **merkezi** kenara `R` kadar yaklaşınca top banda değmiş olur: sınır `LEFT` değil, `LEFT + R`.

# --code--

```js
const BOUNCE = 0.8 // speed kept when hitting a cushion

    // Cushions: reflect the velocity and lose a little speed.
    if (b.x < LEFT + R) [b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]
    if (b.x > RIGHT - R) [b.x, b.vx] = [RIGHT - R, -b.vx * BOUNCE]
    if (b.y < TOP + R) [b.y, b.vy] = [TOP + R, -b.vy * BOUNCE]
    if (b.y > BOTTOM - R) [b.y, b.vy] = [BOTTOM - R, -b.vy * BOUNCE]
```

# --meaning--

- The ball touches the left cushion when its centre is closer than `R` to `LEFT`.
- `[b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]` sets two values in one line: the position back on the edge, and the speed
  reversed and reduced.

# --meaning-tr--

- `if (b.x < LEFT + R)` → topun merkezi sol kenara `R`'den fazla yaklaştıysa top banda girmiştir.
- `[b.x, b.vx] = [LEFT + R, -b.vx * BOUNCE]` → **dizi ayrıştırma** ile iki değeri tek satırda ver: sağda iki elemanlı bir
  dizi kurulur, solda sırayla iki değişkene dağıtılır.
  - `b.x = LEFT + R` → topu tam kenara geri koy (bandın içinde kalmasın).
  - `b.vx = -b.vx * BOUNCE` → eksi işareti yönü **çevirir**, `BOUNCE` hızın %80'ini bırakır.
- Diğer üç satır sağ, üst ve alt bant için aynısı.

# --task--

1. Under `FRICTION` write `BOUNCE`.
2. In `step`, inside the loop, under `b.y += b.vy`, write the comment and the four cushion lines.

# --task-tr--

1. `FRICTION` satırının altına `BOUNCE` yaz.
2. `step` içindeki döngüde `b.y += b.vy` satırının altına yorum satırını ve dört bant satırını yaz.
3. **Çalıştır**, nişanı yukarı ya da aşağı çevir ve vur: top bantlardan sekmeli.

# --tests--

A ball should bounce off a cushion and finally stop.
tr: Bir top banttan sekmeli ve sonunda durmalı.

```js
aim = Math.PI / 2
power = 8
shoot()
let bounced = false
for (let i = 0; i < 600; i++) {
  $.tick(1)
  assert.isAtMost(cue.y, BOTTOM - R, 'the cushion stops the ball')
  if (cue.vy < 0) bounced = true
}
assert.isTrue(bounced, 'it bounces back off the cushion')
assert.strictEqual(cue.vy, 0, 'and stops in the end')
```

A bounce should keep 80% of the speed.
tr: Sekiş hızın %80'ini korumalı.

```js
const b = ball(LEFT + R + 1, 100, '#fff', 1)
b.vx = -5
balls = [b]
step()
assert.strictEqual(b.x, LEFT + R)
assert.closeTo(b.vx, 4, 1e-9)
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
}

function shoot() {
  cue.vx = Math.cos(aim) * power
  cue.vy = Math.sin(aim) * power
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
}

function update() {
  step()
  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
  }
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

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cue.x, cue.y)
  ctx.lineTo(cue.x + Math.cos(aim) * 400, cue.y + Math.sin(aim) * 400)
  ctx.stroke()

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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
