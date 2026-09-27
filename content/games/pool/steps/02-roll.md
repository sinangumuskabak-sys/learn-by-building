---
title: Rolling and cushions
title_tr: Yuvarlanma ve bantlar
skills: [game.physics, game.loop]
---

# --explanation--

A shot gives the cue ball a **velocity**: a speed (`power`) in a direction (`aim`, an angle). Trigonometry turns the angle
into the two parts that the position needs:

```js
cue.vx = Math.cos(aim) * power
cue.vy = Math.sin(aim) * power
```

Angle `0` points right, `Math.PI / 2` points **down** (the canvas y axis grows downwards), and the arrow keys turn the aim a
little each press.

Every frame each ball moves by its velocity, then **friction** keeps only 98.5% of the speed. Multiplying by the same number
every frame makes the ball slow down smoothly, fast at first and gently at the end. Below a tiny speed we set it to exactly
zero; otherwise it would creep forever, never quite stopping.

A **cushion** reflects the ball: past the left edge, put it back on the edge and flip `vx`. Real cushions absorb some energy,
so the bounce keeps only 80% (`BOUNCE`).

While anything moves, the game is `'rolling'` and waits; when all balls are still, it is `'aiming'` again. A thin line from the
cue ball shows the aim.

# --explanation-tr--

Bir vuruş isteka topuna bir **hız** verir: bir yönde (`aim`, bir açı) bir sürat (`power`). Trigonometri açıyı, konumun
ihtiyaç duyduğu iki parçaya çevirir:

```js
cue.vx = Math.cos(aim) * power
cue.vy = Math.sin(aim) * power
```

`0` açısı sağı, `Math.PI / 2` **aşağıyı** gösterir (canvas'ın y ekseni aşağı doğru büyür) ve ok tuşları her basışta nişanı
biraz döndürür.

Her karede her top hızı kadar hareket eder, sonra **sürtünme** süratin yalnızca %98,5'ini bırakır. Her karede aynı sayıyla
çarpmak topu yumuşakça yavaşlatır: başta hızlı, sonda nazikçe. Çok küçük bir süratin altında onu tam sıfır yaparız; yoksa hiç
tam durmadan sonsuza dek sürünürdü.

Bir **bant** topu yansıtır: sol kenarı geçince onu kenara geri koy ve `vx`'i ters çevir. Gerçek bantlar biraz enerji emer, bu
yüzden sekme yalnızca %80'ini (`BOUNCE`) korur.

Bir şey hareket ettiği sürece oyun `'rolling'`'dir ve bekler; bütün toplar durunca yeniden `'aiming'` olur. İsteka topundan
çıkan ince bir çizgi nişanı gösterir.

# --task--

1. Add `FRICTION = 0.985`, `BOUNCE = 0.8`, and `aim`, `power`, `shots` and `state` (`0`, `8`, `0` and `'aiming'` in
   `reset()`).
2. Write `shoot()`: only while `'aiming'`, set the cue ball's velocity from `aim` and `power`, add 1 to `shots` and set
   `'rolling'`.
3. Write `step()`: move every ball by its velocity, and at each cushion put it back on the edge (`LEFT + R` and so on) and
   reverse that part of the velocity, times `BOUNCE`.
4. Write `update()`, called before `draw()`: while `'rolling'`, `step()`, multiply every velocity by `FRICTION`, set a ball
   slower than `0.05` to exactly zero, and go back to `'aiming'` when nothing moves.
5. Left and Right change `aim` by `0.035`; Space shoots (`preventDefault()` for these keys).
6. While aiming, stroke a line (`'rgba(255, 255, 255, 0.6)'`, width 1) from the cue ball 400 pixels along the aim. Draw
   `Shots 0` at `(LEFT, 22)` in white, `'bold 16px sans-serif'`.

# --task-tr--

1. `FRICTION = 0.985`, `BOUNCE = 0.8` ve `aim`, `power`, `shots` ve `state` ekle (`reset()`'te `0`, `8`, `0` ve `'aiming'`).
2. `shoot()` yaz: yalnızca `'aiming'` iken isteka topunun hızını `aim` ve `power`'dan ayarla, `shots`'a 1 ekle ve `'rolling'`
   yap.
3. `step()` yaz: her topu hızı kadar hareket ettir ve her bantta onu kenara geri koy (`LEFT + R` gibi) ve hızın o parçasını
   `BOUNCE` ile çarparak ters çevir.
4. `draw()`'dan önce çağrılan `update()`'i yaz: `'rolling'` iken `step()` et, her hızı `FRICTION` ile çarp, `0.05`'ten yavaş
   bir topu tam sıfır yap ve hiçbir şey hareket etmiyorsa `'aiming'`'e dön.
5. Sol ve Sağ `aim`'i `0.035` değiştirir; Boşluk vurur (bu tuşlarda `preventDefault()`).
6. Nişan alırken isteka topundan nişan boyunca 400 piksel bir çizgi çiz (`'rgba(255, 255, 255, 0.6)'`, kalınlık 1).
   `(LEFT, 22)`'ye beyaz, `'bold 16px sans-serif'` ile `Shots 0` çiz.

# --tests--

Space should shoot along the aim, and friction should slow the ball every frame.
tr: Boşluk nişan boyunca vurmalı ve sürtünme topu her karede yavaşlatmalı.

```js
assert.strictEqual(state, 'aiming')
$.press('ArrowRight')
$.press('ArrowRight')
assert.closeTo(aim, 0.07, 1e-9)
$.press('ArrowLeft')
aim = 0
$.press(' ')
assert.strictEqual(state, 'rolling')
assert.strictEqual(shots, 1)
assert.deepEqual([cue.vx, cue.vy], [8, 0])
$.press(' ')
assert.strictEqual(shots, 1, 'no second shot while rolling')
$.tick(1)
assert.strictEqual(cue.x, 138)
assert.closeTo(cue.vx, 8 * FRICTION, 1e-9, 'friction slows the ball every frame')
```

A ball should bounce off a cushion and finally stop.
tr: Bir top banttan sekmeli ve sonunda durmalı.

```js
aim = Math.PI / 2
power = 8
shoot()
let bounced = false
for (let i = 0; i < 600 && state === 'rolling'; i++) {
  $.tick(1)
  assert.isAtMost(cue.y, BOTTOM - R, 'the cushion stops the ball')
  if (cue.vy < 0) bounced = true
}
assert.isTrue(bounced, 'it bounces back off the cushion')
assert.strictEqual(state, 'aiming', 'and stops in the end')
assert.strictEqual(cue.vx, 0)
assert.strictEqual(cue.vy, 0)
```

The aim line should point where the shot will go.
tr: Nişan çizgisi vuruşun gideceği yeri göstermeli.

```js
aim = Math.PI / 2
$.tick(1)
const ends = $.screen().filter((c) => c.op === 'lineTo').map((c) => c.args.map(Math.round).join())
assert.include(ends, '130,560', 'the aim line points the way the shot will go')
$.tick(1)
assert.include($.texts(), 'Shots 0')
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
