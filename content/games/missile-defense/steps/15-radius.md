---
title: An explosion that grows and shrinks
title_tr: Büyüyüp küçülen patlama
skills: [game.physics]
---

# --goal--

Interceptors will explode where they arrive. An explosion is a position and an `age`; its radius is worked out from the
age: it grows for the first half of its life and shrinks in the second.

# --goal-tr--

Önleyiciler füzelere doğrudan çarpmayacak; vardıkları yerde **patlayacaklar**. Füzeyi değil, füzenin **gideceği
yeri** hedeflemen gerekecek: oyunun asıl zevki bu.

Bir patlama yalnız bir yer ve bir **yaş** (`age`, kaç karedir yaşadığı) olacak. Büyüklüğünü (yarıçapını) yaştan
**hesaplayacağız**: ömrünün ilk yarısında 0'dan 32'ye büyür, ikinci yarısında yeniden 0'a küçülür. Bu adımda o
hesabı yapan fonksiyonu yazıyoruz.

# --code--

```js
const BLAST = 32 // the biggest radius of an explosion
const BLAST_FRAMES = 50 // how long an explosion lasts, growing then shrinking

// How big an explosion is at its age: it grows for the first half and shrinks in the second.
function radius(b) {
  const t = b.age / BLAST_FRAMES
  return BLAST * (t < 0.5 ? t * 2 : (1 - t) * 2)
}
```

# --meaning--

- `t` goes from 0 to 1 over the explosion's life.
- In the first half `t * 2` goes 0 → 1; in the second `(1 - t) * 2` goes 1 → 0. Times `BLAST` that is 0 → 32 → 0.
- Computing the size from the age, instead of storing it, means it can never get out of step.

# --meaning-tr--

- `BLAST = 32` → patlamanın en büyük yarıçapı. `BLAST_FRAMES = 50` → ömrü: 50 kare (yaklaşık 0.8 saniye).
- `const t = b.age / BLAST_FRAMES` → ömrün ne kadarı geçti: 0 (yeni doğdu) ile 1 (bitti) arası.
- `t < 0.5 ? t * 2 : (1 - t) * 2` → ilk yarıda `t * 2` 0'dan 1'e çıkar; ikinci yarıda `(1 - t) * 2` 1'den 0'a iner.
- `BLAST * (...)` → bunu 32 ile çarp: yarıçap 0 → 32 → 0.
- Büyüklüğü saklayıp her karede güncellemek yerine yaştan **hesaplamak** kullanışlı bir animasyon hilesidir: patlama
  asla şaşmaz, şeklini değiştirmek için tek bir formülü değiştirmek yeter.

# --task--

1. Under `const SHOT_SPEED = 7` write the two constants.
2. Above `function update() {`, write `radius` with its comment, followed by an empty line.

# --task-tr--

1. `const SHOT_SPEED = 7` satırının altına iki sabiti yaz.
2. `function update() {` satırının **üstüne** yorumuyla birlikte `radius` fonksiyonunu yaz; altında bir boş satır kalsın.
3. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

What is `radius({ age: 40 })`?
- [ ] 32
- [x] 12.8
  `t` is 0.8, so `(1 - 0.8) * 2` is 0.4, and 0.4 × 32 is 12.8: it is shrinking.
- [ ] 25.6

# --predict-tr--

`radius({ age: 40 })` kaç verir?
- [ ] 32
- [x] 12.8
  `t` 0.8; `(1 - 0.8) * 2` = 0.4; 0.4 × 32 = 12.8. Patlama küçülüyor.
- [ ] 25.6

# --tests--

An explosion should grow to its full size halfway through its life, then shrink.
tr: Bir patlama ömrünün yarısında tam boyutuna büyümeli, sonra küçülmeli.

```js
assert.strictEqual(radius({ age: 0 }), 0)
assert.closeTo(radius({ age: 10 }), 12.8, 1e-9)
assert.strictEqual(radius({ age: 25 }), 32)
assert.closeTo(radius({ age: 40 }), 12.8, 1e-9)
assert.closeTo(radius({ age: 50 }), 0, 1e-9)
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
    }
  }
  shots = shots.filter((s) => !s.done)

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
  ctx.strokeStyle = '#a3e635'
  for (const s of shots) {
    ctx.beginPath()
    ctx.moveTo(BASE.x, BASE.y)
    ctx.lineTo(s.x, s.y)
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
