---
title: Hits and chain reactions
title_tr: İsabetler ve zincirleme tepkimeler
skills: [game.collision, game.state]
---

# --explanation--

A missile is destroyed when it is inside an explosion: its distance to the explosion's center is at most the explosion's
radius **right now**. Because explosions grow and shrink, a missile can fly into one that is still growing, or slip past
one that is fading.

A destroyed missile **explodes too**, and that new explosion can catch the missiles flying next to it. One well-placed
shot into a group can set off a chain. It is the most satisfying moment of the game, and it costs one line: the destroyed
missile adds a blast of its own.

Only your explosions (and the chains they start) should destroy missiles. A missile hitting the ground also explodes, but it
must not wipe out its neighbours and give you points for it. So blasts get an `own` flag: `true` for interceptors and chains,
`false` for impacts on the ground.

Every missile destroyed is worth 25 points.

# --explanation-tr--

Bir füze bir patlamanın içindeyken yok edilir: patlamanın merkezine uzaklığı patlamanın **şu anki** yarıçapından fazla değildir.
Patlamalar büyüyüp küçüldüğü için bir füze hâlâ büyüyen birinin içine uçabilir ya da sönmekte olan birinin yanından kayıp
geçebilir.

Yok edilen bir füze **o da patlar** ve bu yeni patlama yanında uçan füzeleri yakalayabilir. Bir gruba iyi yerleştirilmiş tek bir
atış bir zincir başlatabilir. Oyunun en tatmin edici anıdır ve tek bir satıra mal olur: yok edilen füze kendi patlamasını ekler.

Füzeleri yalnızca senin patlamaların (ve başlattıkları zincirler) yok etmeli. Yere çarpan bir füze de patlar ama komşularını
silip sana puan kazandırmamalı. Bu yüzden patlamalar bir `own` bayrağı alır: önleyiciler ve zincirler için `true`, yere
çarpmalar için `false`.

Yok edilen her füze 25 puan değerindedir.

# --task--

1. Blasts get `own: true` from interceptors and `own: false` from impacts on the ground.
2. Before moving each missile, check whether it is inside any own blast (`Math.hypot` distance at most `radius(b)`). If so, it
   is removed, scores 25 and adds an own blast at its position.
3. Add `score` (`0` in `reset()`) and draw `Score 25` at the top left (white, `'bold 16px sans-serif'`, `y = 22`).

# --task-tr--

1. Patlamalar önleyicilerden `own: true`, yere çarpmalardan `own: false` alır.
2. Her füzeyi ilerletmeden önce herhangi bir kendi patlamanın içinde mi diye bak (`Math.hypot` uzaklığı en fazla `radius(b)`).
   İçindeyse çıkarılır, 25 puan kazandırır ve konumuna kendi bir patlama ekler.
3. `score` ekle (`reset()`'te `0`) ve sol üste `Score 25` çiz (beyaz, `'bold 16px sans-serif'`, `y = 22`).

# --tests--

A missile inside an explosion should be destroyed and score.
tr: Bir patlamanın içindeki füze yok edilmeli ve puan kazandırmalı.

```js
toLaunch = 0
blasts = [{ x: 200, y: 200, age: 25, own: true }]
incoming = [{ sx: 205, sy: 0, x: 205, y: 205, tx: 205, ty: 370, speed: 0.8 }]
$.tick(1)
assert.lengthOf(incoming, 0)
assert.strictEqual(score, 25)
assert.lengthOf(blasts, 2, 'the missile exploded too')
assert.isTrue(blasts[1].own)
$.tick(1)
assert.include($.texts(), 'Score 25')
```

A destroyed missile's explosion should catch its neighbour: a chain reaction.
tr: Yok edilen bir füzenin patlaması komşusunu yakalamalı: zincirleme tepkime.

```js
toLaunch = 0
blasts = [{ x: 200, y: 200, age: 25, own: true }]
incoming = [
  { sx: 205, sy: 0, x: 205, y: 205, tx: 205, ty: 370, speed: 0 },
  { sx: 235, sy: 0, x: 235, y: 210, tx: 235, ty: 370, speed: 0 },
]
$.tick(1)
assert.lengthOf(incoming, 1, 'the second one is out of reach of the first explosion')
$.tick(30)
assert.lengthOf(incoming, 0, 'but the chain explosion grows and catches it')
assert.strictEqual(score, 50)
```

Explosions from missiles hitting the ground should not destroy others.
tr: Yere çarpan füzelerin patlamaları diğerlerini yok etmemeli.

```js
toLaunch = 0
incoming = [
  { sx: 100, sy: 300, x: 100, y: 369.5, tx: 100, ty: 370, speed: 0.8 },
  { sx: 110, sy: 0, x: 110, y: 360, tx: 110, ty: 900, speed: 0 },
]
$.tick(30)
assert.lengthOf(incoming, 1)
assert.strictEqual(score, 0)
assert.isFalse(blasts[0].own)
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
let toLaunch // enemy missiles still to come
let launchIn
let score

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
  shots = []
  blasts = []
  score = 0
  toLaunch = 20
  launchIn = 30
}

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const sy = 0
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy, x: sx, y: sy, tx, ty: GROUND, speed: 0.8 })
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

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
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
