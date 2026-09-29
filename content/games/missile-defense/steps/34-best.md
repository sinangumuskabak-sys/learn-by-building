---
title: A high score
title_tr: Rekor
skills: [game.state]
---

# --goal--

The best score is saved in the browser's `localStorage` when a game ends, so it survives a page reload, and it is shown
next to the score.

# --goal-tr--

Son dokunuş: bir **rekor**. Oyun bittiğinde puan rekordan yüksekse yeni rekor olur ve tarayıcıya **kaydedilir**;
sayfayı yenilesen de kaybolmaz. Rekor, puanın yanında görünür.

Tarayıcının küçük bir kalıcı defteri var: `localStorage`. İçine bir ad altında yazı saklanır.

# --code--

```js
let best = Number(localStorage.getItem('missile-best')) || 0

    if (score > best) {
      best = score
      localStorage.setItem('missile-best', best)
    }

  ctx.fillText('Score ' + score + '  Best ' + best, 10, 22)
```

# --meaning--

- `localStorage.getItem` reads the saved text (or `null`); `Number` turns it into a number; `|| 0` covers the first
  game.
- When the game ends with a higher score, `best` is updated and saved with `setItem`.

# --meaning-tr--

- `localStorage.getItem('missile-best')` → `'missile-best'` adıyla saklanan yazıyı okur. Hiç kaydedilmediyse `null`
  (hiçbir şey) verir.
- `Number(...)` → yazıyı sayıya çevirir (`'4200'` → `4200`).
- `|| 0` → soldaki değer boş ya da 0 gibi "yanlış" sayılırsa 0 kullan. İlk oyunda rekor 0 olur.
- `if (score > best)` → oyun bittiğinde puan rekordan yüksekse: `best = score` ve
  `localStorage.setItem('missile-best', best)` ile kaydet.
- Puan satırı artık rekoru da yazar: `'Score 900  Best 4200'`.

# --task--

1. Under `let pause` write the `best` line.
2. In `update`, in the lost-cities block, write the `if (score > best)` block between `state = 'over'` and `return`.
3. In `draw`, add `+ '  Best ' + best` to the score text.

# --task-tr--

1. `let pause` satırının altına `best` satırını yaz.
2. `update` içindeki şehir kontrolü bloğunda `state = 'over'` ile `return` satırlarının **arasına** `if (score > best)`
   bloğunu yaz.
3. `draw` içinde puan yazısına `+ '  Best ' + best` ekle (tırnak içinde iki boşluk var).
4. **Çalıştır** ve bir oyun kaybet: rekorun görünmeli. Sayfayı yenile: rekor durmalı. Oyun tamam!

# --tests--

The best score should be saved when the game ends.
tr: Rekor oyun bitince kaydedilmeli.

```js
score = 4200
cities.forEach((c) => (c.alive = false))
$.tick(1)
assert.strictEqual(best, 4200)
assert.strictEqual(localStorage.getItem('missile-best'), '4200')
$.click(240, 100)
$.tick(1)
assert.include($.texts(), 'Score 0 Best 4200')
```

A lower score should not replace the best one.
tr: Daha düşük bir puan rekorun yerini almamalı.

```js
best = 5000
score = 100
cities.forEach((c) => (c.alive = false))
$.tick(1)
assert.strictEqual(best, 5000)
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
