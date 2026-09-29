---
title: Turn the aim
title_tr: Nişanı çevir
skills: [game.input]
---

# --goal--

The left and right arrows turn the aim a little each press (0.035 radians, about 2 degrees). The browser's own action for
these keys (scrolling) is stopped.

# --goal-tr--

Sol ve sağ ok tuşları nişanı her basışta **biraz** çevirsin: 0.035 radyan, yaklaşık 2 derece. Tuşu basılı tutarsan
tarayıcı basışı tekrarlar ve çizgi dönmeye devam eder.

Ok tuşları normalde sayfayı kaydırır; oyunun kullandığı tuşlarda bunu durduracağız.

# --code--

```js
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
  else return
  event.preventDefault()
})
```

# --meaning--

- Left makes the angle smaller (turning up from the right, counterclockwise on screen), right makes it bigger.
- Any other key: `return` at once. Only the game's keys reach `preventDefault()`.

# --meaning-tr--

- `document.addEventListener('keydown', (event) => { ... })` → bir tuşa basıldığında çalışır; `event.key` tuşun adı.
- `if (event.key === 'ArrowLeft') aim -= 0.035` → sol ok açıyı **küçültür**: çizgi saat yönünün tersine döner.
- `else if (event.key === 'ArrowRight') aim += 0.035` → sağ ok büyütür: saat yönünde.
- `else return` → başka bir tuşsa hemen çık.
- `event.preventDefault()` → tarayıcının bu tuş için yapacağı kendi işini (sayfayı kaydırmak) engeller.

# --task--

Above `function draw() {` write the listener, with an empty line after it. Run, click the game and use the arrows.

# --task-tr--

`function draw() {` satırının **üstüne** dinleyiciyi yaz; altında bir boş satır kalsın. **Çalıştır**, oyuna tıkla ve sol
ile sağ oklarla çizgiyi çevir.

# --tests--

The arrows should turn the aim by 0.035 each press.
tr: Oklar nişanı her basışta 0.035 çevirmeli.

```js
$.press('ArrowRight')
$.press('ArrowRight')
assert.closeTo(aim, 0.07, 1e-9)
$.press('ArrowLeft')
assert.closeTo(aim, 0.035, 1e-9)
$.press('a')
assert.closeTo(aim, 0.035, 1e-9, 'other keys do nothing')
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
let aim // angle of the shot, in radians

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
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') aim -= 0.035
  else if (event.key === 'ArrowRight') aim += 0.035
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
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
