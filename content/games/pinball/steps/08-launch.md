---
title: Launch with Space
title_tr: Boşlukla fırlat
skills: [game.input]
---

# --goal--

Space (or the Down arrow) launches the ball: it gets a speed of 16 pixels a frame upwards.

# --goal-tr--

Gerçek pinball'da yayı çekip bırakırsın ve top kanaldan yukarı fırlar. Bizde şimdilik **Boşluk** (ya da Aşağı ok)
tuşu yapacak: topa bir anda **yukarı doğru hız** vereceğiz. Hareketi zaten `update` yapıyor; bize yalnız hızı
değiştirmek kalıyor.

# --code--

```js
function launch() {
  ball.vy = -16
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    launch()
  }
})
```

# --meaning--

- `launch()` sets `vy` to -16: sixteen pixels up every frame.
- `addEventListener('keydown', ...)` runs the arrow function each time a key goes down; `event.key` is its name.
- `' '` is Space; `||` means "or". `preventDefault()` stops the browser from scrolling the page with these keys.

# --meaning-tr--

- `function launch() {` → fırlatma: `ball.vy = -16`, yani her karede 16 piksel **yukarı**.
- `document.addEventListener('keydown', (event) => { ... })` → "sayfada bir tuşa **basılınca** süslü parantez
  içini çalıştır". Buna **olay dinlemek** (event listener) denir; kapı zili gibi, çalınca ne yapılacağını önceden
  söylersin. `(event) => { }` adı olmayan kısa bir fonksiyon; `event` basılan tuşun bilgisini taşır.
- `event.key` → basılan tuşun adı. Boşluk `' '` (tırnak içinde bir boşluk), Aşağı ok `'ArrowDown'`.
- `||` → "veya": iki tuştan biri basılırsa.
- `event.preventDefault()` → tarayıcının kendi davranışını engeller. Boşluk ve Aşağı ok normalde sayfayı aşağı
  kaydırır; oyun oynarken bunu istemeyiz.

# --task--

Write `launch` and the key listener above `function draw() {`, then Run, click the game and press Space.

# --task-tr--

1. `launch` fonksiyonunu ve tuş dinleyicisini `function draw() {` satırının **üstüne** yaz (`update`'in altına);
   aralarında birer boş satır bırak.
2. **Çalıştır**, oyuna bir kez tıkla (klavye oyuna gitsin) ve **Boşluk**'a bas.

# --predict--

You press Space. What does the ball do?
- [ ] It goes up the lane and bounces around the table
- [x] It shoots straight up and leaves the table through the top
  Nothing slows it down and no wall stops it yet.
- [ ] It goes up and falls back down

# --predict-tr--

Boşluk'a basıyorsun. Top ne yapar?
- [ ] Kanaldan çıkıp masada sekerek dolaşır
- [x] Dümdüz yukarı fırlar ve tepeden masanın dışına çıkar
  Onu yavaşlatan bir şey de, durduran bir duvar da henüz yok.
- [ ] Yukarı çıkar ve geri düşer

# --hint--

Space is `' '`: a space between two quotes. `''` with nothing between is not the same.

# --hint-tr--

Boşluk `' '` diye yazılır: iki tırnak arasında bir boşluk. Arası boş `''` aynı şey değil.

# --tests--

Space should give the ball a speed of 16 up.
tr: Boşluk topa yukarı doğru 16 hız vermeli.

```js
$.press(' ')
assert.strictEqual(ball.vy, -16)
$.tick(1)
assert.strictEqual(ball.y, 554, 'and it moves up')
```

The Down arrow should launch too; other keys should not.
tr: Aşağı ok da fırlatmalı; başka tuşlar fırlatmamalı.

```js
$.press('a')
assert.strictEqual(ball.vy, 0, 'other keys do nothing')
$.press('ArrowDown')
assert.strictEqual(ball.vy, -16)
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
