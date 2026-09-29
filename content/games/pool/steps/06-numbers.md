---
title: Numbers on the balls
title_tr: Topların numaraları
skills: [game.canvas]
---

# --goal--

Every ball but the cue ball shows its number in small white text, centered on it.

# --goal-tr--

Beyaz top hariç her topun üstünde **numarası** yazsın: küçük, beyaz ve topun tam ortasında.

# --code--

```js
if (b.cue) continue
ctx.fillStyle = 'white'
ctx.font = 'bold 9px sans-serif'
ctx.textAlign = 'center'
ctx.fillText(String(b.number), b.x, b.y + 3)
```

# --meaning--

- `continue` skips the rest of the loop body for the cue ball: no number on it.
- `textAlign = 'center'` centers the text on `x`; `y + 3` puts the middle of the small digits near the ball's centre (text
  sits on its `y`).
- `String(b.number)` turns the number into text.

# --meaning-tr--

- `if (b.cue) continue` → isteka topuysa döngünün geri kalanını **atla**, sıradaki topa geç: onda numara yok.
- `ctx.textAlign = 'center'` → verilen x yazının **ortası** olsun.
- `ctx.fillText(String(b.number), b.x, b.y + 3)` → `String(...)` sayıyı yazıya çevirir. Yazı verilen y'nin **üstüne**
  oturur; `+ 3` küçük rakamların ortasını topun merkezine yaklaştırır.

# --task--

In `draw`, inside the ball loop, under `ctx.fill()`, write the five lines.

# --task-tr--

`draw` içindeki top döngüsünde `ctx.fill()` satırının altına beş satırı yaz. **Çalıştır**: renkli toplarda numaralar
görünmeli.

# --tests--

Every numbered ball should show its number, centered.
tr: Her numaralı top numarasını ortalanmış göstermeli.

```js
$.tick(1)
const texts = $.screen().filter((c) => c.op === 'fillText')
for (let n = 1; n <= 10; n++) assert.include($.texts(), String(n))
const one = texts.find((c) => c.args[0] === '1')
assert.deepEqual(one.args.slice(1), [330, 163])
```

The cue ball should have no number.
tr: İsteka topunda numara olmamalı.

```js
$.tick(1)
assert.notInclude($.texts(), '0')
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
const CUE_START = { x: 130, y: 160 }

let balls // { x, y, vx, vy, color, number, cue }
let cue

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
}

function draw() {
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#78350f'
  ctx.fillRect(LEFT - 12, TOP - 12, RIGHT - LEFT + 24, BOTTOM - TOP + 24)
  ctx.fillStyle = '#15803d'
  ctx.fillRect(LEFT, TOP, RIGHT - LEFT, BOTTOM - TOP)

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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
