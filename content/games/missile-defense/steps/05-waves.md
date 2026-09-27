---
title: Waves and ammo
title_tr: Dalgalar ve cephane
skills: [game.state]
---

# --explanation--

Unlimited interceptors would let you fill the sky with explosions. With a limited **ammo** each wave, every shot is a
choice: fire early and risk missing, or wait and risk letting one through. Chains become precious because they save ammo.

The game comes in **waves**. Each one launches more missiles, faster and closer together, with a little more ammo. When a
wave is over (nothing left to launch, nothing in the air, no explosions still going), you get a bonus for every city still
standing and every interceptor you did not need, and after a short pause the next wave starts.

The state machine has three states now: `'playing'`, `'between'` (the pause after a wave) and `'over'`, which comes when the
last city falls. Anything that should only happen while playing checks the state first.

# --explanation-tr--

Sınırsız önleyici gökyüzünü patlamalarla doldurmana izin verirdi. Her dalgada sınırlı **cephaneyle** her atış bir seçimdir: erken
ateş edip ıskalamayı göze al ya da bekleyip birini geçirmeyi. Zincirler değerli olur, çünkü cephane kazandırırlar.

Oyun **dalgalar** hâlinde gelir. Her biri daha fazla, daha hızlı ve daha sık füze fırlatır, biraz daha fazla cephaneyle. Bir dalga
bitince (fırlatılacak bir şey kalmayınca, havada bir şey kalmayınca, süren bir patlama kalmayınca) hâlâ ayakta olan her şehir ve
ihtiyaç duymadığın her önleyici için bir bonus alırsın; kısa bir aradan sonra sonraki dalga başlar.

Durum makinesinin artık üç durumu var: `'playing'`, `'between'` (bir dalgadan sonraki ara) ve son şehir düşünce gelen `'over'`.
Yalnızca oynarken olması gereken her şey önce durumu kontrol eder.

# --task--

1. Add `wave`, `ammo`, `state` and `pause`. `reset()` sets `wave = 0`, `score = 0` and calls `nextWave()`, which adds 1 to
   `wave`, sets `toLaunch = 8 + wave * 2`, `launchIn = 30`, `ammo = 12 + wave * 2` and state `'playing'`.
2. Missiles fly at `0.5 + wave * 0.15`, launched `Math.max(20, 70 - wave * 6)` frames apart.
3. `fire()` only works while playing and with ammo left, and uses one.
4. In `update()`: nothing happens when over; between waves, count `pause` down and start the next wave at `0`. After
   everything moves: no living cities means `'over'`; a finished wave adds `100` per living city and `5` per ammo left,
   and sets state `'between'` with `pause = 90`.
5. Draw `Wave 2  Ammo 14` at the top right, `Wave 1 cleared!` centered at `y = 180` between waves, and `The end` (bold 28px)
   and `Click to play again` (16px, `y = 210`) when over. A click or Space then starts a new game.

# --task-tr--

1. `wave`, `ammo`, `state` ve `pause` ekle. `reset()` `wave = 0`, `score = 0` yapar ve `wave`'e 1 ekleyen,
   `toLaunch = 8 + wave * 2`, `launchIn = 30`, `ammo = 12 + wave * 2` ve `'playing'` durumunu ayarlayan `nextWave()`'i çağırır.
2. Füzeler `0.5 + wave * 0.15` hızla uçar, `Math.max(20, 70 - wave * 6)` kare arayla fırlatılır.
3. `fire()` yalnızca oynarken ve cephane varken çalışır ve bir tane harcar.
4. `update()` içinde: bitince hiçbir şey olmaz; dalgalar arasında `pause`'u geri say ve `0`'da sonraki dalgayı başlat. Her şey
   hareket ettikten sonra: yaşayan şehir yoksa `'over'`; biten bir dalga yaşayan her şehir için `100`, kalan her cephane için `5`
   ekler ve `pause = 90` ile `'between'` durumunu ayarlar.
5. Sağ üste `Wave 2  Ammo 14`, dalgalar arasında `y = 180`'de ortalı `Wave 1 cleared!`, bitince `The end` (kalın 28px) ve
   `Click to play again` (16px, `y = 210`) çiz. Bir tıklama ya da Boşluk o zaman yeni bir oyun başlatır.

# --tests--

Each shot should use ammo, and an empty base should not fire.
tr: Her atış cephane harcamalı ve boş bir üs ateş etmemeli.

```js
assert.deepEqual([wave, ammo, toLaunch], [1, 14, 10])
fire(100, 100)
assert.strictEqual(ammo, 13)
ammo = 0
fire(100, 100)
assert.lengthOf(shots, 1)
$.tick(1)
assert.include($.texts(), 'Wave 1  Ammo 0')
```

A cleared wave should pay a bonus, then the next wave should be faster.
tr: Temizlenen bir dalga bonus ödemeli, sonra sonraki dalga daha hızlı olmalı.

```js
toLaunch = 0
cities[0].alive = false
$.tick(1)
assert.strictEqual(state, 'between')
assert.strictEqual(score, 5 * 100 + 14 * 5)
assert.include($.texts(), 'Wave 1 cleared!')
fire(100, 100)
assert.lengthOf(shots, 0, 'no firing between waves')
$.tick(90)
assert.deepEqual([state, wave, ammo, toLaunch], ['playing', 2, 16, 12])
$.tick(30)
assert.closeTo(incoming[0].speed, 0.8, 1e-9)
assert.strictEqual(launchIn, 58)
```

Losing the last city should end the game, and a click should start again.
tr: Son şehri kaybetmek oyunu bitirmeli ve bir tıklama yeniden başlatmalı.

```js
cities.forEach((c) => (c.alive = false))
$.tick(1)
assert.strictEqual(state, 'over')
assert.include($.texts(), 'The end')
$.click(240, 100)
assert.deepEqual([state, wave, score], ['playing', 1, 0])
assert.isTrue(cities.every((c) => c.alive))
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
  const sy = 0
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.5 + wave * 0.15 })
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
