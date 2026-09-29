---
title: Click the sky
title_tr: Gökyüzüne tıkla
skills: [game.input]
---

# --goal--

A click (or tap) on the canvas fires at that point. The page position is converted to canvas pixels, even when the
canvas is shown at another size.

# --goal-tr--

Şimdi ateşi oyuncuya bağlayalım: canvas'a **tıklamak** (telefonda dokunmak) o noktaya ateş etsin.

Tıklama olayı bize farenin **sayfadaki** yerini verir. Canvas sayfada bir yerde durur ve ekranda büyütülmüş ya da
küçültülmüş gösterilebilir; bu yüzden konumu **canvas piksellerine** çeviriyoruz.

# --code--

```js
canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})
```

# --meaning--

- `pointerdown` fires when the canvas is clicked or touched.
- `rect` is the box the canvas is shown in. `event.clientX - rect.left` is the distance from its left edge.
- Multiplying by `canvas.width` and dividing by `rect.width` fixes the scale when the canvas is shown bigger or smaller.

# --meaning-tr--

- `canvas.addEventListener('pointerdown', (event) => { ... })` → canvas'a basıldığında (tıklama ya da dokunma)
  içini çalıştır. `event` olayın bilgilerini taşır.
- `canvas.getBoundingClientRect()` → canvas'ın ekranda durduğu kutu: `rect.left`, `rect.top` sol üst köşesi,
  `rect.width`, `rect.height` ekranda göründüğü boyu.
- `event.clientX - rect.left` → farenin canvas'ın sol kenarından **uzaklığı**.
- `* canvas.width / rect.width` → ölçeği düzeltir: canvas iki kat büyük gösteriliyorsa uzaklığı yarıya indirir.
  Normal boyda oran 1'dir. `y` için aynısı `clientY`, `top` ve `height` ile.
- İki sonuç doğrudan `fire(...)`'a verilir: tıklanan nokta, canvas pikseliyle.

# --task--

Write the listener above the `// Move a point ...` comment, followed by an empty line.

# --task-tr--

`// Move a point ...` yorumunun **üstüne** dinleyiciyi yaz; altında bir boş satır kalsın. Uzun `fire(...)` satırını
tek satırda yaz. **Çalıştır**: kontroller yeşil olmalı (önleyiciler bir sonraki adımda uçacak).

# --hint--

Count the parentheses in the long `fire(...)` line: each of the two arguments is `((... - ...) * ...) / ...`.

# --hint-tr--

Uzun `fire(...)` satırındaki parantezleri say: iki bilginin her biri `((... - ...) * ...) / ...` biçiminde.

# --tests--

A click should fire at that point.
tr: Bir tıklama o noktaya ateş etmeli.

```js
$.click(240, 100)
assert.deepEqual(shots, [{ x: 240, y: 356, tx: 240, ty: 100 }])
```

Clicks should be scaled when the canvas is displayed at another size.
tr: Canvas başka bir boyutta gösterildiğinde tıklamalar ölçeklenmeli.

```js
$.canvas.getBoundingClientRect = () => ({ left: 20, top: 10, x: 20, y: 10, width: 960, height: 800, right: 980, bottom: 810 })
$.click(20 + 480, 10 + 400)
assert.lengthOf(shots, 1)
assert.deepEqual([shots[0].tx, shots[0].ty], [240, 200])
```

# --solution--

```js
// Missile defense, step by step.
// The page already has <canvas id="game" width="480" height="400"></canvas>.
// Write your code below.
const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const GROUND = 370
const BASE = { x: 240, y: GROUND - 14 } // where your interceptors start
const CITY_XS = [50, 110, 170, 310, 370, 430]

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
let shots // your interceptors on their way: { x, y, tx, ty }
let toLaunch // enemy missiles still to come in this wave
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  toLaunch = 20
  launchIn = 30
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
}

function fire(tx, ty) {
  if (ty > BASE.y - 10) return
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})

// Move a point `speed` pixels towards its target; true when it has arrived.
function stepTowards(m, speed) {
  const dx = m.tx - m.x
  const dy = m.ty - m.y
  const distance = Math.hypot(dx, dy)
  if (distance <= speed) {
    m.x = m.tx
    m.y = m.ty
    return true
  }
  m.x += (dx / distance) * speed
  m.y += (dy / distance) * speed
  return false
}

function update() {
  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = 60
    }
  }

  for (const m of incoming) {
    if (stepTowards(m, m.speed)) {
      m.done = true
      const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
      if (city) city.alive = false
    }
  }
  incoming = incoming.filter((m) => !m.done)
}

function draw() {
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#854d0e'
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND)

  for (const c of cities) {
    ctx.fillStyle = c.alive ? '#38bdf8' : '#44403c'
    ctx.fillRect(c.x - 16, GROUND - (c.alive ? 14 : 4), 32, c.alive ? 14 : 4)
  }
  ctx.fillStyle = '#a3e635'
  ctx.fillRect(BASE.x - 12, BASE.y, 24, 14)

  ctx.lineWidth = 2
  ctx.strokeStyle = '#f87171'
  for (const m of incoming) {
    ctx.beginPath()
    ctx.moveTo(m.sx, m.sy)
    ctx.lineTo(m.x, m.y)
    ctx.stroke()
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
