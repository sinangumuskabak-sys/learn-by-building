---
title: Roll
title_tr: Yuvarlan
skills: [game.physics, game.loop]
---

# --goal--

Every frame each ball moves by its velocity. `step` is one step of the physics; `update` runs it, and the loop calls
`update` before `draw`.

# --goal-tr--

Her karede her top **hızı kadar** ilerlesin: `x`'e `vx`, `y`'ye `vy` eklenir. Bu, fiziğin **bir adımı**: `step`
(adım). Oyunun her karedeki güncellemesi `update` onu çağıracak; döngü de çizmeden önce `update`'i çağıracak.

# --code--

```js
function step() {
  for (const b of balls) {
    b.x += b.vx
    b.y += b.vy
  }
}

function update() {
  step()
}

  update()
```

# --meaning--

- `step` adds each ball's velocity to its position.
- `loop` now calls `update()` before `draw()`.

# --meaning-tr--

- `function step()` → her top için `b.x += b.vx` ve `b.y += b.vy`: hızı kadar ilerle. Duran topların hızı 0; yerinde
  kalırlar.
- `function update()` → karedeki bütün güncelleme; şimdilik yalnız `step()`. İleride sürtünme ve daha fazlası gelecek.
- `loop` içinde `update()` → her karede önce güncelle, sonra çiz.

# --task--

1. Above the key listener write `step` and `update`, each followed by an empty line.
2. In `loop`, call `update()` before `draw()`. Run and press Space.

# --task-tr--

1. Tuş dinleyicisinin (`document.addEventListener('keydown', ...)`) **üstüne** `step` ve `update` fonksiyonlarını yaz;
   her birinin altında bir boş satır kalsın.
2. `loop` içinde `draw()`'un **üstüne** `update()` yaz.
3. **Çalıştır** ve Boşluk'a bas.

# --predict--

What will the cue ball do after Space?
- [ ] Roll, slow down and stop
- [x] Roll at the same speed forever, off the table
  Nothing slows it down and nothing stops it at the cushion yet.
- [ ] Hit the triangle and scatter it

# --predict-tr--

Boşluk'tan sonra isteka topu ne yapacak?
- [ ] Yuvarlanıp yavaşlayacak ve duracak
- [x] Hep aynı hızla gidip masadan çıkacak
  Henüz onu yavaşlatan da bantta durduran da yok.
- [ ] Üçgene çarpıp dağıtacak

# --tests--

After a shot, the cue ball should move by its velocity each frame.
tr: Vuruştan sonra isteka topu her karede hızı kadar ilerlemeli.

```js
shoot()
$.tick(1)
assert.strictEqual(cue.x, 138)
$.tick(1)
assert.strictEqual(cue.x, 146)
assert.strictEqual(cue.y, 160)
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
