---
title: The end of a wave
title_tr: Dalganın sonu
skills: [game.state]
---

# --goal--

A wave is over when nothing is left to launch, nothing is in the air and no explosion is still going. You get a bonus,
a short pause, then the next wave.

# --goal-tr--

Bir dalga ne zaman biter? Fırlatılacak füze kalmadığında, gökte füze kalmadığında **ve** hiçbir patlama sürmediğinde.
O anda sana bir **bonus** verilecek: ayakta kalan her şehir için 100, harcamadığın her önleyici için 5 puan. Sonra kısa
bir **mola** ve bir sonraki dalga.

Oyunun hangi aşamada olduğunu bir değişkende tutuyoruz: `state` (durum). Şimdilik iki değeri var: `'playing'` (oyunda)
ve `'between'` (dalgalar arası mola).

# --code--

```js
let state // 'playing', 'between' (a pause after a wave) or 'over'
let pause

  state = 'playing'

  if (state === 'between') {
    pause -= 1
    if (pause <= 0) nextWave()
    return
  }

  if (toLaunch === 0 && incoming.length === 0 && blasts.length === 0) {
    // Bonus for every city still standing and every interceptor left.
    score += cities.filter((c) => c.alive).length * 100 + ammo * 5
    state = 'between'
    pause = 90
  }
```

# --meaning--

- `nextWave` sets the state to `'playing'`.
- Between waves, `update` only counts `pause` down; at 0 the next wave starts. `return` skips everything else.
- At the end of `update`: when the wave is finished, add the bonus, switch to `'between'` and pause 90 frames.

# --meaning-tr--

- `let state` → oyunun durumu; `let pause` → molada kaç kare kaldı.
- `nextWave` içinde `state = 'playing'` → her dalga oyun durumunda başlar.
- `update`'in başında: moladaysak `pause`'u bir azalt; 0'a inince `nextWave()`. `return` fonksiyonun geri kalanını
  atlar: molada füze fırlatılmaz, hiçbir şey hareket etmez.
- `update`'in sonunda: `toLaunch === 0 && incoming.length === 0 && blasts.length === 0` → üç koşul birden: dalga bitti.
- `cities.filter((c) => c.alive).length * 100` → ayaktaki şehir sayısı × 100. `ammo * 5` → kalan önleyici × 5.
- `state = 'between'`, `pause = 90` → 90 karelik (1.5 saniye) mola başlar.

# --task--

1. Under `let score` write `let state` (with its comment) and `let pause`.
2. At the end of `nextWave`, write `state = 'playing'`.
3. At the very top of `update`, write the `between` block, followed by an empty line.
4. At the end of `update`, under `incoming = incoming.filter(...)`, leave an empty line and write the wave-end block.

# --task-tr--

1. `let score` satırının altına `let state` (yorumuyla) ve `let pause` yaz.
2. `nextWave` fonksiyonunun sonuna, `ammo = ...` satırının altına `state = 'playing'` yaz.
3. `update` fonksiyonunun **en başına** `between` bloğunu yaz; altında bir boş satır kalsın.
4. `update`'in sonunda `incoming = incoming.filter(...)` satırının altına bir boş satır bırak ve dalga sonu bloğunu yaz.
5. **Çalıştır** ve bir dalgayı bitir: kısa bir moladan sonra yeni füzeler gelmeli.

# --predict--

All your cities are destroyed in the middle of a wave. What happens now?
- [ ] The game ends
- [x] The wave finishes, and the next wave starts anyway
  Nothing checks for lost cities yet. That is the next step.
- [ ] The cities come back

# --predict-tr--

Bir dalganın ortasında bütün şehirlerin yıkılıyor. Şimdi ne olur?
- [ ] Oyun biter
- [x] Dalga biter ve sonraki dalga yine de başlar
  Şehirlerin kaybedildiğine bakan kod yok. Bir sonraki adım bu.
- [ ] Şehirler geri gelir

# --tests--

A cleared wave should pay a bonus and start a pause.
tr: Temizlenen bir dalga bonus ödemeli ve mola başlatmalı.

```js
assert.strictEqual(state, 'playing')
toLaunch = 0
cities[0].alive = false
$.tick(1)
assert.strictEqual(state, 'between')
assert.strictEqual(score, 5 * 100 + 14 * 5)
```

After the pause, the next wave should start.
tr: Moladan sonra bir sonraki dalga başlamalı.

```js
toLaunch = 0
$.tick(1)
$.tick(89)
assert.strictEqual(state, 'between')
$.tick(1)
assert.deepEqual([state, wave, ammo, toLaunch], ['playing', 2, 16, 12])
```

A wave is not over while an explosion is still going.
tr: Bir patlama sürerken dalga bitmiş sayılmamalı.

```js
toLaunch = 0
blasts = [{ x: 100, y: 100, age: 40, own: true }]
$.tick(5)
assert.strictEqual(state, 'playing')
$.tick(5)
assert.strictEqual(state, 'between')
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
  if (ammo === 0 || ty > BASE.y - 10) return
  ammo -= 1
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

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
}

function update() {
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
}

function loop() {
  update()
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
