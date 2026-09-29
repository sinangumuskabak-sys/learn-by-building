---
title: A ball in the lane
title_tr: Kanalda bir top
skills: [game.state]
---

# --goal--

The ball is data: where it is (`x`, `y`) and how fast it goes (`vx`, `vy`). `newBall()` puts a fresh ball at the
bottom of the launch lane.

# --goal-tr--

Şimdi top. Ama önce çizmeyeceğiz; önce topu **bilgi** olarak kuracağız: nerede (`x`, `y`) ve ne kadar hızlı gidiyor
(`vx`, `vy`). Oyun yazmanın temel fikri bu: **durum** (şu an ne var) ayrı, **çizim** (onu göstermek) ayrı.

Her yeni top aynı yerden başlar: sağdaki **fırlatma kanalının** dibinden. Bunu yapan küçük bir fonksiyon yazıyoruz:
`newBall()` (yeni top). Bu adımda ekranda bir şey değişmeyecek.

# --code--

```js
const R = 8 // ball radius
const LANE_X = 375 // the launch lane on the right

let ball // { x, y, vx, vy }

function newBall() {
  ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }
}

newBall()
requestAnimationFrame(loop)
```

# --meaning--

- `R` is the ball's radius; `LANE_X` is the middle of the launch lane (between the walls at 360 and 390).
- `ball` is declared empty; `newBall()` fills it with an object.
- `vx` and `vy` are the velocity: how many pixels the ball moves each frame, sideways and down. 0 means it rests.
- `newBall()` at the bottom makes the first ball before the loop starts.

# --meaning-tr--

- `const R = 8` → topun **yarıçapı** (radius): 8 piksel.
- `const LANE_X = 375` → fırlatma kanalının ortası. Kanalın duvarları `x = 360` ve `x = 390`'da; ortası 375.
- `let ball` → top için bir değişken. Değeri yok; değerini `newBall` verecek. Yanındaki yorum içinde ne olacağını
  söylüyor.
- `ball = { x: LANE_X, y: 570, vx: 0, vy: 0 }` → bir **nesne**: dört bilgi tek pakette.
  - `x`, `y` → topun merkezi: kanalın dibi.
  - `vx`, `vy` → **hız** (velocity): top her karede kaç piksel sağa (`vx`) ve kaç piksel aşağı (`vy`) gidecek.
    İkisi de 0: top duruyor.
- En alttaki `newBall()` → döngü başlamadan ilk topu kurar.

# --task--

1. Above the `// The walls...` comment write `R` and `LANE_X`.
2. Under the `WALLS` list write `let ball` and `newBall`.
3. At the bottom, write `newBall()` right above `requestAnimationFrame(loop)`.

# --task-tr--

1. `// The walls, as line segments...` yorum satırının hemen **üstüne** `R` ve `LANE_X` satırlarını yaz.
2. `WALLS` listesinin kapanan `]` satırının altına bir boş satır bırak; `let ball` satırını, bir boş satır daha
   bırakıp `newBall` fonksiyonunu yaz.
3. En alttaki `requestAnimationFrame(loop)` satırının hemen **üstüne** `newBall()` yaz.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

You made a ball. What do you see after Run?
- [ ] A white ball in the lane
- [x] The same table, no ball
  The ball exists only as data; nothing draws it yet.
- [ ] An error

# --predict-tr--

Bir top yaptın. Çalıştır'a basınca ne görürsün?
- [ ] Kanalda beyaz bir top
- [x] Aynı masa, top yok
  Top şimdilik yalnız bilgi olarak var; onu çizen bir satır henüz yok.
- [ ] Bir hata

# --tests--

`R` should be 8 and `LANE_X` 375.
tr: `R` 8, `LANE_X` 375 olmalı.

```js
assert.strictEqual(R, 8)
assert.strictEqual(LANE_X, 375)
```

A new ball should wait at the bottom of the launch lane, not moving.
tr: Yeni top fırlatma kanalının dibinde, hareketsiz beklemeli.

```js
assert.deepEqual(ball, { x: 375, y: 570, vx: 0, vy: 0 })
ball = { x: 1, y: 2, vx: 3, vy: 4 }
newBall()
assert.deepEqual(ball, { x: 375, y: 570, vx: 0, vy: 0 })
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

newBall()
requestAnimationFrame(loop)
```
