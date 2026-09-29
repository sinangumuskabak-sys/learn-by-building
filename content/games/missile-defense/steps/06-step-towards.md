---
title: Move towards a point
title_tr: Bir noktaya doğru ilerle
skills: [game.physics, prog.functions]
---

# --goal--

Every missile in this game does the same thing: move towards a target point at a given speed. One function does it for
all of them.

# --goal-tr--

Bu oyundaki **her** füze (düşmanınkiler de seninkiler de) aynı şeyi yapar: belli bir hızla **bir noktaya doğru**
ilerler. Bunu bir kez, küçük bir fonksiyonda yazacağız: `stepTowards` (doğru adım at).

Fonksiyon bir nesne alır (`x, y` şu an nerede, `tx, ty` hedef nerede) ve onu hedefe doğru tam `speed` piksel
kaydırır. Hedefe vardıysa `true` döndürür. Ekranda henüz bir şey değişmeyecek.

# --code--

```js
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
```

# --meaning--

- `dx`, `dy` is the arrow from the point to its target; `Math.hypot` is its length (Pythagoras).
- Closer than one step: snap onto the target and return `true`.
- Otherwise `(dx, dy) / distance` is a direction of length 1 (a unit vector); times `speed` it is exactly one step.

# --meaning-tr--

- `dx = m.tx - m.x`, `dy = m.ty - m.y` → hedefe kadar yatayda ve dikeyde **ne kadar yol kaldı**.
- `Math.hypot(dx, dy)` → iki nokta arasındaki **dümdüz uzaklık**; okuldaki Pisagor: `√(dx² + dy²)`.
- `if (distance <= speed)` → hedef bir adımdan yakınsa füzeyi hedefe **oturt** ve `return true` ("vardım"). `return`
  fonksiyondan hemen çıkar.
- `dx / distance`, `dy / distance` → hedefe giden oku kendi uzunluğuna bölmek, uzunluğu **1** olan bir ok verir:
  **birim vektör**, yani saf bir **yön**. Onu `speed` ile çarpınca tam o büyüklükte bir adım çıkar.
- Örnek: hedef 30 piksel sağda, 40 piksel aşağıda → uzaklık 50; hız 1 ise adım `(0.6, 0.8)`.
- `return false` → "henüz varmadım".

# --task--

Leave an empty line under the `reset` function and write `stepTowards` with its comment.

# --task-tr--

`reset` fonksiyonunun kapanış `}`'inin altına bir boş satır bırak ve yorum satırıyla birlikte `stepTowards`
fonksiyonunu yaz. **Çalıştır**: ekran değişmez, kontroller yeşil olmalı.

# --predict--

A point at (0, 0) steps towards (30, 40) with speed 5. Where is it after one step?
- [ ] (5, 5)
- [x] (3, 4)
  The distance is 50, so the direction is (0.6, 0.8); times 5 that is (3, 4).
- [ ] (30, 40)

# --predict-tr--

(0, 0)'daki bir nokta 5 hızla (30, 40)'a doğru adım atıyor. Bir adım sonra nerede?
- [ ] (5, 5)
- [x] (3, 4)
  Uzaklık 50; yön (0.6, 0.8). 5 ile çarpınca (3, 4).
- [ ] (30, 40)

# --tests--

A point should move towards its target, one step of the given size at a time.
tr: Bir nokta hedefine, her seferinde verilen büyüklükte bir adımla ilerlemeli.

```js
const m = { x: 0, y: 0, tx: 3, ty: 4 }
assert.isFalse(stepTowards(m, 1))
assert.closeTo(m.x, 0.6, 1e-9)
assert.closeTo(m.y, 0.8, 1e-9)
```

A point closer than one step should land exactly on its target.
tr: Bir adımdan yakın olan nokta tam hedefine oturmalı.

```js
const m = { x: 0, y: 0, tx: 3, ty: 4 }
assert.isTrue(stepTowards(m, 10))
assert.deepEqual([m.x, m.y], [3, 4])
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

function reset() {
  cities = CITY_XS.map((x) => ({ x, alive: true }))
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
