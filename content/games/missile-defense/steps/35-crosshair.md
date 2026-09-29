---
title: "Build it yourself: a crosshair"
title_tr: "Kendin yap: nişangâh"
skills: [game.input, game.canvas]
---

# --goal--

Your game, your rules. Aiming is easier with a **crosshair**: show one wherever the pointer is over the sky.

# --goal-tr--

Oyun senin, kurallar da! Nişan almak bir **nişangâh** ile çok daha kolay olur: fare gökyüzünün neresindeyse orada
küçük bir artı işareti (ya da küçük bir daire) görünsün ve fareyle birlikte gezsin.

Bu adımda kod verilmiyor. Bildiklerin yetiyor: bir olay dinleyicisi, sayfa pikselinden canvas pikseline çevirme,
bir değişken ve birkaç çizim komutu. Kontroller çalıştığında yeşile döner.

# --task--

Keep the pointer position (in canvas pixels, also when the canvas is shown at another size) and draw a crosshair
there every frame: two short lines crossing at the pointer, or a small circle centered on it.

# --task-tr--

- Fare canvas'ın üstünde hareket ettikçe yerini bir değişkende tut (canvas pikseline çevirerek; canvas başka bir
  boyda gösterilse de doğru olsun).
- `draw` her karede o noktaya bir nişangâh çizsin: noktada kesişen iki kısa çizgi **ya da** noktaya ortalanmış küçük
  bir daire.
- Nişangâh fareyle birlikte gezsin.

Takılırsan Maymun'a sor ya da ipucu kutusuna bak.

# --hint--

Add a `pointermove` listener that stores the pointer in a variable, converted like the click listener does. In `draw`,
if the variable is set, draw two short lines through it with `moveTo`/`lineTo` (or a small `arc`).

# --hint-tr--

Bir `pointermove` dinleyicisi ekle ve fare konumunu bir değişkene yaz (tıklama dinleyicisindeki gibi çevirerek):
`let aim` ve `aim = { x: ..., y: ... }`. `draw` içinde `if (aim) { ... }` ile, `moveTo`/`lineTo` kullanarak
`aim`'den geçen biri yatay biri dikey iki kısa çizgi çiz (ya da küçük bir `arc`).

# --tests--

A crosshair should be drawn where the pointer is.
tr: Farenin olduğu yerde bir nişangâh çizilmeli.

```js
const cross = (x, y) => {
  const calls = $.screen()
  const circle = calls.some((c) => c.op === 'arc' && c.args[0] === x && c.args[1] === y)
  const pen = calls.filter((c) => c.op === 'moveTo' || c.op === 'lineTo')
  const vertical = pen.some((c) => c.args[0] === x && c.args[1] !== y && Math.abs(c.args[1] - y) < 40)
  const horizontal = pen.some((c) => c.args[1] === y && c.args[0] !== x && Math.abs(c.args[0] - x) < 40)
  return circle || (vertical && horizontal)
}

$.move(100, 120)
$.tick()
assert.isTrue(cross(100, 120), 'draw two short lines crossing at the pointer, or a small circle centered on it')
```

The crosshair should follow the pointer.
tr: Nişangâh fareyi takip etmeli.

```js
const cross = (x, y) => {
  const calls = $.screen()
  const circle = calls.some((c) => c.op === 'arc' && c.args[0] === x && c.args[1] === y)
  const pen = calls.filter((c) => c.op === 'moveTo' || c.op === 'lineTo')
  const vertical = pen.some((c) => c.args[0] === x && c.args[1] !== y && Math.abs(c.args[1] - y) < 40)
  const horizontal = pen.some((c) => c.args[1] === y && c.args[0] !== x && Math.abs(c.args[0] - x) < 40)
  return circle || (vertical && horizontal)
}

$.move(100, 120)
$.tick()
$.move(300, 200)
$.tick()
assert.isTrue(cross(300, 200))
```

The pointer should be converted to canvas pixels when the canvas is shown at another size.
tr: Canvas başka bir boyda gösterildiğinde fare konumu canvas pikseline çevrilmeli.

