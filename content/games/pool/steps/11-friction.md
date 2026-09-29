---
title: Friction
title_tr: Sürtünme
skills: [game.physics]
---

# --goal--

The felt slows the balls: every frame each ball keeps 98.5% of its speed. Multiplying by the same number every frame slows
it smoothly, fast at first and gently at the end. Below a tiny speed it is set to exactly zero.

# --goal-tr--

Çuha topları **yavaşlatır**. Her karede her top hızının yalnız **%98,5**'ini tutacak. Her karede aynı sayıyla çarpmak
yumuşak bir yavaşlama verir: başta hızlı, sonra gittikçe daha nazik.

Ama bir sayıyı 0.985 ile çarpmaya devam edersen **hiçbir zaman tam 0 olmaz**; top sonsuza kadar sürünür. Bu yüzden çok
küçük hızları **tam 0** yapacağız.

# --code--

```js
const FRICTION = 0.985 // speed kept each frame

  for (const b of balls) {
    b.vx *= FRICTION
    b.vy *= FRICTION
    if (Math.hypot(b.vx, b.vy) < 0.05) b.vx = b.vy = 0
  }
```

# --meaning--

- `vx *= FRICTION` multiplies the speed by 0.985 each frame, keeping the direction.
- `Math.hypot(vx, vy)` is the ball's real speed, the length of the velocity (Pythagoras).
- `b.vx = b.vy = 0` sets both to zero in one line.

# --meaning-tr--

- `const FRICTION = 0.985` → her karede hızın kalan payı.
- `b.vx *= FRICTION`, `b.vy *= FRICTION` → iki parçayı da aynı oranda küçült: top **aynı yönde** yavaşlar.
- `Math.hypot(b.vx, b.vy)` → topun gerçek hızı: iki parçadan Pisagor ile, √(vx² + vy²).
- `< 0.05` ise `b.vx = b.vy = 0` → zincir atama: sağdan sola, önce `vy` sonra `vx` 0 olur. Top **tam durur**.

# --task--

1. Under `COLORS` write `FRICTION`.
2. In `update`, under `step()`, write the loop.

# --task-tr--

1. `COLORS` satırının altına `FRICTION` yaz.
2. `update` içinde `step()` satırının altına döngüyü yaz.
3. **Çalıştır** ve Boşluk'a bas: top yavaşlamalı. (Bantlar hâlâ yok; hızlı bir vuruş masadan çıkabilir.)

# --tests--

Friction should slow every ball every frame.
tr: Sürtünme her topu her karede yavaşlatmalı.

```js
shoot()
$.tick(1)
assert.strictEqual(cue.x, 138)
assert.closeTo(cue.vx, 8 * 0.985, 1e-9)
$.tick(1)
assert.closeTo(cue.vx, 8 * 0.985 * 0.985, 1e-9)
```

A very slow ball should stop completely.
tr: Çok yavaş bir top tamamen durmalı.

```js
cue.vx = 0.03
cue.vy = 0.03
$.tick(1)
assert.strictEqual(cue.vx, 0)
assert.strictEqual(cue.vy, 0)
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
