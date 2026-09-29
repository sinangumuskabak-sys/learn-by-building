---
title: Gravity
title_tr: Yerçekimi
skills: [game.physics]
---

# --goal--

A pinball table is tilted towards you, so the ball is always pulled down a little. Each frame, gravity adds a bit to
`vy`.

# --goal-tr--

Pinball masası sana doğru **eğiktir**; top hep aşağıya, paletlere doğru çekilir. Bunu **yerçekimi** ile yapıyoruz:
her karede `vy`'ye küçük bir sayı ekliyoruz.

Yukarı fırlayan topun `vy`'si -16. Her kare 0.12 eklenince -15.88, -15.76... olur: top yavaşlar, bir an durur, sonra
aşağı düşmeye başlar. Havaya atılan bir taş gibi.

# --code--

```js
const GRAVITY = 0.12 // the table is tilted towards you

function update() {
  ball.vy += GRAVITY
  ball.x += ball.vx
  ball.y += ball.vy
}
```

# --meaning--

- `GRAVITY` is how much downward speed the ball gains each frame.
- `ball.vy += GRAVITY` comes first in `update`: first the speed changes, then the ball moves.

# --meaning-tr--

- `const GRAVITY = 0.12` → yerçekimi: top her karede aşağı doğru **0.12 hız kazanır**. Küçük bir sayı, çünkü
  masa hafif eğik.
- `ball.vy += GRAVITY` → `update`'in **ilk** satırı: önce hız değişir, sonra top yeni hızla ilerler.
- Yukarı giden topun `vy`'si eksi; her kare ona 0.12 eklemek onu yavaş yavaş sıfıra, sonra artıya (aşağı) taşır.

# --task--

1. Under `const R = 8` write `GRAVITY`.
2. Make `ball.vy += GRAVITY` the first line of `update`.

# --task-tr--

1. `const R = 8 ...` satırının hemen **altına** `GRAVITY` satırını yaz.
2. `update` fonksiyonunun içinde **en üste**, `ball.x += ball.vx` satırının üstüne `ball.vy += GRAVITY` yaz.
3. **Çalıştır** ve topu izle.

# --predict--

You press Run and do not touch anything. What happens to the ball waiting in the lane?
- [ ] It stays in the lane
- [x] It falls through the bottom of the lane and disappears
  Gravity pulls it down, and the walls do not stop anything yet: they are only pictures.
- [ ] It rolls to the left

# --predict-tr--

Çalıştır'a basıp hiçbir şeye dokunmuyorsun. Kanalda bekleyen topa ne olur?
- [ ] Kanalda durur
- [x] Kanalın dibinden aşağı düşüp kaybolur
  Yerçekimi onu aşağı çekiyor, duvarlar da henüz hiçbir şeyi durdurmuyor: yalnız birer resim.
- [ ] Sola yuvarlanır

# --try--

Set `GRAVITY` to `0.5`: a steep table. Put `0.12` back.

# --try-tr--

`GRAVITY`'yi `0.5` yap: dik bir masa. Sonra `0.12`'ye geri al.

# --tests--

`GRAVITY` should be 0.12.
tr: `GRAVITY` 0.12 olmalı.

```js
assert.strictEqual(GRAVITY, 0.12)
```

Each frame should add `GRAVITY` to `vy` before moving.
tr: Her kare, hareketten önce `vy`'ye `GRAVITY` eklemeli.

```js
ball = { x: 200, y: 300, vx: 0, vy: 0 }
$.tick(1)
assert.closeTo(ball.vy, 0.12, 1e-9)
assert.closeTo(ball.y, 300.12, 1e-9, 'first the speed changes, then the ball moves')
$.tick(1)
assert.closeTo(ball.vy, 0.24, 1e-9)
```

# --solution--

```js
// Pinball, step by step.
// The page already has <canvas id="game" width="400" height="600"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const R = 8 // ball radius
const GRAVITY = 0.12 // the table is tilted towards you
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
  ball.vy += GRAVITY
  ball.x += ball.vx
  ball.y += ball.vy
}

function launch() {
  ball.vy = -16
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})

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