```js
const cross = (x, y) => {
  const calls = $.screen()
  const circle = calls.some((c) => c.op === 'arc' && c.args[0] === x && c.args[1] === y)
  const pen = calls.filter((c) => c.op === 'moveTo' || c.op === 'lineTo')
  const vertical = pen.some((c) => c.args[0] === x && c.args[1] !== y && Math.abs(c.args[1] - y) < 40)
  const horizontal = pen.some((c) => c.args[1] === y && c.args[0] !== x && Math.abs(c.args[0] - x) < 40)
  return circle || (vertical && horizontal)
}

$.canvas.getBoundingClientRect = () => ({ left: 20, top: 10, x: 20, y: 10, width: 960, height: 800, right: 980, bottom: 810 })
$.move(20 + 200, 10 + 150)
$.tick()
assert.isTrue(cross(100, 75))
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
const SHOT_SPEED = 7
const BLAST = 32 // the biggest radius of an explosion
const BLAST_FRAMES = 50 // how long an explosion lasts, growing then shrinking

let cities
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed, split }
let shots // your interceptors on their way: { x, y, tx, ty }
let blasts // explosions: { x, y, age, own }: own ones destroy missiles, impacts on the ground do not
let wave
let toLaunch // enemy missiles still to come in this wave
let launchIn
let ammo
let score
let state // 'playing', 'between' (a pause after a wave) or 'over'
let pause
let best = Number(localStorage.getItem('missile-best')) || 0
let aim // where the pointer is, for the crosshair

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  wave = 0
  score = 0
  nextWave()
}

function nextWave() {
  wave += 1
  toLaunch = 8 + wave * 2
  launchIn = 30
  ammo = 12 + wave * 2
  state = 'playing'
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch(sx = Math.random() * canvas.width, sy = 0) {
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  const split = wave >= 3 && Math.random() < 0.25
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15, split })
}

function fire(tx, ty) {
  if (state !== 'playing' || ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
  shots.push({ x: BASE.x, y: BASE.y, tx, ty })
}

canvas.addEventListener('pointerdown', (event) => {
  if (state === 'over') {
    reset()
    return
  }
  const rect = canvas.getBoundingClientRect()
  fire(((event.clientX - rect.left) * canvas.width) / rect.width, ((event.clientY - rect.top) * canvas.height) / rect.height)
})
document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && state === 'over') {
    event.preventDefault()
    reset()
  }
})
canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect()
  aim = { x: ((event.clientX - rect.left) * canvas.width) / rect.width, y: ((event.clientY - rect.top) * canvas.height) / rect.height }
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

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
}

function update() {
  if (state === 'over') return
  if (state === 'between') {
    pause -= 1
    if (pause <= 0) nextWave()
    return
  }

  if (toLaunch > 0) {
    launchIn -= 1
    if (launchIn <= 0) {
      launch()
      toLaunch -= 1
      launchIn = Math.max(20, 70 - wave * 6)
    }
  }

  for (const s of shots) {
    if (stepTowards(s, SHOT_SPEED)) {
      s.done = true
      blasts.push({ x: s.x, y: s.y, age: 0, own: true })
    }
  }
  shots = shots.filter((s) => !s.done)

  for (const b of blasts) b.age += 1
  blasts = blasts.filter((b) => b.age < BLAST_FRAMES)

  for (const m of incoming) {
    // Caught by an explosion: it explodes too, which can catch the missiles next to it.
    if (blasts.some((b) => b.own && Math.hypot(m.x - b.x, m.y - b.y) <= radius(b))) {
      m.done = true
      score += 25
      blasts.push({ x: m.x, y: m.y, age: 0, own: true })
      continue
    }
    // Some missiles split into three halfway down.
    if (m.split && m.y > 150) {
      m.split = false
      for (let i = 0; i < 2; i++) launch(m.x, m.y)
    }
    if (stepTowards(m, m.speed)) {
      m.done = true
      blasts.push({ x: m.x, y: m.y, age: 0, own: false })
      const city = cities.find((c) => c.alive && Math.abs(c.x - m.x) < 20)
      if (city) city.alive = false
    }
  }
  incoming = incoming.filter((m) => !m.done)

  if (!cities.some((c) => c.alive)) {
    state = 'over'
    if (score > best) {
      best = score
      localStorage.setItem('missile-best', best)
    }
    return
  }
  if (toLaunch === 0 && incoming.length === 0 && blasts.length === 0) {
    // Bonus for every city still standing and every interceptor left.
    score += cities.filter((c) => c.alive).length * 100 + ammo * 5
    state = 'between'
    pause = 90
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
  ctx.strokeStyle = '#a3e635'
  for (const s of shots) {
    ctx.beginPath()
    ctx.moveTo(BASE.x, BASE.y)
    ctx.lineTo(s.x, s.y)
    ctx.stroke()
  }
  for (const b of blasts) {
    ctx.fillStyle = b.age % 6 < 3 ? '#fde047' : '#fb923c'
    ctx.beginPath()
    ctx.arc(b.x, b.y, radius(b), 0, Math.PI * 2)
    ctx.fill()
  }
  if (aim) {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(aim.x - 8, aim.y)
    ctx.lineTo(aim.x + 8, aim.y)
    ctx.moveTo(aim.x, aim.y - 8)
    ctx.lineTo(aim.x, aim.y + 8)
    ctx.stroke()
  }

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score + '  Best ' + best, 10, 22)
  ctx.textAlign = 'right'
  ctx.fillText('Wave ' + wave + '  Ammo ' + ammo, canvas.width - 10, 22)
  ctx.textAlign = 'center'
  if (state === 'between') ctx.fillText('Wave ' + wave + ' cleared!', canvas.width / 2, 180)
  if (state === 'over') {
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('The end', canvas.width / 2, 180)
    ctx.font = '16px sans-serif'
    ctx.fillText('Click to play again', canvas.width / 2, 210)
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
