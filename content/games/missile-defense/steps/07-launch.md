---
title: Launch an enemy missile
title_tr: Düşman füzesi fırlat
skills: [prog.arrays]
---

# --goal--

An enemy missile starts at a random point on the top edge and aims at a random living city or at your base.
`launch()` makes one and adds it to the `incoming` list.

# --goal-tr--

Düşman füzeleri geliyor. Her füze gökyüzünün üst kenarında **rastgele** bir noktadan çıkacak ve yine rastgele seçilmiş
bir hedefe yönelecek: hâlâ ayakta olan bir şehre ya da senin üssüne.

`launch` (fırlat) bir füze yapıp `incoming` (gelenler) listesine ekleyecek. Füze **nereden başladığını** (`sx, sy`),
**şu an nerede olduğunu** (`x, y`) ve **nereye gittiğini** (`tx, ty`) hatırlayacak. Bu adımda füzeleri henüz kimse
fırlatmıyor.

# --code--

```js
let incoming // enemy missiles: { sx, sy, x, y, tx, ty, speed }

  incoming = []

// A new enemy missile from a random point at the top towards a random living city (or the base).
function launch() {
  const sx = Math.random() * canvas.width
  const targets = cities.filter((c) => c.alive).map((c) => c.x).concat(BASE.x)
  const tx = targets[Math.floor(Math.random() * targets.length)]
  incoming.push({ sx, sy: 0, x: sx, y: 0, tx, ty: GROUND, speed: 0.8 })
}
```

# --meaning--

- `Math.random() * canvas.width` is a random x from 0 to 480.
- `targets`: `filter` keeps the living cities, `map` turns each into its x, `concat` adds the base's x.
- `Math.floor(Math.random() * targets.length)` is a random index into that list.
- The new missile starts at `(sx, 0)` and heads for `(tx, GROUND)` at 0.8 pixels per frame.

# --meaning-tr--

- `Math.random()` → 0 ile 1 arasında rastgele bir sayı. `* canvas.width` ile 0–480 arasında rastgele bir `x` olur.
- `cities.filter((c) => c.alive)` → yalnız **ayaktaki** şehirleri tutan yeni bir liste.
- `.map((c) => c.x)` → her şehrin yerine onun `x`'ini koyar: bir sayı listesi.
- `.concat(BASE.x)` → listenin sonuna üssün `x`'ini de ekleyen yeni bir liste verir.
- `Math.floor(Math.random() * targets.length)` → `.length` listenin eleman sayısı; `Math.floor` aşağı yuvarlar.
  Sonuç 0 ile (sayı − 1) arasında rastgele bir **sıra numarası**. Listeden rastgele eleman seçmenin kalıbı bu.
- `incoming.push({ ... })` → yeni füze: başlangıç `(sx, 0)`, şu anki yer de aynı, hedef `(tx, GROUND)`, hız 0.8
  piksel/kare. `{ sx, tx }` yine kısaltma: `sx: sx`.

# --task--

1. Under `let cities` write `let incoming` with its comment.
2. In `reset`, under the `cities` line, write `incoming = []`.
3. Above the `// Move a point ...` comment, write `launch` with its comment, followed by an empty line.

# --task-tr--

1. `let cities` satırının altına yorumuyla birlikte `let incoming` yaz.
2. `reset` içinde `cities = ...` satırının altına `incoming = []` yaz.
3. `// Move a point ...` yorumunun **üstüne** `launch` fonksiyonunu yorumuyla birlikte yaz; altında bir boş satır kalsın.
4. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --tests--

A new game should have no enemy missiles yet.
tr: Yeni bir oyunda henüz düşman füzesi olmamalı.

```js
assert.deepEqual(incoming, [])
```

`launch()` should add a missile from the top edge towards a city or the base.
tr: `launch()` üst kenardan bir şehre ya da üsse giden bir füze eklemeli.

```js
launch()
assert.lengthOf(incoming, 1)
const m = incoming[0]
assert.strictEqual(m.sy, 0)
assert.deepEqual([m.x, m.y], [m.sx, 0])
assert.isAtLeast(m.sx, 0)
assert.isAtMost(m.sx, 480)
assert.strictEqual(m.ty, 370)
assert.strictEqual(m.speed, 0.8)
assert.include([50, 110, 170, 310, 370, 430, 240], m.tx)
```

Missiles should only aim at living cities (or the base).
tr: Füzeler yalnız ayaktaki şehirlere (ya da üsse) nişan almalı.

```js
cities.forEach((c, i) => (c.alive = i === 4))
for (let i = 0; i < 20; i++) launch()
assert.isTrue(incoming.every((m) => m.tx === 370 || m.tx === 240))
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

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
  incoming = []
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
}

function loop() {
  draw()
  requestAnimationFrame(loop)
}

reset()
requestAnimationFrame(loop)
```
