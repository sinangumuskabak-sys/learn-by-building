---
title: Smoke trails
title_tr: Duman izleri
skills: [game.canvas]
---

# --goal--

Each missile is drawn as its smoke trail: a red line from where it started to where it is now.

# --goal-tr--

Füzeleri görelim. Her füzeyi, arkasında bıraktığı **duman izi** olarak çizeceğiz: başladığı yerden şu anki yerine
kırmızı bir çizgi. Çizgi uzadıkça füzenin nereden geldiği ve nereye gittiği görülür.

# --code--

```js
ctx.lineWidth = 2
ctx.strokeStyle = '#f87171'
for (const m of incoming) {
  ctx.beginPath()
  ctx.moveTo(m.sx, m.sy)
  ctx.lineTo(m.x, m.y)
  ctx.stroke()
}
```

# --meaning--

- `lineWidth` and `strokeStyle` are the thickness and color of lines (`fillStyle` is for filled shapes).
- `beginPath` starts a new line, `moveTo` puts the pen at the start, `lineTo` draws to the missile, `stroke` paints it.

# --meaning-tr--

- `ctx.lineWidth = 2` → çizgi **kalınlığı** 2 piksel.
- `ctx.strokeStyle = '#f87171'` → çizgi **rengi** (içi dolu şekiller için `fillStyle`, çizgiler için `strokeStyle`).
- `ctx.beginPath()` → yeni bir çizgiye başla.
- `ctx.moveTo(m.sx, m.sy)` → kalemi kaldırıp başlangıç noktasına koy.
- `ctx.lineTo(m.x, m.y)` → oradan füzenin şu anki yerine bir çizgi çek.
- `ctx.stroke()` → çizgiyi boya.

# --task--

In `draw`, under the base's `fillRect` line, leave an empty line and write the trail lines.

# --task-tr--

`draw` içinde üssü çizen `ctx.fillRect(BASE.x - 12, ...)` satırının altına bir boş satır bırak ve iz satırlarını
yaz. **Çalıştır** ve bekle: kırmızı izler gökten aşağı süzülmeli.

# --predict--

What happens when a missile reaches a city?
- [ ] The city is destroyed
- [x] The missile stops on the ground and its trail stays there
  `stepTowards` just keeps it on its target; nothing destroys the city yet.
- [ ] The missile bounces

# --predict-tr--

Bir füze bir şehre ulaşınca ne olur?
- [ ] Şehir yıkılır
- [x] Füze zeminde durur ve izi orada kalır
  `stepTowards` onu hedefinde tutar; şehri yıkan bir kod henüz yok.
- [ ] Füze seker

# --tests--

The smoke trail should be drawn from the start to the missile.
tr: Duman izi başlangıçtan füzeye çizilmeli.

```js
toLaunch = 0
incoming = [{ sx: 100, sy: 0, x: 100, y: 50, tx: 100, ty: 370, speed: 0.8 }]
$.tick(1)
const calls = $.screen()
assert.isTrue(calls.some((c) => c.op === 'moveTo' && c.args[0] === 100 && c.args[1] === 0))
assert.isTrue(calls.some((c) => c.op === 'lineTo' && c.args[0] === 100 && Math.abs(c.args[1] - 50.8) < 1e-9))
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
let toLaunch // enemy missiles still to come in this wave
let launchIn

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
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
    stepTowards(m, m.speed)
  }
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
