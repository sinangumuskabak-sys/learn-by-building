---
title: Move by the velocity
title_tr: Hıza göre ilerle
skills: [game.physics, game.loop]
---

# --goal--

Every frame the ball moves by its velocity: `vx` pixels sideways, `vy` pixels down. That is `update`, called by the
loop before `draw`.

# --goal-tr--

Her oyunun iki işi vardır: **güncelle** (durumu değiştir) ve **çiz** (durumu göster). Çizeni yazdık; şimdi
güncelleyeni yazıyoruz: `update`.

Kural çok basit: her karede topun yerine hızını ekle. `vx` 2 ise top her karede 2 piksel sağa, `vy` -3 ise 3 piksel
**yukarı** gider (canvas'ta `y` aşağı doğru büyüdüğü için eksi `y` yukarı demek).

# --code--

```js
function update() {
  ball.x += ball.vx
  ball.y += ball.vy
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}
```

# --meaning--

- `ball.x += ball.vx` adds the sideways speed to the position; `ball.y += ball.vy` the downward speed.
- The loop now updates first, then draws the new state.

# --meaning-tr--

- `ball.x += ball.vx` → "`ball.x`'e `ball.vx` kadar ekle". `+=` üstüne ekle demek: `a += 2`, `a = a + 2` ile aynı.
- `ball.y += ball.vy` → aynısı dikey yönde.
- `loop` içindeki `update()` → her turda önce durumu değiştir, sonra `draw()` ile yeni durumu çiz.

# --task--

1. Write `update` above `function draw() {`, with an empty line between them.
2. In `loop`, call `update()` above `draw()`.

# --task-tr--

1. `update` fonksiyonunu `function draw() {` satırının **üstüne** yaz; ikisinin arasında bir boş satır kalsın.
2. `loop` fonksiyonunun içinde `draw()` satırının **üstüne** `update()` yaz.
3. **Çalıştır**.

# --predict--

Will the ball move after Run?
- [ ] Yes, it rolls down
- [x] No, it stays still
  Its velocity is `vx: 0, vy: 0`, so each frame adds nothing.
- [ ] Yes, it flies up

# --predict-tr--

Çalıştır'a basınca top hareket edecek mi?
- [ ] Evet, aşağı yuvarlanır
- [x] Hayır, yerinde durur
  Hızı `vx: 0, vy: 0`; her kare yerine sıfır ekleniyor.
- [ ] Evet, yukarı uçar

# --try--

In `newBall`, set `vy: -2` and run: the ball floats up and out of the table (no walls stop it yet). Put `0` back.

# --try-tr--

`newBall` içinde `vy: -2` yap ve çalıştır: top yukarı süzülür ve masadan çıkar (henüz onu durduran duvar yok). Sonra `0`'a geri al.

# --tests--

Each frame should move the ball by its velocity.
tr: Her kare topu hızı kadar taşımalı.

```js
ball = { x: 100, y: 300, vx: 2, vy: -3 }
$.tick(1)
assert.deepEqual(ball, { x: 102, y: 297, vx: 2, vy: -3 })
$.tick(2)
assert.deepEqual(ball, { x: 106, y: 291, vx: 2, vy: -3 })
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const LANE_X = 375 // the launch lane on the right
// The walls, as line segments [x1, y1, x2, y2].
const WALLS = [
  [20, 470, 20, 120], [20, 120, 60, 55], [60, 55, 140, 22], [140, 22, 260, 22], [260, 22, 340, 50], [340, 50, 390, 120],
  [390, 120, 390, 590], [360, 590, 360, 170], [360, 590, 390, 590], // the launch lane
  [20, 470, 128, 530], [360, 470, 272, 530], // the slopes down to the flippers
]

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

function update() {
  ball.x += ball.vx
  ball.y += ball.vy
}

function draw() {
  ctx.fillStyle = '#0c0a09'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#a8a29e'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [x1, y1, x2, y2] of WALLS) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.fillStyle = '#e7e5e4'
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2)
  ctx.fill()
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
