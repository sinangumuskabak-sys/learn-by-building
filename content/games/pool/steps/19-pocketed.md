---
title: In the pocket
title_tr: Cebe girdi
skills: [game.collision, prog.arrays]
---

# --goal--

A ball drops when its centre comes within `POCKET_R` of a pocket's centre. After every step we keep only the balls that
did not drop. Removing items **while looping** over the same array is a classic bug, so we build a new array with `filter`.

# --goal-tr--

Bir topun **merkezi** bir cebin merkezine `POCKET_R`'den daha çok yaklaşınca top cebe düşer. Her adımdan sonra yalnız
düşmeyen topları tutacağız.

Bir diziyi **gezerken** ondan eleman silmek bilinen bir hatadır: döngü silinen her elemandan sonrakini atlar. Bu yüzden
silmek yerine `filter` ile **yeni bir dizi** kuracağız.

Güzel bir ayrıntı: köşedeki top iki bant tarafından cebin 13 piksel yakınına itilir ve düşer. Orta ceplerde yalnız bir
bant var; top cebe ancak yandan ~12 piksel içinde gelirse düşer. Orta cepler, gerçek masadaki gibi **daha dar**; bunun
için hiç özel kural yazmadık.

# --code--

```js
function pocketed(b) {
  return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
}

  balls = balls.filter((b) => !pocketed(b))
```

# --meaning--

- `some` is true if the function is true for at least one pocket; `[px, py]` takes each pair apart in the parameter.
- `filter` makes a new array with only the items for which the function returns true: the balls not pocketed.

# --meaning-tr--

- `POCKETS.some(([px, py]) => ...)` → `some` ("bazısı") en az bir cep için doğruysa `true` verir. Parametredeki `[px, py]`
  her çifti yine iki ada ayırır.
- `Math.hypot(b.x - px, b.y - py) < POCKET_R` → topun merkezi ile cebin merkezi arasındaki uzaklık 15'ten az mı?
- `balls = balls.filter((b) => !pocketed(b))` → `filter` ("süz") fonksiyonun `true` dediği elemanlardan **yeni** bir
  dizi kurar: cebe **girmeyen** toplar. Eski dizi değişmez; `balls` artık yeni diziyi gösterir.

# --task--

1. Under `collide`, leave an empty line and write `pocketed`.
2. At the end of `step`, under the pair loop line, write the `filter` line.

# --task-tr--

1. `collide` fonksiyonunun altına bir boş satır bırak ve `pocketed` fonksiyonunu yaz.
2. `step`'in sonunda çift döngüsü satırının altına `filter` satırını yaz.
3. **Çalıştır** ve bir topu cebe sok!

# --predict--

What happens if the cue ball itself goes into a pocket?
- [ ] It comes back on its spot
- [x] It is gone, and you cannot shoot any more
  It left `balls`, so it no longer moves or is drawn. The next step handles this.
- [ ] It bounces out

# --predict-tr--

İsteka topunun kendisi cebe girerse ne olur?
- [ ] Yerine geri gelir
- [x] Kaybolur ve artık vuramazsın
  `balls`'tan çıktı; artık ne hareket ediyor ne çiziliyor. Bir sonraki adımda bunu çözeceğiz.
- [ ] Cepten seker

# --tests--

Corner pockets and the narrower middle pockets should catch a ball.
tr: Köşe cepleri ve daha dar orta cepler bir topu yakalamalı.

```js
assert.isTrue(pocketed({ x: 29, y: 49 }), 'a corner pocket')
assert.isTrue(pocketed({ x: 240, y: 49 }), 'a middle pocket')
assert.isFalse(pocketed({ x: 255, y: 49 }), 'the middle pockets are narrower')
assert.isFalse(pocketed({ x: 240, y: 160 }))
```

A pocketed ball should leave the table.
tr: Cebe giren bir top masadan çıkmalı.

```js
const one = balls[1]
one.x = 60
one.y = 80
one.vx = -3
one.vy = -3
state = 'rolling'
for (let i = 0; i < 2000 && state === 'rolling'; i++) $.tick(1)
assert.notInclude(balls, one, 'the ball dropped into the pocket')
assert.lengthOf(balls, 10)
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
const POCKETS = [
  [LEFT, TOP], [240, TOP], [RIGHT, TOP],
  [LEFT, BOTTOM], [240, BOTTOM], [RIGHT, BOTTOM],
]
const POCKET_R = 15
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

function pocketed(b) {
  return POCKETS.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < POCKET_R)
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
  balls = balls.filter((b) => !pocketed(b))
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
  for (const [px, py] of POCKETS) {
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.arc(px, py, POCKET_R, 0, Math.PI * 2)
    ctx.fill()
  }

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
