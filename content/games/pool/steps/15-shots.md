---
title: Count the shots
title_tr: Vuruşları say
skills: [game.state, game.canvas]
---

# --goal--

The goal will be to clear the table in as few shots as possible, so we count them and show the count above the table.

# --goal-tr--

Oyunun amacı masayı **olabildiğince az vuruşla** temizlemek olacak. Bu yüzden vuruşları sayacağız ve masanın üstünde
göstereceğiz.

# --code--

```js
let shots

  shots = 0

  shots += 1

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Shots ' + shots, LEFT, 22)
```

# --meaning--

- `shots` is 0 after `reset` and goes up by one in `shoot`, only when a shot really happens.
- The text is drawn last, above the table on the left.

# --meaning-tr--

- `let shots` → vuruş sayısı; `reset` içinde `shots = 0`.
- `shoot` içinde `shots += 1` → `if (state !== 'aiming') return`'ün **altında** olduğu için yalnız gerçekten vurulunca
  sayar.
- Yazı en son çizilir: masanın üstündeki boşlukta, soldan `LEFT` kadar içeride.

# --task--

1. Under `let power` write `let shots`; in `reset`, under `power = 8`, write `shots = 0`.
2. In `shoot`, write `shots += 1` above `state = 'rolling'`.
3. At the end of `draw`, after the ball loop, leave an empty line and write the four text lines.

# --task-tr--

1. `let power` satırının altına `let shots` yaz.
2. `reset` içinde `power = 8` satırının altına `shots = 0` yaz.
3. `shoot` içinde `state = 'rolling'` satırının **üstüne** `shots += 1` yaz.
4. `draw`'ın sonunda top döngüsünün kapanan `}`'sinden sonra bir boş satır bırak ve dört yazı satırını yaz.
5. **Çalıştır**: sol üstte `Shots 0` görmelisin; her vuruşta artmalı.

# --tests--

Each shot should count once.
tr: Her vuruş bir kez sayılmalı.

```js
assert.strictEqual(shots, 0)
$.press(' ')
$.press(' ')
assert.strictEqual(shots, 1, 'no second shot while rolling')
```

`Shots 0` should be written above the table.
tr: Masanın üstüne `Shots 0` yazılmalı.

```js
$.tick(1)
const text = $.screen().find((c) => c.op === 'fillText' && c.args[0] === 'Shots 0')
assert.exists(text, "'Shots 0'")
assert.deepEqual(text.args.slice(1), [20, 22])
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
