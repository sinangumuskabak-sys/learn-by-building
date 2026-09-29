---
title: Wave, ammo and messages
title_tr: Dalga, cephane ve mesajlar
skills: [game.canvas]
---

# --goal--

The player should see the wave and the ammo left at the top right, a message between waves and one at the end.

# --goal-tr--

Oyuncu her şeyi görsün: sağ üstte **dalga** ve kalan **cephane**, molada `Wave 1 cleared!` (1. dalga temizlendi!),
oyun bitince ortada büyük harflerle `The end` (son) ve altında `Click to play again` (yeniden oynamak için tıkla).

# --code--

```js
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
```

# --meaning--

- Right-aligned at `canvas.width - 10`, the wave and ammo text always ends 10 pixels from the right edge.
- Centered texts use `canvas.width / 2`. The end screen has a big title and a small line under it.

# --meaning-tr--

- `ctx.textAlign = 'right'` → nokta yazının **sağ ucu**; `canvas.width - 10` noktasına yazılan yazı, uzunluğu ne
  olursa olsun sağ kenardan 10 piksel içeride biter.
- `'Wave ' + wave + '  Ammo ' + ammo` → birkaç parçayı art arda birleştirir: `'Wave 1  Ammo 14'`.
- `ctx.textAlign = 'center'` → bundan sonraki yazılar noktaya **ortalanır**; `canvas.width / 2` alanın ortası.
- `if (state === 'between') ...` → yalnız molada.
- `if (state === 'over') { ... }` → yalnız oyun bitince: önce 28 piksel kalın başlık, sonra yazıyı yeniden
  küçültüp altına küçük satır.

# --task--

In `draw`, under the `Score` line, write these lines.

# --task-tr--

`draw` içinde `ctx.fillText('Score ' + score, 10, 22)` satırının hemen altına bu satırları yaz. **Çalıştır**: sağ
üstte dalga ve cephane görünmeli.

# --tests--

The wave and the ammo should be shown at the top right.
tr: Dalga ve cephane sağ üstte görünmeli.

```js
$.tick(1)
assert.include($.texts(), 'Wave 1 Ammo 14')
const call = $.screen().find((c) => c.op === 'fillText' && String(c.args[0]).startsWith('Wave'))
assert.strictEqual(call.args[1], 470)
```

A message should be shown between waves.
tr: Dalgalar arasında bir mesaj görünmeli.

```js
toLaunch = 0
$.tick(1)
assert.include($.texts(), 'Wave 1 cleared!')
```

The end screen should say how to play again.
tr: Bitiş ekranı nasıl yeniden oynanacağını söylemeli.

```js
cities.forEach((c) => (c.alive = false))
$.tick(1)
assert.include($.texts(), 'The end')
assert.include($.texts(), 'Click to play again')
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
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }
let shots // your interceptors on their way: { x, y, tx, ty }
let blasts // explosions: { x, y, age, own }: own ones destroy missiles, impacts on the ground do not
let wave
let toLaunch // enemy missiles still to come in this wave
let launchIn
let ammo
let score
let state // 'playing', 'between' (a pause after a wave) or 'over'
let pause

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
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })
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

  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Score ' + score, 10, 22)
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
